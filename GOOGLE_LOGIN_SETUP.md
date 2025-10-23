# Google Login Setup Guide

This guide will help you set up Google login functionality with Firebase Cloud Messaging (FCM) in your Vue.js application.

## Prerequisites

1. A Google Cloud Console project
2. Firebase project linked to your Google Cloud project
3. Google OAuth 2.0 credentials

## Setup Steps

### 1. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Go to Project Settings > General
4. Scroll down to "Your apps" and add a web app
5. Copy the Firebase configuration

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Create OAuth 2.0 Client ID
4. **IMPORTANT**: Set authorized origins and redirect URIs for your domain:
   - **Authorized JavaScript origins**: 
     - `http://localhost:5173` (for development)
     - `http://localhost:3000` (if using different port)
     - `https://yourdomain.com` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:5173` (for development)
     - `https://yourdomain.com` (for production)

### 3. Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key

# Google Sign-In Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# API URLs (if different from defaults)
VITE_USER_SERVICE_URL=http://localhost:8003
VITE_PHOTO_SERVICE_URL=http://localhost:8081
VITE_UPLOAD_SERVICE_URL=http://localhost:8082
VITE_TRANSACTION_SERVICE_URL=http://localhost:8083
```

### 4. Firebase Cloud Messaging Setup

1. In Firebase Console, go to Project Settings > Cloud Messaging
2. Generate a new key pair for Web Push certificates
3. Copy the key pair and use it as `VITE_FIREBASE_VAPID_KEY`

### 5. Service Worker Configuration

The service worker file `public/firebase-messaging-sw.js` needs to be updated with your Firebase configuration. Replace the placeholder values with your actual Firebase config.

### 6. Backend API Endpoint

Make sure your backend has the following endpoint:

```
POST /api/user/register/google
```

Expected request body:
```json
{
  "token": "google_jwt_token",
  "device_token": "fcm_device_token",
  "platform": "WEB" | "ANDROID" | "IOS"
}
```

Expected response:
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "username": "username",
    "email": "user@example.com",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  },
  "token": {
    "access_token": "jwt_access_token",
    "refresh_token": "jwt_refresh_token"
  }
}
```

#### Device Token Creation
```
POST /api/user/device-token
```

Expected request body:
```json
{
  "device_token": "fcm_device_token",
  "platform": "WEB" | "ANDROID" | "IOS"
}
```

Expected response:
```json
{
  "success": true
}
```

## Features

- ✅ Google OAuth 2.0 authentication
- ✅ Firebase Cloud Messaging integration
- ✅ Device token generation for push notifications
- ✅ Platform detection (WEB/ANDROID/IOS)
- ✅ Automatic token refresh
- ✅ Error handling and user feedback
- ✅ Responsive design

## Usage

The Google login button will automatically appear on the login page once the configuration is complete. Users can click the button to sign in with their Google account.

## Troubleshooting

1. **"The given origin is not allowed for the given client ID"**: 
   - Go to Google Cloud Console > APIs & Services > Credentials
   - Edit your OAuth 2.0 Client ID
   - Add your current domain to "Authorized JavaScript origins"
   - For development: `http://localhost:5173` or `http://localhost:3000`
   - For production: `https://yourdomain.com`

2. **Google Sign-In not loading**: Check your `VITE_GOOGLE_CLIENT_ID` and ensure the domain is authorized

3. **FCM token not generated**: Check your Firebase configuration and VAPID key

4. **Service worker not registering**: Ensure the `firebase-messaging-sw.js` file is in the `public` directory

5. **API errors**: Check your backend endpoint and ensure it matches the expected format

6. **Cross-Origin-Opener-Policy errors**: This is usually related to the origin configuration above

## Security Notes

- Never commit your `.env` file to version control
- Use environment variables for all sensitive configuration
- Validate JWT tokens on the backend
- Implement proper error handling for failed authentications
