import json

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse

from app.routers import alumni

app = FastAPI(title="ACSITrace")

alumni.templates.env.filters["tojson"] = json.dumps

app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(alumni.router)


@app.get("/")
def root():
    return RedirectResponse(url="/alumni/survey")
