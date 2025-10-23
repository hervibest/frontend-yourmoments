<template>
  <div class="profile-page">
    <div class="profile-container">
      <div class="profile-header">
        <h1 class="profile-title">Profile</h1>
        <BaseButton
          variant="secondary"
          size="sm"
          :is-loading="userStore.isLoading"
          @click="fetchProfile"
        >
          Refresh
        </BaseButton>
      </div>

      <div v-if="userStore.getUser" class="profile-content">
        <!-- Profile Image Section -->
        <div class="profile-image-section">
          <div class="profile-image-container">
            <img
              v-if="userStore.getUser.profile_url"
              :src="userStore.getUser.profile_url"
              :alt="userStore.getUser.nickname"
              class="profile-image"
            />
            <div v-else class="profile-image-placeholder">
              {{ userStore.getUser.nickname?.charAt(0).toUpperCase() }}
            </div>
          </div>
          <div class="image-actions">
            <BaseButton
              variant="secondary"
              size="sm"
              @click="triggerImageUpload"
            >
              Change Photo
            </BaseButton>
            <input
              ref="imageInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleImageUpload"
            />
          </div>
        </div>

        <!-- Profile Information -->
        <div class="profile-info">
          <div class="info-item">
            <label class="info-label">Username</label>
            <p class="info-value">{{ userStore.getUser.nickname || 'Not set' }}</p>
          </div>

          <div class="info-item">
            <label class="info-label">Biography</label>
            <p class="info-value">{{ userStore.getUser.biography || 'No biography set' }}</p>
          </div>

          <div class="info-item">
            <label class="info-label">Birth Date</label>
            <p class="info-value">{{ formatDate(userStore.getUser.birth_date) }}</p>
          </div>

          <div class="info-item">
            <label class="info-label">Similarity</label>
            <p class="info-value">{{ userStore.getUser.similarity }}</p>
          </div>
        </div>

        <!-- Navigation Menu -->
        <div class="profile-navigation">
          <h3 class="nav-title">Quick Actions</h3>
          <div class="nav-grid">
            <router-link to="/explore" class="nav-card">
              <div class="nav-icon">🔍</div>
              <div class="nav-content">
                <h4>Explore Photos</h4>
                <p>Discover and browse similar photos</p>
              </div>
            </router-link>
            
            <router-link to="/creator/discounts" class="nav-card">
              <div class="nav-icon">🎯</div>
              <div class="nav-content">
                <h4>Manage Discounts</h4>
                <p>Create and manage photo discounts</p>
              </div>
            </router-link>
            
            <div class="nav-card" @click="showEditModal = true">
              <div class="nav-icon">✏️</div>
              <div class="nav-content">
                <h4>Edit Profile</h4>
                <p>Update your personal information</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Actions -->
        <div class="profile-actions">
          <BaseButton
            variant="danger"
            @click="handleLogout"
          >
            Logout
          </BaseButton>
        </div>
      </div>

      <div v-else-if="!userStore.isLoading" class="no-profile">
        <p>No profile data available</p>
        <BaseButton
          variant="primary"
          @click="fetchProfile"
        >
          Load Profile
        </BaseButton>
      </div>

      <!-- Edit Profile Modal -->
      <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>Edit Profile</h2>
            <button class="modal-close" @click="closeEditModal">&times;</button>
          </div>

          <BaseForm
            :is-loading="userStore.isLoading"
            :error="userStore.getError"
            @submit="handleUpdateProfile"
          >
            <BaseInput
              v-model="editForm.nickname"
              name="nickname"
              label="Nickname"
              placeholder="Enter your nickname"
              :error="editErrors.nickname"
              @blur="validateEditField('nickname')"
            />

            <BaseInput
              v-model="editForm.biography"
              name="biography"
              label="Biography"
              placeholder="Tell us about yourself"
              :error="editErrors.biography"
              help-text="Maximum 500 characters"
              @blur="validateEditField('biography')"
            />

            <BaseInput
              v-model="editForm.birth_date"
              name="birth_date"
              type="date"
              label="Birth Date"
              :error="editErrors.birth_date"
              @blur="validateEditField('birth_date')"
            />

            <div class="form-actions">
              <BaseButton
                type="submit"
                variant="primary"
                :is-loading="userStore.isLoading"
                loading-text="Updating..."
              >
                Update Profile
              </BaseButton>
              <BaseButton
                type="button"
                variant="secondary"
                @click="closeEditModal"
              >
                Cancel
              </BaseButton>
            </div>
          </BaseForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import BaseForm from '../components/BaseForm.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseButton from '../components/BaseButton.vue';
import { ValidationUtils } from '../utils/validation';
import { UpdateProfileRequest } from '../types/apiContracts';

const router = useRouter();
const userStore = useUserStore();

// Modal state
const showEditModal = ref(false);
const imageInput = ref<HTMLInputElement>();

// Edit form state
const editForm = reactive({
  nickname: '',
  biography: '',
  birth_date: '',
});

const editErrors = reactive<Record<string, string>>({});

// Lifecycle
onMounted(async () => {
  if (!userStore.getUser) {
    await fetchProfile();
  } else {
    // Populate edit form with current data
    editForm.nickname = userStore.getUser.nickname || '';
    editForm.biography = userStore.getUser.biography || '';
    editForm.birth_date = userStore.getUser.birth_date || '';
  }
});

// Methods
const fetchProfile = async () => {
  try {
    await userStore.fetchProfile();
    // Update edit form when profile is loaded
    if (userStore.getUser) {
      editForm.nickname = userStore.getUser.nickname || '';
      editForm.biography = userStore.getUser.biography || '';
      editForm.birth_date = userStore.getUser.birth_date || '';
    }
  } catch (error) {
    console.error('Failed to fetch profile:', error);
  }
};

const handleLogout = async () => {
  try {
    await userStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

const triggerImageUpload = () => {
  imageInput.value?.click();
};

const handleImageUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  try {
    await userStore.uploadProfileImage(file);
  } catch (error) {
    console.error('Image upload failed:', error);
  }
};

const validateEditField = (field: string) => {
  const rules = ValidationUtils.getProfileUpdateRules();
  const error = ValidationUtils.validateField(editForm[field as keyof typeof editForm], rules[field]);
  
  if (error) {
    editErrors[field] = error;
  } else {
    delete editErrors[field];
  }
};

const handleUpdateProfile = async () => {
  const rules = ValidationUtils.getProfileUpdateRules();
  const validationErrors = ValidationUtils.validateForm(editForm, rules);
  
  if (Object.keys(validationErrors).length > 0) {
    Object.assign(editErrors, validationErrors);
    return;
  }

  try {
    await userStore.updateProfile(editForm);
    closeEditModal();
  } catch (error) {
    console.error('Profile update failed:', error);
  }
};

const closeEditModal = () => {
  showEditModal.value = false;
  // Reset form to current values
  if (userStore.getUser) {
    editForm.nickname = userStore.getUser.nickname || '';
    editForm.biography = userStore.getUser.biography || '';
    editForm.birth_date = userStore.getUser.birth_date || '';
  }
  Object.keys(editErrors).forEach(key => delete editErrors[key]);
};

const formatDate = (dateString: string): string => {
  if (!dateString || dateString === '0001-01-01T00:00:00Z') {
    return 'Not set';
  }
  return new Date(dateString).toLocaleDateString();
};
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 2rem;
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.profile-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.profile-content {
  padding: 2rem;
}

.profile-image-section {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.profile-image-container {
  position: relative;
}

.profile-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #e5e7eb;
}

.profile-image-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 700;
  color: #6b7280;
}

.image-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.profile-info {
  margin-bottom: 2rem;
}

.info-item {
  margin-bottom: 1.5rem;
}

.info-label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.info-value {
  color: #6b7280;
  font-size: 1.1rem;
  margin: 0;
}

.profile-navigation {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.nav-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1.5rem 0;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.nav-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
  cursor: pointer;
}

.nav-card:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-icon {
  font-size: 2rem;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.nav-content h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.25rem 0;
}

.nav-content p {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0;
}

.profile-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.no-profile {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

/* Modal Styles */
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
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #374151;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1.5rem;
}

@media (max-width: 768px) {
  .profile-page {
    padding: 1rem;
  }
  
  .profile-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .profile-image-section {
    flex-direction: column;
    text-align: center;
  }
  
  .profile-actions {
    flex-direction: column;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
