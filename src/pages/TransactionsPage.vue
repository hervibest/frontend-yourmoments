<template>
  <div class="transactions-page">
    <div class="container">
      <div class="header">
        <h1>Riwayat Pembelian</h1>
        <p class="subtitle">Lihat semua transaksi pembelian foto Anda</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Memuat transaksi...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Gagal Memuat Transaksi</h3>
        <p>{{ error }}</p>
        <BaseButton
          variant="primary"
          size="medium"
          @click="loadTransactions"
        >
          Coba Lagi
        </BaseButton>
      </div>

      <!-- Transactions List -->
      <div v-else-if="transactions.length > 0" class="transactions-section">
        <div class="transactions-grid">
          <div 
            v-for="transaction in transactions" 
            :key="transaction.id"
            class="transaction-card"
            @click="viewTransactionDetail(transaction.id)"
          >
            <div class="transaction-header">
              <h3 class="transaction-id">#{{ transaction.id.slice(-8) }}</h3>
              <span 
                class="status-badge"
                :class="getStatusClass(transaction.status)"
              >
                {{ getStatusText(transaction.status) }}
              </span>
            </div>

            <div class="transaction-details">
              <div class="detail-row">
                <span class="detail-label">Total Pembayaran:</span>
                <span class="detail-value amount">{{ formatCurrency(transaction.amount) }}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Tanggal Checkout:</span>
                <span class="detail-value">{{ formatDate(transaction.checkout_at) }}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Tanggal Pembayaran:</span>
                <span class="detail-value">{{ formatDate(transaction.payment_at) }}</span>
              </div>
            </div>

            <div class="transaction-actions">
              <BaseButton
                variant="secondary"
                size="small"
                @click.stop="viewTransactionDetail(transaction.id)"
              >
                Lihat Detail
              </BaseButton>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination && pagination.total_page > 1" class="pagination">
          <BaseButton
            variant="secondary"
            size="medium"
            :disabled="!pagination.has_previous"
            @click="loadTransactions(pagination.page - 1)"
          >
            Sebelumnya
          </BaseButton>
          
          <span class="pagination-info">
            Halaman {{ pagination.page }} dari {{ pagination.total_page }}
          </span>
          
          <BaseButton
            variant="secondary"
            size="medium"
            :disabled="!pagination.has_next"
            @click="loadTransactions(pagination.page + 1)"
          >
            Selanjutnya
          </BaseButton>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">🛒</div>
        <h3>Belum Ada Transaksi</h3>
        <p>Anda belum melakukan pembelian foto apapun. Mulai jelajahi foto-foto menarik!</p>
        <BaseButton
          variant="primary"
          size="large"
          @click="goToExplore"
        >
          Jelajahi Foto
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { apiService } from '../services/api';
import { ApiException } from '../services/api';
import { useNotification } from '../composables/useNotification';
import BaseButton from '../components/BaseButton.vue';
import type { Transaction, Pagination } from '../types/apiContracts';

const router = useRouter();
const userStore = useUserStore();
const { showError } = useNotification();

// Reactive data
const transactions = ref<Transaction[]>([]);
const pagination = ref<Pagination | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

// Methods
const loadTransactions = async (page: number = 1) => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const response = await apiService.transaction.getTransactions({ 
      page, 
      size: 10 
    });
    
    transactions.value = response.data || [];
    pagination.value = response.pagination;
  } catch (err: any) {
    error.value = err.message || 'Gagal memuat transaksi';
    showError(
      'Gagal Memuat Transaksi',
      err.message || 'Terjadi kesalahan saat memuat data transaksi',
      5000
    );
  } finally {
    isLoading.value = false;
  }
};

const viewTransactionDetail = (transactionId: string) => {
  router.push(`/transactions/${transactionId}`);
};

const goToExplore = () => {
  router.push('/explore');
};

const getStatusClass = (status: string): string => {
  switch (status) {
    case 'SUCCESS':
      return 'success';
    case 'PENDING':
      return 'pending';
    case 'FAILED':
      return 'failed';
    case 'CANCELLED':
      return 'cancelled';
    default:
      return 'unknown';
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

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Initialize
onMounted(() => {
  // Check if user is authenticated
  if (!userStore.isLoggedIn) {
    router.push('/login');
    return;
  }
  
  loadTransactions();
});
</script>

<style scoped>
.transactions-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
  color: white;
}

.header h1 {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.25rem;
  opacity: 0.9;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon,
.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.transactions-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.transactions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.transaction-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.transaction-card:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.transaction-id {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.success {
  background: #dcfce7;
  color: #166534;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.failed {
  background: #fee2e2;
  color: #dc2626;
}

.status-badge.cancelled {
  background: #f3f4f6;
  color: #6b7280;
}

.transaction-details {
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.detail-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.detail-value {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 600;
}

.detail-value.amount {
  color: #059669;
  font-weight: 700;
}

.transaction-actions {
  display: flex;
  justify-content: flex-end;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

@media (max-width: 768px) {
  .transactions-grid {
    grid-template-columns: 1fr;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .transaction-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .pagination {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
