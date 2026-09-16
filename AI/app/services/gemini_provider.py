import os
from google import genai
from pydantic import BaseModel
from typing import Type, Any, Optional

from app.services.llm_provider import LLMProvider

class GeminiProvider(LLMProvider):
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            print("WARNING: GEMINI_API_KEY is not set. LLM calls will fail until it is configured in the .env file.")
            api_key = "dummy_key_to_allow_app_startup"
        self.client = genai.Client(api_key=api_key)

    async def generate_response(self, prompt: str) -> str:
        """Simple text generation using Gemini."""
        response = self.client.models.generate_content(
            model='gemini-3.6-flash',
            contents=prompt,
        )
        return response.text
        
    async def generate_structured_response(self, prompt: str, schema: Type[BaseModel], audio_bytes: Optional[bytes] = None, mime_type: Optional[str] = None) -> Any:
        """Generate a response constrained to a Pydantic schema, optionally with audio."""
        
        contents = []
        if audio_bytes and mime_type:
            from google.genai import types
            contents.append(
                types.Part.from_bytes(data=audio_bytes, mime_type=mime_type)
            )
        contents.append(prompt)

        response = self.client.models.generate_content(
            model='gemini-3.6-flash',
            contents=contents,
            config={
                'response_mime_type': 'application/json',
                'response_schema': schema,
            },
        )
        return schema.model_validate_json(response.text)
