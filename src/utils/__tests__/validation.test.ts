import { ValidationUtils, VALIDATION_PATTERNS } from '../validation';

describe('ValidationUtils', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(ValidationUtils.validateEmail('test@example.com')).toBeNull();
      expect(ValidationUtils.validateEmail('user.name@domain.co.uk')).toBeNull();
      expect(ValidationUtils.validateEmail('user+tag@example.org')).toBeNull();
    });

    it('should reject invalid email addresses', () => {
      expect(ValidationUtils.validateEmail('invalid-email')).not.toBeNull();
      expect(ValidationUtils.validateEmail('@example.com')).not.toBeNull();
      expect(ValidationUtils.validateEmail('test@')).not.toBeNull();
      expect(ValidationUtils.validateEmail('')).not.toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      expect(ValidationUtils.validatePassword('Password123!')).toBeNull();
      expect(ValidationUtils.validatePassword('MyStr0ng#Pass')).toBeNull();
    });

    it('should reject weak passwords', () => {
      expect(ValidationUtils.validatePassword('weak')).not.toBeNull();
      expect(ValidationUtils.validatePassword('password')).not.toBeNull();
      expect(ValidationUtils.validatePassword('12345678')).not.toBeNull();
      expect(ValidationUtils.validatePassword('PASSWORD')).not.toBeNull();
    });
  });

  describe('validateUsername', () => {
    it('should validate correct usernames', () => {
      expect(ValidationUtils.validateUsername('user123')).toBeNull();
      expect(ValidationUtils.validateUsername('test_user')).toBeNull();
      expect(ValidationUtils.validateUsername('abc')).toBeNull();
    });

    it('should reject invalid usernames', () => {
      expect(ValidationUtils.validateUsername('ab')).not.toBeNull(); // too short
      expect(ValidationUtils.validateUsername('a'.repeat(21))).not.toBeNull(); // too long
      expect(ValidationUtils.validateUsername('user@name')).not.toBeNull(); // invalid character
      expect(ValidationUtils.validateUsername('')).not.toBeNull(); // empty
    });
  });

  describe('validatePhone', () => {
    it('should validate correct phone numbers', () => {
      expect(ValidationUtils.validatePhone('+1234567890')).toBeNull();
      expect(ValidationUtils.validatePhone('1234567890')).toBeNull();
      expect(ValidationUtils.validatePhone('085228561067')).toBeNull();
    });

    it('should reject invalid phone numbers', () => {
      expect(ValidationUtils.validatePhone('abc')).not.toBeNull();
      expect(ValidationUtils.validatePhone('123')).not.toBeNull(); // too short
      expect(ValidationUtils.validatePhone('')).not.toBeNull();
    });
  });

  describe('validateBirthDate', () => {
    it('should validate correct birth dates', () => {
      expect(ValidationUtils.validateBirthDate('2001-10-05')).toBeNull();
      expect(ValidationUtils.validateBirthDate('1990-01-01')).toBeNull();
    });

    it('should reject invalid birth dates', () => {
      expect(ValidationUtils.validateBirthDate('invalid')).not.toBeNull();
      expect(ValidationUtils.validateBirthDate('05-10-2001')).not.toBeNull(); // wrong format
      expect(ValidationUtils.validateBirthDate('')).not.toBeNull();
    });
  });

  describe('validateForm', () => {
    it('should validate complete registration form', () => {
      const validData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        birth_date: '2001-10-05'
      };

      const rules = ValidationUtils.getRegistrationRules();
      const errors = ValidationUtils.validateForm(validData, rules);
      
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should return errors for invalid form data', () => {
      const invalidData = {
        username: 'ab', // too short
        email: 'invalid-email',
        password: 'weak',
        birth_date: 'invalid'
      };

      const rules = ValidationUtils.getRegistrationRules();
      const errors = ValidationUtils.validateForm(invalidData, rules);
      
      expect(Object.keys(errors)).toHaveLength(4);
      expect(errors.username).toBeDefined();
      expect(errors.email).toBeDefined();
      expect(errors.password).toBeDefined();
      expect(errors.birth_date).toBeDefined();
    });
  });

  describe('validateField', () => {
    it('should validate individual fields with rules', () => {
      const rules = {
        required: true,
        minLength: 3,
        pattern: VALIDATION_PATTERNS.USERNAME
      };

      expect(ValidationUtils.validateField('test', rules)).toBeNull();
      expect(ValidationUtils.validateField('ab', rules)).not.toBeNull();
      expect(ValidationUtils.validateField('', rules)).not.toBeNull();
    });
  });
});
