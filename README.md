# 🚀 Mini Project Management System

A full-stack Project Management System built using:

- Backend: Node.js (Express)
- Database: SQLite
- Frontend: React.js

This project allows users to create projects, manage tasks, and track progress using a simple Kanban-style UI.

---

## 📌 Features

### 🟢 Project Features
- Create Project
- View all Projects
- View single Project with Tasks
- Delete Project
- Pagination support

### 🔵 Task Features
- Create Task under a Project
- Update Task status (TODO / IN_PROGRESS / DONE)
- Delete Task
- Filter tasks by status
- Sort tasks by due date

---

## ⚙️ Backend Setup

### 1. Install dependencies
```bash
npm install
## 📸 Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Projects
![Projects](screenshots/projects.png)

### Kanban Board
![Kanban Board](screenshots/kanban-board.png)

### Pagination
![Pagination](screenshots/pagination.png)
## 📘 API Documentation

### Base URL
http://localhost:5000/api

---

### 🟢 PROJECT APIs

GET /projects?page=1&limit=10  
POST /projects  
GET /projects/:id  
DELETE /projects/:id  

---

### 🔵 TASK APIs

POST /projects/:projectId/tasks  
GET /projects/:projectId/tasks  
PUT /tasks/:id  
DELETE /tasks/:id  

---

### 🔍 FILTER / SORT

?status=TODO  
?sort=dueDate  
?status=TODO&sort=dueDate