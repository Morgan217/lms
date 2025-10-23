import { use } from "react"
import User from "../models/User.js"
import Course from "../models/Course.js";
import { Purchase } from "../models/Purchase.js";
import Stripe from "stripe";
import { courseProgress } from "../models/CourseProgress.js";

//get user data
export const getUserData=async (req, res)=>{
    try {
        const userId= req.auth.userId
        const user=await User.findById(userId)

        if(!user)
        {
            return res.json({sucess: false, message: 'User not Found'})

        }

        res.json({success: true, user})
        
    } catch (error) {
        res.json({success: true, message: error.message})
    }
}

//Users Enrolled Courses with Lecture Links
export const userEnrolledCourses= async(req,res)=>{
    try {
        const userId= req.auth.userId
        const userData = await User.findById(userId).populate('enrolledCourses')

        res.json({success: true, enrolledCourses: userData.enrolledCourses})
        
    } catch (error) {
         res.json({success: false, message: error.message})
    }
}
export const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const originUrl = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173';
    const userId = req.auth.userId;

    const userData = await User.findById(userId);
    const courseData = await Course.findById(courseId);

    if (!userData) return res.status(404).json({ success: false, message: `User not found: ${userId}` });
    if (!courseData) return res.status(404).json({ success: false, message: `Course not found: ${courseId}` });

    const amount = Number(((courseData.coursePrice - (courseData.discount * courseData.coursePrice) / 100)).toFixed(2));

    const purchaseData = { courseId: courseData._id, userId, amount };
    const newPurchase = await Purchase.create(purchaseData);

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const currency = process.env.CURRENCY.toLowerCase();

    const line_items = [{
      price_data: { currency, product_data: { name: courseData.courseTitle }, unit_amount: Math.round(amount * 100) },
      quantity: 1
    }];

    const session = await stripe.checkout.sessions.create({
      success_url: `${originUrl}/loading/my-enrollments`,
      cancel_url: `${originUrl}/`,
      line_items,
      mode: 'payment',
      metadata: { purchaseId: newPurchase._id.toString() }
    });

    res.json({ success: true, success_url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}

//update user course Progess

export const updateUserCourseProgress =async(req,res)=>{

    try {
        const userId=req.auth.userId
        const {courseId, lectureId}= req.body
        const progressData= await courseProgress.findOne({userId, courseId})

        if (progressData) {
            if(progressData.lectureCompleted.includes(lectureId))
            {
                return res.json({success: true, message:"Lecture Already Completed"})
            }
            progressData.lectureCompleted.push(lectureId)
            await progressData.save()
            
        } else {

            await courseProgress.create({
                userId, 
                courseId, 
                lectureCompleted:[lectureId]
            })
            
        }

        res.json({success: true, message:'Progress Updated'})


    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

//get user Course Progress
export const getUserCourseProgress = async (req, res)=>{
    try {
        const userId=req.auth.userId
        const {courseId, lectureId}= req.body
        const progressData = await courseProgress.findOne({userId, courseId})
        
        res.json({success: true, progressData})
        
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

//Add User Ratings to course

export const addUserRating= async (req, res)=>{
    const userId= req.auth.userId;
    const{courseId, rating}= req.body;

    if(!courseId || ! userId || !rating || rating< 1 || rating >5)
    {
        return res.json({success: false, message:'Invalid Dtails'});
    }

    try {

        const course =await Course.findById(courseId);

        if(!course){
            return res.json({ success: false, message: 'Course not found'})
        }

        const user= await User.findById(userId);

        if(!user || !user.enrolledCourses.includes(courseId))
        {
            return res.json({success: false, message:' User has not purchased this course.'})
        }

        const existingRatingIndex = course.courseRatings.findIndex(r=> r.userId === userId)

        if(existingRatingIndex >-1)
        {
            course.courseRatings[existingRatingIndex].rating=rating;
        }
        else{
            course.courseRatings.push({userId, rating});
        }

        await course.save();

        return res.json({success: true, message:'Rating added'})
        
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}