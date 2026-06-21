import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import handlebars from 'handlebars';
import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { createSession, setSessionCookies } from '../services/auth.js';
import { sendEmail } from '../utils/sendMail.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const registerUser = async (req, res) => {
  const { email, password } = req.body;

  // Проверяем, существует ли пользователь с таким email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createHttpError(400, 'Email in use');
  }

  // Хешируем пароль
  const hashedPassword = await bcrypt.hash(password, 10);

  // Создаем нового пользователя
  const user = await User.create({
    email,
    password: hashedPassword,
  });

  // Создаем сессию
  const session = await createSession(user._id);

  // Устанавливаем cookies
  setSessionCookies(res, session);

  // Возвращаем ответ (пароль скрыт благодаря методу toJSON)
  res.status(201).json(user.toJSON());
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Ищем пользователя по email
  const user = await User.findOne({ email });
  if (!user) {
    throw createHttpError(401, 'Invalid credentials');
  }

  // Проверяем пароль
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw createHttpError(401, 'Invalid credentials');
  }

  // Удаляем старую сессию и создаем новую
  await Session.deleteOne({ userId: user._id });
  const session = await createSession(user._id);

  // Устанавливаем cookies
  setSessionCookies(res, session);

  // Возвращаем ответ
  res.status(200).json(user.toJSON());
};

export const refreshUserSession = async (req, res) => {
  const { sessionId, refreshToken } = req.cookies;

  // Ищем сессию
  const session = await Session.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  // Проверяем, не прострочен ли refresh token
  if (new Date() > session.refreshTokenValidUntil) {
    // Удаляем сессию и очищаем куки перед возвращением ошибки
    await Session.deleteOne({ _id: sessionId });
    res.clearCookie('sessionId');
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    throw createHttpError(401, 'Session token expired');
  }

  // Удаляем старую сессию и создаем новую
  await Session.deleteOne({ _id: sessionId });
  const newSession = await createSession(session.userId);

  // Устанавливаем новые cookies
  setSessionCookies(res, newSession);

  // Возвращаем ответ
  res.status(200).json({ message: 'Session refreshed' });
};

export const logoutUser = async (req, res) => {
  const { sessionId } = req.cookies;

  // Если есть sessionId, удаляем сессию
  if (sessionId) {
    await Session.deleteOne({ _id: sessionId });
  }

  // Очищаем cookies
  res.clearCookie('sessionId');
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  // Возвращаем ответ
  res.status(204).send();
};

export const requestResetEmail = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  // Если пользователя нет — всё равно отвечаем 200,
  // чтобы не давать возможность определять, какие email зарегистрированы
  if (!user) {
    return res
      .status(200)
      .json({ message: 'Password reset email sent successfully' });
  }

  // Генерируем JWT-токен на 15 минут
  const resetToken = jwt.sign(
    {
      sub: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' },
  );

  // Читаем и компилируем html-шаблон письма
  const templatePath = path.join(
    __dirname,
    '../templates/reset-password-email.html',
  );
  const templateSource = await fs.readFile(templatePath, 'utf-8');
  const template = handlebars.compile(templateSource);

  const resetLink = `${process.env.FRONTEND_DOMAIN}/reset-password?token=${resetToken}`;

  const html = template({
    username: user.username,
    link: resetLink,
  });

  // Отправляем письмо
  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset your password',
      html,
    });
  } catch (error) {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }

  res.status(200).json({ message: 'Password reset email sent successfully' });
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw createHttpError(401, 'Invalid or expired token');
  }

  const user = await User.findOne({
    _id: payload.sub,
    email: payload.email,
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  user.password = hashedPassword;
  await user.save();

  res.status(200).json({ message: 'Password reset successfully' });
};
