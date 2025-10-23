<template>
  <div class="checkout-failure-page">
    <div class="container">
      <div class="failure-content">
        <div class="failure-icon">❌</div>
        <h1 class="failure-title">Payment Failed</h1>
        <p class="failure-message">
          We're sorry, but your payment could not be processed. Please try again or contact support if the problem persists.
        </p>
        
        <div class="failure-details" v-if="transactionId">
          <div class="detail-item">
            <span class="detail-label">Transaction ID:</span>
            <span class="detail-value">{{ transactionId }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Status:</span>
            <span class="detail-value status-badge status-failed">Failed</span>
          </div>
        </div>
        
        <div class="failure-actions">
          <button @click="retryPayment" class="btn btn-primary">
            <i class="icon-refresh"></i>
            Try Again
          </button>
          <router-link to="/explore" class="btn btn-outline">
            <i class="icon-grid"></i>
            Continue Shopping
          </router-link>
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Transaction data
const transactionId = ref<string>('');

const retryPayment = () => {
  // Go back to checkout page
  router.push('/checkout');
};

onMounted(() => {
  // Get transaction ID from localStorage if available
  const storedTransactionId = localStorage.getItem('transaction_id');
  if (storedTransactionId) {
    transactionId.value = storedTransactionId;
  }
});
</script>

<style scoped>
.checkout-failure-page {
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

.failure-content {
  background: white;
  border-radius: 1rem;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.failure-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.failure-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #dc3545;
  margin: 0 0 1rem 0;
}

.failure-message {
  font-size: 1.1rem;
  color: #6c757d;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

.failure-details {
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

.status-failed {
  background: #f8d7da;
  color: #721c24;
}

.failure-actions {
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

.btn-primary {
  background: #dc3545;
  color: white;
}

.btn-primary:hover {
  background: #c82333;
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

/* Responsive design */
@media (max-width: 768px) {
  .failure-content {
    padding: 2rem;
  }
  
  .failure-title {
    font-size: 2rem;
  }
  
  .failure-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
