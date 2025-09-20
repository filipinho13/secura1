import json
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import Session

from ..db import get_session
from ..agent import get_agent
from ..config import settings
from ..integrations.whatsapp import send_text_message

router = APIRouter(prefix="/api/whatsapp", tags=["whatsapp"])


@router.get("/webhook")
async def verify(request: Request):
    params = request.query_params
    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")
    if mode == "subscribe" and token == settings.whatsapp_verify_token and challenge:
        return int(challenge)
    raise HTTPException(status_code=403, detail="Forbidden")


@router.post("/webhook")
async def receive(request: Request, session: Session = Depends(get_session)) -> dict[str, Any]:
    body = await request.json()
    entries = body.get("entry", [])
    agent = get_agent()
    events_processed = 0

    for entry in entries:
        changes = entry.get("changes", [])
        for change in changes:
            value = change.get("value", {})
            messages = value.get("messages", [])
            for msg in messages:
                if msg.get("type") != "text":
                    continue
                from_number = msg.get("from")
                text = msg.get("text", {}).get("body", "")
                reply, ticket_id = agent.handle_message(session, channel="whatsapp", session_id=from_number, text=text)
                # send reply back via WhatsApp
                await send_text_message(from_number, reply)
                events_processed += 1

    return {"status": "ok", "processed": events_processed}