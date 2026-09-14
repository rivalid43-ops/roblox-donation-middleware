import crypto from 'crypto';

/**
 * Verifikasi signature webhook dari Saweria
 * 
 * Saweria mengirimkan header X-Saweria-Signature yang berisi HMAC SHA256
 * dari request body menggunakan webhook secret sebagai kunci
 * 
 * @param {Object} req - Express request object
 * @returns {boolean} - true jika signature valid
 */
export function verifySaweriaSignature(req) {
  try {
    // Ambil signature dari header
    const signature = req.headers['x-saweria-signature'];
    const secret = process.env.SAWERIA_WEBHOOK_SECRET;

    // Jika tidak ada secret, skip verification (hanya untuk development)
    if (!secret) {
      console.warn('⚠️  SAWERIA_WEBHOOK_SECRET tidak diset. Verifikasi signature dilewati!');
      
      if (process.env.NODE_ENV === 'production') {
        console.error('❌ SAWERIA_WEBHOOK_SECRET HARUS diset di production!');
        return false;
      }
      
      return true;
    }

    // Jika tidak ada signature, tolak
    if (!signature) {
      console.warn('⚠️  Header X-Saweria-Signature tidak ditemukan');
      return false;
    }

    // Ambil raw body (string)
    // Express middleware `express.json()` sudah mem-parse body
    // Kita perlu raw body untuk verifikasi, jadi kita akan hash dari buffer
    const body = JSON.stringify(req.body);

    // Generate HMAC SHA256
    const hmac = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    // Bandingkan dengan signature yang diterima
    // Gunakan timingSafeEqual untuk mencegah timing attack
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(hmac)
    );

    if (isValid) {
      console.log('✅ Signature webhook valid');
    } else {
      console.warn('❌ Signature webhook tidak cocok');
    }

    return isValid;

  } catch (error) {
    console.error('❌ Error verifikasi signature:', error.message);
    return false;
  }
}

/**
 * Membuat signature HMAC SHA256 (untuk testing)
 * Fungsi helper ini bisa digunakan untuk membuat test signature
 * 
 * @param {Object} data - Data yang akan di-hash
 * @param {string} secret - Secret key
 * @returns {string} - HMAC SHA256 hex string
 */
export function createSignature(data, secret) {
  const body = JSON.stringify(data);
  return crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
}
