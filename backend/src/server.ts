
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { supabase } from './lib/supabaseClient';
import { createDefaultAdmin } from './controllers/authController';

// Import Routes
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import caregiverRoutes from './routes/caregiverRoutes';
import patientRoutes from './routes/patientRoutes';
import notificationRoutes from './routes/notificationRoutes';
import aiRoutes from './routes/aiRoutes';

// Swagger documentation
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './utils/swaggerConfig';


/**
 * Express application entry point.
 * Configures security, rate limiting, routes, and error handling.
 */
const app = express();
const PORT = process.env.PORT || 5001;

app.use(helmet());

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/caregiver', caregiverRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    supabaseConnected: !!supabase
  });
});

// Swagger options for production (Vercel)
const swaggerOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "SSI: Symptom Intelligence API Documentation",
  swaggerOptions: {
    persistAuthorization: true,
  },
  customCssUrl: "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui.css",
  customJs: [
    "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui-bundle.js",
    "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui-standalone-preset.js"
  ]
};

// Route for Swagger UI
app.use('/api-docs', (req: Request, res: Response, next: NextFunction) => {
  // Extensive CSP to allow Swagger UI from CDN and standard Vercel functions
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://vercel.live; " +
    "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " +
    "img-src 'self' data: https://cdnjs.cloudflare.com; " +
    "connect-src 'self' https://cdnjs.cloudflare.com https://vercel.live; " +
    "font-src 'self' https://cdnjs.cloudflare.com; " +
    "frame-src 'self' https://vercel.live;"
  );
  next();
});

// Use a simplified setup that works better with Vercel's MIME type checking
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', (req: Request, res: Response) => {
  res.send(swaggerUi.generateHTML(swaggerSpec, swaggerOptions));
});

app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    timestamp: new Date().toISOString(),
    path: req.path,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const startServer = async () => {
  await createDefaultAdmin();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
  });
};

startServer();

export default app;