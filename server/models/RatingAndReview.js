const mongoose = require("mongoose");


const ratingAndReviewSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User",
    },
    rating:{
        type:Number,
        required:true,
        min:1,
        max:5,
    },
    course:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Course",
        required:true,
    },
    review:{
        type:String,
        required:true,
        trim:true,
    },
} , {timestamps:true});

ratingAndReviewSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("RatingAndReview" , ratingAndReviewSchema);