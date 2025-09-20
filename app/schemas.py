from typing import Optional
from pydantic import BaseModel, Field


class ChatSendRequest(BaseModel):
    session_id: str = Field(description="Client session identifier (UUID or phone)")
    message: str


class ChatSendResponse(BaseModel):
    reply: str
    ticket_id: Optional[int] = None


class TicketOut(BaseModel):
    id: int
    channel: str
    session_id: str
    service_type: Optional[str]
    request_type: Optional[str]
    customer_name: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    location: Optional[str]
    details: Optional[str]
    status: str

    class Config:
        from_attributes = True