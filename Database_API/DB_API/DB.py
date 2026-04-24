from ctypes.wintypes import SERVICE_STATUS_HANDLE
from unittest import result
from click.utils import R
import pymysql
import sqlalchemy as db
import json

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

user_table = db.Table("user_table", metadata, autoload_with=engine)
ratings_table = db.Table("ratings_table", metadata, autoload_with=engine)
service_request = db.Table("service_request", metadata, autoload_with=engine)

test_table = db.Table("test_table", metadata, autoload_with=engine)
