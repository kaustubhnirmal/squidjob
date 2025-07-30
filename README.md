# SquidJob Tender Management System

A comprehensive tender management module for SquidJob with advanced filtering, document management, bid participation workflow, and real-time notifications.

## 🚀 Features

### Core Functionality
- **Tender Management**: Complete CRUD operations for tenders with advanced filtering and search
- **Bid Participation**: Full bidding workflow from submission to evaluation
- **Document Management**: Secure file upload, storage, and management with virus scanning
- **Real-time Notifications**: Multi-channel notification system (email, SMS, push, in-app)
- **Security & Validation**: Comprehensive input validation, CSRF protection, and XSS prevention
- **Responsive Design**: Mobile-first design with SquidJob's purple theme

### Advanced Features
- **Multi-step Forms**: Wizard-style forms for tender creation and editing
- **Document Processing**: Automatic thumbnail generation, compression, and metadata extraction
- **Permission System**: Role-based access control for different user types
- **Activity Logging**: Complete audit trail for all tender and bid activities
- **Deadline Management**: Automated deadline reminders and notifications
- **Export Functionality**: Export tender data in various formats

## 📁 Project Structure

```
squidjob/
├── app/
│   ├── controllers/
│   │   ├── TenderController.php      # Main tender management controller
│   │   └── BidController.php         # Bid participation workflow controller
│   ├── models/
│   │   ├── Tender.php               # Tender data model with advanced filtering
│   │   ├── TenderCategory.php       # Category management model
│   │   ├── TenderDocument.php       # Document management model
│   │   ├── Bid.php                  # Bid management model
│   │   └── BidDocument.php          # Bid document management model
│   ├── views/tenders/
│   │   ├── index.php               # Tender listing with advanced filters
│   │   ├── show.php                # Tender details with document management
│   │   ├── create.php              # Multi-step tender creation form
│   │   └── edit.php                # Tender editing form with document management
│   └── utils/
│       ├── DocumentUploadHandler.php # Comprehensive file upload utility
│       ├── SecurityValidator.php     # Security and validation utility
│       └── NotificationManager.php   # Real-time notification system
├── database/
│   └── migrations/
│       └── create_tender_tables.sql  # Complete database schema
├── public/
│   └── css/
│       └── squidjob-theme.css       # SquidJob purple theme styling
└── README.md                        # This documentation file
```

## 🛠 Installation

### Prerequisites
- PHP 8.0 or higher
- MySQL 5.7 or higher
- Web server (Apache/Nginx)
- Composer (for dependencies)

### Database Setup

1. **Run the migration script**:
```sql
-- Execute the complete database schema
source database/migrations/create_tender_tables.sql;
```

2. **Verify tables created**:
```sql
SHOW TABLES LIKE 'tender%';
SHOW TABLES LIKE 'bid%';
```

### File Permissions

```bash
# Create upload directories
mkdir -p uploads/tenders uploads/bids logs
chmod 755 uploads/tenders uploads/bids logs
chmod 644 public/css/squidjob-theme.css
```

### Configuration

1. **Database Configuration**:
```php
// config/database.php
$config = [
    'host' => 'localhost',
    'database' => 'squidjob',
    'username' => 'your_username',
    'password' => 'your_password'
];
```

2. **Upload Configuration**:
```php
// config/upload.php
$uploadConfig = [
    'upload_path' => __DIR__ . '/../uploads/',
    'max_file_size' => 52428800, // 50MB
    'allowed_types' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png', 'zip'],
    'virus_scan' => true,
    'compression' => true
];
```

## 🎯 Usage

### Tender Management

#### Creating a New Tender
```php
// Navigate to /tenders/create
// Multi-step form with:
// 1. Basic Information
// 2. Details & Specifications  
// 3. Document Upload
// 4. Review & Submit
```

#### Advanced Filtering
```php
// Available filters on /tenders
$filters = [
    'category' => 'construction',
    'status' => 'active',
    'location' => 'New York',
    'min_value' => 10000,
    'max_value' => 100000,
    'deadline_from' => '2024-01-01',
    'deadline_to' => '2024-12-31',
    'search' => 'website development'
];
```

### Bid Management

#### Submitting a Bid
```php
// Navigate to /tenders/{id}/bid
// Form includes:
// - Bid amount and currency
// - Technical proposal
// - Financial proposal
// - Company profile
// - Document uploads
```

#### Bid Status Workflow
```
draft → submitted → under_review → shortlisted/rejected → awarded
```

### Document Management

#### Uploading Documents
```php
use DocumentUploadHandler;

$uploadHandler = new DocumentUploadHandler([
    'upload_path' => '/uploads/tenders/',
    'max_file_size' => 50 * 1024 * 1024, // 50MB
    'virus_scan' => true
]);

$result = $uploadHandler->uploadFile($_FILES['document'], 'tender_123');
```

#### Security Features
- File type validation
- Virus scanning (ClamAV integration)
- Secure filename generation
- Thumbnail generation for images
- File compression for large files

### Notifications

#### Setting Up Notifications
```php
use NotificationManager;

$notificationManager = new NotificationManager([
    'database' => $pdo,
    'email' => $emailConfig,
    'sms' => $smsConfig
]);

// Send tender notification
$notificationManager->sendTenderNotification($tenderId, 'tender_published');

// Send bid notification
$notificationManager->sendBidNotification($bidId, 'bid_submitted');
```

#### Notification Types
- `tender_published` - New tender published
- `tender_updated` - Tender information updated
- `deadline_reminder` - Deadline approaching
- `bid_submitted` - New bid received
- `bid_accepted` - Bid accepted
- `document_uploaded` - New document added

## 🔒 Security Features

### Input Validation
```php
use SecurityValidator;

$validator = new SecurityValidator();

// Validate form data
$validation = $validator->validateInput($_POST, [
    'title' => ['required' => true, 'max_length' => 500],
    'email' => ['required' => true, 'email' => true],
    'amount' => ['required' => true, 'numeric' => true, 'min_value' => 0]
]);
```

### CSRF Protection
```php
// Generate CSRF token
$csrfToken = $validator->generateCsrfToken();

// Validate CSRF token
if (!$validator->validateCsrfToken()) {
    throw new Exception('Invalid CSRF token');
}
```

### File Upload Security
- File type validation
- MIME type verification
- Virus scanning
- Secure filename generation
- Path traversal prevention

## 🎨 UI/UX Design

### SquidJob Purple Theme
- **Primary Color**: `#7c3aed`
- **Secondary Color**: `#8b5cf6`
- **Success Color**: `#10b981`
- **Warning Color**: `#f59e0b`
- **Error Color**: `#ef4444`

### Responsive Design
- Mobile-first approach
- Breakpoints: 480px, 768px, 1024px
- Touch-friendly interface
- Accessible design (WCAG 2.1)

### Components
- Cards with hover effects
- Multi-step forms with progress indicators
- Advanced filtering interface
- Document upload with drag & drop
- Real-time notifications
- Loading states and animations

## 📊 Database Schema

### Core Tables
- `tenders` - Main tender information
- `tender_categories` - Hierarchical categories
- `tender_documents` - Document management
- `bids` - Bid submissions
- `bid_documents` - Bid-related documents

### Supporting Tables
- `tender_watchers` - Notification subscriptions
- `tender_activities` - Audit trail
- `tender_evaluations` - Bid evaluation
- `tender_notifications` - In-app notifications

### Key Features
- Foreign key constraints
- Indexes for performance
- Full-text search capabilities
- Triggers for data consistency
- Views for common queries

## 🔧 API Endpoints

### Tender Endpoints
```
GET    /tenders              # List tenders with filtering
GET    /tenders/{id}         # Get tender details
POST   /tenders              # Create new tender
PUT    /tenders/{id}         # Update tender
DELETE /tenders/{id}         # Delete tender
GET    /tenders/{id}/export  # Export tender data
```

### Bid Endpoints
```
GET    /bids                 # List user's bids
GET    /bids/{id}            # Get bid details
POST   /tenders/{id}/bid     # Submit bid
PUT    /bids/{id}            # Update bid
DELETE /bids/{id}            # Withdraw bid
```

### Document Endpoints
```
POST   /tenders/{id}/documents     # Upload document
GET    /tenders/{id}/documents/{docId}/download  # Download document
DELETE /tenders/{id}/documents/{docId}           # Delete document
```

## 🧪 Testing

### Unit Tests
```bash
# Run PHPUnit tests
phpunit tests/TenderControllerTest.php
phpunit tests/BidControllerTest.php
phpunit tests/SecurityValidatorTest.php
```

### Integration Tests
```bash
# Test complete workflows
phpunit tests/TenderWorkflowTest.php
phpunit tests/BidWorkflowTest.php
phpunit tests/NotificationTest.php
```

### Performance Tests
```bash
# Load testing with Apache Bench
ab -n 1000 -c 10 http://localhost/tenders
ab -n 500 -c 5 http://localhost/tenders/create
```

## 🚀 Performance Optimization

### Database Optimization
- Proper indexing on frequently queried columns
- Query optimization with EXPLAIN
- Connection pooling
- Prepared statements

### File Handling
- Lazy loading for large files
- Image compression and thumbnails
- CDN integration for static assets
- Caching for frequently accessed documents

### Frontend Optimization
- CSS and JavaScript minification
- Image optimization
- Lazy loading for images
- Service worker for offline functionality

## 🔄 Maintenance

### Regular Tasks
```bash
# Clean up expired CSRF tokens
php scripts/cleanup_csrf_tokens.php

# Process pending notifications
php scripts/process_notifications.php

# Generate deadline reminders
php scripts/send_deadline_reminders.php

# Clean up orphaned documents
php scripts/cleanup_orphaned_documents.php
```

### Monitoring
- Log file rotation
- Database performance monitoring
- File storage usage tracking
- Notification delivery rates

## 🤝 Contributing

### Code Standards
- PSR-4 autoloading
- PSR-12 coding style
- PHPDoc comments
- Type declarations

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Write tests
4. Implement feature
5. Submit pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Documentation
- API documentation: `/docs/api`
- User guide: `/docs/user-guide`
- Developer guide: `/docs/developer-guide`

### Contact
- Email: support@squidjob.com
- GitHub Issues: [Create Issue](https://github.com/squidjob/tender-management/issues)
- Documentation: [Wiki](https://github.com/squidjob/tender-management/wiki)

## 🎉 Acknowledgments

- SquidJob development team
- Open source contributors
- Beta testers and early adopters

---

**Built with ❤️ for the SquidJob community**