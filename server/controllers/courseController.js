import Course from "../models/Course.js";

// Get All Courses
export const getAllCourse = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .select('-courseContent -enrolledStudents')
      .populate('educator');

    res.json({ success: true, courses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get Course by ID
export const getCourseID = async (req, res) => {
  const { id } = req.params;

  try {
    const courseData = await Course.findById(id).populate('educator');

    // Prevent access to non-free lecture URLs
    courseData.courseContent.forEach((chapter) => {
      chapter.chapterContent.forEach((lecture) => {
        if (!lecture.isPreviewFree) {
          lecture.lectureUrl = "";
        }
      });
    });

    res.json({ success: true, courseData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


//purchase