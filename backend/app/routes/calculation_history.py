from fastapi import APIRouter

from app.database import calculation_results_collection


router = APIRouter(
    prefix="/api/calculation-history",
    tags=["Calculation History"]
)


@router.get("/")
def get_calculation_history():
    records = list(
        calculation_results_collection.find(
            {},
            {
                "_id": 1,
                "conductor_size_mm2": 1,
                "material": 1,
                "installation_condition": 1,
                "design_current_a": 1,
                "current_rating_a": 1,
                "current_capacity_status": 1,
                "cable_length_m": 1,
                "supply_voltage_v": 1,
                "voltage_drop_v": 1,
                "voltage_drop_percent": 1,
                "calculated_at": 1
            }
        ).sort(
            "calculated_at",
            -1
        )
    )

    for record in records:
        record["_id"] = str(record["_id"])

        if record.get("calculated_at"):
            record["calculated_at"] = (
                record["calculated_at"].isoformat()
            )

    return records