import express from 'express';
import { addCourse, educatorDashboardData, getEducatorCourses, getEnrolledStudentsData, updateRoleToEducator } from '../controllers/educatorController.js';
import upload from '../configs/multer.js';
import { protectEducator } from '../middlewares/authMiddleware.js';

const educatorRoute = express.Router();

// Add Educator Role
educatorRoute.get('/update-role', updateRoleToEducator);
//educatorRoute.post('/add-course', upload.single('image'), protectEducator, addCourse);
educatorRoute.post('/add-course', protectEducator, upload.single('image'), addCourse);
educatorRoute.get('/courses', protectEducator, getEducatorCourses)
educatorRoute.get('/dashboard', protectEducator, educatorDashboardData)
educatorRoute.get('/enrolled-students', protectEducator, getEnrolledStudentsData)

export default educatorRoute;
