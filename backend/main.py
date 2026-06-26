import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from pymongo import MongoClient

app = FastAPI(title="Project Management System Backend")

# Enable CORS so your Netlify frontend can securely talk to this Render backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows your Netlify URL to connect
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Cloud Connection Setup
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    # Fallback to local if environment variable isn't set yet
    client = MongoClient("mongodb://localhost:27017/")
else:
    client = MongoClient(MONGO_URI)

db = client["pms_database"]
employees_col = db["employees"]
tasks_col = db["tasks"]

# --- DATA MODELS (SCHEMAS) ---
class Employee(BaseModel):
    id: str
    name: str
    avatar: Optional[str] = "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"

class LoginRequest(BaseModel):
    id: str
    password: str

class Task(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    assigned_to: str
    status: str
    priority: str
    due_date: str
    comments: Optional[List[dict]] = []

# --- ROUTES ---

# 🔐 NEW: The Missing Employee Login Endpoint
@app.post("/api/employee/login")
async def employee_login(credentials: LoginRequest):
    # Search database for a matching ID string (e.g., "101")
    user = employees_col.find_one({"id": credentials.id})
    
    if not user:
        raise HTTPException(status_code=404, detail="Employee ID Not Found")
    
    # Check password. If no custom password field is set, default to their ID
    stored_password = user.get("password", user["id"])
    
    if credentials.password != stored_password:
        raise HTTPException(status_code=401, detail="Incorrect Security Password")
    
    # Return matched employee context to client side
    return {
        "status": "success",
        "employee": {
            "id": user["id"],
            "name": user["name"],
            "avatar": user.get("avatar", "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix")
        }
    }

@app.get("/api/employees")
async def get_employees():
    emps = list(employees_col.find({}, {"_id": 0}))
    return emps

@app.post("/api/employees")
async def add_employee(emp: Employee):
    if employees_col.find_one({"id": emp.id}):
        raise HTTPException(status_code=400, detail="Employee ID already exists")
    
    emp_dict = emp.dict()
    # Implicitly set default login password as their assigned ID
    emp_dict["password"] = emp.id
    employees_col.insert_one(emp_dict)
    return {"status": "success", "employee": emp}

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
        processed.append(t)
    return processed

@app.post("/api/tasks")
async def add_task(task: Task):
    task_dict = task.dict()
    if "id" in task_dict:
        del task_dict["id"]
    result = tasks_col.insert_one(task_dict)
    return {"status": "success", "id": str(result.inserted_id)}

@app.put("/api/tasks/{task_id}")
async def update_task(task_id: str, updates: dict):
    from bson import ObjectId
    tasks_col.update_one({"_id": ObjectId(task_id)}, {"$set": updates})
    return {"status": "success"}

@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: str):
    from bson import ObjectId
    tasks_col.delete_one({"_id": ObjectId(task_id)})
    return {"status": "success"}

@app.post("/api/tasks/{task_id}/comments")
async def add_comment(task_id: str, comment: dict):
    from bson import ObjectId
    import datetime
    comment["timestamp"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    tasks_col.update_one({"_id": ObjectId(task_id)}, {"$push": {"comments": comment}})
    return {"status": "success"}

@app.get("/api/metrics")
async def get_metrics():
    all_tasks = list(tasks_col.find({}))
    total = len(all_tasks)
    completed = len([t for t in all_tasks if t.get("status") == "DONE"])
    critical = len([t for t in all_tasks if t.get("priority") == "High" and t.get("status") != "DONE"])
    
    rate = round((completed / total) * 100) if total > 0 else 0
    return {"completion_rate": rate, "critical_count": critical}
