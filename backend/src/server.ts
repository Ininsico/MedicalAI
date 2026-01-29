
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

const app = express();
const PORT = process.env.PORT || 5001; // Using 5001 as agreed

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/caregiver', caregiverRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/notifications', notificationRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    supabaseConnected: !!supabase
  });
});

// Test Supabase Connection (Legacy/Dev helper)
app.get('/api/test-connection', async (req, res) => {
  try {
    const { data, error } = await supabase.from('_test').select('*').limit(1);

    if (error) {
      // Try RPC
      const { data: timeData, error: timeError } = await supabase.rpc('get_server_time');

      if (timeError) {
        return res.status(500).json({
          success: false,
          message: 'Failed to connect to Supabase',
          error: timeError.message
        });
      }

      return res.json({
        success: true,
        message: 'Connected to Supabase',
        serverTime: timeData
      });
    }

    res.json({
      success: true,
      message: 'Connected to Supabase and can query tables',
      data
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({
      success: false,
      message: 'Error connecting to Supabase',
      error: errorMessage
    });
  }
});

// 404 Handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    timestamp: new Date().toISOString(),
    path: req.path,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Initialize default admin and start server
const startServer = async () => {
  await createDefaultAdmin();

  app.listen(PORT, () => {
    console.log(`
    Healthcare Management System Server
    ===================================
    Server running on port ${PORT}
    Admin email: ininsico@gmail.com
    Default admin password: 2136109HNsj
    
    API Endpoints:
    - Auth: /api/auth/*
    - Admin: /api/admin/*
    - Caregiver: /api/caregiver/*
    - Notifications: /api/notifications/*
    
    Health check: /health
    ===================================
        `);
  });
};

startServer();

export default app;