import os 

from pymongo import MongoClient 
from dotenv import load_dotenv

load_dotenv()

mongo_uri = os.getenv("MONGODB_ATLAS_URI")

if not mongo_uri:
    raise ValueError("MONGO_ATLAS_URI is missing from .env")

print("Connevcting to MongoDB Atlas....")

client = MongoClient(mongo_uri)

try:
    client.admin.command("ping")
    print("MongoDB Atlas connection successful!")

    db = client["engineering_design_center"]

    print("Database: ", db.name)
    print("Collection: ", db.list_collection_names())

finally:
    client.close()
    print("Connection closed.")