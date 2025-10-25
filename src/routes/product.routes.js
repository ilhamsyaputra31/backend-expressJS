import { Router } from 'express';
import { authGuard } from '../middlewares/auth.js';
import {
  listProducts, listValidators,
  createProduct, createValidators,
  getProduct, idValidator,
  patchProduct, patchValidators,
  deleteProduct
} from '../controllers/products.js';

const r = Router();

r.use(authGuard); // semua endpoint product harus login

r.get('/',  listValidators,  listProducts);
r.post('/', createValidators, createProduct);
r.get('/:id', idValidator, getProduct);
r.patch('/:id', patchValidators, patchProduct);
r.delete('/:id', idValidator, deleteProduct);

export default r;
