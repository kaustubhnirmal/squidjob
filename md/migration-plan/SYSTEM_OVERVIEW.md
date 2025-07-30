# System Overview - Tender Management System
# Complete Business Logic and Technical Architecture

## Business Overview

### What is Tender247?
Tender247 is a comprehensive tender management platform that streamlines the entire tender lifecycle from discovery to contract award. The system serves government agencies, corporations, and vendors involved in the procurement process.

### Core Business Processes

#### 1. Tender Lifecycle Management
```
Tender Import → Data Extraction → Assignment → Tracking → Bid Preparation → Submission → Award
     ↓              ↓              ↓          ↓            ↓              ↓         ↓
  PDF/Excel    AI Analysis    Team Setup   Status     Document        Final     Contract
  Documents    & Parsing     & Roles      Updates    Compilation    Submission  Management
```

#### 2. User Roles and Responsibilities
- **System Admin**: Complete system management and configuration
- **Tender Manager**: Tender oversight, assignment, and approval
- **Sales Head**: Business development and client relationships  
- **Accountant**: Financial management and budget tracking
- **Team Members**: Tender processing and document preparation

#### 3. Key Business Entities
```
Tenders
├── Basic Information (title, authority, location)
├── Financial Details (EMD, document fee, estimated value)
├── Timeline (deadline, submission date)
├── Documents (tender file, technical specs, attachments)
├── Assignments (team members, roles)
└── Status Tracking (draft → live → submitted → awarded)

Companies
├── Dealer Information (registration, capabilities)
├── OEM Database (manufacturer details)
├── Performance History (past projects, ratings)
└── Compliance Status (certifications, validations)

Documents
├── Tender Files (original documents)
├── Bid Documents (compiled submissions)
├── Technical Specifications (requirement documents)
└── Compliance Certificates (legal documents)
```

## Technical Architecture

### System Components
```
Frontend Layer (React/TypeScript)
├── User Interface Components
├── State Management (React Query)
├── Routing (Wouter)
├── Form Handling (React Hook Form)
└── Responsive Design (TailwindCSS)

Backend Layer (Node.js/Express)
├── API Controllers (request handling)
├── Business Services (logic implementation)
├── Authentication (JWT-based)
├── File Processing (multer, PDF parsing)
└── Database Access (Drizzle ORM)

Database Layer (PostgreSQL)
├── Core Tables (users, tenders, companies)
├── Relationship Tables (assignments, documents)
├── Audit Tables (logs, notifications)
└── Configuration Tables (settings, permissions)

External Services
├── AI Analysis (OpenAI/Anthropic)
├── Email Services (nodemailer)
├── File Storage (local/cloud)
└── Monitoring (logging, metrics)
```

### Data Flow Architecture
```
1. User Authentication Flow
   Browser → Auth Middleware → JWT Validation → User Context → Protected Routes

2. Tender Creation Flow
   Form Input → Validation → Service Layer → Database → Notification → UI Update

3. Document Processing Flow
   File Upload → Parse/Extract → AI Analysis → Database Storage → Search Index

4. Assignment Workflow
   Manager Action → Permission Check → Assignment Creation → Team Notification

5. Status Update Flow
   Status Change → Workflow Validation → Database Update → Audit Log → Notification
```

## Core Features

### 1. Tender Management
```javascript
// Core tender operations
const tenderOperations = {
  create: {
    input: ['title', 'authority', 'deadline', 'documents'],
    process: ['validation', 'referenceGeneration', 'documentParsing'],
    output: ['tenderRecord', 'assignmentNotification']
  },
  
  update: {
    input: ['tenderId', 'updateData', 'userId'],
    process: ['permissionCheck', 'validation', 'auditLogging'],
    output: ['updatedRecord', 'changeNotification']
  },
  
  assign: {
    input: ['tenderId', 'userIds', 'roles'],
    process: ['availabilityCheck', 'workloadBalance'],
    output: ['assignments', 'teamNotification']
  }
};
```

### 2. Document Processing
```javascript
// Document handling workflow
const documentWorkflow = {
  upload: {
    validation: ['fileType', 'fileSize', 'virusScan'],
    processing: ['metadataExtraction', 'thumbnailGeneration'],
    storage: ['encryptedStorage', 'accessControl']
  },
  
  analysis: {
    extraction: ['textParsing', 'tableExtraction', 'structuredData'],
    aiAnalysis: ['eligibilityCriteria', 'keyRequirements', 'deadlines'],
    indexing: ['fullTextSearch', 'categoryTagging', 'keywordExtraction']
  }
};
```

### 3. User Management
```javascript
// User and permission system
const userManagement = {
  authentication: {
    methods: ['email/password', 'jwtTokens'],
    security: ['bcryptHashing', 'tokenExpiry', 'refreshTokens']
  },
  
  authorization: {
    roles: ['admin', 'manager', 'head', 'accountant', 'user'],
    permissions: ['view', 'create', 'edit', 'delete', 'assign', 'approve'],
    enforcement: ['routeProtection', 'apiMiddleware', 'uiConditional']
  }
};
```

## Business Logic Implementation

### 1. Tender Status Workflow
```typescript
// Tender status state machine
enum TenderStatus {
  DRAFT = 'draft',           // Initial creation, editable
  LIVE = 'live',             // Published, team can work
  IN_PROCESS = 'in_process', // Actively being worked on
  SUBMITTED = 'submitted',   // Bid submitted, awaiting result
  AWARDED = 'awarded',       // Won the tender
  REJECTED = 'rejected',     // Lost the tender
  CANCELLED = 'cancelled',   // Tender cancelled by authority
  COMPLETED = 'completed'    // Project completed
}

// Status transition rules
const statusTransitions = {
  [TenderStatus.DRAFT]: [TenderStatus.LIVE, TenderStatus.CANCELLED],
  [TenderStatus.LIVE]: [TenderStatus.IN_PROCESS, TenderStatus.CANCELLED],
  [TenderStatus.IN_PROCESS]: [TenderStatus.SUBMITTED, TenderStatus.LIVE],
  [TenderStatus.SUBMITTED]: [TenderStatus.AWARDED, TenderStatus.REJECTED],
  [TenderStatus.AWARDED]: [TenderStatus.COMPLETED],
  [TenderStatus.REJECTED]: [], // Terminal state
  [TenderStatus.CANCELLED]: [], // Terminal state
  [TenderStatus.COMPLETED]: [] // Terminal state
};
```

### 2. Assignment Logic
```typescript
// Team assignment business rules
interface AssignmentRules {
  maxTendersPerUser: number;
  requiredRoles: string[];
  workloadBalancing: boolean;
  skillMatching: boolean;
}

// Assignment algorithm
const assignmentAlgorithm = {
  1: 'Check user availability and current workload',
  2: 'Verify required skills and experience',
  3: 'Calculate optimal team composition',
  4: 'Apply workload balancing across team',
  5: 'Send assignment notifications',
  6: 'Create calendar events and reminders'
};
```

### 3. Financial Management
```typescript
// Financial workflow for tenders
interface FinancialWorkflow {
  emdManagement: {
    calculation: 'Percentage of tender value or fixed amount',
    submission: 'Bank guarantee or DD submission tracking',
    refund: 'Automatic refund processing for unsuccessful bids'
  };
  
  documentFees: {
    payment: 'Online payment integration',
    receipt: 'Automatic receipt generation',
    accounting: 'Integration with accounting systems'
  };
  
  budgetTracking: {
    allocation: 'Project budget allocation and tracking',
    expenses: 'Expense management and approval workflow',
    reporting: 'Financial reporting and analytics'
  };
}
```

## Integration Points

### 1. External System Integration
```javascript
// Integration capabilities
const integrations = {
  government: {
    gem: 'Government e-Marketplace integration',
    eprocurement: 'State procurement portal integration',
    apis: 'Tender data APIs and webhooks'
  },
  
  financial: {
    banking: 'Payment gateway integration',
    accounting: 'ERP system integration',
    reporting: 'Financial reporting tools'
  },
  
  communication: {
    email: 'SMTP integration for notifications',
    sms: 'SMS gateway for alerts',
    collaboration: 'Teams/Slack integration'
  }
};
```

### 2. API Architecture
```javascript
// RESTful API design
const apiStructure = {
  base: '/api/v1',
  endpoints: {
    tenders: {
      'GET /tenders': 'List tenders with filtering',
      'POST /tenders': 'Create new tender',
      'GET /tenders/:id': 'Get tender details',
      'PUT /tenders/:id': 'Update tender',
      'DELETE /tenders/:id': 'Soft delete tender'
    },
    
    assignments: {
      'POST /tenders/:id/assignments': 'Assign users to tender',
      'GET /users/:id/assignments': 'Get user assignments',
      'PUT /assignments/:id': 'Update assignment status'
    },
    
    documents: {
      'POST /tenders/:id/documents': 'Upload document',
      'GET /documents/:id': 'Download document',
      'DELETE /documents/:id': 'Remove document'
    }
  }
};
```

## Performance & Scalability

### 1. Database Optimization
```sql
-- Key performance indexes
CREATE INDEX idx_tenders_status_deadline ON tenders(status, deadline);
CREATE INDEX idx_assignments_user_tender ON assignments(user_id, tender_id);
CREATE INDEX idx_documents_tender_type ON documents(tender_id, document_type);
CREATE INDEX idx_search_fulltext ON tenders USING gin(to_tsvector('english', title || ' ' || description));
```

### 2. Caching Strategy
```javascript
// Caching implementation
const cachingStrategy = {
  redis: {
    userSessions: '24 hours',
    tenderLists: '5 minutes',
    userPermissions: '1 hour',
    searchResults: '15 minutes'
  },
  
  application: {
    configSettings: 'Application startup',
    userRoles: 'Login session',
    staticData: 'Daily refresh'
  }
};
```

## Security Implementation

### 1. Authentication Security
```typescript
// Security measures
const securityMeasures = {
  authentication: {
    passwordHashing: 'bcrypt with 12 salt rounds',
    jwtTokens: '24-hour expiry with refresh tokens',
    sessionManagement: 'Secure session handling'
  },
  
  authorization: {
    rbac: 'Role-based access control',
    routeProtection: 'Middleware-based protection',
    apiSecurity: 'Token validation on all endpoints'
  },
  
  dataProtection: {
    inputValidation: 'Zod schema validation',
    sqlInjection: 'Parameterized queries',
    xssProtection: 'Input sanitization',
    fileUpload: 'File type and size validation'
  }
};
```

This system overview provides the development team with a complete understanding of the business logic, technical architecture, and implementation details needed for successful development and maintenance.