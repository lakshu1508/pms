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
    avatar: str
    password: Optional[str] = None  # New field for custom employee passwords

class Task(BaseModel):
    id: str
    title: str
    desc: str
    status: str          # "Pending", "In-Progress", "Done"
    assigned_to: str     # Matches Employee ID
    due_date: str

# Seed database with initial fallback data if completely empty
if employees_col.count_documents({}) == 0:
    employees_col.insert_many([
        {"id": "EMP-101", "name": "Sarah Connor", "avatar": "👩‍💻", "password": "EMP-101"},
        {"id": "EMP-102", "name": "Alex Mercer", "avatar": "👨‍💻", "password": "EMP-102"},
        {"id": "EMP-103", "name": "Elena Rostova", "avatar": "👩‍🔬", "password": "EMP-103"},
    ])

# --- ENDPOINTS ---

# 1. Fetch all employees (Used by Admin to see the master list)
@app.get("/api/employees", response_model=List[Employee])
def get_employees():
    employees = list(employees_col.find({}, {"_id": 0}))
    return employees

# 2. Onboard a new employee (Sets password to Employee ID by default)
@app.post("/api/employees")
def create_employee(employee: Employee):
    emp_data = employee.dict()
    
    # If no custom password is supplied, set it to their unique Employee ID
    if not emp_data.get("password"):
        emp_data["password"] = emp_data["id"]
        
    if employees_col.find_one({"id": emp_data["id"]}):
        raise HTTPException(status_code=400, detail="Employee ID already exists")
        
    employees_col.insert_one(emp_data)
    return {"status": "success", "message": f"Employee {employee.name} onboarded!"}

# 3. Offboard/Delete an employee
@app.delete("/api/employees/{emp_id}")
def delete_employee(emp_id: str):
    result = employees_col.delete_one({"id": emp_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    # Clean up their tasks too
    tasks_col.delete_many({"assigned_to": emp_id})
    return {"status": "success", "message": "Employee and their tasks removed"}

# 4. Fetch all tasks (Admin complete view)
@app.get("/api/tasks", response_model=List[Task])
def get_tasks():
    return list(tasks_col.find({}, {"_id": 0}))

# 5. Fetch tasks assigned to ONE specific employee (Secure Portal View)
@app.get("/api/tasks/employee/{emp_id}", response_model=List[Task])
def get_employee_tasks(emp_id: str):
    return list(tasks_col.find({"assigned_to": emp_id}, {"_id": 0}))

# 6. Create a brand new task
@app.post("/api/tasks")
def create_task(task: Task):
    if tasks_col.find_one({"id": task.id}):
        raise HTTPException(status_code=400, detail="Task ID already exists")
    tasks_col.insert_one(task.dict())
    return {"status": "success", "message": "Task assigned successfully!"}

# 7. Update an ongoing task's status
@app.put("/api/tasks/{task_id}")
def update_task_status(task_id: str, data: dict):
    new_status = data.get("status")
    if new_status not in ["Pending", "In-Progress", "Done"]:
        raise HTTPException(status_code=400, detail="Invalid status type")
        
    result = tasks_col.update_one({"id": task_id}, {"$set": {"status": new_status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"status": "success", "message": "Task status updated"}

# 8. New: Secure Employee Login Verification
@app.post("/api/employee/login")
def employee_login(data: dict):
    emp_id = data.get("id")
    password = data.get("password")
    
    if not emp_id or not password:
        raise HTTPException(status_code=400, detail="Missing ID or password")
        
    employee = employees_col.find_one({"id": emp_id})
    
    if not employee:
        raise HTTPException(status_code=404, detail="Employee ID not found")
        
    if employee.get("password") != password:
        raise HTTPException(status_code=401, detail="Incorrect password")
        
    return {
        "status": "success",
        "employee": {
            "id": employee["id"],
            "name": employee["name"],
            "avatar": employee["avatar"]
        }
    }

# Root Health Check
@app.get("/")
def read_root():
    return {"status": "online", "database": "connected_to_atlas"}
