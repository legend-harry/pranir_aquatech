"""
🦐 Shrimp AI - Financial Module Package
Financial analysis and ROI calculation for shrimp farming.
"""

__version__ = "1.0.0"

from financial_module.analyzer import (
    FinancialAnalyzer,
    get_financial_analyzer,
    FixedCosts,
    VariableCosts,
    ProductionMetrics,
    RevenueStreams,
)

__all__ = [
    "FinancialAnalyzer",
    "get_financial_analyzer",
    "FixedCosts",
    "VariableCosts",
    "ProductionMetrics",
    "RevenueStreams",
]
