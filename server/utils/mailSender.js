const nodemailer = require("nodemailer");
require("dotenv").config();

const mailSender = async (email ,title ,body) => {
    try{
        const port = Number(process.env.MAIL_PORT) || 587;
        let transporter = nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            port,
            secure: port === 465,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS,
            }
        })

        let info = await transporter.sendMail({
            from:`"EduVantra" <${process.env.MAIL_USER}>`,
            to:`${email}`,
            subject:`${title}`,
            html:`${body}`,
        })
        console.log(info);
        return info;

    }
    catch(error){
        console.log(error.message);
        throw error;

    }
}

module.exports = mailSender;
