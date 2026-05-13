# Use a lightweight python image
FROM python:3.11-slim

# Install system dependencies if needed (compiler tools etc. for heavy scientific dependencies like pandas or fastf1)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set up user with UID 1000 for Hugging Face Spaces security requirements
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONUNBUFFERED=1

WORKDIR $HOME/app

# Copy dependency list and install them in user directory
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Copy all application code
COPY --chown=user . .

# Hugging Face Spaces automatically listens on port 7860
EXPOSE 7860
ENV PORT=7860

# Run uvicorn server via python entry point
CMD ["python", "main.py"]
