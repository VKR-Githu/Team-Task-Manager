# TaskFlow — Team Task Manager

A full-stack web app for managing projects, assigning tasks, and tracking team progress with role-based access control.

🔗 **Live URL**: https://attractive-reverence-production-67ab.up.railway.app

---

## Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS (dark theme)
- React Router v6
- Axios

**Backend**
- Node.js + Express
- Prisma ORM
- PostgreSQL
- JWT Authentication
- express-validator

**Deployment**
- Railway (backend + frontend + database in one project)

---

## How It Works

### Authentication
Users sign up with a name, email, and password. Passwords are hashed with bcrypt. On login, a JWT token is issued and stored in the browser. All protected routes require a valid token.

### Projects
A user creates a project and automatically becomes its Admin. They can invite other registered users by email, assigning them as Admin or Member. Each project has its own task board and member list.

### Tasks
Tasks live inside projects and have:
- Title and description
- Assignee (a project member)
- Priority — Low, Medium, High
- Status — To Do, In Progress, Done
- Due date (overdue tasks are highlighted in red)

Tasks are displayed in a Kanban board with three columns. Any member can update a task's status. Only Admins can create, edit, or delete tasks.

### Dashboard
The dashboard gives each user a personal overview:
- Total projects they're part of
- Tasks assigned to them
- Overdue task count
- Task breakdown by status

---

## Features

- Signup and login with JWT auth
- Create and manage projects
- Invite team members by email
- Role-based access — Admin vs Member
- Kanban board (To Do / In Progress / Done)
- Task assignment with priority and due dates
- Overdue task highlighting
- Personal dashboard with stats
- Fully responsive dark UI

---

## Role-Based Access

| Action | Admin | Member |
|---|---|---|
| Create / edit / delete tasks | ✅ | ❌ |
| Update task status | ✅ | ✅ |
| Add / remove members | ✅ | ❌ |
| Delete project | ✅ (owner only) | ❌ |

---

## Local Development

**Backend**
```bash
cd backend
cp .env.example .env
# fill in DATABASE_URL and JWT_SECRET
npm install
npx prisma db push
npm run dev
```

**Frontend**
```bash
cd frontend
cp .env.example .env
# set VITE_API_URL=http://localhost:4000/api
npm install
npm run dev
```

---

## Deployment (Railway)

1. Create a Railway project
2. Add a PostgreSQL database service
3. Deploy backend — set root directory to `backend`, add env vars:
   - `DATABASE_URL` from the Postgres service
   - `JWT_SECRET` — any random string
   - `FRONTEND_URL` — your frontend Railway URL
4. Deploy frontend — set root directory to `frontend`, add:
   - `VITE_API_URL` — your backend Railway URL + `/api`
5. Generate public domains for both services in Settings → Networking
