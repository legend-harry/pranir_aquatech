# 🚀 Getting Started with Shrimp AI

A step-by-step guide to set up and run your custom shrimp farming LLM system.

## 📋 Prerequisites

Before you begin, ensure you have:

- **Python 3.10+** installed
- **8GB+ RAM** (16GB recommended)
- **20GB+ free disk space**
- **GPU (optional)** - CUDA-compatible GPU for faster inference
- **Docker** (optional) - For containerized deployment
- **Git** - For version control

## 🛠️ Installation

### Option 1: Automated Quick Start (Recommended)

```bash
# Make the script executable
chmod +x scripts/quick_start.sh

# Run the quick start script
./scripts/quick_start.sh
```

That's it! The script will:
- Create virtual environment
- Install dependencies
- Set up directory structure
- Prepare training data
- Optionally start Docker services

---

### Option 2: Manual Installation

#### Step 1: Clone and Setup

```bash
cd /Users/divyeshmedidi/ShrimpAI

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
# OR
venv\Scripts\activate  # On Windows

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

#### Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your settings
nano .env  # or use your preferred editor
```

**Important settings to configure:**

```env
# Choose your device (cuda/mps/cpu)
LLM_DEVICE=mps  # Use 'mps' for Apple Silicon, 'cuda' for NVIDIA GPU, 'cpu' otherwise

# Set model path
LLM_MODEL_NAME=microsoft/phi-2

# Enable/disable features
ENABLE_VISION_SERVICE=true
ENABLE_RAG_SYSTEM=true
```

#### Step 3: Download Base Model

```bash
# View available models
python scripts/download_models.py --list

# Download the default model (phi-2)
python scripts/download_models.py
```

#### Step 4: Prepare Training Data

```bash
# Generate initial training dataset
python training_data/prepare_dataset.py
```

This creates a domain-specific dataset with shrimp farming knowledge.

---

## 🎯 Running the Services

### Development Mode (Single Service)

```bash
# Start the main API server
python -m uvicorn llm_service.api.main:app --reload --port 8000

# Access API documentation
open http://localhost:8000/docs
```

### Production Mode (Docker Compose)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Services will be available at:**
- Main API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- ChromaDB: http://localhost:8001
- Vision API: http://localhost:8002
- Grafana: http://localhost:3001

---

## 🧪 Testing Your Installation

### Test 1: Health Check

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "components": {
    "llm": "operational",
    "rag": "operational",
    ...
  }
}
```

### Test 2: Chat with LLM

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How do I reduce FCR in my shrimp pond?",
    "use_rag": true
  }'
```

### Test 3: Python Client

Create a test file `test_api.py`:

```python
import asyncio
from llm_service.core.llm_engine import get_llm
from rag_system.knowledge_base import get_rag

async def test():
    # Test LLM
    llm = get_llm()
    response = llm.generate_response("What causes white spot disease?")
    print(f"LLM Response: {response}")
    
    # Test RAG
    rag = get_rag()
    stats = rag.get_collection_stats()
    print(f"RAG Stats: {stats}")

asyncio.run(test())
```

Run it:
```bash
python test_api.py
```

---

## 📚 Adding Knowledge to RAG System

### Method 1: Python Script

```python
from rag_system.knowledge_base import get_rag

rag = get_rag()

# Add documents
documents = [
    {
        "content": "White spot disease is caused by WSSV virus...",
        "metadata": {"category": "disease", "source": "manual"}
    },
    {
        "content": "Optimal pH for shrimp is 7.5-8.5...",
        "metadata": {"category": "water_quality", "source": "manual"}
    }
]

stats = rag.add_documents(documents, source="my_knowledge")
print(f"Added {stats['chunks_added']} chunks")
```

### Method 2: Add Text Files

```python
from rag_system.knowledge_base import get_rag

rag = get_rag()

# Add all text files from a directory
import glob

files = glob.glob("./training_data/text_corpus/*.txt")
stats = rag.add_text_files(files)
print(f"Processed {stats['total_input']} files")
```

---

## 🎓 Training Your Custom Model

### Step 1: Prepare More Training Data

Add your custom examples to `training_data/prepare_dataset.py`:

```python
training_examples.append({
    "instruction": "Your custom question",
    "context": "Optional context",
    "response": "Expert answer from your experience"
})
```

### Step 2: Run Training (Coming Soon)

```bash
# Fine-tune with LoRA
python llm_service/training/train_lora.py \
  --dataset ./training_data/shrimp_corpus \
  --output ./llm_service/models/my-custom-model \
  --epochs 3
```

---

## 🔌 Integrating with Next.js

See detailed guide: [integration/README.md](integration/README.md)

**Quick summary:**

1. Install client library (copy from integration guide)
2. Set environment variables in Next.js:
   ```env
   NEXT_PUBLIC_SHRIMP_AI_URL=http://localhost:8000
   ```
3. Use in components:
   ```typescript
   import { getShrimpLLMClient } from '@/lib/shrimp-llm-client';
   
   const llm = getShrimpLLMClient();
   const response = await llm.chat({ query: "..." });
   ```

---

## 📊 Monitoring & Observability

### View Logs

```bash
# Docker logs
docker-compose logs -f llm-service

# Local logs
tail -f logs/shrimp_ai.log
```

### Metrics (Prometheus)

Access Prometheus: http://localhost:9090

Query examples:
- `api_requests_total` - Total API requests
- `llm_inference_duration_seconds` - LLM response time

### Grafana Dashboards

Access Grafana: http://localhost:3001
- Username: `admin`
- Password: `admin123` (change in `docker-compose.yml`)

---

## 🐛 Troubleshooting

### Issue: "Out of Memory" error

**Solution:**
```env
# In .env, enable 4-bit quantization
LLM_USE_4BIT=true

# Or use smaller model
LLM_MODEL_NAME=microsoft/phi-2
```

### Issue: Slow inference

**Solutions:**
1. Use GPU if available: `LLM_DEVICE=cuda`
2. Reduce max tokens: `LLM_MAX_LENGTH=1024`
3. Enable caching (Redis)
4. Use quantization

### Issue: ChromaDB connection refused

**Solution:**
```bash
# Restart ChromaDB
docker-compose restart chromadb

# Or clear and reinitialize
rm -rf rag_system/knowledge_db/*
docker-compose up -d chromadb
```

### Issue: CUDA out of memory (GPU)

**Solutions:**
1. Enable 4-bit quantization: `LLM_USE_4BIT=true`
2. Reduce batch size
3. Use gradient checkpointing during training
4. Switch to CPU: `LLM_DEVICE=cpu`

---

## 📖 Next Steps

1. ✅ **Set up and test** - Complete this guide
2. 📝 **Add domain knowledge** - Build your RAG database
3. 🎓 **Train custom model** - Fine-tune with your data
4. 🔌 **Integrate with frontend** - Connect to Next.js
5. 🚀 **Deploy to production** - Use Docker Compose
6. 📊 **Monitor performance** - Use Grafana dashboards
7. 🔄 **Iterate and improve** - Collect feedback, retrain

---

## 📚 Additional Resources

- [API Documentation](http://localhost:8000/docs)
- [Integration Guide](integration/README.md)
- [Training Guide](docs/TRAINING.md) (Coming soon)
- [Deployment Guide](docs/DEPLOYMENT.md) (Coming soon)

---

## 🆘 Getting Help

- **Check logs:** `logs/shrimp_ai.log`
- **Review API docs:** http://localhost:8000/docs
- **Test endpoints:** Use Swagger UI
- **GitHub Issues:** Report bugs and request features

---

## 🎉 Success!

You should now have:
- ✅ Shrimp AI services running
- ✅ LLM responding to queries
- ✅ RAG system operational
- ✅ API endpoints accessible
- ✅ Ready for Next.js integration

**Happy farming! 🦐**
