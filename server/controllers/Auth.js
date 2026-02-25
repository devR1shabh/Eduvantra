const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const Profile = require("../models/Profile");
const bcrypt  = require("bcrypt");
const jwt = require("jsonwebtoken");


//send OTP
exports.sendOTP = async (req,res) =>{

    try{
        //fetch email from req body
        const {email} = req.body;
        
        //check if user already exists or not
        const checkUserPresent = await User.findOne({email});
         
        if(checkUserPresent){
            return res.status(400).json({
            success:false,
            message:"User already registered",
        });
    }

    //generate OTP
    var otp = otpGenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
    })
    console.log("OTP is Generated " ,otp);

    let result = await OTP.findOne({otp});

    while(result){
        otp = otpGenerator.generate(6 , {
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false
        });

        result  = await OTP.findOne({otp});
    }
    const otpPayload = {email , otp};

    //create an entry in db for otp
    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

    //return response successful
    res.status(200).json({
        success:true,
        message:"OTP sent successfully",
    });

}catch(error){
    console.log("error is- ",error);
    return res.status(500).json({
        success:false,
        message:error.message
    });
}
}


exports.signup = async (req,res) =>{
    try{
        //data fetch from req body

        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        }  = req.body;

        //validate data
        if(!firstName || !lastName || !email || !password || !confirmPassword || !contactNumber || !otp){
            return res.status(403).json({
                success:false,
                message:"All Fields are required",
            });
        }

        //2 passwords match
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Both Passwords must be same",
            });
        }

        //check user already exists or not
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User Already exists",
            });
        }

        //find most recent otp for the user
        const recentOtp = await OTP.findOne({email})
        .sort({createdAt : -1});
        console.log(recentOtp);

        //validate otp
        if(!recentOtp){
            return res.status(400).json({
                success:false,
                message:"OTP not found",
            });
        }
        if(otp !== recentOtp.otp){
            return res.status(400).json({
                success:false,
                message:"Invalid OTP",
            });
        }

        //hash password
        const hashedPassword = await bcrypt.hash(password ,10);

        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null,
        });

        //create entry in db
        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            accountType,
            password:hashedPassword,
            additionalDetails:profileDetails._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })
        
        // return response
        return res.status(200).json({
            success:true,
            message:"User is registered successfully",
        });

    }catch(error){
        console.log("error is: ",error);
        return res.status(500).json({
            success:false,
            message:"User cannot be registered Please try again",
        });
    }
}


exports.login = async (req,res) =>{
    try{
        //get data from req body
        const{email,password} = req.body;

        //validate data
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"Please fill all the fields",
            });
        }

        //check if user registered or not
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered please signup first",
            });
        }

        //passwords match and generate token
        const payload = {
            email:user.email,
            id:user._id,
            accountType:user.accountType,
        };

        if(await bcrypt.compare(password, user.password)){
            const token = jwt.sign(payload , process.env.JWT_SECRET , {
                expiresIn:"2h",
            });
            user.token = token;
            user.password = undefined;
        

        //create cookie and send response
        const options = {
            expires: new Date(Date.now() + 3*24*60*60*1000),
            httpOnly:true,
        };

        res.cookie("token" , token , options).status(200).json({
            success:true,
            token,
            user,
            message:"Logged in successfully",
        });
    }
    else{
        return res.status(401).json({
            success:false,
            message:"Password is incorrect",
        });
    }

    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Login Failure Please Try again",
        })
    }
}


// hw - changePassword controller
