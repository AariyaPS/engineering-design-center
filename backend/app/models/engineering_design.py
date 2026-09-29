from typing import Optional

from pydantic import BaseModel, Field


class EngineeringDesignRequest(BaseModel):
    """
    Request model used by the existing cable calculation endpoint.
    """

    conductor_size_mm2: float = Field(
        ...,
        gt=0
    )

    material: str = Field(
        ...,
        min_length=1
    )

    installation_condition: str = Field(
        ...,
        min_length=1
    )

    design_current_a: float = Field(
        ...,
        gt=0
    )

    cable_length_m: float = Field(
        ...,
        gt=0
    )

    supply_voltage_v: float = Field(
        ...,
        gt=0
    )


class EngineeringDesignCreate(BaseModel):
    """
    Request model used when creating an Engineering Design.
    """

    design_name: str = Field(
        ...,
        min_length=1,
        max_length=150
    )

    client_name: str = Field(
        ...,
        min_length=1,
        max_length=150
    )

    project_name: Optional[str] = Field(
        default=None,
        max_length=150
    )

    description: Optional[str] = Field(
        default=None,
        max_length=500
    )

    supply_voltage_v: float = Field(
        ...,
        gt=0
    )

    design_current_a: float = Field(
        ...,
        gt=0
    )

    cable_length_m: float = Field(
        ...,
        gt=0
    )

    status: str = Field(
        default="Draft"
    )


class EngineeringDesignUpdate(BaseModel):
    """
    Request model used when updating an Engineering Design.
    """

    design_name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=150
    )

    client_name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=150
    )

    project_name: Optional[str] = Field(
        default=None,
        max_length=150
    )

    description: Optional[str] = Field(
        default=None,
        max_length=500
    )

    supply_voltage_v: Optional[float] = Field(
        default=None,
        gt=0
    )

    design_current_a: Optional[float] = Field(
        default=None,
        gt=0
    )

    cable_length_m: Optional[float] = Field(
        default=None,
        gt=0
    )

    status: Optional[str] = Field(
        default=None
    )