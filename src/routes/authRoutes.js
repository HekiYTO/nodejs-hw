import { Router } from 'express';
import { celebrate } from 'celebrate';
import {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
  requestResetEmail,
  resetPassword,
} from '../controllers/authController.js';
import {
  registerUserSchema,
  loginUserSchema,
  requestResetEmailSchema,
  resetPasswordSchema,
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
router.post(
  '/auth/request-reset-email',
  celebrate(requestResetEmailSchema),
  asyncHandler(requestResetEmail),
);
router.post(
  '/auth/reset-password',
  celebrate(resetPasswordSchema),
  asyncHandler(resetPassword),
);

export default router;
