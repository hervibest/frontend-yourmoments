// Midtrans Configuration
export const midtransConfig = {
  // Client Key for frontend (public)
  clientKey: import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'your_midtrans_client_key_here',
  
  // Server Key for backend (keep secret)
  serverKey: import.meta.env.VITE_MIDTRANS_SERVER_KEY || 'your_midtrans_server_key_here',
  
  // Environment (sandbox/production)
  isProduction: import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true' || false,
  
  // App URLs
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  
  // Callback URLs
  successUrl: `${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/checkout/success`,
  failureUrl: `${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/checkout/failure`,
  pendingUrl: `${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/checkout/pending`,
};

// Midtrans API endpoints
export const midtransEndpoints = {
  sandbox: {
    snap: 'https://app.sandbox.midtrans.com/snap/v4/redirection',
    core: 'https://api.sandbox.midtrans.com/v2',
  },
  production: {
    snap: 'https://app.midtrans.com/snap/v4/redirection',
    core: 'https://api.midtrans.com/v2',
  },
};

// Get current environment endpoints
export const getMidtransEndpoints = () => {
  return midtransConfig.isProduction ? midtransEndpoints.production : midtransEndpoints.sandbox;
};

// Validate Midtrans configuration
export const validateMidtransConfig = (): boolean => {
  if (!midtransConfig.clientKey || midtransConfig.clientKey === 'your_midtrans_client_key_here') {
    console.warn('⚠️ Midtrans Client Key not configured');
    return false;
  }
  
  if (!midtransConfig.serverKey || midtransConfig.serverKey === 'your_midtrans_server_key_here') {
    console.warn('⚠️ Midtrans Server Key not configured');
    return false;
  }
  
  return true;
};

// Log configuration status
if (import.meta.env.DEV) {
  console.log('🔧 Midtrans Configuration:', {
    clientKey: midtransConfig.clientKey ? '✅ Set' : '❌ Not set',
    serverKey: midtransConfig.serverKey ? '✅ Set' : '❌ Not set',
    isProduction: midtransConfig.isProduction,
    endpoints: getMidtransEndpoints(),
  });
}
