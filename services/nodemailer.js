import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 🔍 Verify once at startup (optional but recommended)
export const verifyEmailService = async () => {
  try {
    await transporter.verify();
    console.log("📧 Email service ready");
  } catch (err) {
    console.error("❌ Email service error:", err.message);
  }
};

export const sendWelcomeEmail = async ({ to, firstName }) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: "Welcome to AI Summit 🎉",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Hello ${firstName},</h2>
        <p>Welcome to <strong>AI Summit</strong>!</p>
        <p>Your registration was successful.</p>
        <p>We look forward to seeing you at the event 🚀</p>
        <br/>
        <p>— AI Summit Team</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};
