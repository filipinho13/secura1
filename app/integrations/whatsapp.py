import json
from typing import Any

import httpx

from ..config import settings


GRAPH_BASE = "https://graph.facebook.com/v20.0"


async def send_text_message(to_number: str, text: str) -> tuple[int, Any]:
    url = f"{GRAPH_BASE}/{settings.whatsapp_phone_number_id}/messages"
    headers = {
        "Authorization": f"Bearer {settings.whatsapp_token}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": to_number,
        "type": "text",
        "text": {"preview_url": False, "body": text[:4096]},
    }
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(url, headers=headers, content=json.dumps(payload))
        return resp.status_code, (resp.json() if resp.content else {})