const Profile = require("../models/Profile");
const User = require("../models/User");

exports.updateProfile = async (req,res) =>{
    try{
        const {dateOfBirth="" , contactNumber="" , about="" , gender} = req.body;
        const id = req.user.id;

        if(!contactNumber || !gender || !id){
            return res.status(400).json({
                success:false,
                message:"Please fill all the mandatory fields",
            });
        }

        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails  = await Profile.findById(profileId);

        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;

       await  profileDetails.save();

       return res.status(200).json({
        success:true,
        message:"Profile updated successfully",
        profileDetails,
       });

    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Failed To update profile",
        });
    }
}


//delete account 
exports.deleteAccount = async (req,res) =>{
    try{
        const id = req.user.id;
        const userDetails = await User.findById(id);

        if(!userDetails){
            return res.status(200).json({
                success:false,
                message:"No such user exists",
            });
        }

        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});

        await User.findByIdAndDelete({_id:id});

        return res.status(200).json({
            success:true,
            message:"User deleted successfully",
        });

    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Failed to delete profile",
            error:error.message,
        })
    }
}

exports.getAllUserDetails = async (req,res) =>{
    try{
        const id = req.user.id;

        const userDetails = await User.findById(id).populate("additionalDetails").exec();

        return res.status(200).json({
            success:true,
            message:"user data fetched successfully",
        });

    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Failed to get all user details",
            error:error.message,
        });
    }
}

