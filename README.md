# FreelanceFlow

A full-stack SaaS application built to help freelancers manage clients, projects, tasks, time tracking, invoices, and business performance from a single dashboard.

---

## 🚀 Features

### 🔐 Authentication
- User Registration & Login
- JWT Authentication
- Password Hashing (bcrypt)
- Protected Routes
- FREE & PRO Plans

### 👥 Client Management
- Create Clients
- Edit Clients
- Delete Clients
- View Client Details

### 📁 Project Management
- Create Projects
- Update Projects
- Delete Projects
- Project Status Tracking

### ✅ Task Management
- Create Tasks
- Update Tasks
- Delete Tasks
- Due Dates
- Task Status Management

### ⏱️ Time Tracking
- Start/Stop Live Timer
- Manual Time Entry
- Time Log History
- Burn Rate Calculation

### 💰 Invoice Management
- Generate Invoices
- Invoice Status
- PDF Invoice Download
- Revenue Tracking

### 📊 Dashboard
- Active Projects
- Pending Invoices
- Outstanding Payments
- Revenue Overview
- Upcoming Deadlines

### 🔎 Productivity
- Global Search
- Filters
- Sorting
- Loading Skeletons
- Toast Notifications
- Responsive Design

---

# 🛠 Tech Stack

## Frontend

- React.js
- Vite
- Tailwind CSS
- React Router
- Axios
- React Hot Toast
- Recharts
- Lucide React

## Backend

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT
- bcrypt

---

# 📂 Project Structure

```
freelanceflow
│
├── apps
│   ├── server
│   │   ├── prisma
│   │   ├── src
│   │   ├── package.json
│   │   └── .env.example
│   │
│   └── web
│       ├── src
│       ├── public
│       ├── package.json
│       └── .env.example
│
├── README.md
└── .gitignore
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/adithkrishnar/freelanceflow.git

cd freelanceflow
```

---

# Backend Setup

```bash
cd apps/server

npm install
```

Create `.env`

```env
PORT=5000

DATABASE_URL=your_database_url

JWT_SECRET=your_secret_key

NODE_ENV=development
```

Generate Prisma Client

```bash
npx prisma generate
```

Push Database

```bash
npx prisma db push
```

Run Backend

```bash
npm run dev
```

---

# Frontend Setup

```bash
cd ../web

npm install
```

Create `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

Run Frontend

```bash
npm run dev
```

---

# Environment Variables

## Backend

```env
PORT=

DATABASE_URL=

JWT_SECRET=

NODE_ENV=
```

## Frontend

```env
VITE_API_URL=
```

---

# API Modules

- Authentication
- Dashboard
- Clients
- Projects
- Tasks
- Time Tracking
- Burn Rate
- Invoices
- Sample Data

---

# Deployment

## Frontend

Vercel

## Backend

Render

## Database

PostgreSQL

---

# Future Improvements

- Email Notifications
- Calendar Integration
- Team Collaboration
- Expense Tracking
- AI Insights
- Dark Mode
- Mobile Application

---

# Screenshots

### Login

(Add Screenshot)

### Dashboard

(Add Screenshot)

### Clients

(Add Screenshot)

### Projects

(Add Screenshot)

### Tasks

(Add Screenshot)

### Time Tracking

(Add Screenshot)

### Invoices

(Add Screenshot)

---

# Live Demo

Frontend

```
YOUR_LIVE_FRONTEND_URL
```

Backend

```
YOUR_LIVE_BACKEND_URL
```

GitHub

```
https://github.com/adithkrishnar/freelanceflow
```

---

# Author

**Adith Krishna R**

Computer Science Engineering Student

---

# License

This project is created for educational purposes and portfolio demonstration.
