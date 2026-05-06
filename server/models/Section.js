const mongoose=require("mongoose");

//define the section schema 
const sectionSchema = new mongoose.Schema({
    sectionName:{
        type:String,
    },
    subSection:[
        {
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"subSection",
        },
    ],

});
module.exports = mongoose.model("Section",sectionSchema);
