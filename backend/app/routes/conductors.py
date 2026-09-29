
from typing import Optional

from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel, Field
from bson import ObjectId

from app.database import conductors_collection


router = APIRouter(
    prefix="/api/conductors",
    tags=["Conductors"]
)


class ConductorRequest(BaseModel):
    conductor_size_mm2: float = Field(gt=0)


@router.get("/")
def get_conductors(
    conductor_size: Optional[float] = Query(default=None)
):
    filters = {}

    # Filter by conductor size
    if conductor_size is not None:
        filters["conductor_size_mm2"] = conductor_size

    conductors = list(
        conductors_collection.find(filters)
        .sort("conductor_size_mm2", 1)
    )

    # Convert MongoDB ObjectId to string
    for conductor in conductors:
        conductor["_id"] = str(conductor["_id"])

    return conductors


@router.post("/")
def add_conductor(
    request: ConductorRequest
):
    # Check whether conductor size already exists
    existing_conductor = conductors_collection.find_one(
        {
            "conductor_size_mm2": request.conductor_size_mm2
        }
    )

    if existing_conductor:
        raise HTTPException(
            status_code=409,
            detail=(
                f"Conductor size {request.conductor_size_mm2} mm² "
                "already exists."
            )
        )

    new_conductor = {
        "conductor_size_mm2": request.conductor_size_mm2
    }

    result = conductors_collection.insert_one(
        new_conductor
    )

    # Convert MongoDB ObjectId to string
    inserted_id = str(result.inserted_id)

    return {
        "message": "Conductor added successfully",
        "id": inserted_id,
        "data": {
            "id": inserted_id,
            "conductor_size_mm2": new_conductor[
                "conductor_size_mm2"
            ]
        }
    }


@router.put("/{conductor_id}")
def update_conductor(
    conductor_id: str,
    request: ConductorRequest
):
    try:
        object_id = ObjectId(conductor_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid conductor ID"
        )

    # Check whether another conductor already has
    # the requested size.
    existing_conductor = conductors_collection.find_one(
        {
            "conductor_size_mm2": request.conductor_size_mm2,
            "_id": {"$ne": object_id} #$ne mean not equal.
        }
    )

    if existing_conductor:
        raise HTTPException(
            status_code=409,
            detail=(
                f"Conductor size {request.conductor_size_mm2} mm² "
                "already exists."
            )
        )

    updated_conductor = {
        "conductor_size_mm2": request.conductor_size_mm2
    }

    result = conductors_collection.update_one(
        {"_id": object_id},
        {"$set": updated_conductor}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Conductor not found"
        )

    return {
        "message": "Conductor updated successfully",
        "id": conductor_id,
        "data": {
            "id": conductor_id,
            "conductor_size_mm2": updated_conductor[
                "conductor_size_mm2"
            ]
        }
    }

