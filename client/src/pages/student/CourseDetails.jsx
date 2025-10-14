import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/student/Loading";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";
import Footer from "../../components/student/Footer";
import YouTube from "react-youtube";

function CourseDetails() {
  const { id } = useParams();

  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(true);
  const [playerData, setPlayerData] = useState(null);


  const {
    allCourses,
    calculateRating,
    CalulateChapterTime,
    currency,calculateCourseDuration,calculateNoOfLectures,
  } = useContext(AppContext);

  const fetchCourseData = async () => {
    const findCourse = allCourses.find((course) => course._id === id);
    setCourseData(findCourse);
  };

  useEffect(() => {
    fetchCourseData();
  }, [allCourses]);

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (!courseData) return <Loading />;

  return (
    <div>
    <div className="relative flex flex-col md:flex-row gap-60 md:px-8 md:pt-24 pt-10 text-left">
      {/* Background gradient */}
      <div className="absolute top-0 left-0 w-full h-[500px] z-[-1] bg-gradient-to-b from-cyan-300/70"></div>

      {/* LEFT COLUMN */}
      <div className="flex-1 max-w-2xl z-10">
        <h1 className="md:text-course-deatails-heading-large text-course-deatails-heading-small font-semibold text-gray-800">
          {courseData.courseTitle}
        </h1>
        <p
          className="pt-4 md:text-base text-sm text-gray-600"
          dangerouslySetInnerHTML={{
            __html: courseData.courseDescription.slice(0, 200),
          }}
        ></p>

        {/* Review and ratings */}
        <div className="flex items-center space-x-2 pt-3 pb-1 text-sm">
          <p>{calculateRating(courseData)}</p>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <img
                key={i}
                src={
                  i < Math.floor(calculateRating(courseData))
                    ? assets.star
                    : assets.star_blank
                }
                alt="star"
                className="w-3.5 h-3.5"
              />
            ))}
          </div>
          <p className="text-gray-500">
            ({courseData.courseRatings.length}{" "}
            {courseData.courseRatings.length > 1 ? "ratings" : "rating"})
          </p>
          <p>
            {courseData.enrolledStudents.length}{" "}
            {courseData.enrolledStudents.length > 1 ? "Students" : "Student"}
          </p>
        </div>

        <p>
          Course by <span className="text-sm">GreatStacks</span>
        </p>

        {/* Course Structure */}
        <div className="pt-8 text-gray-800">
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
                        openSections[index] ? "rotate-180" : ""
                      }`}
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

                {/* Lectures */}
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
                            {lecture.isPreviewFree && (
                              <p onClick={()=> setPlayerData({
                                videoId:lecture.lectureUrl.split('/').pop()
                              })} className="text-blue-500 cursor-pointer">
                                Preview
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
        </div>

        {/* Full Description */}
        
        <div className="py-20 text-sm md:text-default">
          <h3 className="text-xl font-semibold text-gray-800">
            Course Description
          </h3>
          <p
            className="pt-3 rich-text"
            dangerouslySetInnerHTML={{
              __html: courseData.courseDescription,
            }}
          ></p>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className='max-w-course-card z-10 shadow-custom-card rounded-t md:rounded-none overflow-hidden bg=white min-w-[300px] sm:min-w-[420px]'> 

      
      <div className="w-full md:w-80 flex-shrink-0 z-10">
        {
          playerData ? <YouTube videoId={playerData.videoId} opts={{playerVars : {autoplay : 1}}} iframeClassName="w-full aspect-video"/> :<img
          src={courseData.courseThumbnail}
          alt=""
          className="w-full rounded-lg shadow"
        />

        }
        
        <div className="pt-5 flex items-center gap-2">
          
          <img
            className="w-4 h-4"
            src={assets.time_left_clock_icon}
            alt="clock icon"
          />
          
          
          <p>
            <span className="text-red-500">5 days</span> left at this price!
          </p>
        </div>
        <div className="flex gap-3 items-center pt-2">
          <p className="text-gray-800 md:text-4xl text-2x font-semibold">{currency} {(courseData.coursePrice-courseData.discount * courseData.coursePrice / 100).toFixed(2)}</p>
          <p className="md:text-lg text-gray-500 line-through"> {currency}{courseData.coursePrice}</p>
          <p className="md:text-lg text-gray-500">{courseData.discount}% off</p>
        </div>
        <div className="flex-items-center text-sm md:text-default gap-4 pt-2 md:pt-4 text-gray-500">
          <div className="flex items-center gap-1">
            <img src={assets.star} alt="star icon"/>
            <p>{calculateRating(courseData)}</p>
            <div className="h-4 w-px bg-gray-500/40"></div>

          <div className="flex items-center gap-1">
            <img src={assets.time_clock_icon} alt="clock icon"/>
            <p>{calculateCourseDuration(courseData)}</p>
            
          </div>

          <p>{calculateRating(courseData)}</p>
            <div className="h-4 w-px bg-gray-500/40"></div>

          <div className="flex items-center gap-1">
            <img src={assets.lesson_icon} alt="lesson icon"/>
            <p>{calculateNoOfLectures(courseData)} Lectures</p>
            
          </div>
           
          </div>

          <button className="md:mt-6 mt-4 w-full py-3 rounded bg-blue-600 text-white font-medium">{isAlreadyEnrolled ? 'Already Enrolled' : 'Enrole Now'}</button>
           <div className="pt-6">
            <p className="md:text-xl text-lg font-medium text-gray-800">Whats in the course?</p>
            <ul className="ml-4 pt-2 text-sm md:text-default list-disc text-gray-500">
              <li>Life time access with free updates.</li>
              <li>Step-by-step, hands-on project guidance.</li>
              <li>Downloadable resources and source code.</li>
              <li>Quizzess to test your knowledge.</li>
              <li>Certificates of Completion.</li>
             

            </ul>
           </div>
          
        </div>
  
      </div>
        </div>
  
    </div>
<div>        <Footer /></div>
    </div>
    
  );
}

export default CourseDetails;
