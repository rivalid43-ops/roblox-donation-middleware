import express from 'express';
import dotenv from 'dotenv';
import { webhookRouter } from './routes/webhook.js';
import { healthRouter } from './routes/health.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/api/webhook', webhookRouter);
app.use('/health', healthRouter);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint tidak ditemukan',
    path: req.path
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
  console.log(`📡 Webhook endpoint: POST http://localhost:${PORT}/api/webhook/saweria`);
});

export default app;
