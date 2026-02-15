from __future__ import annotations

import time

import httpx

from app.services.providers.base import BaseProvider, ProviderRequest, ProviderResult


class OpenAICompatibleProvider(BaseProvider):
    async def chat(self, request: ProviderRequest) -> ProviderResult:
        start = time.perf_counter()
        url = f"{self.base_url}/chat/completions"
        payload = {
            "model": self.model_for(request.task),
            "messages": [{"role": "user", "content": request.prompt}],
            "temperature": request.temperature,
        }
        headers = {"Authorization": f"Bearer {self.api_key}"}
        try:
            async with httpx.AsyncClient(timeout=25) as client:
                resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            text = data["choices"][0]["message"]["content"]
            latency_ms = int((time.perf_counter() - start) * 1000)
            return ProviderResult(ok=True, content=text, latency_ms=latency_ms)
        except Exception as exc:  # noqa: BLE001
            latency_ms = int((time.perf_counter() - start) * 1000)
            return ProviderResult(ok=False, content="", latency_ms=latency_ms, error=str(exc))

    async def vision(self, request: ProviderRequest) -> ProviderResult:
        start = time.perf_counter()
        url = f"{self.base_url}/chat/completions"
        images = request.image_urls or []
        content = [{"type": "text", "text": request.prompt}]
        for image_url in images:
            content.append({"type": "image_url", "image_url": {"url": image_url}})

        payload = {
            "model": self.model_for(request.task),
            "messages": [{"role": "user", "content": content}],
            "temperature": request.temperature,
        }
        headers = {"Authorization": f"Bearer {self.api_key}"}
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            text = data["choices"][0]["message"]["content"]
            latency_ms = int((time.perf_counter() - start) * 1000)
            return ProviderResult(ok=True, content=text, latency_ms=latency_ms)
        except Exception as exc:  # noqa: BLE001
            latency_ms = int((time.perf_counter() - start) * 1000)
            return ProviderResult(ok=False, content="", latency_ms=latency_ms, error=str(exc))

    async def health_check(self) -> ProviderResult:
        start = time.perf_counter()
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(self.base_url)
            if resp.status_code < 500:
                return ProviderResult(ok=True, content="provider reachable", latency_ms=int((time.perf_counter() - start) * 1000))
            return ProviderResult(
                ok=False,
                content="",
                latency_ms=int((time.perf_counter() - start) * 1000),
                error=f"status={resp.status_code}",
            )
        except Exception as exc:  # noqa: BLE001
            return ProviderResult(
                ok=False,
                content="",
                latency_ms=int((time.perf_counter() - start) * 1000),
                error=str(exc),
            )
