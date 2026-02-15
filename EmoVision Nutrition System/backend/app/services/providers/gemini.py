from __future__ import annotations

import time

import httpx

from app.services.providers.base import BaseProvider, ProviderRequest, ProviderResult


class GeminiProvider(BaseProvider):
    async def chat(self, request: ProviderRequest) -> ProviderResult:
        return await self._generate(request.prompt, request.task)

    async def vision(self, request: ProviderRequest) -> ProviderResult:
        image_hint = "\n".join(request.image_urls or [])
        prompt = f"{request.prompt}\nImages:\n{image_hint}" if image_hint else request.prompt
        return await self._generate(prompt, request.task)

    async def _generate(self, prompt: str, task: str) -> ProviderResult:
        start = time.perf_counter()
        model = self.model_for(task)
        url = f"{self.base_url}/models/{model}:generateContent?key={self.api_key}"
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return ProviderResult(ok=True, content=text, latency_ms=int((time.perf_counter() - start) * 1000))
        except Exception as exc:  # noqa: BLE001
            return ProviderResult(
                ok=False,
                content="",
                latency_ms=int((time.perf_counter() - start) * 1000),
                error=str(exc),
            )

    async def health_check(self) -> ProviderResult:
        start = time.perf_counter()
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(self.base_url)
            return ProviderResult(
                ok=resp.status_code < 500,
                content="provider reachable" if resp.status_code < 500 else "",
                latency_ms=int((time.perf_counter() - start) * 1000),
                error=None if resp.status_code < 500 else f"status={resp.status_code}",
            )
        except Exception as exc:  # noqa: BLE001
            return ProviderResult(ok=False, content="", latency_ms=int((time.perf_counter() - start) * 1000), error=str(exc))
