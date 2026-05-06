const RatingAndReview = require("../models/RatingandReview");
const Course = require("../models/Course");
const mongoose = require("mongoose");


//create a new rating and review
exports.createRating = async(req , res ) =>{
    try{
        const userId = req.user.id
        const{rating , review , courseId} = req.body;

        //check if the user is enrolled in the course
        const courseDetails = await Course.findOne({
            _id:courseId,
            studentsEnroled:{$elemMatch:{$eq:userId}},
            //simple way-> studentsEnroled:userId
        })

        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message:"student is not enrolled in this course",
            })
        }

        //check if the user has already reviewed the course 
        const alreadyReviewed = await RatingAndReview.findOne({
            user:userId,
            course:courseId,
        })

        if(alreadyReviewed){
            return res.status(403).json({
                success:false,
                message:"course already reviewed by user",
            });
        };

        //Create a new rating and review 
        const ratingReview = await RatingAndReview.create({
            rating,
            review,
            course:courseId,
            user:userId,
        })

        //Add the rating and review to the course
        await Course.findByIdAndUpdate(courseId, {
            $push: {
                ratingAndReviews: ratingReview,
            },
        })
        await courseDetails.save()
        // const updatedCourseDetails = await Course.findByIdAndUpdate(courseId,{
        //     $push:{
        //         ratingAndReviews:ratingReview._id,
        //     },
        // },{new:true});

        // console.log(updatedCourseDetails);

        //await courseDetails.save()

        return res.status(200).json({
            success:true,
            message:"Rating and Review created successfully",
            ratingReview,
        });
    }catch(error){
        console.error(error)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error:error.message,
        });

    };
};

//get average rating
exports.getAverageRating = async(req,res) =>{
    try{
        //get course id
        const courseId = req.body.courseId;

        //calculate the average rating
        const result = await RatingAndReview.aggregate([
            {
                $match:{
                    course:new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group:{
                    _id:null,
                    averageRating:{$avg:"$rating"},
                }
            }
        ])

        //return rating
        if(result.length>0){
            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating,
            })
        }

        //if no review or rating exist
        return res.status(200).json({
            success:true,
            message:"average rating is 0, no ratings given till now",
            averageRating:0,
        });



    }catch(error){

        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });

    };
};


//get all rating and review
exports.getAllRatingAndReview = async (req,res) =>{
    try{
        const allReviews = await RatingAndReview.find({})
            .sort({rating:"desc"})
            .populate({
                path:"user",
                select:"firstName lastName email image",//specify the fields you want to populate from the "profile" model

            })
            .populate({
                path:"course",
                select:"courseName",//specify the fields you want to populate from the "Course" model

            })
            .exec()

        res.status(200).json({
            success:true,
            data:allReviews,
        })

    }catch(error){
        console.error(error)
        return res.status(500).json({
            success:false,
            message:"failed to retrieve the rating and review for the course",
            error:error.message,
        });

    };
};

