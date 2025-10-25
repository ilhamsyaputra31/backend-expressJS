import mongoose from 'mongoose';
import app from './app.js';
import { initRedis } from './lib/redis.js';

const { MONGO_URI, PORT = 8000 } = process.env;

await initRedis();

mongoose.connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Mongo error:', err.message);
    process.exit(1);
  });
