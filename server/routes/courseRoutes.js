import express from 'express';
import { getAllCourse, getCourseID, getCourseById, updateCourse } from '../controllers/courseController.js';
import upload from '../configs/multer.js';

const courseRouter = express.Router();

// ✅ Correct: '/all' for getting all courses
courseRouter.get('/all', getAllCourse);

// ✅ '/:id' for getting a single course by ID
courseRouter.get('/:id', getCourseID);

courseRouter.get("/course-get/:id", getCourseById);
courseRouter.put("/course-update/:id", upload.single("image"), updateCourse);

export default courseRouter;
