from fastapi import APIRouter, Depends
from sqlmodel import Session

from ..db import get_session
from ..agent import get_agent
from ..schemas import ChatSendRequest, ChatSendResponse

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/send", response_model=ChatSendResponse)
def send_chat(payload: ChatSendRequest, session: Session = Depends(get_session)) -> ChatSendResponse:
    agent = get_agent()
    reply, ticket_id = agent.handle_message(session, channel="web", session_id=payload.session_id, text=payload.message)
    return ChatSendResponse(reply=reply, ticket_id=ticket_id)