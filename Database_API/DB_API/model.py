# models.py
from pydantic import BaseModel, EmailStr
from typing import Optional

class ProviderRegister(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    password: str
    locationLat: Optional[float] = None
    locationLon: Optional[float] = None
    provider_otp :str

class ProviderLogin(BaseModel):
    phone :str
    password :str

class ProviderPhone(BaseModel):
    phone :str

class ProviderUpdate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    provider_desc: Optional[str] = ""
    locationLat: Optional[float] = None
    locationLon: Optional[float] = None
    provider_img: Optional[str] = None
    service_ids: list[int]

class UserRegister(BaseModel):
    name: str
    phone: str
    email: str
    password: str
    locationLat: float = None
    locationLon: float = None

class UserLogin(BaseModel):
    phone: str
    password: str