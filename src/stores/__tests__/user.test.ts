import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from '../user';
import { apiService } from '../../services/api';

// Mock the API service
vi.mock('../../services/api', () => ({
  apiService: {
    auth: {
      login: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
    },
    user: {
      registerByEmail: vi.fn(),
      registerByPhone: vi.fn(),
      registerByGoogle: vi.fn(),
    },
    passwordReset: {
      requestResetPassword: vi.fn(),
      validateResetPassword: vi.fn(),
      resetPassword: vi.fn(),
    },
    emailVerification: {
      resendEmailVerification: vi.fn(),
      verifyEmail: vi.fn(),
    },
    profile: {
      getProfile: vi.fn(),
      updateProfile: vi.fn(),
      updateSimilarity: vi.fn(),
      uploadProfileImage: vi.fn(),
      uploadCoverImage: vi.fn(),
    },
  },
}));

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const store = useUserStore();
      
      expect(store.user).toBeNull();
      expect(store.currentUser).toBeNull();
      expect(store.token).toBeNull();
      expect(store.isAuthenticated).toBe(false);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
    });
  });

  describe('Authentication', () => {
    it('should login successfully', async () => {
      const store = useUserStore();
      const mockResponse = {
        success: true,
        token: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
        },
        data: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
        },
      };

      vi.mocked(apiService.auth.login).mockResolvedValue(mockResponse);
      vi.mocked(apiService.auth.getCurrentUser).mockResolvedValue({
        success: true,
        data: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
        },
      });

      await store.login({
        multiple_param: 'test@example.com',
        password: 'password123',
      });

      expect(store.isAuthenticated).toBe(true);
      expect(store.token).toEqual(mockResponse.token);
      expect(store.currentUser).toBeDefined();
      expect(localStorage.getItem('access_token')).toBe('mock-access-token');
      expect(localStorage.getItem('refresh_token')).toBe('mock-refresh-token');
    });

    it('should handle login failure', async () => {
      const store = useUserStore();
      const mockError = new Error('Invalid credentials');

      vi.mocked(apiService.auth.login).mockRejectedValue(mockError);

      await expect(store.login({
        multiple_param: 'test@example.com',
        password: 'wrongpassword',
      })).rejects.toThrow('Invalid credentials');

      expect(store.isAuthenticated).toBe(false);
      expect(store.error).toBe('Invalid credentials');
    });

    it('should logout successfully', async () => {
      const store = useUserStore();
      
      // Set up authenticated state
      store.token = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
      };
      store.isAuthenticated = true;
      localStorage.setItem('access_token', 'mock-access-token');
      localStorage.setItem('refresh_token', 'mock-refresh-token');

      vi.mocked(apiService.auth.logout).mockResolvedValue({
        success: true,
        data: { valid: true },
      });

      await store.logout();

      expect(store.isAuthenticated).toBe(false);
      expect(store.token).toBeNull();
      expect(store.user).toBeNull();
      expect(store.currentUser).toBeNull();
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });
  });

  describe('Registration', () => {
    it('should register by email successfully', async () => {
      const store = useUserStore();
      const mockResponse = {
        success: true,
        data: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
        },
      };

      vi.mocked(apiService.user.registerByEmail).mockResolvedValue(mockResponse);

      await store.registerByEmail({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        birth_date: '2001-10-05',
      });

      expect(apiService.user.registerByEmail).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        birth_date: '2001-10-05',
      });
    });

    it('should handle registration failure', async () => {
      const store = useUserStore();
      const mockError = new Error('Email already exists');

      vi.mocked(apiService.user.registerByEmail).mockRejectedValue(mockError);

      await expect(store.registerByEmail({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        birth_date: '2001-10-05',
      })).rejects.toThrow('Email already exists');

      expect(store.error).toBe('Email already exists');
    });
  });

  describe('Profile Management', () => {
    it('should fetch profile successfully', async () => {
      const store = useUserStore();
      const mockProfile = {
        id: '1',
        user_id: '1',
        birth_date: '2001-10-05',
        nickname: 'Test User',
        biography: 'Test biography',
        profile_url: 'https://example.com/profile.jpg',
        profile_cover_url: 'https://example.com/cover.jpg',
        similarity: '3',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      };

      vi.mocked(apiService.profile.getProfile).mockResolvedValue({
        success: true,
        data: mockProfile,
      });

      await store.fetchProfile();

      expect(store.user).toEqual(mockProfile);
    });

    it('should update profile successfully', async () => {
      const store = useUserStore();
      const updateData = {
        nickname: 'Updated Name',
        biography: 'Updated biography',
      };

      const mockUpdatedProfile = {
        id: '1',
        user_id: '1',
        birth_date: '2001-10-05',
        nickname: 'Updated Name',
        biography: 'Updated biography',
        profile_url: '',
        profile_cover_url: '',
        similarity: '3',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      };

      vi.mocked(apiService.profile.updateProfile).mockResolvedValue({
        success: true,
        data: mockUpdatedProfile,
      });

      await store.updateProfile(updateData);

      expect(store.user).toEqual(mockUpdatedProfile);
    });
  });

  describe('Utility Methods', () => {
    it('should clear error', () => {
      const store = useUserStore();
      store.error = 'Some error';
      
      store.clearError();
      
      expect(store.error).toBeNull();
    });

    it('should set loading state', () => {
      const store = useUserStore();
      
      store.setLoading(true);
      expect(store.isLoading).toBe(true);
      
      store.setLoading(false);
      expect(store.isLoading).toBe(false);
    });

    it('should clear auth state', () => {
      const store = useUserStore();
      
      // Set up authenticated state
      store.token = { access_token: 'token', refresh_token: 'refresh' };
      store.isAuthenticated = true;
      store.user = {} as any;
      store.currentUser = {} as any;
      localStorage.setItem('access_token', 'token');
      localStorage.setItem('refresh_token', 'refresh');
      
      store.clearAuth();
      
      expect(store.token).toBeNull();
      expect(store.isAuthenticated).toBe(false);
      expect(store.user).toBeNull();
      expect(store.currentUser).toBeNull();
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });

    it('should initialize auth from localStorage', () => {
      const store = useUserStore();
      
      localStorage.setItem('access_token', 'mock-access-token');
      localStorage.setItem('refresh_token', 'mock-refresh-token');
      
      store.initializeAuth();
      
      expect(store.token).toEqual({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
      });
      expect(store.isAuthenticated).toBe(true);
    });
  });
});
