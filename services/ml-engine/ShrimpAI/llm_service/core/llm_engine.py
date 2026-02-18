"""
🦐 Shrimp AI - Core LLM Engine
Fine-tuned language model with LoRA/QLoRA for shrimp farming expertise.
"""

import torch
from typing import Optional, Dict, Any, List
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    GenerationConfig,
)
from peft import LoraConfig, get_peft_model, PeftModel
from loguru import logger
import os

from llm_service.config import get_settings


class ShrimpFarmingLLM:
    """
    Custom LLM for shrimp farming with domain-specific fine-tuning.
    
    Features:
    - 4-bit quantization for efficiency
    - LoRA fine-tuning for domain adaptation
    - Context-aware generation
    - Batch processing support
    """
    
    def __init__(
        self,
        model_name: Optional[str] = None,
        model_path: Optional[str] = None,
        device: Optional[str] = None,
        load_in_4bit: bool = True,
    ):
        """
        Initialize the Shrimp Farming LLM.
        
        Args:
            model_name: HuggingFace model name (default from config)
            model_path: Path to fine-tuned model (default from config)
            device: Device to use (cuda/cpu/mps)
            load_in_4bit: Enable 4-bit quantization
        """
        self.settings = get_settings()
        self.model_name = model_name or self.settings.llm_model_name
        self.model_path = model_path or self.settings.llm_model_path
        self.device = device or self.settings.llm_device
        self.load_in_4bit = load_in_4bit and self.settings.llm_use_4bit
        
        logger.info(f"Initializing Shrimp Farming LLM: {self.model_name}")
        logger.info(f"Device: {self.device}, 4-bit: {self.load_in_4bit}")
        
        # Initialize tokenizer
        self.tokenizer = self._load_tokenizer()
        
        # Initialize model
        self.model = self._load_model()
        
        # Generation config
        self.generation_config = GenerationConfig(
            max_new_tokens=self.settings.llm_max_length,
            temperature=self.settings.llm_temperature,
            top_p=self.settings.llm_top_p,
            top_k=self.settings.llm_top_k,
            do_sample=True,
            repetition_penalty=1.1,
            pad_token_id=self.tokenizer.pad_token_id,
            eos_token_id=self.tokenizer.eos_token_id,
        )
        
        logger.info("✅ Shrimp Farming LLM initialized successfully")
    
    def _load_tokenizer(self) -> AutoTokenizer:
        """Load and configure tokenizer"""
        logger.info("Loading tokenizer...")
        
        tokenizer = AutoTokenizer.from_pretrained(
            self.model_name,
            trust_remote_code=True,
            padding_side="left",
        )
        
        # Ensure pad token is set
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
            tokenizer.pad_token_id = tokenizer.eos_token_id
        
        return tokenizer
    
    def _load_model(self) -> AutoModelForCausalLM:
        """Load base model with optional quantization and LoRA"""
        logger.info("Loading base model...")
        
        # Configure quantization
        quantization_config = None
        if self.load_in_4bit:
            quantization_config = BitsAndBytesConfig(
                load_in_4bit=True,
                bnb_4bit_compute_dtype=torch.float16,
                bnb_4bit_use_double_quant=True,
                bnb_4bit_quant_type="nf4",
            )
        
        # Load base model
        model = AutoModelForCausalLM.from_pretrained(
            self.model_name,
            quantization_config=quantization_config,
            device_map="auto" if self.device == "cuda" else None,
            trust_remote_code=True,
            torch_dtype=torch.float16 if self.device != "cpu" else torch.float32,
        )
        
        # Move to device if not using device_map
        if self.device != "cuda":
            model = model.to(self.device)
        
        # Load fine-tuned LoRA weights if available
        if os.path.exists(self.model_path):
            logger.info(f"Loading fine-tuned LoRA weights from {self.model_path}")
            try:
                model = PeftModel.from_pretrained(model, self.model_path)
                logger.info("✅ Fine-tuned weights loaded successfully")
            except Exception as e:
                logger.warning(f"Could not load fine-tuned weights: {e}")
                logger.info("Using base model without fine-tuning")
        else:
            logger.warning(f"Fine-tuned model not found at {self.model_path}")
            logger.info("Using base model without fine-tuning")
        
        # Set to evaluation mode
        model.eval()
        
        return model
    
    def prepare_for_training(self) -> AutoModelForCausalLM:
        """
        Prepare model for LoRA fine-tuning.
        
        Returns:
            Model with LoRA adapters attached
        """
        logger.info("Preparing model for LoRA fine-tuning...")
        
        # LoRA configuration
        lora_config = LoraConfig(
            r=self.settings.lora_r,
            lora_alpha=self.settings.lora_alpha,
            target_modules=self.settings.lora_target_modules_list,
            lora_dropout=self.settings.lora_dropout,
            bias="none",
            task_type="CAUSAL_LM",
        )
        
        # Apply LoRA
        peft_model = get_peft_model(self.model, lora_config)
        peft_model.print_trainable_parameters()
        
        return peft_model
    
    def generate_response(
        self,
        prompt: str,
        context: str = "",
        system_prompt: Optional[str] = None,
        max_new_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        **kwargs,
    ) -> str:
        """
        Generate response for a given prompt.
        
        Args:
            prompt: User query
            context: Additional context (e.g., from RAG)
            system_prompt: Optional system prompt override
            max_new_tokens: Override default max tokens
            temperature: Override default temperature
            **kwargs: Additional generation parameters
            
        Returns:
            Generated response text
        """
        # Build full prompt
        full_prompt = self._build_prompt(prompt, context, system_prompt)
        
        # Tokenize
        inputs = self.tokenizer(
            full_prompt,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=self.settings.llm_max_length,
        ).to(self.model.device)
        
        # Override generation config if needed
        gen_config = self.generation_config
        if max_new_tokens is not None:
            gen_config.max_new_tokens = max_new_tokens
        if temperature is not None:
            gen_config.temperature = temperature
        
        # Update with any additional kwargs
        for key, value in kwargs.items():
            setattr(gen_config, key, value)
        
        # Generate
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                generation_config=gen_config,
            )
        
        # Decode
        generated_text = self.tokenizer.decode(
            outputs[0],
            skip_special_tokens=True,
        )
        
        # Extract only the response (remove prompt)
        response = self._extract_response(generated_text, full_prompt)
        
        return response
    
    def generate_batch(
        self,
        prompts: List[str],
        contexts: Optional[List[str]] = None,
        **kwargs,
    ) -> List[str]:
        """
        Generate responses for multiple prompts (batch processing).
        
        Args:
            prompts: List of user queries
            contexts: Optional list of contexts
            **kwargs: Generation parameters
            
        Returns:
            List of generated responses
        """
        if contexts is None:
            contexts = [""] * len(prompts)
        
        # Build all prompts
        full_prompts = [
            self._build_prompt(prompt, context)
            for prompt, context in zip(prompts, contexts)
        ]
        
        # Tokenize batch
        inputs = self.tokenizer(
            full_prompts,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=self.settings.llm_max_length,
        ).to(self.model.device)
        
        # Generate
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                generation_config=self.generation_config,
                **kwargs,
            )
        
        # Decode all responses
        responses = []
        for i, output in enumerate(outputs):
            generated_text = self.tokenizer.decode(output, skip_special_tokens=True)
            response = self._extract_response(generated_text, full_prompts[i])
            responses.append(response)
        
        return responses
    
    def _build_prompt(
        self,
        prompt: str,
        context: str = "",
        system_prompt: Optional[str] = None,
    ) -> str:
        """Build formatted prompt with system message and context"""
        
        if system_prompt is None:
            system_prompt = """You are an expert AI assistant specializing in shrimp farming and aquaculture management. 
You provide accurate, actionable advice on:
- Water quality management
- Disease prevention and treatment
- Feed optimization and FCR improvement
- Financial planning and ROI analysis
- Pond design and infrastructure
- Regulatory compliance and best practices

Provide clear, practical recommendations with scientific backing."""
        
        # Format prompt
        full_prompt = f"""### System:
{system_prompt}

### Context:
{context if context else "No additional context provided."}

### User Query:
{prompt}

### Expert Response:
"""
        
        return full_prompt
    
    def _extract_response(self, generated_text: str, prompt: str) -> str:
        """Extract only the generated response, removing the prompt"""
        # Remove the prompt from the beginning
        if generated_text.startswith(prompt):
            response = generated_text[len(prompt):].strip()
        else:
            # Fallback: try to find the response after "Expert Response:"
            marker = "### Expert Response:"
            if marker in generated_text:
                response = generated_text.split(marker)[-1].strip()
            else:
                response = generated_text.strip()
        
        return response
    
    def get_embeddings(self, texts: List[str]) -> torch.Tensor:
        """
        Get embeddings for texts (useful for similarity search).
        
        Args:
            texts: List of texts to embed
            
        Returns:
            Tensor of embeddings
        """
        inputs = self.tokenizer(
            texts,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=512,
        ).to(self.model.device)
        
        with torch.no_grad():
            outputs = self.model(**inputs, output_hidden_states=True)
            # Use last hidden state mean pooling
            embeddings = outputs.hidden_states[-1].mean(dim=1)
        
        return embeddings
    
    def calculate_perplexity(self, text: str) -> float:
        """
        Calculate perplexity of text (useful for evaluation).
        
        Args:
            text: Text to evaluate
            
        Returns:
            Perplexity score
        """
        inputs = self.tokenizer(text, return_tensors="pt").to(self.model.device)
        
        with torch.no_grad():
            outputs = self.model(**inputs, labels=inputs["input_ids"])
            loss = outputs.loss
            perplexity = torch.exp(loss).item()
        
        return perplexity
    
    def save_model(self, output_path: str):
        """Save fine-tuned model to disk"""
        logger.info(f"Saving model to {output_path}")
        self.model.save_pretrained(output_path)
        self.tokenizer.save_pretrained(output_path)
        logger.info("✅ Model saved successfully")
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get model information and statistics"""
        return {
            "model_name": self.model_name,
            "model_path": self.model_path,
            "device": self.device,
            "quantization": "4-bit" if self.load_in_4bit else "None",
            "parameters": sum(p.numel() for p in self.model.parameters()),
            "trainable_parameters": sum(
                p.numel() for p in self.model.parameters() if p.requires_grad
            ),
            "max_length": self.settings.llm_max_length,
            "temperature": self.settings.llm_temperature,
        }


# Global LLM instance (lazy loading)
_llm_instance: Optional[ShrimpFarmingLLM] = None


def get_llm() -> ShrimpFarmingLLM:
    """Get or create global LLM instance"""
    global _llm_instance
    
    if _llm_instance is None:
        _llm_instance = ShrimpFarmingLLM()
    
    return _llm_instance
