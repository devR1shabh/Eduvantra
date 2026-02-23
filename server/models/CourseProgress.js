const mongoose = require("mongoose");


const courseProgress = new mongoose.Schema({
    courseId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
    },
    completedVideo:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"SubSection",
        }
    ]
}, {timestamps:true})

module.exports = mongoose.model("CourseProgress" , courseProgress);