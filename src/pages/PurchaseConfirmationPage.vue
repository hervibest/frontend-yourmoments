<template>
  <div class="purchase-confirmation-page">
    <div class="container">
      <div class="header">
        <h1>Konfirmasi Pembelian</h1>
        <p class="subtitle">Tinjau pesanan Anda sebelum melanjutkan pembayaran</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Memproses pembelian...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Gagal Memproses Pembelian</h3>
        <p>{{ error }}</p>
        <BaseButton
          variant="primary"
          size="medium"
          @click="retryPurchase"
        >
          Coba Lagi
        </BaseButton>
      </div>

      <!-- Success State -->
      <div v-else-if="purchaseSuccess" class="success-state">
        <div class="success-icon">✅</div>
        <h2>Pembelian Berhasil!</h2>
        <p>Transaksi Anda telah berhasil diproses. Anda akan diarahkan ke halaman transaksi.</p>
        <div class="success-actions">
          <BaseButton
            variant="primary"
            size="large"
            @click="goToTransactions"
          >
            Lihat Transaksi
          </BaseButton>
          
          <BaseButton
            variant="secondary"
            size="large"
            @click="goToExplore"
          >
            Jelajahi Foto Lain
          </BaseButton>
        </div>
      </div>

      <!-- Purchase Form -->
      <div v-else class="purchase-form">
        <BaseForm 
          :isLoading="isProcessing" 
          :error="formError"
          @submit="handlePurchase"
        >
          <div class="form-content">
            <!-- Order Summary -->
            <div class="order-summary">
              <h2>Ringkasan Pesanan</h2>
              
              <div class="summary-items">
                <div 
                  v-for="item in purchaseData.items" 
                  :key="item.photo_id"
                  class="summary-item"
                >
                  <div class="item-image">
                    <img 
                      :src="getPhotoThumbnail(item.photo_id)" 
                      :alt="item.title"
                      @error="handleImageError"
                    />
                  </div>
                  
                  <div class="item-details">
                    <h3 class="item-title">{{ item.title }}</h3>
                    <p class="item-creator">Creator: {{ item.creator_id }}</p>
                    
                    <div class="item-pricing">
                      <div class="price-row">
                        <span class="price-label">Harga:</span>
                        <span class="price-value">{{ formatCurrency(item.price) }}</span>
                      </div>
                      
                      <div v-if="item.discount" class="price-row">
                        <span class="price-label">Diskon:</span>
                        <span class="price-value discount">-{{ formatCurrency(item.discount.amount) }}</span>
                      </div>
                      
                      <div class="price-row final">
                        <span class="price-label">Total:</span>
                        <span class="price-value final-price">{{ formatCurrency(item.final_price) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="order-total">
                <div class="total-row">
                  <span class="total-label">Subtotal:</span>
                  <span class="total-value">{{ formatCurrency(purchaseData.total_price + purchaseData.total_discount) }}</span>
                </div>
                
                <div v-if="purchaseData.total_discount > 0" class="total-row">
                  <span class="total-label">Diskon:</span>
                  <span class="total-value discount">-{{ formatCurrency(purchaseData.total_discount) }}</span>
                </div>
                
                <div class="total-row final">
                  <span class="total-label">Total Pembayaran:</span>
                  <span class="total-value final-price">{{ formatCurrency(purchaseData.total_price) }}</span>
                </div>
              </div>
            </div>

            <!-- Payment Method -->
            <div class="payment-method">
              <h2>Metode Pembayaran</h2>
              <div class="payment-options">
                <label class="payment-option">
                  <input 
                    type="radio" 
                    v-model="selectedPaymentMethod" 
                    value="credit_card"
                    name="payment_method"
                  />
                  <span class="payment-label">
                    <i class="icon-credit-card"></i>
                    Kartu Kredit
                  </span>
                </label>
                
                <label class="payment-option">
                  <input 
                    type="radio" 
                    v-model="selectedPaymentMethod" 
                    value="bank_transfer"
                    name="payment_method"
                  />
                  <span class="payment-label">
                    <i class="icon-bank"></i>
                    Transfer Bank
                  </span>
                </label>
                
                <label class="payment-option">
                  <input 
                    type="radio" 
                    v-model="selectedPaymentMethod" 
                    value="ewallet"
                    name="payment_method"
                  />
                  <span class="payment-label">
                    <i class="icon-wallet"></i>
                    E-Wallet
                  </span>
                </label>
              </div>
            </div>

            <!-- Terms and Conditions -->
            <div class="terms-section">
              <label class="terms-checkbox">
                <input 
                  type="checkbox" 
                  v-model="agreeToTerms"
                  required
                />
                <span class="terms-text">
                  Saya menyetujui 
                  <a href="#" @click.prevent="showTerms">Syarat dan Ketentuan</a> 
                  serta 
                  <a href="#" @click.prevent="showPrivacy">Kebijakan Privasi</a>
                </span>
              </label>
            </div>

            <!-- Submit Button -->
            <div class="form-actions">
              <BaseButton
                type="submit"
                variant="primary"
                size="large"
                :disabled="!canProceed || isProcessing"
              >
                {{ isProcessing ? 'Memproses...' : `Bayar ${formatCurrency(purchaseData.total_price)}` }}
              </BaseButton>
              
              <BaseButton
                type="button"
                variant="secondary"
                size="large"
                @click="goBack"
              >
                Batal
              </BaseButton>
            </div>
          </div>
        </BaseForm>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../stores/user';
import { apiService } from '../services/api';
import { ApiException } from '../services/api';
import { useNotification } from '../composables/useNotification';
import BaseForm from '../components/BaseForm.vue';
import BaseButton from '../components/BaseButton.vue';
import type { CreateTransactionRequest, TransactionItem } from '../types/apiContracts';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const { showSuccess, showError } = useNotification();

// Reactive data
const purchaseData = ref<CreateTransactionRequest>({
  items: [],
  total_price: 0,
  total_discount: 0,
});

const selectedPaymentMethod = ref('credit_card');
const agreeToTerms = ref(false);
const isProcessing = ref(false);
const isLoading = ref(false);
const isPurchaseSuccess = ref(false);
const error = ref<string | null>(null);
const formError = ref<string | null>(null);

// Computed
const canProceed = computed(() => {
  return agreeToTerms.value && selectedPaymentMethod.value && purchaseData.value.items.length > 0;
});

// Methods
const loadPurchaseData = () => {
  // Get purchase data from route params or localStorage
  const data = route.query.data as string;
  if (data) {
    try {
      purchaseData.value = JSON.parse(decodeURIComponent(data));
    } catch (err) {
      error.value = 'Data pembelian tidak valid';
    }
  } else {
    // Fallback to localStorage or redirect to checkout
    router.push('/checkout');
  }
};

const handlePurchase = async () => {
  if (!canProceed.value) {
    formError.value = 'Silakan lengkapi semua field yang diperlukan';
    return;
  }

  isProcessing.value = true;
  formError.value = null;
  
  try {
    await apiService.transaction.createTransaction(purchaseData.value);
    
    isPurchaseSuccess.value = true;
    showSuccess(
      'Pembelian Berhasil!',
      'Transaksi Anda telah berhasil diproses.',
      5000
    );
    
    // Clear cart after successful purchase
    // await apiService.photo.clearCart(); // If this endpoint exists
    
  } catch (err: any) {
    let errorMessage = 'Terjadi kesalahan saat memproses pembelian. Silakan coba lagi.';
    
    if (err instanceof ApiException) {
      errorMessage = err.message;
    }
    
    formError.value = errorMessage;
    showError(
      'Pembelian Gagal',
      errorMessage,
      6000
    );
  } finally {
    isProcessing.value = false;
  }
};

const retryPurchase = () => {
  error.value = null;
  isPurchaseSuccess.value = false;
};

const goBack = () => {
  router.back();
};

const goToTransactions = () => {
  router.push('/transactions');
};

const goToExplore = () => {
  router.push('/explore');
};

const getPhotoThumbnail = (photoId: string): string => {
  // This would typically come from the photo service
  // For now, return a placeholder
  return `https://via.placeholder.com/150x150?text=Photo+${photoId.slice(-4)}`;
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = '/placeholder-image.jpg';
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const showTerms = () => {
  // Open terms and conditions modal or page
  console.log('Show terms and conditions');
};

const showPrivacy = () => {
  // Open privacy policy modal or page
  console.log('Show privacy policy');
};

// Initialize
onMounted(() => {
  // Check if user is authenticated
  if (!userStore.isLoggedIn) {
    router.push('/login');
    return;
  }
  
  loadPurchaseData();
});
</script>

<style scoped>
.purchase-confirmation-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 0;
}

.container {
  max-width: 800px;
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
.success-state {
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
.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.success-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.purchase-form {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.order-summary,
.payment-method {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
}

.order-summary h2,
.payment-method h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.summary-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
}

.item-image {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex: 1;
}

.item-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.25rem 0;
}

.item-creator {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
}

.item-pricing {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.price-value {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 600;
}

.price-value.discount {
  color: #dc2626;
}

.price-row.final .price-value {
  color: #059669;
  font-weight: 700;
}

.order-total {
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.total-label {
  font-size: 1rem;
  color: #374151;
  font-weight: 500;
}

.total-value {
  font-size: 1rem;
  color: #374151;
  font-weight: 600;
}

.total-value.discount {
  color: #dc2626;
}

.total-row.final .total-value {
  color: #059669;
  font-weight: 700;
  font-size: 1.125rem;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-option:hover {
  border-color: #3b82f6;
  background: #f8faff;
}

.payment-option input[type="radio"] {
  margin: 0;
}

.payment-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.terms-section {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.terms-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
}

.terms-text {
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.4;
}

.terms-text a {
  color: #3b82f6;
  text-decoration: underline;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 2rem;
  }
  
  .summary-item {
    flex-direction: column;
  }
  
  .item-image {
    width: 100%;
    height: 120px;
  }
  
  .success-actions {
    flex-direction: column;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
