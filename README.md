# 🎮 Roblox Donation Middleware

Middleware server untuk menghubungkan **Saweria** dengan **Roblox Open Cloud API**. Server ini menerima notifikasi donasi dari Saweria dan memproses data donasi untuk game Roblox Anda.

## 🎯 Tujuan Sistem

1. ✅ Menerima notifikasi donasi dari Saweria melalui webhook
2. ✅ Membaca data donasi (nama donatur, nominal, pesan)
3. ✅ Memvalidasi webhook agar tidak mudah dipalsukan
4. 🔄 Meneruskan data donasi ke Roblox Open Cloud API (tahap berikutnya)
5. 🎁 Game Roblox akan memberikan reward sesuai donasi (tahap berikutnya)

## 📋 Struktur Folder

```
roblox-donation-middleware/
├── src/
│   ├── index.js                 # Main server file
│   ├── routes/
│   │   ├── webhook.js           # Webhook endpoint dari Saweria
│   │   └── health.js            # Health check endpoint
│   ├── services/
│   │   └── donationService.js   # Logika proses donasi
│   ├── utils/
│   │   └── verification.js      # Verifikasi webhook signature
│   └── middleware/
│       └── errorHandler.js      # Error handling
├── .env.example                 # Template environment variables
├── .gitignore                   # Git ignore
├── package.json                 # Dependencies
└── README.md                    # Dokumentasi ini
```

## 🚀 Cara Pemasangan (Untuk Pemula)

### Step 1: Clone Repository dan Install Dependencies

```bash
# Clone repository (jika belum)
git clone https://github.com/rivalid43-ops/roblox-donation-middleware.git
cd roblox-donation-middleware

# Install dependencies
npm install
```

### Step 2: Setup Environment Variables

```bash
# Copy file .env.example menjadi .env
cp .env.example .env
```

Buka file `.env` dan isi dengan data Anda:

```env
# Port untuk local development
PORT=3000
NODE_ENV=development

# Saweria Configuration
# Dapatkan dari: Saweria Dashboard → Settings → Webhook
SAWERIA_WEBHOOK_SECRET=your_saweria_webhook_secret_here

# Roblox Configuration (untuk tahap berikutnya)
# Dapatkan dari: Roblox Creator Hub → API Keys
ROBLOX_UNIVERSE_ID=your_roblox_universe_id_here
ROBLOX_API_KEY=your_roblox_open_cloud_api_key_here

# Roblox Data Store Configuration
ROBLOX_DATASTORE_NAME=donations
```

### Step 3: Jalankan Server Locally

```bash
# Development mode (auto-reload ketika file berubah)
npm run dev

# Atau production mode
npm start
```

Anda akan melihat output:
```
✅ Server berjalan di http://localhost:3000
📡 Webhook endpoint: POST http://localhost:3000/api/webhook/saweria
```

### Step 4: Test Webhook Locally (Dengan ngrok)

Untuk test webhook dari Saweria, kita perlu expose localhost ke internet:

```bash
# Install ngrok (jika belum)
# Untuk macOS: brew install ngrok
# Untuk Windows: https://ngrok.com/download
# Untuk Linux: https://ngrok.com/download

# Jalankan ngrok di terminal terpisah
ngrok http 3000

# Output akan terlihat:
# Forwarding                    https://abc123def456.ngrok.io -> http://localhost:3000
```

Catat URL publik dari ngrok (contoh: `https://abc123def456.ngrok.io`)

### Step 5: Setup Webhook di Saweria

1. Buka **Saweria Dashboard**
2. Pergi ke **Settings → Webhook**
3. Klik **Add Webhook** atau **+ Tambah**
4. Isi data webhook:
   - **URL**: `https://abc123def456.ngrok.io/api/webhook/saweria` (ganti dengan ngrok URL Anda)
   - **Metode**: POST
   - **Event**: Donation
   - **Secret**: Salin dari `SAWERIA_WEBHOOK_SECRET` di file `.env` Anda
5. Klik **Save** atau **Simpan**

### Step 6: Test Webhook

Di Saweria Dashboard, biasanya ada tombol **"Test"** atau **"Send Test"** untuk webhook. Klik untuk mengirim test donation.

Jika berhasil, di server Anda akan terlihat:

```
✅ Signature webhook valid
💰 ===== DONASI DITERIMA =====
📌 ID: donation_xyz_abc123
👤 Donatur: Test User
💵 Nominal: 10000 IDR
💬 Pesan: Pesan test
⏰ Waktu: 2026-09-14T12:00:00.000Z
============================
```

## 🔒 Keamanan

### Environment Variables

**JANGAN PERNAH** menaruh API Key atau token langsung di kode:

```javascript
// ❌ SALAH - Jangan begini!
const secret = "your_secret_12345";

// ✅ BENAR - Gunakan environment variables
const secret = process.env.SAWERIA_WEBHOOK_SECRET;
```

### Verifikasi Webhook Signature

Setiap webhook dari Saweria dilengkapi dengan signature untuk memastikan bahwa webhook benar-benar dari Saweria:

```javascript
// Server secara otomatis memverifikasi signature di verifySaweriaSignature()
const isValid = verifySaweriaSignature(req);
if (!isValid) {
  return res.status(401).json({ status: 'error', message: 'Signature tidak valid' });
}
```

### .gitignore

File `.env` sudah ada di `.gitignore`, jadi tidak akan ter-commit ke GitHub:

```
.env         # ✅ Aman, tidak ter-commit
.env.local   # ✅ Aman, tidak ter-commit
```

## 📡 API Endpoints

### 1. Health Check
```
GET /health

Respons:
{
  "status": "healthy",
  "timestamp": "2026-09-14T12:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

### 2. Saweria Webhook
```
POST /api/webhook/saweria

Request Body:
{
  "donator_name": "Nama Donatur",
  "amount": 50000,
  "currency": "IDR",
  "message": "Semoga lancar!"
}

Respons (Success):
{
  "status": "success",
  "message": "Donasi berhasil diterima dan diproses",
  "data": {
    "donatorName": "Nama Donatur",
    "amount": 50000,
    "currency": "IDR",
    "message": "Semoga lancar!"
  },
  "processingId": "donation_xyz_abc123",
  "timestamp": "2026-09-14T12:00:00.000Z"
}

Respons (Error - Invalid Signature):
{
  "status": "error",
  "message": "Signature tidak valid. Webhook mungkin palsu.",
  "timestamp": "2026-09-14T12:00:00.000Z"
}
```

## 📦 Deploy ke Vercel (Gratis)

### Step 1: Push ke GitHub
```bash
git add .
git commit -m "Initial commit: Roblox donation middleware"
git push origin main
```

### Step 2: Setup Vercel
1. Buka https://vercel.com
2. Klik **"New Project"**
3. Pilih repository `roblox-donation-middleware`
4. Klik **"Import"**

### Step 3: Setup Environment Variables
1. Di Vercel Dashboard, pergi ke **Settings → Environment Variables**
2. Tambahkan semua variable dari `.env.example`:
   - `SAWERIA_WEBHOOK_SECRET`
   - `ROBLOX_UNIVERSE_ID`
   - `ROBLOX_API_KEY`
   - dsb.

### Step 4: Deploy
Vercel akan otomatis deploy. URL publik akan terlihat di Vercel Dashboard (contoh: `https://roblox-donation-middleware.vercel.app`)

### Step 5: Update Webhook URL di Saweria
1. Buka Saweria Dashboard → Settings → Webhook
2. Edit webhook Anda
3. Ganti URL menjadi: `https://roblox-donation-middleware.vercel.app/api/webhook/saweria`
4. Simpan

Selesai! Server Anda sekarang berjalan di Vercel gratis! 🎉

## 🧪 Testing dengan cURL

### Test Health Check
```bash
curl http://localhost:3000/health
```

### Test Webhook (dengan signature)
```bash
# Set variabel
SECRET="test_secret_12345"
URL="http://localhost:3000/api/webhook/saweria"

# JSON payload
PAYLOAD='{"donator_name":"Test User","amount":50000,"currency":"IDR","message":"Test message"}'

# Generate signature (macOS/Linux)
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" -hex | cut -d' ' -f2)

# Send request
curl -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "X-Saweria-Signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

### Test Webhook tanpa Signature (Development Only)
```bash
curl -X POST http://localhost:3000/api/webhook/saweria \
  -H "Content-Type: application/json" \
  -d '{
    "donator_name": "Test User",
    "amount": 50000,
    "currency": "IDR",
    "message": "Test message"
  }'
```

## 📚 Tahap Berikutnya

Setelah server webhook berhasil berjalan, tahap selanjutnya:

1. **Integrasi Roblox Open Cloud API**
   - Mengirim data donasi ke Roblox Data Stores
   - Trigger function di Roblox untuk memberikan reward

2. **Database untuk Log Donasi**
   - Simpan history donasi
   - Tracking dan analytics

3. **Error Handling & Retry**
   - Jika gagal kirim ke Roblox, retry dengan exponential backoff
   - Queue system untuk donasi yang gagal

4. **Testing & Validation**
   - Unit tests untuk setiap function
   - Integration tests dengan mock Roblox API

## 🆘 Troubleshooting

### Error: `EADDRINUSE: address already in use :::3000`
**Solusi**: Port 3000 sudah dipakai. Ubah PORT di `.env`:
```env
PORT=3001
```

### Error: `Cannot find module 'express'`
**Solusi**: Install dependencies:
```bash
npm install
```

### Webhook tidak bisa connect dari Saweria
**Solusi**: 
1. Pastikan ngrok berjalan: `ngrok http 3000`
2. Update webhook URL di Saweria dengan ngrok URL yang benar
3. Check firewall settings

### Error: `Signature tidak valid`
**Solusi**:
1. Pastikan `SAWERIA_WEBHOOK_SECRET` di `.env` cocok dengan secret di Saweria Dashboard
2. Jika menggunakan ngrok, pastikan bukan URL lama (ngrok URL bisa berubah setiap kali jalan)

## 📝 License

MIT

## 👨‍💻 Author

Dibuat untuk komunitas development Indonesia

---

**Pertanyaan?** Buka issue di GitHub! 🚀
