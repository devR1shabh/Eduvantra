const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcryptjs");

//resetPasswordToken
exports.resetPasswordToken = async (req,res) =>{
    try{
        //get email from request body
        const email = req.body.email;

        //check user exists for this email or not ,email validation
        const user = await User.findOne({email:email});
        if(!user){
            return res.json({
                success:false,
                message:"Your email is not registered with us",
            })
        }

        //generate token
        const token = crypto.randomUUID();
        
        //update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate({email:email},{token:token,resetPasswordExpires:Date.now() + 5*60*1000},{new:true});

        //create url
        const url = `http://localhost:3000/update-password/${token}`;

        //send mail containing the url
        await mailSender(email,"password reset link",`Password reset link ${url}`);

        //return response
        return res.status(200).json({
            success:true,
            message:"Email sent successfully,please check your mail and change your password"
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

//reset password
exports.resetPassword = async(req,res) =>{
    try{

        //data fetch
        const {password, confirmPassword, token} = req.body;
        
        //validation
        if(password !== confirmPassword){
            return res.json({
                success:false,
                message:"password and confirm password do not match",
            });
        }

        //get userdetails from database using Token
        const userDetails = await User.findOne({token:token});
        //if no entry then the token is invalid
        if(!userDetails){
            return res.json({
                success:false,
                message:"Token is invalid",
            });
        }
        //token time check
        if(userDetails.resetPasswordExpires < Date.now() ){
            return res.json({
                success:false,
                message:"Token is expired,please regenerate your token",
            });
        }

        //hash password
        const hashedpassword = await bcrypt.hash(password, 10);

        //password update
        await User.findOneAndUpdate(
            {token:token},
            {password:hashedpassword},
            {new:true},
        );

        //return response
        return res.status(200).json({
            success:true,
            message:"password reset successfully",
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"something went wrong while resetting the password,please try again after sometime",
        });


    };
}

