<template>
  <div class="verify-user-page">
    <div class="verify-user-container">
      <!-- Loading State -->
      <div v-if="isVerifying" class="verification-state">
        <div class="loading-spinner"></div>
        <h1 class="verification-title">Verifying Your Email</h1>
        <p class="verification-subtitle">
          Please wait while we verify your email address...
        </p>
      </div>

      <!-- Success State -->
      <div v-else-if="isVerified" class="verification-state">
        <div class="success-icon">✓</div>
        <h1 class="verification-title">Email Verified Successfully!</h1>
        <p class="verification-subtitle">
          Your email address <strong>{{ email }}</strong> has been verified.
          You can now sign in to your account.
        </p>
        <div class="form-actions">
          <BaseButton
            variant="primary"
            size="lg"
            full-width
            @click="goToLogin"
          >
            Go to Sign In
          </BaseButton>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="verification-state">
        <div class="error-icon">✕</div>
        <h1 class="verification-title">Verification Failed</h1>
        <p class="verification-subtitle error-text">
          {{ error }}
        </p>
        <div class="form-actions">
          <BaseButton
            variant="secondary"
            size="lg"
            full-width
            @click="goToLogin"
          >
            Go to Sign In
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import BaseButton from '../components/BaseButton.vue';
import { emailVerificationApi } from '../services/api';
import { VerifyEmailRequest } from '../types/apiContracts';

const router = useRouter();
const route = useRoute();

const isVerifying = ref(true);
const isVerified = ref(false);
const error = ref<string | null>(null);
const email = ref<string>('');

const verifyEmail = async () => {
  const token = route.params.token as string;
  const emailParam = route.query.email as string;

  if (!token) {
    error.value = 'Invalid verification link. Token is missing.';
    isVerifying.value = false;
    return;
  }

  if (!emailParam) {
    error.value = 'Invalid verification link. Email is missing.';
    isVerifying.value = false;
    return;
  }

  email.value = emailParam;

  try {
    const request: VerifyEmailRequest = {
      email: emailParam,
    };

    await emailVerificationApi.verifyEmail(token, request);
    isVerified.value = true;
  } catch (err: any) {
    console.error('Email verification failed:', err);
    error.value = err.message || 'Failed to verify email. The link may be expired or invalid.';
  } finally {
    isVerifying.value = false;
  }
};

const goToLogin = () => {
  router.push('/login');
};

onMounted(() => {
  verifyEmail();
});
</script>

<style scoped>
.verify-user-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.verify-user-container {
  width: 100%;
  max-width: 500px;
}

.verification-state {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.verification-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
  margin-top: 1.5rem;
}

.verification-subtitle {
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.verification-subtitle strong {
  color: #1f2937;
  font-weight: 600;
}

.verification-subtitle.error-text {
  color: #dc2626;
}

/* Loading Spinner */
.loading-spinner {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1.5rem;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Success Icon */
.success-icon {
  width: 4rem;
  height: 4rem;
  background: #10b981;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 auto 1.5rem;
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Error Icon */
.error-icon {
  width: 4rem;
  height: 4rem;
  background: #dc2626;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 auto 1.5rem;
  animation: scaleIn 0.3s ease-out;
}

.form-actions {
  margin-top: 2rem;
}
</style>

