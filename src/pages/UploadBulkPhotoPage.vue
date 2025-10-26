<template>
  <div class="upload-page">
    <div class="container">
      <div class="header">
        <h1>Upload Multiple Photos</h1>
        <p class="subtitle">Share a collection of your special moments</p>
      </div>

      <BaseForm 
        :isLoading="isLoading" 
        :error="error"
        @submit="handleSubmit"
      >
        <div class="form-content">
          <!-- Bulk Photo Upload -->
          <BaseFileUpload
            v-model="formData.photos"
            name="photos"
            label="Photos"
            accept="image/*"
            :multiple="true"
            :required="true"
            :error="errors.photos"
            helpText="Upload multiple high-quality photos (max 1MB each, up to 10 photos)"
            dragText="Click to upload or drag and drop your photos"
            acceptText="JPG, PNG, GIF, WebP"
            :maxSize="1024 * 1024"
            :maxFiles="10"
            @change="handlePhotosChange"
          />

          <!-- Price Input -->
          <BaseInput
            v-model="formData.price"
            name="price"
            type="number"
            label="Price per Photo (IDR)"
            placeholder="Enter price in Indonesian Rupiah"
            :required="true"
            :error="errors.price"
            helpText="Set the price for each photo in this collection"
            @blur="validatePrice"
          />

          <!-- Location Inputs -->
          <div class="location-group">
            <BaseInput
              v-model="formData.latitude"
              name="latitude"
              type="number"
              step="any"
              label="Latitude"
              placeholder="e.g., -6.175392"
              :required="true"
              :error="errors.latitude"
              helpText="GPS latitude coordinate"
              @blur="validateLatitude"
            />

            <BaseInput
              v-model="formData.longitude"
              name="longitude"
              type="number"
              step="any"
              label="Longitude"
              placeholder="e.g., 106.827153"
              :required="true"
              :error="errors.longitude"
              helpText="GPS longitude coordinate"
              @blur="validateLongitude"
            />
          </div>

          <!-- Description Input -->
          <BaseInput
            v-model="formData.description"
            name="description"
            type="text"
            label="Collection Description"
            placeholder="Describe your photo collection..."
            :required="true"
            :error="errors.description"
            helpText="Tell the story behind this photo collection"
            @blur="validateDescription"
          />

          <!-- Collection Preview -->
          <div v-if="formData.photos && formData.photos.length > 0" class="collection-preview">
            <h3>Collection Preview</h3>
            <div class="preview-grid">
              <div 
                v-for="(photo, index) in formData.photos" 
                :key="index"
                class="preview-item"
              >
                <img 
                  :src="getPhotoPreview(photo)" 
                  :alt="`Preview ${index + 1}`"
                  class="preview-image"
                />
                <div class="preview-info">
                  <span class="preview-name">{{ photo.name }}</span>
                  <span class="preview-size">{{ formatFileSize(photo.size) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Location Helper -->
          <div class="location-helper">
            <h3>Need help getting coordinates?</h3>
            <p>You can get your location coordinates from:</p>
            <ul>
              <li>Google Maps - Right-click on a location and select coordinates</li>
              <li>Your phone's camera app - Check photo details for GPS data</li>
              <li>Online coordinate finder tools</li>
            </ul>
            <button 
              type="button" 
              class="get-location-btn"
              @click="getCurrentLocation"
              :disabled="isGettingLocation"
            >
              {{ isGettingLocation ? 'Getting Location...' : 'Use My Current Location' }}
            </button>
          </div>

          <!-- Submit Button -->
          <div class="form-actions">
            <BaseButton
              type="submit"
              variant="primary"
              size="lg"
              :disabled="!isFormValid || isLoading"
            >
              {{ isLoading ? 'Uploading...' : `Upload ${formData.photos?.length || 0} Photos` }}
            </BaseButton>
            
            <BaseButton
              type="button"
              variant="secondary"
              size="lg"
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
import type { UploadBulkPhotoRequest } from '../types/apiContracts';

const router = useRouter();
const userStore = useUserStore();
const { showSuccess, showError } = useNotification();

// Form data - using string for input fields, converting to numbers for API
const formData = ref({
  photos: [] as File[],
  price: '',
  latitude: '',
  longitude: '',
  description: '',
});

// Form state
const isLoading = ref(false);
const error = ref<string | null>(null);
const isGettingLocation = ref(false);

// Form validation
const errors = ref<Record<string, string | null>>({
  photos: null,
  price: null,
  latitude: null,
  longitude: null,
  description: null,
});

// Computed
const isFormValid = computed(() => {
  return formData.value.photos &&
         formData.value.photos.length > 0 &&
         formData.value.price &&
         formData.value.latitude &&
         formData.value.longitude &&
         formData.value.description &&
         Object.values(errors.value).every(error => !error);
});

// Methods
const handlePhotosChange = (files: File[] | null) => {
  formData.value.photos = files || [];
  validatePhotos();
};

const validatePhotos = () => {
  if (!formData.value.photos || formData.value.photos.length === 0) {
    errors.value.photos = 'At least one photo is required';
    return;
  }
  
  if (formData.value.photos.length > 10) {
    errors.value.photos = 'Maximum 10 photos allowed';
    return;
  }
  
  const oversizedFiles = formData.value.photos.filter(file => file.size > 1024 * 1024);
  if (oversizedFiles.length > 0) {
    errors.value.photos = 'All photos must be less than 1MB';
    return;
  }
  
  errors.value.photos = null;
};

const validatePrice = () => {
  const price = parseFloat(formData.value.price);
  if (!formData.value.price) {
    errors.value.price = 'Price is required';
    return;
  }
  
  if (isNaN(price) || price <= 0) {
    errors.value.price = 'Price must be a positive number';
    return;
  }
  
  errors.value.price = null;
};

const validateLatitude = () => {
  const lat = parseFloat(formData.value.latitude);
  if (!formData.value.latitude) {
    errors.value.latitude = 'Latitude is required';
    return;
  }
  
  if (isNaN(lat) || lat < -90 || lat > 90) {
    errors.value.latitude = 'Latitude must be between -90 and 90';
    return;
  }
  
  errors.value.latitude = null;
};

const validateLongitude = () => {
  const lng = parseFloat(formData.value.longitude);
  if (!formData.value.longitude) {
    errors.value.longitude = 'Longitude is required';
    return;
  }
  
  if (isNaN(lng) || lng < -180 || lng > 180) {
    errors.value.longitude = 'Longitude must be between -180 and 180';
    return;
  }
  
  errors.value.longitude = null;
};

const validateDescription = () => {
  if (!formData.value.description.trim()) {
    errors.value.description = 'Description is required';
    return;
  }
  
  if (formData.value.description.length < 10) {
    errors.value.description = 'Description must be at least 10 characters';
    return;
  }
  
  errors.value.description = null;
};

const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    error.value = 'Geolocation is not supported by this browser';
    return;
  }
  
  isGettingLocation.value = true;
  error.value = null;
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      formData.value.latitude = position.coords.latitude.toString();
      formData.value.longitude = position.coords.longitude.toString();
      validateLatitude();
      validateLongitude();
      isGettingLocation.value = false;
    },
    (err) => {
      error.value = 'Unable to get your location. Please enter coordinates manually.';
      isGettingLocation.value = false;
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000
    }
  );
};

const getPhotoPreview = (file: File): string => {
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
  validatePhotos();
  validatePrice();
  validateLatitude();
  validateLongitude();
  validateDescription();
  
  if (!isFormValid.value) {
    return;
  }
  
  try {
    isLoading.value = true;
    error.value = null;
    
    const uploadData: UploadBulkPhotoRequest = {
      photos: formData.value.photos!,
      price: parseFloat(formData.value.price),
      latitude: parseFloat(formData.value.latitude),
      longitude: parseFloat(formData.value.longitude),
      description: formData.value.description,
    };
    
    await apiService.upload.uploadBulkPhoto(uploadData);
    
    // Show success notification
    showSuccess(
      'Upload Berhasil!',
      `${formData.value.photos!.length} foto telah berhasil diupload dan akan segera diproses.`,
      4000
    );
    
    // Redirect to creator dashboard after a short delay
    setTimeout(() => {
      router.push('/creator/dashboard');
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
});
</script>

<style scoped>
.upload-page {
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

.location-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.collection-preview {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
}

.collection-preview h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.preview-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.preview-info {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
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

.location-helper {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
}

.location-helper h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.location-helper p {
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.location-helper ul {
  color: #6b7280;
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.location-helper li {
  margin-bottom: 0.25rem;
}

.get-location-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.get-location-btn:hover:not(:disabled) {
  background: #2563eb;
}

.get-location-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

@media (max-width: 640px) {
  .location-group {
    grid-template-columns: 1fr;
  }
  
  .preview-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
