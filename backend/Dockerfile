# Main Backend Dockerfile (Lean)

FROM python:3.10-slim-bullseye

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port and start
EXPOSE 8000
CMD ["sh", "-c", "flask db upgrade && python serve.py"]
