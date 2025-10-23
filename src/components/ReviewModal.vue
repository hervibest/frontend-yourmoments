<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Beri Review</h2>
        <button class="close-button" @click="closeModal">×</button>
      </div>
      
      <div class="modal-body">
        <div class="review-form">
          <div class="rating-section">
            <label class="rating-label">Rating:</label>
            <div class="star-rating">
              <button
                v-for="star in 5"
                :key="star"
                class="star-button"
                :class="{ active: star <= rating }"
                @click="setRating(star)"
              >
                ⭐
              </button>
            </div>
            <span class="rating-text">{{ rating }}/5</span>
          </div>
          
          <div class="comment-section">
            <label for="comment" class="comment-label">Komentar:</label>
            <textarea
              id="comment"
              v-model="comment"
              class="comment-input"
              placeholder="Bagikan pengalaman Anda dengan foto ini..."
              rows="4"
              maxlength="500"
            ></textarea>
            <div class="character-count">{{ comment.length }}/500</div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <BaseButton
          variant="secondary"
          size="md"
          @click="closeModal"
        >
          Batal
        </BaseButton>
        <BaseButton
          variant="primary"
          size="md"
          :disabled="!isFormValid || isSubmitting"
          @click="submitReview"
        >
          <span v-if="isSubmitting">Mengirim...</span>
          <span v-else>Kirim Review</span>
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { apiService } from '../services/api';
import { useNotification } from '../composables/useNotification';
import BaseButton from './BaseButton.vue';
import type { CreateReviewRequest } from '../types/apiContracts';

interface Props {
  isOpen: boolean;
  transactionDetailId: string;
  creatorId: string;
}

interface Emits {
  (e: 'close'): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { showSuccess, showError } = useNotification();

// Form data
const rating = ref(0);
const comment = ref('');
const isSubmitting = ref(false);

// Computed
const isFormValid = computed(() => {
  return rating.value > 0 && comment.value.trim().length > 0;
});

// Methods
const setRating = (value: number) => {
  rating.value = value;
};

const closeModal = () => {
  if (!isSubmitting.value) {
    resetForm();
    emit('close');
  }
};

const resetForm = () => {
  rating.value = 0;
  comment.value = '';
  isSubmitting.value = false;
};

const submitReview = async () => {
  if (!isFormValid.value || isSubmitting.value) return;
  
  isSubmitting.value = true;
  
  try {
    const reviewData: CreateReviewRequest = {
      transaction_detail_id: props.transactionDetailId,
      creator_id: props.creatorId,
      rating: rating.value,
      comment: comment.value.trim(),
    };
    
    await apiService.transaction.createReview(reviewData);
    
    showSuccess(
      'Review Berhasil',
      'Terima kasih atas review Anda!',
      3000
    );
    
    emit('success');
    closeModal();
  } catch (error: any) {
    showError(
      'Gagal Mengirim Review',
      error.message || 'Terjadi kesalahan saat mengirim review',
      5000
    );
  } finally {
    isSubmitting.value = false;
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 0 1.5rem;
}

.review-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.rating-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rating-label {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.star-rating {
  display: flex;
  gap: 0.5rem;
}

.star-button {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
  filter: grayscale(100%);
}

.star-button.active {
  filter: grayscale(0%);
}

.star-button:hover {
  transform: scale(1.1);
}

.rating-text {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.comment-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.comment-label {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.comment-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.2s;
}

.comment-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.character-count {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: right;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  margin-top: 1.5rem;
}

@media (max-width: 640px) {
  .modal-content {
    margin: 1rem;
    max-width: none;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .star-rating {
    justify-content: center;
  }
  
  .modal-footer {
    flex-direction: column;
  }
}
</style>
