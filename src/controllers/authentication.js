import 'express-async-errors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';

function validate(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: 'Validation error', errors: errors.array() });
  }
}

export const registerValidators = [
  body('name').notEmpty().withMessage('name required'),
  body('email').isEmail().withMessage('valid email required'),
  body('password').isLength({ min: 6 }).withMessage('min 6 chars'),
];

export const loginValidators = [
  body('email').isEmail(),
  body('password').notEmpty(),
];

export async function register(req, res) {
  const bad = validate(req, res); if (bad) return;

  const { name, email, password } = req.body;
  const exist = await User.findOne({ email });
  if (exist) return res.status(409).json({ message: 'Email already registered' });

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash });

  res.status(201).json({ id: user.id, name: user.name, email: user.email });
}

export async function login(req, res) {
  const bad = validate(req, res); if (bad) return;

  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({}, process.env.JWT_SECRET, {
    subject: user.id,
    expiresIn: process.env.JWT_EXPIRES || '7d',
  });

  res.json({ token });
}

export async function me(req, res) {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
}
