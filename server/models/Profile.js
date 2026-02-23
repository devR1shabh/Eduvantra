const mongoose = require("mongoose");


const profileSchema = new mongoose.Schema({
    gender:{
        type:String,
        enum:["Male" , "Female" , "Other" , "Rather Not Say"],
    },
    dateOfBirth:{
        type:Date,
    },
    about:{
        type:String,
        trim:true,
    },
    contactNumber:{
        type:String,
        trim:true,
        minlength:8,
        maxlength:15,
    },
}, {timestamps : true})

module.exports = mongoose.model("Profile" , profileSchema);