import os
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from bson import ObjectId
from typing import List, Optional

app = FastAPI()

# 1. CORS Configuration (Allows both Render and your future Netlify site to talk to this API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://pms-backend-system.onrender.com",
        "https://your-app-name.netlify.app",  # <-- Replace with your actual Netlify URL when it's ready!
        "http://localhost:5173",             # Local Vite development port
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Database Connection
# Update the connection string if you migrate from local MongoDB to MongoDB Atlas in the cloud later
client = MongoClient("mongodb://localhost:27017")
db = client["project_management_db"]

# 3. Pydantic Schemas for Data Validation
class Employee(BaseModel):
    name: str
    role: str
    email: str

class Task(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    status: str = "Pending"  # Pending, In Progress, Completed

# Helper to convert MongoDB ObjectId to string
def serialize_doc(doc) -> dict:
    if not doc:
        return {}
    doc["_id"] = str(doc["_id"])
    return doc

# 4. API Core Endpoints

# --- EMPLOYEES ROUTING ---
@app.get("/api/employees")
def get_employees():
    employees = list(db.employees.find())
    return [serialize_doc(emp) for emp in employees]

@app.post("/api/employees")
def add_employee(employee: Employee):
    result = db.employees.insert_one(employee.dict())
    inserted_emp = db.employees.find_one({"_id": result.inserted_id})
    return serialize_doc(inserted_emp)

# --- TASKS ROUTING ---
@app.get("/api/tasks")
def get_tasks():
    tasks = list(db.tasks.find())
    return [serialize_doc(task) for task in tasks]

@app.post("/api/tasks")
def create_task(task: Task):
    result = db.tasks.insert_one(task.dict())
    inserted_task = db.tasks.find_one({"_id": result.inserted_id})
    return serialize_doc(inserted_task)

@app.put("/api/tasks/{task_id}")
def update_task_status(task_id: str, status_update: dict):
    if "status" not in status_update:
        raise HTTPException(status_code=400, detail="Status field required")
    
    db.tasks.update_one({"_id": ObjectId(task_id)}, {"$set": {"status": status_update["status"]}})
    updated_task = db.tasks.find_one({"_id": ObjectId(task_id)})
    return serialize_doc(updated_task)

# --- METRICS ROUTING ---
@app.get("/api/metrics")
def get_metrics():
    total_tasks = db.tasks.count_documents({})
    completed_tasks = db.tasks.count_documents({"status": "Completed"})
    total_employees = db.employees.count_documents({})
    
    return {
        "totalTasks": total_tasks,
        "completedTasks": completed_tasks,
        "totalEmployees": total_employees,
        "efficiencyRate": round((completed_tasks / total_tasks * 100), 2) if total_tasks > 0 else 0
    }

# 5. Dynamic Root Layout Path Mapping for Frontend Static Assets
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIST_DIR = os.path.join(BASE_DIR, "dist")

# Mount front end UI safely
if os.path.exists(FRONTEND_DIST_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST_DIR, html=True), name="frontend")
else:
    print(f"⚠️ Warning: Frontend production build directory not found at: {FRONTEND_DIST_DIR}")
