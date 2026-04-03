# Use a lightweight Python image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PORT 7860

# Add a user to run the app as non-root (Hugging Face best practice)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
	PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app

# Copy the requirements first to cache them
COPY --chown=user requirements.txt .
COPY --chown=user Backend/requirements.txt Backend/

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the Backend and AI folders
COPY --chown=user Backend/ Backend/
COPY --chown=user AI/ AI/

# Expose the default Hugging Face port
EXPOSE 7860

# Run the application
# We use the python command since main.py is now configured to handle the PORT env var
CMD ["python", "Backend/main.py"]
