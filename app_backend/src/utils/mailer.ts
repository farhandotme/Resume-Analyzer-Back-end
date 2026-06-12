import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendOTPEmail(toEmail: string, otp: string) {
  await transporter.sendMail({
    from: `"Resume Analyzer" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: "Your OTP Verification Code",
    html: `
        <div style="max-width: 520px; margin: auto; background: #0a0a0a; border-radius: 12px; overflow: hidden; font-family: Arial, sans-serif;">

        <!-- Header -->
        <div style="background: #F5C518; padding: 28px 32px; text-align: center;">
            <span style="font-size: 20px; font-weight: bold; color: #0a0a0a;">📄 Resume Analyzer</span>
        </div>

        <!-- Body -->
        <div style="padding: 36px 32px;">
            <h2 style="font-size: 22px; color: #F5C518; margin: 0 0 10px;">Verify your email</h2>
            <p style="font-size: 14px; color: #a0a0a0; margin: 0 0 28px;">
            Use the code below to complete your verification. 
            This code is valid for <strong style="color: #e0e0e0;">5 minutes</strong>.
            </p>

            <!-- OTP Box -->
            <div style="background: #161616; border: 1px solid #F5C518; border-radius: 10px; padding: 24px; text-align: center; margin-bottom: 28px;">
            <p style="font-size: 11px; color: #888; margin: 0 0 12px; letter-spacing: 1px;">YOUR OTP CODE</p>
            <div style="font-size: 38px; font-weight: bold; letter-spacing: 14px; color: #F5C518; font-family: monospace;">
                ${otp}
            </div>
            </div>

            <!-- Warning -->
            <div style="background: #161616; border-left: 3px solid #F5C518; padding: 14px 16px; margin-bottom: 28px;">
            <p style="font-size: 13px; color: #888; margin: 0;">
                🔒 If you didn't request this, you can safely ignore this email.
            </p>
            </div>

            <!-- Footer -->
            <div style="border-top: 1px solid #222; padding-top: 20px; text-align: center;">
            <p style="font-size: 12px; color: #555; margin: 0;">
                Resume Analyzer · Do not reply to this email
            </p>
            </div>
        </div>
        </div>
    `,
  });
}
