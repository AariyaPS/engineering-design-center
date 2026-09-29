from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from bson import ObjectId

from app.database import materials_collection


router = APIRouter(
    prefix="/api/materials",
    tags=["Materials"]
)


class MaterialRequest(BaseModel):
    code: str
    name: str


@router.get("/")
def get_materials():
    materials = list(
        materials_collection.find({})
        .sort("code", 1)
    )

    # Convert MongoDB ObjectId to string
    for material in materials:
        material["_id"] = str(material["_id"])

    return materials


@router.post("/")
def add_material(
    request: MaterialRequest
):
    code = request.code.upper()

    # Check for duplicate material code
    existing_material = materials_collection.find_one(
        {
            "code": code
        }
    )

    if existing_material:
        raise HTTPException(
            status_code=409,
            detail=(
                f"Material code '{code}' already exists."
            )
        )

    new_material = {
        "code": code,
        "name": request.name
    }

    result = materials_collection.insert_one(
        new_material
    )

    inserted_id = str(result.inserted_id)

    return {
        "message": "Material added successfully",
        "id": inserted_id,
        "data": {
            "id": inserted_id,
            "code": new_material["code"],
            "name": new_material["name"]
        }
    }


@router.put("/{material_id}")
def update_material(
    material_id: str,
    request: MaterialRequest
):
    try:
        object_id = ObjectId(material_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid material ID"
        )

    code = request.code.upper()

    # Check whether another material already
    # uses the requested code.
    existing_material = materials_collection.find_one(
        {
            "code": code,
            "_id": {"$ne": object_id}
        }
    )

    if existing_material:
        raise HTTPException(
            status_code=409,
            detail=(
                f"Another material with code '{code}' "
                "already exists."
            )
        )

    updated_material = {
        "code": code,
        "name": request.name
    }

    result = materials_collection.update_one(
        {"_id": object_id},
        {"$set": updated_material}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Material not found"
        )

    return {
        "message": "Material updated successfully",
        "id": material_id,
        "data": {
            "id": material_id,
            "code": updated_material["code"],
            "name": updated_material["name"]
        }
    }

