from pydantic import BaseModel

class Code(BaseModel):
    code: str
    weddingname: str

class Selfie(BaseModel):
    filename: str
    code: str