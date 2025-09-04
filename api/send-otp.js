import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 5 * 60 * 1000);

  try {
    // Transporter Gmail pakai App Password
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER, // Gmail kamu
        pass: process.env.EMAIL_PASS, // App password
      },
    });

    // Kirim email OTP
    await transporter.sendMail({
      from: `HeroAPP OTP <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Kode OTP Verifikasi",
      text: `Kode OTP kamu adalah ${otp}. Berlaku sampai ${expiry.toLocaleTimeString()}`,
    });

    return res.status(200).json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error("MAIL ERROR:", err);
    return res.status(500).json({ error: "Failed to send email", detail: err.message });
  }
}