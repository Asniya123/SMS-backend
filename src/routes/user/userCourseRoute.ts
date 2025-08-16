import { Router } from 'express';
import userCourseController from '../../controllers/user/userCourseController';
import { verifyToken, requireStudent } from '../../middleware/authMiddleware';

const router = Router();

// Public routes (no authentication required)
router.get('/', userCourseController.getCourses.bind(userCourseController));
router.get('/:courseId', userCourseController.getCourseById.bind(userCourseController));

// Authenticated routes (require student role)
router.post('/create-order', verifyToken, requireStudent, userCourseController.createOrder.bind(userCourseController));
router.post('/:courseId/enroll', verifyToken, requireStudent, userCourseController.enrollCourse.bind(userCourseController));
router.get('/me/enrollments', verifyToken, requireStudent, userCourseController.getMyEnrollments.bind(userCourseController));


export default router;