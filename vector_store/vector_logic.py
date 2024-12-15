import logging
from typing import Any, Dict, List
import qdrant_client
from qdrant_client.http import models as qdrant_models
from transformers import pipeline
from sklearn.metrics.pairwise import cosine_similarity
import os
import uuid


client = qdrant_client.QdrantClient(host='qdrant', port='6333')
# reranker_model = pipeline("text-classification", model="bert-base-uncased")

# 1. Create Collection (to be called during system initialization)
def create_resume_collection():
    client.recreate_collection(
        collection_name="ResumeCollection",
        vectors_config=qdrant_models.VectorParams(
            size=768,  # Adjust the size to match your embedding dimensions
            distance=qdrant_models.Distance.COSINE
        )
    )

# 2. Add Resume
def add_resume(resume_id: str, ids: List[str], vectors: List[List[float]], payloads: List[Dict[str, Any]]):
    if not vectors:
        logging.error(f"No valid embeddings to add for resume: {resume_id}")
        return
    formatted_ids = [str(uuid.UUID(id_str)) for id_str in ids]

    client.upsert(
        collection_name="ResumeCollection",
        points=qdrant_models.Batch(
            ids=formatted_ids,
            vectors=vectors,
            payloads=payloads
        )
    )


# 3. Search Resumes
def search_resumes(query_embedding, section: str, top_k: int = 10, metadata_filters: dict = None):
    filters = []
    
    # Add metadata filters if any
    if metadata_filters:
        for key, value in metadata_filters.items():
            filters.append(qdrant_models.FieldCondition(
                key=key,
                match=qdrant_models.MatchValue(value=value)
            ))

    filters.append(qdrant_models.FieldCondition(
        key="section",
        match=qdrant_models.MatchValue(value=section)
    ))

    query_filter = qdrant_models.Filter(must=filters) if filters else None

    # Perform the search with the filter
    results = client.search(
        collection_name="ResumeCollection",
        query_vector=query_embedding,
        limit=top_k,
        query_filter=query_filter
    )
    return results

# 4. Update Resume
def update_resume(resume_id: str, section: str, new_vector):
    client.upsert(
        collection_name="ResumeCollection",
        points=[qdrant_models.PointStruct(
            id=resume_id + "_" + section,
            vector=new_vector,
            payload={"section": section}
        )]
    )

# 5. Delete Resume
def delete_resume(resume_id: str):
    point_ids = [f"{resume_id}_skills", f"{resume_id}_experience", f"{resume_id}_education"]
    client.delete(
        collection_name="ResumeCollection",
        points_selector=qdrant_models.PointIdsList(point_ids=point_ids)
    )

# 6. Rerank Search Results using BERT/T5 (after initial cosine similarity search)
# def rerank_results(job_description, resume_results):
#     reranked = []
#     for result in resume_results:
#         resume_id = result.id
#         resume_text = result.payload.get('full_text', '')  # Assume full_text is stored
#         relevance_score = reranker_model(job_description, resume_text)[0]['score']
#         reranked.append((resume_id, relevance_score))
    
    # return sorted(reranked, key=lambda x: x[1], reverse=True)

# 7. Weighted Search (use different weights for different resume sections)
def weighted_search(job_embedding, resume_embeddings, weights):
    weighted_score = 0.0
    for section, embedding in resume_embeddings.items():
        section_score = cosine_similarity([job_embedding[section]], [embedding])[0][0]
        weighted_score += section_score * weights.get(section, 1.0)
    
    return weighted_score

# 8. Task-based Search (specific tasks like leadership or project management)
def task_based_search(job_tasks, resume_embeddings):
    task_scores = {}
    for task, task_embedding in job_tasks.items():
        task_scores[task] = search_resumes(task_embedding, "experience")  # Focus on experience section
    return task_scores

# 9. Fuzzy Search (find similar items based on vector similarity)
def fuzzy_search(query_embedding, collection_name: str, top_k: int = 10, threshold: float = 0.8):
    # Perform the search
    results = client.search(
        collection_name=collection_name,
        query_vector=query_embedding,
        limit=top_k
    )
    
    # Filter results based on a similarity threshold
    filtered_results = [result for result in results if result.score >= threshold]
    
    return filtered_results


################################ JOBS SECTION #############################################

# Create or update a collection for jobs
def create_job_collection():
    client.recreate_collection(
        collection_name="JobCollection",
        vectors_config=qdrant_models.VectorParams(
            size=768,  # Adjust the size based on the embedding dimensions
            distance=qdrant_models.Distance.COSINE
        )
    )

# Add a job to the collection
def add_job(job_id: str, ids: List[str], vectors: List[List[float]], payloads: List[Dict[str, Any]]):
    if not vectors:
        logging.error(f"No valid embeddings to add for job: {job_id}")
        return
    formatted_ids = [str(uuid.UUID(id_str)) for id_str in ids]
    client.upsert(
        collection_name="JobCollection",
        points=qdrant_models.Batch(
            ids=formatted_ids,
            vectors=vectors,
            payloads=payloads
        )
    )

# Search for jobs based on query embedding
def search_jobs(query_embedding, section: str, top_k: int = 10, metadata_filters: dict = None):
    filters = []
    
    # Add filters based on metadata
    if metadata_filters:
        for key, value in metadata_filters.items():
            filters.append(qdrant_models.FieldCondition(
                key=key,
                match=qdrant_models.MatchValue(value=value)
            ))

    # Filter by job section
    filters.append(qdrant_models.FieldCondition(
        key="section",
        match=qdrant_models.MatchValue(value=section)
    ))

    query_filter = qdrant_models.Filter(must=filters) if filters else None

    # Perform the search
    results = client.search(
        collection_name="JobCollection",
        query_vector=query_embedding,
        limit=top_k,
        query_filter=query_filter
    )
    return results

# Update a job in the collection
def update_job(job_id: str, section: str, new_vector):
    client.upsert(
        collection_name="JobCollection",
        points=[qdrant_models.PointStruct(
            id=f"{job_id}_{section}",
            vector=new_vector,
            payload={"section": section}
        )]
    )

# Delete a job from the collection
def delete_job(job_id: str):
    point_ids = [f"{job_id}_required_skills", f"{job_id}_responsibilities", f"{job_id}_preferred_qualifications"]
    client.delete(
        collection_name="JobCollection",
        points_selector=qdrant_models.PointIdsList(point_ids=point_ids)
    )
