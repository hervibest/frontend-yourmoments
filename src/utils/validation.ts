import { ValidationRule, ValidationErrors, VALIDATION_PATTERNS, VALIDATION_MESSAGES } from '../types/validation';

// Validation utility functions
export class ValidationUtils {
  static validateField(value: any, rules: ValidationRule): string | null {
    // Required validation
    if (rules.required && (!value || value.toString().trim() === '')) {
      return VALIDATION_MESSAGES.REQUIRED;
    }

    // Skip other validations if value is empty and not required
    if (!value || value.toString().trim() === '') {
      return null;
    }

    // Min length validation
    if (rules.minLength && value.toString().length < rules.minLength) {
      return VALIDATION_MESSAGES.MIN_LENGTH(rules.minLength);
    }

    // Max length validation
    if (rules.maxLength && value.toString().length > rules.maxLength) {
      return VALIDATION_MESSAGES.MAX_LENGTH(rules.maxLength);
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value.toString())) {
      return this.getPatternErrorMessage(rules.pattern);
    }

    // Custom validation
    if (rules.custom) {
      return rules.custom(value);
    }

    return null;
  }

  static validateForm(data: Record<string, any>, rules: Record<string, ValidationRule>): ValidationErrors {
    const errors: ValidationErrors = {};

    for (const [field, fieldRules] of Object.entries(rules)) {
      const error = this.validateField(data[field], fieldRules);
      if (error) {
        errors[field] = error;
      }
    }

    return errors;
  }

  private static getPatternErrorMessage(pattern: RegExp): string {
    if (pattern === VALIDATION_PATTERNS.EMAIL) {
      return VALIDATION_MESSAGES.EMAIL_INVALID;
    }
    if (pattern === VALIDATION_PATTERNS.USERNAME) {
      return VALIDATION_MESSAGES.USERNAME_INVALID;
    }
    if (pattern === VALIDATION_PATTERNS.PHONE) {
      return VALIDATION_MESSAGES.PHONE_INVALID;
    }
    if (pattern === VALIDATION_PATTERNS.PASSWORD) {
      return VALIDATION_MESSAGES.PASSWORD_WEAK;
    }
    if (pattern === VALIDATION_PATTERNS.BIRTH_DATE) {
      return VALIDATION_MESSAGES.BIRTH_DATE_INVALID;
    }
    return 'Invalid format';
  }

  // Specific validation methods
  static validateEmail(email: string): string | null {
    return this.validateField(email, {
      required: true,
      pattern: VALIDATION_PATTERNS.EMAIL,
    });
  }

  static validatePassword(password: string): string | null {
    return this.validateField(password, {
      required: true,
      minLength: 8,
      pattern: VALIDATION_PATTERNS.PASSWORD,
    });
  }

  static validateUsername(username: string): string | null {
    return this.validateField(username, {
      required: true,
      minLength: 3,
      maxLength: 20,
      pattern: VALIDATION_PATTERNS.USERNAME,
    });
  }

  static validatePhone(phone: string): string | null {
    return this.validateField(phone, {
      required: true,
      pattern: VALIDATION_PATTERNS.PHONE,
    });
  }

  static validateBirthDate(birthDate: string): string | null {
    return this.validateField(birthDate, {
      required: true,
      pattern: VALIDATION_PATTERNS.BIRTH_DATE,
    });
  }

  // Form validation rules
  static getRegistrationRules() {
    return {
      username: {
        required: true,
        minLength: 3,
        maxLength: 20,
        pattern: VALIDATION_PATTERNS.USERNAME,
      },
      email: {
        required: true,
        pattern: VALIDATION_PATTERNS.EMAIL,
      },
      password: {
        required: true,
        minLength: 8,
        pattern: VALIDATION_PATTERNS.PASSWORD,
      },
      birth_date: {
        required: true,
        pattern: VALIDATION_PATTERNS.BIRTH_DATE,
      },
    };
  }

  static getPhoneRegistrationRules() {
    return {
      username: {
        required: true,
        minLength: 3,
        maxLength: 20,
        pattern: VALIDATION_PATTERNS.USERNAME,
      },
      phone_number: {
        required: true,
        pattern: VALIDATION_PATTERNS.PHONE,
      },
      password: {
        required: true,
        minLength: 8,
        pattern: VALIDATION_PATTERNS.PASSWORD,
      },
      birth_date: {
        required: true,
        pattern: VALIDATION_PATTERNS.BIRTH_DATE,
      },
    };
  }

  static getLoginRules() {
    return {
      multiple_param: {
        required: true,
      },
      password: {
        required: true,
      },
    };
  }

  static getProfileUpdateRules() {
    return {
      nickname: {
        maxLength: 50,
      },
      biography: {
        maxLength: 500,
      },
      birth_date: {
        pattern: VALIDATION_PATTERNS.BIRTH_DATE,
      },
    };
  }
}
