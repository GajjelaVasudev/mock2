from abc import ABC, abstractmethod

class LLMProvider(ABC):
    """
    Abstract base class for LLM Providers.
    """
    @abstractmethod
    async def generate_response(self, prompt: str) -> str:
        """Generate response from the LLM based on the prompt."""
        pass
