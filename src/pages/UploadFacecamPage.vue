<template>
  <div class="upload-page">
    <div class="container">
      <div class="header">
        <h1>Upload Facecam Photo</h1>
        <p class="subtitle">Upload your facecam photo for better photo matching</p>
      </div>

      <BaseForm 
        :isLoading="isLoading" 
        :error="error"
        @submit="handleSubmit"
      >
        <div class="form-content">
          <!-- Facecam Upload -->
          <BaseFileUpload
            v-model="formData.facecam"
            name="facecam"
            label="Facecam Photo"
            accept="image/*"
            :required="true"
            :error="errors.facecam"
            helpText="Upload a clear photo of your face (max 1MB)"
            dragText="Click to upload or drag and drop your facecam photo"
            acceptText="JPG, PNG, GIF, WebP"
            :maxSize="1024 * 1024"
            @change="handleFacecamChange"
          />

          <!-- User ID Input -->
          <BaseInput
            v-model="formData.userId"
            name="userId"
            type="text"
            label="User ID"
            placeholder="Enter your user ID"
            :required="true"
            :error="errors.userId"
            helpText="Your unique user identifier"
            @blur="validateUserId"
          />

          <!-- Facecam Preview -->
          <div v-if="formData.facecam" class="facecam-preview">
            <h3>Facecam Preview</h3>
            <div class="preview-container">
              <img 
                :src="getFacecamPreview(formData.facecam)" 
                alt="Facecam preview"
                class="preview-image"
              />
              <div class="preview-info">
                <span class="preview-name">{{ formData.facecam.name }}</span>
                <span class="preview-size">{{ formatFileSize(formData.facecam.size) }}</span>
              </div>
            </div>
          </div>

          <!-- Guidelines -->
          <div class="guidelines">
            <h3>Photo Guidelines</h3>
            <p>For the best results, please follow these guidelines:</p>
            <ul>
              <li>Use a clear, well-lit photo of your face</li>
              <li>Look directly at the camera</li>
              <li>Avoid sunglasses, hats, or face coverings</li>
              <li>Ensure your face takes up most of the frame</li>
              <li>Use a recent photo for better accuracy</li>
            </ul>
          </div>

          <!-- Submit Button -->
          <div class="form-actions">
            <BaseButton
              type="submit"
              variant="primary"
              size="large"
              :disabled="!isFormValid || isLoading"
            >
              {{ isLoading ? 'Uploading...' : 'Upload Facecam' }}
            </BaseButton>
            
            <BaseButton
              type="button"
              variant="secondary"
              size="large"
              @click="goBack"
            >
              Cancel
            </BaseButton>
          </div>
        </div>
      </BaseForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { apiService } from '../services/api';
import { ApiException } from '../services/api';
import { useNotification } from '../composables/useNotification';
import BaseForm from '../components/BaseForm.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseButton from '../components/BaseButton.vue';
import BaseFileUpload from '../components/BaseFileUpload.vue';
import type { UploadFacecamRequest } from '../types/apiContracts';

const router = useRouter();
const userStore = useUserStore();
const { showSuccess, showError } = useNotification();

// Form data
const formData = ref<UploadFacecamRequest>({
  facecam: null as File | null,
  userId: '',
});

// Form state
const isLoading = ref(false);
const error = ref<string | null>(null);

// Form validation
const errors = ref<Record<string, string | null>>({
  facecam: null,
  userId: null,
});

// Computed
const isFormValid = computed(() => {
  return formData.value.facecam &&
         formData.value.userId &&
         Object.values(errors.value).every(error => !error);
});

// Methods
const handleFacecamChange = (file: File | null) => {
  formData.value.facecam = file;
  validateFacecam();
};

const validateFacecam = () => {
  if (!formData.value.facecam) {
    errors.value.facecam = 'Facecam photo is required';
    return;
  }
  
  if (formData.value.facecam.size > 1024 * 1024) {
    errors.value.facecam = 'Photo size must be less than 1MB';
    return;
  }
  
  errors.value.facecam = null;
};

const validateUserId = () => {
  if (!formData.value.userId.trim()) {
    errors.value.userId = 'User ID is required';
    return;
  }
  
  if (formData.value.userId.length < 3) {
    errors.value.userId = 'User ID must be at least 3 characters';
    return;
  }
  
  errors.value.userId = null;
};

const getFacecamPreview = (file: File): string => {
  return URL.createObjectURL(file);
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const handleSubmit = async () => {
  // Validate all fields
  validateFacecam();
  validateUserId();
  
  if (!isFormValid.value) {
    return;
  }
  
  try {
    isLoading.value = true;
    error.value = null;
    
    const uploadData: UploadFacecamRequest = {
      facecam: formData.value.facecam!,
      userId: formData.value.userId,
    };
    
    await apiService.upload.uploadFacecam(uploadData);
    
    // Show success notification
    showSuccess(
      'Upload Berhasil!',
      'Foto facecam Anda telah berhasil diupload dan akan digunakan untuk pencocokan foto yang lebih baik.',
      4000
    );
    
    // Redirect to profile after a short delay
    setTimeout(() => {
      router.push('/profile');
    }, 1500);
  } catch (err) {
    let errorMessage = 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.';
    
    if (err instanceof ApiException) {
      errorMessage = err.message;
      error.value = err.message;
    } else {
      error.value = errorMessage;
    }
    
    // Show error notification
    showError(
      'Upload Gagal!',
      errorMessage,
      6000
    );
  } finally {
    isLoading.value = false;
  }
};

const goBack = () => {
  router.back();
};

// Initialize
onMounted(() => {
  // Check if user is authenticated
  if (!userStore.isLoggedIn) {
    router.push('/login');
  }
  
  // Pre-fill user ID if available
  if (userStore.user?.id) {
    formData.value.userId = userStore.user.id;
  }
});
</script>

<style scoped>
.upload-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 0;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 1rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
  color: white;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.125rem;
  opacity: 0.9;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.facecam-preview {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
}

.facecam-preview h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.preview-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
}

.preview-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #e5e7eb;
}

.preview-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.preview-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  word-break: break-all;
}

.preview-size {
  font-size: 0.75rem;
  color: #6b7280;
}

.guidelines {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
}

.guidelines h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.guidelines p {
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.guidelines ul {
  color: #6b7280;
  margin-bottom: 0;
  padding-left: 1.5rem;
}

.guidelines li {
  margin-bottom: 0.25rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

@media (max-width: 640px) {
  .preview-container {
    flex-direction: column;
    text-align: center;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
