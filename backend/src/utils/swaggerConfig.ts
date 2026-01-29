
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Medical AI API Documentation',
            version: '1.0.0',
            description: 'API documentation for the Medical AI Healthcare Management System backend.',
            contact: {
                name: 'API Support',
                email: 'support@codematics.com',
            },
        },
        servers: [
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
