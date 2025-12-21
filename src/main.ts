import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router/index';
import { requestNotificationPermission, getFcmToken, setupMessageListener } from './config/firebase';
import { useNotification } from './composables/useNotification';

const app = createApp(App);

app.use(createPinia());
app.use(router);

// Register service worker and setup notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // Register service worker with absolute path
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/'
      });
      console.log('Service Worker registered successfully:', registration);
      
      // Request notification permission
      const hasPermission = await requestNotificationPermission();
      if (hasPermission) {
        console.log('Notification permission granted');
        
        // Get FCM token
        const token = await getFcmToken();
        if (token) {
          console.log('FCM Token:', token);
          // You can send this token to your backend to store it
        }
        
        // Setup message listener for foreground messages
        setupMessageListener((payload) => {
          console.log('Foreground message received:', payload);
          // Show notification using your custom notification system
          const { showInfo } = useNotification();
          showInfo(
            payload.notification?.title || 'New Notification',
            payload.notification?.body || 'You have a new message',
            5000
          );
        });
      } else {
        console.log('Notification permission denied');
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  });
}

app.mount('#app');
