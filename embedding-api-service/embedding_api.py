import logging
import os
import sys
import traceback
import uuid
import torch
import flask
from flask import request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer

device = 'cuda' if torch.cuda.is_available() else 'cpu'
embd = SentenceTransformer('all-mpnet-base-v2', device=device)
# logging.basicConfig(level=logging.DEBUG)

app = flask.Flask(__name__)
CORS(app)

main_batch_size = os.environ.get("BATCH_SIZE", "16")
main_batch_size = int(main_batch_size) if main_batch_size else 16


def dynamic_batch_encode(model, sentences, initial_batch_size, min_batch_size=1):
    batch_size = initial_batch_size
    embeddings = []
    i = 0

    while i < len(sentences):
        try:
            batch_embeddings = model.encode(sentences[i:i + batch_size], batch_size=batch_size)
            embeddings.extend(batch_embeddings.tolist())
            i += batch_size
        except RuntimeError as e:
            if 'CUDA out of memory' in str(e):
                print(f"CUDA OOM error with batch size {batch_size}, reducing...", file=sys.stderr)
                torch.cuda.empty_cache()
                batch_size = max(min_batch_size, batch_size // 2)
            else:
                raise e
        except Exception:
            embeddings.extend([embed_single_text(im) for im in sentences[i:i + batch_size]])

    return embeddings


import requests  # Add this import to make HTTP requests to the vector store

@app.route("/api/embed", methods=["POST"])
def get_embeddings():
    data = request.get_json()
    
    # Extract sections and entity type (job or resume) from the request
    entity_type = data.get("entity_type")
    sections = data.get("sections", {})
    metadata = data.get("metadata", {})
    
    if not entity_type or not sections:
        return jsonify({"error": "Invalid request, 'entity_type' and 'sections' are required"}), 400
    
    result = {}
    ids = []  # List of unique IDs for Qdrant points
    vectors = []  # Embedding vectors
    payloads = []  # Payloads for each embedding

    for section_name, text in sections.items():
        if not isinstance(text, str):
            text = str(text)
        
        embedding = embed_single_text(text)
        if embedding:
            # Use the appropriate ID (resume_id or job_id) depending on entity_type
            unique_id = str(uuid.uuid4())
            ids.append(unique_id)  # Use job_id or resume_id + section name as the unique ID
            vectors.append(embedding)
            payloads.append({
                "section": section_name,
                **metadata  # Add all metadata from the request
            })
            result[section_name] = embedding
        else:
            logging.error(f"Failed to generate embedding for section: {section_name} | Text: {text}")

    try:
        response = requests.post(f"http://vector_store:5200/{entity_type}/add", json={
            f"{entity_type}_id": metadata.get(f"{entity_type}_id", "unknown"),
            "ids": ids,  # New Field: IDs for Qdrant
            "vectors": vectors,  # New Field: Embedding vectors for Qdrant
            "payloads": payloads  # New Field: Payloads for Qdrant
        })
        
        if response.status_code != 200:
            logging.error(f"Failed to store embedding in vector store. Status: {response.status_code} | Response: {response.json()}")
            return jsonify({"error": "Failed to add embeddings to vector store"}), 500

    except requests.exceptions.RequestException as e:
        logging.error(f"Exception during request to vector store: {str(e)}")
        return jsonify({"error": str(e)}), 500

    return jsonify({"entity_type": entity_type, "embeddings": result})




def embed_single_text(text):
    try:
        embedding = embd.encode([text])[0].tolist()
        # print(embedding)
        return embedding
    except Exception:
        logging.error(traceback.format_exc())
        return None


@app.route("/api/batch-embed", methods=["POST"])
def get_batched_embeddings():
    data = request.get_json()
    
    # Extract sections and entity type (job or resume) from the request
    entity_type = data.get("entity_type")  # 'job' or 'resume'
    sections = data.get("sections", {})
    
    if not entity_type or not sections:
        return jsonify({"error": "Invalid request, 'entity_type' and 'sections' are required"}), 400

    result = {}

    # Generate embeddings for each section
    for section_name, texts in sections.items():
        valid_texts = [x for x in texts if x is not None]
        embeddings = dynamic_batch_encode(embd, valid_texts, initial_batch_size=main_batch_size)
        result[section_name] = embeddings

    return jsonify({"entity_type": entity_type, "embeddings": result})


@app.route("/api/query-embed", methods=["POST"])
def get_query_embedding():
    data = request.get_json()
    query_text = data.get("query_text", "")
    
    if not query_text:
        return jsonify({"error": "Query text is required"}), 400
        
    embedding = embed_single_text(query_text)
    return jsonify({"embedding": embedding})