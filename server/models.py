from pydantic import BaseModel
from typing import List

class Code(BaseModel):
    code: str
    weddingname: str

class PklMetadata(BaseModel):
    album_code: str
    embedded_models: List[bytes]

class SelfieMetadata(BaseModel):
    filename: str
    album_code: str
    matches: List[str]

class FolderPath(BaseModel):
    path: str
    name: str
