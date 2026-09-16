from fastapi import FastAPI
from app.mcp_server import mcp

app = FastAPI(title="etasha-ai")

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "etasha-ai"
    }

# fastmcp integrates cleanly by creating a sub-app
# You can mount it directly to your fastapi app
app.mount("/mcp", mcp.http_app())
