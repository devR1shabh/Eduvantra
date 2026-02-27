const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const cloudinary = require("cloudinary");

exports.createSubSection = async (req,res) =>{
    try{
        const {title, timeDuration, description , sectionId } = req.body;
        const video = req.files.videoFile;
        
        if(!title || !timeDuration || !videoUrl || !description || !video){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            });
        }

        const videoUploadDetails = await uploadImageToCloudinary(video , process.env.FOLDER_NAME);

        const subSectionDetails = await SubSection.create({
            title:title,
            description:description,
            timeDuration:timeDuration,
            videoUrl:videoUploadDetails.secure_url,
        })

        const updatedSectionDetails = await Section.findByIdAndUpdate(
            sectionId,
            {
                $push:{subSection:subSectionDetails._id},
                
            },
            {new:true},
        );
        //log updated section here after populating query

        return res.status(200).json({
            success:true,
            message:"Subsection created successfully",
        });

    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Failed to create subsection",
        });
    }
}

// this is your homework - update and delete sub section is your homework
