const Course = require("../models/Course");
const Tag = require("../models/tags");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

//create course
exports.createCourse = async (req,res) =>{
    try{
        //data fetch
        const {courseName , courseDescription , whatYouWillLearn , price , tag} = req.body;

        //get thumnail
        const thumbnail = req.files.thumbnailImage;

        //validation
        if(!courseName || !courseDescription || !whatWillYouLearn || !price || !tag) {
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            });
        }

        //check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        // console.log(instructorDetails);
        // is user id and instrcutor id both the same

        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"Instructor details not found",
            });
        }

        //check given tag is valid or not
        const tagDetails = await Tag.findById(tag);
        if(!tagDetails){
            return res.status(404).json({
                success:false,
                message:"Tag details not found",
            });
        }

        //upload image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail , process.env.FOLDER_NAME);

        //entry create for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn,
            price,
            tag:tagDetails._id,
            thumbnail:thumbnailImage.secure_url
        });

        //add the new course to the user schema of instructor
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push:{
                    courses: newCourse._id,
                }
            },
            {new:true},
        );

        //update the tag schema



        return res.status(200).json({
            success:true,
            message:"Course created successfully",
        });

    }catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

//show all courses
exports.showAllCourses = async(req,res) =>{
    try{
        const allCourses = await Course.find({} , {courseName:true, 
            price:true , 
            thumbnail:true,
            instructor:true,
            ratingAndReviews:true,
            studentsEnrolled:true,
        })
        .populate("instructor")
        .exec();

        return res.status(200).json({
            success:true,
            message:"Data for all courses fetched successfully",
            data:allCourses,
        });


    }catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:"Coudn't fetch all courses",
            error:error.message
        });
    }
}

//get course details
exports.getCourseDetails = async (req,res) =>{
    try{
        const {courseId} = req.body;
        //find course details
        const courseDetails = await Course.find(
            {_id:courseId}
        )
        .populate(
            {
                path:"Instructor",
                populate:{
                    path:"additionalDetails",
                }
            }
        )
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
            path:"courseContent",
            populate:{
                path:"subSection",
            },
        })
        .exec();

        //validation
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:`could not find the course with the course id ${courseId}`,
            });
        }

        return res.status(200).json({
            success:true,
            message:"Course details fetched successfully",
            data:courseDetails,
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}