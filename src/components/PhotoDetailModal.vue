<template>
  <div class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <button class="close-btn" @click="close">
        <i class="icon-close"></i>
      </button>
      
      <div class="modal-body">
        <div class="photo-section">
          <img 
            :src="getPhotoUrl(photo)" 
            :alt="photo.title"
            class="photo-image"
            @error="handleImageError"
          />
        </div>
        
        <div class="photo-details">
          <h2 class="photo-title">{{ photo.title }}</h2>
          
          <div class="price-section">
            <div class="price-main">
              <span class="price">{{ formatPrice(photo.price) }}</span>
              <span v-if="photo.discount && photo.discount.is_active" class="discount-badge">
                -{{ photo.discount.value }}{{ photo.discount.discount_type === 'PERCENT' ? '%' : '' }}
              </span>
            </div>
            <div v-if="photo.discount && photo.discount.is_active" class="discount-info">
              <span class="discount-name">{{ photo.discount.name }}</span>
              <span class="final-price">{{ formatPrice(calculateFinalPrice()) }}</span>
            </div>
          </div>
          
          <div class="similarity-section">
            <h3>Similarity Score</h3>
            <div class="similarity-display">
              <div class="similarity-bar">
                <div 
                  class="similarity-fill" 
                  :style="{ width: `${photo.similarity * 10}%` }"
                ></div>
              </div>
              <span class="similarity-value">{{ photo.similarity }}/10</span>
            </div>
            <p class="similarity-description">
              This photo has a {{ photo.similarity * 10 }}% similarity match with your uploaded images.
            </p>
          </div>
          
          <div class="photo-meta">
            <div class="meta-item">
              <span class="meta-label">Creator ID:</span>
              <span class="meta-value">{{ photo.creator_id }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Uploaded:</span>
              <span class="meta-value">{{ formatDate(photo.created_at) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Last Updated:</span>
              <span class="meta-value">{{ formatDate(photo.updated_at) }}</span>
            </div>
          </div>
          
          <div class="action-buttons">
            <button 
              @click="toggleWishlist"
              :class="['action-btn', 'wishlist-btn', { active: photo.stage.is_wishlist }]"
            >
              <i class="icon-heart"></i>
              {{ photo.stage.is_wishlist ? 'Remove from Wishlist' : 'Add to Wishlist' }}
            </button>
            
            <button 
              @click="toggleFavorite"
              :class="['action-btn', 'favorite-btn', { active: photo.stage.is_favorite }]"
            >
              <i class="icon-star"></i>
              {{ photo.stage.is_favorite ? 'Remove from Favorites' : 'Add to Favorites' }}
            </button>
            
            <button 
              @click="toggleCart"
              :class="['action-btn', 'cart-btn', { active: photo.stage.is_cart }]"
            >
              <i class="icon-cart"></i>
              {{ photo.stage.is_cart ? 'Remove from Cart' : 'Add to Cart' }}
            </button>
            
            <button 
              @click="proceedToCheckout"
              class="action-btn checkout-btn"
              :disabled="!photo.stage.is_cart"
            >
              <i class="icon-checkout"></i>
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { Photo } from '../types/apiContracts';

interface Props {
  photo: Photo;
}

interface Emits {
  (e: 'close'): void;
  (e: 'toggle-wishlist', photo: Photo): void;
  (e: 'toggle-favorite', photo: Photo): void;
  (e: 'toggle-cart', photo: Photo): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const router = useRouter();

// Computed properties
const getPhotoUrl = (photo: Photo): string => {
  return photo.url.is_this_you_url || photo.url.collection_url || '';
};

const calculateFinalPrice = (): number => {
  if (!props.photo.discount || !props.photo.discount.is_active) {
    return props.photo.price;
  }
  
  const discount = props.photo.discount.discount_type === 'PERCENT' 
    ? (props.photo.price * props.photo.discount.value) / 100
    : props.photo.discount.value;
    
  return Math.max(0, props.photo.price - discount);
};

// Methods
const close = () => {
  emit('close');
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = '/placeholder-image.jpg';
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price);
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

const toggleWishlist = () => {
  emit('toggle-wishlist', props.photo);
};

const toggleFavorite = () => {
  emit('toggle-favorite', props.photo);
};

const toggleCart = () => {
  emit('toggle-cart', props.photo);
};

const proceedToCheckout = () => {
  if (props.photo.stage.is_cart) {
    router.push('/checkout');
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.modal-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100%;
  max-height: 90vh;
}

.photo-section {
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.photo-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.photo-details {
  padding: 2rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.photo-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.price-section {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e9ecef;
}

.price-main {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
}

.discount-badge {
  background: #dc3545;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.discount-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.discount-name {
  color: #6c757d;
  font-style: italic;
}

.final-price {
  font-weight: 600;
  color: #28a745;
}

.similarity-section h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.similarity-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.similarity-bar {
  flex: 1;
  height: 0.75rem;
  background: #e9ecef;
  border-radius: 0.375rem;
  overflow: hidden;
}

.similarity-fill {
  height: 100%;
  background: linear-gradient(90deg, #dc3545, #ffc107, #28a745);
  transition: width 0.3s;
}

.similarity-value {
  font-weight: 600;
  color: #2c3e50;
  min-width: 3rem;
  text-align: right;
}

.similarity-description {
  font-size: 0.9rem;
  color: #6c757d;
  margin: 0;
}

.photo-meta {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e9ecef;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.meta-item:last-child {
  margin-bottom: 0;
}

.meta-label {
  font-weight: 500;
  color: #6c757d;
}

.meta-value {
  color: #2c3e50;
  font-family: monospace;
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: auto;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  background: white;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.action-btn:hover:not(:disabled) {
  background: #f8f9fa;
  color: #495057;
}

.action-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.action-btn.active:hover {
  background: #0056b3;
  border-color: #0056b3;
}

.checkout-btn {
  background: #28a745;
  color: white;
  border-color: #28a745;
  font-weight: 600;
}

.checkout-btn:hover:not(:disabled) {
  background: #218838;
  border-color: #1e7e34;
}

.checkout-btn:disabled {
  background: #6c757d;
  border-color: #6c757d;
  cursor: not-allowed;
}

/* Responsive design */
@media (max-width: 768px) {
  .modal-body {
    grid-template-columns: 1fr;
    max-height: 95vh;
  }
  
  .photo-section {
    padding: 1rem;
    max-height: 40vh;
  }
  
  .photo-details {
    padding: 1rem;
  }
  
  .action-buttons {
    position: sticky;
    bottom: 0;
    background: white;
    padding-top: 1rem;
    border-top: 1px solid #e9ecef;
  }
}
</style>
