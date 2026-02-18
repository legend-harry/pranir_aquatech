# 🔌 Integration Guide: Shrimp AI ↔ Pranir-AquaTech

Complete guide to integrate the custom LLM system with your Next.js application.

## Overview

This guide will help you:
1. Replace Google Genkit/Gemini with custom Shrimp AI LLM
2. Integrate new AI capabilities into existing fishfarm module
3. Set up API client for Next.js
4. Migrate existing AI flows
5. Deploy and test the integration

---

## 📋 Prerequisites

- Next.js app running (Pranir-AquaTech)
- Shrimp AI services deployed (Docker or local)
- Environment variables configured
- API endpoint accessible

---

## Step 1: Create TypeScript Client Library

Create a new file: `/lib/shrimp-llm-client.ts`

```typescript
/**
 * Shrimp AI LLM Client
 * TypeScript client for custom shrimp farming LLM
 */

export interface ChatRequest {
  query: string;
  context?: string;
  use_rag?: boolean;
  max_tokens?: number;
}

export interface ChatResponse {
  response: string;
  sources?: Array<{
    content: string;
    metadata: Record<string, any>;
    similarity_score: number;
  }>;
  confidence: number;
}

export interface FinancialAnalysisRequest {
  fixed_costs: Record<string, number>;
  variable_costs: Record<string, number>;
  production_metrics: {
    pond_area: number;
    stocking_density: number;
    average_body_weight: number;
    survival_rate: number;
    feed_conversion_ratio: number;
    culture_period: number;
    market_price_per_kg: number;
  };
  revenue_streams?: Record<string, number>;
}

export interface VisionAnalysisRequest {
  image_path: string;
  analysis_type: 'health' | 'biomass' | 'behavior';
  confidence_threshold?: number;
}

export interface RecommendationRequest {
  user_profile: {
    user_id: string;
    farm_name: string;
    experience_level: string;
    farm_size_hectares: number;
    num_ponds: number;
    farming_system: string;
    budget?: Record<string, number>;
    risk_tolerance?: string;
    target_yield?: number;
  };
  farm_conditions: {
    ph?: number;
    dissolved_oxygen?: number;
    temperature?: number;
    salinity?: number;
    ammonia?: number;
    growth_rate?: number;
    survival_rate?: number;
    fcr?: number;
    feed_cost?: number;
    disease_present?: boolean;
  };
  include_ai_insights?: boolean;
}

export class ShrimpLLMClient {
  private baseURL: string;
  private apiKey?: string;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_SHRIMP_AI_URL || 'http://localhost:8000', apiKey?: string) {
    this.baseURL = baseURL.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey || process.env.SHRIMP_AI_API_KEY;
  }

  private async request<T>(
    endpoint: string,
    method: string = 'GET',
    body?: any
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `API Error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Chat with the shrimp farming expert LLM
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    return this.request<ChatResponse>('/chat', 'POST', request);
  }

  /**
   * Generate spending insights (replaces Genkit flow)
   */
  async generateInsights(spendingData: Array<{
    date: string;
    category: string;
    amount: number;
  }>): Promise<string> {
    // Format spending data as context
    const context = spendingData
      .map(item => `${item.date}: ${item.category} - $${item.amount}`)
      .join('\n');

    const response = await this.chat({
      query: 'Analyze this spending data and provide actionable insights for cost optimization:',
      context,
      use_rag: true,
    });

    return response.response;
  }

  /**
   * Import and categorize transactions (replaces Genkit flow)
   */
  async importAndCategorize(rawTransactions: string): Promise<Array<{
    title: string;
    amount: number;
    category: string;
    confidence: number;
    vendor?: string;
    date?: string;
  }>> {
    const response = await this.chat({
      query: `Parse and categorize these transactions:\n\n${rawTransactions}`,
      use_rag: false,
    });

    // Parse LLM response into structured format
    // This is simplified - you may need custom parsing logic
    try {
      const parsed = JSON.parse(response.response);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // Fallback if not JSON
      return [];
    }
  }

  /**
   * Calculate ROI and financial metrics
   */
  async calculateROI(request: FinancialAnalysisRequest): Promise<any> {
    return this.request('/financial/roi', 'POST', request);
  }

  /**
   * Analyze shrimp health from image
   */
  async analyzeHealth(imagePath: string): Promise<any> {
    return this.request('/vision/analyze', 'POST', {
      image_path: imagePath,
      analysis_type: 'health',
    });
  }

  /**
   * Estimate biomass from image
   */
  async estimateBiomass(imagePath: string): Promise<any> {
    return this.request('/vision/analyze', 'POST', {
      image_path: imagePath,
      analysis_type: 'biomass',
    });
  }

  /**
   * Generate personalized recommendations
   */
  async getRecommendations(request: RecommendationRequest): Promise<any> {
    return this.request('/recommendations/generate', 'POST', request);
  }

  /**
   * Upload image for analysis
   */
  async uploadImage(file: File): Promise<{ file_path: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}/vision/upload`, {
      method: 'POST',
      body: formData,
      headers: this.apiKey ? { 'X-API-Key': this.apiKey } : {},
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Search knowledge base
   */
  async searchKnowledge(query: string, k: number = 5): Promise<Array<any>> {
    return this.request('/knowledge/search', 'POST', { query, k });
  }

  /**
   * Health check
   */
  async health(): Promise<{ status: string }> {
    return this.request('/health');
  }
}

// Singleton instance
let clientInstance: ShrimpLLMClient | null = null;

export function getShrimpLLMClient(): ShrimpLLMClient {
  if (!clientInstance) {
    clientInstance = new ShrimpLLMClient();
  }
  return clientInstance;
}
```

---

## Step 2: Environment Variables

Add to `.env.local`:

```env
# Shrimp AI Custom LLM
NEXT_PUBLIC_SHRIMP_AI_URL=http://localhost:8000
SHRIMP_AI_API_KEY=your-api-key-here

# Optional: Feature flags
NEXT_PUBLIC_USE_CUSTOM_LLM=true
NEXT_PUBLIC_ENABLE_VISION_ANALYSIS=true
```

---

## Step 3: Migrate Existing AI Flows

### Before (Google Genkit):

```typescript
// Old code using Genkit
import { generateInsights } from '@/ai/gemini-flows';

const insights = await generateInsights(spendingData);
```

### After (Custom LLM):

```typescript
// New code using custom LLM
import { getShrimpLLMClient } from '@/lib/shrimp-llm-client';

const llm = getShrimpLLMClient();
const insights = await llm.generateInsights(spendingData);
```

---

## Step 4: Integrate with Fishfarm Module

### Update Dashboard Component

File: `/modules/fishfarm/components/Dashboard.tsx`

```typescript
import { getShrimpLLMClient } from '@/lib/shrimp-llm-client';
import { useState, useEffect } from 'react';

export function FishfarmDashboard() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const llm = getShrimpLLMClient();

  // Fetch AI recommendations
  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const result = await llm.getRecommendations({
        user_profile: {
          user_id: 'user-123',
          farm_name: 'My Farm',
          experience_level: 'intermediate',
          farm_size_hectares: 2.5,
          num_ponds: 5,
          farming_system: 'semi-intensive',
        },
        farm_conditions: {
          ph: 7.8,
          dissolved_oxygen: 5.2,
          temperature: 29,
          ammonia: 0.4,
          fcr: 1.6,
          survival_rate: 78,
        },
        include_ai_insights: true,
      });

      setRecommendations(result.recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return (
    <div>
      <h2>AI Recommendations</h2>
      {loading ? (
        <p>Loading recommendations...</p>
      ) : (
        <ul>
          {recommendations.map((rec, index) => (
            <li key={index}>
              <strong>{rec.priority}:</strong> {rec.action}
              <p>{rec.reason}</p>
            </li>
          ))}
        </ul>
      )}
      <button onClick={fetchRecommendations}>Refresh</button>
    </div>
  );
}
```

---

## Step 5: Add ROI Calculator

File: `/modules/fishfarm/components/ROICalculator.tsx`

```typescript
import { getShrimpLLMClient } from '@/lib/shrimp-llm-client';
import { useState } from 'react';

export function ROICalculator() {
  const [result, setResult] = useState<any>(null);
  const llm = getShrimpLLMClient();

  const calculateROI = async (formData: any) => {
    try {
      const result = await llm.calculateROI({
        fixed_costs: {
          pond_lease: formData.pondLease,
          equipment: formData.equipment,
          infrastructure: formData.infrastructure,
        },
        variable_costs: {
          postlarvae: formData.postlarvae,
          feed: formData.feed,
          labor: formData.labor,
          electricity: formData.electricity,
        },
        production_metrics: {
          pond_area: formData.pondArea,
          stocking_density: formData.stockingDensity,
          average_body_weight: formData.avgBodyWeight,
          survival_rate: formData.survivalRate,
          feed_conversion_ratio: formData.fcr,
          culture_period: formData.culturePeriod,
          market_price_per_kg: formData.marketPrice,
        },
      });

      setResult(result);
    } catch (error) {
      console.error('ROI calculation error:', error);
    }
  };

  return (
    <div>
      {/* Form inputs */}
      {result && (
        <div>
          <h3>ROI Analysis Results</h3>
          <p>ROI: {result.roi_percentage.toFixed(2)}%</p>
          <p>Net Profit: ${result.net_profit.toFixed(2)}</p>
          <p>Break-even Price: ${result.break_even_price.toFixed(2)}/kg</p>
          
          <h4>Recommendations:</h4>
          <ul>
            {result.recommendations?.map((rec: string, i: number) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

---

## Step 6: Add Health Analysis with Image Upload

File: `/modules/fishfarm/components/HealthAnalyzer.tsx`

```typescript
import { getShrimpLLMClient } from '@/lib/shrimp-llm-client';
import { useState } from 'react';

export function HealthAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const llm = getShrimpLLMClient();

  const analyzeImage = async () => {
    if (!file) return;

    setLoading(true);
    try {
      // Upload image
      const uploadResult = await llm.uploadImage(file);
      
      // Analyze health
      const analysis = await llm.analyzeHealth(uploadResult.file_path);
      
      setResult(analysis);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Shrimp Health Analysis</h3>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={analyzeImage} disabled={!file || loading}>
        {loading ? 'Analyzing...' : 'Analyze Image'}
      </button>

      {result && (
        <div>
          <h4>Health Score: {result.health_score}/100</h4>
          <p>Severity: {result.severity}</p>
          
          {result.diseases_detected.length > 0 && (
            <div>
              <h5>Diseases Detected:</h5>
              <ul>
                {result.diseases_detected.map((disease: string, i: number) => (
                  <li key={i}>{disease}</li>
                ))}
              </ul>
            </div>
          )}

          <h5>Recommendations:</h5>
          <ul>
            {result.recommendations.map((rec: string, i: number) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

---

## Step 7: Create Server-Side API Routes

File: `/app/api/ai/chat/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { ShrimpLLMClient } from '@/lib/shrimp-llm-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const llm = new ShrimpLLMClient(
      process.env.SHRIMP_AI_URL,
      process.env.SHRIMP_AI_API_KEY
    );

    const response = await llm.chat(body);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
```

---

## Step 8: Add Custom Hook

File: `/hooks/useShrimpAI.ts`

```typescript
import { useState, useCallback } from 'react';
import { getShrimpLLMClient } from '@/lib/shrimp-llm-client';
import { useToast } from '@/hooks/use-toast';

export function useShrimpAI() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const llm = getShrimpLLMClient();

  const chat = useCallback(async (query: string, context?: string) => {
    setLoading(true);
    try {
      const response = await llm.chat({ query, context, use_rag: true });
      return response.response;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get AI response',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [llm, toast]);

  const getRecommendations = useCallback(async (
    userProfile: any,
    farmConditions: any
  ) => {
    setLoading(true);
    try {
      return await llm.getRecommendations({
        user_profile: userProfile,
        farm_conditions: farmConditions,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate recommendations',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [llm, toast]);

  return {
    chat,
    getRecommendations,
    loading,
    llm,
  };
}
```

---

## Step 9: Testing

### Test Connection:

```typescript
// Test in browser console or component
import { getShrimpLLMClient } from '@/lib/shrimp-llm-client';

const llm = getShrimpLLMClient();

// Test health endpoint
llm.health().then(console.log);

// Test chat
llm.chat({
  query: 'What causes white spot disease?',
  use_rag: true,
}).then(console.log);
```

---

## Step 10: Deployment Checklist

- [ ] Start Shrimp AI services (Docker Compose)
- [ ] Verify API endpoint accessible
- [ ] Update environment variables in Next.js
- [ ] Test all API endpoints
- [ ] Deploy Next.js app
- [ ] Monitor error logs
- [ ] Set up analytics/monitoring

---

## 🔐 Security Considerations

1. **API Key Management:**
   - Never expose API keys in client-side code
   - Use server-side API routes for sensitive operations

2. **Rate Limiting:**
   - Implement rate limiting in Next.js middleware
   - Use Nginx rate limiting on backend

3. **Input Validation:**
   - Validate all inputs before sending to API
   - Sanitize user-uploaded images

---

## 📊 Monitoring

Add monitoring for:
- API response times
- Error rates
- LLM inference latency
- Vision analysis success rate

---

## 🚀 Next Steps

1. Fine-tune LLM with your farm's historical data
2. Train custom vision models with annotated shrimp images
3. Expand knowledge base with domain-specific documents
4. Implement caching for frequently asked questions
5. Add A/B testing to compare with Google Gemini

---

## 🆘 Troubleshooting

### Common Issues:

**1. Connection refused:**
- Ensure Shrimp AI services are running
- Check CORS settings
- Verify network connectivity

**2. Slow responses:**
- Enable caching (Redis)
- Reduce max_tokens
- Use lighter model (phi-2 vs Mistral-7B)

**3. Out of memory:**
- Enable 4-bit quantization
- Reduce batch size
- Use CPU instead of GPU for small loads

---

## 📚 Additional Resources

- [API Documentation](http://localhost:8000/docs)
- [Training Guide](../docs/TRAINING.md)
- [Deployment Guide](../docs/DEPLOYMENT.md)

---

**Integration Complete! 🎉**

You now have a fully integrated custom LLM system replacing Google Genkit in your Pranir-AquaTech application.
