
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
 * Generates a JSON Web Token (JWT) for a user.
 * 
 * @param userId - The unique identifier of the user.
 * @param role - The role assigned to the user (e.g., admin, caregiver, patient).
 * @param email - The user's email address.
 * @returns A signed JWT string.
 */
export const generateToken = (userId: string, role: string, email: string) => {
    return jwt.sign(
        { userId, role, email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
    );
};

/**
 * Sends an email using the configured SMTP transporter.
 * 
 * @param to - Recipient email address.
 * @param subject - Email subject line.
 * @param html - HTML content of the email.
 * @returns A boolean indicating whether the email was sent successfully.
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
        // Silently handle email errors to prevent breaking main flows
        return false;
    }
};
