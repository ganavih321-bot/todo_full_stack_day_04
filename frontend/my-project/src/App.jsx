import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:8000";

function App() {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [filter, setFilter] = useState("all"); // all | active | completed

  // Fetch all todos on mount
  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    const res = await fetch(`${API_URL}/todos`);
    const data = await res.json();
    setTodos(data);
  }

  async function addTodo(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const res = await fetch(`${API_URL}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim() }),
    });
    const created = await res.json();
    setTodos((prev) => [...prev, created]);
    setNewTitle("");
  }

  async function toggleComplete(todo) {
    const res = await fetch(`${API_URL}/todos/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed }),
    });
    const updated = await res.json();
    setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  async function deleteTodo(id) {
    await fetch(`${API_URL}/todos/${id}`, { method: "DELETE" });
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function startEditing(todo) {
    setEditingId(todo.id);
    setEditTitle(todo.title);
  }

  async function saveEdit(id) {
    if (!editTitle.trim()) return;
    const res = await fetch(`${API_URL}/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle.trim() }),
    });
    const updated = await res.json();
    setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setEditingId(null);
    setEditTitle("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
  }

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;

  return (
    <div className="app-wrapper">
      {/* Background animated shapes */}
      <div className="bg-shape bg-shape-1" />
      <div className="bg-shape bg-shape-2" />
      <div className="bg-shape bg-shape-3" />

      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <div className="header-icon">✦</div>
          <h1>Todo App</h1>
          <p className="subtitle">Stay organized. Get things done.</p>
        </header>

        {/* Add Todo Form */}
        <form className="add-form" onSubmit={addTodo}>
          <input
            id="new-todo-input"
            type="text"
            className="add-input"
            placeholder="What needs to be done?"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button type="submit" className="add-btn" disabled={!newTitle.trim()}>
            <span className="add-btn-icon">+</span>
          </button>
        </form>

        {/* Filter Bar */}
        {todos.length > 0 && (
          <div className="filter-bar">
            <div className="filter-buttons">
              {["all", "active", "completed"].map((f) => (
                <button
                  key={f}
                  className={`filter-btn ${filter === f ? "active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <span className="task-count">
              {activeCount} task{activeCount !== 1 ? "s" : ""} remaining
            </span>
          </div>
        )}

        {/* Todo List */}
        <ul className="todo-list">
          {filtered.length === 0 && todos.length > 0 && (
            <li className="empty-state">No {filter} tasks found.</li>
          )}
          {filtered.length === 0 && todos.length === 0 && (
            <li className="empty-state">
              <span className="empty-icon">📝</span>
              <span>Add your first task above!</span>
            </li>
          )}
          {filtered.map((todo) => (
            <li
              key={todo.id}
              className={`todo-item ${todo.completed ? "completed" : ""}`}
            >
              {editingId === todo.id ? (
                <div className="edit-row">
                  <input
                    className="edit-input"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(todo.id);
                      if (e.key === "Escape") cancelEdit();
                    }}
                    autoFocus
                  />
                  <button
                    className="icon-btn save-btn"
                    onClick={() => saveEdit(todo.id)}
                    title="Save"
                  >
                    ✓
                  </button>
                  <button
                    className="icon-btn cancel-btn"
                    onClick={cancelEdit}
                    title="Cancel"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="todo-row">
                  <button
                    className={`check-btn ${todo.completed ? "checked" : ""}`}
                    onClick={() => toggleComplete(todo)}
                    title={todo.completed ? "Mark incomplete" : "Mark complete"}
                  >
                    {todo.completed && <span className="check-icon">✓</span>}
                  </button>
                  <span
                    className="todo-title"
                    onDoubleClick={() => startEditing(todo)}
                  >
                    {todo.title}
                  </span>
                  <div className="todo-actions">
                    <button
                      className="icon-btn edit-btn"
                      onClick={() => startEditing(todo)}
                      title="Edit"
                    >
                      ✎
                    </button>
                    <button
                      className="icon-btn delete-btn"
                      onClick={() => deleteTodo(todo.id)}
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
