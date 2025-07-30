# API Reference Documentation
# Complete REST API Specifications

## API Overview

### Base Information
- **Base URL**: `https://api.tender247.com/api/v1`
- **Authentication**: JWT Bearer Token
- **Content Type**: `application/json`
- **Rate Limiting**: 100 requests per minute per user
- **API Version**: v1.0.0

### Authentication
```bash
# Get authentication token
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# Use token in subsequent requests
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Tender Management API

### Get Tenders
```http
GET /tenders
```

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 12, max: 100)
- `status` (string): Filter by status (`draft`, `live`, `in_process`, `submitted`, `awarded`, `rejected`)
- `authority` (string): Filter by issuing authority
- `search` (string): Search in title, description, authority
- `deadline_from` (date): Filter deadlines from date (YYYY-MM-DD)
- `deadline_to` (date): Filter deadlines to date (YYYY-MM-DD)
- `assigned_to` (integer): Filter tenders assigned to specific user ID
- `created_by` (integer): Filter tenders created by specific user ID

**Response:**
```json
{
  "success": true,
  "data": {
    "tenders": [
      {
        "id": 123,
        "reference_no": "TNR2025001",
        "title": "Supply of IT Equipment",
        "description": "Procurement of laptops and accessories",
        "authority": "Delhi Municipal Corporation",
        "location": "New Delhi",
        "deadline": "2025-12-31T18:30:00.000Z",
        "emd_amount": "50000.00",
        "document_fee": "5000.00",
        "estimated_value": "2500000.00",
        "status": "live",
        "created_at": "2025-07-29T10:30:00.000Z",
        "created_by": {
          "id": 5,
          "name": "John Doe",
          "email": "john@example.com"
        },
        "assignments": [
          {
            "id": 15,
            "user": {
              "id": 8,
              "name": "Jane Smith",
              "avatar": "/avatars/jane.jpg"
            },
            "role": "Lead Analyst"
          }
        ],
        "documents_count": 3,
        "days_remaining": 45
      }
    ],
    "pagination": {
      "current_page": 1,
      "last_page": 5,
      "per_page": 12,
      "total": 56,
      "from": 1,
      "to": 12
    }
  }
}
```

### Create Tender
```http
POST /tenders
```

**Request Body:**
```json
{
  "title": "Supply of IT Equipment",
  "description": "Procurement of laptops and accessories for government offices",
  "authority": "Delhi Municipal Corporation",
  "location": "New Delhi",
  "deadline": "2025-12-31T18:30:00.000Z",
  "emd_amount": 50000,
  "document_fee": 5000,
  "estimated_value": 2500000,
  "published_date": "2025-07-29",
  "item_categories": ["computers", "electronics", "hardware"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tender": {
      "id": 124,
      "reference_no": "TNR2025002",
      "title": "Supply of IT Equipment",
      "status": "draft",
      "created_at": "2025-07-29T15:30:00.000Z",
      "created_by": 5
    }
  },
  "message": "Tender created successfully"
}
```

### Get Tender Details
```http
GET /tenders/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tender": {
      "id": 123,
      "reference_no": "TNR2025001",
      "title": "Supply of IT Equipment",
      "description": "Procurement of laptops and accessories",
      "authority": "Delhi Municipal Corporation",
      "location": "New Delhi",
      "deadline": "2025-12-31T18:30:00.000Z",
      "published_date": "2025-07-29",
      "emd_amount": "50000.00",
      "document_fee": "5000.00",
      "estimated_value": "2500000.00",
      "bid_value": null,
      "status": "live",
      "item_categories": ["computers", "electronics", "hardware"],
      "parsed_data": {
        "eligibility_criteria": ["GST Registration", "ISO Certification"],
        "technical_specs": {...},
        "delivery_terms": "45 days from order date"
      },
      "documents": [
        {
          "id": 45,
          "original_name": "tender_document.pdf",
          "document_type": "tender_document",
          "file_size": 2048000,
          "uploaded_at": "2025-07-29T10:30:00.000Z",
          "uploaded_by": {
            "id": 5,
            "name": "John Doe"
          }
        }
      ],
      "assignments": [
        {
          "id": 15,
          "user": {
            "id": 8,
            "name": "Jane Smith",
            "email": "jane@example.com",
            "avatar": "/avatars/jane.jpg"
          },
          "role": "Lead Analyst",
          "assigned_date": "2025-07-29T11:00:00.000Z",
          "status": "in_progress",
          "progress_percentage": 65
        }
      ],
      "activities": [
        {
          "id": 89,
          "action": "tender_created",
          "description": "Tender created by John Doe",
          "created_at": "2025-07-29T10:30:00.000Z",
          "user": {
            "id": 5,
            "name": "John Doe"
          }
        }
      ],
      "created_at": "2025-07-29T10:30:00.000Z",
      "updated_at": "2025-07-29T14:20:00.000Z",
      "created_by": {
        "id": 5,
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  }
}
```

### Update Tender
```http
PUT /tenders/{id}
```

**Request Body:**
```json
{
  "title": "Updated Tender Title",
  "description": "Updated description",
  "status": "in_process",
  "bid_value": 2400000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tender": {
      "id": 123,
      "reference_no": "TNR2025001",
      "title": "Updated Tender Title",
      "status": "in_process",
      "updated_at": "2025-07-29T16:00:00.000Z"
    }
  },
  "message": "Tender updated successfully"
}
```

### Delete Tender
```http
DELETE /tenders/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "Tender deleted successfully"
}
```

## Tender Assignment API

### Assign Users to Tender
```http
POST /tenders/{id}/assignments
```

**Request Body:**
```json
{
  "assignments": [
    {
      "user_id": 8,
      "role": "Lead Analyst",
      "responsibility": "Document analysis and eligibility check"
    },
    {
      "user_id": 12,
      "role": "Technical Reviewer",
      "responsibility": "Technical specification review"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assignments": [
      {
        "id": 25,
        "tender_id": 123,
        "user_id": 8,
        "role": "Lead Analyst",
        "status": "assigned",
        "assigned_date": "2025-07-29T16:30:00.000Z"
      }
    ]
  },
  "message": "Users assigned successfully"
}
```

### Update Assignment
```http
PUT /assignments/{id}
```

**Request Body:**
```json
{
  "status": "in_progress",
  "progress_percentage": 75,
  "notes": "Eligibility analysis completed, working on technical review"
}
```

## Document Management API

### Upload Document
```http
POST /tenders/{id}/documents
```

**Request (multipart/form-data):**
```
file: [File] (required)
document_type: "tender_document" | "tech_specs" | "atc_document" | "other"
category: string (optional)
description: string (optional)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "document": {
      "id": 46,
      "original_name": "technical_specs.pdf",
      "stored_name": "tender_123_tech_specs_20250729163000.pdf",
      "document_type": "tech_specs",
      "file_size": 3072000,
      "mime_type": "application/pdf",
      "uploaded_at": "2025-07-29T16:30:00.000Z",
      "processing_status": "pending"
    }
  },
  "message": "Document uploaded successfully"
}
```

### Get Document
```http
GET /documents/{id}
```

**Response:** File download or document metadata

### Delete Document
```http
DELETE /documents/{id}
```

## Company Management API

### Get Companies
```http
GET /companies
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `type`: Filter by company type (`dealer`, `oem`, `vendor`, `contractor`)
- `status`: Filter by status (`active`, `inactive`, `blacklisted`)
- `city`, `state`: Location filters
- `search`: Search in name, registration number

**Response:**
```json
{
  "success": true,
  "data": {
    "companies": [
      {
        "id": 15,
        "name": "Tech Solutions Pvt Ltd",
        "company_type": "dealer",
        "email": "contact@techsolutions.com",
        "phone": "+91-9876543210",
        "city": "Mumbai",
        "state": "Maharashtra",
        "gst_number": "27ABCDE1234F1Z5",
        "performance_rating": 4.2,
        "completed_projects": 25,
        "status": "active",
        "verification_status": "verified"
      }
    ],
    "pagination": {...}
  }
}
```

### Create Company
```http
POST /companies
```

**Request Body:**
```json
{
  "name": "New Tech Company",
  "company_type": "dealer",
  "email": "info@newtech.com",
  "phone": "+91-9876543210",
  "address_line1": "123 Business Park",
  "city": "Bangalore",
  "state": "Karnataka",
  "postal_code": "560001",
  "gst_number": "29ABCDE1234F1Z5",
  "pan_number": "ABCDE1234F",
  "industry": "Information Technology",
  "capabilities": ["Software Development", "Hardware Supply", "Support Services"]
}
```

## User Management API

### Get Users
```http
GET /users
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `role`: Filter by role name
- `department`: Filter by department
- `status`: Filter by status (`active`, `inactive`, `suspended`)
- `search`: Search in name, email

### Create User
```http
POST /users
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+91-9876543210",
  "department": "Operations",
  "designation": "Senior Analyst",
  "role_id": 3
}
```

### Update User
```http
PUT /users/{id}
```

### Get User Profile
```http
GET /users/profile
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 5,
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+91-9876543210",
      "department": "Operations",
      "designation": "Senior Analyst",
      "avatar_url": "/avatars/john.jpg",
      "role": {
        "id": 3,
        "name": "tender_manager",
        "display_name": "Tender Manager"
      },
      "permissions": [
        "view_tenders",
        "create_tender",
        "edit_tender",
        "assign_tender"
      ],
      "last_login": "2025-07-29T15:30:00.000Z",
      "created_at": "2025-01-15T10:00:00.000Z"
    }
  }
}
```

## Authentication API

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 86400,
    "user": {
      "id": 5,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "tender_manager"
    }
  }
}
```

### Refresh Token
```http
POST /auth/refresh
```

### Logout
```http
POST /auth/logout
```

### Change Password
```http
POST /auth/change-password
```

**Request Body:**
```json
{
  "current_password": "oldpassword123",
  "new_password": "newpassword456",
  "confirm_password": "newpassword456"
}
```

## Analytics & Reports API

### Dashboard Statistics
```http
GET /analytics/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_tenders": 156,
      "live_tenders": 24,
      "in_progress_tenders": 18,
      "submitted_tenders": 8,
      "awarded_tenders": 5,
      "success_rate": 62.5
    },
    "recent_activities": [...],
    "upcoming_deadlines": [...],
    "performance_metrics": {
      "this_month": {
        "created": 12,
        "submitted": 5,
        "awarded": 2
      },
      "last_month": {
        "created": 15,
        "submitted": 8,
        "awarded": 3
      }
    }
  }
}
```

### Generate Report
```http
POST /reports/generate
```

**Request Body:**
```json
{
  "report_type": "tender_summary",
  "date_from": "2025-01-01",
  "date_to": "2025-07-29",
  "filters": {
    "status": ["submitted", "awarded"],
    "authority": "Delhi Municipal Corporation"
  },
  "format": "pdf"
}
```

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request data is invalid",
    "details": {
      "title": ["The title field is required"],
      "deadline": ["The deadline must be a future date"]
    }
  },
  "timestamp": "2025-07-29T16:30:00.000Z"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `422` - Unprocessable Entity (business logic errors)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

### Common Error Codes
- `VALIDATION_ERROR` - Request validation failed
- `AUTHENTICATION_REQUIRED` - Valid authentication token required
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `RESOURCE_NOT_FOUND` - Requested resource does not exist
- `DUPLICATE_RESOURCE` - Resource already exists
- `BUSINESS_RULE_VIOLATION` - Operation violates business rules
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `FILE_UPLOAD_ERROR` - File upload failed
- `PROCESSING_ERROR` - Background processing failed

This comprehensive API documentation provides the development team with complete specifications for integrating with and extending the Tender Management System's REST API.