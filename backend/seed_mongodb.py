import os

from pymongo import MongoClient
from dotenv import load_dotenv

from data.cable_ratings import cable_ratings


# ---------------------------------------------------------
# Load environment variables
# ---------------------------------------------------------

load_dotenv()


# ---------------------------------------------------------
# Choose MongoDB connection
# ---------------------------------------------------------
#
# Change this to:
#
# "local"  -> Local MongoDB
# "atlas"  -> MongoDB Atlas
#
# ---------------------------------------------------------

DATABASE_MODE = "atlas"


if DATABASE_MODE == "local":
    mongo_uri = os.getenv("MONGODB_LOCAL_URI")

elif DATABASE_MODE == "atlas":
    mongo_uri = os.getenv("MONGODB_ATLAS_URI")

else:
    raise ValueError(
        "DATABASE_MODE must be 'local' or 'atlas'"
    )


database_name = os.getenv(
    "MONGODB_DATABASE",
    "engineering_design_center"
)


if not mongo_uri:
    raise ValueError(
        "MongoDB connection string is missing from .env"
    )


# ---------------------------------------------------------
# Connect to MongoDB
# ---------------------------------------------------------

print("Connecting to MongoDB...")

client = MongoClient(mongo_uri)

# Verify connection
client.admin.command("ping")

print("MongoDB connection successful!")

db = client[database_name]


# ---------------------------------------------------------
# Materials
# ---------------------------------------------------------

materials = [
    {
        "code": "CU",
        "name": "Copper"
    },
    {
        "code": "AL",
        "name": "Aluminium"
    }
]


# ---------------------------------------------------------
# Installation Conditions
# ---------------------------------------------------------

installation_conditions = [
    {
        "code": "unenclosed_spaced",
        "name": "Unenclosed Spaced"
    },
    {
        "code": "touching",
        "name": "Touching"
    },
    {
        "code": "enclosed_conduit_in_air",
        "name": "Enclosed Conduit in Air"
    },
    {
        "code": "unenclosed_partially_thermal_insulation",
        "name": "Unenclosed - Partially Thermal Insulation"
    },
    {
        "code": "unenclosed_completely_thermal_insulation",
        "name": "Unenclosed - Completely Thermal Insulation"
    },
    {
        "code": "buried_direct",
        "name": "Buried Direct"
    },
    {
        "code": "underground_ducts",
        "name": "Underground Ducts"
    }
]


# ---------------------------------------------------------
# Clear existing reference data
# ---------------------------------------------------------
# This script currently uses: delete_many({}), for the five reference collections. That means it will clear the existing contents of those five collections before inserting the data.


print("\nClearing existing reference data...")

db.conductors.delete_many({})
db.materials.delete_many({})
db.installation_conditions.delete_many({})
db.current_ratings.delete_many({})
db.voltage_drop_references.delete_many({})


# ---------------------------------------------------------
# Insert Materials
# ---------------------------------------------------------

db.materials.insert_many(materials)


# ---------------------------------------------------------
# Insert Installation Conditions
# ---------------------------------------------------------

db.installation_conditions.insert_many(
    installation_conditions
)


# ---------------------------------------------------------
# Insert Conductors
# ---------------------------------------------------------

conductors = []

for item in cable_ratings:

    conductors.append({
        "conductor_size_mm2": item["conductor_size_mm2"],
        "unit": "mm²"
    })


db.conductors.insert_many(conductors)


# ---------------------------------------------------------
# Insert Current Ratings
# ---------------------------------------------------------

current_rating_documents = []


for item in cable_ratings:

    conductor_size = item["conductor_size_mm2"]

    for condition, material_values in item[
        "current_rating"
    ].items():

        for material, rating in material_values.items():

            # Skip unavailable values
            if rating is None:
                continue

            current_rating_documents.append({
                "conductor_size_mm2": conductor_size,
                "material": material.upper(),
                "installation_condition": condition,
                "current_rating_a": rating
            })


db.current_ratings.insert_many(
    current_rating_documents
)


# ---------------------------------------------------------
# Insert Voltage Drop References
# ---------------------------------------------------------

voltage_drop_documents = []


for item in cable_ratings:

    conductor_size = item["conductor_size_mm2"]

    for material, value in item[
        "voltage_drop_mv_per_a_m"
    ].items():

        # Skip unavailable values
        if value is None:
            continue

        voltage_drop_documents.append({
            "conductor_size_mm2": conductor_size,
            "material": material.upper(),
            "voltage_drop_mv_per_a_m": value
        })


db.voltage_drop_references.insert_many(
    voltage_drop_documents
)


# ---------------------------------------------------------
# Create Indexes
# ---------------------------------------------------------

db.conductors.create_index(
    [("conductor_size_mm2", 1)],
    unique=True
)

db.materials.create_index(
    [("code", 1)],
    unique=True
)

db.installation_conditions.create_index(
    [("code", 1)],
    unique=True
)

db.current_ratings.create_index(
    [
        ("conductor_size_mm2", 1),
        ("material", 1),
        ("installation_condition", 1)
    ],
    unique=True
)

db.voltage_drop_references.create_index(
    [
        ("conductor_size_mm2", 1),
        ("material", 1)
    ],
    unique=True
)


# ---------------------------------------------------------
# Verification
# ---------------------------------------------------------

print("\n----------------------------------------")
print("MongoDB seeding completed successfully!")
print("----------------------------------------")

print("\nDatabase mode:", DATABASE_MODE)
print("Database:", database_name)

print("\nDocument counts:")

print(
    "Conductors:",
    db.conductors.count_documents({})
)

print(
    "Materials:",
    db.materials.count_documents({})
)

print(
    "Installation Conditions:",
    db.installation_conditions.count_documents({})
)

print(
    "Current Ratings:",
    db.current_ratings.count_documents({})
)

print(
    "Voltage Drop References:",
    db.voltage_drop_references.count_documents({})
)


client.close()

print("\nMongoDB connection closed.")