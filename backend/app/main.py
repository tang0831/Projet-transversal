from app.controllers import acte_controller, auth_controller, citoyen_controller, forum_controller
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Plateforme Nationale d'Identité Civile Numérique (Vision 2035)")

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # À restreindre en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(citoyen_controller.router, prefix="/api")
app.include_router(auth_controller.router, prefix="/api")
app.include_router(acte_controller.router, prefix="/api")
app.include_router(forum_controller.router, prefix="/api")


@app.get("/")
def read_root():
    return {"message": "Bienvenue sur l'API Vision 2035"}
