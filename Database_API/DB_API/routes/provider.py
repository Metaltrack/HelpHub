# routes/auth.py
import time
import datetime
from fastapi import APIRouter, HTTPException
import sqlalchemy as db
from model import ProviderLogin, ProviderPhone, ProviderRegister, ProviderUpdate
import DB
import passwordHandler
import OtpGenerator
import base64

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

        img_base64 = None
        if result.provider_img:
            img_base64 = "data:image/png;base64," + base64.b64encode(result.provider_img).decode()
    

        return {
            "message": "Login successful",
            "provider": {
                "provider_name": result.provider_name,
                "provider_phone": result.provider_phone,
                "provider_email": result.provider_email,
                "provider_desc": result.provider_desc,
                "provider_location_lat": result.provider_location_lat,
                "provider_location_lon": result.provider_location_lon,
                "provider_img": img_base64
            }
        }

    except Exception as err:
        raise HTTPException(status_code=500, detail=str(err))

@router.put("/update-profile")
async def update_profile(data: ProviderUpdate):
    conn = DB.conn
    provider_table = DB.provider_table
    provider_service_map = DB.provider_service_table

    try:
        query = db.select(provider_table.c.id).where(
            provider_table.c.provider_phone == data.phone
        )
        result = conn.execute(query).fetchone()

        if not result:
            raise HTTPException(status_code=404, detail="Provider not found")

        provider_id = result.id

        img_bytes = None
        if data.provider_img:
            header, encoded = data.provider_img.split(",", 1)
            img_bytes = base64.b64decode(encoded)

        update_query = db.update(provider_table).where(
            provider_table.c.id == provider_id
        ).values(
            provider_name=data.name,
            provider_email=data.email,
            provider_desc=data.provider_desc or "",
            provider_location_lat=data.locationLat,
            provider_location_lon=data.locationLon,
            provider_img=img_bytes
        )

        conn.execute(update_query)

        # delete old mappings
        conn.execute(
            db.delete(provider_service_map).where(
                provider_service_map.c.provider_id == provider_id
            )
        )

        # insert new mappings
        for sid in data.service_ids:
            conn.execute(
                provider_service_map.insert().values(
                    provider_id=provider_id,
                    service_id=sid
                )
            )
        conn.commit()

        return {"message": "Profile updated successfully"}

    except Exception as err:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(err))
@router.get("/services")
async def get_services():
    conn = DB.conn
    service_table = DB.service_table

    query = db.select(service_table)
    result = conn.execute(query).fetchall()

    return [{"id": row.id, "service_type": row.service_type} for row in result]

@router.get("/{phone}/services")
def get_provider_services(phone: str):
    provider_service_map = DB.provider_service_table
    provider_table = DB.provider_table

    try:
        with DB.engine.connect() as conn: 

            query = db.select(provider_service_map.c.service_id).select_from(
                provider_service_map.join(
                    provider_table,
                    provider_table.c.id == provider_service_map.c.provider_id
                )
            ).where(provider_table.c.provider_phone == phone)

            result = conn.execute(query).fetchall()

            # ✅ FIX: extract data BEFORE connection closes
            service_ids = [row.service_id for row in result]

        return {
            "service_ids": service_ids
        }

    except Exception as err:
        raise HTTPException(status_code=500, detail=str(err))

# Get all jobs for a provider
@router.get("/{phone}/jobs")
def get_provider_jobs(phone: str):
    conn = DB.conn
    provider_table = DB.provider_table
    request_table = DB.service_request

    try:
        # get provider id
        provider = conn.execute(
            db.select(provider_table.c.id).where(
                provider_table.c.provider_phone == phone
            )
        ).fetchone()

        if not provider:
            raise HTTPException(status_code=404, detail="Provider not found")

        # fetch jobs
        jobs = conn.execute(
            db.select(request_table).where(
                request_table.c.provider_id == provider.id
            )
        ).fetchall()

        return [
            {
                "id": row.request_id,
                "customer_name": row.customer_name,
                "customer_phone": row.customer_phone,
                "customer_email": row.customer_email,
                "description": row.description,
                "address": row.address,
                "location_lat": row.location_lat,
                "location_lon": row.location_lon,
                "budget": row.budget,
                "urgency": row.urgency,
                "status": row.status,
                "created_at": row.created_at
            }
            for row in jobs
        ]

    except Exception as err:
        raise HTTPException(status_code=500, detail=str(err))

@router.get("/nearby")
def get_nearby_providers(lat: float, lon: float, service: str = ""):
    try:
        engine = DB.engine

        with engine.begin() as conn:
            query = db.text("""
                    SELECT 
                        p.id,
                        p.provider_name,
                        p.provider_phone,
                        p.provider_desc,
                        p.provider_location_lat,
                        p.provider_location_lon,
                        s.service_type AS provider_service,
                        CalculateDistance(:lat, :lon, p.provider_location_lat, p.provider_location_lon) AS distance
                    FROM provider_table p
                    JOIN workerservice ps ON p.id = ps.provider_id
                    JOIN service_table s ON ps.service_id = s.id
                    WHERE p.provider_is_available = 1
                    AND (
                        :service = '' OR 
                        LOWER(s.service_type) LIKE LOWER(CONCAT('%', :service, '%'))
                    )
                    ORDER BY distance ASC
                    LIMIT 20
                """)

            result = conn.execute(query, {
                "lat": lat,
                "lon": lon,
                "service": service
            }).fetchall()

            providers = [
                {
                    "id": row.id,
                    "provider_name": row.provider_name,
                    "provider_phone": row.provider_phone,
                    "provider_service": row.provider_service,
                    "provider_desc": row.provider_desc,
                    "provider_location_lat": float(row.provider_location_lat),
                    "provider_location_lon": float(row.provider_location_lon),
                    "distance": float(row.distance)
                }
                for row in result
            ]

        return {"providers": providers}

    except Exception as err:
        raise HTTPException(status_code=500, detail=str(err))
