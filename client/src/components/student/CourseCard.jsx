import React, { useContext } from 'react'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { Link } from 'react-router-dom'

const CourseCard = ({ course }) => {
  const { currency, calculateRating } = useContext(AppContext)

  // Guard: if course data is missing, don't render anything
  if (!course) return null

  // Extract safely using optional chaining and defaults
  const courseTitle = course.courseTitle || 'Untitled Course'
  const courseThumbnail = course.courseThumbnail || assets.defaultThumbnail || ''
  const educatorName = course.educator?.name || 'Unknown Instructor'
  const ratingCount = course.courseRatings?.length || 0
  const price = course.coursePrice || 0
  const discount = course.discount || 0
  const finalPrice = (price - (discount * price) / 100).toFixed(2)

  return (
    <Link
      to={`/course/${course._id}`}
      onClick={() => scrollTo(0, 0)}
      className="border border-gray-500/30 pb-6 overflow-hidden rounded-lg hover:shadow-md transition-shadow"
    >
      {/* Course Thumbnail */}
      <img
        src={courseThumbnail}
        alt={courseTitle}
        className="w-full object-cover"
      />

      {/* Course Info */}
      <div className="p-3 text-left">
        <h3 className="text-base font-semibold">{courseTitle}</h3>
        <p className="text-gray-500">{educatorName}</p>

        {/* Rating Section */}
        <div className="flex items-center space-x-2 mt-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <img
                key={i}
                src={
                  i < Math.floor(calculateRating(course))
                    ? assets.star
                    : assets.star_blank
                }
                alt="star"
                className="w-3.5 h-3.5"
              />
            ))}
          </div>
          <p className="text-gray-500 text-sm">({ratingCount})</p>
        </div>

        {/* Price */}
        <p className="text-base font-semibold text-gray-800 mt-2">
          {currency}
          {finalPrice}
        </p>
      </div>
    </Link>
  )
}

export default CourseCard
