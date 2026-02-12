
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';
const JWT_EXPIRY = '7d';

// Email transporter configuration (Brevo)
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // TLS
    auth: {
        user: 'a20139001@smtp-brevo.com',
        pass: 'xsmtpsib-d67f7426e822f657dab90beb41af941bdfc9cda5ab512407fb8ad404145f72ea-qrACvGuf0l5yjBuq'
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
            from: '"Healthcare System" <hi@ininsico.site>', // Make sure this domain is verified in Brevo
            to,
            subject,
            html
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('❌ EMAIL SENDING FAILED:', error);
        return false;
    }
};

/**
 * Generates HTML email template for caregiver invitation
 * 
 * @param patientName - Name of the patient sending the invitation
 * @param inviteLink - Unique invitation link with token
 * @param personalMessage - Optional personalized message from patient
 * @returns HTML string for email body
 */
export const caregiverInvitationTemplate = (
    patientName: string,
    inviteLink: string,
    personalMessage: string | null
): string => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Caregiver Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🩺 MedicalAI</h1>
                            <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">Health Monitoring Platform</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 24px;">You've Been Invited as a Caregiver</h2>
                            <p style="margin: 0 0 20px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                                <strong>${patientName}</strong> has invited you to become their caregiver on MedicalAI.
                            </p>
                            ${personalMessage ? `
                            <div style="background-color: #f0f9ff; border-left: 4px solid #14b8a6; padding: 15px 20px; margin: 0 0 25px 0; border-radius: 4px;">
                                <p style="margin: 0; color: #0f172a; font-size: 14px; font-style: italic;">"${personalMessage}"</p>
                                <p style="margin: 8px 0 0 0; color: #64748b; font-size: 13px;">- ${patientName}</p>
                            </div>
                            ` : ''}
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${inviteLink}" style="display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">Accept Invitation</a>
                            </div>
                            <p style="margin: 20px 0 0 0; color: #94a3b8; font-size: 13px; text-align: center;">
                                Or copy this link: <br><a href="${inviteLink}" style="color: #14b8a6;">${inviteLink}</a>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px;"><strong>⏳ This invitation expires in 7 days</strong></p>
                            <p style="margin: 0; color: #94a3b8; font-size: 12px;">If you didn't expect this invitation, you can safely ignore this email.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
};
