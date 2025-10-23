// Form Validation Types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

// Form Field Types
export interface FormField {
  value: any;
  error?: string;
  touched: boolean;
}

export interface FormState {
  [key: string]: FormField;
}

// Common Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_WEAK: 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
  USERNAME_INVALID: 'Username must be 3-20 characters, letters and numbers only',
  PHONE_INVALID: 'Please enter a valid phone number',
  BIRTH_DATE_INVALID: 'Please enter a valid birth date (YYYY-MM-DD)',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max: number) => `Must be no more than ${max} characters`,
} as const;

// Validation Patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  BIRTH_DATE: /^\d{4}-\d{2}-\d{2}$/,
} as const;
