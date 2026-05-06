const Profile = require("../models/Profile");
const CourseProgress = require("../models/CourseProgress");
const Course = require("../models/Course");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");
const mongoose = require("mongoose");
const {convertSecondsToDuration} = require("../utils/secToDuration");
//const { populate } = require("../models/RatingandReview");

//method for updating a profile
exports.updateProfile = async (req,res) =>{
    try{
        const {
            firstName = "",
            lastName = "",
            dateOfBirth = "",
            about = "",
            contactNumber = "",
            gender = "",


        } = req.body;

        const id = req.user.id;

        //find the profile by id
        const userDetails = await User.findById(id)
        const profile = await Profile.findById(userDetails.additionalDetails)

        const user = await User.findByIdAndUpdate(id,{
            firstName,
            lastName,
        })
        await user.save()

        //update the profile fields
        profile.dateOfBirth = dateOfBirth
        profile.about = about
        profile.contactNumber = contactNumber
        profile.gender = gender

        //save the updated profile
        await profile.save()

        //find the updated user details
        const updatedUserDetails = await User.findById(id)
          .populate("additionalDetails")
          .exec()

        return res.json({
            success:true,
            message:"profile updated successfully",
            updatedUserDetails,
        });
    }catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            error:error.message,
        });

    };
};

exports.deleteAccount = async (req,res) =>{
    try{
        const id = req.user.id
        console.log(id)

        const user = await User.findById({_id:id})
        if(!user){
            return res.status(404).json({
                sucess:false,
                message:"User not found",
            })
        }

        //delete the associated profile with the user
        //await Profile.findByIdAndDelete({_id:user.additionalDetails});
        await Profile.findByIdAndDelete({
            _id:new mongoose.Types.ObjectId(user.additionalDetails),
        })

        for(const courseId of user.courses){
            await Course.findByIdAndUpdate(
                courseId,
                {$pull:{studentsEnroled:id}},
                {new:true}
            )
        }

        //now delete user
        await User.findByIdAndDelete({_id:id})
        res.status(200).json({
            success:true,
            message:"User deleted successfully",
        })

        await CourseProgress.deleteMany({userId:id})

    }catch(error){
        console.error(error)
        res.status(500).json({
            success:false,
            message:"User cannot be deleted successfully"
        });

    };
};

exports.getAllUserDetails = async (req,res) =>{
    try{
        const id = req.user.id
        const userDetails = await User.findById(id)
          .populate("additionalDetails")
          .exec()


        console.log(userDetails)

        res.status(200).json({
            success:true,
            message:"User data fetched successfully",
            data:userDetails,
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });

    };
};

exports.updateDisplayPicture = async (req,res) =>{
    try{
       // console.log("FILES:", req.files);
        const displayPicture = req.files.displayPicture
        const userId = req.user.id
        const image = await uploadImageToCloudinary(
            displayPicture,
            process.env.FOLDER_NAME,
            1000,1000
        )

        console.log(image)

        const updatedProfile = await User.findByIdAndUpdate(
            {_id:userId},
            {image:image.secure_url},
            {new:true}
        )

        res.send({
            success:true,
            message:"Image Updated Successfully",
            data:updatedProfile,
        })

    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });

    };
};

// exports.getEnrolledCourses = async (req, res) => {
//   try {
//     const userId = req.user.id

//     let userDetails = await User.findOne({ _id: userId })
//       .populate({
//         path: "courses",
//         populate: {
//           path: "courseContent",
//           populate: {
//             path: "subSection",
//           },
//         },
//       })
//       .exec()

//     if (!userDetails) {
//       return res.status(404).json({
//         success: false,
//         message: `User not found`,
//       })
//     }

//     userDetails = userDetails.toObject()

//     // Loop through courses
//     for (let i = 0; i < userDetails.courses.length; i++) {
//       let totalDurationInSeconds = 0
//       let totalSubsections = 0

//       const course = userDetails.courses[i]

//       // Loop through sections
//       for (let j = 0; j < course.courseContent.length; j++) {
//         const section = course.courseContent[j]

//         // ✅ Safe duration calculation
//         const sectionDuration = section.subSection.reduce(
//           (acc, curr) => acc + Number(curr.timeDuration || 0),
//           0
//         )

//         totalDurationInSeconds += sectionDuration

//         // Count subsections
//         totalSubsections += section.subSection.length
//       }

//       // ✅ Set total duration (after full calculation)
//       course.totalDuration = convertSecondsToDuration(totalDurationInSeconds)

//       // ✅ Get progress
//       const progressDoc = await CourseProgress.findOne({
//         courseID: course._id,
//         userId: userId,
//       })

//       const completedVideos = progressDoc?.completedVideos?.length || 0

//       // ✅ Progress calculation
//       if (totalSubsections === 0) {
//         course.progressPercentage = 100
//       } else {
//         const percentage = (completedVideos / totalSubsections) * 100
//         course.progressPercentage = Math.round(percentage * 100) / 100
//       }
//     }

//     return res.status(200).json({
//       success: true,
//       data: userDetails.courses,
//     })
//   } catch (error) {
//     console.error(error)
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     })
//   }
// }

exports.getEnrolledCourses = async (req,res) =>{
    try{
        const userId = req.user.id
        let userDetails = await User.findOne({
            _id:userId,
        })
          .populate({
            path:"courses",
            populate:{
                path:"courseContent",
                populate:{
                    path:"subSection",
                },
            },
          })
          .exec()
        
        userDetails = userDetails.toObject()
        var SubsectionLength = 0

        for(var i=0;i<userDetails.courses.length;i++){
            let totalDurationInSeconds = 0
            SubsectionLength = 0
            for(var j=0;j<userDetails.courses[i].courseContent.length;j++){
                totalDurationInSeconds += userDetails.courses[i].courseContent[
                    j
                ].subSection.reduce((acc,curr) => acc + parseInt(curr.timeDuration),0)
                userDetails.courses[i].totalDuration = convertSecondsToDuration(
                    totalDurationInSeconds
                )
                SubsectionLength += userDetails.courses[i].courseContent[j].subSection.length
            }
            let courseProgressCount = await CourseProgress.findOne({
                courseID:userDetails.courses[i]._id,
                userId:userId,
            })
            courseProgressCount = courseProgressCount?.completedVideos.length
            if(SubsectionLength === 0){
                userDetails.courses[i].progressPercentage = 100
            }else{
                //to make it upto 2 decimal points
                const multiplier = Math.pow(10,2)
                userDetails.courses[i].progressPercentage = Math.round(
                    (courseProgressCount/SubsectionLength) * 100 * multiplier
                )/multiplier
            }
        }

        if(!userDetails){
            return res.status(400).json({
                success:false,
                message:`Could not user with id: ${userDetails}`,
            })
        }

        return res.status(200).json({
            success:true,
            data:userDetails.courses,
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })


    }
}

exports.instructorDashboard = async (req,res) =>{
    try{
        const courseDetails = await Course.find({instructor:req.user.id})

        const courseData = courseDetails.map((course) => {
            const totalStudentsEnrolled = course.studentsEnroled.length
            const totalAmountGenerated = totalStudentsEnrolled * course.price

            //create a new object with the additional fields
            const courseDataWithStats = {
                _id:course._id,
                courseName:course.courseName,
                courseDescription:course.courseDescription,
                //Include other course properties as needed
                totalStudentsEnrolled,
                totalAmountGenerated,
            }

            return courseDataWithStats

        })

        res.status(200).json({
            courses:courseData
        })

    }catch(error){
        console.error(error)
        res.status(500).json({
            message:"Server Error"
        })

    }
}