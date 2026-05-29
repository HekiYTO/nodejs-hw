import createHttpError, { HttpError } from 'http-errors';

export const errorHandler = (err, req, res, next) => {
  console.error('Error Middleware:', err);

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
