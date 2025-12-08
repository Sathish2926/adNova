import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    try {
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,        // Changed from 587
  secure: true,     // Changed from false. MUST be true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // These settings prevent hanging if Google blocks the IP
  connectionTimeout: 10000, 
  greetingTimeout: 5000,
  socketTimeout: 10000
});
        const message = {
            from: `AdNova Support <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
        };
        const info = await transporter.sendMail(message);
        console.log("Email sent: " + info.response);
    } catch (error) {
        console.error("Nodemailer Error:", error);
        throw new Error("Email sending failed");
    }
};

export default sendEmail;