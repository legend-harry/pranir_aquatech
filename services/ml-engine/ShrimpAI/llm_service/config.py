"""
🦐 Shrimp AI - Configuration Manager
Centralized configuration loader with environment variable support.
"""

import os
from typing import Optional, List
from pathlib import Path
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application Settings"""
    
    # ============================================
    # LLM Configuration
    # ============================================
    llm_model_name: str = Field(
        default="microsoft/phi-2",
        description="Base model name from HuggingFace"
    )
    llm_model_path: str = Field(
        default="./llm_service/models/shrimp-llm-v1",
        description="Path to fine-tuned model"
    )
    llm_max_length: int = Field(default=2048, description="Maximum sequence length")
    llm_temperature: float = Field(default=0.7, description="Sampling temperature")
    llm_top_p: float = Field(default=0.9, description="Nucleus sampling parameter")
    llm_top_k: int = Field(default=50, description="Top-K sampling parameter")
    llm_use_4bit: bool = Field(default=True, description="Enable 4-bit quantization")
    llm_device: str = Field(default="cuda", description="Device: cuda/cpu/mps")
    
    # LoRA Configuration
    lora_r: int = Field(default=16, description="LoRA rank")
    lora_alpha: int = Field(default=32, description="LoRA alpha")
    lora_dropout: float = Field(default=0.05, description="LoRA dropout")
    lora_target_modules: str = Field(
        default="q_proj,v_proj",
        description="Target modules for LoRA"
    )
    
    # ============================================
    # RAG System Configuration
    # ============================================
    embedding_model: str = Field(
        default="sentence-transformers/all-MiniLM-L6-v2",
        description="Embedding model for RAG"
    )
    chromadb_path: str = Field(
        default="./rag_system/knowledge_db",
        description="ChromaDB persistence directory"
    )
    rag_chunk_size: int = Field(default=1000, description="Text chunk size")
    rag_chunk_overlap: int = Field(default=200, description="Chunk overlap")
    rag_top_k: int = Field(default=5, description="Number of retrieved documents")
    rag_similarity_threshold: float = Field(
        default=0.7,
        description="Minimum similarity score"
    )
    
    # ============================================
    # Computer Vision Configuration
    # ============================================
    vision_model_path: str = Field(
        default="./vision_service/models",
        description="Path to vision models"
    )
    health_detection_model: str = Field(
        default="yolov8n-shrimp-health.pt",
        description="Health detection model filename"
    )
    counting_model: str = Field(
        default="yolov8n-shrimp-counter.pt",
        description="Counting model filename"
    )
    behavior_model: str = Field(
        default="yolov8n-behavior.pt",
        description="Behavior analysis model"
    )
    vision_confidence_threshold: float = Field(
        default=0.6,
        description="Detection confidence threshold"
    )
    vision_iou_threshold: float = Field(
        default=0.45,
        description="IoU threshold for NMS"
    )
    
    # ============================================
    # API Configuration
    # ============================================
    api_host: str = Field(default="0.0.0.0", description="API host")
    api_port: int = Field(default=8000, description="API port")
    vision_api_port: int = Field(default=8002, description="Vision API port")
    api_workers: int = Field(default=4, description="Number of workers")
    api_reload: bool = Field(default=False, description="Enable auto-reload")
    cors_origins: str = Field(
        default="http://localhost:3000,http://localhost:3001",
        description="Allowed CORS origins"
    )
    rate_limit: int = Field(default=100, description="Requests per minute")
    
    # ============================================
    # Firebase Integration
    # ============================================
    firebase_project_id: Optional[str] = Field(
        default=None,
        description="Firebase project ID"
    )
    firebase_credentials_path: str = Field(
        default="./config/firebase-credentials.json",
        description="Firebase credentials file"
    )
    firebase_database_url: Optional[str] = Field(
        default=None,
        description="Firebase database URL"
    )
    
    # ============================================
    # Redis Cache
    # ============================================
    redis_host: str = Field(default="localhost", description="Redis host")
    redis_port: int = Field(default=6379, description="Redis port")
    redis_db: int = Field(default=0, description="Redis database number")
    redis_password: Optional[str] = Field(default=None, description="Redis password")
    cache_ttl: int = Field(default=3600, description="Cache TTL in seconds")
    
    # ============================================
    # Training Configuration
    # ============================================
    training_data_path: str = Field(
        default="./training_data",
        description="Training data directory"
    )
    training_batch_size: int = Field(default=4, description="Training batch size")
    training_epochs: int = Field(default=3, description="Number of epochs")
    training_learning_rate: float = Field(default=2e-4, description="Learning rate")
    training_warmup_steps: int = Field(default=100, description="Warmup steps")
    training_gradient_accumulation_steps: int = Field(
        default=4,
        description="Gradient accumulation"
    )
    training_save_steps: int = Field(default=500, description="Save checkpoint steps")
    
    # ============================================
    # Logging & Monitoring
    # ============================================
    log_level: str = Field(default="INFO", description="Logging level")
    log_format: str = Field(default="json", description="Log format")
    log_file: str = Field(
        default="./logs/shrimp_ai.log",
        description="Log file path"
    )
    enable_metrics: bool = Field(default=True, description="Enable Prometheus metrics")
    metrics_port: int = Field(default=9090, description="Metrics port")
    
    # ============================================
    # Security
    # ============================================
    api_secret_key: str = Field(
        default="your-secret-key-change-this-in-production",
        description="API secret key"
    )
    jwt_algorithm: str = Field(default="HS256", description="JWT algorithm")
    jwt_expiration: int = Field(default=86400, description="JWT expiration seconds")
    
    # ============================================
    # Feature Flags
    # ============================================
    enable_vision_service: bool = Field(default=True, description="Enable CV module")
    enable_financial_module: bool = Field(
        default=True,
        description="Enable financial analytics"
    )
    enable_rag_system: bool = Field(default=True, description="Enable RAG")
    enable_recommendations: bool = Field(
        default=True,
        description="Enable recommendation engine"
    )
    enable_market_prediction: bool = Field(
        default=True,
        description="Enable market prediction"
    )
    
    # ============================================
    # Financial Module
    # ============================================
    market_data_refresh_hours: int = Field(
        default=6,
        description="Market data refresh interval"
    )
    default_currency: str = Field(default="USD", description="Default currency")
    currency_api_key: Optional[str] = Field(
        default=None,
        description="Currency API key"
    )
    
    # ============================================
    # Development
    # ============================================
    debug_mode: bool = Field(default=False, description="Debug mode")
    mock_responses: bool = Field(default=False, description="Mock API responses")
    disable_auth: bool = Field(default=False, description="Disable authentication")
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins into list"""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    @property
    def lora_target_modules_list(self) -> List[str]:
        """Parse LoRA target modules into list"""
        return [module.strip() for module in self.lora_target_modules.split(",")]
    
    def ensure_directories(self):
        """Create necessary directories if they don't exist"""
        directories = [
            self.llm_model_path,
            self.chromadb_path,
            self.vision_model_path,
            self.training_data_path,
            Path(self.log_file).parent,
        ]
        
        for directory in directories:
            Path(directory).mkdir(parents=True, exist_ok=True)


# Global settings instance
settings = Settings()

# Ensure directories exist
settings.ensure_directories()


def get_settings() -> Settings:
    """Get application settings"""
    return settings
