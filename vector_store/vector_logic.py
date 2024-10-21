import qdrant_client
from qdrant_client.http import models as qdrant_models
from transformers import pipeline
from sklearn.metrics.pairwise import cosine_similarity
import os
import uuid


client = qdrant_client.QdrantClient(host='qdrant', port='6333')
reranker_model = pipeline("text-classification", model="bert-base-uncased")

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
def add_resume(resume_id: str, embeddings: dict, metadata: dict):
    points = []
    for section, vector in embeddings.items():
        points.append(qdrant_models.PointStruct(
            id=f"{resume_id}_{section}",
            vector=vector,
            payload={**metadata, "section": section}
        ))

    client.upsert(
        collection_name="ResumeCollection",
        points=qdrant_models.Batch.construct(points=points)
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
def rerank_results(job_description, resume_results):
    reranked = []
    for result in resume_results:
        resume_id = result.id
        resume_text = result.payload.get('full_text', '')  # Assume full_text is stored
        relevance_score = reranker_model(job_description, resume_text)[0]['score']
        reranked.append((resume_id, relevance_score))
    
    return sorted(reranked, key=lambda x: x[1], reverse=True)

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
def add_job(job_id: str, embeddings: dict, metadata: dict):
    points = []
    ids = []
    vectors = []

    for section, vector in embeddings.items():
        point_id = str(uuid.uuid4())  # Generate a unique UUID for each section
        ids.append(point_id)  # Add the point ID to the list of IDs
        vectors.append(vector)  # Append the vector to the list of vectors

        # Each point payload must be a dictionary of metadata
        points.append({
            "section": section,
            **metadata  # Merge metadata into payload
        })

    # Upsert the job data into the collection with the IDs and vectors
    client.upsert(
        collection_name="JobCollection",
        points=qdrant_models.Batch(
            ids=ids,
            vectors=vectors,  # Pass the vectors (embeddings) separately
            payloads=points  # Pass the payload separately
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
