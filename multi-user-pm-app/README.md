## 🚀 Cara Menjalankan Proyek Ini

### 1. Clone Repository

Clone repositori ke komputer lokal Anda dan masuk ke direktori proyek.

```bash
git clone https://github.com/Adityasputra/sp_fs_aditya_saputra.git
cd multi-user-pm-app
```

### 2. Install Dependencies

Instal semua dependensi yang diperlukan menggunakan npm.

```bash
npm install
```

### 3. Konfigurasi Environment Variables

Salin file `.env.example` ke `.env`, lalu isi nilai variabel lingkungan sesuai dengan konfigurasi proyek Anda.

```bash
cp .env.example .env
```

### 4. Jalankan Prisma Migrate

Lakukan migrasi database dengan perintah berikut:

```bash
npx prisma migrate dev
```

### 5. Menjalankan Server

Jalankan server dalam mode pengembangan.

```bash
npm run dev
```

---

Pastikan semua variabel di file `.env` telah diatur dengan benar sebelum menjalankan server.
