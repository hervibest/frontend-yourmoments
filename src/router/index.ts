import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useUserStore } from '../stores/user';

// Lazy load components for better performance
const HomePage = () => import('../pages/HomePage.vue');
const LoginPage = () => import('../pages/LoginPage.vue');
const RegisterPage = () => import('../pages/RegisterPage.vue');
const ProfilePage = () => import('../pages/ProfilePage.vue');
const ResetPasswordPage = () => import('../pages/ResetPasswordPage.vue');
const ExplorePage = () => import('../pages/ExplorePage.vue');
const CheckoutPage = () => import('../pages/CheckoutPage.vue');
const CheckoutSuccessPage = () => import('../pages/CheckoutSuccessPage.vue');
const CheckoutFailurePage = () => import('../pages/CheckoutFailurePage.vue');
const CheckoutPendingPage = () => import('../pages/CheckoutPendingPage.vue');
const CreatorDiscountPage = () => import('../pages/CreatorDiscountPage.vue');
const UploadSinglePhotoPage = () => import('../pages/UploadSinglePhotoPage.vue');
const UploadBulkPhotoPage = () => import('../pages/UploadBulkPhotoPage.vue');
const UploadFacecamPage = () => import('../pages/UploadFacecamPage.vue');
const CreatorDashboardPage = () => import('../pages/CreatorDashboardPage.vue');
const CreatorReviewsPage = () => import('../pages/CreatorReviewsPage.vue');
const CreatorWalletPage = () => import('../pages/CreatorWalletPage.vue');
const TransactionsPage = () => import('../pages/TransactionsPage.vue');
const TransactionDetailPage = () => import('../pages/TransactionDetailPage.vue');
const PurchaseConfirmationPage = () => import('../pages/PurchaseConfirmationPage.vue');

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresAuth: false, guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: { requiresAuth: false, guestOnly: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfilePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPasswordPage,
    meta: { requiresAuth: false, guestOnly: true }
  },
  {
    path: '/explore',
    name: 'Explore',
    component: ExplorePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: CheckoutPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/checkout/success',
    name: 'CheckoutSuccess',
    component: CheckoutSuccessPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/checkout/failure',
    name: 'CheckoutFailure',
    component: CheckoutFailurePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/checkout/pending',
    name: 'CheckoutPending',
    component: CheckoutPendingPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/creator/discounts',
    name: 'CreatorDiscounts',
    component: CreatorDiscountPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/upload/single',
    name: 'UploadSinglePhoto',
    component: UploadSinglePhotoPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/upload/bulk',
    name: 'UploadBulkPhoto',
    component: UploadBulkPhotoPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/upload/facecam',
    name: 'UploadFacecam',
    component: UploadFacecamPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/creator/dashboard',
    name: 'CreatorDashboard',
    component: CreatorDashboardPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/creator/reviews',
    name: 'CreatorReviews',
    component: CreatorReviewsPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/creator/wallet',
    name: 'CreatorWallet',
    component: CreatorWalletPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: TransactionsPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/transactions/:id',
    name: 'TransactionDetail',
    component: TransactionDetailPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/purchase/confirm',
    name: 'PurchaseConfirmation',
    component: PurchaseConfirmationPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guards
router.beforeEach(async (to, from, next) => {
  console.log('Router: Navigation guard triggered', { to: to.path, from: from.path });
  const userStore = useUserStore();
  
  // Initialize auth state from localStorage
  userStore.initializeAuth();
  
  const isAuthenticated = userStore.isLoggedIn;
  const requiresAuth = to.meta.requiresAuth;
  const guestOnly = to.meta.guestOnly;
  
  console.log('Router: Auth state check', {
    isAuthenticated,
    requiresAuth,
    guestOnly,
    hasToken: !!userStore.token,
    isAuthenticatedState: userStore.isAuthenticated
  });
  
  // Redirect authenticated users away from guest-only pages
  if (guestOnly && isAuthenticated) {
    console.log('Router: Redirecting authenticated user away from guest-only page');
    next('/profile');
    return;
  }
  
  // Redirect unauthenticated users to login for protected routes
  if (requiresAuth && !isAuthenticated) {
    console.log('Router: Redirecting unauthenticated user to login');
    next('/login');
    return;
  }
  
  console.log('Router: Navigation allowed');
  next();
});

export default router;
