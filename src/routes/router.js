import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';

const r = Router();

r.use('/auth', authRoutes);
r.use('/products', productRoutes);

export default r;
