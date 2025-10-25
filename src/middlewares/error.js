export function notFound(req, res, next) {
  res.status(404).json({ message: 'Route not found' });
}

export function errorHandler(err, req, res, next) {
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map(e => e.message);
    return res.status(422).json({ message: 'Validation error', errors: details });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID' });
  }

  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    const resp = {
      message: fields.length > 1
        ? `Duplicate keys: ${fields.join(', ')}`
        : `${fields[0]} already exists`,
      fields,
      values: err.keyValue
    };
    return res.status(409).json(resp);
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }

  const status = err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';

  console.error(err);

  res.status(status).json({
    message: err.message || 'Internal Server Error',
    ...(isProd ? null : { stack: err.stack })
  });
}
