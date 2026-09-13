from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uuid

app = FastAPI()

# CORS — allow the React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://todo-full-stack-day-04-sqmk.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- In-memory storage ----------
todos: dict[str, dict] = {}


# ---------- Schemas ----------
class TodoCreate(BaseModel):
    title: str


class TodoUpdate(BaseModel):
    title: Optional[str] = None
    completed: Optional[bool] = None


# ---------- Routes ----------
@app.get("/")
async def root():
    return {"message": "Todo API is running"}


@app.get("/todos")
async def get_todos():
    return list(todos.values())


@app.get("/todos/{todo_id}")
async def get_todo(todo_id: str):
    if todo_id not in todos:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todos[todo_id]


@app.post("/todos", status_code=201)
async def create_todo(todo: TodoCreate):
    todo_id = str(uuid.uuid4())
    new_todo = {"id": todo_id, "title": todo.title, "completed": False}
    todos[todo_id] = new_todo
    return new_todo


@app.put("/todos/{todo_id}")
async def update_todo(todo_id: str, todo: TodoUpdate):
    if todo_id not in todos:
        raise HTTPException(status_code=404, detail="Todo not found")
    if todo.title is not None:
        todos[todo_id]["title"] = todo.title
    if todo.completed is not None:
        todos[todo_id]["completed"] = todo.completed
    return todos[todo_id]


@app.delete("/todos/{todo_id}")
async def delete_todo(todo_id: str):
    if todo_id not in todos:
        raise HTTPException(status_code=404, detail="Todo not found")
    deleted = todos.pop(todo_id)
    return {"message": "Todo deleted", "todo": deleted}