import { Router } from 'express';
import { requireOwner } from '../middlewares/auth.middleware';
import { UploadController } from '../controllers/upload.controller';

const router = Router();
const controller = new UploadController();

router.post('/uploads/signature', requireOwner, controller.getSignature);

export default router;
