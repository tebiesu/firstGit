from __future__ import annotations

import time

import httpx

from app.services.providers.base import BaseProvider, ProviderRequest, ProviderResult


class ClaudeProvider(BaseProvider):
    async def chat(self, request: ProviderRequest) -> ProviderResult:
        start = time.perf_counter()
        model = self.model_for(request.task)
        url = f"{self.base_url}/messages"
        payload = {
            "model": model,
            "max_tokens": 800,
            "messages": [{"role": "user", "content": request.prompt}],
        }
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            text = data["content"][0]["text"]
            return ProviderResult(ok=True, content=text, latency_ms=int((time.perf_counter() - start) * 1000))
        except Exception as exc:  # noqa: BLE001
            return ProviderResult(ok=False, content="", latency_ms=int((time.perf_counter() - start) * 1000), error=str(exc))

    async def vision(self, request: ProviderRequest) -> ProviderResult:
        image_hint = "\n".join(request.image_urls or [])
        prompt = f"{request.prompt}\nImage URLs:\n{image_hint}" if image_hint else request.prompt
        req = ProviderRequest(task=request.task, prompt=prompt, temperature=request.temperature)
        return await self.chat(req)

    async def health_check(self) -> ProviderResult:
        start = time.perf_counter()
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(self.base_url)
            ok = resp.status_code < 500
            return ProviderResult(
                ok=ok,
                content="provider reachable" if ok else "",
                latency_ms=int((time.perf_counter() - start) * 1000),
                error=None if ok else f"status={resp.status_code}",
            )
        except Exception as exc:  # noqa: BLE001
            return ProviderResult(ok=False, content="", latency_ms=int((time.perf_counter() - start) * 1000), error=str(exc))
