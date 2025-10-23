<template>
  <div class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">
          {{ isEditing ? 'Edit Discount' : 'Create New Discount' }}
        </h2>
        <button class="close-btn" @click="close">
          <i class="icon-close"></i>
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group">
          <label class="form-label">Discount Name *</label>
          <input 
            type="text" 
            v-model="form.name"
            placeholder="e.g., Summer Sale, Black Friday"
            class="form-input"
            required
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Discount Type *</label>
            <select v-model="form.discount_type" class="form-select" required>
              <option value="">Select Type</option>
              <option value="PERCENT">Percentage (%)</option>
              <option value="FIXED">Fixed Amount (IDR)</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Discount Value *</label>
            <input 
              type="number" 
              v-model.number="form.value"
              :placeholder="form.discount_type === 'PERCENT' ? '10' : '50000'"
              :min="form.discount_type === 'PERCENT' ? 1 : 0"
              :max="form.discount_type === 'PERCENT' ? 100 : undefined"
              class="form-input"
              required
            />
            <small class="form-help">
              {{ form.discount_type === 'PERCENT' ? 'Enter percentage (1-100)' : 'Enter amount in IDR' }}
            </small>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Minimum Quantity *</label>
          <input 
            type="number" 
            v-model.number="form.min_quantity"
            placeholder="1"
            min="1"
            class="form-input"
            required
          />
          <small class="form-help">
            Minimum number of photos required to apply this discount
          </small>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="form.is_active"
              class="form-checkbox"
            />
            <span class="checkbox-text">Activate discount immediately</span>
          </label>
        </div>

        <!-- Preview Section -->
        <div v-if="form.name && form.value && form.discount_type" class="preview-section">
          <h3 class="preview-title">Discount Preview</h3>
          <div class="preview-card">
            <div class="preview-header">
              <h4>{{ form.name }}</h4>
              <span class="preview-status" :class="{ active: form.is_active }">
                {{ form.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>
            
            <div class="preview-details">
              <div class="preview-row">
                <span>Type:</span>
                <span>{{ form.discount_type === 'PERCENT' ? 'Percentage' : 'Fixed Amount' }}</span>
              </div>
              <div class="preview-row">
                <span>Value:</span>
                <span>
                  {{ form.discount_type === 'PERCENT' ? `${form.value}%` : formatPrice(form.value) }}
                </span>
              </div>
              <div class="preview-row">
                <span>Min Quantity:</span>
                <span>{{ form.min_quantity }} photos</span>
              </div>
            </div>
            
            <div class="preview-example">
              <h5>Example:</h5>
              <p>
                If a customer buys {{ form.min_quantity }} photo(s) at 1,000,000 IDR each:
              </p>
              <div class="example-calculation">
                <div class="calc-row">
                  <span>Subtotal:</span>
                  <span>{{ formatPrice(1000000 * form.min_quantity) }}</span>
                </div>
                <div class="calc-row discount">
                  <span>Discount:</span>
                  <span>
                    -{{ form.discount_type === 'PERCENT' 
                        ? formatPrice((1000000 * form.min_quantity * form.value) / 100)
                        : formatPrice(form.value) 
                    }}
                  </span>
                </div>
                <div class="calc-row total">
                  <span>Total:</span>
                  <span>
                    {{ formatPrice(calculateExampleTotal()) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" @click="close" class="btn btn-outline">
            Cancel
          </button>
          <button 
            type="submit" 
            :disabled="!isFormValid || saving"
            class="btn btn-primary"
          >
            <i v-if="saving" class="icon-spinner spinning"></i>
            <i v-else class="icon-save"></i>
            {{ saving ? 'Saving...' : (isEditing ? 'Update Discount' : 'Create Discount') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { Discount, CreateDiscountRequest } from '../types/apiContracts';

interface Props {
  discount?: Discount | null;
}

interface Emits {
  (e: 'close'): void;
  (e: 'save', data: CreateDiscountRequest): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Reactive data
const saving = ref(false);
const form = ref<CreateDiscountRequest>({
  name: '',
  min_quantity: 1,
  discount_type: 'PERCENT',
  value: 10,
  is_active: true
});

// Computed properties
const isEditing = computed(() => !!props.discount);

const isFormValid = computed(() => {
  return form.value.name.trim().length > 0 &&
         form.value.discount_type &&
         form.value.value > 0 &&
         form.value.min_quantity > 0;
});

// Methods
const close = () => {
  emit('close');
};

const handleSubmit = async () => {
  if (!isFormValid.value) return;
  
  saving.value = true;
  
  try {
    emit('save', { ...form.value });
  } finally {
    saving.value = false;
  }
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price);
};

const calculateExampleTotal = (): number => {
  const subtotal = 1000000 * form.value.min_quantity;
  const discount = form.value.discount_type === 'PERCENT' 
    ? (subtotal * form.value.value) / 100
    : form.value.value;
  
  return Math.max(0, subtotal - discount);
};

// Initialize form with existing discount data
const initializeForm = () => {
  if (props.discount) {
    form.value = {
      name: props.discount.name,
      min_quantity: props.discount.min_quantity,
      discount_type: props.discount.discount_type,
      value: props.discount.value,
      is_active: props.discount.active
    };
  }
};

// Watch for discount changes
watch(() => props.discount, initializeForm, { immediate: true });

// Lifecycle
onMounted(() => {
  initializeForm();
});
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
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.close-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 50%;
  background: #f8f9fa;
  color: #6c757d;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #e9ecef;
}

.modal-body {
  padding: 1.5rem;
  max-height: calc(90vh - 80px);
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-label {
  display: block;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.form-input,
.form-select {
  width: 100%;
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

.form-help {
  display: block;
  font-size: 0.875rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.form-checkbox {
  width: 1.25rem;
  height: 1.25rem;
}

.checkbox-text {
  font-weight: 500;
  color: #2c3e50;
}

.preview-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.preview-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1rem 0;
}

.preview-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  padding: 1rem;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.preview-header h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.preview-status {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.preview-status.active {
  background: #d4edda;
  color: #155724;
}

.preview-status:not(.active) {
  background: #f8d7da;
  color: #721c24;
}

.preview-details {
  margin-bottom: 1rem;
}

.preview-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.preview-row:last-child {
  margin-bottom: 0;
}

.preview-row span:first-child {
  color: #6c757d;
}

.preview-row span:last-child {
  font-weight: 600;
  color: #2c3e50;
}

.preview-example h5 {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.preview-example p {
  color: #6c757d;
  margin: 0 0 1rem 0;
}

.example-calculation {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 1rem;
}

.calc-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.calc-row:last-child {
  margin-bottom: 0;
}

.calc-row.total {
  border-top: 1px solid #dee2e6;
  padding-top: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.calc-row.discount {
  color: #dc3545;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
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

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive design */
@media (max-width: 768px) {
  .modal-content {
    margin: 0.5rem;
    max-height: 95vh;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
