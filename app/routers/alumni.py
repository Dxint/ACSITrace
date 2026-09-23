from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates

from app.services.survey_schema import get_survey_schema

router = APIRouter(prefix="/alumni", tags=["alumni"])
templates = Jinja2Templates(directory="app/templates")


@router.get("/survey")
def survey_form(request: Request):
    schema = get_survey_schema()
    return templates.TemplateResponse(
        request,
        "alumni_survey.html",
        {
            "intro": schema["intro"],
            "sections": schema["sections"],
            "first_step": schema["sections"][0]["id"],
        },
    )


@router.post("/survey")
async def submit_survey(request: Request):
    """Accepts the wizard's answers. Persistence (database, file uploads,
    auth) is out of scope for this page and will be wired up separately."""
    payload = await request.json()
    return JSONResponse({"status": "received", "field_count": len(payload)})
