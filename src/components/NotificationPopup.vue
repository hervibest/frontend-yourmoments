<template>
  <Transition name="notification">
    <div v-if="visible" class="notification-popup" :class="type">
      <div class="notification-content">
        <div class="notification-icon">
          <svg v-if="type === 'success'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else-if="type === 'error'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <svg v-else-if="type === 'warning'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <div class="notification-text">
          <h4 class="notification-title">{{ title }}</h4>
          <p class="notification-message">{{ message }}</p>
        </div>
        
        <button @click="close" class="notification-close">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface Props {
  visible: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  duration: 5000,
});

const emit = defineEmits<{
  close: [];
}>();

let timeoutId: number | null = null;

const close = () => {
  emit('close');
};

onMounted(() => {
  if (props.duration > 0) {
    timeoutId = window.setTimeout(() => {
      close();
    }, props.duration);
  }
});

onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
});
</script>

<style scoped>
.notification-popup {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 1000;
  max-width: 400px;
  min-width: 300px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-left: 4px solid;
}

.notification-popup.success .notification-content {
  border-left-color: #10b981;
}

.notification-popup.error .notification-content {
  border-left-color: #ef4444;
}

.notification-popup.warning .notification-content {
  border-left-color: #f59e0b;
}

.notification-popup.info .notification-content {
  border-left-color: #3b82f6;
}

.notification-icon {
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.notification-popup.success .notification-icon {
  color: #10b981;
}

.notification-popup.error .notification-icon {
  color: #ef4444;
}

.notification-popup.warning .notification-icon {
  color: #f59e0b;
}

.notification-popup.info .notification-icon {
  color: #3b82f6;
}

.notification-text {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.25rem 0;
}

.notification-message {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.notification-close {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.notification-close:hover {
  color: #6b7280;
  background: #f3f4f6;
}

.notification-close svg {
  width: 1rem;
  height: 1rem;
}

/* Animations */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Responsive */
@media (max-width: 640px) {
  .notification-popup {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: none;
    min-width: auto;
  }
}
</style>
