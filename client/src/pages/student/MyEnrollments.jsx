import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { Line } from 'rc-progress'
import Footer from '../../components/student/Footer'
import axios from 'axios'
import { toast } from "react-toastify"


function MyEnrollments() {

  const {
    enrolledCourses,
    calculateCourseDuration,
    navigate,
    userData,
    fetchEnrolledCourses,
    backendUrl,
    getToken,
    calculateNoOfLectures
  } = useContext(AppContext)

  const [progressArray, setProgressArray] = useState([])

  const getCourseProgress = async () => {
    try {
      const token = await getToken()
      const tempProgressArray = await Promise.all(enrolledCourses.map(async (course) => {
        const { data } = await axios.post(
          `${backendUrl}/api/user/get-course-progress`,
          { courseId: course._id },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        let totalLectures = calculateNoOfLectures(course)
        const lectureCompleted = data.progressData ? data.progressData.lectureCompleted.length : 0
        return { totalLectures, lectureCompleted }
      }))
      setProgressArray(tempProgressArray)
    } catch (error) {
      toast.error(error.message)
    }
  }

  // 🔹 Handle Certificate Generation
  const handleGenerateCertificate = async (course) => {
    try {
      const token = await getToken()
      const { data } = await axios.post(
        `${backendUrl}/api/user/generate-certificate`,
        {
          studentName: userData.name,
          courseName: course.courseTitle,
          courseId: course._id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success && data.certificateUrl) {
        toast.success("Certificate generated successfully!")
        // Optionally open certificate in new tab
        window.open(data.certificateUrl, "_blank")
      } else {
        toast.info(data.message )
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to generate certificate.")
    }
  }

  useEffect(() => {
    if (userData) fetchEnrolledCourses()
  }, [userData])

  useEffect(() => {
    if (enrolledCourses.length > 0) getCourseProgress()
  }, [enrolledCourses])

  return (
    <div>
      <div className='md:px-36 px-8 pt-10'>
        <h1 className='text-2xl font-semibold'>My Enrollments</h1>
        <table className='md:table-auto table-fixed w-full overflow-hidden border mt-10'>
          <thead className='text-gray-700 border-b border-gray-500/20 text-sm text-left max-sm:hidden'>
            <tr>
              <th className='px-4 py-3 font-semibold truncate'>Course</th>
              <th className='px-4 py-3 font-semibold truncate'>Duration</th>
              <th className='px-4 py-3 font-semibold truncate'>Completed</th>
              <th className='px-4 py-3 font-semibold truncate'>Actions</th>
            </tr>
          </thead>

          <tbody className='text-gray-700'>
            {enrolledCourses.map((course, index) => {
              const progress = progressArray[index]
              const isCompleted =
                progress && progress.lectureCompleted === progress.totalLectures

              return (
                <tr key={index} className='border-b border-gray-500/20'>
                  <td className='md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3'>
                    <img
                      src={course.courseThumbnail}
                      alt=""
                      className='w-14 sm:w-24 md:w-28'
                    />
                    <div className='flex-1'>
                      <p className='mb-1 max-sm:text-sm'>{course.courseTitle}</p>
                      <Line
                        strokeWidth={2}
                        percent={
                          progress
                            ? (progress.lectureCompleted * 100) / progress.totalLectures
                            : 0
                        }
                        className='bg-gray-300 rounded-full'
                      />
                    </div>
                  </td>

                  <td className='px-4 py-3 max-sm:hidden'>
                    {calculateCourseDuration(course)}
                  </td>

                  <td className='px-4 py-3'>
                    {progress &&
                      `${progress.lectureCompleted}/${progress.totalLectures}`}{" "}
                    <span>Lectures</span>
                  </td>

                  <td className='px-4 py-3 flex flex-wrap gap-2 justify-end'>
                    <button
                      onClick={() => navigate('/player/' + course._id)}
                      className='px-3 sm:px-5 py-1.5 sm:py-2 bg-blue-600 text-white rounded-md max-sm:text-xs'
                    >
                      {isCompleted ? 'Completed' : 'On Going'}
                    </button>

                    {/* ✅ Show Certificate Button only when completed */}
                    {isCompleted && (
                      <button
                        onClick={() => handleGenerateCertificate(course)}
                        className='px-3 sm:px-5 py-1.5 sm:py-2 bg-green-600 text-white rounded-md max-sm:text-xs'
                      >
                        Certificate
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <Footer />
    </div>
  )
}

export default MyEnrollments
