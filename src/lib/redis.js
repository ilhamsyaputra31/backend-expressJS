import { createClient } from 'redis';

const url = process.env.REDIS_URL || 'redis://localhost:6379';
export const redis = createClient({ url });

redis.on('error', (err) => console.error('Redis error:', err.message));
redis.on('connect', () => console.log('Redis connected'));

export async function initRedis() {
  try {
    if (!redis.isOpen) await redis.connect();
  } catch (e) {
    console.error('Redis connect failed (app tetap jalan):', e.message);
  }
}

export async function rGetJSON(key) {
  try { const s = await redis.get(key); return s ? JSON.parse(s) : null; } catch { return null; }
}
export async function rSetJSON(key, value, ttlSec) {
  try {
    const s = JSON.stringify(value);
    if (ttlSec) return await redis.set(key, s, { EX: ttlSec });
    return await redis.set(key, s);
  } catch { /* ignore */ }
}
export async function rDel(key) {
  try { await redis.del(key); } catch { /* ignore */ }
}
export async function rIncr(key) {
  try { return await redis.incr(key); } catch { return null; }
}
export async function rGet(key) {
  try { return await redis.get(key); } catch { return null; }
}
