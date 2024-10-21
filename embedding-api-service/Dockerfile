# Production
FROM nvidia/cuda:12.4.1-cudnn-runtime-ubuntu22.04
ENV PATH="/root/miniconda3/bin:${PATH}"
ARG PATH="/root/miniconda3/bin:${PATH}"

RUN echo "|--> Updating" && \
	apt-get update && apt-get -y upgrade && apt-get autoremove

RUN echo "|--> Installing prerequesites" && \
	apt-get install -y git git-lfs wget libgl1-mesa-glx gcc build-essential

ENV MINICONDA_INSTALLER_FILE=Miniconda3-py312_24.7.1-0-Linux-x86_64.sh
RUN echo "|--> Installing conda" && \
	wget \
    https://repo.anaconda.com/miniconda/${MINICONDA_INSTALLER_FILE} \
    && mkdir /root/.conda \
    && bash ${MINICONDA_INSTALLER_FILE} -b \
    && rm -f ${MINICONDA_INSTALLER_FILE}

RUN echo "|--> get model files for paraphrase-multilingual-mpnet-base-v2" && \
    git clone https://huggingface.co/sentence-transformers/all-mpnet-base-v2 && \
    rm -rf /all-mpnet-base-v2/.git

RUN echo "|--> Installing pytorch" && \
	pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124

COPY requirements.txt ./
RUN echo "|--> Installing python packages" && \
	pip install -r ./requirements.txt

WORKDIR /usr/src/app

COPY embedding_api.py embedding_api.py
COPY wsgi.py wsgi.py

EXPOSE 5500
ENTRYPOINT ["gunicorn", "--bind", "0.0.0.0:5500", "--error-logfile", "-", "--enable-stdio-inheritance", "--workers", "1", "--threads", "1", "--timeout", "72000", "wsgi:app"]
