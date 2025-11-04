import {clerkClient} from '@clerk/express'
import Course from '../models/Course.js'
import {v2 as cloudinary} from 'cloudinary'
import {Purchase} from '../models/Purchase.js'
import User from '../models/User.js'


//update role to educator
export const updateRoleToEducator =async (req,res)=>{
    try {

        const userId=req.auth.userId

        await clerkClient.users.updateUserMetadata(userId,{ publicMetadata:{
            role:'educator',
        }})

        res.json({success: true, message: 'you can publish a course Now'})
        
    } catch (error) {

        res.json({success: false, message: error.message})
        
    }
}




// Add New Course
export const addCourse = async (req, res) => {
  try {
    const educatorId = req.auth.userId; // Comes from requireAuth()

    // Multer puts text fields in req.body and file in req.file
    const { courseData } = req.body;
    const imageFile = req.file;

    if (!courseData) {
      return res.status(400).json({ success: false, message: 'courseData is required' });
    }

    if (!imageFile) {
      return res.status(400).json({ success: false, message: 'Thumbnail not attached' });
    }

    // Parse the JSON string safely
    let parsedCourseData;
    try {
      parsedCourseData = JSON.parse(courseData);
    } catch (err) {
      return res.status(400).json({ success: false, message: 'courseData must be valid JSON' });
    }

    parsedCourseData.educator = educatorId;

    // Create the course in DB
    const newCourse = await Course.create(parsedCourseData);

    // Upload image to Cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path);
    newCourse.courseThumbnail = imageUpload.secure_url;

    await newCourse.save();

    res.json({ success: true, message: 'Course Added', course: newCourse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};



//get Educator Courses
export const getEducatorCourses= async (req,res)=>{
    try {
        const educator =req.auth.userId
        const courses= await Course.find({educator})
        res.json({success: true, courses})
        
    } catch (error) {
        res.json({success: false, message: error.message})
        
    }
}
// Get Educator Dashboard Data (Total Earning, Enrolled Students, No. of Courses)
export const educatorDashboardData = async (req, res) => {
  try {
    const educator = req.auth.userId;  // ✅ Correct auth reference
    
    const courses = await Course.find({ educator });
    const totalCourses = courses.length;
    const courseIds = courses.map(course => course._id);

    // ✅ Calculate total earnings
    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: 'completed'
    });

    const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);

    // ✅ Unique enrolled student IDS with course titles
    const enrolledStudentsData = [];

    for (const course of courses) {
      const students = await User.find(
        { _id: { $in: course.enrolledStudents } },
        'name imageUrl'
      );

      students.forEach(student => {
        enrolledStudentsData.push({
          courseTitle: course.courseTitle,
          student
        });
      });
    }

    // ✅ Proper response structure expected by frontend
    res.json({
      success: true,
      message: { totalEarnings, enrolledStudentsData, totalCourses }
    });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Get Enrolled Students Data with Purchase Data
export const getEnrolledStudentsData = async (req,res)=>{
    try {
        const educator=req.auth.userId;
        const courses =await Course.find({educator});
        const courseIds = courses.map(course=> course._id);

        const purchases= await Purchase.find({
            courseId:{$in: courseIds},
            status:'completed'
        }).populate('userId','name imageUrl').populate('courseId','courseTitle')

        const enrolledStudents = purchases.map(purchase=>({
            student: purchase.userId,
            courseTitle:purchase.courseId.courseTitle,
            purchaseDate: purchase.createdAt
        }));

        res.json({success: true, enrolledStudents})

    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

// ======================= EDIT COURSE ==========================
export const editCourse = async (req, res) => {
  try {
    const educatorId = req.auth.userId;
    const { courseId } = req.params;
    const { courseData } = req.body;
    const imageFile = req.file;

    // Validate courseData
    if (!courseData) {
      return res.status(400).json({ success: false, message: 'courseData is required' });
    }

    let parsedCourseData;
    try {
      parsedCourseData = JSON.parse(courseData);
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid JSON in courseData' });
    }

    // Find the existing course
    const existingCourse = await Course.findOne({ _id: courseId, educator: educatorId });
    if (!existingCourse) {
      return res.status(404).json({ success: false, message: 'Course not found or unauthorized' });
    }

    // Update course fields
    existingCourse.courseTitle = parsedCourseData.courseTitle || existingCourse.courseTitle;
    existingCourse.courseDescription = parsedCourseData.courseDescription || existingCourse.courseDescription;
    existingCourse.coursePrice = parsedCourseData.coursePrice ?? existingCourse.coursePrice;
    existingCourse.discount = parsedCourseData.discount ?? existingCourse.discount;
    existingCourse.courseContent = parsedCourseData.courseContent || existingCourse.courseContent;

    // If a new thumbnail image is provided, replace the old one
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path);
      existingCourse.courseThumbnail = imageUpload.secure_url;
    }

    await existingCourse.save();

    res.json({ success: true, message: 'Course updated successfully', course: existingCourse });
  } catch (error) {
    console.error('Edit Course Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// ======================= DELETE COURSE ==========================
export const deleteCourse = async (req, res) => {
  try {
    const educatorId = req.auth.userId;
    const { courseId } = req.params;

    const course = await Course.findOne({ _id: courseId, educator: educatorId });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found or unauthorized' });
    }

    // Optionally delete the thumbnail from Cloudinary
    // (only works if you store the public_id when uploading)
    // await cloudinary.uploader.destroy(course.cloudinaryPublicId);

    await Course.deleteOne({ _id: courseId });

    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete Course Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
