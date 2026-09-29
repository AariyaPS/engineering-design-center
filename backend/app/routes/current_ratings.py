from typing import Optional

from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel, Field
from bson import ObjectId

from app.database import current_ratings_collection


router = APIRouter(
    prefix="/api/current-ratings",
    tags=["Current Ratings"]
)


class CurrentRatingRequest(BaseModel):
    conductor_size_mm2: float = Field(gt=0)
    material: str
    installation_condition: str
    current_rating_a: float = Field(gt=0)


@router.get("/")
def get_current_ratings(
    conductor_size: Optional[float] = Query(default=None),
    material: Optional[str] = Query(default=None),
    installation_condition: Optional[str] = Query(default=None)
):
    filters = {}

    # Filter by conductor size
    if conductor_size is not None:
        filters["conductor_size_mm2"] = conductor_size

    # Filter by material
    if material is not None:
        filters["material"] = material.upper()

    # Filter by installation condition
    if installation_condition is not None:
        filters["installation_condition"] = installation_condition

    ratings = list(
        current_ratings_collection.find(filters)
        .sort("conductor_size_mm2", 1)
    )

    # Convert MongoDB ObjectId to string
    for rating in ratings:
        rating["_id"] = str(rating["_id"])

    return ratings


@router.post("/")
def add_current_rating(
    request: CurrentRatingRequest
):
    material = request.material.upper()

    # Check for duplicate
    existing_rating = current_ratings_collection.find_one(
        {
            "conductor_size_mm2": request.conductor_size_mm2,
            "material": material,
            "installation_condition": request.installation_condition
        }
    )

    if existing_rating:
        raise HTTPException(
            status_code=409,
            detail=(
                "A current rating already exists for this "
                "conductor size, material, and installation condition."
            )
        )

    new_rating = {
        "conductor_size_mm2": request.conductor_size_mm2,
        "material": material,
        "installation_condition": request.installation_condition,
        "current_rating_a": request.current_rating_a
    }

    result = current_ratings_collection.insert_one(new_rating)

    # Convert MongoDB ObjectId to string
    inserted_id = str(result.inserted_id)

    return {
        "message": "Current rating added successfully",
        "id": inserted_id,
        "data": {
            "id": inserted_id,
            "conductor_size_mm2": new_rating["conductor_size_mm2"],
            "material": new_rating["material"],
            "installation_condition": new_rating[
                "installation_condition"
            ],
            "current_rating_a": new_rating["current_rating_a"]
        }
    }


@router.put("/{rating_id}")
def update_current_rating(
    rating_id: str,
    request: CurrentRatingRequest
):
    try:
        object_id = ObjectId(rating_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid current rating ID"
        )

    material = request.material.upper()

    # Check whether another record already uses
    # the same conductor + material + installation combination.
    existing_rating = current_ratings_collection.find_one(
        {
            "conductor_size_mm2": request.conductor_size_mm2,
            "material": material,
            "installation_condition": request.installation_condition,
            "_id": {"$ne": object_id}
        }
    )

    if existing_rating:
        raise HTTPException(
            status_code=409,
            detail=(
                "Another current rating already exists for "
                "this conductor size, material, and "
                "installation condition."
            )
        )

    updated_rating = {
        "conductor_size_mm2": request.conductor_size_mm2,
        "material": material,
        "installation_condition": request.installation_condition,
        "current_rating_a": request.current_rating_a
    }

    result = current_ratings_collection.update_one(
        {"_id": object_id},
        {"$set": updated_rating}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Current rating not found"
        )

    return {
        "message": "Current rating updated successfully",
        "id": rating_id,
        "data": {
            "id": rating_id,
            "conductor_size_mm2": updated_rating[
                "conductor_size_mm2"
            ],
            "material": updated_rating["material"],
            "installation_condition": updated_rating[
                "installation_condition"
            ],
            "current_rating_a": updated_rating[
                "current_rating_a"
            ]
        }
    }

