import { defineStore } from 'pinia';
import { apiService, ApiException } from '../services/api';
import { UserState, UserActions } from '../types/store';
import {
  RegisterByEmailRequest,
  RegisterByPhoneRequest,
  RegisterByGoogleRequest,
  LoginRequest,
  GoogleLoginRequest,
  CreateDeviceTokenRequest,
  UpdateProfileRequest,
  UpdateSimilarityRequest,
  UserProfileData,
  CurrentUserData,
  UserData,
  TokenData,
} from '../types/apiContracts';

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    currentUser: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  }),

  getters: {
    isLoggedIn: (state): boolean => state.isAuthenticated && !!state.token,
    hasProfile: (state): boolean => !!state.user,
    getToken: (state): TokenData | null => state.token,
    getUser: (state): UserProfileData | null => state.user,
    getCurrentUser: (state): CurrentUserData | null => state.currentUser,
    getError: (state): string | null => state.error,
  },

  actions: {
    // Authentication Actions
    async login(credentials: LoginRequest): Promise<void> {
      console.log('Store: Starting login process');
      this.setLoading(true);
      this.clearError();
      
      try {
        console.log('Store: Calling API login');
        const response = await apiService.auth.login(credentials);
        console.log('Store: API response received:', response);
        console.log('Store: Response structure check:', {
          hasData: !!response.data,
          dataKeys: response.data ? Object.keys(response.data) : [],
          tokenInData: !!response.data?.token
        });
        
        // Token is in response.data.token
        const token = response.data?.token;
        console.log('Store: Token found:', !!token, token);
        
        // If no token found, log the full response for debugging
        if (!token) {
          console.error('Store: No token found in response. Full response:', JSON.stringify(response, null, 2));
        }
        
        if (response.success && token) {
          console.log('Store: Login successful, setting tokens and auth state');
          this.token = token;
          this.isAuthenticated = true;
          
          // Store tokens in localStorage
          localStorage.setItem('access_token', token.access_token);
          localStorage.setItem('refresh_token', token.refresh_token);
          console.log('Store: Tokens stored in localStorage');
          
          // Set currentUser from response if available (includes has_facecam)
          const userData = response.data?.user;
          if (userData) {
            console.log('Store: Setting currentUser from login response');
            this.currentUser = {
              id: userData.id,
              username: userData.username,
              email: userData.email,
              has_facecam: userData.has_facecam,
              created_at: userData.created_at,
              updated_at: userData.updated_at,
            };
          }
          
          // Fetch current user data if not available from response (don't fail login if this fails)
          if (!this.currentUser) {
            try {
              console.log('Store: Fetching current user data');
              await this.fetchCurrentUser();
              console.log('Store: Current user data fetched successfully');
            } catch (userError) {
              console.warn('Store: Failed to fetch current user data:', userError);
              // Don't throw error - login is still successful
            }
          }
          
          console.log('Store: Login process completed, final state:', {
            isAuthenticated: this.isAuthenticated,
            hasToken: !!this.token,
            hasUser: !!this.user,
            hasCurrentUser: !!this.currentUser
          });
        } else {
          console.error('Store: Login response invalid:', response);
        }
      } catch (error) {
        console.error('Store: Login error:', error);
        this.handleError(error);
        throw error;
      } finally {
        this.setLoading(false);
        console.log('Store: Login process finished');
      }
    },

    async googleLogin(credentials: GoogleLoginRequest): Promise<void> {
      console.log('Store: Starting Google login process');
      this.setLoading(true);
      this.clearError();
      
      try {
        console.log('Store: Calling API Google login');
        const response = await apiService.auth.googleLogin(credentials);
        console.log('Store: Google login API response received:', response);
        console.log('Store: Response structure check:', {
          hasData: !!response.data,
          dataKeys: response.data ? Object.keys(response.data) : [],
          tokenInData: !!response.data?.token
        });
        
        // Token is in response.data.token based on backend response
        const token = response.data?.token;
        console.log('Store: Token found:', !!token, token);
        
        // If no token found, log the full response for debugging
        if (!token) {
          console.error('Store: No token found in response. Full response:', JSON.stringify(response, null, 2));
        }
        
        if (response.success && token) {
          console.log('Store: Google login successful, setting tokens and auth state');
          this.token = token;
          this.isAuthenticated = true;
          
          // Store tokens in localStorage
          localStorage.setItem('access_token', token.access_token);
          localStorage.setItem('refresh_token', token.refresh_token);
          console.log('Store: Tokens stored in localStorage');
          
          // Set currentUser from response if available (includes has_facecam)
          const userData = response.data?.user;
          if (userData) {
            console.log('Store: Setting currentUser from Google login response');
            this.currentUser = {
              id: userData.id,
              username: userData.username,
              email: userData.email,
              has_facecam: userData.has_facecam,
              created_at: userData.created_at,
              updated_at: userData.updated_at,
            };
          }
          
          // Fetch current user data if not available from response (don't fail login if this fails)
          if (!this.currentUser) {
            try {
              console.log('Store: Fetching current user data');
              await this.fetchCurrentUser();
              console.log('Store: Current user data fetched successfully');
            } catch (userError) {
              console.warn('Store: Failed to fetch current user data:', userError);
              // Don't throw error - login is still successful
            }
          }

          // Create device token for push notifications (don't fail login if this fails)
          try {
            console.log('Store: Creating device token');
            const deviceTokenData: CreateDeviceTokenRequest = {
              device_token: credentials.device_token,
              platform: credentials.platform
            };
            await apiService.auth.createDeviceToken(deviceTokenData);
            console.log('Store: Device token created successfully');
          } catch (deviceTokenError) {
            console.warn('Store: Failed to create device token:', deviceTokenError);
            // Don't throw error - login is still successful
          }
          
          console.log('Store: Google login process completed, final state:', {
            isAuthenticated: this.isAuthenticated,
            hasToken: !!this.token,
            hasUser: !!this.user,
            hasCurrentUser: !!this.currentUser
          });
        } else {
          console.error('Store: Google login response invalid:', response);
        }
      } catch (error) {
        console.error('Store: Google login error:', error);
        this.handleError(error);
        throw error;
      } finally {
        this.setLoading(false);
        console.log('Store: Google login process finished');
      }
    },

    async logout(): Promise<void> {
      this.setLoading(true);
      this.clearError();
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          await apiService.auth.logout({ refresh_token: refreshToken });
        }
      } catch (error) {
        console.warn('Logout API call failed:', error);
      } finally {
        // Clear state regardless of API call result
        this.clearAuth();
        this.setLoading(false);
      }
    },

    // Registration Actions
    async registerByEmail(data: RegisterByEmailRequest): Promise<void> {
      this.setLoading(true);
      this.clearError();
      
      try {
        const response = await apiService.user.registerByEmail(data);
        
        if (response.success) {
          // Registration successful, user can now login
          console.log('Registration successful');
        }
      } catch (error) {
        this.handleError(error);
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    async registerByPhone(data: RegisterByPhoneRequest): Promise<void> {
      this.setLoading(true);
      this.clearError();
      
      try {
        const response = await apiService.user.registerByPhone(data);
        
        if (response.success) {
          console.log('Phone registration successful');
        }
      } catch (error) {
        this.handleError(error);
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    async registerByGoogle(data: RegisterByGoogleRequest): Promise<void> {
      this.setLoading(true);
      this.clearError();
      
      try {
        const response = await apiService.user.registerByGoogle(data);
        
        if (response.success) {
          console.log('Google registration successful');
        }
      } catch (error) {
        this.handleError(error);
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    // Password Reset Actions
    async requestResetPassword(email: string): Promise<void> {
      this.setLoading(true);
      this.clearError();
      
      try {
        await apiService.passwordReset.requestResetPassword({ email });
      } catch (error) {
        this.handleError(error);
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    async validateResetPassword(email: string, token: string): Promise<boolean> {
      this.setLoading(true);
      this.clearError();
      
      try {
        const response = await apiService.passwordReset.validateResetPassword({ email, token });
        return response.data?.valid || false;
      } catch (error) {
        this.handleError(error);
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    async resetPassword(email: string, password: string, token: string): Promise<void> {
      this.setLoading(true);
      this.clearError();
      
      try {
        await apiService.passwordReset.resetPassword({ email, password }, token);
      } catch (error) {
        this.handleError(error);
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    // Email Verification Actions
    async resendEmailVerification(email: string): Promise<void> {
      this.setLoading(true);
      this.clearError();
      
      try {
        await apiService.emailVerification.resendEmailVerification({ email });
      } catch (error) {
        this.handleError(error);
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    async verifyEmail(token: string, email: string): Promise<void> {
      this.setLoading(true);
      this.clearError();
      
      try {
        await apiService.emailVerification.verifyEmail(token, { email });
      } catch (error) {
        this.handleError(error);
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    // Profile Actions
    async fetchProfile(): Promise<void> {
      this.setLoading(true);
      this.clearError();
      
      try {
        const response = await apiService.profile.getProfile();
        
        if (response.success && response.data) {
          this.user = response.data;
        }
      } catch (error) {
        this.handleError(error);
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    async updateProfile(data: UpdateProfileRequest): Promise<void> {
      this.setLoading(true);
      this.clearError();
      
      try {
        const response = await apiService.profile.updateProfile(data);
        
        if (response.success && response.data) {
          this.user = response.data;
        }
      } catch (error) {
        this.handleError(error);
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    async updateSimilarity(similarity: number): Promise<void> {
      this.setLoading(true);
      this.clearError();
      
      try {
        await apiService.profile.updateSimilarity({ similarity });
      } catch (error) {
        this.handleError(error);
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    async uploadProfileImage(file: File): Promise<string> {
      this.setLoading(true);
      this.clearError();
      
      try {
        const response = await apiService.profile.uploadProfileImage(file);
        
        if (response.success && response.data) {
          // Update profile with new image URL
          if (this.user) {
            this.user.profile_url = response.data.profile_url;
          }
          return response.data.profile_url;
        }
        throw new Error('Upload failed');
      } catch (error) {
        this.handleError(error);
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    async uploadCoverImage(file: File): Promise<string> {
      this.setLoading(true);
      this.clearError();
      
      try {
        const response = await apiService.profile.uploadCoverImage(file);
        
        if (response.success && response.data) {
          // Update profile with new cover URL
          if (this.user) {
            this.user.profile_cover_url = response.data.profile_cover_url;
          }
          return response.data.profile_cover_url;
        }
        throw new Error('Upload failed');
      } catch (error) {
        this.handleError(error);
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    // Current User Actions
    async fetchCurrentUser(): Promise<void> {
      this.setLoading(true);
      this.clearError();
      
      try {
        const response = await apiService.auth.getCurrentUser();
        
        if (response.success && response.data) {
          this.currentUser = response.data;
        }
      } catch (error) {
        this.handleError(error);
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    // Utility Actions
    clearError(): void {
      this.error = null;
    },

    setLoading(loading: boolean): void {
      this.isLoading = loading;
    },

    clearAuth(): void {
      this.user = null;
      this.currentUser = null;
      this.token = null;
      this.isAuthenticated = false;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    },

    // Initialize store from localStorage
    initializeAuth(): void {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (accessToken && refreshToken) {
        this.token = {
          access_token: accessToken,
          refresh_token: refreshToken,
        };
        this.isAuthenticated = true;
      }
    },

    // Error handling
    handleError(error: any): void {
      if (error instanceof ApiException) {
        this.error = error.message;
      } else if (error instanceof Error) {
        this.error = error.message;
      } else {
        this.error = 'An unexpected error occurred';
      }
    },
  },
});
