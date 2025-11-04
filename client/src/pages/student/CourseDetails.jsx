import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/student/Loading";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";
import Footer from "../../components/student/Footer";
import YouTube from "react-youtube";
import axios from "axios";
import { toast } from "react-toastify";

function CourseDetails() {
  const { id } = useParams();

  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [playerData, setPlayerData] = useState(null);

  const {
    calculateRating,
    calculateChapterTime,
    currency,
    calculateCourseDuration,
    calculateNoOfLectures,
    backendUrl,
    userData,
    getToken,
  } = useContext(AppContext);

  // ✅ Fetch course data
  const fetchCourseData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/course/${id}`);
      if (data.success) {
        setCourseData(data.courseData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Handle enrollment
  const enrolledCourse = async () => {
    try {
      if (!userData) return toast.warn("Login to Enroll");
      if (isAlreadyEnrolled) return toast.warn("Already enrolled");

      const token = await getToken();

      const { data } = await axios.post(
        `${backendUrl}/api/user/purchase`,
        { courseId: courseData._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        const { success_url } = data;
        window.location.replace(success_url);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, []);

  // ✅ Enrollment state
  useEffect(() => {
    if (userData && courseData) {
      setIsAlreadyEnrolled(
        userData.enrolledCourse?.includes(courseData._id) || false
      );
    }
  }, [userData, courseData]);

  // ✅ Toggle sections
  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // ✅ YouTube ID extractor (fix)
  const extractYouTubeId = (url) => {
    if (!url) return "";
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : "";
  };

  if (!courseData) return <Loading />;

  // Safe values with fallbacks
  const courseTitle = courseData.courseTitle || "Untitled Course";
  const courseDescription = courseData.courseDescription || "";
  const courseThumbnail = courseData.courseThumbnail || assets.defaultThumbnail;
  const courseRatingsLength = courseData.courseRatings?.length || 0;
  const enrolledStudentsLength = courseData.enrolledStudents?.length || 0;
  const educatorName = courseData.educator?.name || "Unknown Instructor";

  return (
    <div>
      <div className="relative flex flex-col md:flex-row gap-60 md:px-8 md:pt-24 pt-10 text-left">
        {/* Background gradient */}
        <div className="absolute top-0 left-0 w-full h-[500px] z-[-1] bg-gradient-to-b from-cyan-300/70"></div>

        {/* LEFT COLUMN */}
        <div className="flex-1 max-w-2xl z-10">
          <h1 className="md:text-course-details-heading-large text-course-details-heading-small font-semibold text-gray-800">
            {courseTitle}
          </h1>
          <p
            className="pt-4 md:text-base text-sm text-gray-600"
            dangerouslySetInnerHTML={{
              __html: courseDescription.slice(0, 200),
            }}
          ></p>

          {/* Ratings */}
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
              ({courseRatingsLength}{" "}
              {courseRatingsLength > 1 ? "ratings" : "rating"})
            </p>
            <p>
              {enrolledStudentsLength}{" "}
              {enrolledStudentsLength > 1 ? "Students" : "Student"}
            </p>
          </div>

          <p>
            Course by <span className="text-sm">{educatorName}</span>
          </p>

          {/* Course Structure */}
          <div className="pt-8 text-gray-800">
            <h2 className="text-xl font-semibold">Course Structure</h2>

            <div className="pt-5">
              {courseData.courseContent?.map((chapter, index) => (
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
                        {chapter.chapterTitle || "Untitled Chapter"}
                      </p>
                    </div>
                    <p className="text-sm md:text-default">
                      {chapter.chapterContent?.length || 0} lectures -{" "}
                      {calculateChapterTime(chapter)}
                    </p>
                  </div>

                  {/* ✅ Lecture list now expands correctly */}
                  {openSections[index] && (
                    <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
                      {chapter.chapterContent?.map((lecture, i) => (
                        <li key={i} className="flex items-start gap-2 py-1">
                          <img
                            src={assets.play_icon}
                            alt="play icon"
                            className="w-4 h-4 mt-1"
                          />
                          <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                            <p>{lecture.lectureTitle || "Untitled Lecture"}</p>
                            <div className="flex gap-2">
                              {lecture.isPreviewFree && (
                                <p
                                  onClick={() =>
                                    setPlayerData({
                                      videoId: extractYouTubeId(
                                        lecture.lectureUrl
                                      ),
                                    })
                                  }
                                  className="text-blue-500 cursor-pointer"
                                >
                                  Preview
                                </p>
                              )}
                              <p>
                                {humanizeDuration(
                                  (lecture.lectureDuration || 0) * 60 * 1000,
                                  { units: ["h", "m"] }
                                )}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
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
                __html: courseDescription,
              }}
            ></p>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="max-w-course-card z-10 shadow-custom-card rounded-t md:rounded-none overflow-hidden bg-white min-w-[300px] sm:min-w-[420px]">
          <div className="w-full md:w-80 flex-shrink-0 z-10">
            {playerData ? (
              <YouTube
                videoId={playerData.videoId}
                opts={{ playerVars: { autoplay: 1 } }}
                iframeClassName="w-full aspect-video"
              />
            ) : (
              <img
                src={courseThumbnail}
                alt=""
                className="w-full rounded-lg shadow"
              />
            )}

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
              <p className="text-gray-800 md:text-4xl text-2xl font-semibold">
                {currency}{" "}
                {(
                  (courseData.coursePrice || 0) -
                  ((courseData.discount || 0) * (courseData.coursePrice || 0)) /
                    100
                ).toFixed(2)}
              </p>
              <p className="md:text-lg text-gray-500 line-through">
                {currency}
                {courseData.coursePrice || 0}
              </p>
              <p className="md:text-lg text-gray-500">
                {courseData.discount || 0}% off
              </p>
            </div>

            <div className="flex-items-center text-sm md:text-default gap-4 pt-2 md:pt-4 text-gray-500">
              <div className="flex items-center gap-1">
                <img src={assets.star} alt="star icon" />
                <p>{calculateRating(courseData)}</p>
                <div className="h-4 w-px bg-gray-500/40"></div>

                <div className="flex items-center gap-1">
                  <img src={assets.time_clock_icon} alt="clock icon" />
                  <p>{calculateCourseDuration(courseData)}</p>
                </div>

                <div className="h-4 w-px bg-gray-500/40"></div>

                <div className="flex items-center gap-1">
                  <img src={assets.lesson_icon} alt="lesson icon" />
                  <p>{calculateNoOfLectures(courseData)} Lectures</p>
                </div>
              </div>

              <button
                onClick={enrolledCourse}
                className="md:mt-6 mt-4 w-full py-3 rounded bg-blue-600 text-white font-medium"
              >
                {isAlreadyEnrolled ? "Already Enrolled" : "Enroll Now"}
              </button>

              <div className="pt-6">
                <p className="md:text-xl text-lg font-medium text-gray-800">
                  What's in the course?
                </p>
                <ul className="ml-4 pt-2 text-sm md:text-default list-disc text-gray-500">
                  <li>Lifetime access with free updates.</li>
                  <li>Step-by-step, hands-on project guidance.</li>
                  <li>Downloadable resources and source code.</li>
                  <li>Quizzes to test your knowledge.</li>
                  <li>Certificates of Completion.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default CourseDetails;
