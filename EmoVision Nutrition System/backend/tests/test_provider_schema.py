import pytest
from pydantic import ValidationError

from app.schemas.provider import ProviderConfigCreate


def test_provider_create_schema_valid():
    payload = ProviderConfigCreate(
        provider_type="openai_compatible",
        name="p1",
        base_url="https://api.openai.com/v1",
        api_key="sk-xxx",
        model_map={"default": "gpt-4o-mini", "recommend": "gpt-4o"},
    )
    assert payload.provider_type == "openai_compatible"


def test_provider_create_schema_invalid_task_key():
    with pytest.raises(ValidationError):
        ProviderConfigCreate(
            provider_type="gemini",
            name="p2",
            base_url="https://generativelanguage.googleapis.com/v1beta",
            api_key="x",
            model_map={"chat": "gemini-1.5-flash"},
        )


def test_provider_create_schema_invalid_base_url():
    with pytest.raises(ValidationError):
        ProviderConfigCreate(
            provider_type="claude",
            name="p3",
            base_url="api.anthropic.com",
            api_key="x",
            model_map={"default": "claude-3-5-sonnet-latest"},
        )
