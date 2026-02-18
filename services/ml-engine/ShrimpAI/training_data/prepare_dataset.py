"""
🦐 Shrimp AI - Training Data Preparation
Prepare domain-specific training dataset for LLM fine-tuning.
"""

import json
from typing import List, Dict, Any
from pathlib import Path
from datasets import Dataset, DatasetDict
from loguru import logger


def create_shrimp_farming_dataset() -> Dataset:
    """
    Create comprehensive shrimp farming training dataset.
    
    Dataset Format:
    - instruction: User query/task
    - context: Additional context (optional)
    - response: Expert answer
    """
    
    logger.info("Creating shrimp farming training dataset...")
    
    training_examples = [
        # ============================================
        # Water Quality Management
        # ============================================
        {
            "instruction": "How do I control ammonia levels in my shrimp pond?",
            "context": "Water parameters: pH=8.0, Temperature=28°C, Salinity=20ppt, Ammonia=0.8mg/L",
            "response": """Ammonia control requires a multi-pronged approach:

1. **Immediate Actions:**
   - Reduce feeding by 50% until ammonia drops below 0.5 mg/L
   - Increase water exchange: 20-30% daily until levels stabilize
   - Add commercial nitrifying bacteria (Nitrosomonas, Nitrobacter species)

2. **Medium-term Solutions:**
   - Install additional aeration to promote nitrification
   - Add zeolite (50-100 kg per hectare) to absorb ammonia
   - Maintain pH between 7.5-8.5 (lower pH reduces toxic NH3 form)

3. **Long-term Prevention:**
   - Optimize feeding: Use feed trays to monitor consumption
   - Maintain C:N ratio at 15:1 using molasses or sugar
   - Apply probiotics weekly (Bacillus species)
   - Regular water quality testing (2x daily)

4. **Expected Results:**
   - Ammonia should drop to <0.3 mg/L within 3-5 days
   - Improved shrimp activity and feeding response
   - Reduced stress and disease susceptibility"""
        },
        
        {
            "instruction": "What is the optimal dissolved oxygen level for shrimp farming?",
            "context": "",
            "response": """Optimal dissolved oxygen (DO) levels for shrimp:

**Critical Thresholds:**
- Optimal range: 5-7 mg/L
- Minimum acceptable: 4 mg/L
- Critical low: <3 mg/L (emergency)
- Super-saturation: >10 mg/L (avoid)

**Management by Time:**
- Dawn (5-6 AM): Most critical period, aim for >4 mg/L
- Daytime: Natural photosynthesis maintains 6-8 mg/L
- Night: Run aerators continuously, monitor closely
- Post-feeding: Increase aeration 2-3 hours after feeding

**Aeration Requirements:**
- Extensive: 2-4 HP/hectare
- Semi-intensive: 4-8 HP/hectare
- Intensive: 8-15 HP/hectare
- Super-intensive: 15-25 HP/hectare

**Signs of Low DO:**
- Shrimp at water surface
- Reduced feeding activity
- Increased mortality at dawn
- Slow growth rates

**Solutions:**
- Install paddle wheel aerators (most efficient)
- Use diffused aeration for deeper ponds
- Emergency: Water exchange or liquid oxygen"""
        },
        
        {
            "instruction": "My pond pH is 6.5. What should I do?",
            "context": "Pond size: 1 hectare, Semi-intensive system, Stocking density: 60/m²",
            "response": """Your pH of 6.5 is below the optimal range (7.5-8.5) and requires immediate correction:

**Immediate Steps:**
1. **Calculate lime requirement:**
   - Formula: Lime (kg) = [Target pH - Current pH] × Pond area (m²) × Average depth (m) × 10
   - For 1 hectare at 1.5m depth: (7.8 - 6.5) × 10,000 × 1.5 × 10 = 195 kg

2. **Application method:**
   - Use agricultural lime (CaCO₃) or dolomite
   - Dissolve in water before application
   - Apply in morning, spread evenly across pond
   - Do NOT apply more than 200 kg/hectare per day

3. **Monitor closely:**
   - Test pH every 6 hours for first 24 hours
   - Target: Increase pH by 0.1-0.2 units per day
   - Don't shock shrimp with rapid changes

**Why Low pH is Problematic:**
- Increased ammonia toxicity (NH₃ form)
- Reduced growth rates (15-20% slower)
- Weakened immune system
- Poor calcium absorption (soft shells)
- Reduced effectiveness of probiotics

**Prevention:**
- Apply lime during pond preparation (500-1000 kg/ha)
- Monitor pH weekly
- Maintain alkalinity >120 mg/L as CaCO₃
- Avoid excessive feeding (organic acids from decomposition)"""
        },
        
        # ============================================
        # Disease Management
        # ============================================
        {
            "instruction": "What are the symptoms and treatment for White Spot Syndrome?",
            "context": "",
            "response": """**White Spot Syndrome Virus (WSSV) - Critical Emergency**

**Symptoms:**
1. **Early Stage (1-2 days):**
   - Lethargy and weak swimming
   - Reduced feeding response
   - Shrimp swimming at surface
   
2. **Progressive Stage (2-4 days):**
   - White spots on carapace (0.5-2mm diameter)
   - Red discoloration of body
   - Loose cuticle
   
3. **Terminal Stage (4-7 days):**
   - Massive mortality (can reach 100%)
   - Death within 3-10 days of outbreak

**Immediate Actions (Disease is NOT Curable):**
1. **Containment:**
   - STOP all water exchange immediately
   - Isolate affected pond
   - Do not transfer shrimp or equipment
   
2. **Reduce Viral Load:**
   - Apply chlorination: 30 ppm for 24 hours
   - Increase calcium hydroxide: 20 ppm
   - Stop feeding completely
   
3. **Harvest Decision:**
   - If mortality >20%: Emergency harvest immediately
   - If mortality <20%: Consider early harvest
   - Partial harvest of larger shrimp may recover some investment

4. **Biosecurity Protocol:**
   - Disinfect all footwear and equipment
   - No sharing of tools between ponds
   - Limit personnel access

**Prevention (Critical):**
- Use SPF (Specific Pathogen Free) postlarvae only
- Implement strict biosecurity
- Maintain optimal water quality (DO >5 mg/L, Ammonia <0.3 mg/L)
- Reduce stocking density by 20% during outbreaks in region
- Use immune-stimulants (β-glucan, vitamin C)

**Post-Outbreak:**
- Completely drain and dry pond for 2 weeks
- Apply lime: 2000 kg/hectare
- Chlorinate with 50 ppm for 48 hours
- Sun-dry for 7-10 days"""
        },
        
        {
            "instruction": "How can I prevent Early Mortality Syndrome (EMS)?",
            "context": "",
            "response": """**Early Mortality Syndrome (EMS/AHPND) Prevention Protocol**

**Understanding EMS:**
- Also called Acute Hepatopancreatic Necrosis Disease (AHPND)
- Caused by Vibrio parahaemolyticus with specific toxin genes
- Mortality: 40-100% within 30 days of stocking
- Most critical: Days 20-40 of culture

**Prevention Strategy (Multi-layered):**

1. **Pre-stocking (Critical):**
   - Test PL for AHPND via PCR before stocking
   - Source only from certified hatcheries
   - Quarantine PL for 7 days, observe for mortality
   - Recommended: Stock only PL15 or older

2. **Pond Preparation:**
   - Complete dry-out: Minimum 14 days
   - Remove ALL organic matter and sludge
   - Apply lime: 1000-1500 kg/hectare
   - Chlorinate water: 30 ppm for 24 hours before filling
   - Maintain salinity >15 ppt (reduces Vibrio)

3. **Water Management:**
   - Minimize water exchange first 45 days (closed system)
   - Use biosecure inlet: Filter with 500 micron + UV treatment
   - Maintain: pH 7.8-8.3, DO >5 mg/L, Alkalinity >120 mg/L

4. **Feed Management:**
   - High-quality feed only (no expired feed)
   - Use probiotics-enriched feed
   - Feed quantity: Start at 3% body weight, adjust based on consumption
   - Use feeding trays (monitor every 2 hours)

5. **Biological Control:**
   - Apply beneficial probiotics:
     * Bacillus subtilis: 10⁶ CFU/L, twice weekly
     * Lactobacillus species: 10⁵ CFU/L, weekly
   - Maintain phytoplankton bloom (Secchi disk: 30-40 cm)

6. **Immune Enhancement:**
   - Add to feed:
     * Vitamin C: 500-1000 mg/kg feed
     * β-glucan: 0.5-1 g/kg feed
     * Garlic extract: 2-3 g/kg feed

**Monitoring:**
- Daily hepatopancreas checks (first 45 days)
- Look for pale, enlarged, or soft hepatopancreas
- Random sampling: 30 shrimp per pond daily

**If EMS Detected:**
- Immediate harvest is only option
- Do not continue culture - losses will be total"""
        },
        
        # ============================================
        # Feed & Nutrition
        # ============================================
        {
            "instruction": "How do I calculate and improve my Feed Conversion Ratio (FCR)?",
            "context": "Current data: Feed given = 500kg, Harvest biomass = 280kg, Initial stocking = 50kg",
            "response": """**FCR Calculation & Optimization Guide**

**Your Current FCR:**
```
FCR = Total feed given / (Final biomass - Initial biomass)
FCR = 500 kg / (280 kg - 50 kg)
FCR = 500 / 230 = 2.17
```

**Analysis:**
Your FCR of 2.17 is **POOR** and needs immediate improvement.

**Target FCR by System:**
- Extensive: 2.0-3.0 (acceptable range)
- Semi-intensive: 1.5-1.8 (your target should be 1.6)
- Intensive: 1.2-1.5 (best practice)
- Super-intensive: 1.0-1.3 (with RAS technology)

**Strategies to Improve FCR to 1.6:**

1. **Feed Quality (Impact: 30% improvement):**
   - Protein content: Minimum 35-38%
   - Fresh feed only (<3 months from manufacturing)
   - Water-stable pellets (4+ hours)
   - Cost more but FCR improves significantly

2. **Feeding Frequency (Impact: 20% improvement):**
   - Current practice might be 2-3 times/day
   - Optimal: 4-6 times/day
   - Use automatic feeders or feed-on-demand system
   - Schedule: 6 AM, 10 AM, 2 PM, 6 PM, 10 PM, 2 AM

3. **Feed Monitoring (Impact: 25% improvement):**
   - Install feed trays (1 per 1000m²)
   - Check every 2 hours
   - Feed should be consumed within 2 hours
   - If feed remains: Reduce next feeding by 20%
   - If consumed quickly: Increase by 10%

4. **Water Quality (Impact: 15% improvement):**
   - Maintain pH: 7.8-8.2 (optimal for enzyme activity)
   - DO: >5 mg/L always (better feed conversion)
   - Temperature: 28-32°C (optimal metabolism)
   - Ammonia: <0.3 mg/L (toxicity reduces appetite)

5. **Feed Formula Adjustments:**
   - Days 1-30: 40% protein, 8% lipid
   - Days 31-60: 38% protein, 7% lipid
   - Days 61-90: 35% protein, 6% lipid
   - Days 91+: 32% protein, 6% lipid

6. **Health Management (Impact: 10% improvement):**
   - Healthy shrimp = Better FCR
   - Regular probiotic application
   - Disease-free culture

**Expected Improvements:**
- Month 1: FCR 2.17 → 1.95 (feed management)
- Month 2: FCR 1.95 → 1.75 (water quality optimization)
- Month 3: FCR 1.75 → 1.60 (complete protocol implementation)

**Economic Impact:**
- Moving from FCR 2.17 to 1.60 on 1 hectare:
- Feed savings: ~25% = $2,000-3,000 per cycle
- Better growth = Higher market price
- Total benefit: $3,000-5,000 per cycle"""
        },
        
        {
            "instruction": "What feeding schedule should I follow for different growth stages?",
            "context": "Intensive farming, 1.5 hectare pond, Stocking density: 80 PL/m²",
            "response": """**Comprehensive Feeding Schedule - Intensive System**

**Stage 1: Nursery Phase (Days 1-30)**
- **Objective:** Establish strong juveniles, minimize mortality

| Parameter | Value |
|-----------|-------|
| Feed type | Crumble/powder (0.3-0.5mm) |
| Protein | 40-42% |
| Feeding rate | 8-12% body weight/day |
| Frequency | 6-8 times/day |
| Timing | Every 3 hours (24-hour feeding) |

**Daily feed quantity example (Day 15):**
- Survival rate estimate: 85%
- Number: 80 PLs/m² × 15,000 m² = 1,200,000 × 0.85 = 1,020,000
- Average weight: 0.5g
- Biomass: 510 kg
- Feed/day: 510 kg × 10% = 51 kg
- Per feeding: 51 kg / 6 = 8.5 kg

**Stage 2: Growing Phase (Days 31-60)**
- **Objective:** Maximize growth rate

| Parameter | Value |
|-----------|-------|
| Feed type | Pellets (1.0-1.5mm) |
| Protein | 38-40% |
| Feeding rate | 5-7% body weight/day |
| Frequency | 4-5 times/day |
| Timing | 6 AM, 10 AM, 3 PM, 7 PM, 11 PM |

**Stage 3: Final Fattening (Days 61-90+)**
- **Objective:** Optimize FCR, prepare for harvest

| Parameter | Value |
|-----------|-------|
| Feed type | Pellets (2.0-2.5mm) |
| Protein | 35-38% |
| Feeding rate | 3-5% body weight/day |
| Frequency | 3-4 times/day |
| Timing | 6 AM, 12 PM, 6 PM, 10 PM |

**Feed Tray Monitoring Protocol:**
1. Check trays 2 hours after feeding
2. Ideal consumption: 90-95% in 2 hours
3. Adjust next feeding based on remains:
   - >30% remains: Reduce feed by 20%
   - 10-30% remains: Reduce by 10%
   - <10% remains: Maintain
   - No remains: Increase by 10%

**Special Conditions:**

**Weather Adjustments:**
- Cloudy/rainy days: Reduce feed by 20-30%
- Water change days: Skip 1 feeding
- Low DO (<4 mg/L): Reduce feed by 50%

**Pre-harvest:**
- 24 hours before harvest: STOP feeding
- Allows gut clearance for better quality

**Supplemental Feeding:**
- Fresh clams/mussels: 5-10 kg/hectare/week (Days 60+)
- Boosts natural feeding behavior
- Improves flesh quality

**Economic Calculation for Your Farm:**
- Total culture period: 90 days
- Expected harvest: 15 tonnes
- FCR target: 1.5
- Total feed needed: 15,000 kg × 1.5 = 22,500 kg
- Feed cost @ $1.5/kg: $33,750
- Feed per day average: 250 kg

**Feeding Formula Distribution:**
- Days 1-30: 9,000 kg (40% of feed)
- Days 31-60: 7,500 kg (33% of feed)
- Days 61-90: 6,000 kg (27% of feed)"""
        },
        
        # ============================================
        # Financial Planning
        # ============================================
        {
            "instruction": "Calculate ROI for a 1 hectare intensive shrimp farm",
            "context": "Initial investment: $25,000, Stocking density: 70/m², Expected survival: 75%, Market price: $8/kg",
            "response": """**ROI Analysis: 1 Hectare Intensive Shrimp Farm**

**Investment Breakdown:**
```
Fixed Costs (Per cycle):
- Pond lease/depreciation: $2,000
- Equipment depreciation: $1,500
- Infrastructure maintenance: $800
TOTAL FIXED: $4,300

Variable Costs (Per cycle):
- Postlarvae (700,000 @ $0.006): $4,200
- Feed (15 tonnes @ $1.50/kg): $22,500
- Labor (3 workers × 3 months): $3,600
- Electricity (aerators): $2,400
- Medication & probiotics: $800
- Water treatment: $600
- Fuel & transportation: $500
- Packaging & ice: $400
- Miscellaneous: $700
TOTAL VARIABLE: $35,700

TOTAL COSTS: $40,000
```

**Production Calculation:**
```
Pond area: 10,000 m²
Stocking: 70 PL/m² = 700,000 PLs
Survival rate: 75% = 525,000 shrimp
Average body weight: 25 grams
Total yield: 525,000 × 25g / 1000 = 13,125 kg

Revenue:
13,125 kg × $8/kg = $105,000

Net Profit:
$105,000 - $40,000 = $65,000
```

**ROI Calculation:**
```
ROI = (Net Profit / Total Costs) × 100
ROI = ($65,000 / $40,000) × 100 = 162.5%

Profit Margin = (Net Profit / Revenue) × 100
Profit Margin = ($65,000 / $105,000) × 100 = 61.9%
```

**Annual Projection (3 cycles/year):**
```
Annual Revenue: $105,000 × 3 = $315,000
Annual Costs: $40,000 × 3 = $120,000
Annual Net Profit: $195,000
Annual ROI: 162.5%

Payback Period for Initial Investment:
$25,000 / $65,000 = 0.38 cycles = 1.2 months
```

**Break-even Analysis:**
```
Break-even price per kg:
$40,000 / 13,125 kg = $3.05/kg

Break-even yield:
$40,000 / $8/kg = 5,000 kg

Safety margin: (13,125 - 5,000) / 13,125 = 62%
```

**Sensitivity Analysis:**

| Scenario | Survival | Yield (kg) | Revenue | Profit | ROI |
|----------|----------|------------|---------|--------|------|
| Worst | 60% | 10,500 | $84,000 | $44,000 | 110% |
| Conservative | 70% | 12,250 | $98,000 | $58,000 | 145% |
| Target | 75% | 13,125 | $105,000 | $65,000 | 162% |
| Excellent | 80% | 14,000 | $112,000 | $72,000 | 180% |

**Key Metrics:**
- Feed Conversion Ratio assumed: 1.5
- Culture period: 90 days
- Cost per kg produced: $3.05
- Revenue per kg: $8.00
- Profit per kg: $4.95
- Benefit-Cost Ratio: 2.62:1

**Risk Factors:**
1. Disease outbreak: Could reduce survival to 40-50%
2. Market price fluctuation: $6-10/kg seasonal variation
3. Feed price increase: Major cost component (56%)
4. Weather events: Can extend culture period

**Optimization Opportunities:**
1. Improve survival 75% → 80%: +$7,000 profit
2. Reduce FCR 1.5 → 1.3: +$3,000 profit
3. Value-addition (head-on frozen): +$1-2/kg
4. Direct market access: Eliminate middleman (+15%)

**Conclusion:**
This is a HIGHLY PROFITABLE operation with strong ROI of 162.5%. 
Payback period is excellent at just 1.2 months.
Even in worst-case scenarios, operation remains profitable."""
        },
    ]
    
    # Add more training examples...
    logger.info(f"Created {len(training_examples)} training examples")
    
    # Convert to HuggingFace Dataset
    dataset = Dataset.from_list(training_examples)
    
    return dataset


def save_training_dataset(dataset: Dataset, output_dir: str = "./training_data/shrimp_corpus"):
    """Save training dataset to disk"""
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    logger.info(f"Saving dataset to {output_path}")
    
    # Save as HuggingFace dataset
    dataset.save_to_disk(str(output_path))
    
    # Also save as JSON for inspection
    json_path = output_path / "dataset.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(dataset.to_dict(), f, indent=2, ensure_ascii=False)
    
    logger.info(f"✅ Dataset saved: {len(dataset)} examples")
    
    return output_path


def prepare_for_training(dataset: Dataset) -> DatasetDict:
    """
    Prepare dataset for training with train/validation split.
    
    Args:
        dataset: Training dataset
        
    Returns:
        DatasetDict with train/validation splits
    """
    # Split into train (90%) and validation (10%)
    split_dataset = dataset.train_test_split(test_size=0.1, seed=42)
    
    dataset_dict = DatasetDict({
        "train": split_dataset["train"],
        "validation": split_dataset["test"]
    })
    
    logger.info(f"Train: {len(dataset_dict['train'])} | Validation: {len(dataset_dict['validation'])}")
    
    return dataset_dict


def main():
    """Main execution"""
    logger.info("🦐 Starting training data preparation...")
    
    # Create dataset
    dataset = create_shrimp_farming_dataset()
    
    # Prepare for training
    dataset_dict = prepare_for_training(dataset)
    
    # Save
    output_dir = save_training_dataset(dataset_dict["train"])
    
    logger.info("✅ Training data preparation complete!")
    logger.info(f"Dataset location: {output_dir}")
    logger.info(f"Total examples: {len(dataset_dict['train']) + len(dataset_dict['validation'])}")
    
    return output_dir


if __name__ == "__main__":
    main()
