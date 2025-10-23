<template>
  <form @submit.prevent="handleSubmit" class="base-form">
    <slot />
    
    <!-- Error Display -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps } from 'vue';

interface Props {
  isLoading?: boolean;
  error?: string | null;
}

interface Emits {
  (e: 'submit', data: any): void;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  error: null,
});

const emit = defineEmits<Emits>();

const handleSubmit = (event: Event) => {
  const formData = new FormData(event.target as HTMLFormElement);
  const data = Object.fromEntries(formData.entries());
  emit('submit', data);
};
</script>

<style scoped>
.base-form {
  position: relative;
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid #fcc;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
