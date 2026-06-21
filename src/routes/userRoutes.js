import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { upload } from '../middleware/multer.js';
import { updateUserAvatar } from '../controllers/userController.js';

const router = Router();

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.patch(
  '/users/me/avatar',
  authenticate,
  upload.single('avatar'),
  asyncHandler(updateUserAvatar),
);

export default router;
