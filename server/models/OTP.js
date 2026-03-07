const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");


const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now,
        expires:20*60,
    },
});

// function -> sends email
async function sendVerificationEmail(email , otp) {
    try{
        const mailResponse  = await mailSender(email , "Verification Email from Eduvantra" ,otp);
        console.log("Email sent Successfully: ", mailResponse);
    }catch(error){
        console.log("Error Occured while sending Mails: " ,error);
        throw error;
    }
}

OTPSchema.pre("save", async function () {
    try{
        await sendVerificationEmail(this.email, this.otp);
    }
    catch(error){
        console.log("Error while sending OTP email:", error);
        throw error;
    }
});

module.exports = mongoose.model("OTP" , OTPSchema);
