
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SSI: Symptom Intelligence API Documentation',
            version: '1.2.0',
            description: 'Advanced RESTful API documentation for the Medical AI / Symptom Intelligence Ecosystem. Supporting Patients, Caregivers, and Administrative governance.',
            contact: {
                name: 'System Administrator',
                email: 'ininsico@gmail.com',
            },
        },
        servers: [
            {
                url: 'https://medical-ai-uh9j.vercel.app',
                description: 'Production server',
            },
            {
                url: 'http://localhost:5001',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },

            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Patient: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        full_name: { type: 'string' },
                        email: { type: 'string' },
                        phone: { type: 'string' },
                        date_of_birth: { type: 'string', format: 'date' },
                        gender: { type: 'string' },
                        contact_number: { type: 'string' },
                        emergency_contact: { type: 'string' },
                        status: { type: 'string', enum: ['active', 'inactive'] },
                        medical_history: { type: 'string' },
                        current_medications: { type: 'string' },
                        doctor_name: { type: 'string' },
                        doctor_contact: { type: 'string' },
                        allergies: { type: 'array', items: { type: 'string' } },
                    },
                },
                Caregiver: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        full_name: { type: 'string' },
                        email: { type: 'string' },
                        phone: { type: 'string' },
                        role: { type: 'string', example: 'caregiver' },
                    },
                },
                DailyLog: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        patient_id: { type: 'string' },
                        date: { type: 'string', format: 'date' },
                        mood: { type: 'string' },
                        symptoms: { type: 'array', items: { type: 'string' } },
                        medication_taken: { type: 'boolean' },
                        medication_notes: { type: 'string' },
                        food_intake: { type: 'string' },
                        sleep_hours: { type: 'number' },
                        activity_level: { type: 'string' },
                        tremor_severity: { type: 'integer' },
                        stiffness_severity: { type: 'integer' },
                        notes: { type: 'string' },
                    },
                },
                Notification: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        user_id: { type: 'string' },
                        type: { type: 'string' },
                        title: { type: 'string' },
                        message: { type: 'string' },
                        read: { type: 'boolean' },
                        created_at: { type: 'string', format: 'date-time' },
                        priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                    },
                },
                Invitation: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        patient_id: { type: 'string' },
                        invitee_email: { type: 'string' },
                        status: { type: 'string', enum: ['pending', 'accepted', 'cancelled', 'expired', 'rejected'] },
                        expires_at: { type: 'string', format: 'date-time' },
                        personal_message: { type: 'string' },
                    },
                },
                AuditLog: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        action: { type: 'string' },
                        user_id: { type: 'string' },
                        target_id: { type: 'string' },
                        details: { type: 'string' },
                        ip_address: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' },
                    },
                },
                Assignment: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        patient_id: { type: 'string' },
                        caregiver_id: { type: 'string' },
                        status: { type: 'string', enum: ['active', 'inactive'] },
                        assigned_date: { type: 'string', format: 'date-time' },
                        ended_date: { type: 'string', format: 'date-time' },
                        assignment_notes: { type: 'string' },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/server.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
