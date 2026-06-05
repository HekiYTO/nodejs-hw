import { Router } from 'express';
import {
  getAllNotes,
  getNoteById,
  createNote,
  deleteNote,
  updateNote,
} from '../controllers/notesController.js';
import {
  getAllNotesSchema,
  noteIdSchema,
  createNoteSchema,
  updateNoteSchema,
} from '../validations/notesValidations.js';

const router = Router();

// Обгортка для обробки асинхронних помилок
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get('/notes', getAllNotesSchema, asyncHandler(getAllNotes));
router.get('/notes/:noteId', noteIdSchema, asyncHandler(getNoteById));
router.post('/notes', createNoteSchema, asyncHandler(createNote));
router.delete('/notes/:noteId', noteIdSchema, asyncHandler(deleteNote));
router.patch('/notes/:noteId', updateNoteSchema, asyncHandler(updateNote));

export default router;
