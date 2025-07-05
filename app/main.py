from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from app.services.auth_service import verify_and_store_user, get_user_by_token
from firebase_admin import auth

app = FastAPI()
app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")

@app.get("/", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("auth/login.html", {"request": request})

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard_page(request: Request):
    return templates.TemplateResponse("dashboard/index.html", {"request": request})

@app.post("/auth")
async def auth_user(data: dict):
    token = data.get("token")
    user = verify_and_store_user(token)
    return {"uid": user.uid}

@app.get("/api/lists")
async def get_lists():
    return {
        "lists": [
            {
            "name": "Milk",
            "emoji": "🥛",
            "added_by_name": "Dad",
            "note": "Buy low fat"
            },
            {
            "name": "Eggs",
            "emoji": "🥚",
            "added_by_name": "Anna",
            "note": "Brown eggs only"
            }
        ]
    }

# ✅ New route to get current authenticated user's info
@app.get("/api/user")
async def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    token = auth_header.replace("Bearer ", "")
    user_data = get_user_by_token(token)
    return user_data
