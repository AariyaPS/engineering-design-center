from datetime import datetime, timezone
from uuid import uuid4

from bson import ObjectId
from fastapi import APIRouter, HTTPException

from app.database import engineering_designs_collection
from app.models.engineering_design import (
    EngineeringDesignCreate,
    EngineeringDesignUpdate,
)


router = APIRouter(
    prefix="/api/engineering-designs",
    tags=["Engineering Designs"]
)


def serialize_design(design):
    design["_id"] = str(design["_id"])

    if design.get("created_at"):
        design["created_at"] = design["created_at"].isoformat()

    if design.get("updated_at"):
        design["updated_at"] = design["updated_at"].isoformat()

    return design


@router.get("/")
def get_engineering_designs():

    designs = list(
        engineering_designs_collection.find().sort(
            "created_at",
            -1
        )
    )

    return [
        serialize_design(design)
        for design in designs
    ]


@router.post("/")
def create_engineering_design(
    design: EngineeringDesignCreate
):

    now = datetime.now(timezone.utc)

    design_document = {
        "design_id": (
            f"EDC-{uuid4().hex[:8].upper()}"
        ),
        "design_name": design.design_name,
        "client_name": design.client_name,
        "project_name": design.project_name,
        "description": design.description,
        "supply_voltage_v": design.supply_voltage_v,
        "design_current_a": design.design_current_a,
        "cable_length_m": design.cable_length_m,
        "status": design.status,
        "created_at": now,
        "updated_at": now,
    }

    result = engineering_designs_collection.insert_one(
        design_document
    )

    created_design = (
        engineering_designs_collection.find_one(
            {"_id": result.inserted_id}
        )
    )

    return serialize_design(created_design)


@router.put("/{design_id}")
def update_engineering_design(
    design_id: str,
    design: EngineeringDesignUpdate
):

    if not ObjectId.is_valid(design_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid engineering design ID."
        )

    update_data = design.model_dump(
        exclude_unset=True
    )

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update."
        )

    update_data["updated_at"] = datetime.now(
        timezone.utc
    )

    result = engineering_designs_collection.update_one(
        {"_id": ObjectId(design_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Engineering design not found."
        )

    updated_design = (
        engineering_designs_collection.find_one(
            {"_id": ObjectId(design_id)}
        )
    )

    return serialize_design(updated_design)