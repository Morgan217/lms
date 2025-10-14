import React, { useContext, useEffect, useState } from 'react'
import Footer from '../../components/student/Footer'
import { AppContext } from '../../context/AppContext'
import { useParams } from 'react-router-dom'
import Loading from '../../components/student/Loading'
import { assets } from '../../assets/assets'
import humanizeDuration from "humanize-duration"
import YouTube from 'react-youtube'
import { Rating } from 'react-simple-star-rating'

function VidPlayer() {

  const { enrolledCourses, CalulateChapterTime } = useContext(AppContext)
  const { courseId } = useParams()

  const [courseData, setCourseData] = useState(null)
  const [openSections, setOpenSections] = useState({})
  const [playerData, setPlayerData] = useState(null)

  // ✅ Fetch the correct course based on the courseId
  const getCourseData = () => {
    if (!enrolledCourses) return
    const found = enrolledCourses.find(course => course._id === courseId)
    if (found) setCourseData(found)
  }

  const toggleSection = (index) => {
    setOpenSections(prev => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  useEffect(() => {
    getCourseData()
  }, [enrolledCourses, courseId])

  // ✅ Safety guard — show loading if data not ready
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
                {/* Chapter Header */}
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                  onClick={() => toggleSection(index)}
                >
                  <div className="flex items-center gap-2">
                    <img
                      className={`transform transition-transform ${openSections[index] ? "rotate-180" : ""}`}
                      src={assets.down_arrow_icon}
                      alt="arrow icon"
                    />
                    <p className="font-medium md:text-base text-sm">
                      {chapter.chapterTitle}
                    </p>
                  </div>
                  <p className="text-sm md:text-default">
                    {chapter.chapterContent.length} lectures -{" "}
                    {CalulateChapterTime(chapter)}
                  </p>
                </div>

                {/* Lecture List */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openSections[index] ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
                    {chapter.chapterContent.map((lecture, i) => (
                      <li key={i} className="flex items-start gap-2 py-1">
                        <img
                          src={assets.play_icon}
                          alt="play icon"
                          className="w-4 h-4 mt-1"
                        />
                        <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                          <p>{lecture.lectureTitle}</p>
                          <div className="flex gap-2">
                            {lecture.lectureUrl && (
                              <p
                                onClick={() => setPlayerData({
                                  ...lecture,
                                  chapter: index + 1,
                                  lecture: i + 1,
                                })}
                                className="text-blue-500 cursor-pointer"
                              >
                                Watch
                              </p>
                            )}
                            <p>
                              {humanizeDuration(
                                lecture.lectureDuration * 60 * 1000,
                                { units: ["h", "m"] }
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
      initialValue={0}
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
                videoId={playerData.lectureUrl.split('/').pop()} // ✅ Fixed .pop()
                iframeClassName="w-full aspect-video rounded-lg"
              />
              <div className="flex justify-between items-center mt-1">
                <p >
                  {playerData.chapter}.{playerData.lecture} — {playerData.lectureTitle}
                </p>
                <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {true ? 'Complete' : 'Mark Complete'}
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              <img
                src={courseData.courseThumbnail}
                alt="Course thumbnail"
                className="rounded-lg shadow-md w-full md:w-3/4"
              />
              <p className="text-gray-500 pt-4">Select a lecture to play</p>
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
