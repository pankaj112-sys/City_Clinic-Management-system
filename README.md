# 🏥 CityCare Clinic Management System (Full-Stack Website)

A full-stack, responsive web application for comprehensive clinic and healthcare facility management. Built with **Node.js**, **Express 5**, **MySQL**, modern CSS design system, and Vanilla JavaScript.

---

## 🌟 Key Features

### 1. 📊 Interactive Executive Dashboard
- **Live Clinic Statistics**: Real-time counter cards for Total Patients, Total Doctors, Total Appointments, and Pending Consultations.
- **Recent Appointments Feed**: Quick-view table of upcoming and recent patient visits with status indicators.
- **Quick Action Bar**: One-click navigation to register patients, add doctors, or book appointments.

### 2. 🧑‍🤝‍🧑 Patients Management
- **Full CRUD Support**: Add new patients, view profiles, update information, and delete records.
- **Live Search**: Instant client-side & server-side search by name, contact phone, email, or address.
- **Form Controls & Modals**: Smooth slide-down registration forms and modal popup for editing patient details.

### 3. 👨‍⚕️ Doctors Roster & Specialists
- **Doctor Directory**: Manage medical specialists across departments (General Physician, Cardiologist, Dermatologist, Pediatrician, Orthopedic, etc.).
- **Specialization Filtering**: Instant filter dropdown by clinical department.
- **Duty & Schedule Tracking**: Track consulting hours, experience, contact details, and active/leave status.

### 4. 📅 Appointments & Scheduling
- **Dynamic Selection**: Real-time dropdowns populated automatically with registered patients and doctors from MySQL.
- **Real-Time Status Management**: Quick status switcher (Pending, Confirmed, Completed, Cancelled) directly from the table.
- **Advanced Filtering**: Filter appointments by consultation status or search by patient name, doctor, or symptom.
- **Rescheduling & Edits**: Edit date, time, reason, doctor, and clinical notes via modal.

### 5. 🎨 Modern Healthcare UI/UX
- **Modern Medical Palette**: Professional medical blues, emerald greens, and warm warning pills.
- **Toast Notifications**: Replaced jarring browser alerts with elegant toast notifications.
- **Fully Responsive**: Mobile-friendly sidebar drawer and responsive tables for tablets and smartphones.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express 5.x
- **Database**: MySQL 8.0 (with `mysql2/promise` connection pool & auto-table migration)
- **Frontend**: HTML5, Modern CSS3 (Custom Design System with CSS variables), Vanilla JavaScript (ES6+)
- **Icons**: FontAwesome 6 CDN

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher recommended)
- MySQL Server running locally (default port 3306)

### 1. Configure Environment
Create or edit `.env` in the project root:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=clinic_management
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Server
```bash
npm start
```
> The application will automatically create the required database tables (`patients`, `doctors`, `appointments`) and seed demo records if the tables are empty!

### 4. Access the Website
Open your web browser and navigate to:
```
http://localhost:3000
```

---

## 📡 REST API Documentation

### 📊 Dashboard
- `GET /api/dashboard/stats` - Total count of patients, doctors, appointments, pending visits.
- `GET /api/dashboard/recent-appointments` - Fetch last 6 appointments with patient & doctor details.

### 🧑‍🤝‍🧑 Patients
- `GET /api/patients` - List all patients (supports `?search=query`).
- `GET /api/patients/:id` - Fetch patient by ID.
- `POST /api/patients` - Register a new patient.
- `PUT /api/patients/:id` - Update patient details.
- `DELETE /api/patients/:id` - Delete patient (cascades to related appointments).

### 👨‍⚕️ Doctors
- `GET /api/doctors` - List all doctors (supports `?search=query`).
- `GET /api/doctors/:id` - Fetch doctor by ID.
- `POST /api/doctors` - Register a new doctor.
- `PUT /api/doctors/:id` - Update doctor details.
- `DELETE /api/doctors/:id` - Delete doctor.

### 📅 Appointments
- `GET /api/appointments` - List appointments (supports `?search=query&status=Pending`).
- `GET /api/appointments/:id` - Fetch appointment by ID.
- `POST /api/appointments` - Book a new consultation.
- `PUT /api/appointments/:id` - Update appointment schedule/details.
- `PATCH /api/appointments/:id/status` - Quick update of appointment status.
- `DELETE /api/appointments/:id` - Cancel and delete appointment.


