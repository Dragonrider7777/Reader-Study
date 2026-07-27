from pydantic import BaseModel


class ResponseCreate(BaseModel):
    question_id: int
    rating: int
