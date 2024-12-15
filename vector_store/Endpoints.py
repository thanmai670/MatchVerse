import logging
import traceback
from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from vector_logic import (
    add_resume, update_resume, delete_resume, search_resumes, create_resume_collection,
    add_job, update_job, delete_job, search_jobs, create_job_collection,weighted_search,task_based_search,fuzzy_search
)

class JobData(BaseModel):
    job_id: str
    ids: List[str]
    vectors: List[List[float]]
    payloads: List[Dict[str, Any]]# Metadata about the job (e.g., title, company, location, etc.)

class JobSearchRequest(BaseModel):
    query_embedding: list  # The embedding for the search query
    section: str  # Section to search (e.g., skills, responsibilities, etc.)
    top_k: int = 10  # Number of results to return

router = APIRouter()

# Data models for requests
class ResumeData(BaseModel):
    resume_id: str
    ids: List[str]
    vectors: List[List[float]]
    payloads: List[Dict[str, Any]]

class SearchRequest(BaseModel):
    query_embedding: list  # The embedding for the search query
    section: str  # Section to search (skills, experience, etc.)
    top_k: int = 10  # Number of results to return

class RerankRequest(BaseModel):
    job_description: str  # The job description to rerank against
    resume_results: list  # List of resume search results from the search endpoint

class WeightedSearchRequest(BaseModel):
    job_embedding: dict  # Embeddings for the job sections (skills, experience, etc.)
    resume_embeddings: dict  # Resume embeddings (skills, experience, etc.)
    weights: dict  # Weighting for each section (e.g., {"skills": 0.7, "experience": 0.3})

class TaskBasedSearchRequest(BaseModel):
    job_tasks: dict  # Task embeddings (e.g., {"leadership": [0.44, 0.55, 0.66]})
    resume_embeddings: dict  # Embeddings of the resume sections (e.g., {"experience": [0.22, 0.85, 0.47]})

class FuzzySearchRequest(BaseModel):
    query_embedding: list  # The embedding for the search query
    collection_name: str  # The collection to search in
    top_k: int = 10  # Number of results to return
    threshold: float = 0.8  # Similarity threshold for filtering results




# Endpoint to initialize collection
@router.post("/collection/create")
async def initialize_collection():
    try:
        create_resume_collection()
        return {"message": "ResumeCollection created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint to add a resume
@router.post("/resume/add")
async def add_resume_endpoint(resume_data: ResumeData):
    try:
        add_resume(
            resume_id=resume_data.resume_id,
            ids=resume_data.ids,
            vectors=resume_data.vectors,
            payloads=resume_data.payloads
        )
        return {"message": f"Resume {resume_data.resume_id} added successfully"}
    except Exception as e:
        logging.error(f"Error adding resume: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"An error occurred while adding the resume: {str(e)}")

# Endpoint to update a resume section
@router.put("/resume/update/{resume_id}/{section}")
async def update_resume_endpoint(resume_id: str, section: str, new_vector: list):
    try:
        update_resume(resume_id, section, new_vector)
        return {"message": f"Resume {resume_id} section {section} updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint to delete a resume
@router.delete("/resume/delete/{resume_id}")
async def delete_resume_endpoint(resume_id: str):
    try:
        delete_resume(resume_id)
        return {"message": f"Resume {resume_id} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint to search resumes
@router.post("/resume/search")
async def search_resume_endpoint(search_request: SearchRequest):
    try:
        results = search_resumes(search_request.query_embedding, search_request.section, search_request.top_k)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint for reranking search results using BERT/T5
# @router.post("/resume/rerank")
# async def rerank_results_endpoint(rerank_request: RerankRequest):
#     try:
#         reranked = rerank_results(rerank_request.job_description, rerank_request.resume_results)
#         return {"reranked_results": reranked}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


# Endpoint for weighted search
@router.post("/resume/weighted_search")
async def weighted_search_endpoint(weighted_search_request: WeightedSearchRequest):
    try:
        weighted_result = weighted_search(
            weighted_search_request.job_embedding,
            weighted_search_request.resume_embeddings,
            weighted_search_request.weights
        )
        return {"weighted_score": weighted_result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint for task-based search
@router.post("/resume/task_based_search")
async def task_based_search_endpoint(task_based_search_request: TaskBasedSearchRequest):
    try:
        task_result = task_based_search(
            task_based_search_request.job_tasks,
            task_based_search_request.resume_embeddings
        )
        return {"task_search_results": task_result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint to initialize job collection
@router.post("/job/collection/create")
async def initialize_job_collection():
    try:
        create_job_collection()
        return {"message": "JobCollection created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint to add a job
@router.post("/job/add")
async def add_job_endpoint(job_data: JobData):
    try:
        add_job(
            job_id=job_data.job_id,
            ids=job_data.ids,
            vectors=job_data.vectors,
            payloads=job_data.payloads
        )
        return {"message": f"Job {job_data.job_id} added successfully"}
    except Exception as e:
        logging.error(f"Error adding job: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="An error occurred while adding the job to the vector store")


# Endpoint to update a job section
@router.put("/job/update/{job_id}/{section}")
async def update_job_endpoint(job_id: str, section: str, new_vector: list):
    try:
        update_job(job_id, section, new_vector)
        return {"message": f"Job {job_id} section {section} updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint to delete a job
@router.delete("/job/delete/{job_id}")
async def delete_job_endpoint(job_id: str):
    try:
        delete_job(job_id)
        return {"message": f"Job {job_id} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint to search jobs
@router.post("/job/search")
async def search_job_endpoint(job_search_request: JobSearchRequest):
    try:
        results = search_jobs(job_search_request.query_embedding, job_search_request.section, job_search_request.top_k)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint for fuzzy search
@router.post("/fuzzy_search")
async def fuzzy_search_endpoint(fuzzy_search_request: FuzzySearchRequest):
    try:
        results = fuzzy_search(
            fuzzy_search_request.query_embedding,
            fuzzy_search_request.collection_name,
            fuzzy_search_request.top_k,
            fuzzy_search_request.threshold
        )
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))