# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container at /app
COPY . /app

# Expose the port for the FastAPI application
EXPOSE 5200

# Command to run the application using Uvicorn
CMD ["uvicorn", "wsgi:app", "--host", "0.0.0.0", "--port", "5200"]
