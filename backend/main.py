import os
import datetime
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from pymongo import MongoClient
from bson import ObjectId
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI(title="Project Management System Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATABASE SETUP ---
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    client = MongoClient("mongodb://localhost:27017/")
else:
    client = MongoClient(MONGO_URI)

db = client["pms_database"]
employees_col = db["employees"]
tasks_col = db["tasks"]

# --- DATA MODELS ---
class Employee(BaseModel):
    id: str  
    name: str
    avatar: Optional[str] = "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"

class LoginRequest(BaseModel):
    id: str  
    password: str

class PasswordChangeRequest(BaseModel):
    id: str
    old_password: str
    new_password: str

class Task(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    assigned_to: str
    status: str
    priority: str
    due_date: str
    comments: Optional[List[dict]] = []

# --- ENDPOINTS ---

@app.post("/api/employee/login")
async def employee_login(credentials: LoginRequest):
    clean_id = str(credentials.id).strip()
    user = employees_col.find_one({"id": clean_id})
    if not user:
        raise HTTPException(status_code=404, detail="Employee ID Not Found")
    stored_password = user.get("password", user["id"])
    if credentials.password != stored_password:
        raise HTTPException(status_code=401, detail="Incorrect Security Password")
    return {
        "status": "success",
        "employee": { "id": user["id"], "name": user["name"], "avatar": user.get("avatar") }
    }

@app.post("/api/employee/change-password")
async def change_password(req: PasswordChangeRequest):
    clean_id = str(req.id).strip()
    user = employees_col.find_one({"id": clean_id})
    if not user:
        raise HTTPException(status_code=404, detail="Employee ID Not Found")
    if req.old_password != user.get("password", user["id"]):
        raise HTTPException(status_code=401, detail="Current password incorrect")
    employees_col.update_one({"id": clean_id}, {"$set": {"password": req.new_password}})
    return {"status": "success"}

@app.get("/api/employees")
async def get_employees():
    return list(employees_col.find({}, {"_id": 0}))

@app.post("/api/employees")
async def add_employee(emp: Employee):
    clean_id = str(emp.id).strip()
    if employees_col.find_one({"id": clean_id}):
        raise HTTPException(status_code=400, detail="Employee ID already exists")
    emp_dict = emp.dict()
    emp_dict["id"] = clean_id
    emp_dict["password"] = clean_id  
    employees_col.insert_one(emp_dict)
    return {"status": "success", "employee": emp_dict}

@app.delete("/api/employees/{emp_id}")
async def delete_employee(emp_id: str):
    employees_col.delete_one({"id": emp_id})
    tasks_col.delete_many({"assigned_to": emp_id})
    return {"status": "success"}

@app.get("/api/tasks")
async def get_tasks():
    raw_tasks = list(tasks_col.find({}))
    processed = []
    for t in raw_tasks:
        t["id"] = str(t["_id"])
        del t["_id"]
        # Safeguard fallback to uppercase strings
        if "status" in t:
            t["status"] = str(t["status"]).upper()
        processed.append(t)
    return processed

@app.post("/api/tasks")
async def add_task(task: Task):
    task_dict = task.dict()
    if "id" in task_dict:
        del task_dict["id"]
    task_dict["status"] = str(task_dict.get("status", "TODO")).upper()
    result = tasks_col.insert_one(task_dict)
    return {"status": "success", "id": str(result.inserted_id)}

@app.put("/api/tasks/{task_id}")
async def update_task(task_id: str, updates: dict):
    # Automatically cast incoming status fields to UPPERCASE before database commits
    if "status" in updates:
        updates["status"] = str(updates["status"]).upper()
    tasks_col.update_one({"_id": ObjectId(task_id)}, {"$set": updates})
    return {"status": "success"}

@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: str):
    tasks_col.delete_one({"_id": ObjectId(task_id)})
    return {"status": "success"}

@app.post("/api/tasks/{task_id}/comments")
async def add_comment(task_id: str, comment: dict):
    comment["timestamp"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    tasks_col.update_one({"_id": ObjectId(task_id)}, {"$push": {"comments": comment}})
    return {"status": "success"}

@app.get("/api/metrics")
async def get_metrics():
    all_tasks = list(tasks_col.find({}))
    total = len(all_tasks)
    # Checks for clean, exact capitalization uppercase targets
    completed = len([t for t in all_tasks if str(t.get("status")).upper() == "DONE"])
    critical = len([t for t in all_tasks if str(t.get("priority")).upper() == "HIGH" and str(t.get("status")).upper() != "DONE"])
    rate = round((completed / total) * 100) if total > 0 else 0
    return {"completion_rate": rate, "critical_count": critical}

# 📩 Inbound Gmail Webhook Target Route
@app.post("/api/incoming-email")
async def receive_email_task(request: Request):
    try:
        data = await request.json()
        subject = data.get("subject", "New Task via Email")
        sender = data.get("from", "Unknown Sender")
        email_body = data.get("body", "No description text provided.")
        clean_description = f"--- Created via Father's Mail Inbox (Sender: {sender}) ---\n\n{email_body}"
        new_task = {
            "title": subject, "description": clean_description, "assigned_to": "Unassigned",  
            "status": "TODO", "priority": "Medium", "due_date": "Pending", "comments": []
        }
        result = tasks_col.insert_one(new_task)
        return {"status": "success", "task_id": str(result.inserted_id)}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# ==========================================
# 🌐 FRONTEND STATIC HOISTING RULES (Netlify Bypass)
# ==========================================

# Check if the folder exists locally before mounting to prevent startup crashes
if os.path.exists("dist"):
    # Serve bundled styles/scripts
    app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")

# Redirect all root and web router views straight to your React App layout
@app.get("/{catchall:path}")
async def serve_react_app(catchall: str):
    # Prevent the wild-card from stealing actual backend endpoint failures
    if catchall.startswith("api/"):
        raise HTTPException(status_code=404, detail="API route path endpoint completely missing.")
    
    if os.path.exists("dist/index.html"):
        return FileResponse("dist/index.html")
    
    return {"message": "Backend running seamlessly. Frontend 'dist' folder not detected yet."}
