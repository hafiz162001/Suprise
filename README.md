# 🎂 Birthday Surprise Web App 🎉

Aplikasi web interaktif kejutan ulang tahun yang estetik, seru, dan mudah dikustomisasi. Dibuat menggunakan **Vite**, **Vanilla JavaScript**, **Canvas Confetti**, dan **Web Audio API**.

---

## ✨ Fitur Utama

- 🎁 **Halaman Pembuka Interaktif**: Tampilan kado kejutan yang memikat dan responsive di HP maupun desktop.
- 🕯️ **Tiup Lilin Realistis**:
  - **Deteksi Tiup Mikrofon**: Bisa meniup lilin langsung ke mikrofon HP/laptop menggunakan Web Audio API.
  - **Sentuh / Klik**: Alternatif jika mikrofon tidak diaktifkan, lilin bisa dimatikan dengan menyentuh lilin atau menekan tombol tiup.
- 🎊 **Animasi Confetti**: Pesta kembang api dan confetti meriah setelah lilin berhasil ditiup.
- 🎵 **Backsound / Musik Ulang Tahun**: Musik pengiring yang otomatis diputar saat momen perayaan.
- 💌 **Surat & Catatan Spesial**: Teks ucapan tulus, santai, dan tidak kaku yang mudah diganti.
- 📸 **Galeri / Foto Kenangan**: Mendukung penyisipan foto kenangan spesial.
- 📱 **PWA Ready**: Dilengkapi dengan Service Worker dan Web App Manifest agar bisa diinstal seperti aplikasi native di HP.

---

## 🛠️ Teknologi yang Digunakan

- **Bundler & Dev Server**: [Vite](https://vitejs.dev/)
- **Bahasa**: HTML5, CSS3, Modern JavaScript (ES Modules)
- **Library**: `canvas-confetti`
- **Audio & Interaksi**: Web Audio API (AnalyserNode untuk deteksi tiupan mic)

---

## 🚀 Cara Menjalankan Secara Lokal

Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/) (versi 16 atau lebih baru).

1. **Clone repository ini**:
   ```bash
   git clone https://github.com/hafiz162001/Suprise.git
   cd Suprise
   ```

2. **Install dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan development server**:
   ```bash
   npm run dev
   ```
   Buka URL yang muncul di terminal (biasanya `http://localhost:5173`) di browser Anda.

4. **Build untuk production**:
   ```bash
   npm run build
   ```
   Hasil build akan berada di folder `dist/`.

---

## ⚙️ Kustomisasi Pesan & Foto

Semua konfigurasi pesan, nama, jumlah lilin, hingga foto dapat diubah dengan mudah di file:
👉 **[`src/config.js`](src/config.js)**

```javascript
export const SURPRISE_CONFIG = {
  nickname: "Nama Panggilan",
  
  // Halaman awal
  welcomeTitle: "Happy Birthday! 🎉",
  welcomeSubtitle: "Pesan pembuka...",
  openButtonText: "Buka Kadonya 🎁",

  // Kue & Lilin
  candleCount: 3,
  enableMicBlow: true,

  // Pesan / Surat
  letterParagraphs: [
    "Paragraf pertama ucapan...",
    "Paragraf kedua..."
  ],
  senderName: "Dari Kamu 😎",

  // Foto Kenangan
  hasPhoto: true,
  photoUrl: "URL_FOTO_KAMU_DISINI",
  photoCaption: "Foto kenangan kita 📸"
};
```

---

## 📂 Struktur Direktori

```text
Suprise/
├── public/
│   ├── manifest.json   # Konfigurasi PWA
│   └── sw.js           # Service Worker
├── src/
│   ├── audio.js        # Logika background audio
│   ├── cake.js         # Logika interaktif lilin & kue
│   ├── confetti.js     # Efek animasi confetti
│   ├── config.js       # Konfigurasi data, pesan, dan teks
│   ├── main.js         # Entry point aplikasi
│   └── style.css       # Styling & animasi antarmuka
├── index.html          # File HTML utama
├── package.json        # Dependensi & skrip proyek
├── vite.config.js      # Konfigurasi Vite
└── README.md           # Dokumentasi proyek
```

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).
