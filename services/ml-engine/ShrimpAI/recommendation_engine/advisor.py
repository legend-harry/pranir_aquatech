"""
🦐 Shrimp AI - Personalized Recommendation Engine
AI-powered actionable recommendations based on farm conditions and user profile.
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict
from enum import Enum
from datetime import datetime
from loguru import logger

from llm_service.core.llm_engine import get_llm
from rag_system.knowledge_base import get_rag
from financial_module.analyzer import get_financial_analyzer
from vision_service.analyzer import get_vision_analyzer


class Priority(str, Enum):
    """Recommendation priority levels"""
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFO = "INFO"


@dataclass
class Recommendation:
    """Single recommendation"""
    priority: Priority
    category: str  # "water_quality", "feeding", "disease", "financial", etc.
    action: str
    reason: str
    expected_impact: str
    estimated_cost: Optional[float] = None
    time_to_implement: Optional[str] = None  # "immediate", "1-3 days", "1 week"
    resources_needed: Optional[List[str]] = None
    confidence: float = 0.8  # 0-1


@dataclass
class FarmConditions:
    """Current farm conditions"""
    # Water parameters
    ph: Optional[float] = None
    dissolved_oxygen: Optional[float] = None  # mg/L
    temperature: Optional[float] = None  # °C
    salinity: Optional[float] = None  # ppt
    ammonia: Optional[float] = None  # mg/L
    nitrite: Optional[float] = None  # mg/L
    alkalinity: Optional[float] = None  # mg/L
    
    # Production metrics
    growth_rate: Optional[float] = None  # g/week
    survival_rate: Optional[float] = None  # percentage
    fcr: Optional[float] = None  # Feed Conversion Ratio
    doc: Optional[int] = None  # Days of Culture
    stocking_density: Optional[int] = None  # shrimp/m²
    
    # Financial
    feed_cost: Optional[float] = None
    labor_cost: Optional[float] = None
    total_operational_cost: Optional[float] = None
    
    # Health indicators
    disease_present: bool = False
    recent_mortality: bool = False
    feeding_response: Optional[str] = None  # "excellent", "good", "poor"


@dataclass
class UserProfile:
    """User/farm profile"""
    user_id: str
    farm_name: str
    experience_level: str  # "beginner", "intermediate", "expert"
    farm_size_hectares: float
    num_ponds: int
    farming_system: str  # "extensive", "semi-intensive", "intensive", "super-intensive"
    
    # Budget constraints
    budget: Optional[Dict[str, float]] = None  # {"feed": 10000, "medication": 1000}
    
    # Preferences
    risk_tolerance: str = "moderate"  # "low", "moderate", "high"
    sustainability_focus: bool = False
    organic_certified: bool = False
    
    # Goals
    target_yield: Optional[float] = None  # kg
    target_harvest_date: Optional[str] = None


class PersonalizedAdvisor:
    """
    AI-powered personalized recommendation engine.
    
    Integrates:
    - LLM for natural language recommendations
    - RAG for knowledge retrieval
    - Financial analyzer for cost analysis
    - Vision analyzer for health assessment
    """
    
    def __init__(self):
        """Initialize personalized advisor"""
        logger.info("Initializing Personalized Advisor...")
        
        # Initialize components (lazy loading)
        self.llm = None
        self.rag = None
        self.financial_analyzer = None
        self.vision_analyzer = None
        
        # Recommendation history
        self.recommendations_history: List[Dict[str, Any]] = []
        
        logger.info("✅ Personalized Advisor initialized")
    
    def _ensure_components(self):
        """Lazy load components"""
        if self.llm is None:
            self.llm = get_llm()
        if self.rag is None:
            self.rag = get_rag()
        if self.financial_analyzer is None:
            self.financial_analyzer = get_financial_analyzer()
        if self.vision_analyzer is None:
            self.vision_analyzer = get_vision_analyzer()
    
    def generate_recommendations(
        self,
        user_profile: UserProfile,
        farm_conditions: FarmConditions,
        include_ai_insights: bool = True,
    ) -> List[Recommendation]:
        """
        Generate comprehensive personalized recommendations.
        
        Args:
            user_profile: User and farm profile
            farm_conditions: Current farm conditions
            include_ai_insights: Include AI-generated insights from LLM
            
        Returns:
            List of prioritized recommendations
        """
        logger.info(f"Generating recommendations for {user_profile.farm_name}")
        
        self._ensure_components()
        
        recommendations = []
        
        # 1. Water Quality Recommendations
        water_recs = self._analyze_water_quality(farm_conditions)
        recommendations.extend(water_recs)
        
        # 2. Feeding Recommendations
        feeding_recs = self._analyze_feeding(farm_conditions, user_profile)
        recommendations.extend(feeding_recs)
        
        # 3. Health & Disease Management
        health_recs = self._analyze_health(farm_conditions)
        recommendations.extend(health_recs)
        
        # 4. Financial Optimization
        financial_recs = self._analyze_financials(farm_conditions, user_profile)
        recommendations.extend(financial_recs)
        
        # 5. Growth Optimization
        growth_recs = self._analyze_growth(farm_conditions, user_profile)
        recommendations.extend(growth_recs)
        
        # 6. AI-Enhanced Insights
        if include_ai_insights:
            ai_recs = self._generate_ai_insights(
                user_profile,
                farm_conditions,
                recommendations,
            )
            recommendations.extend(ai_recs)
        
        # Sort by priority
        recommendations = self._prioritize_recommendations(recommendations)
        
        # Store in history
        self.recommendations_history.append({
            "timestamp": datetime.now().isoformat(),
            "user_id": user_profile.user_id,
            "recommendations": [asdict(r) for r in recommendations],
        })
        
        logger.info(f"✅ Generated {len(recommendations)} recommendations")
        return recommendations
    
    def _analyze_water_quality(
        self,
        conditions: FarmConditions,
    ) -> List[Recommendation]:
        """Analyze water quality and generate recommendations"""
        recommendations = []
        
        # pH Analysis
        if conditions.ph is not None:
            if conditions.ph < 7.5:
                recommendations.append(Recommendation(
                    priority=Priority.HIGH,
                    category="water_quality",
                    action="Increase pH using calcium carbonate (lime)",
                    reason=f"Current pH ({conditions.ph}) is below optimal range (7.5-8.5)",
                    expected_impact="Improved shrimp immunity and growth rate (5-10%)",
                    estimated_cost=50.0,
                    time_to_implement="1-3 days",
                    resources_needed=["Calcium carbonate", "pH meter"],
                    confidence=0.9,
                ))
            elif conditions.ph > 8.5:
                recommendations.append(Recommendation(
                    priority=Priority.MEDIUM,
                    category="water_quality",
                    action="Reduce pH by increasing aeration and water exchange",
                    reason=f"Current pH ({conditions.ph}) is above optimal range (7.5-8.5)",
                    expected_impact="Reduced ammonia toxicity, better feed utilization",
                    time_to_implement="immediate",
                    resources_needed=["Aerators"],
                    confidence=0.85,
                ))
        
        # Dissolved Oxygen
        if conditions.dissolved_oxygen is not None:
            if conditions.dissolved_oxygen < 4.0:
                recommendations.append(Recommendation(
                    priority=Priority.CRITICAL,
                    category="water_quality",
                    action="🚨 URGENT: Increase aeration immediately",
                    reason=f"DO level ({conditions.dissolved_oxygen} mg/L) is critically low (min: 4 mg/L)",
                    expected_impact="Prevent mass mortality, restore normal metabolic function",
                    time_to_implement="immediate",
                    resources_needed=["Additional paddle wheel aerators", "Emergency generators"],
                    confidence=0.95,
                ))
        
        # Ammonia
        if conditions.ammonia is not None:
            if conditions.ammonia > 0.5:
                recommendations.append(Recommendation(
                    priority=Priority.HIGH if conditions.ammonia > 1.0 else Priority.MEDIUM,
                    category="water_quality",
                    action="Reduce ammonia levels through water exchange and probiotics",
                    reason=f"Ammonia ({conditions.ammonia} mg/L) exceeds safe level (< 0.5 mg/L)",
                    expected_impact="Reduced stress, improved survival rate (10-15%)",
                    estimated_cost=200.0,
                    time_to_implement="1-3 days",
                    resources_needed=["Nitrifying bacteria", "Zeolite", "Water pump"],
                    confidence=0.88,
                ))
        
        # Temperature
        if conditions.temperature is not None:
            if conditions.temperature < 26:
                recommendations.append(Recommendation(
                    priority=Priority.MEDIUM,
                    category="water_quality",
                    action="Monitor temperature closely; consider heating if drops further",
                    reason=f"Temperature ({conditions.temperature}°C) is below optimal (28-32°C)",
                    expected_impact="Improved metabolic rate and growth",
                    time_to_implement="1 week",
                    confidence=0.75,
                ))
            elif conditions.temperature > 32:
                recommendations.append(Recommendation(
                    priority=Priority.MEDIUM,
                    category="water_quality",
                    action="Increase water depth and exchange to reduce temperature",
                    reason=f"Temperature ({conditions.temperature}°C) is above optimal (28-32°C)",
                    expected_impact="Reduced stress and disease susceptibility",
                    time_to_implement="immediate",
                    confidence=0.8,
                ))
        
        return recommendations
    
    def _analyze_feeding(
        self,
        conditions: FarmConditions,
        profile: UserProfile,
    ) -> List[Recommendation]:
        """Analyze feeding practices"""
        recommendations = []
        
        # FCR Analysis
        if conditions.fcr is not None:
            if conditions.fcr > 1.8:
                recommendations.append(Recommendation(
                    priority=Priority.HIGH,
                    category="feeding",
                    action="Optimize feeding regimen: Reduce feed quantity by 10%, increase frequency",
                    reason=f"FCR ({conditions.fcr}) is above target (1.2-1.5 for intensive farming)",
                    expected_impact="Reduce feed costs by 15-20%, improve FCR to 1.5-1.6",
                    estimated_cost=-500.0,  # Savings
                    time_to_implement="immediate",
                    resources_needed=["Feed trays", "Feeding schedule"],
                    confidence=0.87,
                ))
            elif conditions.fcr < 1.0:
                recommendations.append(Recommendation(
                    priority=Priority.INFO,
                    category="feeding",
                    action="Excellent FCR! Maintain current feeding practices",
                    reason=f"FCR ({conditions.fcr}) is exceptionally good",
                    expected_impact="Continue optimal performance",
                    confidence=0.9,
                ))
        
        # Growth Rate
        if conditions.growth_rate is not None:
            if conditions.growth_rate < 1.0:  # Below 1g/week
                recommendations.append(Recommendation(
                    priority=Priority.MEDIUM,
                    category="feeding",
                    action="Increase protein content in feed (38-40% protein)",
                    reason=f"Growth rate ({conditions.growth_rate} g/week) is below target (>1.5 g/week)",
                    expected_impact="Increase growth rate by 20-30%",
                    estimated_cost=300.0,
                    time_to_implement="1-3 days",
                    resources_needed=["High-protein feed"],
                    confidence=0.82,
                ))
        
        return recommendations
    
    def _analyze_health(self, conditions: FarmConditions) -> List[Recommendation]:
        """Analyze health indicators"""
        recommendations = []
        
        if conditions.disease_present:
            recommendations.append(Recommendation(
                priority=Priority.CRITICAL,
                category="health",
                action="⚠️ Implement disease management protocol immediately",
                reason="Disease detected in pond",
                expected_impact="Prevent disease spread, minimize losses",
                time_to_implement="immediate",
                resources_needed=["Veterinary consultation", "Treatment medications"],
                confidence=0.95,
            ))
        
        if conditions.recent_mortality:
            recommendations.append(Recommendation(
                priority=Priority.HIGH,
                category="health",
                action="Investigate mortality cause: Test water, check for disease, inspect feed quality",
                reason="Recent mortality events detected",
                expected_impact="Identify and address root cause",
                time_to_implement="1-3 days",
                resources_needed=["Water testing kit", "Disease diagnostic kit"],
                confidence=0.88,
            ))
        
        return recommendations
    
    def _analyze_financials(
        self,
        conditions: FarmConditions,
        profile: UserProfile,
    ) -> List[Recommendation]:
        """Analyze financial aspects"""
        recommendations = []
        
        # Feed cost optimization
        if conditions.feed_cost and profile.budget:
            budget_feed = profile.budget.get("feed", float('inf'))
            if conditions.feed_cost > budget_feed:
                recommendations.append(Recommendation(
                    priority=Priority.HIGH,
                    category="financial",
                    action="Reduce feed costs: Negotiate bulk discounts or switch supplier",
                    reason=f"Feed costs ({conditions.feed_cost}) exceed budget ({budget_feed})",
                    expected_impact="Save 10-15% on feed costs",
                    estimated_cost=-500.0,
                    time_to_implement="1 week",
                    resources_needed=["Supplier quotes"],
                    confidence=0.75,
                ))
        
        return recommendations
    
    def _analyze_growth(
        self,
        conditions: FarmConditions,
        profile: UserProfile,
    ) -> List[Recommendation]:
        """Analyze growth and production"""
        recommendations = []
        
        # Survival rate
        if conditions.survival_rate is not None:
            if conditions.survival_rate < 70:
                recommendations.append(Recommendation(
                    priority=Priority.HIGH,
                    category="production",
                    action="Improve survival rate: Enhance biosecurity, reduce stocking density",
                    reason=f"Survival rate ({conditions.survival_rate}%) is below target (>80%)",
                    expected_impact="Increase yield by 15-25%",
                    time_to_implement="next cycle",
                    resources_needed=["Biosecurity equipment", "Disease monitoring"],
                    confidence=0.85,
                ))
        
        return recommendations
    
    def _generate_ai_insights(
        self,
        profile: UserProfile,
        conditions: FarmConditions,
        existing_recs: List[Recommendation],
    ) -> List[Recommendation]:
        """Generate AI-enhanced insights using LLM"""
        logger.info("Generating AI-enhanced insights...")
        
        # Build context from farm data
        context_data = {
            "farm_name": profile.farm_name,
            "experience": profile.experience_level,
            "system": profile.farming_system,
            "conditions": asdict(conditions),
            "existing_recommendations": len(existing_recs),
        }
        
        # Get relevant knowledge from RAG
        query = f"Best practices for {profile.farming_system} shrimp farming with pH {conditions.ph}, DO {conditions.dissolved_oxygen}"
        rag_context = self.rag.get_context_for_query(query, k=3)
        
        # Generate insights with LLM
        prompt = f"""
        Based on the following shrimp farm data, provide 2-3 additional strategic recommendations:
        
        Farm Profile: {profile.farm_name} ({profile.farming_system})
        Experience Level: {profile.experience_level}
        Current FCR: {conditions.fcr}
        Survival Rate: {conditions.survival_rate}%
        Growth Rate: {conditions.growth_rate} g/week
        
        Already recommended: {len(existing_recs)} actions
        
        Provide innovative, practical recommendations that weren't already suggested.
        """
        
        try:
            response = self.llm.generate_response(prompt, context=rag_context, max_new_tokens=300)
            
            # Parse AI response into recommendation (simplified)
            recommendations = [
                Recommendation(
                    priority=Priority.LOW,
                    category="ai_insight",
                    action="AI Strategic Recommendation",
                    reason=response,
                    expected_impact="Based on AI analysis of farm data",
                    confidence=0.7,
                )
            ]
            
            return recommendations
        
        except Exception as e:
            logger.error(f"Error generating AI insights: {e}")
            return []
    
    def _prioritize_recommendations(
        self,
        recommendations: List[Recommendation],
    ) -> List[Recommendation]:
        """Sort recommendations by priority"""
        priority_order = {
            Priority.CRITICAL: 0,
            Priority.HIGH: 1,
            Priority.MEDIUM: 2,
            Priority.LOW: 3,
            Priority.INFO: 4,
        }
        
        return sorted(
            recommendations,
            key=lambda r: (priority_order[r.priority], -r.confidence),
        )
    
    def export_recommendations(
        self,
        recommendations: List[Recommendation],
        format: str = "dict",
    ) -> Any:
        """Export recommendations in various formats"""
        data = [asdict(r) for r in recommendations]
        
        if format == "dict":
            return data
        elif format == "json":
            import json
            return json.dumps(data, indent=2, default=str)
        elif format == "markdown":
            return self._format_markdown(recommendations)
        else:
            raise ValueError(f"Unsupported format: {format}")
    
    def _format_markdown(self, recommendations: List[Recommendation]) -> str:
        """Format recommendations as markdown"""
        md = "# 🦐 Shrimp Farm Recommendations\n\n"
        
        for i, rec in enumerate(recommendations, 1):
            priority_emoji = {
                Priority.CRITICAL: "🚨",
                Priority.HIGH: "⚠️",
                Priority.MEDIUM: "📌",
                Priority.LOW: "💡",
                Priority.INFO: "ℹ️",
            }
            
            md += f"## {i}. {priority_emoji[rec.priority]} {rec.action}\n\n"
            md += f"**Priority:** {rec.priority.value}\n\n"
            md += f"**Category:** {rec.category}\n\n"
            md += f"**Reason:** {rec.reason}\n\n"
            md += f"**Expected Impact:** {rec.expected_impact}\n\n"
            
            if rec.estimated_cost:
                cost_label = "💰 Cost" if rec.estimated_cost > 0 else "💵 Savings"
                md += f"**{cost_label}:** ${abs(rec.estimated_cost):.2f}\n\n"
            
            if rec.time_to_implement:
                md += f"**Time to Implement:** {rec.time_to_implement}\n\n"
            
            if rec.resources_needed:
                md += f"**Resources Needed:** {', '.join(rec.resources_needed)}\n\n"
            
            md += f"**Confidence:** {rec.confidence * 100:.0f}%\n\n"
            md += "---\n\n"
        
        return md


# Global advisor instance
_advisor_instance: Optional[PersonalizedAdvisor] = None


def get_advisor() -> PersonalizedAdvisor:
    """Get or create global advisor instance"""
    global _advisor_instance
    
    if _advisor_instance is None:
        _advisor_instance = PersonalizedAdvisor()
    
    return _advisor_instance
