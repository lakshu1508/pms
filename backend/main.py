from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid
import json
import os
from datetime import datetime

app = FastAPI(title="Persistent Project Management Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILE = "database.json"

# 💾 FILE UTILITIES: Read and Write data directly to your hard drive file
def load_data():
    if not os.path.exists(DB_FILE):
        # Default starter configuration seed data if file doesn't exist yet
        initial_seed = {
            "employees": [
                {"id": "EMP-101", "name": "Sarah Connor", "avatar": "👩‍💻"},
                {"id": "EMP-102", "name": "Alex Mercer", "avatar": "👨‍💻"},
                {"id": "EMP-103", "name": "Elena Rostova", "avatar": "👩‍🔬"},
            ],
            "tasks": [
                {
                    "id": "demo-task-1",
                    "title": "Database Optimization Sync",
                    "description": "Index user records and clear stale query cache structures.",
                    "status": "in-progress",
                    "assignedTo": "EMP-101",
                    "priority": "High",
                    "due_date": "2026-07-15",
                    "comments": []
                }
            ]
        }
        save_data(initial_seed)
        return initial_seed
    
    with open(DB_FILE, "r") as f:
        return json.load(f)

def save_data(data):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=4)

# 📐 Strict Schemas
class CommentSubmit(BaseModel):
    author: str
    text: str

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    status: str
    assignedTo: str
    priority: str
    due_date: str

class TaskUpdate(BaseModel):
    status: str

class EmployeeCreate(BaseModel):
    id: str
    name: str
    avatar: str

# 📡 METRICS ENDPOINT
@app.get("/api/metrics")
def get_dashboard_metrics():
    db = load_data()
    total_tasks = len(db["tasks"])
    if total_tasks == 0:
        return {"completion_rate": 0, "critical_count": 0}
    done_tasks = len([t for t in db["tasks"] if t["status"] == "done"])
    critical_tasks = len([t for t in db["tasks"] if t["priority"] == "Critical"])
    return {"completion_rate": round((done_tasks / total_tasks) * 100), "critical_count": critical_tasks}

# 📡 EMPLOYEES
@app.get("/api/employees")
def get_employees():
    return load_data()["employees"]

# 👤 ONBOARD EMPLOYEE
@app.post("/api/employees")
def create_employee(employee: EmployeeCreate):
    db = load_data()
    
    # Check if ID already exists
    if any(e["id"] == employee.id.upper().strip() for e in db["employees"]):
        raise HTTPException(status_code=400, detail="Employee ID already exists")
        
    new_emp = {
        "id": employee.id.upper().strip(),
        "name": employee.name,
        "avatar": employee.avatar
    }
    db["employees"].append(new_emp)
    save_data(db)
    return new_emp

# 🗑️ DELETE EMPLOYEE
@app.delete("/api/employees/{employee_id}")
def delete_employee(employee_id: str):
    db = load_data()
    original_count = len(db["employees"])
    db["employees"] = [e for e in db["employees"] if e["id"] != employee_id]
    
    if len(db["employees"]) == original_count:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    save_data(db)
    return {"message": "Employee deleted successfully"}

# 📡 TASKS & OPERATIONS
@app.get("/api/tasks")
def get_tasks():
    return load_data()["tasks"]

@app.post("/api/tasks")
def create_task(task: TaskCreate):
    db = load_data()
    new_task = task.dict()
    new_task["id"] = str(uuid.uuid4())
    new_task["comments"] = []
    db["tasks"].append(new_task)
    save_data(db)
    return new_task

@app.put("/api/tasks/{task_id}")
def update_task(task_id: str, task_update: TaskUpdate):
    db = load_data()
    for task in db["tasks"]:
        if task["id"] == task_id:
            task["status"] = task_update.status
            save_data(db)
            return task
    raise HTTPException(status_code=404, detail="Task not found")

@app.post("/api/tasks/{task_id}/comments")
def add_task_comment(task_id: str, comment: CommentSubmit):
    db = load_data()
    for task in db["tasks"]:
        if task["id"] == task_id:
            new_comment = {
                "id": str(uuid.uuid4()),
                "author": comment.author,
                "text": comment.text,
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M")
            }
            task["comments"].append(new_comment)
            save_data(db)
            return task
    raise HTTPException(status_code=404, detail="Task not found")

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: str):
    db = load_data()
    initial_count = len(db["tasks"])
    db["tasks"] = [t for t in db["tasks"] if t["id"] != task_id]
    if len(db["tasks"]) < initial_count:
        save_data(db)
        return {"message": "Success"}
    raise HTTPException(status_code=404, detail="Task not found")
