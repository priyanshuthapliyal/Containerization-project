# Campus Placement Portal

A premium and fully responsive **MERN (MongoDB, Express, React, Node.js) College Placement Portal** application. It features a complete role-based workflow for **Students**, **Placement Officers (POs)**, and **Administrators** to manage job listings, evaluate qualifications automatically, upload resumes, and track placement performance statistics.

---

## 🚀 Key Features

### 👨‍🎓 Student Dashboard
- **Authentication**: Secured JWT logins. Forces a **Password Reset** on the first login.
- **Academic Profile**: View stats (CGPA, backlogs, department) and update personal skill lists.
- **PDF Resume Upload**: Secure PDF resume uploading via Multer.
- **Job Board**: Browse company listings. The system automatically runs **eligibility matches** (GPA & backlog check) and locks/explains why a student is ineligible if requirements are not met.
- **Application Tracking**: Submit applications and track real-time status updates (Applied, Shortlisted, Selected, Rejected) with pipeline stage history.

### 👩‍💼 Placement Officer (PO) Dashboard
- **Recruitment Analytics**: Visual Recharts dashboards detailing branch-wise placement percentages and company hiring splits.
- **Company Management**: CRUD operations for corporate recruiter partners.
- **Job Board Management**: Create job postings specifying location, salary package (LPA), deadline, and custom eligibility rules (min CGPA, allowed departments, maximum backlogs).
- **Application Manager**: Review candidate statistics, download candidate resumes, transition applicant statuses, and bulk-download all resumes for a job inside a single **ZIP file**.

### 👑 Administrator Dashboard
- **User Directory Management**: Complete CRUD controls to activate/deactivate accounts or delete profiles.
- **Batch Student Importer**: Import hundreds of student profiles instantly using CSV file parsing.
- **Academic Branch Management**: Add and manage departments and Head of Department (HOD) details.

---

## 🛠️ Technology Stack

* **Frontend**: React.js, Tailwind CSS, React Router DOM (v6), Axios, Recharts, Lucide Icons
* **Backend**: Node.js, Express.js, JWT Authentication (Cookie-based rotation), Multer, Archiver (ZIP packaging)
* **Database**: MongoDB, Mongoose ODM

---

## 💻 Step-by-Step Installation Guide

### Prerequisites
Before running, ensure you have the following installed on your local machine:
- **Node.js** (v18 or higher recommended)
- **npm** (comes packaged with Node.js)
- **MongoDB Server** (running locally on port `27017`)

---

### Step 1: Set Up the Backend
1. Open your terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory and configure your environment variables. Example configuration (`.env`):
   ```ini
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/placement_portal
   JWT_ACCESS_SECRET=your_super_secret_access_key
   JWT_REFRESH_SECRET=your_super_secret_refresh_key
   NODE_ENV=development
   ```

---

### Step 2: Seed the Database
Populate the database with default departments, a Placement Officer account, an Admin account, and a Student profile for testing:
```bash
npm run seed
```

---

### Step 3: Run the Backend Server
Start the development server (runs backend API on **Port 5000** with nodemon hot-reload):
```bash
npm run dev
```

---

### Step 4: Set Up and Run the Frontend
1. Open a new terminal window and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the React development server (runs frontend application on **Port 5173**):
   ```bash
   npm run dev
   ```

---

## 🔑 Seeded Login Credentials (For Testing)

After running the database seeding script in **Step 2**, you can log in with the following default accounts:

| Role | Username / Email | Password | Role Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@college.edu` | `admin123` | Control users, import CSVs, manage departments. |
| **Placement Officer (PO)** | `po@college.edu` | `po123456` | Create job postings, manage applicants, view hiring statistics. |
| **Student** | `student@college.edu` | `student123` | Upload resumes, browse listings, submit applications. *(Requires password reset on first login)* |

---

## 📂 Project Folder Structure

```text
college-placement-portal/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Controller business logic 
│   │   ├── middlewares/     # Auth, error, and Multer file upload handlers
│   │   ├── models/          # Mongoose database models (User, StudentProfile, Job, etc.)
│   │   ├── routes/          # Express API route endpoints
│   │   ├── utils/           # JWT generation utility
│   │   └── app.js           # App config setup
│   ├── uploads/             # Stores uploaded student resumes (PDFs)
│   ├── seed.js              # Database seeding script
│   └── server.js            # Node entry point
├── frontend/
│   ├── public/              # Static favicon assets
│   ├── src/
│   │   ├── assets/          # Static images & graphics
│   │   ├── context/         # AuthContext provider
│   │   ├── layouts/         # Dashboard Sidebar & Navbar framework
│   │   ├── pages/           # Student, PO, Admin & Login page components
│   │   ├── services/        # Axios API wrapper configs
│   │   ├── App.jsx          # React Client router mappings
│   │   └── main.jsx         # Client mount point
│   ├── postcss.config.js    # PostCSS configs for Tailwind
│   ├── tailwind.config.js   # Custom Tailwind design utility rules
│   └── vite.config.js       # Vite configuration with LightningCSS fixes
└── .gitignore               # Main Git ignored patterns listing
```
