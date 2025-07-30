# API Endpoints Reference Guide

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication Headers
```javascript
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

## Response Format
```javascript
// Success Response
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}

// Error Response
{
  "success": false,
  "error": "Error message",
  "details": {...}
}
```

## Authentication Endpoints

### POST /auth/login
**Description**: User login
**Body**:
```json
{
  "email": "admin@tender247.com",
  "password": "admin123"
}
```
**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 5,
    "email": "admin@tender247.com",
    "name": "System Administrator",
    "role": "admin"
  }
}
```

### POST /auth/logout
**Description**: User logout
**Headers**: Authorization required
**Response**:
```json
{
  "message": "Logged out successfully"
}
```

### GET /auth/me
**Description**: Get current user info
**Headers**: Authorization required
**Response**:
```json
{
  "user": {
    "id": 5,
    "email": "admin@tender247.com",
    "name": "System Administrator",
    "role": "admin",
    "permissions": ["create_user", "edit_tender", ...]
  }
}
```

## User Management Endpoints

### GET /users
**Description**: Get all users
**Headers**: Authorization required, Permission: view_users
**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term
- `role`: Filter by role
- `department`: Filter by department

**Response**:
```json
{
  "users": [
    {
      "id": 1,
      "username": "john_doe",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "tender_manager",
      "department": "Operations",
      "status": "Active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### POST /users
**Description**: Create new user
**Headers**: Authorization required, Permission: create_user
**Body**:
```json
{
  "username": "new_user",
  "password": "secure_password",
  "name": "New User",
  "email": "newuser@example.com",
  "phone": "+91-9876543210",
  "department": "IT",
  "designation": "Developer",
  "role": "user"
}
```

### GET /users/:id
**Description**: Get user by ID
**Headers**: Authorization required
**Response**:
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "tender_manager",
    "department": "Operations",
    "createdTenders": [...],
    "assignedTenders": [...]
  }
}
```

### PUT /users/:id
**Description**: Update user
**Headers**: Authorization required, Permission: edit_user
**Body**: Same as POST /users (partial update supported)

### DELETE /users/:id
**Description**: Delete user
**Headers**: Authorization required, Permission: delete_user

## Tender Management Endpoints

### GET /tenders
**Description**: Get all tenders
**Headers**: Authorization required
**Query Parameters**:
- `page`: Page number
- `limit`: Items per page
- `status`: Filter by status
- `authority`: Filter by authority
- `search`: Search in title/brief
- `assigned_to`: Filter by assigned user
- `deadline_from`: Filter by deadline start date
- `deadline_to`: Filter by deadline end date

**Response**:
```json
{
  "tenders": [
    {
      "id": 1,
      "referenceNo": "TNR2025001",
      "title": "Supply of IT Equipment",
      "brief": "Procurement of computers and accessories",
      "authority": "Delhi Municipal Corporation",
      "location": "New Delhi",
      "deadline": "2025-08-15T18:30:00.000Z",
      "emdAmount": "50000.00",
      "status": "live",
      "estimatedValue": "2500000.00",
      "assignedUsers": [...]
    }
  ],
  "pagination": {...}
}
```

### POST /tenders
**Description**: Create new tender
**Headers**: Authorization required, Permission: create_tender
**Body**:
```json
{
  "referenceNo": "TNR2025002",
  "title": "Construction Project",
  "brief": "Building construction tender",
  "authority": "State PWD",
  "location": "Mumbai",
  "deadline": "2025-09-30T18:30:00.000Z",
  "emdAmount": "100000.00",
  "documentFee": "5000.00",
  "estimatedValue": "5000000.00"
}
```

### GET /tenders/:id
**Description**: Get tender by ID with full details
**Headers**: Authorization required
**Response**:
```json
{
  "tender": {
    "id": 1,
    "referenceNo": "TNR2025001",
    "title": "Supply of IT Equipment",
    "brief": "Detailed tender description...",
    "authority": "Delhi Municipal Corporation",
    "documents": [
      {
        "id": 1,
        "filename": "tender_document.pdf",
        "filePath": "/uploads/tenders/1/documents/tender_document.pdf",
        "uploadedAt": "2025-07-29T10:30:00.000Z"
      }
    ],
    "assignedUsers": [...],
    "bidParticipations": [...],
    "reminders": [...]
  }
}
```

### PUT /tenders/:id
**Description**: Update tender
**Headers**: Authorization required, Permission: edit_tender
**Body**: Same as POST /tenders (partial update supported)

### DELETE /tenders/:id
**Description**: Delete tender
**Headers**: Authorization required, Permission: delete_tender

### GET /tenders/my-tenders
**Description**: Get tenders assigned to current user
**Headers**: Authorization required
**Response**: Same as GET /tenders but filtered for current user

### POST /tenders/:id/assign
**Description**: Assign tender to users
**Headers**: Authorization required, Permission: assign_tenders
**Body**:
```json
{
  "userIds": [1, 2, 3],
  "assignedBy": 5
}
```

### POST /tenders/:id/upload
**Description**: Upload tender documents
**Headers**: Authorization required
**Content-Type**: multipart/form-data
**Body**: File upload with additional fields

## Company Management Endpoints

### GET /companies
**Description**: Get all companies
**Headers**: Authorization required
**Query Parameters**:
- `type`: Filter by company type (dealer, oem, vendor)
- `search`: Search in company name
- `city`: Filter by city

**Response**:
```json
{
  "companies": [
    {
      "id": 1,
      "name": "Tech Solutions Pvt Ltd",
      "type": "dealer",
      "email": "contact@techsolutions.com",
      "phone": "+91-11-12345678",
      "city": "New Delhi",
      "gstNumber": "07AABCT1234C1Z5",
      "status": "active"
    }
  ]
}
```

### POST /companies
**Description**: Create new company
**Headers**: Authorization required, Permission: create_company
**Body**:
```json
{
  "name": "New Company Ltd",
  "type": "vendor",
  "email": "info@newcompany.com",
  "phone": "+91-22-87654321",
  "address": "123 Business Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "gstNumber": "27AABCT5678D1Z9",
  "panNumber": "AABCT5678D",
  "contactPerson": "John Manager"
}
```

## Document Management Endpoints

### POST /upload
**Description**: General file upload
**Headers**: Authorization required
**Content-Type**: multipart/form-data
**Body**: 
- `files`: File(s) to upload
- `type`: Upload type (tender_document, company_document, etc.)
- `entityId`: Related entity ID

**Response**:
```json
{
  "uploadedFiles": [
    {
      "id": 1,
      "filename": "document.pdf",
      "originalName": "Original Document.pdf",
      "filePath": "/uploads/documents/1234567890_document.pdf",
      "fileSize": 2048576,
      "mimeType": "application/pdf"
    }
  ]
}
```

### GET /files/:id/download
**Description**: Download file by ID
**Headers**: Authorization required
**Response**: File download with appropriate headers

### POST /compress-pdf
**Description**: Compress PDF file
**Headers**: Authorization required
**Content-Type**: multipart/form-data
**Body**: PDF file to compress

### GET /briefcases
**Description**: Get document briefcases
**Headers**: Authorization required

### POST /briefcases
**Description**: Create document briefcase
**Headers**: Authorization required
**Body**:
```json
{
  "name": "Project Documents",
  "description": "Documents for XYZ project",
  "isPublic": false
}
```

## Financial Management Endpoints

### GET /purchase-orders
**Description**: Get purchase orders
**Headers**: Authorization required, Permission: view_financials
**Response**:
```json
{
  "purchaseOrders": [
    {
      "id": 1,
      "poNumber": "PO2025001",
      "tenderId": 1,
      "vendorId": 1,
      "amount": "250000.00",
      "status": "approved",
      "deliveryDate": "2025-08-30T00:00:00.000Z",
      "vendor": {...},
      "approvals": [...]
    }
  ]
}
```

### POST /purchase-orders
**Description**: Create purchase order
**Headers**: Authorization required, Permission: create_po
**Body**:
```json
{
  "poNumber": "PO2025002",
  "tenderId": 1,
  "vendorId": 2,
  "amount": "150000.00",
  "description": "Supply of office equipment",
  "deliveryDate": "2025-09-15T00:00:00.000Z",
  "termsConditions": "Payment within 30 days"
}
```

### POST /purchase-orders/:id/approve
**Description**: Approve/reject purchase order
**Headers**: Authorization required, Permission: approve_po
**Body**:
```json
{
  "status": "approved",
  "comments": "Approved for processing",
  "approvalLevel": 1
}
```

## Analytics & Reporting Endpoints

### GET /analytics/dashboard
**Description**: Get dashboard analytics
**Headers**: Authorization required
**Response**:
```json
{
  "totalTenders": 45,
  "liveTenders": 12,
  "submittedTenders": 8,
  "awardedTenders": 3,
  "totalValue": "15000000.00",
  "monthlyStats": {...},
  "recentActivity": [...]
}
```

### GET /analytics/tenders/status-summary
**Description**: Get tender status summary
**Headers**: Authorization required
**Response**:
```json
{
  "statusCounts": {
    "new": 5,
    "live": 12,
    "submitted": 8,
    "awarded": 3,
    "rejected": 2
  }
}
```

### GET /analytics/financial-summary
**Description**: Get financial summary
**Headers**: Authorization required, Permission: view_financials
**Response**:
```json
{
  "totalPOValue": "2500000.00",
  "pendingApprovals": 3,
  "approvedPOs": 15,
  "monthlySpend": "500000.00"
}
```

## System Configuration Endpoints

### GET /settings
**Description**: Get system settings
**Headers**: Authorization required, Permission: system_config
**Response**:
```json
{
  "settings": {
    "systemName": "Tender247 Management System",
    "companyName": "Your Company",
    "timezone": "Asia/Kolkata",
    "currency": "INR",
    "dateFormat": "DD/MM/YYYY"
  }
}
```

### PUT /settings
**Description**: Update system settings
**Headers**: Authorization required, Permission: system_config
**Body**: Key-value pairs of settings to update

### GET /roles
**Description**: Get all roles
**Headers**: Authorization required

### GET /roles/:id/permissions
**Description**: Get role permissions
**Headers**: Authorization required
**Response**:
```json
{
  "role": {
    "id": 17,
    "name": "Admin",
    "permissions": [
      "create_user", "edit_user", "delete_user",
      "create_tender", "edit_tender", "assign_tender",
      "view_financials", "approve_po"
    ]
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error |

## Rate Limiting
- 100 requests per 15 minutes per IP
- 1000 requests per hour for authenticated users
- File upload: 5 files per minute

## File Upload Limits
- Maximum file size: 50MB
- Allowed file types: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
- Maximum files per request: 5

This API reference provides comprehensive documentation for all endpoints in the Tender Management System.