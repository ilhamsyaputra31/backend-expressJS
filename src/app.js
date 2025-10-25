import 'express-async-errors';
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import router from './routes/router.js';
import { notFound, errorHandler } from './middlewares/error.js';

dotenv.config();

const app = express();
app.use(express.json());

// ---- resolve __dirname (ESM) ----
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ---- view engine + static ----
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.use(express.static(path.join(__dirname, '..', 'public')));

// ---- public pages ----
app.get('/',        (req, res) => res.redirect('/login'));
app.get('/login',   (req, res) => res.render('login',    { title: 'Login' }));
app.get('/register',(req, res) => res.render('register', { title: 'Register' }));
app.get('/products',(req, res) => res.render('products', { title: 'Products' }));

// ---- REST API ----
app.use('/api', router);

// ---- Dev route list (optional) ----
if (process.env.NODE_ENV !== 'production') {
  const { default: listEndpoints } = await import('express-list-endpoints');
  app.get('/_routes', (req, res) => res.json(listEndpoints(app)));
}

// ---- 404 & error handler ----
app.use(notFound);
app.use(errorHandler);

export default app;
