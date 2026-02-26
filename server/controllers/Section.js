const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req,res) =>{
    try{
        //data fetch
        const {sectionName , courseId} = req.body;

        //data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"Missing Properties",
            });
        }

        //create section
        const newSection = await Section.create({sectionName});

        //section update to course with ObjectId
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    courseContent:sectionId,
                }
            },
            {new:true},
        );

        //return successful response
        return res.status(200).json({
            success:true,
            message:"Section U[pdated Successfully",
            updatedCourseDetails
        });
        
        
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Couldn't create Section",
            error:error.message,
        });
    }
}

// update section 
exports.updateSection = async (req,res) =>{
    try{
        //data input
        const {sectionName , sectionId} = req.body;

        //data validation 
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"Missing Properties"
            });
        }
        
        //data update
        const updateSection = await Section.findByIdAndUpdate(
            {sectionId},
            {sectionName},
            {new:true},
        );

        //return response
        return res.status(200).json({
            success:true,
            message:"Section Updated Successfully",
        });

    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Couldnt update section please try again",
        });
    }
}

//delete section
exports.deleteSection = async (req,res) =>{
    try{

        const {sectionId} = req.params;

        await Section.findByIdAndDelete({sectionId});

        return res.status(200).json({
            success:true,
            message:"Deleted section successfully",
        });

    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to delete section",
        });
    }
}