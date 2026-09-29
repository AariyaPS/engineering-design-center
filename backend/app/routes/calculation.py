from fastapi import APIRouter, HTTPException

from app.models.engineering_design import EngineeringDesignRequest
from app.services.calculation_service import perform_engineering_calculation


router = APIRouter(
    prefix="/api/calculate",
    tags=["Engineering Calculation"]
)


@router.post("/")
def calculate_design(request: EngineeringDesignRequest):

    try:
        result = perform_engineering_calculation(
            conductor_size_mm2=request.conductor_size_mm2,
            material=request.material,
            installation_condition=request.installation_condition,
            design_current_a=request.design_current_a,
            cable_length_m=request.cable_length_m,
            supply_voltage_v=request.supply_voltage_v
        )

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )