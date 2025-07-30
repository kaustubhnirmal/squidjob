# CORS Configuration for Server Deployment

## Overview
This guide explains the CORS (Cross-Origin Resource Sharing) configuration added to fix deployment issues when accessing the application from external IPs.

## What Was Fixed
- Added comprehensive CORS middleware to allow cross-origin requests
- Updated Content Security Policy to be compatible with CORS
- Configured proper headers for file downloads and API authentication

## CORS Configuration Details

### Development Mode (Current)
- **Origin Policy**: Allows all origins for maximum compatibility
- **Credentials**: Enabled (allows cookies and authorization headers)
- **Methods**: GET, POST, PUT, DELETE, PATCH, OPTIONS
- **Headers**: Content-Type, Authorization, x-user-id, X-Requested-With
- **Exposed Headers**: Content-Disposition (for file downloads)

### Production Deployment Options

#### Option 1: Specific Domain Restriction (Recommended for Production)
```javascript
const corsOptions = {
  origin: [
    'http://your-domain.com',
    'https://your-domain.com',
    'http://your-server-ip:5000'
  ],
  credentials: true,
  // ... other options
};
```

#### Option 2: IP-Based Access
```javascript
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from your server IP
    if (!origin || origin.includes('your-server-ip')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  // ... other options
};
```

## Environment Variables
You can control CORS behavior with environment variables:

```bash
# .env file
ALLOWED_ORIGINS=http://your-domain.com,https://your-domain.com
CORS_CREDENTIALS=true
```

## Testing CORS
1. Start the server: `npm run start`
2. Access from external IP: `http://your-server-ip:5000`
3. Check browser console for CORS errors (should be resolved)

## Security Considerations
- Current configuration allows all origins for deployment flexibility
- In production, restrict origins to your specific domains
- Always use HTTPS in production
- Consider implementing additional security headers

## Troubleshooting
- If you still get CORS errors, check browser developer tools
- Ensure your server allows traffic on port 5000
- Verify firewall settings allow external access
- Check if reverse proxy (nginx, Apache) needs CORS configuration

## File Locations
- CORS configuration: `server/index.ts`
- Security headers: `server/index.ts` (Helmet CSP)