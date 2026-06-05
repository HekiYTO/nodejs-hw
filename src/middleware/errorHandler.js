import createHttpError, { HttpError } from 'http-errors';
import { isCelebrateError } from 'celebrate';

export const errorHandler = (err, req, res, next) => {
  console.error('Error Middleware:', err);

  // Handle celebrate validation errors
  if (isCelebrateError(err)) {
    const { details } = err;
    const message = details
      .map((detail) => `${detail.context.label}: ${detail.message}`)
      .join('; ');

    return res.status(400).json({
      message,
    });
  }

  // Перевіряємо чи це HttpError з бібліотеки http-errors
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      message: err.message,
    });
  }

  // Обробка інших помилок
  const isProd = process.env.NODE_ENV === 'production';

  res.status(500).json({
    message: isProd
      ? 'Something went wrong. Please try again later.'
      : err.message,
  });
};
