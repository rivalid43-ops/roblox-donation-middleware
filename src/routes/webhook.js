import express from 'express';
import { verifySaweriaSignature } from '../utils/verification.js';
import { processDonation } from '../services/donationService.js';

export const webhookRouter = express.Router();

/**
 * POST /api/webhook/saweria
 * Endpoint untuk menerima webhook donasi dari Saweria
 */
webhookRouter.post('/saweria', async (req, res) => {
  try {
    // Verifikasi signature dari Saweria
    const isValid = verifySaweriaSignature(req);
    
    if (!isValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Signature tidak valid. Webhook mungkin palsu.',
        timestamp: new Date().toISOString()
      });
    }

    // Ambil data dari webhook
    const donationData = req.body;

    // Validasi data donasi
    const validation = validateDonationData(donationData);
    if (!validation.valid) {
      return res.status(400).json({
        status: 'error',
        message: 'Data donasi tidak lengkap',
        errors: validation.errors,
        timestamp: new Date().toISOString()
      });
    }

    // Proses donasi
    const result = await processDonation(donationData);

    res.status(200).json({
      status: 'success',
      message: 'Donasi berhasil diterima dan diproses',
      data: {
        donatorName: donationData.donator_name,
        amount: donationData.amount,
        currency: donationData.currency,
        message: donationData.message
      },
      processingId: result.processingId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error di webhook:', error.message);
    
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan saat memproses webhook',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Validasi data donasi dari Saweria
 */
function validateDonationData(data) {
  const errors = [];

  if (!data.donator_name || typeof data.donator_name !== 'string') {
    errors.push('donator_name harus berupa string');
  }

  if (!data.amount || typeof data.amount !== 'number' || data.amount <= 0) {
    errors.push('amount harus berupa angka positif');
  }

  if (!data.currency || typeof data.currency !== 'string') {
    errors.push('currency tidak boleh kosong');
  }

  // message boleh kosong
  if (data.message && typeof data.message !== 'string') {
    errors.push('message harus berupa string');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
