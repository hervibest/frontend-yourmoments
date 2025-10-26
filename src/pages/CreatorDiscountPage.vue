<template>
  <div class="creator-discount-page">
    <div class="container">
      <!-- Header -->
      <header class="page-header">
        <div class="header-content">
          <h1 class="page-title">Discount Management</h1>
          <p class="page-subtitle">Create and manage discounts for your photos</p>
          <button @click="showCreateModal = true" class="btn btn-primary">
            <i class="icon-plus"></i>
            Create New Discount
          </button>
        </div>
      </header>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading discounts...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Oops! Something went wrong</h3>
        <p>{{ error }}</p>
        <button @click="loadDiscounts" class="btn btn-primary">Try Again</button>
      </div>

      <!-- Discounts List -->
      <div v-else-if="discounts.length > 0" class="discounts-section">
        <div class="discounts-grid">
          <div 
            v-for="discount in discounts" 
            :key="discount.id"
            class="discount-card"
            :class="{ inactive: !discount.is_active }"
          >
            <div class="discount-header">
              <h3 class="discount-name">{{ discount.name }}</h3>
              <div class="discount-status">
                <span 
                  class="status-badge"
                  :class="{ active: discount.is_active, inactive: !discount.is_active }"
                >
                  {{ discount.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
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
              
              <div class="detail-row">
                <span class="detail-label">Created:</span>
                <span class="detail-value">{{ formatDate(discount.created_at) }}</span>
              </div>
            </div>

            <div class="discount-actions">
              <button 
                @click="toggleDiscountStatus(discount)"
                :class="['btn', 'btn-sm', discount.is_active ? 'btn-warning' : 'btn-success']"
              >
                <i :class="discount.is_active ? 'icon-pause' : 'icon-play'"></i>
                {{ discount.is_active ? 'Deactivate' : 'Activate' }}
              </button>
              
              <button 
                @click="editDiscount(discount)"
                class="btn btn-outline btn-sm"
              >
                <i class="icon-edit"></i>
                Edit
              </button>
              
              <button 
                @click="deleteDiscount(discount)"
                class="btn btn-danger btn-sm"
              >
                <i class="icon-trash"></i>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">🎯</div>
        <h3>No discounts created yet</h3>
        <p>Create your first discount to attract more customers to your photos.</p>
        <button @click="showCreateModal = true" class="btn btn-primary">Create First Discount</button>
      </div>
    </div>

    <!-- Create/Edit Discount Modal -->
    <DiscountModal
      v-if="showCreateModal || editingDiscount"
      :discount="editingDiscount"
      @close="closeModal"
      @save="handleSaveDiscount"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiService } from '../services/api';
import type { Discount } from '../types/apiContracts';
import DiscountModal from '../components/DiscountModal.vue';

// Reactive data
const discounts = ref<Discount[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const showCreateModal = ref(false);
const editingDiscount = ref<Discount | null>(null);

// Methods
const loadDiscounts = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await apiService.photo.getDiscounts();
    discounts.value = response.data || [];
  } catch (err: any) {
    error.value = err.message || 'Failed to load discounts';
    console.error('Error loading discounts:', err);
  } finally {
    loading.value = false;
  }
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
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
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
  showCreateModal.value = true;
};

const deleteDiscount = async (discount: Discount) => {
  if (!confirm(`Are you sure you want to delete the discount "${discount.name}"?`)) {
    return;
  }
  
  try {
    // Note: There's no delete endpoint in the API, so this would need to be implemented
    // For now, we'll just remove it from the local state
    const index = discounts.value.findIndex(d => d.id === discount.id);
    if (index > -1) {
      discounts.value.splice(index, 1);
    }
  } catch (err: any) {
    console.error('Error deleting discount:', err);
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  editingDiscount.value = null;
};

const handleSaveDiscount = async (discountData: any) => {
  try {
    if (editingDiscount.value) {
      // Update existing discount
      // Note: There's no update endpoint in the API, so this would need to be implemented
      const index = discounts.value.findIndex(d => d.id === editingDiscount.value!.id);
      if (index > -1) {
        discounts.value[index] = { ...discounts.value[index], ...discountData };
      }
    } else {
      // Create new discount
      const response = await apiService.photo.createDiscount(discountData);
      if (response.data) {
        discounts.value.unshift(response.data);
      }
    }
    
    closeModal();
  } catch (err: any) {
    console.error('Error saving discount:', err);
    // You might want to show a toast notification here
  }
};

// Lifecycle
onMounted(() => {
  loadDiscounts();
});
</script>

<style scoped>
.creator-discount-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem 0;
}

.page-header {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 2rem;
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

.error-icon,
.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.discounts-section {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.discounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.discount-card {
  border: 1px solid #e9ecef;
  border-radius: 0.75rem;
  padding: 1.5rem;
  background: white;
  transition: all 0.2s;
  position: relative;
}

.discount-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.discount-card.inactive {
  opacity: 0.7;
  background: #f8f9fa;
}

.discount-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.discount-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  flex: 1;
}

.discount-status {
  margin-left: 1rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background: #f8d7da;
  color: #721c24;
}

.discount-details {
  margin-bottom: 1.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.detail-row:last-child {
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

.discount-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
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

.btn-outline {
  background: transparent;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.btn-outline:hover:not(:disabled) {
  background: #f8f9fa;
  color: #495057;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #218838;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-warning:hover:not(:disabled) {
  background: #e0a800;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .discounts-grid {
    grid-template-columns: 1fr;
  }
  
  .discount-actions {
    justify-content: center;
  }
  
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
