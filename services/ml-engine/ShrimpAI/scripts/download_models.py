"""
🦐 Shrimp AI - Model Download Script
Downloads the base model for fine-tuning.
"""

import os
from pathlib import Path
from transformers import AutoModelForCausalLM, AutoTokenizer
from loguru import logger
import sys

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from llm_service.config import get_settings


def download_base_model():
    """Download base LLM model"""
    settings = get_settings()
    
    logger.info(f"Downloading base model: {settings.llm_model_name}")
    logger.info(f"This may take several minutes...")
    
    # Create models directory
    models_dir = Path(settings.llm_model_path).parent
    models_dir.mkdir(parents=True, exist_ok=True)
    
    try:
        # Download tokenizer
        logger.info("Downloading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(
            settings.llm_model_name,
            trust_remote_code=True,
        )
        
        # Download model (smaller download with quantization disabled)
        logger.info("Downloading model (this will take a while)...")
        model = AutoModelForCausalLM.from_pretrained(
            settings.llm_model_name,
            trust_remote_code=True,
            low_cpu_mem_usage=True,
        )
        
        # Save to cache
        logger.info("Model downloaded successfully!")
        logger.info(f"Model cached in HuggingFace cache directory")
        
        # Get model size
        param_count = sum(p.numel() for p in model.parameters())
        logger.info(f"Model parameters: {param_count / 1e9:.2f}B")
        
        logger.info("✅ Model download complete!")
        
        return True
        
    except Exception as e:
        logger.error(f"Error downloading model: {e}")
        logger.error("Please check your internet connection and try again")
        return False


def list_available_models():
    """List recommended models"""
    models = {
        "microsoft/phi-2": "2.7B params - Lightweight, fast, good for development (Recommended)",
        "meta-llama/Llama-3.2-3B": "3B params - Very capable, good balance",
        "mistralai/Mistral-7B-v0.1": "7B params - Powerful, requires more memory",
    }
    
    print("\n📋 Recommended Models:\n")
    for model_name, description in models.items():
        print(f"  • {model_name}")
        print(f"    {description}\n")
    
    print("To use a different model, update LLM_MODEL_NAME in .env file\n")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Download Shrimp AI base model")
    parser.add_argument('--list', action='store_true', help='List available models')
    
    args = parser.parse_args()
    
    if args.list:
        list_available_models()
    else:
        success = download_base_model()
        
        if success:
            print("\n✅ Success! You can now train your model:")
            print("   python llm_service/training/train_lora.py")
        else:
            print("\n❌ Download failed. Please check the logs above.")
            sys.exit(1)
