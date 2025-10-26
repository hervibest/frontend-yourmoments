<template>
  <nav v-if="isLoggedIn" class="app-navigation">
    <div class="nav-container">
      <div class="nav-brand">
        <router-link to="/explore" class="brand-link">
          <span class="brand-icon">📸</span>
          <span class="brand-text">Fotoyu</span>
        </router-link>
      </div>
      
      <div class="nav-menu">
        <router-link to="/explore" class="nav-link" :class="{ active: $route.path === '/explore' }">
          <i class="icon-grid"></i>
          Explore
        </router-link>
        
        <router-link to="/creator/dashboard" class="nav-link" :class="{ active: $route.path === '/creator/dashboard' }">
          <i class="icon-upload"></i>
          Creator
        </router-link>
        
        <router-link to="/transactions" class="nav-link" :class="{ active: $route.path === '/transactions' }">
          <i class="icon-shopping-bag"></i>
          Pembelian
        </router-link>
        
        <router-link to="/profile" class="nav-link" :class="{ active: $route.path === '/profile' }">
          <i class="icon-user"></i>
          Profile
        </router-link>
      </div>
      
      <div class="nav-actions">
        <div class="cart-indicator" v-if="cartCount > 0">
          <router-link to="/checkout" class="cart-link">
            <i class="icon-cart"></i>
            <span class="cart-count">{{ cartCount }}</span>
          </router-link>
        </div>
        
        <div class="user-menu">
          <div class="user-avatar" @click="toggleUserMenu">
            <img 
              v-if="userStore.getUser?.profile_url" 
              :src="userStore.getUser.profile_url" 
              :alt="userStore.getUser.nickname"
              class="avatar-image"
            />
            <div v-else class="avatar-placeholder">
              {{ userStore.getUser?.nickname?.charAt(0).toUpperCase() || 'U' }}
            </div>
          </div>
          
          <div v-if="showUserMenu" class="user-dropdown">
            <div class="user-info">
              <p class="user-name">{{ userStore.getUser?.nickname || 'User' }}</p>
              <p class="user-email">{{ userStore.getCurrentUser?.email || '' }}</p>
            </div>
            <div class="dropdown-divider"></div>
            <router-link to="/profile" class="dropdown-item">
              <i class="icon-user"></i>
              Profile
            </router-link>
            <router-link to="/transactions" class="dropdown-item">
              <i class="icon-shopping-bag"></i>
              Pembelian Saya
            </router-link>
            <router-link to="/creator/dashboard" class="dropdown-item">
              <i class="icon-upload"></i>
              Creator Dashboard
            </router-link>
            <div class="dropdown-divider"></div>
            <button @click="handleLogout" class="dropdown-item logout">
              <i class="icon-logout"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { apiService } from '../services/api';

const router = useRouter();
const userStore = useUserStore();

// Reactive data
const showUserMenu = ref(false);
const cartCount = ref(0);

// Computed properties
const isLoggedIn = computed(() => userStore.isLoggedIn);

// Methods
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const handleLogout = async () => {
  try {
    await userStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

const loadCartCount = async () => {
  try {
    const response = await apiService.photo.getCart();
    cartCount.value = response.data?.length || 0;
  } catch (error) {
    console.error('Failed to load cart count:', error);
  }
};

const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.user-menu')) {
    showUserMenu.value = false;
  }
};

// Lifecycle
onMounted(() => {
  if (isLoggedIn.value) {
    loadCartCount();
  }
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.app-navigation {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
}

.nav-brand {
  display: flex;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #1f2937;
  font-weight: 700;
  font-size: 1.25rem;
}

.brand-icon {
  font-size: 1.5rem;
}

.brand-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: #6b7280;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.nav-link:hover {
  color: #374151;
  background: #f3f4f6;
}

.nav-link.active {
  color: #667eea;
  background: #f0f4ff;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.cart-indicator {
  position: relative;
}

.cart-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: #6b7280;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all 0.2s;
  position: relative;
}

.cart-link:hover {
  color: #374151;
  background: #f3f4f6;
}

.cart-count {
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  min-width: 1.25rem;
  text-align: center;
  line-height: 1;
}

.user-menu {
  position: relative;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #e5e7eb;
  transition: border-color 0.2s;
}

.user-avatar:hover {
  border-color: #667eea;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #6b7280;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 1000;
}

.user-info {
  padding: 1rem;
}

.user-name {
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.user-email {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.dropdown-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 0.5rem 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: #374151;
  font-weight: 500;
  transition: background 0.2s;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.dropdown-item:hover {
  background: #f3f4f6;
}

.dropdown-item.logout {
  color: #ef4444;
}

.dropdown-item.logout:hover {
  background: #fef2f2;
}

/* Responsive design */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 0.5rem;
  }
  
  .nav-menu {
    gap: 1rem;
  }
  
  .nav-link {
    padding: 0.5rem;
  }
  
  .nav-link span {
    display: none;
  }
  
  .brand-text {
    display: none;
  }
}
</style>
