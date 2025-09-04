import nodemailer from "nodemailer";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Konfigurasi Firebase dari .env
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

  try {
    // Simpan ke Firestore
    await setDoc(doc(db, "emailOtps", email), {
      otp,
      expiry: expiry.toISOString(),
    });

    // Kirim via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `HeroAPP OTP <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Kode OTP Verifikasi",
      text: `Kode OTP kamu adalah ${otp}. Berlaku sampai ${expiry.toLocaleTimeString()}`,
    });

    return res.status(200).json({ success: true, message: "OTP sent" });
 } catch (err) {
  console.error("ERROR SEND OTP:", err); // biar detail keluar
  return res.status(500).json({ error: `Failed to send email`, detail: err.message });
 }
}