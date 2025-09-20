from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field, Relationship


class Ticket(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    channel: str = Field(index=True, description="web or whatsapp")
    session_id: str = Field(index=True, description="Session identifier (web UUID or WhatsApp phone)")

    service_type: Optional[str] = Field(default=None, description="videosurveillance|controle_acces|alarme")
    request_type: Optional[str] = Field(default=None, description="devis|installation|maintenance|panne|autre")

    customer_name: Optional[str] = Field(default=None)
    phone: Optional[str] = Field(default=None)
    email: Optional[str] = Field(default=None)
    location: Optional[str] = Field(default=None)

    details: Optional[str] = Field(default=None)

    status: str = Field(default="collecting", index=True)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    messages: list[Message] = Relationship(back_populates="ticket")


class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    ticket_id: int = Field(foreign_key="ticket.id")

    direction: str = Field(description="in|out")
    content: str
    raw_json: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)

    ticket: Optional[Ticket] = Relationship(back_populates="messages")