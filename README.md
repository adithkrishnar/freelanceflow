# 🚀 FreelanceFlow

> **A Modern SaaS Platform for Freelancers**

FreelanceFlow is a full-stack SaaS application designed to simplify freelance business management by bringing **client management, project tracking, task management, time tracking, invoice generation, and business analytics** into a single platform.

Instead of switching between spreadsheets, task managers, and invoicing tools, freelancers can efficiently manage their entire workflow from one dashboard.

---

## 🌐 Live Demo

### Frontend (Vercel)

🔗 freelanceflow-roan.vercel.app

### Backend API (Render)

🔗 https://freelanceflow-qrcx.onrender.com

---

## 📂 GitHub Repository

> Replace this with your repository URL

```text
https://github.com/YOUR_USERNAME/freelanceflow
```

---

# ✨ Features

## 🔐 Authentication

- User Registration
- Secure Login
- JWT Authentication
- Protected Routes
- Password Encryption

---

## 👥 Client Management

- Add Client
- Update Client
- Delete Client
- Contact Information
- Default Hourly Rate

---

## 📁 Project Management

- Create Projects
- Assign Client
- Budget Tracking
- Project Status
- Active / Completed Projects

---

## ✅ Task Management

- Create Tasks
- Due Dates
- Status Management
- Project-wise Tasks

---

## ⏱ Time Tracking

- Persistent Stopwatch
- Manual Time Entry
- Time Logs
- Billable Hours
- Project-wise Tracking

---

## 💰 Invoice Generator

- Generate Professional Invoices
- Automatic Cost Calculation
- PDF Invoice Generation
- Mark Time Logs as Billed

---

## 📊 Dashboard

- Active Projects
- Pending Invoices
- Revenue Overview
- Burn Rate
- Recent Activity
- Upcoming Deadlines

---

## 🔒 Security

- JWT Authentication
- Multi-Tenant Data Isolation
- User-Specific Data Access
- Protected REST APIs

---

# 🏗 Tech Stack

## Frontend

- React.js
- Tailwind CSS
- Axios
- React Router

---

## Backend

- Node.js
- Express.js
- Prisma ORM

---

## Database

- PostgreSQL
- Neon Database

---

## Authentication

- JWT
- bcryptjs

---

## PDF Generation

- PDFKit

---

## Deployment

- Vercel
- Render

---

# 📁 Project Structure

```text
freelanceflow/

│

├── apps/

│   ├── server/

│   │   ├── controllers/

│   │   ├── middleware/

│   │   ├── prisma/

│   │   ├── routes/

│   │   ├── utils/

│   │   └── server.js

│

│   └── web/

│       ├── components/

│       ├── pages/

│       ├── context/

│       ├── layouts/

│       ├── api/

│       └── App.jsx
```

---

# 🗄 Database Design

```text
User
 │
 ├── Clients
 │      │
 │      └── Projects
 │              │
 │              ├── Tasks
 │              └── Time Logs
 │
 └── Invoices
```

---

# ⚙ API Endpoints

## Authentication

```text
POST   /api/auth/register

POST   /api/auth/login
```

---

## Clients

```text
GET    /api/clients

POST   /api/clients

PUT    /api/clients/:id

DELETE /api/clients/:id
```

---

## Projects

```text
GET    /api/projects

POST   /api/projects

PUT    /api/projects/:id

DELETE /api/projects/:id
```

---

## Tasks

```text
GET    /api/tasks

POST   /api/tasks

PUT    /api/tasks/:id

DELETE /api/tasks/:id
```

---

## Time Logs

```text
GET    /api/time-logs

POST   /api/time-logs
```

---

## Invoices

```text
GET    /api/invoices

POST   /api/invoices
```

---

## Dashboard

```text
GET /api/dashboard
```

---

# 🧠 Business Logic

### Time Tracking

```
Start Timer

↓

Save Start Time

↓

Store in localStorage

↓

Refresh Page

↓

Restore Timer

↓

Stop Timer

↓

Calculate Duration

↓

Save Time Log
```

---

### Invoice Generation

```
Select Client

↓

Choose Date Range

↓

Fetch Unbilled Time Logs

↓

Calculate Total

↓

Generate PDF

↓

Mark Logs as Billed
```

---

### Burn Rate

```
Logged Hours

×

Hourly Rate

=

Amount Spent

Remaining Budget

=

Budget − Amount Spent
```

---

# 🔒 Multi-Tenancy

Every database query is scoped using the authenticated user's ID.

This ensures:

- Users can only access their own data.
- Projects, clients, tasks, invoices, and time logs remain isolated.
- Secure multi-tenant architecture.

---

# 📈 Future Enhancements

- Stripe Payment Integration
- Email Invoice Delivery
- Calendar Integration
- Team Collaboration
- Mobile Application
- Expense Tracking
- AI Productivity Insights
- Multi-Currency Support

---

# 💻 Local Installation

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/freelanceflow.git
```

```bash
cd freelanceflow
```

---

## Backend

```bash
cd apps/server

npm install

npx prisma generate

npx prisma migrate deploy

npm run dev
```

---

## Frontend

```bash
cd apps/web

npm install

npm run dev
```

---

# 🔑 Environment Variables

Backend

```env
DATABASE_URL=your_database_url

JWT_SECRET=your_secret_key

PORT=5000
```

Frontend

```env
VITE_API_URL=https://freelanceflow-qrcx.onrender.com/api
```

---

# 📸 Application Preview

> Add screenshots here after deployment.

- Login
- Dashboard
- Clients
- Projects
- Tasks
- Time Tracker
- Invoice Generator
- Revenue Dashboard

---

# 👨‍💻 Developer

**Adith Krishna R**

Full Stack Developer

- React.js
- Node.js
- Express.js
- Prisma
- PostgreSQL
- Tailwind CSS

---

# 📄 License

This project was developed for educational purposes as part of a Full Stack Development internship project.

---

## ⭐ If you like this project, consider giving it a star on GitHub!
