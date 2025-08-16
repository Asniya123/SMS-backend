import { Router } from 'express';
import { verifyToken, requireAdmin } from '../../middleware/authMiddleware';
import { CourseController } from '../../controllers/course/courseController';
import { courseService } from '../../services/course';


const router = Router();

const courseController = new CourseController(courseService)


// Course routes - all routes require admin authentication
router.use(verifyToken); // Verify JWT token first
router.use(requireAdmin); // Then check if user is admin

// Course routes - specific routes first, then parameterized routes
router.post('/add', courseController.addCourse.bind(courseController));
router.get('/list/:adminId', courseController.listCourses.bind(courseController));
router.put('/:courseId', courseController.editCourse.bind(courseController));
router.delete('/:courseId', courseController.deleteCourse.bind(courseController));
router.get('/:courseId', courseController.getCourse.bind(courseController));

export default router;





