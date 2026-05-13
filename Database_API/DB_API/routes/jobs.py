# routes/jobs.py
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

# Accept a job
@router.put("/jobs/{job_id}/accept")
def accept_job(job_id: int):
    conn = DB.conn
    request_table = DB.service_request

    try:
        conn.execute(
            db.update(request_table)
            .where(request_table.c.request_id == job_id)
            .values(status="accepted")
        )
        conn.commit()

        return {"message": "Job accepted"}

    except Exception as err:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(err))

# Mark job as completed
@router.put("/jobs/{job_id}/complete")
def complete_job(job_id: int):
    conn = DB.conn
    request_table = DB.service_request

    try:
        conn.execute(
            db.update(request_table)
            .where(request_table.c.request_id == job_id)
            .values(status="completed")
        )
        conn.commit()

        return {"message": "Job completed"}

    except Exception as err:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(err))

# Delete (decline) job
@router.delete("/jobs/{job_id}")
def delete_job(job_id: int):
    conn = DB.conn
    request_table = DB.service_request

    try:
        conn.execute(
            db.delete(request_table)
            .where(request_table.c.request_id == job_id)
        )
        conn.commit()

        return {"message": "Job deleted"}

    except Exception as err:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(err))

@router.post("/jobs/create")
def create_job(data: CreateJob):
    conn = DB.conn
    request_table = DB.service_request

    try:
        conn.execute(
            request_table.insert().values(
                user_id=data.user_id,
                provider_id=data.provider_id,
                customer_name=data.customer_name,
                customer_phone=data.customer_phone,
                customer_email=data.customer_email,
                description=data.description,
                address=data.address,
                location_lat=data.location_lat,
                location_lon=data.location_lon,
                budget=data.budget,
                urgency=data.urgency,
                service_type=data.service_type,
                status="pending",
                created_at=time.strftime('%Y-%m-%d %H:%M:%S'),
                priority=data.urgency
            )
        )

        conn.commit()

        return {"message": "Job created successfully"}

    except Exception as err:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(err))
