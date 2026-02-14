const nodemailer = require("nodemailer");

export function getMailer() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error("SMTP_USER/SMTP_PASS not configured");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  return transporter;
}

export async function sendOtpEmail(to: string, code: string) {
  const transporter = getMailer();
  const from = process.env.SMTP_USER;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px">
      <h2 style="margin:0 0 16px 0;color:#111">Reset your password</h2>
      <p style="color:#333;margin:0 0 12px 0">Use the one-time code below to reset your password. It expires in 10 minutes.</p>
      <div style="font-size:28px;letter-spacing:6px;font-weight:700;background:#f7f7f7;padding:12px 16px;border-radius:8px;text-align:center;color:#111">${code}</div>
      <p style="color:#666;margin-top:16px;font-size:12px">If you didn’t request this, you can ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from,
    to,
    subject: "Your password reset code",
    html,
  });
}
