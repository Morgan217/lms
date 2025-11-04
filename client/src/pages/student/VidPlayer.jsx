import React, { useContext, useEffect, useState } from 'react'
import Footer from '../../components/student/Footer'
import { AppContext } from '../../context/AppContext'
import { useParams } from 'react-router-dom'
import Loading from '../../components/student/Loading'
import { assets } from '../../assets/assets'
import humanizeDuration from "humanize-duration"
import YouTube from 'react-youtube'
import { Rating } from 'react-simple-star-rating'
import { toast } from "react-toastify"
import axios from "axios"

function VidPlayer() {

  const {
    enrolledCourses,
    calculateChapterTime,
    backendUrl,
    getToken,
    userData,
    fetchEnrolledCourses,
  } = useContext(AppContext)

  const { courseId } = useParams()

  const [courseData, setCourseData] = useState(null)
  const [openSections, setOpenSections] = useState({})
  const [playerData, setPlayerData] = useState(null)
  const [progressData, setProgressData] = useState(null)
  const [initialRating, setInitialRating] = useState(0)
  const [allCompleted, setAllCompleted] = useState(false)

  // ✅ Fetch the correct course based on the courseId
  const getCourseData = () => {
    enrolledCourses.forEach((course) => {
      if (course._id === courseId) {
        setCourseData(course)
        course.courseRatings.forEach((item) => {
          if (item.userId === userData._id) {
            setInitialRating(item.rating)
            getCourseProgress()
          }
        })
      }
    })
  }

  // ✅ Extract proper YouTube video ID from any link format
  const extractYouTubeId = (url) => {
    if (!url) return ""
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(u\/\w\/)|(embed\/)|(watch\?v=))([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[7].length === 11 ? match[7] : ""
  }

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const markLectureAsCompleted = async (lectureId) => {
    try {
      const token = await getToken()
      const { data } = await axios.post(
        backendUrl + '/api/user/update-course-progress',
        { courseId, lectureId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.success) {
        toast.success(data.message)
        getCourseProgress()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const getCourseProgress = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.post(
        backendUrl + '/api/user/get-course-progress',
        { courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        setProgressData(data.progressData)

        // 🔹 Check if all lectures are completed
        const totalLectures = courseData
          ? courseData.courseContent.reduce(
              (acc, chapter) => acc + chapter.chapterContent.length,
              0
            )
          : 0

        const completedLectures = data.progressData
          ? data.progressData.lectureCompleted.length
          : 0

        setAllCompleted(totalLectures > 0 && completedLectures === totalLectures)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleRate = async (rating) => {
    try {
      const token = await getToken()
      const { data } = await axios.post(
        backendUrl + '/api/user/add-rating',
        { courseId, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        toast.success(data.message)
        fetchEnrolledCourses()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // 🔹 Generate Certificate
  const handleGenerateCertificate = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.post(
        `${backendUrl}/api/user/generate-certificate`,
        {
          studentName: userData.name,
          courseName: courseData.courseTitle,
          courseId: courseData._id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success && data.certificateUrl) {
        toast.success("Certificate generated successfully!")
        window.open(data.certificateUrl, "_blank")
      } else {
        toast.info(data.message || "Certificate generated.")
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to generate certificate.")
    }
  }

  useEffect(() => {
    if (enrolledCourses.length > 0) getCourseData()
  }, [enrolledCourses])

  useEffect(() => {
    getCourseProgress()
  }, [])

  if (!courseData) return <Loading />

  return (
    <div className="p-6">
      {/* ---------- MAIN LAYOUT ---------- */}
      <div className="flex flex-col md:flex-row gap-10 md:gap-20 md:px-20">
        {/* ---------- LEFT COLUMN ---------- */}
        <div className="md:w-1/2 text-gray-800">
          <h2 className="text-xl font-semibold">Course Structure</h2>

          <div className="pt-5">
            {courseData.courseContent.map((chapter, index) => (
              <div
                key={index}
                className="border border-gray-300 bg-white mb-2 rounded"
              >
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                  onClick={() => toggleSection(index)}
                >
                  <div className="flex items-center gap-2">
                    <img
                      className={`transform transition-transform ${
                        openSections[index] ? 'rotate-180' : ''
                      }`}
                      src={assets.down_arrow_icon}
                      alt="arrow icon"
                    />
                    <p className="font-medium md:text-base text-sm">
                      {chapter.chapterTitle}
                    </p>
                  </div>
                  <p className="text-sm md:text-default">
                    {chapter.chapterContent.length} lectures -{' '}
                    {calculateChapterTime(chapter)}
                  </p>
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openSections[index] ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
                    {chapter.chapterContent.map((lecture, i) => (
                      <li key={i} className="flex items-start gap-2 py-1">
                        <img
                          src={
                            progressData &&
                            progressData.lectureCompleted.includes(lecture.lectureId)
                              ? assets.blue_tick_icon
                              : assets.play_icon
                          }
                          alt="play icon"
                          className="w-4 h-4 mt-1"
                        />
                        <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                          <p>{lecture.lectureTitle}</p>
                          <div className="flex gap-2">
                            {lecture.lectureUrl && (
                              <p
                                onClick={() =>
                                  setPlayerData({
                                    ...lecture,
                                    chapter: index + 1,
                                    lecture: i + 1,
                                  })
                                }
                                className="text-blue-500 cursor-pointer"
                              >
                                Watch
                              </p>
                            )}
                            <p>
                              {humanizeDuration(
                                lecture.lectureDuration * 60 * 1000,
                                { units: ['h', 'm'] }
                              )}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-row items-center gap-4 mt-10">
            <h1 className="text-xl font-bold whitespace-nowrap">Rate this course:</h1>
            <div className="flex items-center space-x-1 rating-wrapper">
              <Rating
                initialRating={initialRating}
                onClick={handleRate}
                size={25}
                allowHover
                fillColor="gold"
                className="inline-flex"
              />
            </div>
          </div>
        </div>

        {/* ---------- RIGHT COLUMN ---------- */}
        <div className="md:w-1/2 flex flex-col items-center justify-start">
          {playerData ? (
            <div className="w-full">
              <YouTube
                videoId={extractYouTubeId(playerData.lectureUrl)}
                iframeClassName="w-full aspect-video rounded-lg"
              />
              <div className="flex justify-between items-center mt-1">
                <p>
                  {playerData.chapter}.{playerData.lecture} — {playerData.lectureTitle}
                </p>
                <button
                  onClick={() => markLectureAsCompleted(playerData.lectureId)}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {progressData &&
                  progressData.lectureCompleted.includes(playerData.lectureId)
                    ? 'Complete'
                    : 'Mark Complete'}
                </button>
              </div>

              {/* ✅ Show Certificate Button once all lessons done */}
              {allCompleted && (
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleGenerateCertificate}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Download Certificate
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              <img
                src={courseData.courseThumbnail}
                alt="Course thumbnail"
                className="rounded-lg shadow-md w-full md:w-3/4"
              />
              <p className="text-gray-500 pt-4">Select a lecture to play</p>
              {/* ✅ Certificate below thumbnail if all done */}
              {allCompleted && (
                <button
                  onClick={handleGenerateCertificate}
                  className="mt-6 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Download Certificate
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ---------- FOOTER ---------- */}
      <Footer />
    </div>
  )
}

export default VidPlayer
