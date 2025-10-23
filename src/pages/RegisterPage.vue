<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-header">
        <h1 class="register-title">Create Account</h1>
        <p class="register-subtitle">Join us today</p>
      </div>

      <BaseForm
        :is-loading="userStore.isLoading"
        :error="userStore.getError"
        @submit="handleRegister"
      >
        <BaseInput
          v-model="form.username"
          name="username"
          label="Username"
          placeholder="Choose a username"
          :error="errors.username"
          required
          help-text="3-20 characters, letters and numbers only"
          @blur="validateField('username')"
        />

        <BaseInput
          v-model="form.email"
          name="email"
          type="email"
          label="Email Address"
          placeholder="Enter your email"
          :error="errors.email"
          required
          @blur="validateField('email')"
        />

        <BaseInput
          v-model="form.password"
          name="password"
          type="password"
          label="Password"
          placeholder="Create a strong password"
          :error="errors.password"
          required
          help-text="At least 8 characters with uppercase, lowercase, number and special character"
          @blur="validateField('password')"
        />

        <BaseInput
          v-model="form.birth_date"
          name="birth_date"
          type="date"
          label="Birth Date"
          :error="errors.birth_date"
          required
          @blur="validateField('birth_date')"
        />

        <div class="form-actions">
          <BaseButton
            type="submit"
            variant="primary"
            size="lg"
            :is-loading="userStore.isLoading"
            loading-text="Creating account..."
            full-width
          >
            Create Account
          </BaseButton>
        </div>

        <div class="register-links">
          <router-link to="/login" class="link">
            Already have an account? Sign in
          </router-link>
        </div>
      </BaseForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import BaseForm from '../components/BaseForm.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseButton from '../components/BaseButton.vue';
import { ValidationUtils } from '../utils/validation';
import { RegisterByEmailRequest } from '../types/apiContracts';

const router = useRouter();
const userStore = useUserStore();

// Form state
const form = reactive<RegisterByEmailRequest>({
  username: '',
  email: '',
  password: '',
  birth_date: '',
});

const errors = reactive<Record<string, string>>({});

// Validation
const validateField = (field: keyof RegisterByEmailRequest) => {
  const rules = ValidationUtils.getRegistrationRules();
  const error = ValidationUtils.validateField(form[field], rules[field]);
  
  if (error) {
    errors[field] = error;
  } else {
    delete errors[field];
  }
};

const validateForm = (): boolean => {
  const rules = ValidationUtils.getRegistrationRules();
  const validationErrors = ValidationUtils.validateForm(form, rules);
  
  Object.assign(errors, validationErrors);
  return Object.keys(validationErrors).length === 0;
};

// Form submission
const handleRegister = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    await userStore.registerByEmail(form);
    router.push('/login');
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.register-container {
  width: 100%;
  max-width: 400px;
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.register-subtitle {
  color: #6b7280;
  font-size: 1rem;
}

.form-actions {
  margin: 2rem 0;
}

.register-links {
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
</style>
