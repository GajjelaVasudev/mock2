# Use the official lightweight Python image
FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Copy the dependencies file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the AI application code
COPY . .

# Set environment variables
ENV PYTHONPATH=/app
ENV PORT=8000
# By default, fastmcp runs on 127.0.0.1, we use 0.0.0.0 so Docker can map the port
ENV HOST=0.0.0.0

# Expose the API port
EXPOSE 8000

# Command to run the FastMCP SSE Server
# We use uvicorn directly to ensure it binds to 0.0.0.0
# The FastMCP object is actually an ASGI app when using transport="sse"
# wait, actually fastmcp has a built in ASGI app wrapper.
# If uvicorn app:mcp doesn't work, we can fallback to fastmcp run.
CMD ["fastmcp", "run", "app/mcp_server.py:mcp", "--transport", "sse", "--port", "8000", "--host", "0.0.0.0"]
