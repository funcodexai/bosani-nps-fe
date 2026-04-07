# Langkah perubahan frontend di VM (`~/bosani-nps-fe`)

Dipakai saat SSH ke **bosani-nps-instance-2** (VM frontend), direktori: `~/bosani-nps-fe`.

---

## Ringkasan

1. Samakan kode dengan repo terbaru (disarankan), **atau** buat file `public/api-config.js` + ubah `index.html` manual.
2. Isi **URL VM backend** di `public/api-config.js`.
3. Jalankan **`npm run build`**.
4. Pastikan nginx mem-serve folder **`dist`** (termasuk file **`api-config.js`**).
5. Di VM **backend**: set CORS (`FRONTEND_ORIGIN` atau `CORS_REFLECT_ORIGIN`).

---

## A. Cara cepat: `git pull` (jika repo sudah di-push dari mesin lokal)

```bash
cd ~/bosani-nps-fe
git pull origin main
```

Lanjut ke [langkah 3](#3-isi-url-backend).

---

## B. Jika belum ada folder `public/` (tanpa git)

### 1. Buat folder dan file konfigurasi API

```bash
cd ~/bosani-nps-fe
mkdir -p public
nano public/api-config.js
```

Isi (ganti IP dengan **external IP VM backend** Anda, tanpa slash di akhir):

```javascript
window.__BOSANI_API_BASE__ = 'http://IP_VM_BACKEND';
```

Simpan: **Ctrl+O**, Enter, **Ctrl+X**.

### 2. Pastikan `index.html` memuat `api-config.js` sebelum React

```bash
nano index.html
```

Di dalam `<body>`, **setelah** `<div id="root"></div>`, pastikan ada baris ini **sebelum** `<script type="module" ...>`:

```html
<script src="/api-config.js"></script>
```

Contoh urutan:

```html
<body>
  <div id="root"></div>
  <script src="/api-config.js"></script>
  <script type="module" src="/src/main.tsx"></script>
</body>
```

### 3. Samakan `src/api.ts` dengan versi yang punya `getApiBase()` + `window.__BOSANI_API_BASE__`

Tanpa perubahan ini, variabel di `api-config.js` tidak dipakai. Cara termudah: salin dari repo GitHub / mesin lokal, atau `git pull` jika sudah ada di remote.

---

## 3. Isi URL backend

Edit lagi jika perlu mengganti IP:

```bash
nano public/api-config.js
```

Pastikan:

```javascript
window.__BOSANI_API_BASE__ = 'http://34.9.36.125';
```

(sesuaikan IP backend Anda.)

**Catatan:** Setelah build, Anda juga bisa mengedit **`dist/api-config.js`** di server saja (tanpa build ulang), isinya sama persis.

---

## 4. Build

```bash
cd ~/bosani-nps-fe
npm install
npm run build
```

Cek:

```bash
ls -la dist/api-config.js
```

File ini **harus ada** agar browser bisa memuat konfigurasi.

---

## 5. Nginx (serve `dist`)

Pastikan `root` mengarah ke `dist`, misalnya:

```nginx
root /home/funcodexai/bosani-nps-fe/dist;
```

Sesuaikan user/path Anda. Reload:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## 6. VM backend (CORS)

Di **bosani-nps-instance-1** (atau VM API), saat menjalankan Node:

```bash
export FRONTEND_ORIGIN=http://IP_VM_FRONTEND
npm start
```

Atau untuk latihan saja:

```bash
export CORS_REFLECT_ORIGIN=true
npm start
```

`IP_VM_FRONTEND` = URL yang dipakai buka browser (mis. `http://34.136.60.59`).

---

## Cek cepat dari browser

- Buka URL frontend → **F12** → **Network** → kirim skor → request harus ke host **backend** (bukan hanya path `/api/nps` di IP frontend).
- Buka `http://IP_FRONTEND/api-config.js` → harus terlihat isi `window.__BOSANI_API_BASE__ = 'http://...'`.

---

## Troubleshooting

| Gejala | Tindakan |
|--------|----------|
| 404 untuk `/api-config.js` | Pastikan `dist/api-config.js` ada dan `root` nginx ke `dist`. |
| Request masih ke IP frontend | Isi `api-config.js` + pastikan kode `src/api.ts` memakai `getApiBase()` dari runtime. |
| CORS error | Set `FRONTEND_ORIGIN` atau `CORS_REFLECT_ORIGIN` di backend. |
