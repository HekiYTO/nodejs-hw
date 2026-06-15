import { Router } from 'express';
import { celebrate } from 'celebrate';
import {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
} from '../controllers/authController.js';
import {
  registerUserSchema,
  loginUserSchema,
} from '../validations/authValidation.js';

const router = Router();

// Обгортка для обробки асинхронних помилок
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post(
  '/auth/register',
  celebrate(registerUserSchema),
  asyncHandler(registerUser),
);
router.post('/auth/login', celebrate(loginUserSchema), asyncHandler(loginUser));
router.post('/auth/refresh', asyncHandler(refreshUserSession));
router.post('/auth/logout', asyncHandler(logoutUser));

export default router;
