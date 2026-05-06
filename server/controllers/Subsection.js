//import necessary modules
const Section = require("../models/Section");
const subSection = require("../models/Subsection");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

//create a new subsection for a given section
// exports.createSubSection = async (req , res) =>{
//     try{
//         //extract necessary inforamtion from request body
//         const {sectionId, title, description} = req.body;
//         const video = req.files.video;

//         //check if all necessary details are provided
//         if(!sectionId || !title || !description || !video){
//             return res.status(404).json({
//                 success:false,
//                 message:"All fields are required",
//             });

//         };

//         console.log(video);

//         //upload the video file to cloudinary
//         const uploadDetails = await uploadImageToCloudinary(
//             video,
//             process.env.FOLDER_NAME
//         )
//         console.log(uploadDetails)

//         //create a new sub-section with the necessary information
//         const SubSectionDetails = await subSection.create({
//             title:title,
//             timeDuration:duration,
//             description:description,
//             videoUrl:uploadDetails.secure_url,
//         })

//         //update the corresponding section with the newly created subsection
//         const updatedSection = await Section.findByIdAndUpdate(
//             {_id:sectionId},
//             {$push:{subSection:SubSectionDetails._id}},
//             {new:true}
//         ).populate("subSection")


//         //return the updated section in the response
//         return res.status(200).json({
//             success:true,
//             data:updatedSection
//         });

//     }catch(error){
//         //handle any error that may occur during the process
//         console.error("Error creating new sub-section:",error)
//         return res.status(500).json({
//             success:false,
//             message:"Internal server error",
//             error:error.message,
//         });

//     };
// };

exports.createSubSection = async (req, res) => {
  try {
    const { sectionId, title, description } = req.body
    const video = req.files?.video

    // ✅ Validation
    if (!sectionId || !title || !description || !video) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      })
    }

    // Upload video
    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    )

    console.log("UPLOAD DETAILS:", uploadDetails)

    // ✅ FIX: correct field + safe conversion
    const duration = Number(uploadDetails.duration)

    if (!duration || isNaN(duration)) {
      return res.status(500).json({
        success: false,
        message: "Video duration not found",
      })
    }

    // Create subsection
    const subSectionDetails = await subSection.create({
      title,
      timeDuration: duration, // ✅ NUMBER (not string)
      description,
      videoUrl: uploadDetails.secure_url,
    })

    // Update section
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      { $push: { subSection: subSectionDetails._id } },
      { new: true }
    ).populate("subSection")

    return res.status(200).json({
      success: true,
      data: updatedSection,
    })
  } catch (error) {
    console.error("Error creating new sub-section:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

exports.updateSubSection = async (req, res) =>{
    try{
        const {sectionId,subSectionId,title,description} = req.body
        const SubSection = await subSection.findById(subSectionId)

        if(!SubSection){
            return res.status(404).json({

                success:false,
                message:"SubSection not found",
            })
        }

        if(title !== undefined){
            SubSection.title = title;
        }

        if(description !== undefined){
            SubSection.description = description;
        }

        if(req.files && req.files.video !== undefined){
            const video = req.files.video
            const uploadDetails = await uploadImageToCloudinary(
                video,
                process.env.FOLDER_NAME,
            )
            SubSection.videoUrl = uploadDetails.secure_url
            SubSection.timeDuration = `${uploadDetails.timeDuration}`
        }

        await SubSection.save()

        //find updated section and return it 
        const updatedSection = await Section.findById(sectionId).populate(
            "subSection"
        )

        console.log("updated section",updatedSection);

        return res.status(200).json({
            success:true,
            message:"Section updated successfully",
            data:updatedSection,
        });


    }catch(error){
        console.error(error)
        return res.status(500).json({
            success:false,
            message:"An error occured while updating the section"
            
        });

    };
};

exports.deleteSubSection = async(req,res) =>{
    try{
        const{subSectionId,sectionId} = req.body;
        await Section.findByIdAndUpdate(
            {_id:sectionId},
            {
                $pull:{
                    subSection:subSectionId,
                },
            }
        )
        const SubSection = await subSection.findByIdAndDelete({_id:subSectionId})

        if(!SubSection){
            return res.status(404).json({
                success:false,
                message:"subsection not found"
            });
        };

        //find the updated section and return it
        const updatedSection = await Section.findById(sectionId).populate(
            "subSection"
        )

        return res.json({
            success:true,
            message:"subsection deleted succesfully",
            data:updatedSection,
        });

    }catch(error){
        console.error(error)
        return res.status(500).json({
            success:false,
            message:"An error occured while deleting the subsection",
        });

    };
};

