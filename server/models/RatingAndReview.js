const mongoose = require("mongoose");

//define the ratingandreview schema 
const ratingAndReviewSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User",
    },
    rating:{
        type:Number,
        required:true,
    },
    review:{
        type:String,
        required:true,
    },
    course:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Course",
        index:true,


    },
});

//export the RatingAndReview model
module.exports = mongoose.model("RatingAndReview",ratingAndReviewSchema);

