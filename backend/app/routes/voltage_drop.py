from typing import Optional

from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel, Field
from bson import ObjectId

from app.database import voltage_drop_collection


router = APIRouter(
    prefix="/api/voltage-drop",
    tags=["Voltage Drop"]
)


class VoltageDropRequest(BaseModel):
    conductor_size_mm2: float = Field(gt=0)
    material: str
    voltage_drop_mv_per_a_m: float = Field(gt=0)


@router.get("/")
def get_voltage_drop_references(
    conductor_size: Optional[float] = Query(default=None),
    material: Optional[str] = Query(default=None)
):
    filters = {}

    if conductor_size is not None:
        filters["conductor_size_mm2"] = conductor_size

    if material is not None:
        filters["material"] = material.upper()

    references = list(
        voltage_drop_collection.find(filters)
        .sort("conductor_size_mm2", 1)
    )

    # Convert MongoDB ObjectId to string
    for reference in references:
        reference["_id"] = str(reference["_id"])

    return references


@router.post("/")
def add_voltage_drop_reference(
    request: VoltageDropRequest
):
    material = request.material.upper()

    # Check for duplicate
    existing_reference = voltage_drop_collection.find_one(
        {
            "conductor_size_mm2": request.conductor_size_mm2,
            "material": material
        }
    )

    if existing_reference:
        raise HTTPException(
            status_code=409,
            detail=(
                "A voltage drop reference already exists for this "
                "conductor size and material."
            )
        )

    new_reference = {
        "conductor_size_mm2": request.conductor_size_mm2,
        "material": material,
        "voltage_drop_mv_per_a_m": request.voltage_drop_mv_per_a_m
    }

    result = voltage_drop_collection.insert_one(new_reference)

    # IMPORTANT:
    # Convert MongoDB ObjectId to string before returning it.
    inserted_id = str(result.inserted_id)

    return {
        "message": "Voltage drop reference added successfully",
        "id": inserted_id,
        "data": {
            "id": inserted_id,
            "conductor_size_mm2": new_reference["conductor_size_mm2"],
            "material": new_reference["material"],
            "voltage_drop_mv_per_a_m": new_reference[
                "voltage_drop_mv_per_a_m"
            ]
        }
    }


@router.put("/{reference_id}")
def update_voltage_drop_reference(
    reference_id: str,
    request: VoltageDropRequest
):
    try:
        object_id = ObjectId(reference_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid voltage drop reference ID"
        )

    material = request.material.upper()

    # Check whether another record already uses the same
    # conductor size + material combination.
    existing_reference = voltage_drop_collection.find_one(
        {
            "conductor_size_mm2": request.conductor_size_mm2,
            "material": material,
            "_id": {"$ne": object_id}
        }
    )

    if existing_reference:
        raise HTTPException(
            status_code=409,
            detail=(
                "Another voltage drop reference already exists for "
                "this conductor size and material."
            )
        )

    updated_reference = {
        "conductor_size_mm2": request.conductor_size_mm2,
        "material": material,
        "voltage_drop_mv_per_a_m": request.voltage_drop_mv_per_a_m
    }

    result = voltage_drop_collection.update_one(
        {"_id": object_id},
        {"$set": updated_reference}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Voltage drop reference not found"
        )

    return {
        "message": "Voltage drop reference updated successfully",
        "id": reference_id,
        "data": updated_reference
    }
