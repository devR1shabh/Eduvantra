const User = require("../models/User");

const bcrypt = require("bcryptjs");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const mailSender = require("../utils/mailSender");
const Profile = require("../models/Profile");
require("dotenv").config();
const { passwordUpdated } = require("../templates/passwordUpdate")


//signup controller for registering users
exports.signup = async(req , res) => {
    try{
        //Destructure fields from the request body
        const{
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp,
        } = req.body;

        //Check if all the details are there or not(validation)
        if(!firstName || !lastName || !email || !password || !confirmPassword || !accountType ||   !otp){
            return res.status(403).json({
                success:false,
                message:"All fields are required",
            })
        }

        //check if password and confirm pasword match
        if(password !== confirmPassword){
            return res.status(400).json({
                success:"false",
                message:"Password and Confirm Password do not match.Please try again.",

            })
        }

        //check if user already exist 
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User already exists.Please sign in to continue",

            })
        }
        
        // Find the most recent otp for the email
        const response = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(response)
        if(response.length === 0){
            //OTP not found for the email
            return res.status(400).json({
                success:false,
                message:"The otp is not valid",
            })
        }else if(otp !== response[0].otp){
            //invalid OTP
            return res.status(400).json({
                success:false,
                message:"The OTP is not valid",
            })
        }

        //hash the password
        const hashedPassword = await bcrypt.hash(password,10);

        //create the user
        let approved = ""
        approved === "Instructor" ? (approved=false):(approved=true)

        //create the additional profile for user
        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null,
        })

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType:accountType,
            //approved:approved,
            additionalDetails:profileDetails._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,

        })

        return res.status(200).json({
            success:true,
            user,
            message:"User registered succesfully",
        })
    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:"User cannot be registered.Please try again.",
        })

    }
}

//login controller for authenticating users
//step 1.get data from req body
//step 2.do validation on data
//step 3.check user exist or not
//step 4.Do password matching
//step 5.if password matches,generate jwt token
//step 6.create cookie and send response

exports.login = async (req,res) =>{
    try{

        //get email and password from request body
        const{email,password} = req.body;

        //check if email or password is missing
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"Please fill up all the required fields",
            })
        }

        //find the user with the provided email
        const user = await User.findOne({email}).populate("additionalDetails");

        //If user not found with provided email
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered with us please signup to continue",
            })
        }

        //generate jwt token and compare password
        if (await bcrypt.compare(password,user.password)){
            const payload = {
                email:user.email,
                id:user._id,
                accountType:user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET,{
                expiresIn:"2h"
            });

            //save token to user document in database
            user.token = token;
            user.password = undefined;

            //set cookie for token and return success response
            const options = {
                expires:new Date(Date.now() + 3*24*60*60*1000),
                httponly:true,
            }
            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:"user login successfully",
            })
        }else{
            return res.status(401).json({
                success:false,
                message:"password is incorrect",
            })
        }

    }
    catch(error){
        console.error(error);
        //return 500 internal server error status code with error message
        return res.status(500).json({
            success:false,
            message:"login failure please try again",
        })
    }
}

//Send OTP for email verification
exports.sendOTP = async (req,res) => {
    try{
        const {email} = req.body;

        //check if user already present 
        //find user with provided email
        const CheckUserpresent = await User.findOne({email})
        //to be used in case of signup
        
        //if user found with provided email
        if(CheckUserpresent){
            //return 401 unauthorised status code with error message
            return res.status(401).json({
                success:false,
                message:`User is already registered`,
            })
        }

        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        })

        let result = await OTP.findOne({otp:otp})
        console.log("Result is Generate OTP func")
        console.log("OTP",otp)
        console.log('Result',result)

        while(result){
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            result = await OTP.findOne({otp:otp});
        }

        const otpPayload = {email,otp}
        const otpBody = await OTP.create(otpPayload)//otp is stored in database so that the otp entered by user during signup can be matched with database
        console.log("OTP Body", otpBody)
        res.status(200).json({
            success:true,
            message:`OTP sent successfully`,
            otp,
        })
    }
    catch(error){

        console.log(error.message)
        return res.status(500).json({
            success:false,
            message:error.message,
        })

    }
}

//controller fro changing password
exports.changePassword = async (req,res) => {
    try{
        //get user data from req.user
        const userDetails = await User.findById(req.user.id);

        //get old password, new password, and confirm new password from req.body
        const {oldPassword, newPassword}=req.body;

        //validate old password
        const isPasswordMatch = await bcrypt.compare(
            oldPassword,
            userDetails.password
        )

        if(!isPasswordMatch){
            //if old password does not match,return a 401(unauthorized error)
            return res.status(401).json({
                success:false,
                message:"The password is incorrect"
            })
        }

        //Update the password
        const encryptedPassword = await bcrypt.hash(newPassword,10)
        const updatedUserDetails = await User.findByIdAndUpdate(
            req.user.id,
            {password: encryptedPassword},
            {new : true}
        )

        //send notification email
        try{
            const emailResponse = await mailSender(
                updatedUserDetails.email,
                "password for your account has been updated successfully",
                passwordUpdated(
                    updatedUserDetails.email,
                    `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
            
            )
            console.log("Email sent succesfully:" ,emailResponse.response)
        }
        catch(error){
            //if there's an error sending the email, log the error and return a 500(internal server error)error
            console.error("Error occured while sending email:",error)
            return res.status(500).json({
                success:false,
                message:"error occured while sending email",
                error:error.message,
            })
        }

        return res.status(200).json({
            success:true,
            message:"password updated successfully",
        })
    }
    catch(error){
        //if thers's an error updating the password , log the error and return a 500(internal server error)error
        console.error("Error occured while updating password:",error)
        return res.status(500).json({
            success:false,
            message:"Error occured while updating password",
            error:error.message,

        })

    }
}