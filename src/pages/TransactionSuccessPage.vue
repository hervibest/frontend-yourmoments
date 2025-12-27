<template>
  <div class="transaction-success-page">
    <div class="container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Memproses transaksi...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Terjadi Kesalahan</h3>
        <p>{{ error }}</p>
        <div class="error-actions">
          <button @click="handleRetry" class="btn btn-primary">Coba Lagi</button>
          <router-link to="/explore" class="btn btn-outline">Kembali ke Beranda</router-link>
        </div>
      </div>

      <!-- Success Content -->
      <div v-else class="success-content">
        <div class="success-icon">✅</div>
        <h1 class="success-title">Pembayaran Berhasil!</h1>
        <p class="success-message">
          Terima kasih atas pembelian Anda. Transaksi Anda telah berhasil diproses.
        </p>
        
        <div class="success-details" v-if="transactionData">
          <div class="detail-item" v-if="transactionData.orderId">
            <span class="detail-label">Order ID:</span>
            <span class="detail-value">{{ transactionData.orderId }}</span>
          </div>
          <div class="detail-item" v-if="transactionData.transactionId && transactionData.transactionId !== transactionData.orderId">
            <span class="detail-label">Transaction ID:</span>
            <span class="detail-value">{{ transactionData.transactionId }}</span>
          </div>
          <div class="detail-item" v-if="transactionData.totalAmount">
            <span class="detail-label">Total Pembayaran:</span>
            <span class="detail-value">{{ formatPrice(transactionData.totalAmount) }}</span>
          </div>
          <div class="detail-item" v-if="transactionData.paymentMethod">
            <span class="detail-label">Metode Pembayaran:</span>
            <span class="detail-value">{{ transactionData.paymentMethod }}</span>
          </div>
          <div class="detail-item" v-if="transactionData.statusCode">
            <span class="detail-label">Status Code:</span>
            <span class="detail-value">{{ transactionData.statusCode }}</span>
          </div>
          <div class="detail-item" v-if="transactionData.status">
            <span class="detail-label">Status Transaksi:</span>
            <span class="detail-value status-badge" :class="getStatusClass(transactionData.status)">
              {{ getStatusText(transactionData.status) }}
            </span>
          </div>
        </div>
        
        <div class="success-actions">
          <router-link to="/transactions" class="btn btn-primary">
            <i class="icon-list"></i>
            Lihat Transaksi
          </router-link>
          <router-link to="/explore" class="btn btn-outline">
            <i class="icon-grid"></i>
            Lanjutkan Berbelanja
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
import { handleMidtransReturn } from '../utils/midtrans';

const route = useRoute();
const router = useRouter();

// Transaction data
interface TransactionData {
  orderId?: string;
  transactionId?: string;
  totalAmount?: number;
  paymentMethod?: string;
  status?: string;
  statusCode?: string;
}

const transactionData = ref<TransactionData | null>(null);
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
  const statusLower = status.toLowerCase();
  if (statusLower === 'success' || statusLower === 'settlement') {
    return 'status-success';
  }
  if (statusLower === 'pending' || statusLower === 'challenge') {
    return 'status-pending';
  }
  if (statusLower === 'failure' || statusLower === 'deny' || statusLower === 'expire') {
    return 'status-failed';
  }
  if (statusLower === 'cancel') {
    return 'status-cancelled';
  }
  return 'status-unknown';
};

const getStatusText = (status: string): string => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'success':
    case 'settlement':
      return 'Berhasil';
    case 'pending':
    case 'challenge':
      return 'Menunggu';
    case 'failure':
    case 'deny':
      return 'Gagal';
    case 'expire':
      return 'Kedaluwarsa';
    case 'cancel':
      return 'Dibatalkan';
    default:
      return 'Tidak Diketahui';
  }
};

const loadTransactionDetails = async (transactionId: string, statusCode?: string) => {
  try {
    loading.value = true;
    error.value = null;
    
    // Fetch transaction details from API
    const response = await apiService.transaction.getTransactionDetail(transactionId);
    
    if (response.success && response.data) {
      // Get status_code from URL params if available
      const urlParams = new URLSearchParams(window.location.search);
      const statusCodeFromUrl = urlParams.get('status_code');
      
      transactionData.value = {
        orderId: response.data.transaction_id,
        transactionId: response.data.transaction_id,
        totalAmount: response.data.amount,
        paymentMethod: 'Midtrans Payment',
        status: response.data.status,
        statusCode: statusCodeFromUrl || statusCode || undefined
      };
    } else {
      throw new Error('Gagal memuat detail transaksi');
    }
  } catch (err: any) {
    console.error('Error loading transaction details:', err);
    // Don't set error if transaction ID is not found - just show success message
    if (err.status !== 404) {
      error.value = err.message || 'Gagal memuat detail transaksi';
    }
  } finally {
    loading.value = false;
  }
};

const handleRetry = () => {
  window.location.reload();
};

const processMidtransReturn = async () => {
  try {
    loading.value = true;
    
    // Get URL parameters from Midtrans redirect
    // Format: ?order_id=xxx&status_code=200&transaction_status=settlement
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');
    const transactionStatus = urlParams.get('transaction_status');
    const statusCode = urlParams.get('status_code');
    const transactionId = urlParams.get('transaction_id');
    
    console.log('Midtrans return parameters:', {
      orderId,
      transactionStatus,
      statusCode,
      transactionId,
      allParams: Object.fromEntries(urlParams.entries())
    });
    
    // Handle Midtrans return using utility
    // transaction_status can be: settlement, pending, cancel, deny, expire
    const returnData = handleMidtransReturn(transactionStatus || undefined);
    
    // Store transaction ID if available (use order_id as transaction_id)
    if (orderId || transactionId) {
      const idToStore = transactionId || orderId;
      if (idToStore) {
        localStorage.setItem('transaction_id', idToStore);
        console.log('Stored transaction ID:', idToStore);
      }
    }
    
    // If status is not success, redirect to appropriate page
    if (!returnData.success) {
      console.log('Payment not successful, redirecting to:', returnData.redirectUrl);
      router.push(returnData.redirectUrl);
      return;
    }
    
    // Try to load transaction details if we have an ID
    // Priority: transaction_id > order_id > localStorage
    if (orderId || transactionId) {
      const idToLoad = transactionId || orderId;
      if (idToLoad) {
        console.log('Loading transaction details for ID:', idToLoad);
        await loadTransactionDetails(idToLoad, statusCode || undefined);
      } else {
        // If no transaction ID, just show success message with URL params
        transactionData.value = {
          orderId: orderId || undefined,
          transactionId: transactionId || undefined,
          paymentMethod: 'Midtrans Payment',
          status: transactionStatus || 'settlement',
          statusCode: statusCode || undefined
        };
        loading.value = false;
      }
    } else {
      // If no transaction ID in URL, try to get from localStorage
      const storedTransactionId = localStorage.getItem('transaction_id');
      if (storedTransactionId) {
        console.log('Using stored transaction ID:', storedTransactionId);
        await loadTransactionDetails(storedTransactionId, statusCode || undefined);
      } else {
        // Show generic success message with status from URL
        console.log('No transaction ID found, showing generic success');
        transactionData.value = {
          paymentMethod: 'Midtrans Payment',
          status: transactionStatus || 'settlement',
          statusCode: statusCode || undefined
        };
        loading.value = false;
      }
    }
  } catch (err: any) {
    console.error('Error processing Midtrans return:', err);
    error.value = err.message || 'Terjadi kesalahan saat memproses transaksi';
    loading.value = false;
  }
};

onMounted(() => {
  processMidtransReturn();
});
</script>

<style scoped>
.transaction-success-page {
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

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 1.5rem;
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
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
  
  .success-actions,
  .error-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>

