import createHttpError from 'http-errors';
import { Session } from '../models/session.js';
import { User } from '../models/user.js';

export const authenticate = async (req, res, next) => {
  const { accessToken } = req.cookies;

  // Проверяем наличие accessToken
  if (!accessToken) {
    throw createHttpError(401, 'Missing access token');
  }

  // Ищем сессию по accessToken
  const session = await Session.findOne({ accessToken });
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  // Проверяем, не прострочен ли access token
  if (new Date() > session.accessTokenValidUntil) {
    throw createHttpError(401, 'Access token expired');
  }

  // Ищем пользователя
  const user = await User.findById(session.userId);
  if (!user) {
    throw createHttpError(401);
  }

  // Добавляем пользователя в req
  req.user = user;

  next();
};
