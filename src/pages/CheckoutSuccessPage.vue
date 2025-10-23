<template>
  <div class="checkout-success-page">
    <div class="container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading transaction details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Oops! Something went wrong</h3>
        <p>{{ error }}</p>
        <button @click="loadTransactionDetails" class="btn btn-primary">Try Again</button>
      </div>

      <!-- Success Content -->
      <div v-else class="success-content">
        <div class="success-icon">✅</div>
        <h1 class="success-title">Payment Successful!</h1>
        <p class="success-message">
          Thank you for your purchase. Your photos have been processed and will be available for download shortly.
        </p>
        
        <div class="success-details">
          <div class="detail-item">
            <span class="detail-label">Transaction ID:</span>
            <span class="detail-value">{{ orderId }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Total Amount:</span>
            <span class="detail-value">{{ formatPrice(totalAmount) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Payment Method:</span>
            <span class="detail-value">{{ paymentMethod }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Status:</span>
            <span class="detail-value status-badge" :class="getStatusClass(transactionStatus)">
              {{ getStatusText(transactionStatus) }}
            </span>
          </div>
        </div>
        
        <div class="success-actions">
          <router-link to="/explore" class="btn btn-primary">
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
import { useRoute, useRouter } from 'vue-router';
import { apiService } from '../services/api';

const route = useRoute();
const router = useRouter();

// Transaction data
const orderId = ref<string>('');
const totalAmount = ref<number>(0);
const paymentMethod = ref<string>('Midtrans Payment');
const transactionStatus = ref<string>('PENDING');
const loading = ref<boolean>(true);
const error = ref<string | null>(null);

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price);
};

const getStatusClass = (status: string): string => {
  switch (status) {
    case 'SUCCESS':
      return 'status-success';
    case 'PENDING':
      return 'status-pending';
    case 'FAILED':
      return 'status-failed';
    case 'CANCELLED':
      return 'status-cancelled';
    default:
      return 'status-unknown';
  }
};

const getStatusText = (status: string): string => {
  switch (status) {
    case 'SUCCESS':
      return 'Berhasil';
    case 'PENDING':
      return 'Menunggu';
    case 'FAILED':
      return 'Gagal';
    case 'CANCELLED':
      return 'Dibatalkan';
    default:
      return 'Tidak Diketahui';
  }
};

const loadTransactionDetails = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // Get transaction ID from localStorage (set during checkout)
    const transactionId = localStorage.getItem('transaction_id');
    
    if (!transactionId) {
      throw new Error('Transaction ID not found');
    }
    
    orderId.value = transactionId;
    
    // Fetch transaction details from API
    const response = await apiService.transaction.getTransactionDetail(transactionId);
    
    if (response.success && response.data) {
      totalAmount.value = response.data.amount;
      transactionStatus.value = response.data.status;
      
      // Clear stored transaction data
      localStorage.removeItem('transaction_id');
      localStorage.removeItem('snap_token');
    } else {
      throw new Error('Failed to load transaction details');
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load transaction details';
    console.error('Error loading transaction details:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadTransactionDetails();
});
</script>

<style scoped>
.checkout-success-page {
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

.success-content {
  background: white;
  border-radius: 1rem;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.success-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1rem 0;
}

.success-message {
  font-size: 1.1rem;
  color: #6c757d;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

.success-details {
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

.success-actions {
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
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
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

/* Loading and Error States */
.loading-state,
.error-state {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #dc3545;
  margin: 0 0 0.5rem 0;
}

.error-state p {
  color: #6c757d;
  margin: 0 0 1.5rem 0;
}

/* Status Badges */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-success {
  background: #d4edda;
  color: #155724;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-failed {
  background: #f8d7da;
  color: #721c24;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.status-unknown {
  background: #e2e3e5;
  color: #383d41;
}

/* Responsive design */
@media (max-width: 768px) {
  .success-content {
    padding: 2rem;
  }
  
  .success-title {
    font-size: 2rem;
  }
  
  .success-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
