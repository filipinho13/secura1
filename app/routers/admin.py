from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..db import get_session
from ..models import Ticket, Message
from ..schemas import TicketOut

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/tickets", response_model=List[TicketOut])
def list_tickets(session: Session = Depends(get_session)) -> list[TicketOut]:
    tickets = session.exec(select(Ticket).order_by(Ticket.created_at.desc())).all()
    return tickets


@router.get("/tickets/{ticket_id}/messages")
def list_ticket_messages(ticket_id: int, session: Session = Depends(get_session)) -> list[dict]:
    ticket = session.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    messages = session.exec(select(Message).where(Message.ticket_id == ticket_id).order_by(Message.created_at.asc())).all()
    return [
        {
            "id": m.id,
            "direction": m.direction,
            "content": m.content,
            "created_at": m.created_at,
        }
        for m in messages
    ]