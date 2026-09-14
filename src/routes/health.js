import express from 'express';

export const healthRouter = express.Router();

/**
 * GET /health
 * Endpoint untuk mengecek status server
 */
healthRouter.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});
