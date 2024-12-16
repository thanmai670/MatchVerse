# Architecture Overview

## Introduction
This document provides a high-level overview of the architecture for the Job Matching System. The system is designed to efficiently match job listings with resumes using a microservices architecture, leveraging machine learning models for embedding generation and vector similarity searches.

## Components

### 1. **Job Fetcher Service**
- **Purpose**: Continuously fetches job listings from various job portals.
- **Technology**: Node.js, Express
- **Endpoints**: 
  - `/fetch`: Fetch new jobs from portals.

### 2. **Embedding API Service**
- **Purpose**: Converts job descriptions and resumes into vector embeddings using Sentence Transformers.
- **Technology**: Python, FastAPI, Sentence Transformers
- **Endpoints**:
  - `/api/embed`: Accepts a job or resume and returns embeddings.
  - `/api/batch-embed`: Batch process for embeddings.

### 3. **Vector Store Service**
- **Purpose**: Stores and retrieves job and resume embeddings using Qdrant vector database for efficient searching.
- **Technology**: Python, FastAPI, Qdrant
- **Endpoints**:
  - `/job/add`: Add job embeddings to the vector store.
  - `/resume/add`: Add resume embeddings to the vector store.
  - `/job/search`: Search for jobs using resume embeddings.
  - `/resume/search`: Search for resumes using job embeddings.

### 4. **Matching Engine Service**
- **Purpose**: Matches jobs and resumes based on vector similarity and additional criteria.
- **Technology**: Node.js, Express
- **Endpoints**: 
  - Utilizes internal logic to perform matching and publish results.

### 5. **Notification Service**
- **Purpose**: Sends email notifications for job matches to users.
- **Technology**: Node.js, Express, Nodemailer
- **Endpoints**: 
  - Listens to match results and sends notifications.

### 6. **API Gateway**
- **Purpose**: Acts as a single entry point for all services, routing requests to the appropriate service.
- **Technology**: Node.js, Express, http-proxy-middleware

### 7. **Redis**
- **Purpose**: Used for inter-service communication and message brokering.
- **Technology**: Redis

### 8. **Qdrant**
- **Purpose**: Vector database used for storing and querying embeddings.
- **Technology**: Qdrant

### 9. **Vector Store**
- **Purpose**: Manages the storage and retrieval of vector embeddings for jobs and resumes.
- **Technology**: Python, FastAPI
- **Endpoints**:
  - `/resume/add`: Add resume embeddings.
  - `/resume/update`: Update resume embeddings.
  - `/resume/delete`: Delete resume embeddings.
  - `/resume/search`: Search resumes based on embeddings.
  - `/job/add`: Add job embeddings.
  - `/job/update`: Update job embeddings.
  - `/job/delete`: Delete job embeddings.
  - `/job/search`: Search jobs based on embeddings.

## Communication
- **Inter-service Communication**: Services communicate via Redis channels for publishing and subscribing to messages.
- **Data Flow**: 
  - Job Fetcher Service fetches jobs and sends them to the Embedding API Service.
  - Embedding API Service generates embeddings and stores them in the Vector Store.
  - Matching Engine Service retrieves embeddings, performs matching, and publishes results.
  - Notification Service listens for match results and sends notifications.

## Deployment
- **Containerization**: All services are containerized using Docker.
- **Orchestration**: Docker Compose is used to manage multi-container applications.

## Tech Stack
- **Languages**: Python, TypeScript
- **Frameworks**: FastAPI, Flask, Node.js
- **Machine Learning**: Sentence Transformers (BERT-based models)
- **Database**: Qdrant (Vector database)
- **Infrastructure**: Docker, Kubernetes
- **Communication**: Redis for queue-based inter-service communication

## Conclusion
The Job Matching System is designed to be scalable and efficient, leveraging modern technologies and a microservices architecture to provide high-performance job matching capabilities. 

</```rewritten_file>