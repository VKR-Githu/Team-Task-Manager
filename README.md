# Team Task Manager

Full-stack task management app with role-based access control.

## Stack
- **Backend**: Node.js, Express, Prisma, PostgreSQL
- **Frontend**: React, Vite, TailwindCSS
- **Auth**: JWT

## Local Development

### Backend
```bash
cd backend
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
npm install
npx prisma db push
npm run dev
```

### Frontend
```bash
cd frontend
cp .env.example .env   # set VITE_API_URL=http://localhost:4000/api
npm install
npm run dev
```

## Deploy to Railway

### 1. Create a Railway project
Go to [railway.app](https://railway.app) and create a new project.

### 2. Add PostgreSQL
In your Railway project, click **+ New** → **Database** → **PostgreSQL**.  
Copy the `DATABASE_URL` from the database's **Variables** tab.

### 3. Deploy the Backend
- Click **+ New** → **GitHub Repo** → select this repo
- Set **Root Directory** to `backend`
- Add environment variables:
  - `DATABASE_URL` — from step 2
  - `JWT_SECRET` — any long random string
  - `FRONTEND_URL` — your frontend Railway URL (add after deploying frontend)

### 4. Deploy the Frontend
- Click **+ New** → **GitHub Repo** → select this repo again
- Set **Root Directory** to `frontend`
- Add environment variable:
  - `VITE_API_URL` — your backend Railway URL + `/api`  
    e.g. `https://your-backend.up.railway.app/api`

### 5. Update CORS
Go back to the backend service and set `FRONTEND_URL` to your frontend Railway URL.

## Features
- Signup / Login with JWT auth
- Create projects, invite members by email
- Role-based access: Admin (full control) / Member (status updates only)
- Task creation with title, description, assignee, priority, due date
- Kanban board view (TODO / IN PROGRESS / DONE)
- Dashboard with stats, my tasks, overdue count
