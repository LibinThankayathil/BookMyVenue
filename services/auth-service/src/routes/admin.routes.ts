import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';

const router = Router();
const controller = new AdminController();

router.get('/users', controller.getAllUsers);
router.get('/users/:id', controller.getUserById);

export default router;
