const mongoose = require("mongoose")
const Section = require("../models/Section")
const SubSection = require("../models/Subsection")
const CourseProgress = require("../models/CourseProgress")
const Course = require("../models/Course")

exports.updateCourseProgress = async (req, res) => {
  const { courseId, subsectionId } = req.body
  const userId = req.user.id

  try {
    // ✅ Check subsection exists
    const subsection = await SubSection.findById(subsectionId)
    if (!subsection) {
      return res.status(404).json({
        success: false,
        message: "Invalid subsection",
      })
    }

    // ✅ Find existing progress
    let courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    })

    // 🔥 FIX: Create if not exists
    if (!courseProgress) {
      courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [subsectionId],
      })
    } else {
      // ✅ Prevent duplicate
      if (courseProgress.completedVideos.includes(subsectionId)) {
        return res.status(400).json({
          success: false,
          message: "Subsection already completed",
        })
      }

      // ✅ Add subsection
      courseProgress.completedVideos.push(subsectionId)
      await courseProgress.save()
    }

    return res.status(200).json({
      success: true,
      message: "Course progress updated successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}


