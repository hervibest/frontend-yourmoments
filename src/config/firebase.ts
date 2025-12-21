import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging: any = null;

// Check if we're in a browser environment and service workers are supported
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.warn('Firebase messaging not available:', error);
  }
}

// VAPID key for FCM
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "";

export { messaging, VAPID_KEY };

// Function to get FCM token
export async function getFcmToken(): Promise<string | null> {
  if (!messaging) {
    console.warn('Firebase messaging not available');
    return null;
  }

  try {
    // Service worker should already be registered in main.ts
    // Just get the token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });
    
    if (token) {
      console.log('FCM Token obtained:', token);
      return token;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving token:', err);
    return null;
  }
}

// Function to request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('Notification permission denied');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// Function to set up message listener
export function setupMessageListener(callback: (payload: any) => void) {
  if (!messaging) {
    console.warn('Firebase messaging not available');
    return;
  }

  onMessage(messaging, (payload) => {
    console.log('Message received:', payload);
    callback(payload);
  });
}
