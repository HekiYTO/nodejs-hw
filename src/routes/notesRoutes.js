import { Router } from 'express';
import {
  getAllNotes,
  getNoteById,
  createNote,
  deleteNote,
  updateNote,
} from '../controllers/notesController.js';

const router = Router();

// Обгортка для обробки асинхронних помилок
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get('/notes', asyncHandler(getAllNotes));
router.get('/notes/:noteId', asyncHandler(getNoteById));
router.post('/notes', asyncHandler(createNote));
router.delete('/notes/:noteId', asyncHandler(deleteNote));
router.patch('/notes/:noteId', asyncHandler(updateNote));

export default router;
