from pydantic import BaseModel, Field
from enum import Enum


# Specific rank values that can be chosen instead of freely typed
class MedicalRank(str, Enum):
    resident = "resident"
    attending = "attending"


# Class to create and store reader's response
class ResponseCreate(BaseModel):
    question_id: int
    rating: int = Field(ge=1, le=6)


# Creates and stores the reader's user login credentials
class UserCreate(BaseModel):
    username: str
    password: str
    name: str
    rank: MedicalRank


class LoginRequest(BaseModel):
    username: str
    password: str


class SignupResponse(BaseModel):
    token: str
    username: str
