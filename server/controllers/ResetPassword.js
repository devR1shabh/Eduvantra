const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

//rest password token
exports.resetPasswordToken = async (req,res) =>{
    try{
        const {email} = req.body;

        const user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({
                success:false,
                message:"Your email is not registered with us",
            });
        }

        //generate token
        const token = crypto.randomUUID();

        //update user by adding token and expiry time
        const updatedDetails = await User.findOneAndUpdate(
            {email},
            {
                token:token,
                resetPasswordExpires : Date.now() + 5*60*1000,
            },
            {new:true}
        );

        //create url
        const url = `http://localhost:3000/update-password/${token}`;

        //send mail containing the url
        await mailSender(email , 
            "Password Reset Link",
            `Password Reset Link: ${url}`
        )

        return res.status(200).json({
            success:true,
            message:"Email sent successfully, please check the email and check the password",
        });

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while reset pwt token",
        })
    }
}


//reset password
exports.resetPassword = async (req,res) =>{
    try{
        //data fetch
        const {password,confirmPassword,token} = req.body;

        //validation
        if(password !== confirmPassword){
            return res.json({
                success:false,
                message:"Password not matching",
            });
        }

        //get user details
        const userDetails = await User.findOne({token});

        //if no entry - invalid token
        if(!userDetails){
            return res.json({
                success:false,
                message:"token is invalid",
            });
        }
        
        //token time check
        if(userDetails.resetPasswordExpires < Date.now()){
            return res.json({
                success:false,
                message:"Token expired",
            });
        }

        //password hash
        const hashedPassword = await bcrypt.hash(password,10);

        //password update
        await User.findOneAndUpdate(
            {token},
            {password:hashedPassword},
            {new:true},
        );

        //return response
        return res.status(200).json({
            success:true,
            message:"Password reset is successful",
        });

    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Something went wrong while reseting the password",
        });
    }
}