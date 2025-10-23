import { UserProfileData, CurrentUserData, TokenData } from './apiContracts';

// Store State Types
export interface UserState {
  user: UserProfileData | null;
  currentUser: CurrentUserData | null;
  token: TokenData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Store Actions
export interface UserActions {
  // Authentication
  login: (credentials: { multiple_param: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  registerByEmail: (data: {
    username: string;
    email: string;
    password: string;
    birth_date: string;
  }) => Promise<void>;
  registerByPhone: (data: {
    username: string;
    password: string;
    phone_number: string;
    birth_date: string;
  }) => Promise<void>;
  registerByGoogle: (data: {
    google_id: string;
    email: string;
    name: string;
    picture?: string;
  }) => Promise<void>;

  // Password Management
  requestResetPassword: (email: string) => Promise<void>;
  validateResetPassword: (email: string, token: string) => Promise<boolean>;
  resetPassword: (email: string, password: string, token: string) => Promise<void>;

  // Email Verification
  resendEmailVerification: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;

  // Profile Management
  fetchProfile: () => Promise<void>;
  updateProfile: (data: {
    birth_date?: string;
    nickname?: string;
    biography?: string;
  }) => Promise<void>;
  updateSimilarity: (similarity: number) => Promise<void>;
  uploadProfileImage: (file: File) => Promise<string>;
  uploadCoverImage: (file: File) => Promise<string>;

  // Current User
  fetchCurrentUser: () => Promise<void>;

  // Utility
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

// Store Getters
export interface UserGetters {
  isAuthenticated: boolean;
  user: UserProfileData | null;
  currentUser: CurrentUserData | null;
  token: TokenData | null;
  isLoading: boolean;
  error: string | null;
}
