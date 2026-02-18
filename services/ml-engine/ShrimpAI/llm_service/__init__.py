"""
🦐 Shrimp AI - LLM Service Package
Core LLM functionality for shrimp farming expertise.
"""

__version__ = "1.0.0"
__author__ = "Shrimp AI Team"

from llm_service.core.llm_engine import ShrimpFarmingLLM, get_llm
from llm_service.config import Settings, get_settings

__all__ = [
    "ShrimpFarmingLLM",
    "get_llm",
    "Settings",
    "get_settings",
]
