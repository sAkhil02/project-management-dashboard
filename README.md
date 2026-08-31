# Project & Method Management Dashboard

A full-stack admin dashboard for managing projects and their associated methods, with admin login, search/filter, and CRUD operations — built as a learning project pairing a React + TypeScript frontend with a FastAPI backend.

## Features

- 🔐 Admin login (via email or phone number + password)
- 📁 Create, view, update, and delete **Projects**
- 🧩 Create, view, update, and delete **Methods** linked to each project
- 🔎 Search projects and methods by name, description, priority, budget, or active status
- 👤 Admin management (add/remove admins)
- 🔔 Toast notifications for user feedback (via `react-toastify`)

## Tech Stack

**Frontend**
- React + TypeScript
- Vite
- react-toastify

**Backend**
- FastAPI
- SQLModel (SQLAlchemy + Pydantic)
- CORS middleware configured for local dev (`localhost:5173`)

## Project Structure

```
.
├── frontend/          # React + TypeScript client (Vite)
│   ├── src/
│   │   ├── Web/App.tsx
│   │   ├── Pages/
│   │   │   ├── Login/
│   │   │   └── Dashboard/
│   │   │       ├── ProjectManager/
│   │   │       └── AdminManager/
│   │   ├── Component/
│   │   ├── Service/Api.ts
│   │   └── Style/
│   └── package.json
│
└── backend/           # FastAPI server
    ├── endpoints.py
    ├── Schemas/
    ├── Services/
    ├── Models/
    ├── Database/
    └── requirements.txt
```

## Getting Started

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn endpoints:app --reload
```

The API will be available at `http://localhost:8000`, with interactive docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## API Overview

| Method |       Endpoint       |                       Description                     |
|--------|----------------------|-------------------------------------------------------|
| POST   | `/Master_API`        | Main create/update entry point for projects & methods |
| GET    | `/Get_Only_Projects` | Fetch project(s) by ID                                |
| GET    | `/Get_Only_Methods`  | Fetch method(s) by ID                                 |
| DELETE | `/Del_Project`       | Delete a project                                      |
| DELETE | `/Del_Method`        | Delete a method                                       |
| POST   | `/Search_Info`       | Search projects/methods by filters                    |
| POST   | `/Admin_check`       | Admin login                                           |
| POST   | `/Add_Admin`         | Add a new admin                                       |
| DELETE | `/Del_Admin`         | Remove an admin                                       |
| GET    | `/All_Admin`         | List all admins                                       |

## Author

Built by Satya as a personal/learning project.
