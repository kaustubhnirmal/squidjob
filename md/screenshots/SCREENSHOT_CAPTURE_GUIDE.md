# Screenshot Capture Guide
# Instructions for Migration Team to Capture Application Screenshots

## Overview

This guide provides step-by-step instructions for the migration team to capture comprehensive screenshots of the Tender Management System. Follow these procedures to create a complete visual documentation library.

## Prerequisites

### Software Requirements
- **Browser**: Chrome 120+ or Firefox 120+ (Chrome recommended)
- **Screenshot Tool**: Built-in browser tools or Lightshot/Snagit
- **Image Editor**: Basic editing tool for cropping/annotation
- **Resolution**: 1920x1080 monitor for desktop captures

### System Setup
1. **Clean Browser Profile**: Use incognito/private mode or clean profile
2. **Disable Extensions**: Turn off ad blockers and other extensions
3. **Standard Zoom**: Set browser zoom to 100%
4. **Clear Cache**: Clear browser cache before starting
5. **Stable Connection**: Ensure stable internet connection

## Step-by-Step Capture Process

### Phase 1: Application Setup

#### 1.1 Access the Application
```bash
# Start the application
npm run dev
# Or access deployed version
https://yourdomain.com
```

#### 1.2 Login with Test Accounts
```
Admin Account:
Email: admin@tender247.com
Password: Admin@123

Manager Account:
Email: manager@tender247.com
Password: Admin@123

User Account:
Email: user1@tender247.com
Password: Admin@123
```

#### 1.3 Prepare Sample Data
- Ensure database has sample data loaded
- Create a few test tenders with different statuses
- Add sample companies and users
- Upload sample documents

### Phase 2: Authentication Screenshots

#### 2.1 Login Page (01-authentication/login-page.png)
1. Navigate to login page
2. Clear any auto-filled data
3. Capture full browser window
4. Include URL bar for reference
5. Ensure login form is prominently visible

#### 2.2 Form Validation (01-authentication/login-validation-errors.png)
1. Enter invalid email format
2. Click login to trigger validation
3. Capture error states
4. Reset form and try empty fields
5. Capture all validation messages

#### 2.3 Password Reset (01-authentication/forgot-password-popup.png)
1. Click "Forgot Password" link
2. Wait for popup/modal to fully load
3. Capture popup with overlay background
4. Include close button and form elements

### Phase 3: Dashboard Screenshots

#### 3.1 Main Dashboard (02-dashboard/dashboard-overview.png)
1. Login as admin for full access
2. Wait for all widgets to load
3. Capture full dashboard view
4. Ensure all statistics are visible
5. Include navigation sidebar

#### 3.2 Statistics Cards (02-dashboard/dashboard-statistics-cards.png)
1. Focus on statistics section
2. Capture all metric cards
3. Ensure numbers are clearly visible
4. Include any chart elements

#### 3.3 Recent Activity (02-dashboard/dashboard-recent-activity.png)
1. Scroll to activity feed section
2. Capture recent notifications
3. Include timestamps and user actions
4. Show activity icons and details

### Phase 4: Tender Management Screenshots

#### 4.1 All Tenders View (03-tenders/tenders-all-tenders.png)
1. Navigate to Tenders > All Tenders
2. Ensure table has multiple entries
3. Capture full table with headers
4. Include pagination if present
5. Show action buttons on rows

#### 4.2 Tender Creation (03-tenders/tenders-create-new-popup.png)
1. Click "Create New Tender" button
2. Wait for form/modal to open
3. Capture form with all fields visible
4. Show required field indicators
5. Include submit and cancel buttons

#### 4.3 Tender Details (03-tenders/tenders-details-modal.png)
1. Click on any tender row/title
2. Wait for details modal to load
3. Capture complete tender information
4. Include document attachments
5. Show status and assignment details

#### 4.4 Tender Filters (03-tenders/tenders-filter-sidebar.png)
1. Open filter panel/sidebar
2. Expand all filter sections
3. Capture search and filter options
4. Include date pickers and dropdowns
5. Show clear/reset filter options

#### 4.5 Bulk Operations (03-tenders/tenders-bulk-actions-popup.png)
1. Select multiple tender rows
2. Click bulk actions dropdown
3. Capture available bulk operations
4. Show selection count and options

### Phase 5: Company Management Screenshots

#### 5.1 Company Listing (04-companies/companies-all-companies.png)
1. Navigate to Companies > All Companies
2. Capture complete company table
3. Include company types and status
4. Show search and filter options
5. Include action buttons

#### 5.2 Add Company (04-companies/companies-add-new-popup.png)
1. Click "Add New Company" button
2. Capture company creation form
3. Include all tabs (if multi-step)
4. Show required fields and validation
5. Include file upload sections

#### 5.3 Company Details (04-companies/companies-contact-details-modal.png)
1. Click on company name/details
2. Capture contact information modal
3. Include all contact details
4. Show address and communication info
5. Include edit and delete options

### Phase 6: User Management Screenshots

#### 6.1 User Listing (05-users/users-all-users.png)
1. Navigate to Users > All Users
2. Capture user table with roles
3. Include status indicators
4. Show department and designation
5. Include action buttons

#### 6.2 Add User (05-users/users-add-new-popup.png)
1. Click "Add New User" button
2. Capture user creation form
3. Include role assignment dropdown
4. Show department selection
5. Include password requirements

#### 6.3 User Permissions (05-users/users-permissions-modal.png)
1. Edit existing user
2. Navigate to permissions tab
3. Capture permission matrix
4. Show role-based permissions
5. Include save/cancel options

### Phase 7: Document Management Screenshots

#### 7.1 Document Briefcase (06-documents/documents-briefcase.png)
1. Navigate to Documents > Briefcase
2. Capture file listing interface
3. Include folder structure (if any)
4. Show file types and sizes
5. Include upload and download options

#### 7.2 File Upload (06-documents/documents-upload-popup.png)
1. Click upload button
2. Capture file upload interface
3. Show drag-and-drop area
4. Include file type restrictions
5. Show progress indicators

#### 7.3 Document Preview (06-documents/documents-preview-modal.png)
1. Click on document to preview
2. Capture preview modal
3. Include zoom and navigation controls
4. Show download and share options

### Phase 8: Reports Screenshots

#### 8.1 Reports Dashboard (07-reports/reports-dashboard.png)
1. Navigate to Reports section
2. Capture reports overview
3. Include available report types
4. Show recent reports and exports
5. Include generation options

#### 8.2 Report Generation (07-reports/reports-export-popup.png)
1. Click "Generate Report" button
2. Capture report configuration form
3. Include date range picker
4. Show export format options
5. Include filter selections

### Phase 9: Settings Screenshots

#### 9.1 System Settings (08-settings/settings-system-config.png)
1. Navigate to Settings
2. Capture system configuration
3. Include all setting categories
4. Show current values
5. Include save/reset options

#### 9.2 Email Configuration (08-settings/settings-email-config.png)
1. Navigate to Email Settings
2. Capture SMTP configuration
3. Include template settings
4. Show test email functionality
5. Include security options

### Phase 10: Mobile Screenshots

#### 10.1 Mobile Setup
1. Open browser developer tools (F12)
2. Click mobile device toggle
3. Select iPhone SE (375x667) or iPhone 11 (414x896)
4. Refresh page to load mobile layout

#### 10.2 Mobile Navigation (11-mobile-views/mobile-navigation-drawer.png)
1. Open mobile navigation menu
2. Capture slide-out drawer
3. Include all menu items
4. Show user profile section
5. Include logout option

#### 10.3 Mobile Tender View (11-mobile-views/mobile-tender-list-view.png)
1. Navigate to tenders on mobile
2. Capture mobile-optimized layout
3. Include swipe actions (if any)
4. Show mobile search interface
5. Include floating action buttons

### Phase 11: Error States

#### 11.1 404 Error (10-error-states/error-404-page.png)
1. Navigate to non-existent URL
2. Capture 404 error page
3. Include navigation options
4. Show back to home button

#### 11.2 Form Validation (10-error-states/validation-errors-form.png)
1. Submit form with invalid data
2. Capture validation error messages
3. Include field-level errors
4. Show error styling and icons

#### 11.3 Network Errors (10-error-states/network-error-popup.png)
1. Simulate network disconnection
2. Capture network error messages
3. Include retry options
4. Show offline indicators

## Screenshot Quality Standards

### Technical Requirements
- **Resolution**: Full resolution, no downscaling
- **Format**: PNG for transparency support
- **Quality**: Lossless compression only
- **File Size**: Optimize for clarity, not size
- **Naming**: Follow exact naming convention

### Visual Standards
- **Lighting**: Use default browser/system lighting
- **Contrast**: Ensure text is clearly readable
- **Cropping**: Include full interface elements
- **Overlays**: Capture modal overlays completely
- **Scrolling**: Capture full-page screenshots when needed

### Content Standards
- **Data**: Use realistic sample data
- **Text**: Ensure all text is legible
- **States**: Capture both active and inactive states
- **Interactions**: Show hover effects where applicable
- **Loading**: Include loading states in action

## File Organization

### Naming Convention
```
[category-subcategory-description.png]

Examples:
- dashboard-overview.png
- tenders-create-new-popup.png
- users-permissions-modal.png
- mobile-navigation-drawer.png
```

### Folder Structure
```
screenshots/
├── 01-authentication/
├── 02-dashboard/
├── 03-tenders/
├── 04-companies/
├── 05-users/
├── 06-documents/
├── 07-reports/
├── 08-settings/
├── 09-popups-modals/
├── 10-error-states/
├── 11-mobile-views/
├── 12-components/
└── 13-themes/
```

## Quality Assurance Checklist

### Before Starting
- [ ] Application is running and accessible
- [ ] Sample data is loaded and visible
- [ ] Browser is set to 100% zoom
- [ ] Extensions are disabled
- [ ] Screen resolution is set to 1920x1080

### During Capture
- [ ] All interface elements are visible
- [ ] Text is clearly readable
- [ ] No loading spinners unless documenting loading states
- [ ] Modal overlays are captured completely
- [ ] Navigation elements are included

### After Capture
- [ ] File names follow naming convention
- [ ] Images are saved in correct folders
- [ ] Quality is suitable for documentation
- [ ] All required screenshots are captured
- [ ] Mobile views are captured separately

## Troubleshooting

### Common Issues
1. **Blurry Screenshots**: Check browser zoom level (should be 100%)
2. **Missing Elements**: Wait for page to fully load before capturing
3. **Modal Issues**: Ensure modal is fully opened and overlay is visible
4. **Mobile View**: Make sure responsive mode is enabled in dev tools
5. **File Size**: Use PNG format to maintain quality

### Best Practices
- Take screenshots in sequence to maintain consistency
- Keep browser window maximized for desktop captures
- Use consistent timing for animations and transitions
- Capture both light and dark themes if available
- Document any custom themes or branding variations

This comprehensive guide ensures the migration team captures all necessary screenshots for complete visual documentation of the Tender Management System.