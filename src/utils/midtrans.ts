import { midtransConfig, getMidtransEndpoints, validateMidtransConfig } from '../config/midtrans';

// Midtrans redirect utility
export class MidtransRedirect {
  private static instance: MidtransRedirect;
  
  private constructor() {
    // Validate configuration on initialization
    if (!validateMidtransConfig()) {
      console.warn('⚠️ Midtrans configuration is incomplete');
    }
  }
  
  public static getInstance(): MidtransRedirect {
    if (!MidtransRedirect.instance) {
      MidtransRedirect.instance = new MidtransRedirect();
    }
    return MidtransRedirect.instance;
  }
  
  /**
   * Redirect to Midtrans payment page
   * @param redirectUrl - The redirect URL from transaction creation response
   */
  public redirectToPayment(redirectUrl: string): void {
    try {
      console.log('🔄 Redirecting to Midtrans payment page:', redirectUrl);
      
      // Validate redirect URL
      if (!this.isValidMidtransUrl(redirectUrl)) {
        throw new Error('Invalid Midtrans redirect URL');
      }
      
      // Store current page for potential return
      sessionStorage.setItem('midtrans_return_url', window.location.href);
      
      // Redirect to Midtrans
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('❌ Error redirecting to Midtrans:', error);
      throw error;
    }
  }
  
  /**
   * Handle return from Midtrans payment
   * @param status - Payment status from URL parameters
   */
  public handlePaymentReturn(status?: string): {
    success: boolean;
    status: string;
    message: string;
    redirectUrl: string;
  } {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = status || urlParams.get('status') || 'unknown';
    const transactionId = urlParams.get('transaction_id');
    const orderId = urlParams.get('order_id');
    
    console.log('🔄 Handling Midtrans payment return:', {
      status: paymentStatus,
      transactionId,
      orderId,
    });
    
    // Store transaction ID if available
    if (transactionId) {
      localStorage.setItem('transaction_id', transactionId);
    }
    
    // Determine redirect URL based on status
    let redirectUrl = '/checkout/success';
    let success = true;
    let message = 'Payment successful';
    
    switch (paymentStatus.toLowerCase()) {
      case 'success':
      case 'settlement':
        redirectUrl = '/checkout/success';
        success = true;
        message = 'Payment successful';
        break;
      case 'pending':
        redirectUrl = '/checkout/pending';
        success = true;
        message = 'Payment is being processed';
        break;
      case 'failure':
      case 'deny':
      case 'expire':
        redirectUrl = '/checkout/failure';
        success = false;
        message = 'Payment failed';
        break;
      case 'cancel':
        redirectUrl = '/checkout/cancel';
        success = false;
        message = 'Payment cancelled';
        break;
      default:
        redirectUrl = '/checkout/unknown';
        success = false;
        message = 'Unknown payment status';
    }
    
    return {
      success,
      status: paymentStatus,
      message,
      redirectUrl,
    };
  }
  
  /**
   * Validate Midtrans redirect URL
   * @param url - URL to validate
   */
  private isValidMidtransUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const endpoints = getMidtransEndpoints();
      
      // Check if URL matches Midtrans endpoints
      return urlObj.origin === endpoints.snap.replace('/snap/v4/redirection', '');
    } catch {
      return false;
    }
  }
  
  /**
   * Get stored transaction ID
   */
  public getStoredTransactionId(): string | null {
    return localStorage.getItem('transaction_id');
  }
  
  /**
   * Get stored snap token
   */
  public getStoredSnapToken(): string | null {
    return localStorage.getItem('snap_token');
  }
  
  /**
   * Clear stored payment data
   */
  public clearStoredData(): void {
    localStorage.removeItem('transaction_id');
    localStorage.removeItem('snap_token');
    sessionStorage.removeItem('midtrans_return_url');
  }
  
  /**
   * Get return URL from session storage
   */
  public getReturnUrl(): string | null {
    return sessionStorage.getItem('midtrans_return_url');
  }
}

// Export singleton instance
export const midtransRedirect = MidtransRedirect.getInstance();

// Export utility functions
export const redirectToMidtrans = (redirectUrl: string): void => {
  midtransRedirect.redirectToPayment(redirectUrl);
};

export const handleMidtransReturn = (status?: string) => {
  return midtransRedirect.handlePaymentReturn(status);
};

export const clearMidtransData = (): void => {
  midtransRedirect.clearStoredData();
};
