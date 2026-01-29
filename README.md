# 🏥 Medical AI: Healthcare Management System (MVP)

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Framework: Next.js 16](https://img.shields.io/badge/Framework-Next.js%2016-black)](https://nextjs.org/)
[![Backend: Node.js/Express](https://img.shields.io/badge/Backend-Node.js/Express-green)](https://expressjs.com/)
[![Database: Supabase](https://img.shields.io/badge/Database-Supabase-blueviolet)](https://supabase.com/)

A state-of-the-art, multi-role Healthcare Management System designed as an MVP for medical monitoring and patient care. Developed during an internship at **Codematics**, this platform leverages a modern tech stack to provide AI-driven insights, real-time monitoring, and seamless clinical communication.

---

## 📑 Table of Contents
1. [🌟 Executive Summary](#-executive-summary)
2. [👥 User Roles & Permissions](#-user-roles--permissions)
3. [✨ Key Features](#-key-features)
4. [🛠 Tech Stack & Architecture](#-tech-stack--architecture)
5. [🗄️ Database Schema](#️-database-schema)
6. [🛣️ API Reference](#️-api-reference)
7. [🚀 Installation & Setup](#-installation--setup)
8. [🛡️ Security & Compliance](#️-security--compliance)
9. [📈 Future Roadmap](#-future-roadmap)

---

## 🌟 Executive Summary

**Medical AI** is designed to bridge the gap between patients and healthcare providers. By digitizing daily health logs and automating pattern detection, the system allows caregivers to intervene early when unusual symptoms appear. The application is built with scalability and security as core principles, ensuring patient data is both accessible to the right people and protected from unauthorized access.

---

## 👥 User Roles & Permissions

| Role | Access Level | Responsibilities |
| :--- | :--- | :--- |
| **Admin** | Full Access | User management, system health monitoring, auditing, and patient-caregiver linking. |
| **Caregiver** | Clinical | Monitoring assigned patients, analyzing vitals/logs, and generating clinical reports. |
| **Patient** | Personal | Daily self-reporting, viewing personal health trends, and managing care network contacts. |

---

## ✨ Key Features

### 📋 Role-Based Dashboards
- **Advanced Admin UI**: Real-time stats on system usage, active assignments, and infrastructure health.
- **Clinical Caregiver UI**: Patient-centric view with mood tracking, medication adherence streaks, and symptom analysis.
- **Patient Mobile-First UI**: Simplified daily logging system with interactive mood selectors and health charts.

### 🤖 Pattern Detection & AI Insights
- **Heuristic Pattern Engine**: Automatically detects "Unusual Patterns" (e.g., poor sleep + medication non-adherence + specific symptoms) and triggers high-priority notifications to caregivers.
- **Automated Insights**: Generates qualitative summaries of patient health trends for report generation.

### 📊 Comprehensive Reporting
- **PDF Report Generation**: Caregivers can generate professional health reports for specific date ranges, including:
  - Medication adherence rates.
  - Mood distribution charts.
  - Symptom frequency analysis.
  - Sleep and activity level trends.

---

## 🛠 Tech Stack & Architecture

### Frontend (Next.js Application)
- **Next.js 16 (App Router)**: Utilizing server-side rendering and client-side interactivity.
- **Framer Motion**: For premium micro-interactions and smooth page transitions.
- **Recharts**: High-performance data visualization for medical trends.
- **Tailwind CSS**: Custom design system for a sleek, modern, and accessible UI.

### Backend (Express API)
- **TypeScript**: Ensuring type safety across the entire API.
- **Swagger/OpenAPI**: Automated documentation and interactive testing sandbox.
- **Nodemailer**: SMTP integration for transactional emails.

### Infrastructure & DevOps
- **Supabase**: PostgreSQL database with built-in Authentication and Row Level Security (RLS).
- **Rate Limiting**: Protection against DDoS and brute-force attacks.
- **Helmet.js**: Enhancing HTTP header security.

---

## 🗄️ Database Schema

The system uses a relational PostgreSQL schema optimized for high-frequency daily logging:

- **`users`**: Central registry for all identities (Admin, Caregiver, Patient).
- **`patients`**: Extended profiles containing clinical history, allergies, and emergency contacts.
- **`caregiver_assignments`**: Junction table managing the link between caregivers and patients.
- **`daily_logs`**: High-volume table storage for symptoms, vitals, mood, and activity.
- **`notifications`**: User-specific notification system with priority levels.
- **`audit_logs`**: Immutable record of system-wide administrative actions.

---

## 🛣️ API Reference (Summary)

Detailed documentation is available at `/api-docs` via Swagger.

### Authentication
- `POST /api/auth/register`: Create new user identities.
- `POST /api/auth/login`: Identity verification and JWT issuance.
- `GET /api/auth/profile`: Secure retrieval of personal profile details.

### Admin Operations
- `GET /api/admin/health`: Infrastructure and statistics overview.
- `POST /api/admin/create-patient`: Specialized patient profile creation.
- `POST /api/admin/assign-caregiver`: Link clinical providers to patients.

### Clinical & Patient
- `POST /api/patients/:id/logs`: Submit daily health data.
- `GET /api/caregiver/dashboard`: Summary of all assigned patients and alerts.
- `GET /api/caregiver/report/:patientId`: Generate analytics-rich health reports.

---

## 🚀 Installation & Setup

### 1. Repository Setup
```bash
git clone <repo-url>
cd MedicalAI
```

### 2. Backend Environment (`/backend/.env`)
```bash
PORT=5001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=your-random-secret
EMAIL_USER=your-smtp-email
EMAIL_PASS=your-smtp-password
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Environment (`/frontend/.env.local`)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:5001
```

### 4. Launch Commands
```bash
# In backend/
npm run dev

# In frontend/
npm run dev
```

---

## 🛡️ Security & Compliance

- **JWT Authentication**: Secure stateless authentication for all API endpoints.
- **Row Level Security (RLS)**: Database-level protection ensuring caregivers only see their assigned patients and patients only see their own logs.
- **Input Validation**: Strict sanitization of all incoming medical data.
- **Audit Trails**: Every administrative action (assignments, deletions, etc.) is logged with IP address and timestamp.

---

## 📈 Future Roadmap
- [ ] **AI Diagnostic Support**: Integration with LLMs for advanced symptom analysis.
- [ ] **Real-time Vitals**: Support for wearable device synchronization (Apple Health, Google Fit).
- [ ] **Secure Messaging**: Peer-to-peer encrypted chat between patients and caregivers.
- [ ] **DICOM Viewer**: Support for viewing radiological images (X-rays, MRIs).

---
*Created for the Healthcare Management System Internship Project @ Codematics.*
