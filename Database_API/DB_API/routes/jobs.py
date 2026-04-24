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
