"""
🦐 Shrimp AI - Financial Analysis Module
ROI calculation, cost analysis, and market trend prediction for shrimp farming.
"""

from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from loguru import logger


@dataclass
class FixedCosts:
    """Fixed costs for shrimp farming"""
    pond_lease: float = 0.0
    equipment: float = 0.0
    infrastructure: float = 0.0
    permits_licenses: float = 0.0
    insurance: float = 0.0
    depreciation: float = 0.0
    
    @property
    def total(self) -> float:
        return sum(asdict(self).values())


@dataclass
class VariableCosts:
    """Variable costs per production cycle"""
    postlarvae: float = 0.0  # PL purchase
    feed: float = 0.0
    labor: float = 0.0
    electricity: float = 0.0
    fuel: float = 0.0
    medication: float = 0.0
    probiotics: float = 0.0
    water_treatment: float = 0.0
    maintenance: float = 0.0
    transportation: float = 0.0
    packaging: float = 0.0
    miscellaneous: float = 0.0
    
    @property
    def total(self) -> float:
        return sum(asdict(self).values())


@dataclass
class RevenueStreams:
    """Revenue sources"""
    shrimp_sales: float = 0.0
    byproducts: float = 0.0  # Shells, heads
    certification_premiums: float = 0.0  # Organic, ASC, BAP
    government_subsidies: float = 0.0
    
    @property
    def total(self) -> float:
        return sum(asdict(self).values())


@dataclass
class ProductionMetrics:
    """Production performance metrics"""
    pond_area: float  # hectares
    stocking_density: int  # PLs per m²
    average_body_weight: float  # grams at harvest
    survival_rate: float  # percentage (0-100)
    feed_conversion_ratio: float  # FCR
    culture_period: int  # days
    market_price_per_kg: float  # USD/kg


@dataclass
class FinancialAnalysisResult:
    """Complete financial analysis result"""
    # Core metrics
    total_investment: float
    total_costs: float
    total_revenue: float
    net_profit: float
    roi_percentage: float
    profit_margin: float
    
    # Break-even analysis
    break_even_price: float
    break_even_yield: float
    break_even_days: int
    
    # Production metrics
    total_yield_kg: float
    cost_per_kg: float
    revenue_per_kg: float
    profit_per_kg: float
    
    # Ratios & indicators
    benefit_cost_ratio: float
    payback_period_months: float
    internal_rate_of_return: Optional[float] = None
    
    # Sensitivity analysis
    sensitivity_analysis: Optional[Dict[str, Any]] = None
    
    # Risk assessment
    risk_score: Optional[float] = None
    risk_factors: Optional[List[str]] = None
    
    # Recommendations
    recommendations: Optional[List[str]] = None


class FinancialAnalyzer:
    """
    Comprehensive financial analysis for shrimp farming operations.
    
    Features:
    - ROI calculation
    - Break-even analysis
    - Sensitivity analysis
    - Market price forecasting
    - Cost optimization recommendations
    """
    
    def __init__(self):
        """Initialize financial analyzer"""
        self.analysis_history: List[FinancialAnalysisResult] = []
        logger.info("Financial Analyzer initialized")
    
    def calculate_roi(
        self,
        fixed_costs: FixedCosts,
        variable_costs: VariableCosts,
        production_metrics: ProductionMetrics,
        revenue_streams: Optional[RevenueStreams] = None,
        include_sensitivity: bool = True,
    ) -> FinancialAnalysisResult:
        """
        Calculate comprehensive ROI and financial metrics.
        
        Args:
            fixed_costs: Fixed capital investments
            variable_costs: Operating costs per cycle
            production_metrics: Production parameters
            revenue_streams: Revenue sources (calculated if not provided)
            include_sensitivity: Include sensitivity analysis
            
        Returns:
            FinancialAnalysisResult with complete financial analysis
        """
        logger.info("Calculating ROI and financial metrics...")
        
        # Calculate total yield
        pond_area_m2 = production_metrics.pond_area * 10000  # hectares to m²
        total_stocked = pond_area_m2 * production_metrics.stocking_density
        total_harvested = total_stocked * (production_metrics.survival_rate / 100)
        total_yield_kg = total_harvested * production_metrics.average_body_weight / 1000
        
        logger.info(f"Projected yield: {total_yield_kg:.2f} kg")
        
        # Calculate costs
        total_investment = fixed_costs.total
        total_operational_costs = variable_costs.total
        total_costs = total_investment + total_operational_costs
        
        # Calculate revenue
        if revenue_streams is None:
            primary_revenue = total_yield_kg * production_metrics.market_price_per_kg
            revenue_streams = RevenueStreams(shrimp_sales=primary_revenue)
        
        total_revenue = revenue_streams.total
        
        # Core financial metrics
        net_profit = total_revenue - total_costs
        roi_percentage = (net_profit / total_costs) * 100 if total_costs > 0 else 0
        profit_margin = (net_profit / total_revenue) * 100 if total_revenue > 0 else 0
        
        # Break-even analysis
        break_even_price = total_costs / total_yield_kg if total_yield_kg > 0 else 0
        break_even_yield = total_costs / production_metrics.market_price_per_kg
        
        # Estimate break-even days (simplified)
        daily_revenue = total_revenue / production_metrics.culture_period
        daily_costs = total_operational_costs / production_metrics.culture_period
        if daily_revenue > daily_costs:
            break_even_days = int(total_investment / (daily_revenue - daily_costs))
        else:
            break_even_days = production_metrics.culture_period * 2  # Estimate
        
        # Per-kg metrics
        cost_per_kg = total_costs / total_yield_kg if total_yield_kg > 0 else 0
        revenue_per_kg = total_revenue / total_yield_kg if total_yield_kg > 0 else 0
        profit_per_kg = net_profit / total_yield_kg if total_yield_kg > 0 else 0
        
        # Financial ratios
        benefit_cost_ratio = total_revenue / total_costs if total_costs > 0 else 0
        
        # Payback period (months)
        cycles_per_year = 365 / production_metrics.culture_period
        annual_profit = net_profit * cycles_per_year
        payback_period_months = (
            (total_investment / annual_profit) * 12 if annual_profit > 0 else 999
        )
        
        # Create analysis result
        result = FinancialAnalysisResult(
            total_investment=total_investment,
            total_costs=total_costs,
            total_revenue=total_revenue,
            net_profit=net_profit,
            roi_percentage=roi_percentage,
            profit_margin=profit_margin,
            break_even_price=break_even_price,
            break_even_yield=break_even_yield,
            break_even_days=break_even_days,
            total_yield_kg=total_yield_kg,
            cost_per_kg=cost_per_kg,
            revenue_per_kg=revenue_per_kg,
            profit_per_kg=profit_per_kg,
            benefit_cost_ratio=benefit_cost_ratio,
            payback_period_months=payback_period_months,
        )
        
        # Sensitivity analysis
        if include_sensitivity:
            result.sensitivity_analysis = self._perform_sensitivity_analysis(
                fixed_costs,
                variable_costs,
                production_metrics,
            )
        
        # Risk assessment
        result.risk_score, result.risk_factors = self._assess_risk(result, production_metrics)
        
        # Generate recommendations
        result.recommendations = self._generate_recommendations(result, production_metrics)
        
        # Store in history
        self.analysis_history.append(result)
        
        logger.info(f"✅ ROI Analysis complete: {roi_percentage:.2f}%")
        return result
    
    def _perform_sensitivity_analysis(
        self,
        fixed_costs: FixedCosts,
        variable_costs: VariableCosts,
        production_metrics: ProductionMetrics,
    ) -> Dict[str, Any]:
        """Perform sensitivity analysis on key variables"""
        
        # Variables to analyze
        price_variations = np.arange(-30, 31, 10)  # -30% to +30%
        fcr_variations = np.arange(-20, 21, 10)
        survival_variations = np.arange(-20, 21, 10)
        
        sensitivity = {
            "price_sensitivity": [],
            "fcr_sensitivity": [],
            "survival_sensitivity": [],
        }
        
        # Price sensitivity
        base_price = production_metrics.market_price_per_kg
        for var in price_variations:
            modified_metrics = production_metrics
            modified_metrics.market_price_per_kg = base_price * (1 + var / 100)
            result = self.calculate_roi(
                fixed_costs,
                variable_costs,
                modified_metrics,
                include_sensitivity=False,
            )
            sensitivity["price_sensitivity"].append({
                "variation_pct": var,
                "roi": result.roi_percentage,
                "profit": result.net_profit,
            })
        
        # FCR sensitivity (affects feed costs)
        base_fcr = production_metrics.feed_conversion_ratio
        base_feed_cost = variable_costs.feed
        for var in fcr_variations:
            modified_metrics = production_metrics
            modified_metrics.feed_conversion_ratio = base_fcr * (1 + var / 100)
            modified_costs = variable_costs
            modified_costs.feed = base_feed_cost * (1 + var / 100)
            result = self.calculate_roi(
                fixed_costs,
                modified_costs,
                modified_metrics,
                include_sensitivity=False,
            )
            sensitivity["fcr_sensitivity"].append({
                "variation_pct": var,
                "roi": result.roi_percentage,
                "profit": result.net_profit,
            })
        
        # Survival rate sensitivity
        base_survival = production_metrics.survival_rate
        for var in survival_variations:
            modified_metrics = production_metrics
            modified_metrics.survival_rate = max(
                0, min(100, base_survival + var)
            )
            result = self.calculate_roi(
                fixed_costs,
                variable_costs,
                modified_metrics,
                include_sensitivity=False,
            )
            sensitivity["survival_sensitivity"].append({
                "variation_pct": var,
                "roi": result.roi_percentage,
                "profit": result.net_profit,
            })
        
        return sensitivity
    
    def _assess_risk(
        self,
        result: FinancialAnalysisResult,
        metrics: ProductionMetrics,
    ) -> Tuple[float, List[str]]:
        """Assess financial risk and identify risk factors"""
        
        risk_factors = []
        risk_score = 0.0  # 0-100, higher is riskier
        
        # Low profit margin risk
        if result.profit_margin < 10:
            risk_factors.append("⚠️ Low profit margin (<10%)")
            risk_score += 20
        elif result.profit_margin < 20:
            risk_factors.append("Moderate profit margin (10-20%)")
            risk_score += 10
        
        # High FCR risk
        if metrics.feed_conversion_ratio > 1.8:
            risk_factors.append("⚠️ High FCR (>1.8) - Feed efficiency poor")
            risk_score += 15
        elif metrics.feed_conversion_ratio > 1.5:
            risk_factors.append("Moderate FCR (1.5-1.8)")
            risk_score += 8
        
        # Low survival rate risk
        if metrics.survival_rate < 60:
            risk_factors.append("⚠️ Low survival rate (<60%)")
            risk_score += 25
        elif metrics.survival_rate < 75:
            risk_factors.append("Moderate survival rate (60-75%)")
            risk_score += 12
        
        # Long payback period risk
        if result.payback_period_months > 24:
            risk_factors.append("⚠️ Long payback period (>2 years)")
            risk_score += 15
        elif result.payback_period_months > 18:
            risk_factors.append("Moderate payback period (18-24 months)")
            risk_score += 8
        
        # Negative ROI risk
        if result.roi_percentage < 0:
            risk_factors.append("🚨 NEGATIVE ROI - Operation not profitable")
            risk_score += 40
        elif result.roi_percentage < 15:
            risk_factors.append("⚠️ Low ROI (<15%)")
            risk_score += 20
        
        # High break-even price risk
        if result.break_even_price > metrics.market_price_per_kg:
            risk_factors.append("🚨 Break-even price above market price")
            risk_score += 30
        
        risk_score = min(100, risk_score)  # Cap at 100
        
        return risk_score, risk_factors
    
    def _generate_recommendations(
        self,
        result: FinancialAnalysisResult,
        metrics: ProductionMetrics,
    ) -> List[str]:
        """Generate actionable recommendations"""
        
        recommendations = []
        
        # FCR optimization
        if metrics.feed_conversion_ratio > 1.5:
            recommendations.append(
                f"🎯 Improve FCR from {metrics.feed_conversion_ratio:.2f} to 1.3-1.5: "
                "Optimize feeding frequency, use quality feed, monitor water quality"
            )
        
        # Survival rate improvement
        if metrics.survival_rate < 75:
            recommendations.append(
                f"🎯 Increase survival rate from {metrics.survival_rate:.1f}% to 80%+: "
                "Implement biosecurity measures, regular water quality monitoring, disease prevention"
            )
        
        # Cost reduction
        if result.cost_per_kg > result.revenue_per_kg * 0.7:
            recommendations.append(
                "💰 Reduce production costs: Negotiate bulk feed prices, optimize labor, "
                "reduce electricity use with aerator timers"
            )
        
        # Market price optimization
        if result.break_even_price > metrics.market_price_per_kg * 0.9:
            recommendations.append(
                "📈 Explore premium markets: Organic certification, direct-to-consumer sales, "
                "larger shrimp size for better prices"
            )
        
        # Stocking density optimization
        if metrics.stocking_density < 50:
            recommendations.append(
                "🦐 Consider increasing stocking density to 50-80 PLs/m² for intensive farming "
                "(ensure proper aeration and water quality management)"
            )
        elif metrics.stocking_density > 100:
            recommendations.append(
                "⚠️ High stocking density (>100 PLs/m²): Monitor closely for disease outbreaks "
                "and water quality issues"
            )
        
        # Profitability recommendations
        if result.roi_percentage < 20:
            recommendations.append(
                "💡 ROI below target: Focus on reducing FCR, improving survival rate, "
                "and exploring value-added products"
            )
        
        return recommendations
    
    def predict_market_trends(
        self,
        historical_prices: pd.DataFrame,
        forecast_periods: int = 6,
    ) -> Dict[str, Any]:
        """
        Predict shrimp market price trends.
        
        Args:
            historical_prices: DataFrame with 'date' and 'price' columns
            forecast_periods: Number of periods to forecast
            
        Returns:
            Forecast data with confidence intervals
        """
        logger.info(f"Predicting market trends for {forecast_periods} periods")
        
        # Simple moving average forecast (can be enhanced with Prophet/ARIMA)
        prices = historical_prices['price'].values
        
        # Calculate trend
        ma_short = np.mean(prices[-30:]) if len(prices) >= 30 else np.mean(prices)
        ma_long = np.mean(prices[-90:]) if len(prices) >= 90 else np.mean(prices)
        trend = ma_short - ma_long
        
        # Generate forecast
        last_price = prices[-1]
        forecast = []
        
        for i in range(1, forecast_periods + 1):
            predicted_price = last_price + (trend * i)
            # Add some noise for confidence intervals
            std_dev = np.std(prices[-30:]) if len(prices) >= 30 else np.std(prices)
            
            forecast.append({
                "period": i,
                "predicted_price": predicted_price,
                "lower_bound": predicted_price - (1.96 * std_dev),
                "upper_bound": predicted_price + (1.96 * std_dev),
            })
        
        trend_direction = "upward" if trend > 0 else "downward" if trend < 0 else "stable"
        
        return {
            "forecast": forecast,
            "trend": trend_direction,
            "trend_strength": abs(trend),
            "current_price": last_price,
            "avg_30d": ma_short,
            "avg_90d": ma_long,
        }
    
    def compare_scenarios(
        self,
        scenarios: List[Dict[str, Any]],
    ) -> pd.DataFrame:
        """
        Compare multiple farming scenarios.
        
        Args:
            scenarios: List of scenario parameters
            
        Returns:
            Comparison DataFrame
        """
        results = []
        
        for i, scenario in enumerate(scenarios):
            result = self.calculate_roi(
                scenario['fixed_costs'],
                scenario['variable_costs'],
                scenario['production_metrics'],
            )
            
            results.append({
                "scenario": scenario.get('name', f"Scenario {i+1}"),
                "roi_pct": result.roi_percentage,
                "net_profit": result.net_profit,
                "profit_margin": result.profit_margin,
                "break_even_price": result.break_even_price,
                "payback_months": result.payback_period_months,
                "risk_score": result.risk_score,
            })
        
        df = pd.DataFrame(results)
        return df
    
    def export_analysis(
        self,
        result: FinancialAnalysisResult,
        output_format: str = "dict",
    ) -> Any:
        """
        Export analysis result.
        
        Args:
            result: Financial analysis result
            output_format: 'dict', 'json', or 'dataframe'
            
        Returns:
            Exported data in specified format
        """
        data = asdict(result)
        
        if output_format == "dict":
            return data
        elif output_format == "json":
            import json
            return json.dumps(data, indent=2, default=str)
        elif output_format == "dataframe":
            return pd.DataFrame([data])
        else:
            raise ValueError(f"Unsupported format: {output_format}")


# Global analyzer instance
_analyzer_instance: Optional[FinancialAnalyzer] = None


def get_financial_analyzer() -> FinancialAnalyzer:
    """Get or create global financial analyzer instance"""
    global _analyzer_instance
    
    if _analyzer_instance is None:
        _analyzer_instance = FinancialAnalyzer()
    
    return _analyzer_instance
