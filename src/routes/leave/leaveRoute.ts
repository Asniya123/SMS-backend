import { verifyToken, requireAdmin, requireStudent } from '../../middleware/authMiddleware';
import { LeaveController } from '../../controllers/user/leaveController';
import { Router } from 'express';
import leaveService from '../../services/user/leaveService';

const leaveController = new LeaveController(leaveService);
const router = Router();

// Apply verifyToken to all routes to ensure authentication
router.use(verifyToken);

// Routes accessible to authenticated students
router.post('/apply', requireStudent, leaveController.applyLeave.bind(leaveController));
router.get('/my-leaves', requireStudent, leaveController.getUserLeaves.bind(leaveController));

// Routes restricted to admins
router.use(requireAdmin);
router.get('/pending', leaveController.getPendingLeaves.bind(leaveController));
router.put('/:leaveId', leaveController.updateLeaveStatus.bind(leaveController));
router.get('/calendar', leaveController.getCalendarLeaves.bind(leaveController));

export default router;