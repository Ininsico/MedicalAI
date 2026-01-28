import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import logRoutes from './routes/logRoutes';
import profileRoutes from './routes/profileRoutes';
import analysisRoutes from './routes/analysisRoutes';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/analysis', analysisRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log('--------------------------------------------------');
    console.log(`🚀 NEURODYNAMIC BACKEND v4.0`);
    console.log(`📡 STATUS: ACTIVE ON PORT ${PORT}`);
    console.log(`🔗 LOCAL: http://localhost:${PORT}`);
    console.log('--------------------------------------------------');
});
