# SSI: Symptom Intelligence and Medical AI Ecosystem

SSI (Symptom Intelligence) is a comprehensive, multi-layered medical AI platform designed for the longitudinal monitoring and clinical analysis of neurological conditions, specifically focused on Parkinson's disease. Developed in collaboration with COMSATS University Islamabad, the system facilitates the bridge between patient self-reporting and clinical decision support through high-fidelity data visualization and heuristic-driven insights.

## Table of Contents
1. Executive Summary
2. User Role Architecture
3. Key Clinical Features
4. Technical Infrastructure
5. API and Data Layer
6. Security and Compliance
7. Installation and Development
8. Research Roadmap

## Executive Summary

The SSI ecosystem is built on the principle that clinical data should be accessible and actionable. The platform empowers patients with motor challenges through specialized interfaces while providing healthcare providers with deep-tissue data analysis. By digitizing neurological baselines, SSI enables precise medication adjustments and early intervention for symptom outliers.

## User Role Architecture

| Role | Interface Focus | core Responsibilities |
| :--- | :--- | :--- |
| **Administrator** | Responsive Governance | User provisioning, infrastructure telemetry, and system-wide audit logging. |
| **Caregiver** | Clinical Intelligence | Patient status triaging (Critical/Warning/Stable), longitudinal trend analysis, and PDF report generation. |
| **Patient** | Symptom Management | Daily health check-ins, medication adherence tracking, and personal health insights. |

## Key Clinical Features

### Precision Patient Monitoring
- **Multi-Metric Tracking**: Simultaneous capture of tremor intensity, muscle rigidity, sleep quality, and mood fluctuations.
- **Severity Triaging**: Automated status assignment based on clinical thresholds (Critical, Needs Review, Stable).
- **Medication Compliance**: Real-time adherence mapping integrated with physical symptom correlates.

### Responsive Administration
- **Mobile-First Design**: Complete administrative control over the clinical network from any handheld device.
- **Audit Protocols**: Real-time capture of administrative actions, including IP tracking and timestamped state changes.
- **Simplified Provisioning**: Streamlined authentication protocols designed for professional medical environments.

### Clinical Reporting
- **High-Density PDF Generation**: Built-in infrastructure for generating professional health records for external physician review.
- **Heuristic Synthesis**: Qualitative analysis of daily logs to highlight unusual patterns and baseline shifts.

## Technical Infrastructure

### Frontend Application Layer
- **Next.js 16 (App Router)**: High-performance architecture utilizing React 19 server components.
- **Framer Motion**: Professional micro-interactions and smooth state transitions.
- **Tailwind CSS**: A minimalist, high-contrast design system optimized for medical utility.
- **Recharts**: Data visualization engine for longitudinal symptom mapping.

### Backend Services Layer
- **Node.js and Express (TypeScript)**: Scalable, type-safe API architecture.
- **Supabase Cloud**: PostgreSQL database cluster featuring robust Row Level Security (RLS).
- **JWT Middleware**: Stateless authentication ensuring end-to-end identity verification.

## API and Data Layer

Detailed documentation is available via Swagger at the `/api-docs` endpoint on the backend service.

### Primary Endpoints
- **Authentication**: `POST /api/auth/login`, `POST /api/auth/register`
- **Clinical Admin**: `GET /api/admin/health`, `POST /api/admin/create-caregiver`
- **Patient Logs**: `POST /api/patients/:id/logs`, `GET /api/caregiver/dashboard`

## Security and Compliance

- **Stateless Authentication**: JSON Web Tokens (JWT) for secure session management.
- **Row Level Security (RLS)**: Database-enforced isolation ensuring clinicians only access assigned patient cohorts.
- **Input Sanitization**: Multi-layer protection against injection and data-type corruption.
- **Immutable Auditing**: Protection of system logs against modification to ensure clinical transparency.

## Installation and Development

### Repository Structure
- `/frontend`: Next.js application layer.
- `/backend`: Node.js Express API layer.

### Environment Specification
The system requires specific variables for operation.

**Backend Configuration (.env):**
```env
PORT=5001
SUPABASE_URL=YOUR_SUPABASE_INSTANCE
SUPABASE_SERVICE_KEY=YOUR_SERVICE_KEY
JWT_SECRET=YOUR_CRYPTO_SECRET
```

**Frontend Configuration (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_INSTANCE
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

### Deployment Commands
```bash
# Initialize Backend
cd backend && npm install && npm run dev

# Initialize Frontend
cd frontend && npm install && npm run dev
```

---
**Institutional Credits**
Project Lead: Arslan Rathore
Collaboration: COMSATS University Islamabad
Development Site: Codematics Professional medical Initiative
