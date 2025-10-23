# YourMoments Frontend

A modern, clean, and well-structured Vue.js frontend application for the YourMoments platform.

## 🚀 Features

- **Modern Vue 3** with Composition API and TypeScript
- **Clean Architecture** with separation of concerns
- **Comprehensive Type Safety** with TypeScript
- **Reusable Components** with consistent design system
- **Form Validation** with real-time feedback
- **State Management** with Pinia
- **API Integration** with proper error handling
- **Responsive Design** with mobile-first approach
- **Unit Testing** with Vitest
- **Code Quality** with ESLint and Prettier

## 🏗️ Architecture

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── BaseForm.vue
│   ├── BaseInput.vue
│   └── BaseButton.vue
├── pages/              # Page components
│   ├── HomePage.vue
│   ├── LoginPage.vue
│   ├── RegisterPage.vue
│   ├── ProfilePage.vue
│   └── ResetPasswordPage.vue
├── stores/             # Pinia stores
│   └── user.ts
├── services/           # API services
│   └── api.ts
├── types/              # TypeScript type definitions
│   ├── apiContracts.ts
│   ├── validation.ts
│   └── store.ts
├── utils/              # Utility functions
│   └── validation.ts
├── router/            # Vue Router configuration
│   └── index.js
└── test/              # Test setup
    └── setup.ts
```

### Key Design Principles

1. **Separation of Concerns**: Clear separation between UI, business logic, and data
2. **Type Safety**: Comprehensive TypeScript coverage
3. **Reusability**: Modular components and utilities
4. **Error Handling**: Consistent error management across the application
5. **Validation**: Client-side validation with user-friendly feedback
6. **Testing**: Unit tests for critical functionality

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build
```

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_USER_SERVICE_URL=http://localhost:8003
VITE_PHOTO_SERVICE_URL=http://localhost:8001
VITE_UPLOAD_SERVICE_URL=http://localhost:8002
VITE_TRANSACTION_SERVICE_URL=http://localhost:8005
```

## 🧩 Components

### Base Components
- **BaseForm**: Form wrapper with loading states and error handling
- **BaseInput**: Input field with validation and error display
- **BaseButton**: Button component with variants and loading states

### Pages
- **HomePage**: Landing page with features overview
- **LoginPage**: User authentication with email/username
- **RegisterPage**: User registration with validation
- **ProfilePage**: User profile management with image upload
- **ResetPasswordPage**: Password reset functionality

## 🔧 API Integration

### Service Layer
The application uses a centralized API service with:
- **Automatic token management**
- **Request/response interceptors**
- **Error handling and transformation**
- **Type-safe API calls**

### API Endpoints
- **Authentication**: Login, logout, current user
- **Registration**: Email, phone, Google OAuth
- **Profile Management**: Get, update, image upload
- **Password Reset**: Request, validate, reset
- **Email Verification**: Resend, verify

## ✅ Validation

### Form Validation
- **Real-time validation** with user feedback
- **Comprehensive rules** for all input types
- **Custom validation patterns** for specific requirements
- **Accessible error messages**

### Validation Rules
- **Email**: RFC-compliant email validation
- **Password**: Strong password requirements
- **Username**: Alphanumeric with length constraints
- **Phone**: International phone number format
- **Birth Date**: ISO date format validation

## 🧪 Testing

### Test Structure
- **Unit Tests**: Component and utility testing
- **Integration Tests**: Store and API testing
- **Mocking**: Comprehensive API mocking
- **Coverage**: Code coverage reporting

### Running Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## 🎨 Styling

### Design System
- **Consistent color palette**
- **Typography scale**
- **Spacing system**
- **Component variants**
- **Responsive breakpoints**

### CSS Architecture
- **Scoped styles** for component isolation
- **CSS custom properties** for theming
- **Mobile-first responsive design**
- **Accessibility considerations**

## 🚀 Deployment

### Build Process
```bash
# Production build
npm run build

# Preview production build
npm run preview
```

### Environment Configuration
- **Development**: Hot reload with Vite
- **Production**: Optimized bundle with tree shaking
- **Environment variables**: Service URL configuration

## 📱 Features

### User Authentication
- ✅ Email/username login
- ✅ User registration
- ✅ Password reset
- ✅ Email verification
- ✅ Google OAuth (ready for integration)

### Profile Management
- ✅ View profile information
- ✅ Update profile details
- ✅ Upload profile images
- ✅ Upload cover images
- ✅ Similarity settings

### User Experience
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling
- ✅ Form validation
- ✅ Navigation guards
- ✅ Token management

## 🔒 Security

### Security Features
- **Token-based authentication**
- **Automatic token refresh**
- **Secure API communication**
- **Input validation and sanitization**
- **XSS protection**

## 📈 Performance

### Optimization Features
- **Lazy loading** for route components
- **Code splitting** for better performance
- **Tree shaking** for smaller bundles
- **Efficient state management**
- **Optimized API calls**

## 🤝 Contributing

### Code Standards
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Conventional commits** for git messages

### Development Workflow
1. Create feature branch
2. Implement changes with tests
3. Run linting and tests
4. Submit pull request

## 📄 License

This project is part of the YourMoments platform and follows the same licensing terms.
