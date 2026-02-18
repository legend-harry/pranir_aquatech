#!/bin/bash
# ==================================================
# 🦐 Shrimp AI - Quick Start Script
# Automated setup and initialization
# ==================================================

set -e  # Exit on error

echo "🦐 Starting Shrimp AI Quick Setup..."
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Python version
echo -e "${YELLOW}Checking Python version...${NC}"
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "Python version: $python_version"

# Create virtual environment
echo -e "${YELLOW}Creating virtual environment...${NC}"
python3 -m venv venv

# Activate virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source venv/bin/activate

# Upgrade pip
echo -e "${YELLOW}Upgrading pip...${NC}"
pip install --upgrade pip

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
pip install -r requirements.txt

# Create necessary directories
echo -e "${YELLOW}Creating directory structure...${NC}"
mkdir -p llm_service/models
mkdir -p rag_system/knowledge_db
mkdir -p vision_service/models
mkdir -p training_data/text_corpus
mkdir -p training_data/image_datasets
mkdir -p logs
mkdir -p uploads

# Copy environment file
echo -e "${YELLOW}Setting up environment variables...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}Created .env file. Please edit it with your configurations.${NC}"
else
    echo -e "${YELLOW}.env file already exists. Skipping...${NC}"
fi

# Prepare training data
echo -e "${YELLOW}Preparing training dataset...${NC}"
python training_data/prepare_dataset.py

# Initialize RAG database
echo -e "${YELLOW}Initializing RAG knowledge base...${NC}"
echo "Note: Add your documents to training_data/text_corpus/ and run this script again"

# Check for Docker
echo -e "${YELLOW}Checking Docker installation...${NC}"
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker is installed${NC}"
    
    echo -e "${YELLOW}Would you like to start services with Docker? (y/n)${NC}"
    read -r start_docker
    
    if [ "$start_docker" = "y" ]; then
        echo -e "${YELLOW}Starting Docker services...${NC}"
        docker-compose up -d
        echo -e "${GREEN}✓ Services started!${NC}"
        echo "Access API documentation at: http://localhost:8000/docs"
    fi
else
    echo -e "${YELLOW}Docker not found. You can start services manually:${NC}"
    echo "python -m uvicorn llm_service.api.main:app --reload"
fi

echo ""
echo -e "${GREEN}===================================="
echo "✅ Setup Complete!"
echo "====================================${NC}"
echo ""
echo "Next steps:"
echo "1. Activate virtual environment: source venv/bin/activate"
echo "2. Edit .env file with your configurations"
echo "3. Start API server: python -m uvicorn llm_service.api.main:app --reload"
echo "4. Access API docs: http://localhost:8000/docs"
echo ""
echo "For Next.js integration, see: integration/README.md"
echo ""
echo "🦐 Happy Farming! 🦐"
