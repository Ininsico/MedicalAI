# SSI Frontend Application Layer

This directory contains the primary user interface for the SSI (Symptom Intelligence) ecosystem. The application is built with a focus on clinical accessibility and high-fidelity neurological monitoring, providing unique interfaces for Patients, Caregivers, and Administrators.

## Core Technologies
- **Framework**: Next.js 16.1 (React 19)
- **Styling**: Tailwind CSS (Medical Design System)
- **Dynamics**: Framer Motion (State Transitions)
- **Visualization**: Recharts (Longitudinal Pattern Mapping)
- **Icons**: Lucide React
- **Typography**: Geist (Optimized for Readability)

## Directory Overview

| Directory | Purpose |
| :--- | :--- |
| **src/app** | App router architecture including multi-role dashboards and authentication logic. |
| **src/components** | Reusable UI primitives and complex clinical compound components. |
| **src/lib/api** | Unified interface for backend communication and JWT session management. |
| **src/hooks** | Specialized React hooks for medical state and clinical data fetching. |

## Development Lifecycle

### Prerequisites
- Node.js 18 or higher
- Active Backend Service (SSI Node.js API)

### Environment Setup
Create a `.env.local` file in the root of the /frontend directory with the following variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

### Execution
To start the development environment:
```bash
npm install
npm run dev
```
The application will be accessible at http://localhost:3000.

## Functional Highlights

### Clinical Precision Monitoring
- **Tactile-Focused UI**: High-contrast, large-format inputs designed specifically for users with motor coordination challenges or tremors.
- **Dynamic Triaging**: Dashboard cards that provide visual alerts when critical symptom spikes are detected in patient data.
- **Responsive Governance**: Full administrative control over the clinical network, optimized for both desktop and mobile resolutions.

---
**Institutional Credits**
Development: Arslan Rathore
Collaboration: COMSATS University Islamabad
Project: Healthcare Systems Initiative
