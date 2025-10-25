import 'express-async-errors';
import express from 'express';
import dotenv from 'dotenv';

import router from './routes/router.js';
import { notFound, errorHandler } from './middlewares/error.js';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/api', router);

if (process.env.NODE_ENV !== 'production') {
  const { default: listEndpoints } = await import('express-list-endpoints');
  app.get('/_routes', (req, res) => res.json(listEndpoints(app)));
}

app.use(notFound);
app.use(errorHandler);

export default app;
