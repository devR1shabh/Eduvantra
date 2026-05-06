const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");

//configuring dotenv to load environment variables from .env file
dotenv.config();

//This function is used as middleware to authenticate user requests
exports.auth = async (req,res,next) => {
    try{
        //extracting JWT from request cookies,body or header
        const token = 
            req.cookies?.token ||
            req.body?.token ||
            req.headers.authorization?.split(" ")[1];


        //if JWT is missing ,return 401 unauthorised response
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Token missing",
            })
        }

        try{
            //Veryfying the JWT using the secret key stored in environment variables
            const decode = await jwt.verify(token,process.env.JWT_SECRET);
            console.log(decode);

            //storing the decoded JWT payload in the request object for further use
            req.user = decode;

        }catch(error){
            //if JWT verification fails returns 401 unauthorised response
            return res.status(401).json({
                success:false,
                message:"token is invalid",
            });

        };

        //if JWT is valid move on to the next middelware or request handler
        next();

    }catch(error){
        //if there is an error during the authentication process,return 401 unauthorised response
        return res.status(401).json({
            success:false,
            message:"Something went wrong while validating the token",
        });

    }
};

exports.isStudent = async (req,res,next) => {
    try{
       // const userDetails = await User.findOne({email:req.user.email});

        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success:false,
                message:"this is the protected route for student",
            });
        }
        next();

    }catch(error){
        return res.status(500).json({
            success:false,
            message:"User role cant be matched",
        });

    };

}

exports.isAdmin = async (req,res,next) => {
    try{
        //const userDetails = await User.findOne({email:req.user.email});

        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success:false,
                message:"this is the protected route for Admin",
            });
        }
        next();
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"User role cannot be verified",
        });

    };
};

exports.isInstructor = async (req,res,next) => {
   try{
        //const userDetails = await User.findOne({email:req.user.email});

        // console.log("userdetails ->",userDetails)
        // console.log(userDetails.accountType)

        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success:false,
                message:"this is the protected route for Instructor",
            });
        }
        next();
   }catch(error){
        return res.status(500).json({
            success:false,
            message:"User role cannot be verified",
        });

   };
};
