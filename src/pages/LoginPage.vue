<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1 class="login-title">Welcome Back</h1>
        <p class="login-subtitle">Sign in to your account</p>
      </div>

      <BaseForm
        :is-loading="userStore.isLoading"
        :error="userStore.getError"
        @submit="handleLogin"
      >
        <BaseInput
          v-model="form.multiple_param"
          name="multiple_param"
          label="Email or Username"
          placeholder="Enter your email or username"
          :error="errors.multiple_param"
          required
          @blur="validateField('multiple_param')"
        />

        <BaseInput
          v-model="form.password"
          name="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          :error="errors.password"
          required
          @blur="validateField('password')"
        />

        <div class="form-actions">
          <BaseButton
            type="submit"
            variant="primary"
            size="lg"
            :is-loading="userStore.isLoading"
            loading-text="Signing in..."
            full-width
          >
            Sign In
          </BaseButton>
        </div>

        <div class="divider">
          <span class="divider-text">or</span>
        </div>

        <div class="google-login-section">
          <div 
            id="google-signin-button" 
            class="google-signin-container"
            v-if="isGoogleInitialized"
          ></div>
          <div v-else-if="isGoogleLoading" class="google-loading">
            Loading Google Sign-In...
          </div>
          <div v-else-if="googleError" class="google-error">
            {{ googleError }}
          </div>
        </div>

        <div class="login-links">
          <router-link to="/register" class="link">
            Don't have an account? Sign up
          </router-link>
          <router-link to="/reset-password" class="link">
            Forgot your password?
          </router-link>
        </div>
      </BaseForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import BaseForm from '../components/BaseForm.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseButton from '../components/BaseButton.vue';
import { ValidationUtils } from '../utils/validation';
import { LoginRequest, GoogleLoginRequest } from '../types/apiContracts';
import { useGoogleLogin } from '../composables/useGoogleLogin';

const router = useRouter();
const userStore = useUserStore();

// Google login setup
const {
  isGoogleLoaded,
  isGoogleInitialized,
  isLoading: isGoogleLoading,
  error: googleError,
  renderGoogleButton,
  handleCredentialResponse,
  initialize
} = useGoogleLogin();

// Form state
const form = reactive<LoginRequest>({
  multiple_param: '',
  password: '',
});

const errors = reactive<Record<string, string>>({});

// Validation
const validateField = (field: keyof LoginRequest) => {
  const rules = ValidationUtils.getLoginRules();
  const error = ValidationUtils.validateField(form[field], rules[field]);
  
  if (error) {
    errors[field] = error;
  } else {
    delete errors[field];
  }
};

const validateForm = (): boolean => {
  const rules = ValidationUtils.getLoginRules();
  const validationErrors = ValidationUtils.validateForm(form, rules);
  
  Object.assign(errors, validationErrors);
  return Object.keys(validationErrors).length === 0;
};

// Form submission
const handleLogin = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    console.log('Starting login process...');
    await userStore.login(form);
    console.log('Login API call completed');
    console.log('User store state:', {
      isAuthenticated: userStore.isAuthenticated,
      isLoggedIn: userStore.isLoggedIn,
      hasToken: !!userStore.token,
      hasUser: !!userStore.user,
      hasCurrentUser: !!userStore.currentUser
    });
    
    // Wait for Vue to update the reactive state
    await nextTick();
    console.log('After nextTick - User store state:', {
      isAuthenticated: userStore.isAuthenticated,
      isLoggedIn: userStore.isLoggedIn,
      hasToken: !!userStore.token
    });
    
    // Verify authentication state before redirect
    if (userStore.isLoggedIn) {
      console.log('User is authenticated, checking has_facecam');
      
      // Check if user has facecam, redirect to upload if not
      const hasFacecam = userStore.currentUser?.has_facecam;
      console.log('User has_facecam:', hasFacecam);
      
      if (hasFacecam === false) {
        console.log('User does not have facecam, redirecting to /upload/facecam');
        await router.replace('/upload/facecam');
      } else {
        console.log('User has facecam or status unknown, proceeding with redirect to /profile');
        await router.replace('/profile');
      }
      console.log('Router replace called');
    } else {
      console.error('User authentication state not updated properly');
      console.log('Current localStorage tokens:', {
        access_token: localStorage.getItem('access_token'),
        refresh_token: localStorage.getItem('refresh_token')
      });
      
      // Check if we have tokens in localStorage but store state is not updated
      const hasTokens = localStorage.getItem('access_token') && localStorage.getItem('refresh_token');
      if (hasTokens) {
        console.log('Found tokens in localStorage, forcing redirect');
        // Force redirect if we have tokens
        window.location.href = '/profile';
        return;
      }
      
      // Fallback: try redirect anyway after a short delay
      setTimeout(() => {
        console.log('Fallback check - User store state:', {
          isAuthenticated: userStore.isAuthenticated,
          isLoggedIn: userStore.isLoggedIn,
          hasToken: !!userStore.token
        });
        
        if (userStore.isLoggedIn) {
          console.log('Fallback: User is now authenticated, redirecting');
          router.replace('/profile');
        } else {
          console.error('Authentication state still not updated, please try again');
        }
      }, 500);
    }
  } catch (error) {
    console.error('Login failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  }
};

// Google login handler
const handleGoogleLogin = async (googleData: any) => {
  try {
    console.log('Starting Google login process...');
    const credentials: GoogleLoginRequest = {
      token: googleData.token,
      device_token: googleData.device_token,
      platform: googleData.platform
    };

    await userStore.googleLogin(credentials);
    console.log('Google login API call completed');
    
    // Wait for Vue to update the reactive state
    await nextTick();
    
    // Verify authentication state before redirect
    if (userStore.isLoggedIn) {
      console.log('User is authenticated via Google, checking has_facecam');
      
      // Check if user has facecam, redirect to upload if not
      const hasFacecam = userStore.currentUser?.has_facecam;
      console.log('User has_facecam:', hasFacecam);
      
      if (hasFacecam === false) {
        console.log('User does not have facecam, redirecting to /upload/facecam');
        await router.replace('/upload/facecam');
      } else {
        console.log('User has facecam or status unknown, proceeding with redirect to /profile');
        await router.replace('/profile');
      }
    } else {
      console.error('Google authentication state not updated properly');
    }
  } catch (error) {
    console.error('Google login failed:', error);
  }
};

// Setup Google login when component mounts
onMounted(async () => {
  try {
    // Initialize Google with custom callback that handles login
    await initialize(async (response) => {
      try {
        const googleData = await handleCredentialResponse(response);
        if (googleData) {
          await handleGoogleLogin(googleData);
        }
      } catch (error) {
        console.error('Google login error:', error);
      }
    });
    
    // Wait for the next tick to ensure DOM is ready
    await nextTick();
    
    // Wait a bit more for Google to be fully loaded and DOM to be ready
    let retryCount = 0;
    const maxRetries = 10;
    
    const renderButton = () => {
      retryCount++;
      console.log(`Attempt ${retryCount}/${maxRetries} to render Google button`);
      
      const buttonElement = document.getElementById('google-signin-button');
      console.log('Button element found:', !!buttonElement);
      console.log('Google initialized:', isGoogleInitialized.value);
      console.log('Google loaded:', isGoogleLoaded.value);
      
      if (buttonElement && isGoogleInitialized.value) {
        try {
          const success = renderGoogleButton('google-signin-button');
          if (success) {
            console.log('Google button rendered successfully!');
            return;
          } else if (retryCount < maxRetries) {
            console.log('Button rendering failed, retrying...');
            setTimeout(renderButton, 1000);
          } else {
            console.error('Max retries reached for Google button rendering');
          }
        } catch (error) {
          console.error('Failed to render Google button:', error);
          if (retryCount < maxRetries) {
            setTimeout(renderButton, 1000);
          }
        }
      } else if (retryCount < maxRetries) {
        console.warn(`Google button element not found or Google not initialized yet, retrying... (${retryCount}/${maxRetries})`);
        setTimeout(renderButton, 500);
      } else {
        console.error('Max retries reached - Google button could not be rendered');
      }
    };
    
    setTimeout(renderButton, 500);
  } catch (error) {
    console.error('Failed to initialize Google login:', error);
  }
});
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.login-subtitle {
  color: #6b7280;
  font-size: 1rem;
}

.form-actions {
  margin: 2rem 0;
}

.login-links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-align: center;
  margin-top: 1.5rem;
}

.link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.link:hover {
  color: #2563eb;
  text-decoration: underline;
}

.divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

.divider-text {
  padding: 0 1rem;
  color: #6b7280;
  font-size: 0.875rem;
  background: white;
}

.google-login-section {
  margin: 1rem 0;
}

.google-signin-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

.google-loading,
.google-error {
  text-align: center;
  padding: 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.google-loading {
  color: #6b7280;
  background: #f9fafb;
}

.google-error {
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
}
</style>
