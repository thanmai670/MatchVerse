# Use a multi-arch Miniforge base, which supports arm64 and x86_64
FROM condaforge/miniforge3:latest

# Ensure that conda environment is on PATH
ENV PATH="/opt/conda/bin:${PATH}"

RUN echo "|--> Updating system packages" && \
    apt-get update && \
    apt-get -y upgrade && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN echo "|--> Installing prerequisites" && \
    apt-get update && \
    apt-get install -y git git-lfs wget libgl1-mesa-glx gcc build-essential && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Clone the model files
RUN echo "|--> Fetching model files (all-mpnet-base-v2)" && \
    git lfs install && \
    git clone https://huggingface.co/sentence-transformers/all-mpnet-base-v2 /all-mpnet-base-v2 && \
    rm -rf /all-mpnet-base-v2/.git

# Create a conda environment (optional step - you can skip if you want base)
# conda create -y -n myenv python=3.12 && conda activate myenv
# For simplicity, let's just use the base environment.

# Install PyTorch and other Python dependencies
# On arm64, this will install CPU-only PyTorch.
# On x86_64, also CPU-only by default. Adjust if you want GPU support on x86_64.
COPY requirements.txt ./
RUN echo "|--> Installing Python packages" && \
    pip install --no-cache-dir torch torchvision torchaudio && \
    pip install --no-cache-dir -r requirements.txt

WORKDIR /usr/src/app

COPY embedding_api.py embedding_api.py
COPY wsgi.py wsgi.py

EXPOSE 5500

ENTRYPOINT ["gunicorn", "--bind", "0.0.0.0:5500", "--error-logfile", "-", "--enable-stdio-inheritance", "--workers", "1", "--threads", "1", "--timeout", "72000", "wsgi:app"]
