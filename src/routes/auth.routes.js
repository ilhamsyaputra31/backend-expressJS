import { Router } from 'express';
import { authGuard } from '../middlewares/auth.js';
import {
  register, registerValidators,
  login, loginValidators,
  me
} from '../controllers/authentication.js';

const r = Router();

r.post('/register', registerValidators, register);
r.post('/login',    loginValidators,    login);

r.get('/me', authGuard, me);

export default r;
