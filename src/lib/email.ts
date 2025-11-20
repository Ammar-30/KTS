import nodemailer from "nodemailer";

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
        console.log("📧 [Email skipped] Missing SMTP creds");
        console.log({ HOST, PORT, FROM, to, subject });
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: FROM,
            to,
            subject,
            html,
            text,
        });
        console.log("✅ Email sent:", info.messageId, "→", to);
    } catch (err) {
        console.error("❌ Email send failed:", err);
    }
}
