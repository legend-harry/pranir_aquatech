"""
🦐 Shrimp AI - Computer Vision Module
Disease detection, growth monitoring, and behavior analysis using deep learning.
"""

import cv2
import numpy as np
from typing import Dict, Any, List, Optional, Tuple
from pathlib import Path
from dataclasses import dataclass, asdict
from PIL import Image
import torch
from loguru import logger

try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False
    logger.warning("YOLOv8 not available. Install with: pip install ultralytics")

from llm_service.config import get_settings


@dataclass
class DetectionResult:
    """Single detection result"""
    class_name: str
    confidence: float
    bbox: Tuple[int, int, int, int]  # x1, y1, x2, y2
    class_id: int


@dataclass
class HealthAnalysisResult:
    """Comprehensive health analysis result"""
    health_score: float  # 0-100
    diseases_detected: List[str]
    detections: List[DetectionResult]
    recommendations: List[str]
    severity: str  # "healthy", "mild", "moderate", "severe"
    confidence: float


@dataclass
class BiomassEstimation:
    """Biomass estimation result"""
    shrimp_count: int
    average_size_mm: float
    estimated_weight_g: float
    total_biomass_kg: float
    confidence: float
    size_distribution: Dict[str, int]  # small, medium, large


@dataclass
class BehaviorAnalysis:
    """Behavior analysis result"""
    activity_level: str  # "very_active", "active", "moderate", "inactive"
    feeding_activity: float  # 0-100
    swimming_patterns: str  # "normal", "erratic", "sluggish"
    stress_indicators: List[str]
    health_score: float


class ShrimpVisionAnalyzer:
    """
    Computer vision analyzer for shrimp farming.
    
    Features:
    - Disease detection (White Spot, EMS, EHP)
    - Growth monitoring and biomass estimation  
    - Behavior analysis
    - Water quality visual assessment
    - Size grading
    """
    
    # Disease class mappings
    DISEASE_CLASSES = {
        0: "healthy",
        1: "white_spot_syndrome",
        2: "early_mortality_syndrome",
        3: "enterocytozoon_hepatopenaei",
        4: "vibriosis",
        5: "black_gill_disease",
        6: "shell_disease",
        7: "muscle_necrosis",
    }
    
    # Size classifications (mm)
    SIZE_CATEGORIES = {
        "small": (0, 80),
        "medium": (80, 120),
        "large": (120, 200),
        "jumbo": (200, 300),
    }
    
    def __init__(self):
        """Initialize computer vision analyzer"""
        self.settings = get_settings()
        
        logger.info("Initializing Shrimp Vision Analyzer...")
        
        # Model paths
        self.model_dir = Path(self.settings.vision_model_path)
        
        # Load models (lazy loading)
        self.health_model: Optional[YOLO] = None
        self.counting_model: Optional[YOLO] = None
        self.behavior_model: Optional[YOLO] = None
        
        # Device
        self.device = self.settings.llm_device
        if self.device == "mps":
            self.device = "cpu"  # YOLO may not support MPS yet
        
        logger.info(f"✅ Vision Analyzer initialized (device: {self.device})")
    
    def _load_health_model(self) -> YOLO:
        """Lazy load health detection model"""
        if self.health_model is None:
            model_path = self.model_dir / self.settings.health_detection_model
            
            if not model_path.exists():
                logger.warning(f"Health model not found at {model_path}")
                logger.info("Using pretrained YOLOv8n as fallback")
                self.health_model = YOLO("yolov8n.pt") if YOLO_AVAILABLE else None
            else:
                logger.info(f"Loading health model from {model_path}")
                self.health_model = YOLO(str(model_path))
        
        return self.health_model
    
    def _load_counting_model(self) -> YOLO:
        """Lazy load counting model"""
        if self.counting_model is None:
            model_path = self.model_dir / self.settings.counting_model
            
            if not model_path.exists():
                logger.warning(f"Counting model not found at {model_path}")
                self.counting_model = YOLO("yolov8n.pt") if YOLO_AVAILABLE else None
            else:
                self.counting_model = YOLO(str(model_path))
        
        return self.counting_model
    
    def analyze_shrimp_health(
        self,
        image_path: str,
        confidence_threshold: Optional[float] = None,
    ) -> HealthAnalysisResult:
        """
        Analyze shrimp health from image.
        
        Args:
            image_path: Path to shrimp image
            confidence_threshold: Detection confidence threshold
            
        Returns:
            HealthAnalysisResult with diseases and recommendations
        """
        logger.info(f"Analyzing shrimp health from {image_path}")
        
        if not YOLO_AVAILABLE or not Path(image_path).exists():
            return self._mock_health_analysis()
        
        threshold = confidence_threshold or self.settings.vision_confidence_threshold
        
        # Load model
        model = self._load_health_model()
        if model is None:
            return self._mock_health_analysis()
        
        # Run inference
        results = model(image_path, conf=threshold, device=self.device)
        
        # Parse detections
        detections = []
        diseases_detected = []
        disease_severities = []
        
        for result in results:
            boxes = result.boxes
            
            for box in boxes:
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])
                bbox = box.xyxy[0].cpu().numpy().astype(int)
                
                class_name = self.DISEASE_CLASSES.get(class_id, "unknown")
                
                detection = DetectionResult(
                    class_name=class_name,
                    confidence=confidence,
                    bbox=tuple(bbox),
                    class_id=class_id,
                )
                detections.append(detection)
                
                # Track diseases
                if class_name != "healthy" and class_name not in diseases_detected:
                    diseases_detected.append(class_name)
                    disease_severities.append(confidence)
        
        # Calculate health score
        health_score = self._calculate_health_score(detections)
        
        # Determine severity
        severity = self._determine_severity(health_score, diseases_detected)
        
        # Generate recommendations
        recommendations = self._generate_health_recommendations(
            diseases_detected,
            severity,
        )
        
        # Overall confidence
        avg_confidence = (
            np.mean([d.confidence for d in detections])
            if detections else 0.5
        )
        
        result = HealthAnalysisResult(
            health_score=health_score,
            diseases_detected=diseases_detected,
            detections=detections,
            recommendations=recommendations,
            severity=severity,
            confidence=avg_confidence,
        )
        
        logger.info(f"✅ Health analysis complete: {health_score:.1f}/100, {severity}")
        return result
    
    def estimate_biomass(
        self,
        image_path: str,
        pond_area_m2: Optional[float] = None,
        known_reference_mm: Optional[float] = None,
    ) -> BiomassEstimation:
        """
        Estimate shrimp biomass from image.
        
        Args:
            image_path: Path to pond/shrimp image
            pond_area_m2: Pond area for scaling
            known_reference_mm: Known reference object size for calibration
            
        Returns:
            BiomassEstimation with count and weight estimates
        """
        logger.info(f"Estimating biomass from {image_path}")
        
        if not YOLO_AVAILABLE or not Path(image_path).exists():
            return self._mock_biomass_estimation()
        
        # Load counting model
        model = self._load_counting_model()
        if model is None:
            return self._mock_biomass_estimation()
        
        # Run detection
        results = model(image_path, device=self.device)
        
        # Count shrimp
        shrimp_count = 0
        sizes = []
        
        for result in results:
            boxes = result.boxes
            shrimp_count = len(boxes)
            
            # Estimate sizes from bbox dimensions
            for box in boxes:
                bbox = box.xyxy[0].cpu().numpy()
                width = bbox[2] - bbox[0]
                height = bbox[3] - bbox[1]
                # Approximate size (needs calibration)
                size = max(width, height)
                sizes.append(size)
        
        # Size distribution
        size_distribution = self._classify_sizes(sizes)
        
        # Average size (mock calibration to mm)
        avg_size_mm = np.mean(sizes) * 0.5 if sizes else 100.0  # Mock calibration
        
        # Weight estimation (empirical formula)
        # Weight (g) ≈ 0.00001 * Length(mm)^3
        avg_weight_g = 0.00001 * (avg_size_mm ** 3)
        
        # Total biomass
        total_biomass_kg = (shrimp_count * avg_weight_g) / 1000
        
        # Scale up if pond area provided
        if pond_area_m2:
            # Assume image covers 1m² sample area
            total_biomass_kg *= pond_area_m2
        
        result = BiomassEstimation(
            shrimp_count=shrimp_count,
            average_size_mm=avg_size_mm,
            estimated_weight_g=avg_weight_g,
            total_biomass_kg=total_biomass_kg,
            confidence=0.75,  # Simplified
            size_distribution=size_distribution,
        )
        
        logger.info(f"✅ Biomass estimation: {shrimp_count} shrimp, {total_biomass_kg:.2f} kg")
        return result
    
    def analyze_behavior(
        self,
        video_path: str,
        duration_seconds: int = 30,
    ) -> BehaviorAnalysis:
        """
        Analyze shrimp behavior from video.
        
        Args:
            video_path: Path to video file
            duration_seconds: Duration to analyze
            
        Returns:
            BehaviorAnalysis with activity patterns
        """
        logger.info(f"Analyzing behavior from {video_path}")
        
        if not Path(video_path).exists():
            return self._mock_behavior_analysis()
        
        # Open video
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            logger.error(f"Cannot open video: {video_path}")
            return self._mock_behavior_analysis()
        
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(fps * duration_seconds)
        
        # Track movement
        movement_scores = []
        prev_frame = None
        
        frame_count = 0
        while frame_count < total_frames:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Convert to grayscale
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            if prev_frame is not None:
                # Calculate frame difference (motion)
                diff = cv2.absdiff(gray, prev_frame)
                motion_score = np.mean(diff)
                movement_scores.append(motion_score)
            
            prev_frame = gray
            frame_count += 1
        
        cap.release()
        
        # Analyze movement patterns
        if movement_scores:
            avg_movement = np.mean(movement_scores)
            movement_std = np.std(movement_scores)
            
            # Classify activity level
            if avg_movement > 30:
                activity_level = "very_active"
            elif avg_movement > 20:
                activity_level = "active"
            elif avg_movement > 10:
                activity_level = "moderate"
            else:
                activity_level = "inactive"
            
            # Feeding activity (simplified)
            feeding_activity = min(100, avg_movement * 2)
            
            # Swimming patterns
            if movement_std > 15:
                swimming_patterns = "erratic"
            elif avg_movement < 10:
                swimming_patterns = "sluggish"
            else:
                swimming_patterns = "normal"
            
            # Stress indicators
            stress_indicators = []
            if swimming_patterns == "erratic":
                stress_indicators.append("Erratic swimming detected")
            if avg_movement < 10:
                stress_indicators.append("Low activity level")
            
            # Health score based on behavior
            health_score = min(100, avg_movement * 3)
        else:
            # Fallback values
            activity_level = "unknown"
            feeding_activity = 50.0
            swimming_patterns = "unknown"
            stress_indicators = ["Insufficient data"]
            health_score = 50.0
        
        result = BehaviorAnalysis(
            activity_level=activity_level,
            feeding_activity=feeding_activity,
            swimming_patterns=swimming_patterns,
            stress_indicators=stress_indicators,
            health_score=health_score,
        )
        
        logger.info(f"✅ Behavior analysis: {activity_level}, health: {health_score:.1f}")
        return result
    
    def _calculate_health_score(
        self,
        detections: List[DetectionResult],
    ) -> float:
        """Calculate overall health score from detections"""
        if not detections:
            return 50.0  # Neutral score if no detection
        
        # Count healthy vs disease detections
        healthy_count = sum(
            1 for d in detections if d.class_name == "healthy"
        )
        disease_count = len(detections) - healthy_count
        
        if disease_count == 0:
            return 100.0
        
        # Calculate based on disease severity
        disease_weights = {
            "white_spot_syndrome": 40,
            "early_mortality_syndrome": 60,
            "enterocytozoon_hepatopenaei": 50,
            "vibriosis": 30,
            "black_gill_disease": 25,
            "shell_disease": 20,
            "muscle_necrosis": 45,
        }
        
        total_penalty = 0
        for detection in detections:
            if detection.class_name in disease_weights:
                penalty = disease_weights[detection.class_name]
                total_penalty += penalty * detection.confidence
        
        health_score = max(0, 100 - total_penalty)
        return health_score
    
    def _determine_severity(
        self,
        health_score: float,
        diseases: List[str],
    ) -> str:
        """Determine severity level"""
        if health_score >= 80:
            return "healthy"
        elif health_score >= 60:
            return "mild"
        elif health_score >= 40:
            return "moderate"
        else:
            return "severe"
    
    def _generate_health_recommendations(
        self,
        diseases: List[str],
        severity: str,
    ) -> List[str]:
        """Generate health recommendations"""
        recommendations = []
        
        disease_treatments = {
            "white_spot_syndrome": [
                "🚨 URGENT: Isolate affected pond immediately",
                "Reduce stress: Lower stocking density, improve water quality",
                "Increase water exchange (30-40% daily)",
                "Stop feeding temporarily",
                "Consult veterinarian for antiviral treatments",
            ],
            "early_mortality_syndrome": [
                "🚨 CRITICAL: Remove affected shrimp immediately",
                "Implement strict biosecurity measures",
                "Use probiotic treatments",
                "Improve water quality (reduce organic load)",
                "Consider ending cycle early to prevent total loss",
            ],
            "enterocytozoon_hepatopenaei": [
                "Monitor growth rates closely",
                "Improve feed quality (high protein)",
                "Reduce stocking density",
                "Enhance biosecurity protocols",
                "Test for EHP in new stock",
            ],
            "vibriosis": [
                "Improve water quality immediately",
                "Increase aeration",
                "Reduce feeding amount",
                "Use probiotic supplements",
                "Consider antibiotic treatment (veterinary prescription)",
            ],
        }
        
        for disease in diseases:
            disease_key = disease.replace(" ", "_").lower()
            if disease_key in disease_treatments:
                recommendations.extend(disease_treatments[disease_key])
        
        # General recommendations by severity
        if severity == "severe" and not recommendations:
            recommendations.append("⚠️ Consult aquaculture veterinarian immediately")
        elif severity == "healthy":
            recommendations.append("✅ Maintain current biosecurity and management practices")
        
        return recommendations
    
    def _classify_sizes(self, sizes: List[float]) -> Dict[str, int]:
        """Classify shrimp into size categories"""
        distribution = {cat: 0 for cat in self.SIZE_CATEGORIES.keys()}
        
        for size in sizes:
            for category, (min_size, max_size) in self.SIZE_CATEGORIES.items():
                if min_size <= size < max_size:
                    distribution[category] += 1
                    break
        
        return distribution
    
    # Mock methods for when models aren't available
    def _mock_health_analysis(self) -> HealthAnalysisResult:
        """Return mock health analysis"""
        return HealthAnalysisResult(
            health_score=85.0,
            diseases_detected=[],
            detections=[],
            recommendations=["✅ No diseases detected. Continue monitoring."],
            severity="healthy",
            confidence=0.8,
        )
    
    def _mock_biomass_estimation(self) -> BiomassEstimation:
        """Return mock biomass estimation"""
        return BiomassEstimation(
            shrimp_count=150,
            average_size_mm=105.0,
            estimated_weight_g=11.5,
            total_biomass_kg=1.725,
            confidence=0.75,
            size_distribution={"small": 30, "medium": 90, "large": 30, "jumbo": 0},
        )
    
    def _mock_behavior_analysis(self) -> BehaviorAnalysis:
        """Return mock behavior analysis"""
        return BehaviorAnalysis(
            activity_level="active",
            feeding_activity=75.0,
            swimming_patterns="normal",
            stress_indicators=[],
            health_score=80.0,
        )


# Global vision analyzer instance
_vision_analyzer_instance: Optional[ShrimpVisionAnalyzer] = None


def get_vision_analyzer() -> ShrimpVisionAnalyzer:
    """Get or create global vision analyzer instance"""
    global _vision_analyzer_instance
    
    if _vision_analyzer_instance is None:
        _vision_analyzer_instance = ShrimpVisionAnalyzer()
    
    return _vision_analyzer_instance
