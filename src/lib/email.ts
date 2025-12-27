import nodemailer from "nodemailer";
import { logger } from "./logger";

/**
 * Read either SMTP_* or EMAIL_* style envs.
 */
const HOST =
    process.env.SMTP_HOST || process.env.EMAIL_SERVER || "smtp.gmail.com";
const PORT_RAW = process.env.SMTP_PORT || process.env.EMAIL_PORT || "587";
const USER = process.env.SMTP_USER || process.env.EMAIL_USER || "";
const PASS = process.env.SMTP_PASS || process.env.EMAIL_PASS || "";
const FROM =
    process.env.MAIL_FROM ||
    process.env.EMAIL_FROM ||
    "KIPS Transport <no-reply@kips.pk>";

const PORT = Number(PORT_RAW);
const SECURE = PORT === 465; // true for SSL (465), false for STARTTLS (587)

/**
 * Create transporter only if creds exist (so dev still works).
 */
const transporter =
    HOST && USER && PASS
        ? nodemailer.createTransport({
            host: HOST,
            port: PORT,
            secure: SECURE,
            auth: { user: USER, pass: PASS },
        })
        : null;

if (transporter) {
    logger.info({ HOST, PORT, FROM, USER: USER ? '***' : 'missing' }, "SMTP Transporter initialized successfully");
} else {
    logger.warn({
        hasHost: !!HOST,
        hasUser: !!USER,
        hasPass: !!PASS
    }, "SMTP Transporter failed to initialize. Check .env variables: SMTP_HOST, SMTP_USER, SMTP_PASS");
}

/**
 * sendAssignmentEmail — send rich email (subject/html/text).
 * Gracefully no-ops if creds are missing.
 */
export async function sendAssignmentEmail({
    to,
    subject,
    html,
    text,
}: {
    to: string;
    subject: string;
    html: string;
    text?: string;
}) {
    if (!transporter) {
        logger.warn({ HOST, PORT, FROM, to, subject }, "Email skipped - transporter not initialized. Check SMTP credentials in .env");
        return;
    }

    try {
        logger.debug({ to, subject }, "Attempting to send email...");
        const info = await transporter.sendMail({
            from: FROM,
            to,
            subject,
            html,
            text,
        });
        logger.info({ messageId: info.messageId, to }, "Email sent successfully");
    } catch (err) {
        logger.error({ error: err, to, subject, smtpConfig: { HOST, PORT, USER: USER ? '***' : 'missing' } }, "Email send failed");
        throw err; // Rethrow so the caller knows it failed
    }
}
