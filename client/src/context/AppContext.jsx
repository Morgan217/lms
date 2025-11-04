import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();

  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userData, setUserData] = useState(null);

  const { getToken } = useAuth();
  const { user } = useUser();

  // Fetch all courses
  const fetchAllCourses = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/course/all`);
      if (data.success) setAllCourses(data.courses);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Fetch user data
  const fetchUserdata = async () => {
    if (!user) return;

    if (user.publicMetadata.role === "educator") {
      setIsEducator(true);
    }

    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/user/data`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) setUserData(data.user);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Fetch enrolled courses
  const fetchEnrolledCourses = async () => {
    if (!user) return;
    try {
      const token = await getToken();
      const { data } = await axios.get(
        `${backendUrl}/api/user/enrolled-courses`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setEnrolledCourses(data.enrolledCourses.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ----------------------------
  // SAFE CALCULATION FUNCTIONS
  // ----------------------------

  // Calculate course rating safely
  const calculateRating = (course) => {
    const ratings = course.courseRatings || [];
    if (!ratings.length) return 0;

    const total = ratings.reduce((sum, rating) => sum + (rating.rating || 0), 0);
    return Math.floor(total / ratings.length);
  };

  // Calculate total duration of a chapter safely
  const calculateChapterTime = (chapter) => {
    const lectures = chapter.chapterContent || [];
    const time = lectures.reduce((sum, lecture) => sum + (lecture.lectureDuration || 0), 0);
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  // Calculate total course duration safely
  const calculateCourseDuration = (course) => {
    const chapters = course.courseContent || [];
    const totalDuration = chapters.reduce((time, chapter) => {
      const lectures = chapter.chapterContent || [];
      const chapterTime = lectures.reduce(
        (sum, lecture) => sum + (lecture.lectureDuration || 0),
        0
      );
      return time + chapterTime;
    }, 0);

    return humanizeDuration(totalDuration * 60 * 1000, { units: ["h", "m"] });
  };

  // Calculate total number of lectures safely
  const calculateNoOfLectures = (course) => {
    const chapters = course.courseContent || [];
    return chapters.reduce(
      (total, chapter) =>
        total + ((Array.isArray(chapter.chapterContent) ? chapter.chapterContent.length : 0)),
      0
    );
  };

  // Fetch full course details by ID
const fetchCourseById = async (courseId) => {
  try {
    const token = await getToken();
    const { data } = await axios.get(`${backendUrl}/api/course/course-get/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (data.success) return data.course;
    else {
      toast.error(data.message);
      return null;
    }
  } catch (error) {
    toast.error(error.message);
    return null;
  }
};

// Update course details
const updateCourseById = async (courseId, courseData, image) => {
  try {
    const token = await getToken();
    const formData = new FormData();
    formData.append("courseData", JSON.stringify(courseData));
    if (image) formData.append("image", image);

    const { data } = await axios.put(`${backendUrl}/api/course/course-update/${courseId}`, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (data.success) {
      toast.success("Course updated successfully");
      return data.course;
    } else {
      toast.error(data.message);
      return null;
    }
  } catch (error) {
    toast.error(error.message);
    return null;
  }
};


  // Log token (debug)
 

  // ----------------------------
  // EFFECTS
  // ----------------------------
  useEffect(() => {
    fetchAllCourses();
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
   
      await fetchUserdata();
      await fetchEnrolledCourses();
    })();
  }, [user]);

  // ----------------------------
  // CONTEXT VALUE
  // ----------------------------
  const value = {
    currency,
    allCourses,
    navigate,
    calculateRating,
    isEducator,
    setIsEducator,
    calculateCourseDuration,
    calculateNoOfLectures,
    calculateChapterTime,
    enrolledCourses,
    fetchEnrolledCourses,
    backendUrl,
    userData,
    setUserData,
    getToken,
    fetchAllCourses,fetchCourseById,updateCourseById
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
