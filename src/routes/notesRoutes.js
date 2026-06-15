import { Router } from 'express';
import { celebrate } from 'celebrate';
import {
  getAllNotes,
  getNoteById,
  createNote,
  deleteNote,
  updateNote,
} from '../controllers/notesController.js';
import { authenticate } from '../middleware/authenticate.js';
import {
  getAllNotesSchema,
  noteIdSchema,
  createNoteSchema,
  updateNoteSchema,
} from '../validations/notesValidation.js';

const router = Router();

// Обгортка для обробки асинхронних помилок
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get(
  '/notes',
  asyncHandler(authenticate),
  celebrate(getAllNotesSchema),
  asyncHandler(getAllNotes),
);
router.get(
  '/notes/:noteId',
  asyncHandler(authenticate),
  celebrate(noteIdSchema),
  asyncHandler(getNoteById),
);
router.post(
  '/notes',
  asyncHandler(authenticate),
  celebrate(createNoteSchema),
  asyncHandler(createNote),
);
router.delete(
  '/notes/:noteId',
  asyncHandler(authenticate),
  celebrate(noteIdSchema),
  asyncHandler(deleteNote),
);
router.patch(
  '/notes/:noteId',
  asyncHandler(authenticate),
  celebrate(updateNoteSchema),
  asyncHandler(updateNote),
);

export default router;
