<template>
  <button
    :type="type"
    :disabled="disabled || isLoading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <div v-if="isLoading" class="button-spinner"></div>
    <slot v-if="!isLoading" />
    <span v-if="isLoading && loadingText">{{ loadingText }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps } from 'vue';

interface Props {
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
}

interface Emits {
  (e: 'click', event: MouseEvent): void;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
  disabled: false,
  isLoading: false,
  fullWidth: false,
});

const emit = defineEmits<Emits>();

const buttonClasses = computed(() => [
  'base-button',
  `button-${props.variant}`,
  `button-${props.size}`,
  {
    'button-disabled': props.disabled,
    'button-loading': props.isLoading,
    'button-full-width': props.fullWidth,
  },
]);

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.isLoading) {
    emit('click', event);
  }
};
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.base-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Variants */
.button-primary {
  background-color: #3b82f6;
  color: white;
}

.button-primary:hover:not(.button-disabled):not(.button-loading) {
  background-color: #2563eb;
}

.button-secondary {
  background-color: #6b7280;
  color: white;
}

.button-secondary:hover:not(.button-disabled):not(.button-loading) {
  background-color: #4b5563;
}

.button-danger {
  background-color: #e53e3e;
  color: white;
}

.button-danger:hover:not(.button-disabled):not(.button-loading) {
  background-color: #c53030;
}

.button-success {
  background-color: #38a169;
  color: white;
}

.button-success:hover:not(.button-disabled):not(.button-loading) {
  background-color: #2f855a;
}

/* Sizes */
.button-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.button-md {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.button-lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

/* States */
.button-disabled {
  background-color: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

.button-loading {
  cursor: not-allowed;
}

.button-full-width {
  width: 100%;
}

.button-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
