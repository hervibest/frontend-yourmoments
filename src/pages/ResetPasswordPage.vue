<template>
  <div class="reset-password-page">
    <div class="reset-password-container">
      <div class="reset-password-header">
        <h1 class="reset-password-title">Reset Password</h1>
        <p class="reset-password-subtitle">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <BaseForm
        :is-loading="userStore.isLoading"
        :error="userStore.getError"
        @submit="handleRequestReset"
      >
        <BaseInput
          v-model="form.email"
          name="email"
          type="email"
          label="Email Address"
          placeholder="Enter your email address"
          :error="errors.email"
          required
          @blur="validateField('email')"
        />

        <div class="form-actions">
          <BaseButton
            type="submit"
            variant="primary"
            size="lg"
            :is-loading="userStore.isLoading"
            loading-text="Sending reset link..."
            full-width
          >
            Send Reset Link
          </BaseButton>
        </div>

        <div class="reset-password-links">
          <router-link to="/login" class="link">
            Back to Sign In
          </router-link>
        </div>
      </BaseForm>

      <!-- Success Message -->
      <div v-if="resetRequested" class="success-message">
        <div class="success-icon">✓</div>
        <h3>Reset Link Sent</h3>
        <p>
          We've sent a password reset link to <strong>{{ form.email }}</strong>.
          Please check your email and follow the instructions to reset your password.
        </p>
        <BaseButton
          variant="secondary"
          @click="resetRequested = false"
        >
          Send Another Link
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useUserStore } from '../stores/user';
import BaseForm from '../components/BaseForm.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseButton from '../components/BaseButton.vue';
import { ValidationUtils } from '../utils/validation';

const userStore = useUserStore();

// Form state
const form = reactive({
  email: '',
});

const errors = reactive<Record<string, string>>({});
const resetRequested = ref(false);

// Validation
const validateField = (field: string) => {
  const error = ValidationUtils.validateEmail(form.email);
  
  if (error) {
    errors[field] = error;
  } else {
    delete errors[field];
  }
};

const validateForm = (): boolean => {
  const emailError = ValidationUtils.validateEmail(form.email);
  
  if (emailError) {
    errors.email = emailError;
    return false;
  }
  
  delete errors.email;
  return true;
};

// Form submission
const handleRequestReset = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    await userStore.requestResetPassword(form.email);
    resetRequested.value = true;
  } catch (error) {
    console.error('Password reset request failed:', error);
  }
};
</script>

<style scoped>
.reset-password-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.reset-password-container {
  width: 100%;
  max-width: 400px;
}

.reset-password-header {
  text-align: center;
  margin-bottom: 2rem;
}

.reset-password-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.reset-password-subtitle {
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.5;
}

.form-actions {
  margin: 2rem 0;
}

.reset-password-links {
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

.success-message {
  text-align: center;
  padding: 2rem;
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  margin-top: 2rem;
}

.success-icon {
  width: 4rem;
  height: 4rem;
  background: #10b981;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 auto 1rem;
}

.success-message h3 {
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.success-message p {
  color: #6b7280;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}
</style>
