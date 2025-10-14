import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import SearchBar from '../../components/student/SearchBar'
import CourseCard from '../../components/student/CourseCard'
import { useParams } from 'react-router-dom'
import { assets } from '../../assets/assets'
import Footer from '../../components/student/Footer'

function CoursesList() {
  const { navigate, allCourses } = useContext(AppContext)
  const { input } = useParams()
  const [filteredCourse, setFilteredCourse] = useState([])

  useEffect(() => {
    if (allCourses && allCourses.length > 0) {
      const tempCourses = [...allCourses]

      if (input) {
        setFilteredCourse(
          tempCourses.filter(item =>
            item.courseTitle.toLowerCase().includes(input.toLowerCase())
          )
        )
      } else {
        setFilteredCourse(tempCourses)
      }
    }
  }, [allCourses, input])

  return (
    <div>
    <div className="relative md:px-36 px-8 pt-20 text-left">
      {/* Header */}
      <div className="flex md:flex-row flex-col gap-6 items-start justify-between w-full">
        <div>
          <h1 className="text-4xl font-semibold text-gray-800">Course List</h1>
          <p className="text-gray-500">
            <span
              className="text-blue-600 cursor-pointer"
              onClick={() => navigate('/')}
            >
              Home
            </span>
            / <span>Course List</span>
          </p>
        </div>
        <SearchBar data={input} />
      </div>

      {/* Active search chip */}
      {input && (
        <div className="inline-flex items-center gap-4 px-4 py-2 border mt-8 mb-8 text-gray-600">
          <p>{input}</p>
          <img
            src={assets.cross_icon}
            alt="clear search"
            className="cursor-pointer"
            onClick={() => navigate('/course-list')}
          />
        </div>
      )}

      {/* Course grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 my-16 gap-3 px-2 md:p-0">
        {filteredCourse.length > 0 ? (
          filteredCourse.map((course, index) => (
            <CourseCard key={index} course={course} />
          ))
        ) : (
          <p className="col-span-full text-gray-500">No courses found.</p>
        )}
      </div>
      </div>
      <Footer/>
    </div>
  )
}

export default CoursesList
