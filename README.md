# 🏏 BNI – TPL 2026 | Trichy Premier League — Registration System

Full-stack player registration system built with **FastAPI** (backend) + **React + TypeScript** (frontend).

---

## 📁 Project Structure

```
bni-tpl-2026/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app entry point
│   │   ├── core/
│   │   │   ├── config.py         # Settings (env vars)
│   │   │   └── security.py       # JWT utilities
│   │   ├── db/
│   │   │   ├── database.py       # SQLAlchemy engine + session
│   │   │   └── seed.py           # Initial data seeding (20 teams)
│   │   ├── models/
│   │   │   └── models.py         # SQLAlchemy ORM models
│   │   ├── schemas/
│   │   │   └── schemas.py        # Pydantic request/response schemas
│   │   ├── routes/
│   │   │   ├── public.py         # /register, /teams
│   │   │   └── admin.py          # /admin/* (JWT protected)
│   │   └── services/
│   │       └── registration_service.py
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   │       └── 001_initial_migration.py
│   ├── alembic.ini
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.tsx
    │   │   └── ProtectedRoute.tsx
    │   ├── pages/
    │   │   ├── HomePage.tsx
    │   │   ├── RegisterPage.tsx
    │   │   ├── PointsTablePage.tsx
    │   │   ├── AdminLoginPage.tsx
    │   │   └── AdminDashboardPage.tsx
    │   ├── services/
    │   │   └── api.ts            # Axios API client
    │   ├── hooks/
    │   │   └── useAuth.ts        # JWT auth hook
    │   ├── styles/
    │   │   └── global.css        # BNI-TPL design system
    │   ├── App.tsx
    │   └── main.tsx
    ├── index.html
    ├── vite.config.ts
    ├── package.json
    └── .env
```

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **PostgreSQL 14+**

---

### 1️⃣ Database Setup (PostgreSQL)

```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create the database
CREATE DATABASE bni_tpl_2026;

-- Exit
\q
```

---

### 2️⃣ Backend Setup

```bash
cd bni-tpl-2026/backend

# Create virtual environment
python -m venv venv

# Activate (Linux/macOS)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Edit .env with your PostgreSQL credentials:
#   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/bni_tpl_2026
```

#### Run Alembic Migrations

```bash
# Initialize alembic (already done — skip if alembic.ini exists)
# alembic init alembic

# Run migrations
alembic upgrade head
```

#### Start the Backend Server

#####Run this from the backend/ directory:

python -m app.db.seed

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at: **http://localhost:8000**
API Docs at: **http://localhost:8000/docs**

---

### 3️⃣ Frontend Setup

```bash
cd bni-tpl-2026/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 🔐 Admin Credentials

```
Username : admin
Password : Admin@BNI2026
```

Admin login URL: **http://localhost:5173/admin/login**

> ⚠️ Change the password in `backend/.env` before deploying to production!

---

## 🌐 API Endpoints

### Public (No Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/teams` | Fetch all teams (dropdown) |
| POST | `/register` | Submit player registration |

### Admin (JWT Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/login` | Get JWT token |
| GET | `/admin/registrations` | List all registrations |
| GET | `/admin/export` | Download Excel file |

---

## 📋 Registration Form Fields

| Field | Type | Validation |
|-------|------|-----------|
| Team/Chapter Name | Dropdown | Required, must exist in DB |
| Player Name | Text | Required |
| Phone Number | Text | Indian format: +91 + 10 digits starting 6-9 |
| Jersey Name | Text | Required |
| Jersey Number | Number | Required, 0–999 |
| Jersey Size | Dropdown | XS, S, M, L, XL, XXL |
| Lower Size | Dropdown | XS, S, M, L, XL, XXL |

---

## 🏆 Teams (Pre-seeded)

All 20 teams are auto-seeded on first startup:
Azpire, Benchmark, Champions, Dynamic, EMPEROR, FORTUNE, GLADIATORS, HARMONY, ICONS, JAAGUAR, KINGS, Legends, Millionaire, Nest, PRINCE, SPARK, OSCAR, TYCOON, ROYALS, WARRIORS

---

## 🏗 Build for Production

### Backend
```bash
# Use gunicorn in production
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend
```bash
cd frontend
npm run build
# Output in: frontend/dist/
```

---

## 🔧 Environment Variables

### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/bni_tpl_2026
SECRET_KEY=your-super-secret-jwt-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@BNI2026
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8000
```

---

## 📊 Excel Export

The export endpoint (`GET /admin/export`) generates an Excel file with columns:
- Team Name, Player Name, Phone Number, Jersey Name, Jersey Number, Jersey Size, Lower Size, Registered At

Accessible only with a valid JWT token (admin login required).

---

## 🛡 Security

- Passwords stored securely with **bcrypt**
- Routes protected with **JWT Bearer tokens**
- CORS configured for localhost dev (update for production)
- Input validation on both frontend and backend
