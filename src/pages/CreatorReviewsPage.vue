<template>
  <div class="creator-reviews-page">
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
        <h1>Review Saya</h1>
        <p class="subtitle">Lihat semua review yang Anda terima dari pembeli</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Memuat review...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Gagal Memuat Review</h3>
        <p>{{ error }}</p>
            <BaseButton
              variant="primary"
              size="md"
              @click="loadReviews"
            >
              Coba Lagi
            </BaseButton>
      </div>

      <!-- Reviews Content -->
      <div v-else class="reviews-content">
        <!-- Stats Overview -->
        <div class="stats-overview">
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-content">
              <h3>Rating Rata-rata</h3>
              <p class="stat-number">{{ averageRating.toFixed(1) }}/5</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">💬</div>
            <div class="stat-content">
              <h3>Total Review</h3>
              <p class="stat-number">{{ reviews.length }}</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">🔥</div>
            <div class="stat-content">
              <h3>Review 5 Bintang</h3>
              <p class="stat-number">{{ fiveStarReviews }}</p>
            </div>
          </div>
        </div>

        <!-- Reviews List -->
        <div class="reviews-section">
          <div class="section-header">
            <h2>Semua Review</h2>
            <div class="filter-options">
              <select v-model="selectedFilter" class="filter-select">
                <option value="all">Semua Rating</option>
                <option value="5">5 Bintang</option>
                <option value="4">4 Bintang</option>
                <option value="3">3 Bintang</option>
                <option value="2">2 Bintang</option>
                <option value="1">1 Bintang</option>
              </select>
            </div>
          </div>

          <div v-if="filteredReviews.length > 0" class="reviews-list">
            <div 
              v-for="review in filteredReviews" 
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
              
              <div class="review-meta">
                <div class="transaction-info">
                  <span class="transaction-label">Transaction Detail ID:</span>
                  <span class="transaction-id">{{ review.TransactionDetailId }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="empty-reviews">
            <div class="empty-icon">💬</div>
            <h3>Belum Ada Review</h3>
            <p v-if="selectedFilter === 'all'">Review dari pembeli akan muncul di sini.</p>
            <p v-else>Tidak ada review dengan rating {{ selectedFilter }} bintang.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { apiService } from '../services/api';
import { useNotification } from '../composables/useNotification';
import BaseButton from '../components/BaseButton.vue';
import type { Review } from '../types/apiContracts';

const router = useRouter();
const userStore = useUserStore();
const { showSuccess, showError } = useNotification();

// Reactive data
const reviews = ref<Review[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const selectedFilter = ref('all');

// Computed
const filteredReviews = computed(() => {
  if (selectedFilter.value === 'all') {
    return reviews.value;
  }
  const rating = parseInt(selectedFilter.value);
  return reviews.value.filter(review => review.Rating === rating);
});

const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0;
  const total = reviews.value.reduce((sum, review) => sum + review.Rating, 0);
  return total / reviews.value.length;
});

const fiveStarReviews = computed(() => {
  return reviews.value.filter(review => review.Rating === 5).length;
});

// Methods
const loadReviews = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const response = await apiService.transaction.getReviews();
    reviews.value = response.data || [];
  } catch (err: any) {
    error.value = err.message || 'Gagal memuat review';
    showError(
      'Gagal Memuat Review',
      err.message || 'Terjadi kesalahan saat memuat review',
      5000
    );
  } finally {
    isLoading.value = false;
  }
};

const goBack = () => {
  router.back();
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
  
  loadReviews();
});
</script>

<style scoped>
.creator-reviews-page {
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

.reviews-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 50%;
}

.stat-content h3 {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
  font-weight: 500;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #374151;
  margin: 0;
}

.reviews-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.filter-options {
  display: flex;
  gap: 1rem;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  color: #374151;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
  transition: all 0.2s;
}

.review-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

.review-comment {
  margin-bottom: 1rem;
}

.review-comment p {
  margin: 0;
  color: #374151;
  line-height: 1.5;
  font-size: 0.875rem;
}

.review-meta {
  border-top: 1px solid #e5e7eb;
  padding-top: 0.75rem;
}

.transaction-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.transaction-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.transaction-id {
  font-size: 0.75rem;
  color: #374151;
  font-family: monospace;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
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
  .header h1 {
    font-size: 2rem;
  }
  
  .stats-overview {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .review-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .reviews-section {
    padding: 1rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
}
</style>
