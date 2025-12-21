// Import Firebase scripts
try {
  importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');
} catch (error) {
  console.error('Failed to import Firebase scripts:', error);
  throw error;
}

// Initialize Firebase in the service worker
const firebaseConfig = {
  apiKey: "AIzaSyColFacl2s2v1p5zTTSqrb-1Fp2Dky3iR8",
  authDomain: "be-yourmoments.firebaseapp.com",
  databaseURL: "https://be-yourmoments-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "be-yourmoments",
  storageBucket: "be-yourmoments.appspot.com",
  messagingSenderId: "904914428041",
  appId: "1:904914428041:web:6c512785fec8734da0e658"
};

let messaging;
try {
  firebase.initializeApp(firebaseConfig);
  
  // Initialize Firebase Cloud Messaging
  messaging = firebase.messaging();
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  throw error;
}

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message',
    icon: payload.notification?.icon || '/favicon.ico',
    badge: '/favicon.ico',
    data: payload.data,
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    event.notification.close();
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});
