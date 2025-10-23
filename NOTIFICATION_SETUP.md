# Firebase Notification Setup

## Masalah yang Diperbaiki

1. **Service Worker tidak terdaftar** - Sekarang service worker didaftarkan di `main.ts`
2. **Firebase config placeholder** - Service worker menggunakan konfigurasi yang benar
3. **Tidak ada permission request** - Aplikasi sekarang meminta izin notifikasi
4. **Tidak ada message listener** - Aplikasi sekarang mendengarkan pesan foreground

## Langkah Setup

### 1. Update Firebase Configuration

Ganti placeholder di `public/firebase-messaging-sw.js` dengan konfigurasi Firebase Anda yang sebenarnya:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Ini sudah benar: 904914428041
  appId: "YOUR_ACTUAL_APP_ID",
};
```

### 2. Environment Variables

Pastikan file `.env` Anda memiliki variabel Firebase:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=904914428041
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

### 3. Testing Notifications

1. **Reload aplikasi** - Service worker akan terdaftar
2. **Allow notifications** - Browser akan meminta izin
3. **Check console** - Anda akan melihat FCM token
4. **Send test notification** - Gunakan Firebase Console atau backend

## Cara Kerja

### Background Messages
- Ditangani oleh service worker (`firebase-messaging-sw.js`)
- Otomatis menampilkan notifikasi browser
- Tidak memerlukan aplikasi terbuka

### Foreground Messages  
- Ditangani oleh aplikasi utama (`main.ts`)
- Menampilkan notifikasi custom menggunakan `useNotification`
- Hanya bekerja saat aplikasi terbuka

## Troubleshooting

### Notifikasi tidak muncul:
1. Pastikan service worker terdaftar (check console)
2. Pastikan permission granted (check browser settings)
3. Pastikan Firebase config benar
4. Pastikan VAPID key benar

### Service worker error:
1. Check console untuk error messages
2. Pastikan file `firebase-messaging-sw.js` accessible
3. Pastikan Firebase config valid

### Permission denied:
1. Reset notification permission di browser
2. Reload halaman dan allow permission
3. Check browser notification settings
