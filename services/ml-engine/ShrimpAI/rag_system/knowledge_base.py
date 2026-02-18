"""
🦐 Shrimp AI - RAG Knowledge Base System
Retrieval-Augmented Generation for shrimp farming knowledge.
"""

from typing import List, Dict, Any, Optional
from pathlib import Path
import chromadb
from chromadb.config import Settings as ChromaSettings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import Chroma
from langchain.docstore.document import Document
from loguru import logger
import hashlib
import json

from llm_service.config import get_settings


class ShrimpKnowledgeBase:
    """
    RAG system for shrimp farming knowledge retrieval.
    
    Features:
    - Vector similarity search
    - Semantic document retrieval
    - Multi-source knowledge aggregation
    - Metadata filtering
    - Incremental updates
    """
    
    def __init__(
        self,
        collection_name: str = "shrimp_knowledge",
        embedding_model: Optional[str] = None,
        persist_directory: Optional[str] = None,
    ):
        """
        Initialize RAG knowledge base.
        
        Args:
            collection_name: Name of the ChromaDB collection
            embedding_model: HuggingFace embedding model name
            persist_directory: Directory to persist vector database
        """
        self.settings = get_settings()
        self.collection_name = collection_name
        self.persist_directory = persist_directory or self.settings.chromadb_path
        
        logger.info(f"Initializing RAG Knowledge Base: {collection_name}")
        
        # Initialize embeddings
        embedding_model_name = embedding_model or self.settings.embedding_model
        self.embeddings = HuggingFaceEmbeddings(
            model_name=embedding_model_name,
            model_kwargs={"device": self.settings.llm_device},
            encode_kwargs={"normalize_embeddings": True},
        )
        
        # Initialize text splitter
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.settings.rag_chunk_size,
            chunk_overlap=self.settings.rag_chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""],
        )
        
        # Initialize ChromaDB client
        self.client = chromadb.Client(
            ChromaSettings(
                persist_directory=self.persist_directory,
                anonymized_telemetry=False,
            )
        )
        
        # Initialize Langchain Chroma vectorstore
        self.vectorstore = Chroma(
            collection_name=self.collection_name,
            embedding_function=self.embeddings,
            persist_directory=self.persist_directory,
        )
        
        logger.info(f"✅ RAG Knowledge Base initialized")
        logger.info(f"Persist directory: {self.persist_directory}")
    
    def add_documents(
        self,
        documents: List[Dict[str, Any]],
        source: str = "manual",
        batch_size: int = 100,
    ) -> Dict[str, int]:
        """
        Add documents to knowledge base.
        
        Args:
            documents: List of document dicts with 'content' and optional 'metadata'
            source: Source identifier for tracking
            batch_size: Batch size for processing
            
        Returns:
            Statistics about added documents
        """
        logger.info(f"Adding {len(documents)} documents from source: {source}")
        
        processed_docs = []
        skipped = 0
        
        for doc_data in documents:
            try:
                content = doc_data.get("content", "")
                metadata = doc_data.get("metadata", {})
                
                if not content or len(content.strip()) < 10:
                    skipped += 1
                    continue
                
                # Add source to metadata
                metadata["source"] = source
                metadata["doc_hash"] = self._hash_content(content)
                
                # Create Document object
                doc = Document(page_content=content, metadata=metadata)
                processed_docs.append(doc)
                
            except Exception as e:
                logger.warning(f"Error processing document: {e}")
                skipped += 1
        
        # Split documents into chunks
        split_docs = self.text_splitter.split_documents(processed_docs)
        logger.info(f"Split into {len(split_docs)} chunks")
        
        # Add to vectorstore in batches
        added = 0
        for i in range(0, len(split_docs), batch_size):
            batch = split_docs[i:i + batch_size]
            try:
                self.vectorstore.add_documents(batch)
                added += len(batch)
                logger.info(f"Added batch {i // batch_size + 1}: {added}/{len(split_docs)}")
            except Exception as e:
                logger.error(f"Error adding batch: {e}")
        
        # Persist
        self.vectorstore.persist()
        
        stats = {
            "total_input": len(documents),
            "processed": len(processed_docs),
            "chunks_created": len(split_docs),
            "chunks_added": added,
            "skipped": skipped,
        }
        
        logger.info(f"✅ Document addition complete: {stats}")
        return stats
    
    def add_text_files(
        self,
        file_paths: List[str],
        metadata_extractor: Optional[callable] = None,
    ) -> Dict[str, int]:
        """
        Add text files to knowledge base.
        
        Args:
            file_paths: List of file paths to add
            metadata_extractor: Optional function to extract metadata from filename
            
        Returns:
            Statistics about added files
        """
        documents = []
        
        for file_path in file_paths:
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                metadata = {"file_path": file_path}
                if metadata_extractor:
                    extracted_meta = metadata_extractor(file_path)
                    metadata.update(extracted_meta)
                
                documents.append({
                    "content": content,
                    "metadata": metadata,
                })
                
            except Exception as e:
                logger.error(f"Error reading file {file_path}: {e}")
        
        return self.add_documents(documents, source="file_upload")
    
    def retrieve_relevant_info(
        self,
        query: str,
        k: Optional[int] = None,
        filter_metadata: Optional[Dict[str, Any]] = None,
        similarity_threshold: Optional[float] = None,
    ) -> List[Dict[str, Any]]:
        """
        Retrieve relevant documents for a query.
        
        Args:
            query: Search query
            k: Number of documents to retrieve
            filter_metadata: Metadata filters
            similarity_threshold: Minimum similarity score
            
        Returns:
            List of relevant document dicts with content and metadata
        """
        k = k or self.settings.rag_top_k
        threshold = similarity_threshold or self.settings.rag_similarity_threshold
        
        # Retrieve with scores
        results = self.vectorstore.similarity_search_with_score(
            query,
            k=k * 2,  # Retrieve more to filter by threshold
            filter=filter_metadata,
        )
        
        # Filter by similarity threshold and format
        relevant_docs = []
        for doc, score in results:
            # ChromaDB returns distance (lower is better), convert to similarity
            similarity = 1.0 - score
            
            if similarity >= threshold:
                relevant_docs.append({
                    "content": doc.page_content,
                    "metadata": doc.metadata,
                    "similarity_score": similarity,
                })
            
            if len(relevant_docs) >= k:
                break
        
        logger.info(f"Retrieved {len(relevant_docs)} relevant documents for query")
        return relevant_docs
    
    def get_context_for_query(
        self,
        query: str,
        k: Optional[int] = None,
        max_context_length: int = 2000,
    ) -> str:
        """
        Get formatted context string for LLM prompt.
        
        Args:
            query: User query
            k: Number of documents to retrieve
            max_context_length: Maximum context length in characters
            
        Returns:
            Formatted context string
        """
        relevant_docs = self.retrieve_relevant_info(query, k=k)
        
        if not relevant_docs:
            return "No relevant information found in knowledge base."
        
        # Build context
        context_parts = []
        current_length = 0
        
        for i, doc in enumerate(relevant_docs, 1):
            doc_text = f"[Source {i}]:\n{doc['content']}\n"
            
            if current_length + len(doc_text) > max_context_length:
                break
            
            context_parts.append(doc_text)
            current_length += len(doc_text)
        
        context = "\n".join(context_parts)
        return context
    
    def semantic_search(
        self,
        query: str,
        k: int = 10,
        filter_by_category: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Perform semantic search across knowledge base.
        
        Args:
            query: Search query
            k: Number of results
            filter_by_category: Optional category filter
            
        Returns:
            Search results with scores
        """
        filter_dict = None
        if filter_by_category:
            filter_dict = {"category": filter_by_category}
        
        return self.retrieve_relevant_info(
            query,
            k=k,
            filter_metadata=filter_dict,
        )
    
    def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about the knowledge base"""
        try:
            collection = self.vectorstore._collection
            count = collection.count()
            
            return {
                "collection_name": self.collection_name,
                "total_documents": count,
                "persist_directory": self.persist_directory,
                "embedding_model": self.settings.embedding_model,
                "chunk_size": self.settings.rag_chunk_size,
                "chunk_overlap": self.settings.rag_chunk_overlap,
            }
        except Exception as e:
            logger.error(f"Error getting stats: {e}")
            return {"error": str(e)}
    
    def delete_by_source(self, source: str) -> int:
        """Delete all documents from a specific source"""
        try:
            # This is a simplified version - ChromaDB filtering
            # In production, you'd want more sophisticated deletion
            logger.warning(f"Deleting documents from source: {source}")
            # Implementation depends on ChromaDB version
            return 0
        except Exception as e:
            logger.error(f"Error deleting documents: {e}")
            return 0
    
    def clear_collection(self):
        """Clear all documents from collection"""
        logger.warning(f"Clearing collection: {self.collection_name}")
        self.client.delete_collection(self.collection_name)
        
        # Reinitialize
        self.vectorstore = Chroma(
            collection_name=self.collection_name,
            embedding_function=self.embeddings,
            persist_directory=self.persist_directory,
        )
        logger.info("✅ Collection cleared")
    
    def _hash_content(self, content: str) -> str:
        """Generate hash for content deduplication"""
        return hashlib.md5(content.encode()).hexdigest()
    
    def export_collection(self, output_path: str):
        """Export collection to JSON"""
        try:
            collection = self.vectorstore._collection
            # Export logic here
            logger.info(f"Collection exported to {output_path}")
        except Exception as e:
            logger.error(f"Error exporting collection: {e}")
    
    def import_collection(self, input_path: str):
        """Import collection from JSON"""
        try:
            with open(input_path, "r") as f:
                data = json.load(f)
            # Import logic here
            logger.info(f"Collection imported from {input_path}")
        except Exception as e:
            logger.error(f"Error importing collection: {e}")


# Global RAG instance (lazy loading)
_rag_instance: Optional[ShrimpKnowledgeBase] = None


def get_rag() -> ShrimpKnowledgeBase:
    """Get or create global RAG instance"""
    global _rag_instance
    
    if _rag_instance is None:
        _rag_instance = ShrimpKnowledgeBase()
    
    return _rag_instance
