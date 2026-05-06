const nodemailer = require("nodemailer");
require("dotenv").config();

const mailSender = async (email, title, body) => {
    try{
        if(!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASS){
            throw new Error("Mail service is not configured");
        }

        const host = process.env.MAIL_HOST.trim();
        const user = process.env.MAIL_USER.trim();
        const pass = process.env.MAIL_PASS.trim();
        const configuredPort = Number(process.env.MAIL_PORT);
        const port = configuredPort || 465;

        const createTransporter = (smtpPort) => nodemailer.createTransport({
            host,
            port:smtpPort,
            secure:smtpPort === 465,
            requireTLS:smtpPort !== 465,
            connectionTimeout:10000,
            greetingTimeout:10000,
            socketTimeout:20000,
            tls:{
                servername:host,
                minVersion:"TLSv1.2",
            },
            auth:{
                user,
                pass,
            },
        });

        const mailOptions = {
            from:`"EduVantra" <${user}>`,
            to:`${email}`,
            subject:`${title}`,
            html:`${body}`,
        };

        let transporter = createTransporter(port);
        let info;

        try{
            info = await transporter.sendMail(mailOptions);
        }
        catch(error){
            const shouldRetryWithSecureGmail =
                host === "smtp.gmail.com" &&
                port !== 465 &&
                ["ETIMEDOUT", "ECONNECTION", "ESOCKET"].includes(error.code);

            if(!shouldRetryWithSecureGmail){
                throw error;
            }

            transporter = createTransporter(465);
            info = await transporter.sendMail(mailOptions);
        }

        console.log(info);
        return info;
    }
    catch(error){
        console.log(error.message);
        throw error;
    }
};

module.exports = mailSender;
