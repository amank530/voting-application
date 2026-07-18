import { Router } from 'express';
import { authController } from '../controller/authController';

const router = Router();

router.post('/request-otp', authController.requestOtp);
router.post('/verify-otp', authController.verifyOtp);

export default router;
