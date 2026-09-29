from fastapi import APIRouter, HTTPException 
from pydantic import BaseModel
from bson import ObjectId 

from app.database import installation_conditions_collection

router = APIRouter(
    prefix= "/api/installation-conditions",
    tags=["Installation Conditions"]
)

class InstallationConditionRequest(BaseModel):
    code: str 
    name: str 

@router.get("/")
def get_installation_conditions():
    conditions = list(
        installation_conditions_collection.find({})
        .sort("code",1)
    )

    # Convert MongoDB ObjectId to string
    for condition in conditions:
        condition["_id"] = str(condition["_id"])

    return conditions 

@router.post("/")
def add_installation_condition(
    request: InstallationConditionRequest
):
    code = request.code.lower()

    # Check for duplicate condition code
    existing_condition = installation_conditions_collection.find_one(
        {
            "code": code
        }
    ) 

    if existing_condition:
        raise HTTPException(
            status_code=409,
            detail=(
                f"Installation condition code"
                f"'{code}' already exists."
            )
        )

    new_condition= {
        "code": code,
        "name": request.name
    }

    result = installation_conditions_collection.insert_one(new_condition)

    inserted_id = str(result.inserted_id)

    return{
        "message": "Installation condition added successfully",
        "id": inserted_id,
        "data": {
            "id": inserted_id,
            "code": new_condition["code"],
            "name": new_condition["name"]
        }
    }

@router.put("/{condition_id}")
def update_installation_condition(
    condition_id: str,
    request: InstallationConditionRequest
):
    try:
        object_id = ObjectId(condition_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid installation condition ID"
        )

    code = request.code.lower()

    # Check whether another condition already
    # Uses the request code.
    existing_condition = installation_conditions_collection.find_one(
        {
            "code": code,
            "_id": {"$ne": object_id}
        }
    )
            
    if existing_condition:
        raise HTTPException(
            status_code=409,
            detail=(
                f"Another installation condition with "
                f"code '{code}' already exists."
            )
        )  

    updated_condition = {
        "code" : code,
        "name": request.name
    } 

    result = installation_conditions_collection.update_one(
        {"_id": object_id},
        {"$set": updated_condition}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Installation condition not found"
        )

    return {
        "message": "Installation condition updated successfully",
        "id": condition_id,
        "data": {
            "id": condition_id,
            "code": updated_condition["code"],
            "name": updated_condition["name"]
        }
    }