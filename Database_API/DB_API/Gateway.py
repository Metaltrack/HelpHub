from ctypes.wintypes import SERVICE_STATUS_HANDLE
from unittest import result
from click.utils import R
from fastapi import FastAPI, HTTPException
import DB
import uvicorn
import passwordHandler
from routes import provider
from fastapi.middleware.cors import CORSMiddleware


app =FastAPI(title="db")
guard = passwordHandler.password_manager()

app.include_router(provider.router, prefix="/providers")

origins = [
        "http://localhost:3000"
    ]

app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
    )

#root url call (can be used to check connection)
@app.get("/")
def root():
    try:
        return {"message": "Connected to DB API..."}
    except Exception as err:
        raise HTTPException(500, detail=err)
        return {"message": err}

if __name__ == "__main__":
    uvicorn.run(app)
