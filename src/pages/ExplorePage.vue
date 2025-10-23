<template>
  <div class="explore-page">
    <!-- Header -->
    <header class="explore-header">
      <div class="container">
        <div class="header-content">
          <h1 class="page-title">Explore Photos</h1>
          <div class="header-actions">
            <button 
              @click="refreshPhotos" 
              :disabled="loading"
              class="btn btn-outline"
            >
              <i class="icon-refresh" :class="{ 'spinning': loading }"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Navigation Tabs -->
    <nav class="explore-nav">
      <div class="container">
        <div class="nav-tabs">
          <button 
            v-for="tab in tabsWithCount" 
            :key="tab.key"
            @click="activeTab = tab.key"
            :class="['nav-tab', { active: activeTab === tab.key }]"
          >
            <i :class="tab.icon"></i>
            {{ tab.label }}
            <span v-if="tab.count !== undefined" class="tab-count">{{ tab.count }}</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="explore-content">
      <div class="container">
        <!-- Loading State -->
        <div v-if="loading && photos.length === 0" class="loading-state">
          <div class="spinner"></div>
          <p>Loading photos...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <div class="error-icon">⚠️</div>
          <h3>Oops! Something went wrong</h3>
          <p>{{ error }}</p>
          <button @click="loadPhotos" class="btn btn-primary">Try Again</button>
        </div>

        <!-- Photos Grid -->
        <div v-else-if="photos.length > 0" class="photos-grid">
          <div 
            v-for="photo in photos" 
            :key="photo.photo_id"
            class="photo-card"
            @click="selectPhoto(photo)"
          >
            <div class="photo-image-container">
              <img 
                :src="getPhotoUrl(photo)" 
                :alt="photo.title"
                class="photo-image"
                @error="handleImageError"
              />
              <div class="photo-overlay">
                <div class="photo-actions">
                  <button 
                    @click.stop="toggleWishlist(photo)"
                    :class="['action-btn', 'wishlist-btn', { active: photo.stage.is_wishlist }]"
                    :title="photo.stage.is_wishlist ? 'Remove from wishlist' : 'Add to wishlist'"
                  >
                    <i class="icon-heart"></i>
                  </button>
                  <button 
                    @click.stop="toggleFavorite(photo)"
                    :class="['action-btn', 'favorite-btn', { active: photo.stage.is_favorite }]"
                    :title="photo.stage.is_favorite ? 'Remove from favorites' : 'Add to favorites'"
                  >
                    <i class="icon-star"></i>
                  </button>
                  <button 
                    @click.stop="toggleCart(photo)"
                    :class="['action-btn', 'cart-btn', { active: photo.stage.is_cart }]"
                    :title="photo.stage.is_cart ? 'Remove from cart' : 'Add to cart'"
                  >
                    <i class="icon-cart"></i>
                  </button>
                </div>
                <div class="photo-info">
                  <h3 class="photo-title">{{ photo.title }}</h3>
                  <div class="photo-price">
                    <span class="price">{{ formatPrice(photo.price) }}</span>
                    <span v-if="photo.discount && photo.discount.is_active" class="discount">
                      -{{ photo.discount.value }}{{ photo.discount.discount_type === 'PERCENT' ? '%' : '' }}
                    </span>
                  </div>
                  <div class="similarity-score">
                    <span class="similarity-label">Similarity:</span>
                    <div class="similarity-bar">
                      <div 
                        class="similarity-fill" 
                        :style="{ width: `${photo.similarity * 10}%` }"
                      ></div>
                    </div>
                    <span class="similarity-value">{{ photo.similarity }}/10</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-icon">📸</div>
          <h3>No photos found</h3>
          <p>There are no photos to display at the moment.</p>
          <button @click="loadPhotos" class="btn btn-primary">Refresh</button>
        </div>

        <!-- Pagination -->
        <div v-if="pagination && pagination.total_page > 1" class="pagination">
          <button 
            @click="loadPage(pagination.page - 1)"
            :disabled="!pagination.has_previous"
            class="btn btn-outline"
          >
            Previous
          </button>
          <span class="page-info">
            Page {{ pagination.page }} of {{ pagination.total_page }}
          </span>
          <button 
            @click="loadPage(pagination.page + 1)"
            :disabled="!pagination.has_next"
            class="btn btn-outline"
          >
            Next
          </button>
        </div>
      </div>
    </main>

    <!-- Photo Detail Modal -->
    <PhotoDetailModal 
      v-if="selectedPhoto"
      :photo="selectedPhoto"
      @close="selectedPhoto = null"
      @toggle-wishlist="toggleWishlist"
      @toggle-favorite="toggleFavorite"
      @toggle-cart="toggleCart"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { apiService } from '../services/api';
import type { Photo, Pagination } from '../types/apiContracts';
import PhotoDetailModal from '../components/PhotoDetailModal.vue';

const router = useRouter();

// Reactive data
const photos = ref<Photo[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const selectedPhoto = ref<Photo | null>(null);
const activeTab = ref('explore');
const pagination = ref<Pagination | null>(null);

// Tab counts tracking
const tabCounts = ref({
  explore: 0,
  wishlist: 0,
  favorites: 0,
  cart: 0
});

// Debouncing mechanism
let loadPhotosTimeout: NodeJS.Timeout | null = null;

// Static tabs to prevent infinite re-renders
const tabs = [
  { 
    key: 'explore', 
    label: 'Explore', 
    icon: 'icon-grid',
    count: 0 // Will be updated dynamically
  },
  { 
    key: 'wishlist', 
    label: 'Wishlist', 
    icon: 'icon-heart',
    count: 0 // Will be updated when wishlist is loaded
  },
  { 
    key: 'favorites', 
    label: 'Favorites', 
    icon: 'icon-star',
    count: 0 // Will be updated when favorites are loaded
  },
  { 
    key: 'cart', 
    label: 'Cart', 
    icon: 'icon-cart',
    count: 0 // Will be updated when cart is loaded
  }
];

// Computed property for dynamic count updates
const tabsWithCount = computed(() => {
  return tabs.map(tab => ({
    ...tab,
    count: tabCounts.value[tab.key as keyof typeof tabCounts.value]
  }));
});

// Request tracking
let requestCount = 0;
const maxRequests = 10; // Safety limit

// Methods
const loadPhotos = async () => {
  requestCount++;
  console.log(`🔄 Request #${requestCount} - Loading photos for tab: ${activeTab.value}`);
  
  // Safety check to prevent infinite loops
  if (requestCount > maxRequests) {
    console.error('🚨 Too many requests detected! Stopping to prevent infinite loop.');
    return;
  }
  
  // Prevent multiple concurrent requests
  if (loading.value) {
    console.log('⏳ Request already in progress, skipping...');
    return;
  }
  
  loading.value = true;
  error.value = null;
  
  try {
    let response;
    
    switch (activeTab.value) {
      case 'wishlist':
        response = await apiService.photo.getWishlist();
        break;
      case 'favorites':
        response = await apiService.photo.getFavorite();
        break;
      case 'cart':
        response = await apiService.photo.getCart();
        break;
      default:
        response = await apiService.photo.getExplore();
    }
    
    photos.value = response.data || [];
    pagination.value = response.pagination;
    
    // Update the count for the current active tab
    const totalItems = pagination.value?.total_item || 0;
    tabCounts.value[activeTab.value as keyof typeof tabCounts.value] = totalItems;
    
    console.log('✅ Photos loaded successfully:', photos.value.length);
    console.log('📊 Updated count for', activeTab.value, ':', totalItems);
  } catch (err: any) {
    error.value = err.message || 'Failed to load photos';
    console.error('❌ Error loading photos:', err);
  } finally {
    loading.value = false;
    console.log('🏁 loadPhotos completed, loading set to false');
  }
};

const loadPage = async (page: number) => {
  if (page < 1) return;
  
  loading.value = true;
  try {
    const response = await apiService.photo.getExplore({ page, size: 12 });
    photos.value = response.data || [];
    pagination.value = response.pagination;
    
    // Update the count for the current active tab
    const totalItems = pagination.value?.total_item || 0;
    tabCounts.value[activeTab.value as keyof typeof tabCounts.value] = totalItems;
  } catch (err: any) {
    error.value = err.message || 'Failed to load photos';
  } finally {
    loading.value = false;
  }
};

const refreshPhotos = () => {
  loadPhotos();
};

const selectPhoto = (photo: Photo) => {
  selectedPhoto.value = photo;
};

const getPhotoUrl = (photo: Photo): string => {
  return photo.url.is_this_you_url || photo.url.collection_url || '';
};

const handleImageError = (event: Event) => {
  console.log('🖼️ Image load error, using fallback');
  const img = event.target as HTMLImageElement;
  img.src = '/placeholder-image.jpg'; // Fallback image
  img.onerror = null; // Prevent infinite error loop
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price);
};

const toggleWishlist = async (photo: Photo) => {
  try {
    if (photo.stage.is_wishlist) {
      await apiService.photo.deleteWishlist({ photo_id: photo.photo_id });
    } else {
      await apiService.photo.addWishlist({ photo_id: photo.photo_id });
    }
    
    // Update local state
    photo.stage.is_wishlist = !photo.stage.is_wishlist;
  } catch (err: any) {
    console.error('Error toggling wishlist:', err);
    // You might want to show a toast notification here
  }
};

const toggleFavorite = async (photo: Photo) => {
  try {
    if (photo.stage.is_favorite) {
      await apiService.photo.deleteFavorite({ photo_id: photo.photo_id });
    } else {
      await apiService.photo.addFavorite({ photo_id: photo.photo_id });
    }
    
    // Update local state
    photo.stage.is_favorite = !photo.stage.is_favorite;
  } catch (err: any) {
    console.error('Error toggling favorite:', err);
  }
};

const toggleCart = async (photo: Photo) => {
  try {
    if (photo.stage.is_cart) {
      await apiService.photo.deleteCart({ photo_id: photo.photo_id });
    } else {
      await apiService.photo.addCart({ photo_id: photo.photo_id });
    }
    
    // Update local state
    photo.stage.is_cart = !photo.stage.is_cart;
  } catch (err: any) {
    console.error('Error toggling cart:', err);
  }
};

// Watch for tab changes with debouncing
watch(activeTab, (newTab, oldTab) => {
  console.log('👀 Watch triggered - Tab changed from', oldTab, 'to', newTab);
  
  // Only load photos if tab actually changed
  if (newTab !== oldTab) {
    console.log('✅ Tab actually changed, scheduling request...');
    
    // Clear existing timeout
    if (loadPhotosTimeout) {
      console.log('🧹 Clearing existing timeout');
      clearTimeout(loadPhotosTimeout);
    }
    
    // Debounce the request by 100ms
    loadPhotosTimeout = setTimeout(() => {
      console.log('⏰ Timeout triggered, checking loading state...');
      if (!loading.value) {
        console.log('✅ Not loading, proceeding with request');
        loadPhotos();
      } else {
        console.log('⏳ Still loading, skipping request');
      }
    }, 100);
  } else {
    console.log('❌ Tab did not change, ignoring');
  }
});

// Lifecycle
onMounted(() => {
  console.log('🚀 ExplorePage mounted, resetting request counter');
  requestCount = 0; // Reset counter on mount
  loadPhotos();
});

// Cleanup timeouts on unmount
onUnmounted(() => {
  if (loadPhotosTimeout) {
    clearTimeout(loadPhotosTimeout);
  }
});
</script>

<style scoped>
.explore-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.explore-header {
  background: white;
  border-bottom: 1px solid #e9ecef;
  padding: 1rem 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.explore-nav {
  background: white;
  border-bottom: 1px solid #e9ecef;
  padding: 0.5rem 0;
}

.nav-tabs {
  display: flex;
  gap: 0.5rem;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  color: #6c757d;
}

.nav-tab:hover {
  background: #f8f9fa;
  color: #495057;
}

.nav-tab.active {
  background: #007bff;
  color: white;
}

.tab-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.explore-content {
  padding: 2rem 0;
}

.loading-state,
.error-state,
.empty-state {
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

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.photo-card {
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.photo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.photo-image-container {
  position: relative;
  aspect-ratio: 4/3;
  overflow: hidden;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  opacity: 0;
  transition: opacity 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
}

.photo-card:hover .photo-overlay {
  opacity: 1;
}

.photo-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.action-btn {
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #6c757d;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: white;
  color: #007bff;
  transform: scale(1.1);
}

.action-btn.active {
  background: #007bff;
  color: white;
}

.photo-info {
  color: white;
}

.photo-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.photo-price {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.price {
  font-size: 1.2rem;
  font-weight: 700;
}

.discount {
  background: #dc3545;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.similarity-score {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.similarity-label {
  font-weight: 500;
}

.similarity-bar {
  flex: 1;
  height: 0.5rem;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 0.25rem;
  overflow: hidden;
}

.similarity-fill {
  height: 100%;
  background: linear-gradient(90deg, #dc3545, #ffc107, #28a745);
  transition: width 0.3s;
}

.similarity-value {
  font-weight: 600;
  min-width: 2rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-info {
  font-weight: 500;
  color: #6c757d;
}

/* Button styles */
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
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

.btn-outline {
  background: transparent;
  color: #007bff;
  border: 1px solid #007bff;
}

.btn-outline:hover:not(:disabled) {
  background: #007bff;
  color: white;
}

/* Responsive design */
@media (max-width: 768px) {
  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .nav-tabs {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .nav-tab {
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
  }
}
</style>
