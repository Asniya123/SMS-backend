import { Router } from 'express';
import AdminController from '../../controllers/admin/adminController';
import adminService from '../../services/admin/adminService';
import { verifyToken, requireAdmin } from '../../middleware/authMiddleware';

const router = Router();
const adminController = new AdminController(adminService);

// Public routes (no authentication required)
router.post('/login', adminController.login.bind(adminController));
router.post('/refresh-token', adminController.refreshUserAccessToken.bind(adminController));

// Protected routes (require authentication)
router.use(verifyToken);
router.use(requireAdmin);

// Admin management routes

router.get('/courses', adminController.getCourses.bind(adminController));

// Add these new routes

router.get('/getUsers', adminController.getUsers.bind(adminController));
router.patch('/block-unblock/:userId', adminController.blockUnblock.bind(adminController));


export default router;