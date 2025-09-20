from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    app_name: str = Field(default="AI Security Agent")
    app_env: str = Field(default="development")
    port: int = Field(default=8000)

    database_url: str = Field(default="sqlite:///./data.db")

    whatsapp_verify_token: str = Field(default="change-me")
    whatsapp_token: str = Field(default="")
    whatsapp_phone_number_id: str = Field(default="")

    company_name: str = Field(default="Votre Société Sécurité")
    company_phone: str = Field(default="")
    company_email: str = Field(default="")
    service_areas: str = Field(default="")

    model_config = {
        "env_file": ".env",
        "case_sensitive": False,
        "env_file_encoding": "utf-8",
    }


settings = Settings()