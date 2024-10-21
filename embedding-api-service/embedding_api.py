import logging
import os
import sys
import traceback

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
    entity_type = data.get("entity_type")  # 'job' or 'resume'
    sections = data.get("sections", {})
    metadata = data.get("metadata", {})  # Assume metadata comes in with the request (e.g., title, company, etc.)
    
    if not entity_type or not sections:
        return jsonify({"error": "Invalid request, 'entity_type' and 'sections' are required"}), 400
    
    result = {}
    for section_name, text in sections.items():
        if not isinstance(text, str):
            text = str(text)  # Convert any non-string (like integers) to string
        embedding = embed_single_text(text)
        # logging.debug(f"embedding : {embedding}")
        result[section_name] = embedding

    # Send the embeddings to the appropriate vector store endpoint
    try:
        if entity_type == "job":
            # Send embeddings to job add endpoint
            response = requests.post("http://vector_store:5200/job/add", json={
                "job_id": metadata.get("job_id", "unknown"),
                "embeddings": result,
                "metadata": metadata
            })
        elif entity_type == "resume":
            # Send embeddings to resume add endpoint
            response = requests.post("http://vector_store:5200/resume/add", json={
                "resume_id": metadata.get("resume_id", "unknown"),
                "embeddings": result,
                "metadata": metadata
            })
        else:
            return jsonify({"error": "Invalid entity_type"}), 400
        
        if response.status_code != 200:
            return jsonify({"error": "Failed to add embeddings to vector store"}), 500

    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"entity_type": entity_type, "embeddings": result})



def embed_single_text(text):
    try:
        embedding = embd.encode([text])[0].tolist()
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

