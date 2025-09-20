from __future__ import annotations

from typing import Optional
from sqlmodel import Session, select

from .models import Ticket, Message
from .config import settings


SERVICE_SYNONYMS = {
    "videosurveillance": ["videosurveillance", "video surveillance", "caméra", "camera", "cameras", "cctv", "surveillance"],
    "controle_acces": ["controle d'acces", "contrôle d'accès", "badge", "badges", "lecteur", "controle acces", "porte", "portier"],
    "alarme": ["alarme", "alarms", "intrusion", "sirene", "sirène"]
}

REQUEST_SYNONYMS = {
    "devis": ["devis", "prix", "tarif", "quotation", "quote", "budget"],
    "installation": ["installation", "installer", "pose", "mettre en place"],
    "maintenance": ["maintenance", "entretien", "contrat", "maintenance preventive", "préventive"],
    "panne": ["panne", "en panne", "reparation", "réparation", "probleme", "problème", "urgent"]
}


def normalize(text: str) -> str:
    return text.lower().strip()


def detect_from_synonyms(text: str, mapping: dict[str, list[str]]) -> Optional[str]:
    t = normalize(text)
    for label, words in mapping.items():
        for w in words:
            if w in t:
                return label
    return None


def next_missing_field(ticket: Ticket) -> Optional[str]:
    if not ticket.service_type:
        return "service_type"
    if not ticket.request_type:
        return "request_type"
    if not ticket.location:
        return "location"
    if not ticket.phone:
        return "phone"
    if not ticket.customer_name:
        return "customer_name"
    if not ticket.details:
        return "details"
    return None


def question_for_field(field: str) -> str:
    if field == "service_type":
        return (
            "Pouvez-vous préciser le service souhaité: vidéosurveillance, contrôle d'accès ou alarme ?"
        )
    if field == "request_type":
        return (
            "Quel est le type de demande: devis, installation, maintenance ou panne ?"
        )
    if field == "location":
        return "Dans quelle ville/site se trouve l'installation ?"
    if field == "phone":
        return "Quel est votre numéro de téléphone pour vous recontacter ?"
    if field == "customer_name":
        return "Quel est votre nom/prénom ou le nom de votre société ?"
    if field == "details":
        return "Pouvez-vous donner quelques détails (quantité de caméras, portes, symptômes, etc.) ?"
    return "Merci, précisez s'il vous plaît."


def fill_field_from_text(ticket: Ticket, field: str, text: str) -> bool:
    value = normalize(text)
    if field == "service_type":
        detected = detect_from_synonyms(text, SERVICE_SYNONYMS)
        if detected:
            ticket.service_type = detected
            return True
        return False
    if field == "request_type":
        detected = detect_from_synonyms(text, REQUEST_SYNONYMS) or ("autre" if value in {"autre", "other"} else None)
        if detected:
            ticket.request_type = detected
            return True
        return False
    if field in {"location", "phone", "customer_name", "details"}:
        setattr(ticket, field, text.strip())
        return True
    return False


def summarize_ticket(ticket: Ticket) -> str:
    parts = [
        f"Service: {ticket.service_type}",
        f"Demande: {ticket.request_type}",
        f"Lieu: {ticket.location}",
        f"Contact: {ticket.customer_name} / {ticket.phone}" + (f" / {ticket.email}" if ticket.email else ""),
    ]
    if ticket.details:
        parts.append(f"Détails: {ticket.details}")
    return " | ".join(parts)


class Agent:
    def __init__(self) -> None:
        self.company_name = settings.company_name
        self.service_areas = settings.service_areas
        self.company_phone = settings.company_phone
        self.company_email = settings.company_email

    def handle_message(self, session: Session, channel: str, session_id: str, text: str) -> tuple[str, Optional[int]]:
        ticket = self._get_or_create_active_ticket(session, channel, session_id)

        # If user inputs contain clear service/request keywords, pre-fill even before asking
        if not ticket.service_type:
            detected = detect_from_synonyms(text, SERVICE_SYNONYMS)
            if detected:
                ticket.service_type = detected
        if not ticket.request_type:
            detected = detect_from_synonyms(text, REQUEST_SYNONYMS)
            if detected:
                ticket.request_type = detected

        # Try to fill the current expected field
        field = next_missing_field(ticket)
        if field:
            filled = fill_field_from_text(ticket, field, text)
            if not filled:
                reply = question_for_field(field)
                self._persist_message(session, ticket, direction="in", content=text)
                self._persist_message(session, ticket, direction="out", content=reply)
                session.add(ticket)
                session.commit()
                session.refresh(ticket)
                return reply, ticket.id

            # move to next field after filling
            field = next_missing_field(ticket)
            if field:
                reply = question_for_field(field)
                self._persist_message(session, ticket, direction="in", content=text)
                self._persist_message(session, ticket, direction="out", content=reply)
                session.add(ticket)
                session.commit()
                session.refresh(ticket)
                return reply, ticket.id

        # All info gathered -> finalize
        ticket.status = "open"
        summary = summarize_ticket(ticket)
        reply = (
            f"Merci, j'ai bien créé votre demande. {summary}. "
            f"Notre équipe vous recontacte rapidement. ({self.company_phone or self.company_email})"
        )
        self._persist_message(session, ticket, direction="in", content=text)
        self._persist_message(session, ticket, direction="out", content=reply)
        session.add(ticket)
        session.commit()
        session.refresh(ticket)
        return reply, ticket.id

    def _get_or_create_active_ticket(self, session: Session, channel: str, session_id: str) -> Ticket:
        statement = (
            select(Ticket)
            .where(Ticket.channel == channel)
            .where(Ticket.session_id == session_id)
            .where(Ticket.status.in_(["collecting", "open"]))
            .order_by(Ticket.created_at.desc())
        )
        ticket = session.exec(statement).first()
        if ticket:
            return ticket
        ticket = Ticket(channel=channel, session_id=session_id, status="collecting")
        session.add(ticket)
        session.commit()
        session.refresh(ticket)
        return ticket

    def _persist_message(self, session: Session, ticket: Ticket, direction: str, content: str) -> None:
        msg = Message(ticket_id=ticket.id, direction=direction, content=content)
        session.add(msg)


def get_agent() -> Agent:
    return Agent()