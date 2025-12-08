import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    try {
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
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