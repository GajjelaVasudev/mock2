from abc import ABC, abstractmethod
from typing import Any, Optional, Type
from pydantic import BaseModel

class LLMProvider(ABC):
    """
    Abstract base class for LLM Providers.
    """
    @abstractmethod
    async def generate_response(self, prompt: str) -> str:
        """Generate response from the LLM based on the prompt."""
        pass

    @abstractmethod
    async def generate_structured_response(self, prompt: str, schema: Type[BaseModel], audio_bytes: Optional[bytes] = None, mime_type: Optional[str] = None) -> Any:
        """Generate a response constrained to a Pydantic schema, optionally with audio."""
        pass
