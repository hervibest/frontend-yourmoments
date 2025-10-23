import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import {
  // Registration Types
  RegisterByEmailRequest,
  RegisterByEmailResponse,
  RegisterByPhoneRequest,
  RegisterByPhoneResponse,
  RegisterByGoogleRequest,
  RegisterByGoogleResponse,
  
  // Authentication Types
  LoginRequest,
  LoginResponse,
  GoogleLoginRequest,
  GoogleLoginResponse,
  CreateDeviceTokenRequest,
  CreateDeviceTokenResponse,
  
  // Password Reset Types
  RequestResetPasswordRequest,
  RequestResetPasswordResponse,
  ValidateResetPasswordRequest,
  ValidateResetPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  
  // Email Verification Types
  ResendEmailVerificationRequest,
  ResendEmailVerificationResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  
  // Profile Types
  GetProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  UpdateSimilarityRequest,
  UpdateSimilarityResponse,
  
  // Current User Types
  GetCurrentUserResponse,
  
  // Logout Types
  LogoutRequest,
  LogoutResponse,
  
  // File Upload Types
  UploadProfileImageResponse,
  UploadCoverImageResponse,
  
  // Upload Service Types
  UploadSinglePhotoRequest,
  UploadBulkPhotoRequest,
  UploadFacecamRequest,
  UploadResponse,
  
  // Transaction Service Types
  CreateTransactionRequest,
  GetTransactionsResponse,
  GetTransactionDetailResponse,
  CreateTransactionResponse,
  
  // Review Types
  Review,
  CreateReviewRequest,
  CreateReviewResponse,
  GetReviewsResponse,
  
  // Wallet Types
  Wallet,
  BankWallet,
  WalletTransaction,
  AddBankRequest,
  AddBankResponse,
  GetBanksResponse,
  GetBankListResponse,
  GetWalletResponse,
  GetWalletTransactionsResponse,
  DeleteBankResponse,
  
  // Photo Service Types
  GetExploreRequest,
  GetExploreResponse,
  AddWishlistRequest,
  AddWishlistResponse,
  GetWishlistResponse,
  DeleteWishlistRequest,
  DeleteWishlistResponse,
  AddFavoriteRequest,
  AddFavoriteResponse,
  GetFavoriteResponse,
  DeleteFavoriteRequest,
  DeleteFavoriteResponse,
  AddCartRequest,
  AddCartResponse,
  GetCartResponse,
  DeleteCartRequest,
  DeleteCartResponse,
  CheckoutPreviewRequest,
  CheckoutPreviewResponse,
  CreateDiscountRequest,
  CreateDiscountResponse,
  GetDiscountResponse,
  GetDiscountsResponse,
  ActivateDiscountResponse,
  DeactivateDiscountResponse,
  GetBulkPhotoDetailRequest,
  GetBulkPhotoDetailResponse,
  
  // Error Types
  ApiError,
  HttpStatus,
} from '../types/apiContracts';

// API Configuration
const USER_API_CONFIG = {
  baseURL: import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:8003',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

const PHOTO_API_CONFIG = {
  baseURL: import.meta.env.VITE_PHOTO_SERVICE_URL || 'http://localhost:8081',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

const UPLOAD_API_CONFIG = {
  baseURL: import.meta.env.VITE_UPLOAD_SERVICE_URL || 'http://localhost:8082',
  timeout: 30000, // Longer timeout for file uploads
  headers: {
    'Content-Type': 'multipart/form-data',
  },
};

const TRANSACTION_API_CONFIG = {
  baseURL: import.meta.env.VITE_TRANSACTION_SERVICE_URL || 'http://localhost:8083',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Create axios instances
const userApi: AxiosInstance = axios.create(USER_API_CONFIG);
const photoApi: AxiosInstance = axios.create(PHOTO_API_CONFIG);
const uploadApi: AxiosInstance = axios.create(UPLOAD_API_CONFIG);
const transactionApi: AxiosInstance = axios.create(TRANSACTION_API_CONFIG);

// Request interceptor for adding auth token
const addAuthInterceptor = (apiInstance: AxiosInstance) => {
  apiInstance.interceptors.request.use(
    (config) => {
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for handling errors
  apiInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
      return response;
    },
    (error: AxiosError) => {
      console.log(`❌ API Error: ${error.response?.status} ${error.config?.url}`);
      if (error.response?.status === HttpStatus.UNAUTHORIZED) {
        // Clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

// Apply interceptors to all APIs
addAuthInterceptor(userApi);
addAuthInterceptor(photoApi);
addAuthInterceptor(uploadApi);
addAuthInterceptor(transactionApi);

// Custom error class for API errors
export class ApiException extends Error {
  constructor(
    public message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

// Generic API call wrapper with error handling
async function apiCall<T>(
  apiFunction: () => Promise<AxiosResponse<T>>
): Promise<T> {
  try {
    const response = await apiFunction();
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      const message = axiosError.response?.data?.message || axiosError.message;
      const status = axiosError.response?.status || 500;
      throw new ApiException(message, status, axiosError.response?.data);
    }
    throw new ApiException('An unexpected error occurred', 500);
  }
}

// User Registration API
export const userRegistrationApi = {
  registerByEmail: (data: RegisterByEmailRequest): Promise<RegisterByEmailResponse> =>
    apiCall(() => userApi.post('/api/user/register/email', data)),

  registerByPhone: (data: RegisterByPhoneRequest): Promise<RegisterByPhoneResponse> =>
    apiCall(() => userApi.post('/api/user/register/phone', data)),

  registerByGoogle: (data: RegisterByGoogleRequest): Promise<RegisterByGoogleResponse> =>
    apiCall(() => userApi.post('/api/user/register/google', data)),
};

// Authentication API
export const authApi = {
  login: (data: LoginRequest): Promise<LoginResponse> =>
    apiCall(() => userApi.post('/api/user/login', data)),

  googleLogin: (data: GoogleLoginRequest): Promise<GoogleLoginResponse> =>
    apiCall(() => userApi.post('/api/user/register/google', data)),

  logout: (data: LogoutRequest): Promise<LogoutResponse> =>
    apiCall(() => userApi.delete('/api/users/logout', { data })),

  getCurrentUser: (): Promise<GetCurrentUserResponse> =>
    apiCall(() => userApi.get('/api/users/current')),

  createDeviceToken: (data: CreateDeviceTokenRequest): Promise<CreateDeviceTokenResponse> =>
    apiCall(() => userApi.post('/api/user/device-token', data)),
};

// Password Reset API
export const passwordResetApi = {
  requestResetPassword: (data: RequestResetPasswordRequest): Promise<RequestResetPasswordResponse> =>
    apiCall(() => userApi.post('/api/user/reset-password/request', data)),

  validateResetPassword: (data: ValidateResetPasswordRequest): Promise<ValidateResetPasswordResponse> =>
    apiCall(() => userApi.post('/api/user/reset-password/validate', data)),

  resetPassword: (data: ResetPasswordRequest, token: string): Promise<ResetPasswordResponse> =>
    apiCall(() => userApi.post(`/api/user/reset-password/reset/${token}`, data)),
};

// Email Verification API
export const emailVerificationApi = {
  resendEmailVerification: (data: ResendEmailVerificationRequest): Promise<ResendEmailVerificationResponse> =>
    apiCall(() => userApi.post('/api/user/request-resend-email', data)),

  verifyEmail: (token: string): Promise<VerifyEmailResponse> =>
    apiCall(() => userApi.post(`/api/user/verify/${token}`)),
};

// User Profile API
export const userProfileApi = {
  getProfile: (): Promise<GetProfileResponse> =>
    apiCall(() => userApi.get('/api/users/profile')),

  updateProfile: (data: UpdateProfileRequest): Promise<UpdateProfileResponse> =>
    apiCall(() => userApi.put('/api/users/profile', data)),

  updateSimilarity: (data: UpdateSimilarityRequest): Promise<UpdateSimilarityResponse> =>
    apiCall(() => userApi.put('/api/users/similarity', data)),

  uploadProfileImage: (file: File): Promise<UploadProfileImageResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiCall(() => userApi.post('/api/users/profile/upload-profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }));
  },

  uploadCoverImage: (file: File): Promise<UploadCoverImageResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiCall(() => userApi.post('/api/users/profile/upload-profile-cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }));
  },
};

// Photo Service API
export const photoServiceApi = {
  // Explore API
  getExplore: (params?: GetExploreRequest): Promise<GetExploreResponse> =>
    apiCall(() => photoApi.get('/api/explore', { params })),

  // Wishlist API
  getWishlist: (): Promise<GetWishlistResponse> =>
    apiCall(() => photoApi.get('/api/explore/wishlist')),

  addWishlist: (data: AddWishlistRequest): Promise<AddWishlistResponse> =>
    apiCall(() => photoApi.patch('/api/explore/wishlist', data)),

  deleteWishlist: (data: DeleteWishlistRequest): Promise<DeleteWishlistResponse> =>
    apiCall(() => photoApi.delete('/api/explore/wishlist/delete', { data })),

  // Favorite API
  getFavorite: (): Promise<GetFavoriteResponse> =>
    apiCall(() => photoApi.get('/api/explore/favorite')),

  addFavorite: (data: AddFavoriteRequest): Promise<AddFavoriteResponse> =>
    apiCall(() => photoApi.patch('/api/explore/favorite', data)),

  deleteFavorite: (data: DeleteFavoriteRequest): Promise<DeleteFavoriteResponse> =>
    apiCall(() => photoApi.delete('/api/explore/favorite/delete', { data })),

  // Cart API
  getCart: (): Promise<GetCartResponse> =>
    apiCall(() => photoApi.get('/api/explore/cart')),

  addCart: (data: AddCartRequest): Promise<AddCartResponse> =>
    apiCall(() => photoApi.patch('/api/explore/cart', data)),

  deleteCart: (data: DeleteCartRequest): Promise<DeleteCartResponse> =>
    apiCall(() => photoApi.delete('/api/explore/cart/delete', { data })),

  // Checkout API
  checkoutPreview: (data: CheckoutPreviewRequest): Promise<CheckoutPreviewResponse> =>
    apiCall(() => photoApi.post('/api/checkout/preview', data)),

  // Discount API
  createDiscount: (data: CreateDiscountRequest): Promise<CreateDiscountResponse> =>
    apiCall(() => photoApi.post('/api/discount/create', data)),

  getDiscounts: (): Promise<GetDiscountsResponse> =>
    apiCall(() => photoApi.get('/api/discount')),

  getDiscount: (discountId: string): Promise<GetDiscountResponse> =>
    apiCall(() => photoApi.get(`/api/discount/${discountId}`)),

  activateDiscount: (discountId: string): Promise<ActivateDiscountResponse> =>
    apiCall(() => photoApi.put(`/api/discount/activate/${discountId}`)),

  deactivateDiscount: (discountId: string): Promise<DeactivateDiscountResponse> =>
    apiCall(() => photoApi.put(`/api/discount/deactivate/${discountId}`)),

  // Bulk Photo API
  getBulkPhotoDetail: (bulkPhotoId: string): Promise<GetBulkPhotoDetailResponse> =>
    apiCall(() => photoApi.get(`/api/photo/${bulkPhotoId}`)),
};

// Upload Service API
export const uploadServiceApi = {
  // Single Photo Upload (for creators)
  uploadSinglePhoto: (data: UploadSinglePhotoRequest): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('photo', data.photo);
    formData.append('price', data.price.toString());
    formData.append('latitude', data.latitude.toString());
    formData.append('longitude', data.longitude.toString());
    formData.append('description', data.description);
    
    return apiCall(() => uploadApi.post('/api/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }));
  },

  // Bulk Photo Upload (for creators)
  uploadBulkPhoto: (data: UploadBulkPhotoRequest): Promise<UploadResponse> => {
    const formData = new FormData();
    
    // Append multiple photos
    data.photos.forEach((photo, index) => {
      formData.append('photo', photo);
    });
    
    formData.append('price', data.price.toString());
    formData.append('latitude', data.latitude.toString());
    formData.append('longitude', data.longitude.toString());
    formData.append('description', data.description);
    
    return apiCall(() => uploadApi.post('/api/upload/bulk', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }));
  },

  // Facecam Upload (for all users)
  uploadFacecam: (data: UploadFacecamRequest): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('facecam', data.facecam);
    formData.append('userId', data.userId);
    
    return apiCall(() => uploadApi.post('/api/upload/facecam/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }));
  },
};

// Transaction Service API
export const transactionServiceApi = {
  // Get all transactions
  getTransactions: (params?: { page?: number; size?: number }): Promise<GetTransactionsResponse> =>
    apiCall(() => transactionApi.get('/api/transaction', { params })),

  // Get transaction detail by ID
  getTransactionDetail: (transactionId: string): Promise<GetTransactionDetailResponse> =>
    apiCall(() => transactionApi.get(`/api/transaction/${transactionId}`)),

  // Create transaction (buy photos)
  createTransaction: (data: CreateTransactionRequest): Promise<CreateTransactionResponse> =>
    apiCall(() => transactionApi.post('/api/v2/transaction/create', data)),

  // Review API
  createReview: (data: CreateReviewRequest): Promise<CreateReviewResponse> =>
    apiCall(() => transactionApi.post('/api/review/create', data)),

  getReviews: (): Promise<GetReviewsResponse> =>
    apiCall(() => transactionApi.get('/api/review')),

  // Wallet API
  getWallet: (): Promise<GetWalletResponse> =>
    apiCall(() => transactionApi.get('/api/wallet')),

  addBank: (data: AddBankRequest): Promise<AddBankResponse> =>
    apiCall(() => transactionApi.post('/api/wallet/bank/add', data)),

  getBanks: (): Promise<GetBanksResponse> =>
    apiCall(() => transactionApi.get('/api/wallet/bank')),

  getBankList: (): Promise<GetBankListResponse> =>
    apiCall(() => transactionApi.get('/api/bank')),

  deleteBank: (bankWalletId: string): Promise<DeleteBankResponse> =>
    apiCall(() => transactionApi.delete(`/api/wallet/bank/delete/${bankWalletId}`)),

  getWalletTransactions: (params?: { 
    page?: number; 
    size?: number; 
    order?: 'ASC' | 'DESC'; 
    max?: number; 
    min?: number; 
  }): Promise<GetWalletTransactionsResponse> =>
    apiCall(() => transactionApi.get('/api/wallet/transaction', { params })),
};

// Export all APIs
export const apiService = {
  user: userRegistrationApi,
  auth: authApi,
  passwordReset: passwordResetApi,
  emailVerification: emailVerificationApi,
  profile: userProfileApi,
  photo: photoServiceApi,
  upload: uploadServiceApi,
  transaction: transactionServiceApi,
};

// Legacy exports for backward compatibility
export const registerByEmail = userRegistrationApi.registerByEmail;
export const registerByPhone = userRegistrationApi.registerByPhone;
export const registerByGoogle = userRegistrationApi.registerByGoogle;
export const login = authApi.login;
export const getProfile = userProfileApi.getProfile;
