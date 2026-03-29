from pydantic import BaseModel, Field, EmailStr
from typing import Optional


class PlayerCreate(BaseModel):
    username: str = Field(min_length=3, max_length=30)
    email: EmailStr


class PlayerUpdate(BaseModel):
    username: Optional[str] = Field(default=None, min_length=3, max_length=30)
    email: Optional[EmailStr] = None


class ScoreCreate(BaseModel):
    player_id: int
    game_name: str = Field(min_length=1, max_length=50)
    points: int = Field(ge=0)
    level: int = Field(ge=1, le=99)


class ScoreUpdate(BaseModel):
    game_name: Optional[str] = Field(default=None, min_length=1, max_length=50)
    points: Optional[int] = Field(default=None, ge=0)
    level: Optional[int] = Field(default=None, ge=1, le=99)
