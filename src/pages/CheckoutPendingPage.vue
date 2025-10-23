<template>
  <div class="checkout-pending-page">
    <div class="container">
      <div class="pending-content">
        <div class="pending-icon">⏳</div>
        <h1 class="pending-title">Payment Pending</h1>
        <p class="pending-message">
          Your payment is being processed. Please wait while we confirm your transaction. You will be notified once the payment is completed.
        </p>
        
        <div class="pending-details" v-if="transactionId">
          <div class="detail-item">
            <span class="detail-label">Transaction ID:</span>
            <span class="detail-value">{{ transactionId }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Status:</span>
            <span class="detail-value status-badge status-pending">Pending</span>
          </div>
        </div>
        
        <div class="pending-actions">
          <button @click="checkStatus" class="btn btn-primary" :disabled="checking">
            <i v-if="checking" class="icon-spinner spinning"></i>
            <i v-else class="icon-refresh"></i>
            {{ checking ? 'Checking...' : 'Check Status' }}
          </button>
          <router-link to="/transactions" class="btn btn-outline">
            <i class="icon-list"></i>
            View Transactions
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { apiService } from '../services/api';

const router = useRouter();

// Transaction data
const transactionId = ref<string>('');
const checking = ref<boolean>(false);

const checkStatus = async () => {
  if (!transactionId.value) return;
  
  checking.value = true;
  
  try {
    const response = await apiService.transaction.getTransactionDetail(transactionId.value);
    
    if (response.success && response.data) {
      const status = response.data.status;
      
      // Redirect based on status
      switch (status) {
        case 'SUCCESS':
          router.push('/checkout/success');
          break;
        case 'FAILED':
          router.push('/checkout/failure');
          break;
        case 'PENDING':
          // Stay on pending page
          break;
        default:
          console.log('Unknown status:', status);
      }
    }
  } catch (error) {
    console.error('Error checking transaction status:', error);
  } finally {
    checking.value = false;
  }
};

onMounted(() => {
  // Get transaction ID from localStorage if available
  const storedTransactionId = localStorage.getItem('transaction_id');
  if (storedTransactionId) {
    transactionId.value = storedTransactionId;
  }
  
  // Auto-check status every 30 seconds
  const interval = setInterval(() => {
    if (transactionId.value) {
      checkStatus();
    }
  }, 30000);
  
  // Cleanup interval on unmount
  onUnmounted(() => {
    clearInterval(interval);
  });
});
</script>

<style scoped>
.checkout-pending-page {
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.container {
  max-width: 600px;
  width: 100%;
}

.pending-content {
  background: white;
  border-radius: 1rem;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pending-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.pending-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffc107;
  margin: 0 0 1rem 0;
}

.pending-message {
  font-size: 1.1rem;
  color: #6c757d;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

.pending-details {
  background: #f8f9fa;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-weight: 500;
  color: #6c757d;
}

.detail-value {
  font-weight: 600;
  color: #2c3e50;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.pending-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #ffc107;
  color: #212529;
}

.btn-primary:hover:not(:disabled) {
  background: #e0a800;
}

.btn-outline {
  background: transparent;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.btn-outline:hover {
  background: #f8f9fa;
  color: #495057;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive design */
@media (max-width: 768px) {
  .pending-content {
    padding: 2rem;
  }
  
  .pending-title {
    font-size: 2rem;
  }
  
  .pending-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
