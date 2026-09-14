/**
 * Error handler middleware
 * Menangani semua error yang terjadi di aplikasi
 */
export function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
}
