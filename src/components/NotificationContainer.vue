<template>
  <div class="notification-container">
    <NotificationPopup
      v-for="notification in notifications"
      :key="notification.id"
      :visible="true"
      :type="notification.type"
      :title="notification.title"
      :message="notification.message"
      :duration="0"
      @close="removeNotification(notification.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { useNotification } from '../composables/useNotification';
import NotificationPopup from './NotificationPopup.vue';

const { notifications, removeNotification } = useNotification();
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1000;
  pointer-events: none;
}

.notification-container > * {
  pointer-events: auto;
  margin-bottom: 1rem;
}
</style>
