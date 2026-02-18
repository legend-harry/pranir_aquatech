"""
🦐 Shrimp AI - Recommendation Engine Package
Personalized AI recommendations for shrimp farming.
"""

__version__ = "1.0.0"

from recommendation_engine.advisor import (
    PersonalizedAdvisor,
    get_advisor,
    UserProfile,
    FarmConditions,
    Recommendation,
    Priority,
)

__all__ = [
    "PersonalizedAdvisor",
    "get_advisor",
    "UserProfile",
    "FarmConditions",
    "Recommendation",
    "Priority",
]
