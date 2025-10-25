import listEndpoints from 'express-list-endpoints';
import app from '../src/app.js';

const rows = listEndpoints(app).flatMap(r =>
  r.methods.map(m => ({ Method: m, Path: r.path }))
);

console.table(rows);
