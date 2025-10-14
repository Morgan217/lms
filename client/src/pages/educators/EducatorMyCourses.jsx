import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import Loading from '../../components/student/Loading'

function EducatorMyCourses() {
  const { currency, allCourses } = useContext(AppContext)
  const [courses, setCourses] = useState(null)

  // ✅ Fetch courses once on mount
  const fetchEducatorCourses = async () => {
    setCourses(allCourses)
  }

  useEffect(() => {
    fetchEducatorCourses()
  }, [])

  return courses ? (
    <div className='h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>
      {/* ✅ "utems-start" corrected to "items-start" */}
      <div className='w-full'>
        <h2 className='pb-4 text-lg font-medium'>My Courses</h2>

        <div className='overflow-x-auto rounded-md border border-gray-200'>
          {/* ✅ Added overflow-x-auto to make table scrollable on smaller screens */}
          <table className='w-full table-auto'>
            <thead className='text-gray-900 border-b border-gray-500/20 text-sm text-left'>
              <tr>
                <th className='px-4 py-3 font-semibold truncate'>All Courses</th>
                <th className='px-4 py-3 font-semibold truncate'>Earnings</th>
                <th className='px-4 py-3 font-semibold truncate'>Students</th>
                <th className='px-4 py-3 font-semibold truncate'>Published On</th>
              </tr>
            </thead>

            <tbody className='text-sm text-gray-500'>
              {courses.map((course) => (
                <tr key={course._id} className='border-b border-gray-500/20 hover:bg-gray-50'>
                  <td className='md:px-4 px-2 py-3 flex items-center space-x-3 truncate'>
                    <img
                      src={course.courseThumbnail}
                      alt='Course Thumbnail'
                      className='w-16 h-10 object-cover rounded'
                    />
                    {/* ✅ fixed invalid Tailwind syntax: "hidden md: block" -> "hidden md:block" */}
                    <span className='truncate hidden md:block'>{course.courseTitle}</span>
                  </td>

                  {/* ✅ Fixed misspelled keys: "coursPrice" -> "coursePrice", "createAt" -> "createdAt" */}
                  <td className='px-4 py-3'>
                    {currency}
                    {Math.floor(
                      course.enrolledStudents.length *
                        (course.coursePrice - (course.discount * course.coursePrice) / 100)
                    )}
                  </td>

                  <td className='px-4 py-3'>{course.enrolledStudents.length}</td>

                  <td className='px-4 py-3'>
                    {new Date(course.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ) : (
    <Loading />
  )
}

export default EducatorMyCourses
