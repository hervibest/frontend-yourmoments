// Base API Response Interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// User Registration Types
export interface RegisterByEmailRequest {
  username: string;
  email: string;
  password: string;
  birth_date: string;
}

export interface RegisterByPhoneRequest {
  username: string;
  password: string;
  phone_number: string;
  birth_date: string;
}

export interface RegisterByGoogleRequest {
  // Google OAuth data structure
  token: string; // JWT token from Google
  device_token: string; // FCM device token
  platform: 'WEB' | 'ANDROID' | 'IOS';
}

export interface UserRegistrationData {
  id: string;
  username: string;
  email: string;
  phone_number?: string;
  google_id?: string;
  created_at: string;
  updated_at: string;
}

export interface RegisterByEmailResponse extends ApiResponse<UserRegistrationData> {}
export interface RegisterByPhoneResponse extends ApiResponse<UserRegistrationData> {}
export interface RegisterByGoogleResponse extends ApiResponse<UserRegistrationData> {}

// Authentication Types
export interface LoginRequest {
  multiple_param: string; // Can be email, username, or phone
  password: string;
}

export interface GoogleLoginRequest {
  token: string; // JWT token from Google
  device_token: string; // FCM device token
  platform: 'WEB' | 'ANDROID' | 'IOS';
}

export interface UserData {
  id: string;
  username: string;
  email: string;
  email_verified_at?: string;
  phone_number?: string;
  google_id?: string;
  has_facecam?: boolean;
  created_at: string;
  updated_at: string;
}

export interface TokenData {
  access_token: string;
  refresh_token: string;
}

export interface LoginData {
  user: UserData;
  token: TokenData;
}

export interface LoginResponse extends ApiResponse<LoginData> {}

export interface GoogleLoginData {
  user: UserData;
  token: TokenData;
}

export interface GoogleLoginResponse extends ApiResponse<GoogleLoginData> {}

// Device Token Types
export interface CreateDeviceTokenRequest {
  device_token: string;
  platform: 'WEB' | 'ANDROID' | 'IOS';
}

export interface CreateDeviceTokenResponse extends ApiResponse {}

// Password Reset Types
export interface RequestResetPasswordRequest {
  email: string;
}

export interface ValidateResetPasswordRequest {
  email: string;
  token: string;
}

export interface ResetPasswordRequest {
  email: string;
  password: string;
}

export interface RequestResetPasswordResponse extends ApiResponse {}
export interface ValidateResetPasswordResponse extends ApiResponse<{ valid: boolean }> {}
export interface ResetPasswordResponse extends ApiResponse {}

// Email Verification Types
export interface ResendEmailVerificationRequest {
  email: string;
}

export interface VerifyEmailRequest {
  email: string;
}

export interface ResendEmailVerificationResponse extends ApiResponse {}
export interface VerifyEmailResponse extends ApiResponse {}

// User Profile Types
export interface UserProfileData {
  id: string;
  user_id: string;
  birth_date: string;
  nickname: string;
  biography: string;
  profile_url: string;
  profile_cover_url: string;
  similarity: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileRequest {
  birth_date?: string;
  nickname?: string;
  biography?: string;
}

export interface UpdateSimilarityRequest {
  similarity: number;
}

export interface GetProfileResponse extends ApiResponse<UserProfileData> {}
export interface UpdateProfileResponse extends ApiResponse<UserProfileData> {}
export interface UpdateSimilarityResponse extends ApiResponse {}

// Current User Types
export interface CurrentUserData {
  id: string;
  username: string;
  email: string;
  has_facecam?: boolean;
  created_at: string;
  updated_at: string;
}

export interface GetCurrentUserResponse extends ApiResponse<CurrentUserData> {}

// Logout Types
export interface LogoutRequest {
  refresh_token: string;
}

export interface LogoutResponse extends ApiResponse<{ valid: boolean }> {}

// File Upload Types
export interface UploadProfileImageResponse extends ApiResponse<{ profile_url: string }> {}
export interface UploadCoverImageResponse extends ApiResponse<{ profile_cover_url: string }> {}

// Error Types
export interface ApiError {
  success: false;
  message: string;
  error?: string;
  code?: number;
}

// Photo Service Types
export interface PhotoStage {
  is_wishlist: boolean;
  is_resend: boolean;
  is_cart: boolean;
  is_favorite: boolean;
}

export interface PhotoUrl {
  collection_url?: string;
  is_this_you_url?: string;
}

export interface PhotoDiscount {
  id?: string;
  name: string;
  min_quantity: number;
  discount_type: 'PERCENT' | 'FIXED';
  value: number;
  is_active: boolean;
  amount?: number;
  type?: 'PERCENT' | 'FIXED';
}

export interface Photo {
  photo_id: string;
  user_id: string;
  similarity: number;
  stage: PhotoStage;
  creator_id: string;
  title: string;
  url: PhotoUrl;
  price: number;
  price_str: string;
  discount?: PhotoDiscount;
  original_at: string;
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  page: number;
  size: number;
  offset: number;
  total_item: number;
  total_page: number;
  has_next: boolean;
  has_previous: boolean;
  next_page_url: string;
  previous_page_url: string;
}

export interface PhotoListResponse extends ApiResponse<Photo[]> {
  pagination: Pagination;
}

// Explore API Types
export interface GetExploreRequest {
  page?: number;
  size?: number;
}

export interface GetExploreResponse extends PhotoListResponse {}

// Wishlist API Types
export interface AddWishlistRequest {
  photo_id: string;
}

export interface AddWishlistResponse extends ApiResponse {}

export interface GetWishlistResponse extends PhotoListResponse {}

export interface DeleteWishlistRequest {
  photo_id: string;
}

export interface DeleteWishlistResponse extends ApiResponse {}

// Favorite API Types
export interface AddFavoriteRequest {
  photo_id: string;
}

export interface AddFavoriteResponse extends ApiResponse {}

export interface GetFavoriteResponse extends PhotoListResponse {}

export interface DeleteFavoriteRequest {
  photo_id: string;
}

export interface DeleteFavoriteResponse extends ApiResponse {}

// Cart API Types
export interface AddCartRequest {
  photo_id: string;
}

export interface AddCartResponse extends ApiResponse {}

export interface GetCartResponse extends PhotoListResponse {}

export interface DeleteCartRequest {
  photo_id: string;
}

export interface DeleteCartResponse extends ApiResponse {}

// Checkout API Types
export interface CheckoutItem {
  photo_id: string;
  creator_id: string;
  title: string;
  your_moments_url: string;
  price: number;
  discount?: PhotoDiscount;
  final_price: number;
}

export interface CheckoutPreviewData {
  items: CheckoutItem[];
  total_price: number;
  total_discount: number;
  created_at: string;
}

export interface CheckoutPreviewRequest {
  photo_ids: string[];
}

export interface CheckoutPreviewResponse extends ApiResponse<CheckoutPreviewData> {}

// Discount API Types
export interface CreateDiscountRequest {
  name: string;
  min_quantity: number;
  discount_type: 'PERCENT' | 'FIXED';
  value: number;
  is_active: boolean;
}

export interface Discount {
  id: string;
  creator_id: string;
  name: string;
  min_quantity: number;
  discount_type: 'PERCENT' | 'FIXED';
  value: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateDiscountResponse extends ApiResponse<Discount> {}
export interface GetDiscountResponse extends ApiResponse<Discount> {}
export interface GetDiscountsResponse extends ApiResponse<Discount[]> {}
export interface ActivateDiscountResponse extends ApiResponse {}
export interface DeactivateDiscountResponse extends ApiResponse {}

// Bulk Photo API Types
export interface GetBulkPhotoDetailRequest {
  bulkPhotoId: string;
}

export interface GetBulkPhotoDetailResponse extends ApiResponse<Photo> {}

// Upload Service Types
export interface UploadSinglePhotoRequest {
  photo: File;
  price: number;
  latitude: number;
  longitude: number;
  description: string;
}

export interface UploadBulkPhotoRequest {
  photos: File[];
  price: number;
  latitude: number;
  longitude: number;
  description: string;
}

export interface UploadFacecamRequest {
  facecam: File;
  userId: string;
}

export interface UploadResponse extends ApiResponse {}

// Transaction Service Types
export interface TransactionItem {
  photo_id: string;
  creator_id: string;
  title: string;
  price: number;
  final_price: number;
  discount?: {
    id: string;
    amount: number;
    min_quantity: number;
    value: number;
    type: 'PERCENT' | 'FIXED';
  };
}

export interface CreateTransactionRequest {
  items: TransactionItem[];
  total_price: number;
  total_discount: number;
}

export interface TransactionDetail {
  transaction_detail_id: string;
  creator_id: string;
  creator_discount_id: string;
  is_reviewed: boolean;
  photos: TransactionPhoto[];
}

export interface TransactionPhoto {
  photo_id: string;
  price: number;
  discount: {
    Int32: number;
    Valid: boolean;
  };
  final_price: number;
  url: string;
  title: string;
  latitude: number;
  longitude: number;
  description: string;
  photo_original_at: string;
  photo_created_at: string;
  photo_updated_at: string;
  file_name: string;
  size: number;
  type: string;
  width: number;
  height: number;
  your_moments_type: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'CANCELLED';
  payment_at: string;
  checkout_at: string;
  amount: number;
}

export interface TransactionDetailResponse {
  transaction_id: string;
  user_id: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'CANCELLED';
  payment_at: string;
  checkout_at: string;
  amount: number;
  transaction_created_at: string;
  transaction_updated_at: string;
  transaction_detail_response: TransactionDetail[];
}

export interface GetTransactionsResponse extends ApiResponse<Transaction[]> {
  pagination: Pagination;
}

export interface GetTransactionDetailResponse extends ApiResponse<TransactionDetailResponse> {}

export interface CreateTransactionResponse extends ApiResponse<{ 
  transaction_id: string;
  snap_token: string;
  redirect_url: string;
}> {}

// Review Types
export interface Review {
  Id: string;
  TransactionDetailId: string;
  CreatorId: string;
  UserId: string;
  Rating: number;
  Comment: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface CreateReviewRequest {
  transaction_detail_id: string;
  creator_id: string;
  rating: number;
  comment: string;
}

export interface CreateReviewResponse extends ApiResponse<Review> {}

export interface GetReviewsResponse extends ApiResponse<Review[]> {
  pagination: Pagination;
}

// Wallet Types
export interface Wallet {
  id: string;
  creator_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface BankWallet {
  Id: string;
  WalletId: string;
  BankId: string;
  FullName: string;
  AccountNumber: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  transaction_detail_id: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface Bank {
  id: string;
  bank_code: string;
  name: string;
  alias: string;
  swift_code: string;
  logo_url: string;
  created_at: string;
  updated_at: string;
}

export interface AddBankRequest {
  bank_id: string;
  full_name: string;
  account_number: string;
}

export interface AddBankResponse extends ApiResponse<BankWallet> {}

export interface GetBanksResponse extends ApiResponse<BankWallet[]> {}

export interface GetBankListResponse extends ApiResponse<Bank[]> {}

export interface GetWalletResponse extends ApiResponse<Wallet> {}

export interface GetWalletTransactionsResponse extends ApiResponse<WalletTransaction[]> {
  pagination: Pagination;
}

export interface DeleteBankResponse extends ApiResponse {}

// HTTP Status Codes
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
}
