<template>
  <div class="transaction-detail-page">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <BaseButton
          variant="secondary"
          size="md"
          @click="goBack"
        >
          ← Kembali
        </BaseButton>
        <h1>Detail Transaksi</h1>
        <p class="subtitle">Informasi lengkap pembelian foto Anda</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Memuat detail transaksi...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Gagal Memuat Detail</h3>
        <p>{{ error }}</p>
        <BaseButton
          variant="primary"
          size="md"
          @click="loadTransactionDetail"
        >
          Coba Lagi
        </BaseButton>
      </div>

      <!-- Transaction Detail -->
      <div v-else-if="transaction" class="transaction-detail">
        <!-- Transaction Info -->
        <div class="transaction-info">
          <div class="info-header">
            <h2>Informasi Transaksi</h2>
            <span 
              class="status-badge"
              :class="getStatusClass(transaction.status)"
            >
              {{ getStatusText(transaction.status) }}
            </span>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">ID Transaksi:</span>
              <span class="info-value">{{ transaction.transaction_id }}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">Total Pembayaran:</span>
              <span class="info-value amount">{{ formatCurrency(transaction.amount) }}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">Tanggal Checkout:</span>
              <span class="info-value">{{ formatDate(transaction.checkout_at) }}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">Tanggal Pembayaran:</span>
              <span class="info-value">{{ formatDate(transaction.payment_at) }}</span>
            </div>
          </div>
        </div>

        <!-- Photos Purchased -->
        <div class="photos-section">
          <h2>Foto yang Dibeli</h2>
          
          <div v-for="(detail, index) in transaction.transaction_detail_response" :key="detail.transaction_detail_id" class="creator-section">
            <div class="creator-header">
              <h3>Creator {{ index + 1 }}</h3>
              <span class="creator-id">ID: {{ detail.creator_id }}</span>
            </div>

            <div class="photos-grid">
              <div 
                v-for="photo in detail.photos" 
                :key="photo.photo_id"
                class="photo-card"
              >
                <div class="photo-image">
                  <img 
                    :src="photo.url" 
                    :alt="photo.title"
                    @error="handleImageError"
                  />
                </div>
                
                <div class="photo-info">
                  <h4 class="photo-title">{{ photo.title }}</h4>
                  <p class="photo-description">{{ photo.description }}</p>
                  
                  <div class="photo-details">
                    <div class="detail-row">
                      <span class="detail-label">Harga:</span>
                      <span class="detail-value">{{ formatCurrency(photo.price) }}</span>
                    </div>
                    
                    <div v-if="photo.discount.Valid" class="detail-row">
                      <span class="detail-label">Diskon:</span>
                      <span class="detail-value discount">-{{ formatCurrency(photo.discount.Int32) }}</span>
                    </div>
                    
                    <div class="detail-row">
                      <span class="detail-label">Harga Final:</span>
                      <span class="detail-value final-price">{{ formatCurrency(photo.final_price) }}</span>
                    </div>
                    
                    <div class="detail-row">
                      <span class="detail-label">Ukuran File:</span>
                      <span class="detail-value">{{ formatFileSize(photo.size) }}</span>
                    </div>
                    
                    <div class="detail-row">
                      <span class="detail-label">Dimensi:</span>
                      <span class="detail-value">{{ photo.width }} × {{ photo.height }}</span>
                    </div>
                  </div>

                  <div class="photo-actions">
                    <BaseButton
                      variant="primary"
                      size="sm"
                      @click="downloadPhoto(photo)"
                    >
                      Download
                    </BaseButton>
                    
                    <BaseButton
                      variant="secondary"
                      size="sm"
                      @click="viewPhoto(photo)"
                    >
                      Lihat Detail
                    </BaseButton>
                    
                    <!-- Review Button for Users -->
                    <BaseButton
                      v-if="!isCreator && !detail.is_reviewed"
                      variant="success"
                      size="sm"
                      @click="openReviewModal(detail.transaction_detail_id, detail.creator_id)"
                    >
                      Beri Review
                    </BaseButton>
                    
                    <!-- Review Status for Users -->
                    <div v-if="!isCreator && detail.is_reviewed" class="review-status">
                      <span class="reviewed-badge">✓ Sudah Direview</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Reviews Section for Creators -->
        <div v-if="isCreator" class="reviews-section">
          <h2>Review dari Pembeli</h2>
          
          <div v-if="reviewsLoading" class="loading-state">
            <div class="spinner"></div>
            <p>Memuat review...</p>
          </div>
          
          <div v-else-if="reviewsError" class="error-state">
            <div class="error-icon">⚠️</div>
            <h3>Gagal Memuat Review</h3>
            <p>{{ reviewsError }}</p>
            <BaseButton
              variant="primary"
              size="md"
              @click="loadReviews"
            >
              Coba Lagi
            </BaseButton>
          </div>
          
          <div v-else-if="currentUserReviews.length > 0" class="reviews-list">
            <div 
              v-for="review in currentUserReviews" 
              :key="review.Id"
              class="review-card"
            >
              <div class="review-header">
                <div class="review-rating">
                  <span class="rating-stars">
                    <span v-for="star in 5" :key="star" class="star" :class="{ active: star <= review.Rating }">
                      ⭐
                    </span>
                  </span>
                  <span class="rating-number">{{ review.Rating }}/5</span>
                </div>
                <div class="review-date">
                  {{ formatDate(review.CreatedAt) }}
                </div>
              </div>
              
              <div class="review-comment">
                <p>{{ review.Comment }}</p>
              </div>
            </div>
          </div>
          
          <div v-else class="empty-reviews">
            <div class="empty-icon">💬</div>
            <h3>Belum Ada Review</h3>
            <p>Review dari pembeli akan muncul di sini.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Review Modal -->
    <ReviewModal
      v-if="showReviewModal"
      :is-open="showReviewModal"
      :transaction-detail-id="selectedTransactionDetail || ''"
      :creator-id="selectedCreatorId || ''"
      @close="closeReviewModal"
      @success="handleReviewSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../stores/user';
import { apiService } from '../services/api';
import { ApiException } from '../services/api';
import { useNotification } from '../composables/useNotification';
import BaseButton from '../components/BaseButton.vue';
import ReviewModal from '../components/ReviewModal.vue';
import type { TransactionDetailResponse, TransactionPhoto, Review } from '../types/apiContracts';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const { showSuccess, showError } = useNotification();

// Reactive data
const transaction = ref<TransactionDetailResponse | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

// Review modal state
const showReviewModal = ref(false);
const selectedTransactionDetail = ref<string | null>(null);
const selectedCreatorId = ref<string | null>(null);

// Reviews for creators
const reviews = ref<Review[]>([]);
const reviewsLoading = ref(false);
const reviewsError = ref<string | null>(null);

// Computed
const isCreator = computed(() => {
  if (!transaction.value || !userStore.currentUser) return false;
  return transaction.value.transaction_detail_response.some(
    detail => detail.creator_id === userStore.currentUser?.id
  );
});

const currentUserReviews = computed(() => {
  if (!isCreator.value || !userStore.currentUser) return [];
  return reviews.value.filter(review => review.CreatorId === userStore.currentUser?.id);
});

// Methods
const loadTransactionDetail = async () => {
  const transactionId = route.params.id as string;
  
  if (!transactionId) {
    error.value = 'ID transaksi tidak valid';
    return;
  }

  isLoading.value = true;
  error.value = null;
  
  try {
    const response = await apiService.transaction.getTransactionDetail(transactionId);
    transaction.value = response.data;
  } catch (err: any) {
    error.value = err.message || 'Gagal memuat detail transaksi';
    showError(
      'Gagal Memuat Detail',
      err.message || 'Terjadi kesalahan saat memuat detail transaksi',
      5000
    );
  } finally {
    isLoading.value = false;
  }
};

const goBack = () => {
  router.back();
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

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = '/placeholder-image.jpg'; // Fallback image
};

const downloadPhoto = (photo: TransactionPhoto) => {
  // Create download link
  const link = document.createElement('a');
  link.href = photo.url;
  link.download = photo.file_name;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showSuccess(
    'Download Dimulai',
    `Foto "${photo.title}" sedang didownload`,
    3000
  );
};

const viewPhoto = (photo: TransactionPhoto) => {
  // Open photo in new tab
  window.open(photo.url, '_blank');
};

// Review methods
const openReviewModal = (transactionDetailId: string, creatorId: string) => {
  selectedTransactionDetail.value = transactionDetailId;
  selectedCreatorId.value = creatorId;
  showReviewModal.value = true;
};

const closeReviewModal = () => {
  showReviewModal.value = false;
  selectedTransactionDetail.value = null;
  selectedCreatorId.value = null;
};

const handleReviewSuccess = () => {
  // Reload transaction detail to update is_reviewed status
  loadTransactionDetail();
  showSuccess(
    'Review Berhasil',
    'Terima kasih atas review Anda!',
    3000
  );
};

const loadReviews = async () => {
  if (!isCreator.value) return;
  
  reviewsLoading.value = true;
  reviewsError.value = null;
  
  try {
    const response = await apiService.transaction.getReviews();
    reviews.value = response.data || [];
  } catch (err: any) {
    reviewsError.value = err.message || 'Gagal memuat review';
    console.error('Error loading reviews:', err);
  } finally {
    reviewsLoading.value = false;
  }
};

// Initialize
onMounted(() => {
  // Check if user is authenticated
  if (!userStore.isLoggedIn) {
    router.push('/login');
    return;
  }
  
  loadTransactionDetail();
  loadReviews();
});
</script>

<style scoped>
.transaction-detail-page {
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
  margin-bottom: 2rem;
  color: white;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 1rem 0 0.5rem 0;
}

.subtitle {
  font-size: 1.125rem;
  opacity: 0.9;
  margin: 0;
}

.loading-state,
.error-state {
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

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.transaction-detail {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.transaction-info,
.photos-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.info-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-size: 0.875rem;
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

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.info-value {
  font-size: 1rem;
  color: #374151;
  font-weight: 600;
}

.info-value.amount {
  color: #059669;
  font-weight: 700;
  font-size: 1.125rem;
}

.photos-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1.5rem 0;
}

.creator-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
}

.creator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.creator-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.creator-id {
  font-size: 0.875rem;
  color: #6b7280;
  font-family: monospace;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.photo-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.photo-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.photo-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-info {
  padding: 1rem;
}

.photo-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.photo-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

.photo-details {
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.detail-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.detail-value {
  font-size: 0.75rem;
  color: #374151;
  font-weight: 600;
}

.detail-value.discount {
  color: #dc2626;
}

.detail-value.final-price {
  color: #059669;
  font-weight: 700;
}

.photo-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 2rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .photos-grid {
    grid-template-columns: 1fr;
  }
  
  .creator-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .photo-actions {
    flex-direction: column;
  }
}

/* Review Styles */
.review-status {
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
}

.reviewed-badge {
  background: #dcfce7;
  color: #166534;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.reviews-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
}

.reviews-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1.5rem 0;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.review-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.review-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rating-stars {
  display: flex;
  gap: 0.125rem;
}

.star {
  font-size: 1rem;
  filter: grayscale(100%);
  transition: filter 0.2s;
}

.star.active {
  filter: grayscale(0%);
}

.rating-number {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.review-date {
  font-size: 0.75rem;
  color: #6b7280;
}

.review-comment p {
  margin: 0;
  color: #374151;
  line-height: 1.5;
}

.empty-reviews {
  text-align: center;
  padding: 3rem 2rem;
  color: #6b7280;
}

.empty-reviews .empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-reviews h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.empty-reviews p {
  margin: 0;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .review-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .reviews-section {
    padding: 1rem;
  }
}
</style>
