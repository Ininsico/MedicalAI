# SSI Backend Services Layer

The SSI (Symptom Intelligence) Backend is a robust, type-safe API architecture designed to handle medical data ingestion, caregiver assignments, clinical reporting, and administrative governance.

## Core Technologies
- **Runtime**: Node.js
- **Framework**: Express (TypeScript)
- **Database**: PostgreSQL (managed via Supabase)
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: Swagger / OpenAPI 3.0
- **Communications**: Nodemailer (Transactional SMTP)

## Technical Architecture

### Core Service Modules
- **Authentication Service**: Handles secure registration, login, and profile management across different user roles.
- **Admin Service**: Manages infrastructure health telemetry, user provisioning, and clinical caregiver assignments.
- **Clinical Service**: Orchestrates patient log ingestion, data aggregation, and PDF report synthesis.
- **Middlewares**: Implements centralized error handling, JWT verification, and patient-caregiver relationship validation.

## API Documentation

Integrated documentation is available during development at the following endpoint:
`GET /api-docs`

This interactive sandbox provides a complete reference for all RESTful endpoints, including request schemas and response codes.

## Security Protocols

- **Row Level Security (RLS)**: Database-level isolation ensured by PostgreSQL to prevent unauthorized horizontal data access.
- **Stateless Identity**: JWT-based authentication to ensure secure, scalable communication between the frontend and backend.
- **Audit Logging**: Comprehensive logging of administrative actions for clinical transparency and security auditing.
- **Type Safety**: Full TypeScript implementation across all controllers and service layers to reduce runtime exceptions.

## Installation and Configuration

### Environment Setup
Create a `.env` file in the /backend directory with the following configuration:
```env
PORT=5001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=your-secure-secret-key
EMAIL_USER=your-smtp-email
EMAIL_PASS=your-smtp-password
FRONTEND_URL=http://localhost:3000
```

### Deployment
To initialize the backend services:
```bash
npm install
npm run dev
```

---
**Institutional Credits**
Development: Arslan Rathore
Collaboration: COMSATS University Islamabad
Project: Medical AI Infrastructure
