# UI/UX Layout Guide - Complete Interface Templates
# Tender Management System Frontend Architecture

## Layout Overview

### Application Structure
```
Main Application Layout
├── Header Navigation (Global)
│   ├── Brand Logo & Title
│   ├── Main Navigation Menu
│   ├── User Profile Dropdown
│   └── Notifications Bell
├── Sidebar Navigation (Contextual)
│   ├── Dashboard Link
│   ├── Tender Management
│   ├── Company Management
│   ├── Document Center
│   └── Settings
├── Main Content Area (Dynamic)
│   ├── Page Header with Breadcrumbs
│   ├── Action Buttons & Filters
│   ├── Content Cards/Tables
│   └── Pagination Controls
└── Footer (Minimal)
    ├── Copyright Information
    └── Version Number
```

### Responsive Breakpoints
```css
/* Mobile First Approach */
--mobile: 0px to 767px       /* Single column, stacked navigation */
--tablet: 768px to 1023px    /* Two column, collapsible sidebar */
--desktop: 1024px to 1439px  /* Three column, fixed sidebar */
--large: 1440px+             /* Full layout, expanded content */
```

## Page Layout Templates

### 1. Dashboard Layout Template
```jsx
/**
 * Dashboard Layout - Main landing page after login
 * Features: Stats cards, recent activity, quick actions
 */
const DashboardLayout = () => {
  return (
    <div className="dashboard-container">
      {/* Stats Cards Row */}
      <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Tenders"
          value="156"
          trend="+12%"
          color="blue"
          icon="FileText"
        />
        <StatsCard
          title="Live Tenders"
          value="24"
          trend="+5%"
          color="green"
          icon="Activity"
        />
        <StatsCard
          title="In Progress"
          value="18"
          trend="0%"
          color="yellow"
          icon="Clock"
        />
        <StatsCard
          title="Submitted"
          value="8"
          trend="+3%"
          color="purple"
          icon="Send"
        />
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Tenders */}
        <div className="lg:col-span-2">
          <ContentCard title="Recent Tenders" actionText="View All">
            <TenderListCompact tenders={recentTenders} />
          </ContentCard>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <ContentCard title="Quick Actions">
            <div className="space-y-3">
              <QuickActionButton
                icon="Plus"
                text="Create New Tender"
                href="/tenders/create"
              />
              <QuickActionButton
                icon="Upload"
                text="Import Tender Document"
                href="/tenders/import"
              />
              <QuickActionButton
                icon="Users"
                text="Manage Team"
                href="/users"
              />
            </div>
          </ContentCard>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="mt-8">
        <ContentCard title="Recent Activity">
          <ActivityTimeline activities={recentActivities} />
        </ContentCard>
      </div>
    </div>
  );
};
```

### 2. List Layout Template (Tender List)
```jsx
/**
 * List Layout - For displaying lists of items with filters
 * Features: Search, filters, pagination, bulk actions
 */
const ListLayout = ({ title, items, filters, actions }) => {
  return (
    <div className="list-container">
      {/* Page Header */}
      <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-1">Manage and track all tenders</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section bg-white rounded-lg border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <SearchInput
              placeholder="Search tenders..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <div>
            <Select
              placeholder="Status"
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
          <div>
            <Select
              placeholder="Authority"
              options={authorityOptions}
              value={authorityFilter}
              onChange={setAuthorityFilter}
            />
          </div>
        </div>
      </div>

      {/* Mobile View - Card Layout */}
      <div className="block md:hidden">
        <div className="space-y-4">
          {items.map((tender) => (
            <TenderMobileCard
              key={tender.id}
              tender={tender}
              onSelect={() => handleTenderSelect(tender)}
            />
          ))}
        </div>
      </div>

      {/* Desktop View - Table Layout */}
      <div className="hidden md:block">
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tender Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Authority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((tender) => (
                <TenderTableRow
                  key={tender.id}
                  tender={tender}
                  onEdit={() => handleEdit(tender)}
                  onDelete={() => handleDelete(tender)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-700">
          Showing {startIndex} to {endIndex} of {totalItems} results
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};
```

### 3. Form Layout Template (Create/Edit)
```jsx
/**
 * Form Layout - For creating and editing records
 * Features: Multi-step forms, validation, file uploads
 */
const FormLayout = ({ title, onSubmit, initialData, isEdit = false }) => {
  return (
    <div className="form-container max-w-4xl mx-auto">
      {/* Form Header */}
      <div className="form-header mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-1">
          {isEdit ? 'Update tender information' : 'Fill in the details to create a new tender'}
        </p>
      </div>

      {/* Form Progress (for multi-step forms) */}
      <div className="form-progress mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${currentStep >= index + 1 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {index + 1}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className="ml-4 flex-1 h-0.5 bg-gray-200">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ 
                      width: currentStep > index + 1 ? '100%' : '0%' 
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information Section */}
        <FormSection title="Basic Information" description="Essential tender details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Tender Title"
              name="title"
              placeholder="Enter tender title"
              required
              error={errors.title}
            />
            <FormField
              label="Reference Number"
              name="referenceNo"
              placeholder="Auto-generated"
              disabled
              value={referenceNumber}
            />
            <FormField
              label="Issuing Authority"
              name="authority"
              placeholder="Enter authority name"
              required
              error={errors.authority}
            />
            <FormField
              label="Location"
              name="location"
              placeholder="Enter location"
              error={errors.location}
            />
          </div>
          <div className="mt-6">
            <FormField
              label="Description"
              name="description"
              type="textarea"
              rows={4}
              placeholder="Enter detailed description"
              error={errors.description}
            />
          </div>
        </FormSection>

        {/* Timeline Section */}
        <FormSection title="Timeline" description="Important dates and deadlines">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Submission Deadline"
              name="deadline"
              type="datetime-local"
              required
              error={errors.deadline}
            />
            <FormField
              label="Publication Date"
              name="publishedAt"
              type="date"
              error={errors.publishedAt}
            />
          </div>
        </FormSection>

        {/* Financial Information */}
        <FormSection title="Financial Information" description="Costs and monetary details">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              label="EMD Amount (₹)"
              name="emdAmount"
              type="number"
              placeholder="0.00"
              error={errors.emdAmount}
            />
            <FormField
              label="Document Fee (₹)"
              name="documentFee"
              type="number"
              placeholder="0.00"
              error={errors.documentFee}
            />
            <FormField
              label="Estimated Value (₹)"
              name="estimatedValue"
              type="number"
              placeholder="0.00"
              error={errors.estimatedValue}
            />
          </div>
        </FormSection>

        {/* Document Upload */}
        <FormSection title="Documents" description="Upload relevant documents">
          <div className="space-y-4">
            <FileUpload
              label="Tender Document"
              name="tenderDocument"
              accept=".pdf,.doc,.docx"
              maxSize="50MB"
              error={errors.tenderDocument}
              onUpload={handleDocumentUpload}
            />
            <FileUpload
              label="Technical Specifications"
              name="techSpecs"
              accept=".pdf,.doc,.docx"
              maxSize="50MB"
              error={errors.techSpecs}
              onUpload={handleSpecsUpload}
            />
          </div>
        </FormSection>

        {/* Form Actions */}
        <div className="form-actions flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => saveDraft()}
            disabled={isSubmitting}
          >
            Save as Draft
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (isEdit ? 'Update Tender' : 'Create Tender')}
          </Button>
        </div>
      </form>
    </div>
  );
};
```

### 4. Detail Layout Template (Tender Details)
```jsx
/**
 * Detail Layout - For viewing detailed information
 * Features: Tabbed interface, action buttons, related data
 */
const DetailLayout = ({ tender, tabs, actions }) => {
  return (
    <div className="detail-container">
      {/* Detail Header */}
      <div className="detail-header bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            {/* Back Button & Title */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to List
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {tender.title}
                </h1>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm text-gray-600">
                    {tender.referenceNo}
                  </span>
                  <StatusBadge status={tender.status} />
                  <span className="text-sm text-gray-600">
                    Deadline: {formatDate(tender.deadline)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Users className="w-4 h-4 mr-2" />
                    Assign Team
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Tender
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`
                    py-2 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="detail-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Information */}
            <div className="lg:col-span-2 space-y-6">
              <InfoCard title="Tender Information">
                <InfoRow label="Title" value={tender.title} />
                <InfoRow label="Reference" value={tender.referenceNo} />
                <InfoRow label="Authority" value={tender.authority} />
                <InfoRow label="Location" value={tender.location} />
                <InfoRow label="Description" value={tender.description} />
              </InfoCard>

              <InfoCard title="Financial Details">
                <InfoRow label="EMD Amount" value={`₹ ${formatCurrency(tender.emdAmount)}`} />
                <InfoRow label="Document Fee" value={`₹ ${formatCurrency(tender.documentFee)}`} />
                <InfoRow label="Estimated Value" value={`₹ ${formatCurrency(tender.estimatedValue)}`} />
              </InfoCard>
            </div>

            {/* Sidebar Information */}
            <div className="lg:col-span-1 space-y-6">
              <InfoCard title="Status & Timeline">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      <StatusBadge status={tender.status} />
                    </div>
                  </div>
                  <InfoRow label="Created" value={formatDate(tender.createdAt)} />
                  <InfoRow label="Deadline" value={formatDate(tender.deadline)} />
                  <InfoRow label="Days Remaining" value={getDaysRemaining(tender.deadline)} />
                </div>
              </InfoCard>

              <InfoCard title="Assigned Team">
                <div className="space-y-3">
                  {tender.assignments?.map((assignment) => (
                    <div key={assignment.id} className="flex items-center space-x-3">
                      <Avatar
                        src={assignment.user.avatar}
                        name={assignment.user.name}
                        size="sm"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {assignment.user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {assignment.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </InfoCard>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <DocumentsTab
            tenderId={tender.id}
            documents={tender.documents}
            onUpload={handleDocumentUpload}
            onDelete={handleDocumentDelete}
          />
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <ActivityTab
            tenderId={tender.id}
            activities={tender.activities}
          />
        )}
      </div>
    </div>
  );
};
```

## Component Templates

### 1. Card Components
```jsx
/**
 * Tender Card - Used in grid/list views
 */
const TenderCard = ({ tender, onSelect, className }) => {
  return (
    <div
      className={`
        bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md 
        transition-shadow cursor-pointer ${className}
      `}
      onClick={() => onSelect(tender)}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {tender.title}
          </h3>
          <p className="text-sm text-gray-600">{tender.referenceNo}</p>
        </div>
        <StatusBadge status={tender.status} />
      </div>

      {/* Card Content */}
      <div className="space-y-3">
        <InfoRow
          icon={Building}
          label="Authority"
          value={tender.authority}
        />
        <InfoRow
          icon={MapPin}
          label="Location"
          value={tender.location}
        />
        <InfoRow
          icon={Calendar}
          label="Deadline"
          value={formatDate(tender.deadline)}
          highlight={isDeadlineNear(tender.deadline)}
        />
        {tender.estimatedValue && (
          <InfoRow
            icon={DollarSign}
            label="Value"
            value={`₹ ${formatCurrency(tender.estimatedValue)}`}
          />
        )}
      </div>

      {/* Card Actions */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          {tender.assignments?.slice(0, 3).map((assignment) => (
            <Avatar
              key={assignment.id}
              src={assignment.user.avatar}
              name={assignment.user.name}
              size="xs"
            />
          ))}
          {tender.assignments?.length > 3 && (
            <span className="text-xs text-gray-500">
              +{tender.assignments.length - 3} more
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Mobile Tender Card - Optimized for mobile devices
 */
const TenderMobileCard = ({ tender, onSelect }) => {
  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-4 active:bg-gray-50"
      onClick={() => onSelect(tender)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate">
            {tender.title}
          </h3>
          <p className="text-sm text-gray-600">{tender.referenceNo}</p>
        </div>
        <StatusBadge status={tender.status} size="sm" />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center text-gray-600">
          <Building className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">{tender.authority}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{formatDate(tender.deadline)}</span>
          <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
            {getDaysRemaining(tender.deadline)} days left
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-1">
          {tender.assignments?.slice(0, 2).map((assignment) => (
            <Avatar
              key={assignment.id}
              src={assignment.user.avatar}
              name={assignment.user.name}
              size="xs"
            />
          ))}
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
};
```

### 2. Navigation Components
```jsx
/**
 * Main Navigation - Top navigation bar
 */
const MainNavigation = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <img
              className="h-8 w-auto"
              src="/logo.png"
              alt="Tender247"
            />
            <span className="ml-3 text-xl font-bold text-gray-900">
              Tender247
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/tenders">Tenders</NavLink>
            <NavLink to="/companies">Companies</NavLink>
            <NavLink to="/documents">Documents</NavLink>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <NotificationButton />
            <UserDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};

/**
 * Sidebar Navigation - Left sidebar for secondary navigation
 */
const SidebarNavigation = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 md:hidden">
            <span className="text-lg font-semibold">Menu</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-2">
            <SidebarLink
              to="/dashboard"
              icon={Home}
              text="Dashboard"
            />
            <SidebarSection title="Tender Management">
              <SidebarLink
                to="/tenders"
                icon={FileText}
                text="All Tenders"
              />
              <SidebarLink
                to="/tenders/my"
                icon={User}
                text="My Tenders"
              />
              <SidebarLink
                to="/tenders/create"
                icon={Plus}
                text="Create Tender"
              />
            </SidebarSection>
            <SidebarSection title="Management">
              <SidebarLink
                to="/companies"
                icon={Building}
                text="Companies"
              />
              <SidebarLink
                to="/users"
                icon={Users}
                text="Team Management"
              />
              <SidebarLink
                to="/documents"
                icon={Folder}
                text="Document Center"
              />
            </SidebarSection>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <SidebarLink
              to="/settings"
              icon={Settings}
              text="Settings"
            />
          </div>
        </div>
      </div>
    </>
  );
};
```

This comprehensive UI/UX layout guide provides the development team with detailed templates and patterns for creating consistent, responsive interfaces across the entire application.