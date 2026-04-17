from ctypes.wintypes import SERVICE_STATUS_HANDLE
from unittest import result
from click.utils import R
import pymysql
from fastapi import FastAPI, HTTPException
import sqlalchemy as db
import json
import uvicorn
import passwordHandler

app =FastAPI(title="db")
guard = passwordHandler.password_manager()

#-------------------------------connection---------------------------------------#
engine = db.create_engine("mysql+pymysql://panda:panda@localhost:3306/hh_schema")
conn = engine.connect()
metadata = db.MetaData()

#-------------------------------Tables-------------------------------------------#
#Tables from mysql db are registered here
#I couldve used pymysql directly to call stuff, but this is better (easier)
provider_table = db.Table("provider_table", metadata, autoload_with=engine)
service_table = db.Table("service_table", metadata, autoload_with=engine)
provider_service_table = db.Table("workerservice", metadata, autoload_with=engine)

test_table = db.Table("test_table", metadata, autoload_with=engine)

#root url call (can be used to check connection)
@app.get("/")
def root():
    try:
        return {"message": "Connected to DB API..."}
    except Exception as err:
        raise HTTPException(500, detail=err)
        return {"message": err}

@app.post("/test")
def add_test(data :dict):
    query = db.insert(test_table).values(id=data["id"], stuff=data["stuff"])
    result = conn.execute(query)

    return {"message":result}

@app.get("/test")
def get_test():
    query = db.select(test_table)
    result = conn.execute(query)

    data = [dict(row._mapping) for row in result]
    
    return data

#--providers--#
#get list of all providers (later will use for search)
@app.get("/providers")
def get_providers():
    try:
        query = db.select(provider_table)
        result = conn.execute(query)

        data = [dict(row._mapping) for row in result]
        return data
    except Exception as err:
        raise HTTPException(404, detail=err)
        return {"message": err}

#does as its name suggest
@app.get("/providers/{provider_id}")
def get_provider_by_id(provider_id :int):
    try:
        query = db.select(provider_table).where(provider_table.c.id == provider_id)
        result = conn.execute(query)

        data = [dict(row._mapping) for row in result]
        return data
    except Exception as err:
        raise HTTPException(404, detail=err)
        return {"message":err}

#creates a new provider
@app.post("/providers")
def create_provider(data :dict):
    try:
        query = db.insert(provider_table).values(
                provider_name=data["provider_name"],
                provider_phone=data["provider_phone"],
                provider_password=guard.hash_password(data["provider_password"]), #password has its unique salt, if things go wrong check guard class
                provider_email=data["provider_email"],
                provider_desc=data["provider_desc"],
                provider_img=data["provider_img"],
                provider_location_lat=data["provider_location_lat"],
                provider_location_lon=data["provider_location_lon"],
            )

        result = conn.execute(query)
        data = [dict(row._mapping) for row in result]
        return {"ID":result.inserted_primary_key[0]}
    except Exception as err:
        raise HTTPException(500, detail=err)
        return {"message": err}

#update the provider
@app.put("/providers/{provider_id}")
def update_provider(provider_id :int, data :dict):
    try:
        query = db.update(provider_table).where(provider_table.c.id == provider_id).values(**data)

        result = conn.execute(query)
        if result.rowcount == 0:
            raise HTTPException(404, "provider not found")

        return {"message": "provider Updated successfully"}
    except Exception as err:
        return {"message": err}

#deletes provider (gotta make sure front end asks twice)
@app.delete("/providers/{provider_id}")
def delete_provider(provider_id :int):
    try:
        query = db.delete(provider_table).where(provider_table.c.id == provider_id)

        result = conn.execute(query)
        return {"message": "provider Deleted successfully"}
    except Exception as err:
        raise HTTPException(500, detail=err)
        return {"message": err}

#--Services--#
@app.get("/services")
def get_services():
    try:
        query = db.select(service_table)
        result = conn.execute(query)

        data = [dict(row._mapping) for row in result]
        return data
    except Exception as err:
        return {"message": err}

@app.post("/services")
def create_service(data :dict):
    try:
        query = db.insert(service_table).values(service_type=data["service_type"])
        result = conn.execute(query)

        return {"message":"Service Created successfully"}
    except Exception as err:
        return {"message": err}

@app.delete("/services/{service_id}")
def delete_service(service_id :int):
    try:
        query = db.delete(service_table).where(service_table.c.id == service_id)
        result = conn.execute(query)

        return {"message":"service deleted successfully"}
    except Exception as err:
        return {"message": err}

#--Worker to Service--#
#assigns a service to the worker (There is no limitation to the amount of services a provider can provide)
@app.post("/assign")
def assign_service(data :dict):
    try:
        query = db.insert(provider_service_table).values(
                provider_id=data["provider_id"],
                service_id=data["service_id"]
            )

        result = conn.execute(query)
        return {"message":"Service assigned to provider"}
    except Exception as err:
        return {"message":err}

@app.get("/providers/{provider_id}/services")
def get_provider_services(provider_id :int):
    try:
        query = db.select(
                service_table.c.id,
                service_table.c.service_type
            ).select_from(
                provider_service_table.join(
                    service_table,
                    provider_service_table.c.service_id == service_table.c.id
                )    
            ).where(provider_service_table.c.provider_id == provider_id)

        result = conn.execute(query)
        data = [dict(row._mapping) for row in result]

        return data
    except Exception as err:
        raise HTTPException(404, detail=err)
        return {"message": err}

@app.delete("/unassign")
def unassign_service(provider_id :int, service_id :int):
    try:
        query = db.delete(provider_service_table).where(
                (provider_service_table.c.provider_id == provider_id) & (provider_service_table.c.service_id == service_id)
            )

        result = conn.execute(query)

        if result.rowcount == 0:
            raise HTTPException(404, "mapping not found")

        return {"message":"provider no longer does this"}
    except Exception as err:
        return {"message":err}


#--Search--#
@app.get("/providers/search")
#radius is in (km)
def search(name :str = None, service :str = None, lat :float = None, lon :float = None, radius :float = 10.0):
    pass

if __name__ == "__main__":
    uvicorn.run(app)
