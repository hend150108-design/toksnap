# TokSnap — Modern TikTok Video Downloader

> **Snap Your Favorite Videos**  
> Website TikTok Video Downloader modern, premium, responsif, cepat, dan aman dengan integrasi frontend dan backend yang nyata.

---

## 📸 Antarmuka & Identitas

- **Produk:** TokSnap
- **Tagline:** Snap Your Favorite Videos
- **Bahasa Antarmuka:** Bahasa Indonesia
- **Tema Warna:** Royal Navy + Platinum
  - Background Utama: `#111827`
  - Card & Surface: `#1F2937`
  - Border: `#374151`
  - Platinum Accent: `#CBD5E1`
  - Highlight: `#94A3B8`
  - Teks Utama: `#F8FAFC`
  - Teks Sekunder: `#9CA3AF`

---

## 🚀 Fitur Unggulan

1. **Alur Pengunduhan Nyata (Real End-to-End Resolution):**
   - Mendukung tautan video standar (`https://www.tiktok.com/@user/video/...`) dan tautan pendek (`https://vt.tiktok.com/...`, `https://vm.tiktok.com/...`).
   - Menyediakan pilihan unduhan:
     - **Video HD (Tanpa Watermark)**
     - **Video Standar (Watermark)**
     - **Audio MP3 Asli**
     - **Slide Foto HD** (jika berupa album foto TikTok)
2. **Download Stream Proxy (`/api/download`):**
   - Menyajikan file dengan header `Content-Disposition: attachment; filename="..."` sehingga browser langsung menyimpan file ke folder *Downloads* perangkat tanpa membuka tab baru atau player browser.
3. **Pencegahan SSRF & Validasi Keamanan Ketat:**
   - Memvalidasi domain secara ketat hanya pada domain resmi TikTok.
   - Memblokir loopback, localhost, IP internal (RFC 1918), IP metadata cloud (`169.254.169.254`), dan hostname tidak sah.
4. **Arsitektur Adapter Terpisah:**
   - Provider pemrosesan video diisolasi dalam modul adapter (`BaseAdapter`, `TikwmAdapter`, `RapidApiAdapter`).
   - Penyedia API dapat diganti atau diperluas dengan mudah melalui variabel `DEFAULT_ADAPTER` di file `.env`.
5. **Rate Limiting & Perlindungan DoS:**
   - Rate limiting 30 req/menit per IP untuk endpoint resolve dan 60 req/menit untuk download stream.
   - Pembatasan ukuran request body (50 KB).
6. **Responsivitas & Aksesibilitas Penuh:**
   - Diuji pada smartphone (320px+), tablet, laptop, hingga monitor desktop besar.
   - Navigasi keyboard, kontras teks tinggi, label semantik, dan dukungan `prefers-reduced-motion`.

---

## 📂 Struktur Proyek

```text
toksnap/
├── public/
│   ├── assets/
│   │   └── logo.svg            # Logo vektor TokSnap
│   ├── css/
│   │   └── style.css           # Design system Royal Navy & Platinum
│   ├── js/
│   │   └── app.js              # Logika frontend, validasi, dan integrasi API
│   └── index.html              # Markup semantik HTML5 halaman utama
├── src/
│   ├── config/
│   │   └── index.js            # Konfigurasi aplikasi & environment
│   ├── middleware/
│   │   ├── errorHandler.js     # Penanganan error terpusat tanpa bocoran rahasia
│   │   └── rateLimiter.js      # Rate limiter per IP
│   ├── routes/
│   │   └── api.js              # Route API (/health, /resolve, /download)
│   ├── services/
│   │   ├── downloader.js       # Orchestrator adapter downloader
│   │   └── adapters/
│   │       ├── baseAdapter.js      # Interface dasar adapter
│   │       ├── tikwmAdapter.js     # Adapter aktif default (TikWM)
│   │       └── rapidApiAdapter.js  # Adapter alternatif (RapidAPI)
│   ├── validators/
│   │   └── videoUrl.js         # Validasi URL & proteksi SSRF
│   ├── app.js                  # Setup Express, Helmet, CORS, static files
│   └── server.js               # Entry point server HTTP & graceful shutdown
├── tests/
│   └── api.test.js             # Test suite otomatis (18 skenario uji)
├── .env.example                # Template variabel lingkungan
├── .env                        # Konfigurasi lingkungan lokal
├── .gitignore
├── package.json
└── README.md
```

---

## 🛠️ Persyaratan Sistem

- **Node.js:** Versi 18.0.0 atau yang lebih baru (Diuji di Node.js v24.18.0)
- **NPM:** Versi 9.0.0 atau yang lebih baru

---

## ⚙️ Langkah Instalasi & Menjalankan Server

### 1. Masuk ke Direktori Proyek
```bash
cd "c:\xampp\htdocs\tiktok downloader"
```

### 2. Instal Dependensi
```bash
npm install
```

### 3. Konfigurasi File Environment
Salin template `.env.example` ke `.env`:
```bash
cp .env.example .env
```

Isi file `.env` sesuai kebutuhan:
```env
# Port aplikasi
PORT=3000
NODE_ENV=development

# Pilihan adapter aktif: 'tikwm' atau 'rapidapi'
DEFAULT_ADAPTER=tikwm

# Jika menggunakan RapidAPI (opsional):
RAPIDAPI_KEY=
RAPIDAPI_HOST=tiktok-downloader-download-tiktok-videos-without-watermark.p.rapidapi.com

# Rate limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=30
REQUEST_TIMEOUT_MS=15000
```

### 4. Menjalankan Server

#### Mode Pengembangan (Development dengan auto-reload):
```bash
npm run dev
```

#### Mode Produksi:
```bash
npm start
```

Setelah server aktif, buka peramban Anda di:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔌 Menghubungkan Adapter Penyedia API

TokSnap menggunakan **Adapter Pattern** yang modular. Anda dapat memilih salah satu penyedia berikut:

### Opsi A: TikWM (Default, Aktif Langsung)
- Disediakan secara *out-of-the-box* tanpa perlu mendaftar kartu kredit atau API key berbayar.
- Konfigurasi pada `.env`:
  ```env
  DEFAULT_ADAPTER=tikwm
  ```

### Opsi B: RapidAPI
1. Buat akun di [RapidAPI](https://rapidapi.com/) dan berlangganan salah satu API TikTok Downloader (contoh: *TikTok Downloader - Download TikTok Videos Without Watermark*).
2. Dapatkan API Key Anda dari dashboard RapidAPI.
3. Atur di file `.env`:
  ```env
  DEFAULT_ADAPTER=rapidapi
  RAPIDAPI_KEY=masukkan_rapidapi_key_anda_di_sini
  ```
4. Jika `RAPIDAPI_KEY` belum diisi saat `DEFAULT_ADAPTER=rapidapi` aktif, server akan secara transparan mengembalikan error konfigurasi yang jelas kepada pengguna tanpa memalsukan hasil.

---

## 🧪 Menjalankan Pengujian (Testing)

Proyek ini telah dilengkapi dengan 18 unit dan integration test otomatis menggunakan `node:test` bawaan:

```bash
npm test
```

Cakupan pengujian:
- ✅ Format URL standar TikTok yang valid
- ✅ Format URL pendek (`vt.tiktok.com`, `vm.tiktok.com`)
- ✅ Penolakan input kosong atau bukan string
- ✅ Penolakan URL acak / domain non-TikTok
- ✅ Proteksi SSRF terhadap localhost (`127.0.0.1`, `localhost`)
- ✅ Proteksi SSRF terhadap subnet IP privat internal (`192.168.x.x`, `169.254.x.x`)
- ✅ Penolakan protokol non-HTTP/HTTPS
- ✅ Peringatan konfigurasi pada `RapidApiAdapter` saat key tidak tersedia
- ✅ Pengambilan adapter pada `DownloaderService`
- ✅ Endpoint `GET /api/health`
- ✅ Endpoint `POST /api/resolve` (validasi payload, rate limit, sanitasi SSRF)
- ✅ Endpoint `GET /api/download` (validasi izin domain CDN, proteksi SSRF)
- ✅ Fallback 404 pada route yang tidak terdefinisi

---

## 🔒 Praktik Keamanan & Privasi

1. **Anti-SSRF (Server-Side Request Forgery):**
   Server memblokir segala upaya pemanggilan alamat lokal, IP loopback, dan jaringan internal.
2. **HTTP Security Headers:**
   Menggunakan `helmet` untuk menyetel header keamanan modern (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`).
3. **Sanitasi Filename:**
   Filename pada saat pengunduhan dibersihkan dari karakter berbahaya untuk mencegah *Header Injection* atau manipulasi path.
4. **Tanpa Logging Data Pengguna:**
   URL video dan metadata pengguna tidak disimpan di database server.
5. **Kepatuhan Hak Cipta:**
   TokSnap hanya memproses konten publik dan menyertakan disclaimer hak cipta yang jelas.

---

## 🌐 Petunjuk Deployment ke Production

### Menggunakan PM2 (VPS / Ubuntu / Debian)
```bash
# Instal PM2 secara global jika belum ada
npm install -g pm2

# Jalankan TokSnap dengan PM2
pm2 start src/server.js --name "toksnap"

# Simpan proses agar otomatis aktif setelah restart server
pm2 save
pm2 startup
```

### Konfigurasi Reverse Proxy Nginx & SSL (HTTPS)
```nginx
server {
    server_name toktoksnap.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Gunakan **Certbot** untuk memasang sertifikat SSL gratis:
```bash
sudo certbot --nginx -d toktoksnap.yourdomain.com
```

---

## 📄 Lisensi & Disclaimer

- **Lisensi:** MIT License.
- **Pernyataan Penyangkalan (Disclaimer):** TokSnap adalah proyek independen dan tidak terafiliasi dengan TikTok atau ByteDance Ltd. Pengguna bertanggung jawab penuh atas konten yang diunduh dan diwajibkan untuk menghormati hak cipta pembuat karya.
