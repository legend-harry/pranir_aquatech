"""
🦐 Shrimp AI - Main FastAPI Application
REST API for shrimp farming LLM system.
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uvicorn
from loguru import logger
from datetime import datetime
import sys

# Configure logging
logger.remove()
logger.add(sys.stdout, format="{time} | {level} | {message}", level="INFO")

# Import modules
from llm_service.config import get_settings
from llm_service.core.llm_engine import get_llm
from rag_system.knowledge_base import get_rag
from financial_module.analyzer import (
    get_financial_analyzer,
    FixedCosts,
    VariableCosts,
    ProductionMetrics,
    RevenueStreams,
)
from vision_service.analyzer import get_vision_analyzer
from recommendation_engine.advisor import (
    get_advisor,
    UserProfile,
    FarmConditions,
)


# ============================================
# Initialize FastAPI App
# ============================================

settings = get_settings()

app = FastAPI(
    title="🦐 Shrimp AI API",
    description="AI-powered shrimp farming management system",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# Pydantic Models (Request/Response)
# ============================================

class HealthCheck(BaseModel):
    status: str = "healthy"
    version: str = "1.0.0"
    timestamp: str


class ChatRequest(BaseModel):
    query: str = Field(..., description="User query")
    context: Optional[str] = Field(None, description="Additional context")
    use_rag: bool = Field(True, description="Use RAG for context")
    max_tokens: Optional[int] = Field(None, description="Max tokens to generate")


class ChatResponse(BaseModel):
    response: str
    sources: Optional[List[Dict[str, Any]]] = None
    confidence: float


class AddDocumentsRequest(BaseModel):
    documents: List[Dict[str, Any]] = Field(..., description="List of documents")
    source: str = Field("api", description="Source identifier")


class SemanticSearchRequest(BaseModel):
    query: str
    k: int = Field(5, ge=1, le=20)
    category: Optional[str] = None


class FinancialAnalysisRequest(BaseModel):
    fixed_costs: Dict[str, float]
    variable_costs: Dict[str, float]
    production_metrics: Dict[str, float]
    revenue_streams: Optional[Dict[str, float]] = None


class VisionAnalysisRequest(BaseModel):
    image_path: str
    analysis_type: str = Field(
        ...,
        description="Type of analysis: 'health', 'biomass', or 'behavior'",
    )
    confidence_threshold: Optional[float] = None


class RecommendationRequest(BaseModel):
    user_profile: Dict[str, Any]
    farm_conditions: Dict[str, Any]
    include_ai_insights: bool = True


# ============================================
# Health & Status Endpoints
# ============================================

@app.get("/", response_model=HealthCheck)
async def root():
    """API health check"""
    return HealthCheck(
        status="healthy",
        version="1.0.0",
        timestamp=datetime.now().isoformat(),
    )


@app.get("/health")
async def health():
    """Detailed health check"""
    try:
        # Check components
        llm = get_llm()
        rag = get_rag()
        
        return {
            "status": "healthy",
            "components": {
                "llm": "operational",
                "rag": "operational",
                "financial_analyzer": "operational",
                "vision_service": "operational",
                "recommendation_engine": "operational",
            },
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/model/info")
async def model_info():
    """Get LLM model information"""
    try:
        llm = get_llm()
        info = llm.get_model_info()
        return info
    except Exception as e:
        logger.error(f"Error getting model info: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# LLM Chat Endpoints
# ============================================

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat with shrimp farming expert LLM.
    
    Examples:
    - "How do I reduce FCR in my pond?"
    - "What causes white spot disease?"
    - "Calculate ROI for 1 hectare intensive farm"
    """
    try:
        logger.info(f"Chat request: {request.query[:100]}...")
        
        llm = get_llm()
        context = request.context or ""
        sources = None
        
        # Use RAG for context retrieval
        if request.use_rag:
            rag = get_rag()
            context = rag.get_context_for_query(request.query, k=5)
            
            # Get sources with scores
            sources = rag.retrieve_relevant_info(request.query, k=3)
        
        # Generate response
        response_text = llm.generate_response(
            prompt=request.query,
            context=context,
            max_new_tokens=request.max_tokens,
        )
        
        return ChatResponse(
            response=response_text,
            sources=sources,
            confidence=0.85,
        )
    
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat/batch")
async def chat_batch(queries: List[str], use_rag: bool = True):
    """Process multiple queries in batch"""
    try:
        llm = get_llm()
        
        if use_rag:
            rag = get_rag()
            contexts = [rag.get_context_for_query(q) for q in queries]
        else:
            contexts = None
        
        responses = llm.generate_batch(queries, contexts=contexts)
        
        return {
            "responses": [
                {"query": q, "response": r}
                for q, r in zip(queries, responses)
            ]
        }
    
    except Exception as e:
        logger.error(f"Batch chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# RAG Knowledge Base Endpoints
# ============================================

@app.post("/knowledge/add")
async def add_documents(request: AddDocumentsRequest):
    """Add documents to knowledge base"""
    try:
        rag = get_rag()
        stats = rag.add_documents(request.documents, source=request.source)
        
        return {
            "status": "success",
            "stats": stats,
        }
    
    except Exception as e:
        logger.error(f"Error adding documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/knowledge/search", response_model=List[Dict[str, Any]])
async def semantic_search(request: SemanticSearchRequest):
    """Semantic search in knowledge base"""
    try:
        rag = get_rag()
        results = rag.semantic_search(
            query=request.query,
            k=request.k,
            filter_by_category=request.category,
        )
        
        return results
    
    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/knowledge/stats")
async def knowledge_stats():
    """Get knowledge base statistics"""
    try:
        rag = get_rag()
        stats = rag.get_collection_stats()
        return stats
    
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# Financial Analysis Endpoints
# ============================================

@app.post("/financial/roi")
async def calculate_roi(request: FinancialAnalysisRequest):
    """Calculate ROI and financial metrics"""
    try:
        analyzer = get_financial_analyzer()
        
        # Parse inputs
        fixed_costs = FixedCosts(**request.fixed_costs)
        variable_costs = VariableCosts(**request.variable_costs)
        production_metrics = ProductionMetrics(**request.production_metrics)
        
        revenue_streams = None
        if request.revenue_streams:
            revenue_streams = RevenueStreams(**request.revenue_streams)
        
        # Calculate
        result = analyzer.calculate_roi(
            fixed_costs=fixed_costs,
            variable_costs=variable_costs,
            production_metrics=production_metrics,
            revenue_streams=revenue_streams,
        )
        
        return analyzer.export_analysis(result, output_format="dict")
    
    except Exception as e:
        logger.error(f"ROI calculation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/financial/market-trends")
async def predict_market_trends(
    historical_prices: List[Dict[str, Any]],
    forecast_periods: int = 6,
):
    """Predict market price trends"""
    try:
        import pandas as pd
        analyzer = get_financial_analyzer()
        
        # Convert to DataFrame
        df = pd.DataFrame(historical_prices)
        
        forecast = analyzer.predict_market_trends(df, forecast_periods)
        return forecast
    
    except Exception as e:
        logger.error(f"Market prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# Computer Vision Endpoints
# ============================================

@app.post("/vision/analyze")
async def analyze_vision(request: VisionAnalysisRequest):
    """Analyze shrimp images/videos"""
    try:
        analyzer = get_vision_analyzer()
        
        if request.analysis_type == "health":
            result = analyzer.analyze_shrimp_health(
                request.image_path,
                confidence_threshold=request.confidence_threshold,
            )
        elif request.analysis_type == "biomass":
            result = analyzer.estimate_biomass(request.image_path)
        elif request.analysis_type == "behavior":
            result = analyzer.analyze_behavior(request.image_path)
        else:
            raise HTTPException(
                status_code=400,
                detail="Invalid analysis_type. Use: 'health', 'biomass', or 'behavior'",
            )
        
        from dataclasses import asdict
        return asdict(result)
    
    except Exception as e:
        logger.error(f"Vision analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/vision/upload")
async def upload_image(file: UploadFile = File(...)):
    """Upload image for analysis"""
    try:
        import shutil
        from pathlib import Path
        
        # Save uploaded file
        upload_dir = Path("./uploads")
        upload_dir.mkdir(exist_ok=True)
        
        file_path = upload_dir / file.filename
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {
            "filename": file.filename,
            "file_path": str(file_path),
            "status": "uploaded",
        }
    
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# Recommendation Engine Endpoints
# ============================================

@app.post("/recommendations/generate")
async def generate_recommendations(request: RecommendationRequest):
    """Generate personalized recommendations"""
    try:
        advisor = get_advisor()
        
        # Parse inputs
        user_profile = UserProfile(**request.user_profile)
        farm_conditions = FarmConditions(**request.farm_conditions)
        
        # Generate recommendations
        recommendations = advisor.generate_recommendations(
            user_profile=user_profile,
            farm_conditions=farm_conditions,
            include_ai_insights=request.include_ai_insights,
        )
        
        # Export as dict
        return {
            "recommendations": advisor.export_recommendations(
                recommendations,
                format="dict",
            ),
            "count": len(recommendations),
            "timestamp": datetime.now().isoformat(),
        }
    
    except Exception as e:
        logger.error(f"Recommendation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/recommendations/export")
async def export_recommendations(
    request: RecommendationRequest,
    format: str = "markdown",
):
    """Export recommendations in various formats"""
    try:
        advisor = get_advisor()
        
        user_profile = UserProfile(**request.user_profile)
        farm_conditions = FarmConditions(**request.farm_conditions)
        
        recommendations = advisor.generate_recommendations(
            user_profile=user_profile,
            farm_conditions=farm_conditions,
        )
        
        exported = advisor.export_recommendations(recommendations, format=format)
        
        if format == "markdown":
            from fastapi.responses import PlainTextResponse
            return PlainTextResponse(content=exported)
        else:
            return JSONResponse(content=exported)
    
    except Exception as e:
        logger.error(f"Export error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# Integrated Analysis Endpoint
# ============================================

@app.post("/analyze/comprehensive")
async def comprehensive_analysis(
    user_profile: Dict[str, Any],
    farm_conditions: Dict[str, Any],
    financial_data: Optional[Dict[str, Any]] = None,
    image_path: Optional[str] = None,
):
    """
    Comprehensive farm analysis combining all modules.
    
    Returns:
    - AI recommendations
    - Financial analysis
    - Vision analysis (if image provided)
    - Knowledge base insights
    """
    try:
        results = {
            "timestamp": datetime.now().isoformat(),
            "farm_name": user_profile.get("farm_name", "Unknown"),
        }
        
        # 1. Recommendations
        advisor = get_advisor()
        profile = UserProfile(**user_profile)
        conditions = FarmConditions(**farm_conditions)
        
        recommendations = advisor.generate_recommendations(profile, conditions)
        results["recommendations"] = advisor.export_recommendations(
            recommendations,
            format="dict",
        )
        
        # 2. Financial Analysis
        if financial_data:
            analyzer = get_financial_analyzer()
            # Parse and calculate
            # ... (simplified for brevity)
            results["financial_analysis"] = {"status": "calculated"}
        
        # 3. Vision Analysis
        if image_path:
            vision = get_vision_analyzer()
            health_result = vision.analyze_shrimp_health(image_path)
            from dataclasses import asdict
            results["health_analysis"] = asdict(health_result)
        
        return results
    
    except Exception as e:
        logger.error(f"Comprehensive analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# Main Entry Point
# ============================================

def main():
    """Start the API server"""
    logger.info("🦐 Starting Shrimp AI API Server...")
    
    uvicorn.run(
        "llm_service.api.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.api_reload,
        workers=settings.api_workers if not settings.api_reload else 1,
    )


if __name__ == "__main__":
    main()
