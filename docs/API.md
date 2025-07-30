# SquidJob API Documentation

## Overview

The SquidJob API provides RESTful endpoints for managing tenders, companies, users, and documents. All API endpoints are prefixed with `/api/v1/`.

## Authentication

### JWT Authentication
Most API endpoints require authentication using JWT tokens.

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "admin"
  }
}
```

#### Using the Token
Include the JWT token in the Authorization header:
```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

## Endpoints

### Authentication

#### POST /api/v1/auth/login
Authenticate user and receive JWT token.

#### POST /api/v1/auth/logout
Logout user and invalidate token.

#### GET /api/v1/auth/me
Get current authenticated user information.

#### POST /api/v1/auth/refresh
Refresh JWT token.

### Users

#### GET /api/v1/users
Get list of users (Admin only).

**Query Parameters:**
- `page` (int): Page number
- `per_page` (int): Items per page
- `search` (string): Search term
- `role` (string): Filter by role

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "admin",
      "status": "active",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total": 100,
    "last_page": 5
  }
}
```

#### POST /api/v1/users
Create new user (Admin only).

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "first_name": "Jane",
  "last_name": "Smith",
  "department": "Sales",
  "designation": "Manager"
}
```

#### GET /api/v1/users/{id}
Get specific user details.

#### PUT /api/v1/users/{id}
Update user information.

#### DELETE /api/v1/users/{id}
Delete user (Admin only).

### Tenders

#### GET /api/v1/tenders
Get list of tenders.

**Query Parameters:**
- `page` (int): Page number
- `per_page` (int): Items per page
- `status` (string): Filter by status
- `authority` (string): Filter by authority
- `search` (string): Search term
- `deadline_from` (date): Filter by deadline from
- `deadline_to` (date): Filter by deadline to

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "reference_no": "TNR2025001",
      "title": "Supply of Computer Hardware",
      "description": "Procurement of desktop computers...",
      "authority": "Department of IT",
      "location": "Mumbai, Maharashtra",
      "deadline": "2025-02-15T17:00:00Z",
      "status": "live",
      "emd_amount": 50000.00,
      "estimated_value": 2500000.00,
      "created_at": "2025-01-01T00:00:00Z",
      "created_by": {
        "id": 1,
        "name": "John Doe"
      }
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total": 50,
    "last_page": 3
  }
}
```

#### POST /api/v1/tenders
Create new tender.

**Request:**
```json
{
  "title": "New Tender Title",
  "description": "Detailed description",
  "authority": "Government Department",
  "location": "City, State",
  "deadline": "2025-03-01T17:00:00Z",
  "emd_amount": 25000.00,
  "document_fee": 2500.00,
  "estimated_value": 1500000.00
}
```

#### GET /api/v1/tenders/{id}
Get specific tender details.

#### PUT /api/v1/tenders/{id}
Update tender information.

#### DELETE /api/v1/tenders/{id}
Delete tender.

#### POST /api/v1/tenders/{id}/assign
Assign tender to users.

**Request:**
```json
{
  "user_ids": [2, 3, 4],
  "role": "Team Member",
  "responsibility": "Document preparation and analysis"
}
```

#### GET /api/v1/tenders/{id}/documents
Get tender documents.

#### POST /api/v1/tenders/{id}/documents
Upload document to tender.

### Companies

#### GET /api/v1/companies
Get list of companies.

**Query Parameters:**
- `page` (int): Page number
- `per_page` (int): Items per page
- `type` (string): Filter by company type
- `status` (string): Filter by status
- `search` (string): Search term

#### POST /api/v1/companies
Create new company.

**Request:**
```json
{
  "name": "Tech Solutions Pvt Ltd",
  "company_type": "vendor",
  "email": "contact@techsolutions.com",
  "phone": "+91-9876543210",
  "address_line1": "123 Business Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "gst_number": "27AAAAA0000A1Z5",
  "pan_number": "AAAAA0000A"
}
```

#### GET /api/v1/companies/{id}
Get specific company details.

#### PUT /api/v1/companies/{id}
Update company information.

#### DELETE /api/v1/companies/{id}
Delete company.

### Documents

#### GET /api/v1/documents
Get list of documents.

#### POST /api/v1/upload
Upload document.

**Request (multipart/form-data):**
```
file: [binary file]
document_type: "tender_doc"
category: "technical"
tender_id: 1 (optional)
company_id: 2 (optional)
```

**Response:**
```json
{
  "id": 1,
  "original_name": "document.pdf",
  "file_size": 1024000,
  "mime_type": "application/pdf",
  "document_type": "tender_doc",
  "uploaded_at": "2025-01-01T00:00:00Z"
}
```

#### GET /api/v1/documents/{id}/download
Download document file.

#### DELETE /api/v1/documents/{id}
Delete document.

### Dashboard

#### GET /api/v1/dashboard/stats
Get dashboard statistics.

**Response:**
```json
{
  "tenders": {
    "total": 100,
    "active": 25,
    "completed": 60,
    "recent": 10
  },
  "companies": {
    "total": 50,
    "active": 45,
    "verified": 40
  },
  "users": {
    "total": 20,
    "active": 18
  }
}
```

#### GET /api/v1/dashboard/recent-activities
Get recent activities.

#### GET /api/v1/dashboard/upcoming-deadlines
Get upcoming tender deadlines.

### Reports

#### GET /api/v1/reports/tenders
Generate tender report.

**Query Parameters:**
- `format` (string): pdf, excel, csv
- `date_from` (date): Start date
- `date_to` (date): End date
- `status` (string): Filter by status

#### GET /api/v1/reports/financial
Generate financial report.

#### POST /api/v1/reports/export
Export custom report.

### Search

#### GET /api/v1/search
Global search across all entities.

**Query Parameters:**
- `q` (string): Search query
- `type` (string): Entity type (tenders, companies, documents)

## Error Handling

### Error Response Format
```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {
    "field": ["Validation error message"]
  }
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

### Common Error Codes
- `INVALID_CREDENTIALS` - Login failed
- `TOKEN_EXPIRED` - JWT token expired
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `VALIDATION_FAILED` - Request validation failed
- `RESOURCE_NOT_FOUND` - Requested resource not found

## Rate Limiting

API requests are limited to:
- **Authenticated users**: 1000 requests per hour
- **Unauthenticated users**: 100 requests per hour

Rate limit headers:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Pagination

List endpoints support pagination:

**Request:**
```http
GET /api/v1/tenders?page=2&per_page=50
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "current_page": 2,
    "per_page": 50,
    "total": 200,
    "last_page": 4,
    "from": 51,
    "to": 100
  }
}
```

## File Uploads

### Supported File Types
- Documents: PDF, DOC, DOCX, XLS, XLSX
- Images: JPG, JPEG, PNG, GIF
- Archives: ZIP

### Size Limits
- Maximum file size: 50MB
- Maximum files per request: 10

### Upload Response
```json
{
  "files": [
    {
      "id": 1,
      "original_name": "document.pdf",
      "stored_name": "1640995200_abc123.pdf",
      "file_size": 1024000,
      "mime_type": "application/pdf",
      "url": "/uploads/documents/2025/01/1640995200_abc123.pdf"
    }
  ]
}
```

## Webhooks

Configure webhooks to receive real-time notifications:

### Events
- `tender.created`
- `tender.updated`
- `tender.assigned`
- `document.uploaded`
- `user.created`

### Webhook Payload
```json
{
  "event": "tender.created",
  "timestamp": "2025-01-01T00:00:00Z",
  "data": {
    "id": 1,
    "reference_no": "TNR2025001",
    "title": "New Tender"
  }
}
```

## SDK and Libraries

### JavaScript/Node.js
```javascript
const SquidJobAPI = require('squidjob-api');

const client = new SquidJobAPI({
  baseURL: 'https://your-domain.com/api/v1',
  token: 'your-jwt-token'
});

// Get tenders
const tenders = await client.tenders.list();

// Create tender
const tender = await client.tenders.create({
  title: 'New Tender',
  description: 'Description'
});
```

### PHP
```php
use SquidJob\API\Client;

$client = new Client([
    'base_url' => 'https://your-domain.com/api/v1',
    'token' => 'your-jwt-token'
]);

// Get tenders
$tenders = $client->tenders()->list();

// Create tender
$tender = $client->tenders()->create([
    'title' => 'New Tender',
    'description' => 'Description'
]);
```

## Testing

### API Testing Tools
- Postman Collection: [Download Link]
- Insomnia Workspace: [Download Link]

### Test Environment
- Base URL: `https://test.squidjob.com/api/v1`
- Test credentials available in documentation

## Support

For API support:
- Email: api-support@squidjob.com
- Documentation: https://docs.squidjob.com
- Status Page: https://status.squidjob.com