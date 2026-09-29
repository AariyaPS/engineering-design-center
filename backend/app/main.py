from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.conductors import router as conductors_router
from app.routes.materials import router as materials_router
from app.routes.installation_conditions import router as installation_conditions_router
from app.routes.current_ratings import (router as current_ratings_router)
from app.routes.voltage_drop import (router as voltage_drop_router)
from app.routes.calculation import router as calculation_router
from app.routes.calculation_history import (router as calculation_history_router)
from app.routes.engineering_designs import (router as engineering_designs_router)


app = FastAPI(
    title="Engineering Design Center API",
    description="Backend API for the Engineering Design Center application",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins =["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(conductors_router)
app.include_router(materials_router)
app.include_router(installation_conditions_router)
app.include_router(current_ratings_router)
app.include_router(voltage_drop_router)
app.include_router(calculation_router)
app.include_router(calculation_history_router)
app.include_router(engineering_designs_router)

@app.get("/")
def root():
    return {
        "message": "Engineering Design Center API is running"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy"
    }