import { ref, reactive } from 'vue';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

const notifications = ref<Notification[]>([]);

export const useNotification = () => {
  const showNotification = (
    type: Notification['type'],
    title: string,
    message: string,
    duration: number = 5000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration,
    };
    
    notifications.value.push(notification);
    
    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    
    return id;
  };

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  };

  const showSuccess = (title: string, message: string, duration?: number) => {
    return showNotification('success', title, message, duration);
  };

  const showError = (title: string, message: string, duration?: number) => {
    return showNotification('error', title, message, duration);
  };

  const showWarning = (title: string, message: string, duration?: number) => {
    return showNotification('warning', title, message, duration);
  };

  const showInfo = (title: string, message: string, duration?: number) => {
    return showNotification('info', title, message, duration);
  };

  return {
    notifications,
    showNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
