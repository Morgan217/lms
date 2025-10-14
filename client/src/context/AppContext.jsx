import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate =useNavigate();
  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  // fetch all courses
  const fetchAllCourses = async () => {
    setAllCourses(dummyCourses);
  };

  //function to calculate average rating of course
  const calculateRating =(course)=>{
    if(course.courseRatings.length===0)
    {
        return 0;
    }
    let totalRating = 0
    course.courseRatings.forEach(rating => {
        totalRating+=rating.rating
    })
    return totalRating/course.courseRatings.length
  }
  //Function to calculate course chapter time
  const CalulateChapterTime =(chapter)=> {
    let time=0
    chapter.chapterContent.map((lecture)=> time += lecture.lectureDuration)
    return humanizeDuration(time * 60 *1000, {units: ["h","m"]})
  }

  //functio to calculate the course duration
  const calculateCourseDuration =(course)=>{
    let time=0

   const totalDuration = course.courseContent.reduce((time, chapter) => {
  return (
    time +
    chapter.chapterContent.reduce(
      (chapterTime, lecture) => chapterTime + lecture.lectureDuration,
      0
    )
  );
}, 0);

return humanizeDuration(totalDuration * 60 * 1000, { units: ["h", "m"] });

  }

  const calculateNoOfLectures= (course)=> {
    let totallectures=0;
    course.courseContent.forEach(chapter =>{
        if(Array.isArray(chapter.chapterContent))
        {
            totallectures+=chapter.chapterContent.length;
        }
    });
    return totallectures;

}

//Fetch user Enrolled Courses
const fetchEnrolledCourses = async ()=> {
  setEnrolledCourses(dummyCourses)
}

  useEffect(() => {
    fetchAllCourses();
    fetchEnrolledCourses();
  }, []);

  const value = {
    currency,
    allCourses,
    navigate,
    calculateRating,
    isEducator, setIsEducator,
    calculateCourseDuration,calculateNoOfLectures,CalulateChapterTime,
    enrolledCourses, fetchEnrolledCourses,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
