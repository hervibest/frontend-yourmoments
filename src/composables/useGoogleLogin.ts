import { ref, onMounted, onUnmounted } from 'vue';
import { getFcmToken, requestNotificationPermission } from '../config/firebase';

// Google Sign-In configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export function useGoogleLogin() {
  const isGoogleLoaded = ref(false);
  const isGoogleInitialized = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Initialize Google Sign-In
  const initializeGoogle = (customCallback?: (response: GoogleCredentialResponse) => Promise<any>) => {
    console.log('Checking Google availability...');
    console.log('window.google:', !!window.google);
    console.log('window.google.accounts:', !!(window.google && window.google.accounts));
    console.log('GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID);
    
    if (!window.google || !window.google.accounts) {
      console.warn('Google Sign-In not available');
      return;
    }

    try {
      console.log('Initializing Google Sign-In with client ID:', GOOGLE_CLIENT_ID);
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: customCallback || handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: false, // Disable FedCM to avoid COOP issues
      });

      isGoogleInitialized.value = true;
      console.log('Google Sign-In initialized successfully');
    } catch (err) {
      console.error('Failed to initialize Google Sign-In:', err);
      error.value = 'Failed to initialize Google Sign-In';
    }
  };

  // Handle Google credential response
  const handleCredentialResponse = async (response: GoogleCredentialResponse) => {
    try {
      isLoading.value = true;
      error.value = null;

      // Decode the JWT token to get user info
      const userInfo = decodeJWT(response.credential);
      
      if (!userInfo) {
        throw new Error('Failed to decode Google credential');
      }

      // Request notification permission and get FCM token
      const hasPermission = await requestNotificationPermission();
      let deviceToken = null;
      
      if (hasPermission) {
        deviceToken = await getFcmToken();
        if (!deviceToken) {
          console.warn('Failed to get device token, continuing without notifications');
        }
      } else {
        console.warn('Notification permission denied, continuing without notifications');
      }

      // Determine platform
      const platform = getPlatform();

      // Return the data for the parent component to handle
      return {
        token: response.credential,
        device_token: deviceToken || 'no-token', // Provide fallback
        platform,
        user_info: userInfo
      };
    } catch (err) {
      console.error('Google login error:', err);
      error.value = err instanceof Error ? err.message : 'Google login failed';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Decode JWT token to get user information
  const decodeJWT = (token: string): GoogleUser | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const payload = JSON.parse(jsonPayload);
      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      };
    } catch (err) {
      console.error('Failed to decode JWT:', err);
      return null;
    }
  };

  // Get platform information
  const getPlatform = (): string => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Android')) {
      return 'ANDROID';
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      return 'IOS';
    } else {
      return 'WEB';
    }
  };

  // Render Google Sign-In button
  const renderGoogleButton = (elementId: string, options?: any) => {
    if (!isGoogleInitialized.value) {
      console.warn('Google Sign-In not initialized');
      return false;
    }

    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with id '${elementId}' not found`);
      return false;
    }

    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      console.error('Google Sign-In not available');
      return false;
    }

    try {
      window.google.accounts.id.renderButton(element, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        ...options
      });
      console.log('Google Sign-In button rendered successfully');
      return true;
    } catch (err) {
      console.error('Failed to render Google button:', err);
      error.value = 'Failed to render Google Sign-In button';
      return false;
    }
  };

  // Load Google Sign-In script
  const loadGoogleScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.accounts) {
        isGoogleLoaded.value = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        isGoogleLoaded.value = true;
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Sign-In script'));
      };

      document.head.appendChild(script);
    });
  };

  // Initialize everything
  const initialize = async (customCallback?: (response: GoogleCredentialResponse) => Promise<any>) => {
    try {
      console.log('Starting Google login initialization...');
      await loadGoogleScript();
      console.log('Google script loaded, initializing...');
      initializeGoogle(customCallback);
      console.log('Google initialization completed');
    } catch (err) {
      console.error('Failed to initialize Google login:', err);
      error.value = 'Failed to load Google Sign-In';
    }
  };

  // Cleanup
  const cleanup = () => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.cancel();
    }
  };

  // Auto-initialize on mount
  onMounted(() => {
    initialize();
  });

  // Cleanup on unmount
  onUnmounted(() => {
    cleanup();
  });

  return {
    isGoogleLoaded,
    isGoogleInitialized,
    isLoading,
    error,
    initialize,
    renderGoogleButton,
    handleCredentialResponse,
    cleanup
  };
}

// Extend Window interface for Google Sign-In
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement | null, options: any) => void;
          prompt: () => void;
          cancel: () => void;
        };
      };
    };
  }
}
