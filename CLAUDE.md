# Project Overview
This is a web application for Alumni Tracking and an Admin Statistics Dashboard. 
It is built by a 4th-year BSIT student. The code must be clean, readable, and strictly adhere to MVC-style separation of concerns for academic grading and future handovers.

## Tech Stack
*   **Backend:** Python 3.x with FastAPI.
*   **Database:** MySQL (using SQLAlchemy as the ORM, and PyMySQL or asyncmy as the driver).
*   **Frontend:** HTML templates (Jinja2) styled directly with Tailwind CSS.
*   **File Handling:** FastAPI's `UploadFile` for processing CVs/Resumes.

## Current Scope & Features
**Alumni Portal:** 
*   A clean, Google-Form-style page for inputting current job details and industry.
*   A secure file upload endpoint for accepting CV/Resume files (.pdf, .docx).
*   A "Past Inputs" page displaying a history of their submitted data.

**Admin Portal:**
*   A statistical dashboard summarizing alumni employment data.
*   A page for viewing of complete alumni data separated by batch.
*   A page reserved for an AI assistant

## Future-Proofing (AI Readiness Rules)
**CRITICAL:** There are NO artificial intelligence features in the current scope. Do not generate LLM calls, OpenAI integrations, or vector databases. However, the architecture must be designed to support them later:
1.  **For Future Resume Datafication:** Store uploaded CVs/Resumes in a structured local `uploads/` directory, and store the exact file path and file type in the MySQL database. Keep everything organized so a future AI parser can easily loop through the files to extract text.
2.  **For Future Admin AI Assistant:** Decouple all database queries from the FastAPI route endpoints. Place all queries in a dedicated `crud.py` or `services.py` file. A future AI agent will need to call these functions directly to answer admin questions, so they must be modular.

## Development Rules
*   **UI/Tailwind:** Build responsive, professional layouts using Tailwind utility classes.
*   **Completeness:** When generating or fixing code, provide complete, functional blocks. Avoid lazy placeholders like `# ... your code here`.
*   **Readability and Simplicity:** When generating or fixing code, provide blocks that can be understood by a 4th year college student. Do not add any code unnecessary or too complex for a college capstone project.

## Key Commands
*   Start the backend: `uvicorn main:app --reload`
*   Compile Tailwind: `npx tailwindcss -i ./static/src/input.css -o ./static/css/output.css --watch`

## Security Rules
*   **Authentication & Authorization:** Implement OAuth2 with JWT (JSON Web Tokens) for secure login. Strictly separate `alumni` and `admin` roles. FastAPI route dependencies must verify that an alumni can only access their own user ID's data.
*   **File Upload Hardening:** Strictly validate the MIME type upon upload (accept ONLY `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`). Enforce a 5MB file size limit. Store uploaded files in a secure directory that is NOT directly accessible via public URLs.
*   **Secrets Management:** Never hardcode credentials. Use `pydantic-settings` to load the database URL, JWT secret keys, and algorithm types from a `.env` file. Ensure `.env` is in the `.gitignore`.
*   **Database Security:** Rely exclusively on SQLAlchemy ORM models to prevent SQL Injection. Do not execute raw SQL strings.
*   **Input Validation:** Use Pydantic schemas for all incoming form data and JSON payloads to ensure data strictly matches expected types before it reaches the database.
