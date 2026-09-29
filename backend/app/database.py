import os
from pymongo import MongoClient 
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_ATLAS_URI")
DATABASE_NAME = os.getenv(
    "MONGODB_DATABASE",
    "engineering_design_center"
)

if not MONGODB_URI:
    raise ValueError("MONGODB_ATLAS_URI is missing from .env")

client = MongoClient(MONGODB_URI)

db = client[DATABASE_NAME]

# Collections
conductors_collection = db["conductors"]
materials_collection = db["materials"]
installation_conditions_collection = db["installation_conditions"]
current_ratings_collection = db["current_ratings"]
voltage_drop_collection = db["voltage_drop_references"]
engineering_designs_collection = db["engineering_designs"]
calculation_results_collection = db["calculation_results"]