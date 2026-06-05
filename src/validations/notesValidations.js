import { celebrate, Joi } from 'celebrate';
import { isValidObjectId } from 'mongoose';
import { TAGS } from '../constants/tags.js';

export const getAllNotesSchema = celebrate({
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(5).max(20).default(10),
    tag: Joi.string()
      .valid(...TAGS)
      .optional(),
    search: Joi.string().optional().allow(''),
  }),
});

export const noteIdSchema = celebrate({
  params: Joi.object().keys({
    noteId: Joi.string()
      .custom((value, helpers) => {
        if (!isValidObjectId(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      })
      .required(),
  }),
});

export const createNoteSchema = celebrate({
  body: Joi.object().keys({
    title: Joi.string().min(1).required(),
    content: Joi.string().allow('').optional(),
    tag: Joi.string()
      .valid(...TAGS)
      .optional(),
  }),
});

export const updateNoteSchema = celebrate({
  params: Joi.object().keys({
    noteId: Joi.string()
      .custom((value, helpers) => {
        if (!isValidObjectId(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      })
      .required(),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string().min(1).optional(),
      content: Joi.string().allow('').optional(),
      tag: Joi.string()
        .valid(...TAGS)
        .optional(),
    })
    .min(1),
});
