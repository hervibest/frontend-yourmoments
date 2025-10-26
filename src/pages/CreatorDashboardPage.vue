<template>
  <div class="creator-dashboard">
    <div class="container">
      <div class="header">
        <h1>Creator Dashboard</h1>
        <p class="subtitle">Manage your content and uploads</p>
      </div>

      <div class="dashboard-content">
        <!-- Upload Options -->
        <div class="upload-section">
          <h2>Upload Content</h2>
          <div class="upload-options">
            <div class="upload-card">
              <div class="upload-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3>Single Photo</h3>
              <p>Upload a single high-quality photo</p>
              <BaseButton
                variant="primary"
                size="lg"
                @click="goToSingleUpload"
              >
                Upload Single Photo
              </BaseButton>
            </div>

            <div class="upload-card">
              <div class="upload-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3>Bulk Photos</h3>
              <p>Upload multiple photos at once</p>
              <BaseButton
                variant="primary"
                size="lg"
                @click="goToBulkUpload"
              >
                Upload Multiple Photos
              </BaseButton>
            </div>

            <div class="upload-card">
              <div class="upload-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3>Facecam Photo</h3>
              <p>Upload your facecam for better matching</p>
              <BaseButton
                variant="secondary"
                size="lg"
                @click="goToFacecamUpload"
              >
                Upload Facecam
              </BaseButton>
            </div>
          </div>
        </div>

        <!-- Wallet Balance -->
        <div class="wallet-section">
          <h2>Wallet Balance</h2>
          <div class="wallet-card">
            <div class="wallet-icon">💰</div>
            <div class="wallet-info">
              <h3>Current Balance</h3>
              <p class="wallet-amount">{{ formatCurrency(wallet?.balance || 0) }}</p>
              <p class="wallet-updated">Last updated: {{ formatDate(wallet?.updated_at) }}</p>
            </div>
            <div class="wallet-actions">
              <BaseButton
                variant="primary"
                size="md"
                @click="goToWallet"
              >
                Manage Wallet
              </BaseButton>
            </div>
          </div>
        </div>

        <!-- Creator Stats -->
        <div class="stats-section">
          <h2>Your Stats</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="stat-content">
                <h3>Photos Uploaded</h3>
                <p class="stat-number">{{ stats.photosUploaded || 0 }}</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div class="stat-content">
                <h3>Total Earnings</h3>
                <p class="stat-number">IDR {{ formatCurrency(stats.totalEarnings || 0) }}</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div class="stat-content">
                <h3>Favorites</h3>
                <p class="stat-number">{{ stats.favorites || 0 }}</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div class="stat-content">
                <h3>Views</h3>
                <p class="stat-number">{{ stats.views || 0 }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Discounts Management -->
        <div class="discounts-section">
          <div class="section-header">
            <h2>Discount Management</h2>
            <BaseButton
              variant="primary"
              size="md"
              @click="showCreateDiscountModal = true"
            >
              Create New Discount
            </BaseButton>
          </div>

          <!-- Loading State -->
          <div v-if="discountsLoading" class="loading-state">
            <div class="spinner"></div>
            <p>Loading discounts...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="discountsError" class="error-state">
            <div class="error-icon">⚠️</div>
            <h3>Failed to load discounts</h3>
            <p>{{ discountsError }}</p>
            <BaseButton
              variant="secondary"
              size="md"
              @click="loadDiscounts"
            >
              Try Again
            </BaseButton>
          </div>

          <!-- Discounts List -->
          <div v-else-if="discounts.length > 0" class="discounts-grid">
            <div 
              v-for="discount in discounts" 
              :key="discount.id"
              class="discount-card"
              :class="{ inactive: !discount.is_active }"
            >
              <div class="discount-header">
                <h3 class="discount-name">{{ discount.name }}</h3>
                <span 
                  class="status-badge"
                  :class="{ active: discount.is_active, inactive: !discount.is_active }"
                >
                  {{ discount.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>

              <div class="discount-details">
                <div class="detail-row">
                  <span class="detail-label">Type:</span>
                  <span class="detail-value">{{ discount.discount_type }}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Value:</span>
                  <span class="detail-value">
                    {{ discount.discount_type === 'PERCENT' ? `${discount.value}%` : formatPrice(discount.value) }}
                  </span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Min Quantity:</span>
                  <span class="detail-value">{{ discount.min_quantity }} photos</span>
                </div>
              </div>

              <div class="discount-actions">
                <BaseButton
                  variant="secondary"
                  size="sm"
                  @click="toggleDiscountStatus(discount)"
                >
                  {{ discount.is_active ? 'Deactivate' : 'Activate' }}
                </BaseButton>
                
                <BaseButton
                  variant="secondary"
                  size="sm"
                  @click="editDiscount(discount)"
                >
                  Edit
                </BaseButton>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state">
            <div class="empty-icon">🎯</div>
            <h3>No discounts created yet</h3>
            <p>Create your first discount to attract more customers to your photos.</p>
            <BaseButton
              variant="primary"
              size="md"
              @click="showCreateDiscountModal = true"
            >
              Create First Discount
            </BaseButton>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="actions-section">
          <h2>Quick Actions</h2>
          <div class="action-buttons">
            <BaseButton
              variant="secondary"
              size="lg"
              @click="goToProfile"
            >
              Edit Profile
            </BaseButton>
            
            <BaseButton
              variant="secondary"
              size="lg"
              @click="goToReviews"
            >
              View Reviews
            </BaseButton>
            
            <BaseButton
              variant="secondary"
              size="lg"
              @click="goToWallet"
            >
              Manage Wallet
            </BaseButton>
            
            <BaseButton
              variant="secondary"
              size="lg"
              @click="goToExplore"
            >
              Browse Photos
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Discount Modal -->
    <DiscountModal
      v-if="showCreateDiscountModal || editingDiscount"
      :discount="editingDiscount"
      @close="closeDiscountModal"
      @save="handleSaveDiscount"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { apiService } from '../services/api';
import BaseButton from '../components/BaseButton.vue';
import DiscountModal from '../components/DiscountModal.vue';
import type { Discount, Wallet } from '../types/apiContracts';

const router = useRouter();
const userStore = useUserStore();

// Stats data
const stats = ref({
  photosUploaded: 0,
  totalEarnings: 0,
  favorites: 0,
  views: 0,
});

// Wallet data
const wallet = ref<Wallet | null>(null);
const walletLoading = ref(false);
const walletError = ref<string | null>(null);

// Discounts data
const discounts = ref<Discount[]>([]);
const discountsLoading = ref(false);
const discountsError = ref<string | null>(null);
const showCreateDiscountModal = ref(false);
const editingDiscount = ref<Discount | null>(null);

// Methods
const goToSingleUpload = () => {
  router.push('/upload/single');
};

const goToBulkUpload = () => {
  router.push('/upload/bulk');
};

const goToFacecamUpload = () => {
  router.push('/upload/facecam');
};

// Discount methods
const loadDiscounts = async () => {
  discountsLoading.value = true;
  discountsError.value = null;
  
  try {
    const response = await apiService.photo.getDiscounts();
    discounts.value = response.data || [];
  } catch (err: any) {
    discountsError.value = err.message || 'Failed to load discounts';
    console.error('Error loading discounts:', err);
  } finally {
    discountsLoading.value = false;
  }
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price);
};

const toggleDiscountStatus = async (discount: Discount) => {
  try {
    if (discount.is_active) {
      await apiService.photo.deactivateDiscount(discount.id);
    } else {
      await apiService.photo.activateDiscount(discount.id);
    }
    
    // Update local state
    discount.is_active = !discount.is_active;
  } catch (err: any) {
    console.error('Error toggling discount status:', err);
    // You might want to show a toast notification here
  }
};

const editDiscount = (discount: Discount) => {
  editingDiscount.value = { ...discount };
  showCreateDiscountModal.value = true;
};

const handleSaveDiscount = async (discountData: any) => {
  try {
    if (editingDiscount.value) {
      // Update existing discount
      // Note: Update endpoint might need to be implemented
      console.log('Update discount:', discountData);
    } else {
      // Create new discount
      await apiService.photo.createDiscount(discountData);
    }
    
    // Reload discounts
    await loadDiscounts();
    closeDiscountModal();
  } catch (err: any) {
    console.error('Error saving discount:', err);
    // You might want to show a toast notification here
  }
};

const closeDiscountModal = () => {
  showCreateDiscountModal.value = false;
  editingDiscount.value = null;
};

const goToProfile = () => {
  router.push('/profile');
};

const goToReviews = () => {
  router.push('/creator/reviews');
};

const goToWallet = () => {
  router.push('/creator/wallet');
};

const goToExplore = () => {
  router.push('/explore');
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Never updated';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    return 'Invalid date';
  }
};

const loadWallet = async () => {
  walletLoading.value = true;
  walletError.value = null;
  
  try {
    const response = await apiService.transaction.getWallet();
    wallet.value = response.data || null;
  } catch (err: any) {
    walletError.value = err.message || 'Failed to load wallet';
    console.error('Error loading wallet:', err);
  } finally {
    walletLoading.value = false;
  }
};

const loadStats = async () => {
  // TODO: Implement API calls to get creator stats
  // For now, using mock data
  stats.value = {
    photosUploaded: 12,
    totalEarnings: 1500000,
    favorites: 45,
    views: 234,
  };
};

// Initialize
onMounted(() => {
  // Check if user is authenticated
  if (!userStore.isLoggedIn) {
    router.push('/login');
    return;
  }
  
  loadStats();
  loadWallet();
  loadDiscounts();
});
</script>

<style scoped>
.creator-dashboard {
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

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.upload-section,
.wallet-section,
.stats-section,
.discounts-section,
.actions-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.upload-section h2,
.wallet-section h2,
.stats-section h2,
.discounts-section h2,
.actions-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1.5rem;
}

.upload-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.upload-card {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: all 0.2s ease;
}

.upload-card:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.upload-icon {
  width: 3rem;
  height: 3rem;
  color: #3b82f6;
  margin: 0 auto 1rem;
}

.upload-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.upload-card p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.stat-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: #3b82f6;
  flex-shrink: 0;
}

.stat-content h3 {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
}

/* Wallet Styles */
.wallet-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 12px;
  color: white;
}

.wallet-icon {
  font-size: 3rem;
}

.wallet-info {
  flex: 1;
}

.wallet-info h3 {
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 0.5rem 0;
  opacity: 0.9;
}

.wallet-amount {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.wallet-updated {
  font-size: 0.875rem;
  opacity: 0.8;
  margin: 0;
}

.wallet-actions {
  display: flex;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .upload-options {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .header h1 {
    font-size: 2rem;
  }
}

/* Discounts Section Styles */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3b82f6;
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
  font-size: 3rem;
  margin-bottom: 1rem;
}

.discounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.discount-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  background: white;
  transition: all 0.2s ease;
}

.discount-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.discount-card.inactive {
  opacity: 0.6;
  background: #f9fafb;
}

.discount-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.discount-name {
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

.status-badge.active {
  background: #dcfce7;
  color: #166534;
}

.status-badge.inactive {
  background: #f3f4f6;
  color: #6b7280;
}

.discount-details {
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

.discount-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .discounts-grid {
    grid-template-columns: 1fr;
  }
  
  .discount-actions {
    flex-direction: column;
  }
}
</style>
