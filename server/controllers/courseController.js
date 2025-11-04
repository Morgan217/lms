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



// ✅ Get full course details by ID
export const getCourseById = async (req, res) => {
const { id } = req.params;

  try {
    const courseData = await Course.findById(id).populate('educator');

    // Prevent access to non-free lecture URLs
    courseData.courseContent.forEach((chapter) => {
      chapter.chapterContent.forEach((lecture) => {
        
      });
    });

    res.json({ success: true, courseData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Update an existing course by ID
export const updateCourse = async (req, res) => { try {
    const educatorId = req.auth.userId; // From requireAuth()
    const { courseData } = req.body;
    const imageFile = req.file;

    if (!courseData) {
      return res.status(400).json({ success: false, message: 'courseData is required' });
    }


    // Parse the JSON string safely
    let parsedCourseData;
    try {
      parsedCourseData = JSON.parse(courseData);
     
    } catch (err) {
      return res.status(400).json({ success: false, message: 'courseData must be valid JSON' });
    }


    const { courseId } = parsedCourseData;
    if (!courseId) {
      return res.status(400).json({ success: false, message: 'courseId is required for update' });
    }


    // Find the existing course
    const existingCourse = await Course.findById(courseId);
    if (!existingCourse) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
  
  

    // If a new thumbnail image is provided, upload and update it
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path);
      parsedCourseData.courseThumbnail = imageUpload.secure_url;

    } else {
      // Keep the existing thumbnail if no new one is uploaded
      parsedCourseData.courseThumbnail = existingCourse.courseThumbnail;

    }

    // Merge new data into existing course
    Object.assign(existingCourse, parsedCourseData);

    // Save updated course
    await existingCourse.save();

      console.log("Existing code "+existingCourse)
    res.json({ success: true, message: 'Course Updated', course: existingCourse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};