from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import settings
from .db import create_db_and_tables
from .routers.chat import router as chat_router
from .routers.whatsapp import router as whatsapp_router
from .routers.admin import router as admin_router

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(chat_router)
app.include_router(whatsapp_router)
app.include_router(admin_router)

app.mount("/static", StaticFiles(directory="static"), name="static")