<template>
  <div class="checkout-page">
    <div class="container">
      <!-- Header -->
      <header class="checkout-header">
        <h1 class="page-title">Checkout</h1>
        <p class="page-subtitle">Review your order and complete your purchase</p>
      </header>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading checkout details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Oops! Something went wrong</h3>
        <p>{{ error }}</p>
        <button @click="loadCheckoutPreview" class="btn btn-primary">Try Again</button>
      </div>

      <!-- Checkout Content -->
      <div v-else-if="checkoutData" class="checkout-content">
        <div class="checkout-grid">
          <!-- Order Summary -->
          <div class="order-summary">
            <h2 class="section-title">Order Summary</h2>
            
            <div class="items-list">
              <div 
                v-for="item in checkoutData.items" 
                :key="item.photo_id"
                class="order-item"
              >
                <div class="item-image">
                  <img 
                    :src="getItemImageUrl(item)" 
                    :alt="item.title"
                    class="item-photo"
                    @error="handleImageError"
                    loading="lazy"
                  />
                </div>
                
                <div class="item-details">
                  <h3 class="item-title">{{ item.title }}</h3>
                  <p class="item-creator">Creator: {{ item.creator_id }}</p>
                  
                  <div class="item-pricing">
                    <div class="price-row">
                      <span class="price-label">Original Price:</span>
                      <span class="price-value">{{ formatPrice(item.price) }}</span>
                    </div>
                    
                    <div v-if="item.discount && item.discount.amount > 0" class="price-row discount-row">
                      <span class="price-label">Discount ({{ item.discount.name }}):</span>
                      <span class="price-value discount-value">-{{ formatPrice(item.discount.amount) }}</span>
                    </div>
                    
                    <div class="price-row total-row">
                      <span class="price-label">Final Price:</span>
                      <span class="price-value final-price">{{ formatPrice(item.final_price) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="order-totals">
              <div class="total-row">
                <span class="total-label">Subtotal:</span>
                <span class="total-value">{{ formatPrice(checkoutData.total_price) }}</span>
              </div>
              
              <div v-if="checkoutData.total_discount > 0" class="total-row discount-total">
                <span class="total-label">Total Discount:</span>
                <span class="total-value discount-total-value">-{{ formatPrice(checkoutData.total_discount) }}</span>
              </div>
              
              <div class="total-row grand-total">
                <span class="total-label">Total:</span>
                <span class="total-value grand-total-value">{{ formatPrice(getGrandTotal()) }}</span>
              </div>
            </div>
          </div>

          <!-- Payment Form -->
          <div class="payment-section">
            <h2 class="section-title">Payment Information</h2>
            
            <form @submit.prevent="processPayment" class="payment-form">
              <!-- Payment Method Selection -->
              <div class="form-group">
                <label class="form-label">Payment Method</label>
                <div class="payment-methods">
                  <label 
                    v-for="method in paymentMethods" 
                    :key="method.id"
                    class="payment-method"
                    :class="{ active: selectedPaymentMethod === method.id }"
                  >
                    <input 
                      type="radio" 
                      :value="method.id"
                      v-model="selectedPaymentMethod"
                      class="payment-radio"
                    />
                    <div class="payment-option">
                      <i :class="method.icon"></i>
                      <span>{{ method.name }}</span>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Credit Card Form (if selected) -->
              <div v-if="selectedPaymentMethod === 'credit_card'" class="credit-card-form">
                <div class="form-group">
                  <label class="form-label">Card Number</label>
                  <input 
                    type="text" 
                    v-model="paymentForm.cardNumber"
                    placeholder="1234 5678 9012 3456"
                    class="form-input"
                    maxlength="19"
                    @input="formatCardNumber"
                  />
                </div>
                
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Expiry Date</label>
                    <input 
                      type="text" 
                      v-model="paymentForm.expiryDate"
                      placeholder="MM/YY"
                      class="form-input"
                      maxlength="5"
                      @input="formatExpiryDate"
                    />
                  </div>
                  
                  <div class="form-group">
                    <label class="form-label">CVV</label>
                    <input 
                      type="text" 
                      v-model="paymentForm.cvv"
                      placeholder="123"
                      class="form-input"
                      maxlength="4"
                    />
                  </div>
                </div>
                
                <div class="form-group">
                  <label class="form-label">Cardholder Name</label>
                  <input 
                    type="text" 
                    v-model="paymentForm.cardholderName"
                    placeholder="John Doe"
                    class="form-input"
                  />
                </div>
              </div>

              <!-- Bank Transfer Form (if selected) -->
              <div v-if="selectedPaymentMethod === 'bank_transfer'" class="bank-transfer-info">
                <div class="bank-details">
                  <h3>Bank Transfer Details</h3>
                  <div class="bank-info">
                    <div class="info-row">
                      <span class="info-label">Bank Name:</span>
                      <span class="info-value">Bank Central Asia (BCA)</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Account Number:</span>
                      <span class="info-value">1234567890</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Account Holder:</span>
                      <span class="info-value">Fotoyu Platform</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Amount:</span>
                      <span class="info-value">{{ formatPrice(getGrandTotal()) }}</span>
                    </div>
                  </div>
                  <p class="transfer-note">
                    Please include your order reference in the transfer description.
                  </p>
                </div>
              </div>

              <!-- E-Wallet Form (if selected) -->
              <div v-if="selectedPaymentMethod === 'ewallet'" class="ewallet-form">
                <div class="form-group">
                  <label class="form-label">E-Wallet Provider</label>
                  <select v-model="paymentForm.ewalletProvider" class="form-select">
                    <option value="">Select E-Wallet</option>
                    <option value="gopay">GoPay</option>
                    <option value="ovo">OVO</option>
                    <option value="dana">DANA</option>
                    <option value="linkaja">LinkAja</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label class="form-label">Phone Number</label>
                  <input 
                    type="tel" 
                    v-model="paymentForm.phoneNumber"
                    placeholder="08123456789"
                    class="form-input"
                  />
                </div>
              </div>

              <!-- Terms and Conditions -->
              <div class="form-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    v-model="paymentForm.agreeTerms"
                    class="form-checkbox"
                  />
                  <span class="checkbox-text">
                    I agree to the <a href="#" class="link">Terms and Conditions</a> and <a href="#" class="link">Privacy Policy</a>
                  </span>
                </label>
              </div>

              <!-- Submit Button -->
              <button 
                type="submit" 
                :disabled="!isFormValid || processing"
                class="btn btn-primary btn-large"
              >
                <i v-if="processing" class="icon-spinner spinning"></i>
                <i v-else class="icon-checkout"></i>
                {{ processing ? 'Processing...' : `Pay ${formatPrice(getGrandTotal())}` }}
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Empty Cart State -->
      <div v-else class="empty-cart">
        <div class="empty-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add some photos to your cart to proceed with checkout.</p>
        <router-link to="/explore" class="btn btn-primary">Browse Photos</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { apiService } from '../services/api';
import { redirectToMidtrans } from '../utils/midtrans';
import type { CheckoutPreviewData } from '../types/apiContracts';

const router = useRouter();

// Reactive data
const checkoutData = ref<CheckoutPreviewData | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const processing = ref(false);

// Request tracking
let requestCount = 0;
const maxRequests = 10; // Safety limit

// Debouncing mechanism
let formValidationTimeout: NodeJS.Timeout | null = null;

// Payment form data
const selectedPaymentMethod = ref('credit_card');
const paymentForm = ref({
  cardNumber: '',
  expiryDate: '',
  cvv: '',
  cardholderName: '',
  ewalletProvider: '',
  phoneNumber: '',
  agreeTerms: false
});

// Payment methods
const paymentMethods = [
  { id: 'credit_card', name: 'Credit Card', icon: 'icon-credit-card' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: 'icon-bank' },
  { id: 'ewallet', name: 'E-Wallet', icon: 'icon-wallet' }
];

// Computed properties - Optimized to prevent unnecessary re-computations
const isFormValid = computed(() => {
  // Clear existing timeout
  if (formValidationTimeout) {
    clearTimeout(formValidationTimeout);
  }
  
  // Debounce the validation
  formValidationTimeout = setTimeout(() => {
    console.log('📝 Computing form validity (debounced)');
  }, 100);
  
  if (!paymentForm.value.agreeTerms) return false;
  
  switch (selectedPaymentMethod.value) {
    case 'credit_card':
      return paymentForm.value.cardNumber.length >= 16 &&
             paymentForm.value.expiryDate.length === 5 &&
             paymentForm.value.cvv.length >= 3 &&
             paymentForm.value.cardholderName.length > 0;
    case 'ewallet':
      return paymentForm.value.ewalletProvider &&
             paymentForm.value.phoneNumber.length >= 10;
    case 'bank_transfer':
      return true;
    default:
      return false;
  }
});

// Methods
const loadCheckoutPreview = async () => {
  requestCount++;
  console.log(`🔄 Checkout Request #${requestCount} - Loading checkout preview`);
  
  // Safety check to prevent infinite loops
  if (requestCount > maxRequests) {
    console.error('🚨 Too many checkout requests detected! Stopping to prevent infinite loop.');
    return;
  }
  
  // Prevent multiple concurrent requests
  if (loading.value) {
    console.log('⏳ Checkout request already in progress, skipping...');
    return;
  }
  
  loading.value = true;
  error.value = null;
  
  try {
    console.log('🛒 Getting cart items...');
    // Get cart items first
    const cartResponse = await apiService.photo.getCart();
    const photoIds = cartResponse.data?.map(photo => photo.photo_id) || [];
    
    if (photoIds.length === 0) {
      console.log('🛒 Cart is empty');
      checkoutData.value = null;
      return;
    }
    
    console.log('💰 Getting checkout preview for', photoIds.length, 'items');
    // Get checkout preview
    const response = await apiService.photo.checkoutPreview({ photo_ids: photoIds });
    checkoutData.value = response.data || null;
    console.log('✅ Checkout preview loaded successfully');
  } catch (err: any) {
    error.value = err.message || 'Failed to load checkout details';
    console.error('❌ Error loading checkout preview:', err);
  } finally {
    loading.value = false;
    console.log('🏁 Checkout preview loading completed');
  }
};

// Image URL cache to prevent infinite loops
const imageUrlCache = new Map<string, string>();

const getItemImageUrl = (item: any): string => {
  const cacheKey = item.photo_id || item.title;
  
  // Return cached URL if available
  if (imageUrlCache.has(cacheKey)) {
    return imageUrlCache.get(cacheKey)!;
  }
  
  // Try different URL sources
  const possibleUrls = [
    item.your_moments_url,
    item.url?.is_this_you_url,
    item.url?.collection_url,
    item.image_url,
    item.photo_url
  ].filter(Boolean);
  
  // Use first valid URL or fallback
  const imageUrl = possibleUrls[0] || '/placeholder-image.jpg';
  
  // Cache the URL to prevent re-computation
  imageUrlCache.set(cacheKey, imageUrl);
  
  console.log('🖼️ Getting image URL for item:', item.title, 'URL:', imageUrl);
  return imageUrl;
};

// Track image errors to prevent infinite loops
const imageErrorCount = new Map<string, number>();
const maxImageErrors = 3;

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  const currentSrc = img.src;
  
  // Get error count for this image
  const errorCount = imageErrorCount.get(currentSrc) || 0;
  
  if (errorCount >= maxImageErrors) {
    console.log('🖼️ Max image errors reached for:', currentSrc, 'stopping retries');
    return;
  }
  
  console.log(`🖼️ Checkout image load error #${errorCount + 1} for:`, currentSrc);
  
  // Increment error count
  imageErrorCount.set(currentSrc, errorCount + 1);
  
  // Set fallback image
  img.src = '/placeholder-image.jpg';
  img.onerror = null; // Prevent infinite error loop
  
  // Remove error handler to prevent further retries
  img.removeEventListener('error', handleImageError);
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price);
};

const getGrandTotal = (): number => {
  if (!checkoutData.value) return 0;
  return checkoutData.value.total_price - checkoutData.value.total_discount;
};

const formatCardNumber = (event: Event) => {
  const input = event.target as HTMLInputElement;
  let value = input.value.replace(/\s/g, '');
  value = value.replace(/(.{4})/g, '$1 ').trim();
  input.value = value;
  paymentForm.value.cardNumber = value;
};

const formatExpiryDate = (event: Event) => {
  const input = event.target as HTMLInputElement;
  let value = input.value.replace(/\D/g, '');
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4);
  }
  input.value = value;
  paymentForm.value.expiryDate = value;
};

const processPayment = async () => {
  if (!isFormValid.value || !checkoutData.value) return;
  
  processing.value = true;
  
  try {
    console.log('Processing payment:', {
      method: selectedPaymentMethod.value,
      amount: getGrandTotal(),
      form: paymentForm.value
    });
    
    // Create transaction request
    const transactionRequest = {
      items: checkoutData.value.items.map(item => ({
        photo_id: item.photo_id,
        creator_id: item.creator_id,
        title: item.title,
        price: item.price,
        discount: item.discount ? {
          id: item.discount.id || '',
          amount: item.discount.value,
          min_quantity: item.discount.min_quantity,
          value: item.discount.value,
          discount_type: item.discount.discount_type
        } : undefined,
        final_price: item.final_price
      })),
      total_price: checkoutData.value.total_price,
      total_discount: checkoutData.value.total_discount
    };
    
    console.log('Creating transaction with data:', transactionRequest);
    
    // Call the transaction API
    const response = await apiService.transaction.createTransaction(transactionRequest);
    
    if (response.success && response.data) {
      console.log('Transaction created successfully:', response.data);
      
      // Store transaction details for success page
      localStorage.setItem('transaction_id', response.data.transaction_id);
      localStorage.setItem('snap_token', response.data.snap_token);
      
      // Redirect to Midtrans payment page using utility
      redirectToMidtrans(response.data.redirect_url);
    } else {
      throw new Error('Failed to create transaction');
    }
  } catch (err: any) {
    error.value = err.message || 'Payment processing failed';
    console.error('Payment error:', err);
  } finally {
    processing.value = false;
  }
};

// Lifecycle
onMounted(() => {
  console.log('🚀 CheckoutPage mounted, resetting request counter');
  requestCount = 0; // Reset counter on mount
  // Clear caches on mount
  imageUrlCache.clear();
  imageErrorCount.clear();
  loadCheckoutPreview();
});

// Cleanup on unmount
onUnmounted(() => {
  console.log('🧹 CheckoutPage unmounted');
  if (formValidationTimeout) {
    clearTimeout(formValidationTimeout);
  }
  // Clear caches
  imageUrlCache.clear();
  imageErrorCount.clear();
});
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem 0;
}

.checkout-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #6c757d;
  margin: 0;
}

.loading-state,
.error-state,
.empty-cart {
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

.spinning {
  animation: spin 1s linear infinite;
}

.error-icon,
.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.checkout-content {
  max-width: 1200px;
  margin: 0 auto;
}

.checkout-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.order-summary {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
}

.items-list {
  margin-bottom: 1.5rem;
}

.order-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.item-image {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.item-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.375rem;
}

.item-details {
  flex: 1;
}

.item-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
}

.item-creator {
  font-size: 0.9rem;
  color: #6c757d;
  margin: 0 0 0.75rem 0;
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
  font-size: 0.9rem;
  color: #6c757d;
}

.price-value {
  font-weight: 500;
  color: #2c3e50;
}

.discount-row .price-value {
  color: #dc3545;
}

.total-row .price-value {
  font-weight: 600;
}

.final-price {
  color: #28a745;
  font-size: 1.1rem;
}

.order-totals {
  border-top: 2px solid #e9ecef;
  padding-top: 1rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.total-label {
  font-weight: 500;
  color: #2c3e50;
}

.total-value {
  font-weight: 600;
  color: #2c3e50;
}

.discount-total .total-value {
  color: #dc3545;
}

.grand-total {
  border-top: 1px solid #e9ecef;
  padding-top: 0.5rem;
  margin-top: 0.5rem;
}

.grand-total .total-label,
.grand-total .total-value {
  font-size: 1.2rem;
  font-weight: 700;
}

.grand-total-value {
  color: #28a745;
}

.payment-section {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.payment-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 500;
  color: #2c3e50;
}

.form-input,
.form-select {
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.payment-method {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.payment-radio {
  display: none;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 0.5rem;
  width: 100%;
  transition: all 0.2s;
}

.payment-method.active .payment-option {
  border-color: #007bff;
  background: #f8f9ff;
}

.credit-card-form,
.bank-transfer-info,
.ewallet-form {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e9ecef;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.bank-details h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1rem 0;
}

.bank-info {
  background: white;
  padding: 1rem;
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
  margin-bottom: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 500;
  color: #6c757d;
}

.info-value {
  font-weight: 600;
  color: #2c3e50;
  font-family: monospace;
}

.transfer-note {
  font-size: 0.9rem;
  color: #6c757d;
  margin: 0;
  font-style: italic;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
}

.form-checkbox {
  margin-top: 0.25rem;
}

.checkbox-text {
  font-size: 0.9rem;
  color: #6c757d;
  line-height: 1.4;
}

.link {
  color: #007bff;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
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
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
}

/* Responsive design */
@media (max-width: 768px) {
  .checkout-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .order-item {
    flex-direction: column;
  }
  
  .item-image {
    width: 100%;
    height: 200px;
  }
}
</style>
