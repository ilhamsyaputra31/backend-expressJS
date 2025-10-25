import { body, param, query, validationResult } from 'express-validator';
import Product from '../models/Product.js';
import { rGetJSON, rSetJSON, rDel, rGet, rIncr } from '../lib/redis.js';

const TTL = Number(process.env.CACHE_TTL_SECONDS || 900);

function validate(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ message: 'Validation error', errors: errors.array() });
}

/* ===== Validators (tetap sama seperti sebelumnya) ===== */
export const listValidators = [
  query('q').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sort').optional().isIn(['createdAt', 'price', 'stock', 'name']),
  query('order').optional().isIn(['asc', 'desc']),
];

export const createValidators = [
  body('name').notEmpty(),
  body('sku').notEmpty(),
  body('price').isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 }),
];

export const idValidator = [ param('id').isMongoId() ];

export const patchValidators = [
  ...idValidator,
  body('name').optional().isString(),
  body('price').optional().isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 }),
];

/* ===== Helpers cache key ===== */
async function getVer(uid) {
  const v = await rGet(`products:ver:user:${uid}`);
  return v || '0';
}
async function bumpVer(uid) {
  await rIncr(`products:ver:user:${uid}`);
}

/* ================= Handlers ================= */

// GET /products
export async function listProducts(req, res) {
  const bad = validate(req, res); if (bad) return;

  const uid = req.user.id;
  const { q = '', page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
  const ver = await getVer(uid);

  const ck = `products:list:v${ver}:u:${uid}:q:${q || '-'}:p:${page}:l:${limit}:s:${sort}:${order}`;
  const cached = await rGetJSON(ck);
  if (cached) {
    return res.json({ ...cached, from: 'CACHE', message: 'Data diambil dari cache' });
  }

  const where = { owner: uid };
  if (q) where.$text = { $search: q };
  const sortBy = { [sort]: order === 'asc' ? 1 : -1 };

  const [items, total] = await Promise.all([
    Product.find(where).sort(sortBy).skip((page - 1) * limit).limit(Number(limit)),
    Product.countDocuments(where),
  ]);

  const payload = {
    data: items,
    meta: { total, page: Number(page), limit: Number(limit) }
  };

  await rSetJSON(ck, payload, TTL);
  return res.json({ ...payload, from: 'DB', message: 'Data diambil dari database (fresh)' });
}

// POST /products
export async function createProduct(req, res) {
  const bad = validate(req, res); if (bad) return;

  const uid = req.user.id;
  const doc = await Product.create({
    name: req.body.name,
    sku: req.body.sku,
    price: req.body.price,
    stock: req.body.stock ?? 0,
    owner: uid,
  });

  await bumpVer(uid);
  await rDel(`product:v*:u:${uid}:id:${doc.id}`); 

  res.status(201).json(doc);
}

// GET /products/:id
export async function getProduct(req, res) {
  const bad = validate(req, res); if (bad) return;

  const uid = req.user.id;
  const { id } = req.params;
  const ver = await getVer(uid);

  const ck = `product:v${ver}:u:${uid}:id:${id}`;
  const cached = await rGetJSON(ck);
  if (cached) {
    return res.json({ ...cached, from: 'CACHE', message: 'Data diambil dari cache' });
  }

  const doc = await Product.findOne({ _id: id, owner: uid });
  if (!doc) return res.status(404).json({ message: 'Not found' });

  await rSetJSON(ck, doc, TTL);
  return res.json({ ...doc.toObject(), from: 'DB', message: 'Data diambil dari database (fresh)' });
}

// PATCH /products/:id
export async function patchProduct(req, res) {
  const bad = validate(req, res); if (bad) return;

  const uid = req.user.id;
  const { id } = req.params;

  const update = {};
  ['name', 'price', 'stock'].forEach(k => {
    if (req.body[k] !== undefined) update[k] = req.body[k];
  });

  const doc = await Product.findOneAndUpdate(
    { _id: id, owner: uid },
    update,
    { new: true, runValidators: true }
  );
  if (!doc) return res.status(404).json({ message: 'Not found' });

  // invalidasi detail + bump versi list
  const ver = await getVer(uid);
  await rDel(`product:v${ver}:u:${uid}:id:${id}`);
  await bumpVer(uid);

  res.json(doc);
}

// DELETE /products/:id
export async function deleteProduct(req, res) {
  const bad = validate(req, res); if (bad) return;

  const uid = req.user.id;
  const { id } = req.params;

  const doc = await Product.findOneAndDelete({ _id: id, owner: uid });
  if (!doc) return res.status(404).json({ message: 'Not found' });

  const ver = await getVer(uid);
  await rDel(`product:v${ver}:u:${uid}:id:${id}`);
  await bumpVer(uid);

  res.json({ message: 'Deleted' });
}
