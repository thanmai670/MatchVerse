# Job Matching System

[www.match-verse.com]



https://github.com/user-attachments/assets/89d95819-f92d-42cc-961a-846aedd23061



This project implements a comprehensive job matching system using microservices. The system monitors job portals, analyzes resumes, finds relevant job matches, and notifies users about matching jobs. The architecture leverages an LLM-based embedding API, vector stores, and microservices for high-performance and scalable matching.

## Features

- **Job Fetcher Service**: Continuously fetches job listings from portals like LinkedIn, Indeed, and Monster.
- **Embedding API Service**: Converts job descriptions and resumes into vector embeddings using Sentence Transformers.
- **Vector Store Service**: Stores and retrieves job and resume embeddings using Qdrant vector database for efficient searching.
- **Resume Analyzer**: Analyzes and tokenizes resumes into sections for better matching.
- **Matching Engine**: Matches jobs and resumes based on vector similarity.
- **Notification Service**: Notifies users via email when relevant job matches are found.

## Tech Stack

- **Language**: Python, TypeScript
- **Frameworks**: FastAPI, Flask, Node.js
- **Machine Learning**: Sentence Transformers (BERT-based models)
- **Database**: Qdrant (Vector database)
- **Infrastructure**: Docker, Kubernetes
- **Communication**: Redis for queue-based inter-service communication

## Microservices Overview

### 1. **Job Fetcher Service**
Fetches jobs from job portals and sends them to the Embedding API.

- **Endpoints**:
  - `/fetch`: Fetch new jobs from portals.
  
### 2. **Embedding API Service**
Processes jobs and resumes, converts them to embeddings, and communicates with the vector store.

- **Endpoints**:
  - `/api/embed`: Accepts a job or resume and returns embeddings.
  - `/api/batch-embed`: Batch process for embeddings.

### 3. **Vector Store Service**
Handles CRUD operations for job and resume embeddings in the Qdrant vector database.

- **Endpoints**:
  - `/job/add`: Add job embeddings to the vector store.
  - `/resume/add`: Add resume embeddings to the vector store.
  - `/job/search`: Search for jobs using resume embeddings.
  - `/resume/search`: Search for resumes using job embeddings.

### 4. **Matching Engine**
Matches resumes with jobs based on embedding similarity and returns top matches.

### 5. **Notification Service**
Sends email notifications for job matches to users.

## How to Run

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/JobMatchingSystem.git
   cd JobMatchingSystem

2. Build and run with Docker Compose:
    ```bash
    docker-compose up --build -d
    ```
3. Access the services:
    - Embedding API: http://localhost:5500
    - Vector Store: http://localhost:5200
    - Job Fetcher: http://localhost:3001
    - Check logs to ensure all services are running and communicating properly.

## File Structure

```bash

JobMatchingSystem/
│
├── job-fetcher-service/      # Service to fetch jobs from portals
├── embedding-api-service/    # Embedding API using Sentence Transformers
├── vector-store-service/     # Vector store service using Qdrant
├── matching-engine-service/  # Engine to match jobs and resumes
├── notification-service/     # Service to notify users of job matches
└── docker-compose.yml        # Docker Compose configuration for all services

```

- By Thanmai Bindiganavale Krishna Prasad
