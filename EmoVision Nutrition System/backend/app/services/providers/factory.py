from app.services.providers.base import BaseProvider
from app.services.providers.claude import ClaudeProvider
from app.services.providers.gemini import GeminiProvider
from app.services.providers.openai_compatible import OpenAICompatibleProvider


def build_provider(provider_type: str, base_url: str, api_key: str, model_map: dict | None = None) -> BaseProvider:
    if provider_type == "openai_compatible":
        return OpenAICompatibleProvider(base_url=base_url, api_key=api_key, model_map=model_map)
    if provider_type == "new_api":
        return OpenAICompatibleProvider(base_url=base_url, api_key=api_key, model_map=model_map)
    if provider_type == "gemini":
        return GeminiProvider(base_url=base_url, api_key=api_key, model_map=model_map)
    if provider_type == "claude":
        return ClaudeProvider(base_url=base_url, api_key=api_key, model_map=model_map)
    raise ValueError(f"Unsupported provider type: {provider_type}")
