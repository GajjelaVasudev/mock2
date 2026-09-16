# Etasha AI Service

This is the AI service for the Etasha Society hackathon project.

## Requirements

- Python 3.9+

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Copy `.env.example` to `.env` and configure the environment variables.

## Run

```bash
uvicorn app.main:app --reload
```
