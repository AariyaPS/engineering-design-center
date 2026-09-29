from datetime import datetime, timezone

from app.database import (
    conductors_collection,
    materials_collection,
    installation_conditions_collection,
    current_ratings_collection,
    voltage_drop_collection,
    calculation_results_collection
)


def calculate_voltage_drop(
    voltage_drop_mv_per_a_m: float,
    design_current_a: float,
    cable_length_m: float
):
    voltage_drop_mv = (
        voltage_drop_mv_per_a_m
        * design_current_a
        * cable_length_m
    )

    voltage_drop_v = voltage_drop_mv / 1000

    return voltage_drop_v


def get_engineering_references(
    conductor_size_mm2: float,
    material: str,
    installation_condition: str
):
    material = material.upper()

    conductor = conductors_collection.find_one(
        {
            "conductor_size_mm2": conductor_size_mm2
        },
        {
            "_id": 0
        }
    )

    if conductor is None:
        raise ValueError(
            f"Conductor size {conductor_size_mm2} mm² "
            "is not available in the reference data."
        )

    material_reference = materials_collection.find_one(
        {
            "code": material
        },
        {
            "_id": 0
        }
    )

    if material_reference is None:
        raise ValueError(
            f"Material '{material}' is not available "
            "in the reference data."
        )

    installation_reference = installation_conditions_collection.find_one(
        {
            "code": installation_condition
        },
        {
            "_id": 0
        }
    )

    if installation_reference is None:
        raise ValueError(
            f"Installation condition '{installation_condition}' "
            "is not available in the reference data."
        )

    current_rating = current_ratings_collection.find_one(
        {
            "conductor_size_mm2": conductor_size_mm2,
            "material": material,
            "installation_condition": installation_condition
        },
        {
            "_id": 0
        }
    )

    voltage_drop_reference = voltage_drop_collection.find_one(
        {
            "conductor_size_mm2": conductor_size_mm2,
            "material": material
        },
        {
            "_id": 0
        }
    )

    return current_rating, voltage_drop_reference


def perform_engineering_calculation(
    conductor_size_mm2: float,
    material: str,
    installation_condition: str,
    design_current_a: float,
    cable_length_m: float,
    supply_voltage_v: float
):
    current_rating, voltage_drop_reference = get_engineering_references(
        conductor_size_mm2,
        material,
        installation_condition
    )

    if current_rating is None:
        raise ValueError(
            "No current rating found for the selected conductor, "
            "material, and installation condition."
        )

    if voltage_drop_reference is None:
        raise ValueError(
            "No voltage drop reference found for the selected "
            "conductor and material."
        )

    current_rating_a = current_rating["current_rating_a"]

    voltage_drop_mv_per_a_m = (
        voltage_drop_reference["voltage_drop_mv_per_a_m"]
    )

    voltage_drop_v = calculate_voltage_drop(
        voltage_drop_mv_per_a_m,
        design_current_a,
        cable_length_m
    )

    voltage_drop_percent = (
        voltage_drop_v / supply_voltage_v
    ) * 100

    current_capacity_status = (
        "PASS"
        if design_current_a <= current_rating_a
        else "FAIL"
    )

    result = {
        "conductor_size_mm2": conductor_size_mm2,
        "material": material.upper(),
        "installation_condition": installation_condition,
        "design_current_a": design_current_a,
        "current_rating_a": current_rating_a,
        "current_capacity_status": current_capacity_status,
        "cable_length_m": cable_length_m,
        "supply_voltage_v": supply_voltage_v,
        "voltage_drop_v": round(voltage_drop_v, 4),
        "voltage_drop_percent": round(voltage_drop_percent, 2)
    }

    # Save successful calculation to MongoDB
    history_record = {
        **result,
        "calculated_at": datetime.now(timezone.utc)
    }

    print("SAVING CALCULATION HISTORY:", history_record)

    calculation_results_collection.insert_one(history_record)

    return result