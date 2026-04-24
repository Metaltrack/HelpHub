# routes/user.py

from fastapi import APIRouter, HTTPException
import sqlalchemy as db
import DB
import passwordHandler
from model import UserRegister, UserLogin

router = APIRouter()
guard = passwordHandler.password_manager()


# =========================
# REGISTER USER
# =========================
@router.post("/register")
def register_user(data: UserRegister):
    try:
        engine = DB.engine
        user_table = DB.user_table

        with engine.begin() as conn:

            query = db.select(user_table).where(
                user_table.c.user_phone == data.phone
            )
            existing = conn.execute(query).fetchone()

            if existing:
                raise HTTPException(status_code=400, detail="Phone already registered")

            hashed_password = guard.hash_password(data.password)

            insert_query = user_table.insert().values(
                user_name=data.name,
                user_phone=data.phone,
                user_email=data.email,
                user_password=hashed_password,
                user_lat=data.locationLat,
                user_lon=data.locationLon
            )

            conn.execute(insert_query)

            query = db.select(user_table).where(
                user_table.c.user_phone == data.phone
            )

            result = conn.execute(query).fetchone()

        return {
            "message": "User registered successfully",
            "user": {
                "user_id": result.user_id,
                "user_name": result.user_name,
                "user_phone": result.user_phone,
                "user_email": result.user_email,
                "user_lat": result.user_lat,
                "user_lon": result.user_lon
            }
        }

    except HTTPException as http_err:
        raise http_err

    except Exception as err:
        raise HTTPException(status_code=500, detail="Internal server error")

# =========================
# LOGIN USER
# =========================
@router.post("/login")
def login_user(data: UserLogin):
    try:
        engine = DB.engine
        user_table = DB.user_table

        with engine.begin() as conn:

            query = db.select(user_table).where(
                user_table.c.user_phone == data.phone
            )

            result = conn.execute(query).fetchone()

            if not result:
                raise HTTPException(status_code=404, detail="User not found")

            if not guard.check_password(result.user_password, data.password):
                raise HTTPException(status_code=401, detail="Invalid password")

            return {
                "message": "Login successful",
                "user": {
                    "user_id": result.user_id,
                    "user_name": result.user_name,
                    "user_phone": result.user_phone,
                    "user_email": result.user_email,
                    "user_lat": result.user_lat,
                    "user_lon": result.user_lon
                }
            }

    except Exception as err:
        raise HTTPException(status_code=500, detail=str(err))
