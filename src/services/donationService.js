/**
 * Proses data donasi dari Saweria
 * 
 * Di tahap pertama ini, kita hanya menyimpan log donasi.
 * Di tahap selanjutnya, data ini akan dikirim ke Roblox Open Cloud API
 * 
 * @param {Object} donationData - Data donasi dari webhook Saweria
 * @returns {Object} - Processing result dengan ID
 */
export async function processDonation(donationData) {
  try {
    // Generate unique ID untuk tracking
    const processingId = generateId();

    // Log donasi (untuk debugging)
    logDonation(processingId, donationData);

    // TODO: Di tahap berikutnya, tambahkan:
    // 1. Simpan ke database (jika ada)
    // 2. Kirim ke Roblox Open Cloud API
    // 3. Update game Roblox dengan reward donasi

    return {
      processingId,
      status: 'received',
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Error memproses donasi:', error.message);
    throw error;
  }
}

/**
 * Generate unique ID
 */
function generateId() {
  // Gunakan timestamp + random string untuk ID yang unik
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `donation_${timestamp}_${random}`;
}

/**
 * Log informasi donasi ke console (untuk tahap development)
 */
function logDonation(processingId, data) {
  console.log('');
  console.log('💰 ===== DONASI DITERIMA =====');
  console.log(`📌 ID: ${processingId}`);
  console.log(`👤 Donatur: ${data.donator_name}`);
  console.log(`💵 Nominal: ${data.amount} ${data.currency}`);
  console.log(`💬 Pesan: ${data.message || '(tidak ada pesan)'}`);
  console.log(`⏰ Waktu: ${new Date().toISOString()}`);
  console.log('============================');
  console.log('');
}
