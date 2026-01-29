
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';
const JWT_EXPIRY = '7d';

// Email transporter configuration
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER || 'ininsico@gmail.com',
        pass: process.env.EMAIL_PASS || '2136109HNsj' // Note: Should definitely move this to env in prod
    }
});

/**
 * Generate JWT token
 */
export const generateToken = (userId: string, role: string, email: string) => {
    return jwt.sign(
        { userId, role, email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
    );
};

/**
 * Send email notification
 */
export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        const mailOptions = {
            from: `"Healthcare System" <${process.env.EMAIL_USER || 'ininsico@gmail.com'}>`,
            to,
            subject,
            html
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email error:', error);
        return false;
    }
};
