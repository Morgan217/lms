import {clerkClient} from '@clerk/express'
import Course from '../models/Course.js'
import {v2 as cloudinary} from 'cloudinary'


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

//Add New Course


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

//Get Educator Dashoard Data ( Total Earning, Enrolled Students, No. of Courses)

export const educatorDashboardData = async (req, res)=>{
    try {
        const educator = removeEventListener.auth.userId;
        const courses = await Course.find({educator})
        const totalCourses = courses.length;

        const courseIds= courses.map(course => course._id);

        //Calculate total earnings from purchases
        const purchases = await Purchase.find({
            courseId:{$in: courseIds},
            status:'complete'
        });

        const totalEarnings= purchases.reduce((sum, purchase)=> sum+purchase.amount,0 );

        //Collect Unique enrolled student IDS with their course titles

        const enrolledStudentsData=[];
        for(const course of courses){
            const students = await User.find({
                _id:{$in:course.enrolledStudents}
            },'name imageUrl');

            students.array.forEach(student => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,student
                })
            });
        }

        res.json({success: true, dashboardData:{totalEarnings, enrolledStudentsData, totalCourses}})

    } catch (error) {
        res.json({success: false, message: error.message});
    }

}

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

        const enrolledStudents = purchase.map(purchase=>({
            student: purchase.userId,
            courseTitle:purchase.courseId.courseTitle,
            purchaseDate: purchase.createdAt
        }));

        res.json({success: true, enrolledStudents})

    } catch (error) {
        res.json({success: false, message: error.message});
    }
}