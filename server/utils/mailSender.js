const nodemailer = require("nodemailer");
require("dotenv").config();

const mailSender = async (email, title, body) => {
  try {

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.verify();
    console.log("SMTP READY");

    const info = await transporter.sendMail({
      from: `"EduVantra" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    });

    console.log("MAIL SENT:", info.response);

    return info;

  } catch (error) {
    console.log("MAIL ERROR:", error);
    throw error;
  }
};

module.exports = mailSender;