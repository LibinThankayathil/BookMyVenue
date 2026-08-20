import { Router } from 'express';
import { requireAdmin } from '../middlewares/auth.middleware';
import { AdminController } from '../controllers/admin.controller';

const router = Router();
const controller = new AdminController();

// All admin venue routes require ADMIN role
router.get('/', requireAdmin, controller.getAllVenues);
router.get('/pending', requireAdmin, controller.getPendingVenues);
router.patch('/:id/approve', requireAdmin, controller.approveVenue);
router.patch('/:id/reject', requireAdmin, controller.rejectVenue);

export default router;
