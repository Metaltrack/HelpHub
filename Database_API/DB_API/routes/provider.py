# routes/auth.py
import time
import datetime
from fastapi import APIRouter, HTTPException
import sqlalchemy as db
from model import ProviderLogin, ProviderPhone, ProviderRegister
import DB
import passwordHandler
import OtpGenerator

router = APIRouter()
guard = passwordHandler.password_manager()

#---AUTH---#
@router.post("/send-otp")
async def send_otp(data :ProviderPhone):
    try:
        if OtpGenerator.red.get(f"otp:{data.phone}"):
            OtpGenerator.red.delete(f"otp:{data.phone}")

        phone = data.phone

        otp = OtpGenerator.generate_otp()

        OtpGenerator.red.setex(f"otp:{phone}", 300, otp)
        OtpGenerator.send_sms(otp, phone)
        print(f"LOG> OTP ({otp}) generated for PHONE ({phone});")
        return {"message": "OTP sent successfully"}
    except Exception as err:
        raise HTTPException(status_code=500, detail=err)
        print(f"LOG> {err}")
        return {"message": "Failed to send OTP"}


@router.post("/register")
async def register_provider(data :ProviderRegister):
    conn = DB.conn
    provider_table = DB.provider_table

    stored_otp = OtpGenerator.red.get(f"otp:{data.phone}")

    if not stored_otp:
        raise HTTPException(status_code=400, detail="OTP Expired!")

    if stored_otp != data.provider_otp:
        raise HTTPException(status_code=400, detail="Wrong OTP!")

    OtpGenerator.red.delete(f"otp:{data.phone}")

    try:
        query = db.select(provider_table).where(
            provider_table.c.provider_phone == data.phone
        )
        result = conn.execute(query).fetchone()

        if result:
            raise HTTPException(status_code=400, detail="Phone already registered")
        hashed_password = guard.hash_password(data.password)

        insert_query = provider_table.insert().values(
            provider_name=data.name,
            provider_phone=data.phone,
            provider_password=hashed_password,
            provider_email=data.email,
            provider_desc="",
            provider_img=None,
            provider_is_available=True,
            created_at=time.strftime('%Y-%m-%d %H:%M:%S')
        )

        conn.execute(insert_query)
        conn.commit()

        return {"message": "Provider registered successfully"}

    except Exception as err:
        raise HTTPException(status_code=500, detail=str(err))

@router.post("/login")
async def login_provider(data: ProviderLogin):
    conn = DB.conn
    provider_table = DB.provider_table

    try:
        query = db.select(provider_table).where(
            provider_table.c.provider_phone == data.phone
        )
        result = conn.execute(query).fetchone()

        if not result:
            raise HTTPException(status_code=404, detail="Provider not found")

        stored_password = result.provider_password

        if not guard.check_password(stored_password, data.password):
            raise HTTPException(status_code=401, detail="Invalid password")

        return {
            "message": "Login successful",
            "provider": {
                "provider_name": result.provider_name,
                "provider_phone": result.provider_phone,
                "provider_email": result.provider_email,
                "provider_desc": result.provider_desc,
                "provider_location_lat": result.provider_location_lat,
                "provider_location_lon": result.provider_location_lon
            }
        }

    except Exception as err:
        raise HTTPException(status_code=500, detail=str(err))

@router.put("/update-profile")
async def update_profile(data: ProviderRegister):
    conn = DB.conn
    provider_table = DB.provider_table

    try:
        query = db.update(provider_table).where(
            provider_table.c.provider_phone == data.phone
        ).values(
            provider_name=data.name,
            provider_email=data.email,
            provider_desc=data.provider_desc if hasattr(data, "provider_desc") else "",
            provider_location_lat=data.locationLat,
            provider_location_lon=data.locationLon
        )

        result = conn.execute(query)
        conn.commit()

        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Provider not found")

        return {"message": "Profile updated successfully"}

    except Exception as err:
        raise HTTPException(status_code=500, detail=str(err))
