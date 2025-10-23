# Midtrans Integration Guide

This document explains how the Midtrans payment integration works in the YourMoments frontend application.

## Overview

The application now supports Midtrans payment processing with the following features:
- Transaction creation with proper API integration
- Automatic redirect to Midtrans payment page
- Payment status handling (success, failure, pending)
- Transaction tracking and status updates

## Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# API Service URLs
VITE_USER_SERVICE_URL=http://localhost:8003
VITE_PHOTO_SERVICE_URL=http://localhost:8081
VITE_UPLOAD_SERVICE_URL=http://localhost:8082
VITE_TRANSACTION_SERVICE_URL=http://localhost:8005

# Midtrans Configuration
VITE_MIDTRANS_CLIENT_KEY=your_midtrans_client_key_here
VITE_MIDTRANS_SERVER_KEY=your_midtrans_server_key_here
VITE_MIDTRANS_IS_PRODUCTION=false

# App Configuration
VITE_APP_NAME=YourMoments
VITE_APP_URL=http://localhost:5173
```

### Midtrans Setup

1. **Get Midtrans Credentials:**
   - Sign up at [Midtrans](https://midtrans.com)
   - Get your Client Key and Server Key from the dashboard
   - Use sandbox keys for development, production keys for live environment

2. **Configure Environment:**
   - Set `VITE_MIDTRANS_IS_PRODUCTION=false` for sandbox
   - Set `VITE_MIDTRANS_IS_PRODUCTION=true` for production

## API Integration

### Transaction Creation

The checkout process now creates transactions through the API:

```typescript
// Transaction request structure
const transactionRequest = {
  items: [
    {
      photo_id: "01JYZVX622EGJS297XBZW8JRJ8",
      creator_id: "01JYXHMVVG1A4RC8FCX1T12KMM",
      title: "eunbin3.jpeg",
      price: 3000000,
      discount: {
        id: "01JYZWABTS7JVC1GRACZ6EQSNK",
        amount: 300000,
        min_quantity: 1,
        value: 10,
        type: "PERCENT"
      },
      final_price: 2700000
    }
  ],
  total_price: 2700000,
  total_discount: 300000
};
```

### API Response

The transaction creation API returns:

```typescript
{
  "success": true,
  "data": {
    "transaction_id": "9d4ccacb-1985-46b5-b2bd-dfd2c413ca9d",
    "snap_token": "165a697b-6928-464d-8f3f-2f04cc4408d8",
    "redirect_url": "https://app.sandbox.midtrans.com/snap/v4/redirection/165a697b-6928-464d-8f3f-2f04cc4408d8"
  }
}
```

## Payment Flow

### 1. Checkout Process

1. User adds items to cart
2. User proceeds to checkout
3. User fills payment information
4. System creates transaction via API
5. System redirects to Midtrans payment page

### 2. Payment Processing

1. User completes payment on Midtrans
2. Midtrans redirects back to application
3. Application handles payment status
4. User sees appropriate result page

### 3. Status Handling

The application handles different payment statuses:

- **SUCCESS**: Redirects to `/checkout/success`
- **PENDING**: Redirects to `/checkout/pending`
- **FAILED**: Redirects to `/checkout/failure`
- **CANCELLED**: Redirects to `/checkout/failure`

## File Structure

```
src/
├── config/
│   └── midtrans.ts          # Midtrans configuration
├── utils/
│   └── midtrans.ts          # Midtrans utility functions
├── pages/
│   ├── CheckoutPage.vue     # Main checkout page
│   ├── CheckoutSuccessPage.vue
│   ├── CheckoutFailurePage.vue
│   └── CheckoutPendingPage.vue
└── types/
    └── apiContracts.ts      # Updated API types
```

## Key Components

### 1. Midtrans Configuration (`src/config/midtrans.ts`)

Handles Midtrans configuration and environment setup:

```typescript
export const midtransConfig = {
  clientKey: import.meta.env.VITE_MIDTRANS_CLIENT_KEY,
  serverKey: import.meta.env.VITE_MIDTRANS_SERVER_KEY,
  isProduction: import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true',
  // ... other config
};
```

### 2. Midtrans Utilities (`src/utils/midtrans.ts`)

Provides utility functions for payment handling:

```typescript
// Redirect to Midtrans payment
redirectToMidtrans(redirectUrl);

// Handle payment return
handleMidtransReturn(status);

// Clear stored data
clearMidtransData();
```

### 3. Updated Checkout Page

The checkout page now:
- Creates transactions via API
- Stores transaction details
- Redirects to Midtrans payment page
- Handles errors gracefully

### 4. Payment Status Pages

- **Success Page**: Shows transaction details and success message
- **Failure Page**: Shows error message with retry option
- **Pending Page**: Shows pending status with auto-refresh

## Error Handling

The integration includes comprehensive error handling:

1. **API Errors**: Network failures, invalid responses
2. **Configuration Errors**: Missing environment variables
3. **Payment Errors**: Failed transactions, invalid redirects
4. **User Errors**: Invalid payment information

## Security Considerations

1. **Client Key**: Safe to expose in frontend (public)
2. **Server Key**: Never expose in frontend (backend only)
3. **Transaction Data**: Stored temporarily in localStorage
4. **Redirect URLs**: Validated before redirecting

## Testing

### Sandbox Testing

1. Use sandbox environment (`VITE_MIDTRANS_IS_PRODUCTION=false`)
2. Use test credit card numbers from Midtrans documentation
3. Test different payment scenarios (success, failure, pending)

### Production Testing

1. Use production environment (`VITE_MIDTRANS_IS_PRODUCTION=true`)
2. Test with real payment methods
3. Verify webhook handling

## Troubleshooting

### Common Issues

1. **Invalid Redirect URL**: Check Midtrans configuration
2. **Missing Transaction ID**: Verify API response structure
3. **Payment Status Not Updated**: Check transaction detail API
4. **Environment Variables**: Ensure all required variables are set

### Debug Mode

Enable debug logging by setting `VITE_APP_DEBUG=true` in your environment file.

## Support

For issues related to:
- **Midtrans Integration**: Check Midtrans documentation
- **API Integration**: Check backend API documentation
- **Frontend Issues**: Check browser console for errors

## Future Enhancements

1. **Webhook Integration**: Real-time payment status updates
2. **Payment Methods**: Support for more payment methods
3. **Analytics**: Payment success/failure tracking
4. **Notifications**: Email/SMS notifications for payment status
