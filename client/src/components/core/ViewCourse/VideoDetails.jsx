import React, { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams, useLocation } from "react-router-dom"

import { markLectureAsComplete } from "../../../services/operations/courseDetailsAPI"
import { updateCompletedLectures } from "../../../slices/viewCourseSlice"
import IconBtn from "../../common/IconBtn"

const VideoDetails = () => {
  const { courseId, sectionId, subSectionId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const playerRef = useRef(null)
  const dispatch = useDispatch()

  const { token } = useSelector((state) => state.auth)
  const { courseSectionData, courseEntireData, completedLectures } =
    useSelector((state) => state.viewCourse)

  const [videoData, setVideoData] = useState(null)
  const [previewSource, setPreviewSource] = useState("")
  const [videoEnded, setVideoEnded] = useState(false)
  const [loading, setLoading] = useState(false)

  // 🔹 Load current video
  useEffect(() => {
    if (!courseSectionData.length) return

    if (!courseId || !sectionId || !subSectionId) {
      navigate(`/dashboard/enrolled-courses`)
      return
    }

    const filteredSection = courseSectionData.find(
      (sec) => sec._id === sectionId
    )

    const filteredVideo = filteredSection?.subSection.find(
      (sub) => sub._id === subSectionId
    )

    setVideoData(filteredVideo)
    setPreviewSource(courseEntireData?.thumbnail)
    setVideoEnded(false)
  }, [courseSectionData, courseEntireData, location.pathname])

  // 🔹 First video check
  const isFirstVideo = () => {
    const sectionIndex = courseSectionData.findIndex(
      (sec) => sec._id === sectionId
    )

    const subIndex =
      courseSectionData[sectionIndex]?.subSection.findIndex(
        (sub) => sub._id === subSectionId
      )

    return sectionIndex === 0 && subIndex === 0
  }

  // 🔹 Last video check
  const isLastVideo = () => {
    const sectionIndex = courseSectionData.findIndex(
      (sec) => sec._id === sectionId
    )

    const subSections = courseSectionData[sectionIndex]?.subSection || []
    const subIndex = subSections.findIndex(
      (sub) => sub._id === subSectionId
    )

    return (
      sectionIndex === courseSectionData.length - 1 &&
      subIndex === subSections.length - 1
    )
  }

  // 🔹 Next video
  const goToNextVideo = () => {
    const sectionIndex = courseSectionData.findIndex(
      (sec) => sec._id === sectionId
    )

    const subSections = courseSectionData[sectionIndex].subSection
    const subIndex = subSections.findIndex(
      (sub) => sub._id === subSectionId
    )

    if (subIndex < subSections.length - 1) {
      const nextSubId = subSections[subIndex + 1]._id
      navigate(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubId}`
      )
    } else {
      const nextSection = courseSectionData[sectionIndex + 1]
      if (!nextSection) return

      navigate(
        `/view-course/${courseId}/section/${nextSection._id}/sub-section/${nextSection.subSection[0]._id}`
      )
    }
  }

  // 🔹 Previous video
  const goToPrevVideo = () => {
    const sectionIndex = courseSectionData.findIndex(
      (sec) => sec._id === sectionId
    )

    const subSections = courseSectionData[sectionIndex].subSection
    const subIndex = subSections.findIndex(
      (sub) => sub._id === subSectionId
    )

    if (subIndex > 0) {
      const prevSubId = subSections[subIndex - 1]._id
      navigate(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${prevSubId}`
      )
    } else {
      const prevSection = courseSectionData[sectionIndex - 1]
      if (!prevSection) return

      const lastSub =
        prevSection.subSection[prevSection.subSection.length - 1]

      navigate(
        `/view-course/${courseId}/section/${prevSection._id}/sub-section/${lastSub._id}`
      )
    }
  }

  // 🔹 Mark lecture complete
  const handleLectureCompletion = async () => {
    setLoading(true)

    const res = await markLectureAsComplete(
      { courseId, subsectionId: subSectionId },
      token
    )

    if (res) {
      dispatch(updateCompletedLectures(subSectionId))
    }

    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-5 text-white">
      {!videoData ? (
        <img
          src={previewSource}
          alt="Preview"
          className="h-full w-full rounded-md object-cover"
        />
      ) : (
        <div className="relative">
          <video
            ref={playerRef}
            className="w-full rounded-md"
            controls
            onEnded={() => setVideoEnded(true)}
            src={videoData?.videoUrl}
          />

          {/* Overlay when video ends */}
          {videoEnded && (
            <div className="absolute inset-0 z-[100] grid place-content-center bg-gradient-to-t from-black via-black/70 to-transparent">
              
              {!completedLectures.includes(subSectionId) && (
                <IconBtn
                  disabled={loading}
                  onclick={handleLectureCompletion}
                  text={!loading ? "Mark As Completed" : "Loading..."}
                  customClasses="text-xl px-4 mx-auto"
                />
              )}

              <IconBtn
                onclick={() => {
                  if (playerRef.current) {
                    playerRef.current.currentTime = 0
                    playerRef.current.play()
                    setVideoEnded(false)
                  }
                }}
                text="Rewatch"
                customClasses="text-xl px-4 mx-auto mt-2"
              />

              <div className="mt-10 flex justify-center gap-4 text-xl">
                {!isFirstVideo() && (
                  <button onClick={goToPrevVideo} className="blackButton">
                    Prev
                  </button>
                )}
                {!isLastVideo() && (
                  <button onClick={goToNextVideo} className="blackButton">
                    Next
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <h1 className="mt-4 text-3xl font-semibold">
        {videoData?.title}
      </h1>

      <p className="pt-2 pb-6">
        {videoData?.description}
      </p>
    </div>
  )
}

export default VideoDetails

// import React, { useEffect, useRef, useState } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { useNavigate, useParams } from "react-router-dom"

// import "video-react/dist/video-react.css"
// import { useLocation } from "react-router-dom"
// import { BigPlayButton, Player } from "video-react"

// import { markLectureAsComplete } from "../../../services/operations/courseDetailsAPI"
// import { updateCompletedLectures } from "../../../slices/viewCourseSlice"
// import IconBtn from "../../Common/IconBtn"

// const VideoDetails = () => {
//   const { courseId, sectionId, subSectionId } = useParams()
//   const navigate = useNavigate()
//   const location = useLocation()
//   const playerRef = useRef(null)
//   const dispatch = useDispatch()
//   const { token } = useSelector((state) => state.auth)
//   const { courseSectionData, courseEntireData, completedLectures } =
//     useSelector((state) => state.viewCourse)

//   const [videoData, setVideoData] = useState([])
//   const [previewSource, setPreviewSource] = useState("")
//   const [videoEnded, setVideoEnded] = useState(false)
//   const [loading, setLoading] = useState(false)

//   useEffect(() => {
//     ;(async () => {
//       if (!courseSectionData.length) return
//       if (!courseId && !sectionId && !subSectionId) {
//         navigate(`/dashboard/enrolled-courses`)
//       } else {
//         // console.log("courseSectionData", courseSectionData)
//         const filteredData = courseSectionData.filter(
//           (course) => course._id === sectionId
//         )
//         // console.log("filteredData", filteredData)
//         const filteredVideoData = filteredData?.[0]?.subSection.filter(
//           (data) => data._id === subSectionId
//         )
//         // console.log("filteredVideoData", filteredVideoData)
//         setVideoData(filteredVideoData[0])
//         setPreviewSource(courseEntireData.thumbnail)
//         setVideoEnded(false)
//       }
//     })()
//   }, [courseSectionData, courseEntireData, location.pathname])

//   // check if the lecture is the first video of the course
//   const isFirstVideo = () => {
//     const currentSectionIndx = courseSectionData.findIndex(
//       (data) => data._id === sectionId
//     )

//     const currentSubSectionIndx = courseSectionData[
//       currentSectionIndx
//     ].subSection.findIndex((data) => data._id === subSectionId)

//     if (currentSectionIndx === 0 && currentSubSectionIndx === 0) {
//       return true
//     } else {
//       return false
//     }
//   }

//   // go to the next video
//   const goToNextVideo = () => {
//     // console.log(courseSectionData)

//     const currentSectionIndx = courseSectionData.findIndex(
//       (data) => data._id === sectionId
//     )

//     const noOfSubsections =
//       courseSectionData[currentSectionIndx].subSection.length

//     const currentSubSectionIndx = courseSectionData[
//       currentSectionIndx
//     ].subSection.findIndex((data) => data._id === subSectionId)

//     // console.log("no of subsections", noOfSubsections)

//     if (currentSubSectionIndx !== noOfSubsections - 1) {
//       const nextSubSectionId =
//         courseSectionData[currentSectionIndx].subSection[
//           currentSubSectionIndx + 1
//         ]._id
//       navigate(
//         `/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`
//       )
//     } else {
//       const nextSectionId = courseSectionData[currentSectionIndx + 1]._id
//       const nextSubSectionId =
//         courseSectionData[currentSectionIndx + 1].subSection[0]._id
//       navigate(
//         `/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubSectionId}`
//       )
//     }
//   }

//   // check if the lecture is the last video of the course
//   const isLastVideo = () => {
//     const currentSectionIndx = courseSectionData.findIndex(
//       (data) => data._id === sectionId
//     )

//     const noOfSubsections =
//       courseSectionData[currentSectionIndx].subSection.length

//     const currentSubSectionIndx = courseSectionData[
//       currentSectionIndx
//     ].subSection.findIndex((data) => data._id === subSectionId)

//     if (
//       currentSectionIndx === courseSectionData.length - 1 &&
//       currentSubSectionIndx === noOfSubsections - 1
//     ) {
//       return true
//     } else {
//       return false
//     }
//   }

//   // go to the previous video
//   const goToPrevVideo = () => {
//     // console.log(courseSectionData)

//     const currentSectionIndx = courseSectionData.findIndex(
//       (data) => data._id === sectionId
//     )

//     const currentSubSectionIndx = courseSectionData[
//       currentSectionIndx
//     ].subSection.findIndex((data) => data._id === subSectionId)

//     if (currentSubSectionIndx !== 0) {
//       const prevSubSectionId =
//         courseSectionData[currentSectionIndx].subSection[
//           currentSubSectionIndx - 1
//         ]._id
//       navigate(
//         `/view-course/${courseId}/section/${sectionId}/sub-section/${prevSubSectionId}`
//       )
//     } else {
//       const prevSectionId = courseSectionData[currentSectionIndx - 1]._id
//       const prevSubSectionLength =
//         courseSectionData[currentSectionIndx - 1].subSection.length
//       const prevSubSectionId =
//         courseSectionData[currentSectionIndx - 1].subSection[
//           prevSubSectionLength - 1
//         ]._id
//       navigate(
//         `/view-course/${courseId}/section/${prevSectionId}/sub-section/${prevSubSectionId}`
//       )
//     }
//   }

//   const handleLectureCompletion = async () => {
//     setLoading(true)
//     const res = await markLectureAsComplete(
//       { courseId: courseId, subsectionId: subSectionId },
//       token
//     )
//     if (res) {
//       dispatch(updateCompletedLectures(subSectionId))
//     }
//     setLoading(false)
//   }

//   return (
//     <div className="flex flex-col gap-5 text-white">
//       {!videoData ? (
//         <img
//           src={previewSource}
//           alt="Preview"
//           className="h-full w-full rounded-md object-cover"
//         />
//       ) : (
//         <Player
//           ref={playerRef}
//           aspectRatio="16:9"
//           playsInline
//           onEnded={() => setVideoEnded(true)}
//           src={videoData?.videoUrl}
//         >
//           <BigPlayButton position="center" />
//           {/* Render When Video Ends */}
//           {videoEnded && (
//             <div
//               style={{
//                 backgroundImage:
//                   "linear-gradient(to top, rgb(0, 0, 0), rgba(0,0,0,0.7), rgba(0,0,0,0.5), rgba(0,0,0,0.1)",
//               }}
//               className="full absolute inset-0 z-[100] grid h-full place-content-center font-inter"
//             >
//               {!completedLectures.includes(subSectionId) && (
//                 <IconBtn
//                   disabled={loading}
//                   onclick={() => handleLectureCompletion()}
//                   text={!loading ? "Mark As Completed" : "Loading..."}
//                   customClasses="text-xl max-w-max px-4 mx-auto"
//                 />
//               )}
//               <IconBtn
//                 disabled={loading}
//                 onclick={() => {
//                   if (playerRef?.current) {
//                     // set the current time of the video to 0
//                     playerRef?.current?.seek(0)
//                     setVideoEnded(false)
//                   }
//                 }}
//                 text="Rewatch"
//                 customClasses="text-xl max-w-max px-4 mx-auto mt-2"
//               />
//               <div className="mt-10 flex min-w-[250px] justify-center gap-x-4 text-xl">
//                 {!isFirstVideo() && (
//                   <button
//                     disabled={loading}
//                     onClick={goToPrevVideo}
//                     className="blackButton"
//                   >
//                     Prev
//                   </button>
//                 )}
//                 {!isLastVideo() && (
//                   <button
//                     disabled={loading}
//                     onClick={goToNextVideo}
//                     className="blackButton"
//                   >
//                     Next
//                   </button>
//                 )}
//               </div>
//             </div>
//           )}
//         </Player>
//       )}

//       <h1 className="mt-4 text-3xl font-semibold">{videoData?.title}</h1>
//       <p className="pt-2 pb-6">{videoData?.description}</p>
//     </div>
//   )
// }

// export default VideoDetails
// // video
