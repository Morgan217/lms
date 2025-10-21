import express from 'express';
import { getAllCourse, getCourseID } from '../controllers/courseController.js';

const courseRouter = express.Router();

// ✅ Correct: '/all' for getting all courses
courseRouter.get('/all', getAllCourse);

// ✅ '/:id' for getting a single course by ID
courseRouter.get('/:id', getCourseID);

export default courseRouter;
