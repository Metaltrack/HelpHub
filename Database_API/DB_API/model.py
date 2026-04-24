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
