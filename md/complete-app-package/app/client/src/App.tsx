import React, { Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MainLayout } from "@/components/layout/main-layout";
import { UserProvider } from "./user-context";
import { PermissionsProvider } from "@/hooks/use-permissions";
import { Loader2 } from "lucide-react";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import SalesDashboard from "@/pages/sales-dashboard";
import FinanceDashboard from "@/pages/finance-dashboard";
import Tenders from "@/pages/tenders";
import MyTenders from "@/pages/my-tenders";
import InProcessTender from "@/pages/in-process";
import AssignedToTeam from "@/pages/assigned-team";
import AssignedTeamTenders from "@/pages/assigned-team-tenders";
import SubmittedTender from "@/pages/submitted";
import TenderDetails from "@/pages/tender-details";
import Competitors from "@/pages/competitors";
import TenderResults from "@/pages/tender-results";
import TenderResultsPage from "@/pages/tender-results";
import MisReports from "@/pages/mis-reports";
import Settings from "@/pages/settings";
import TenderChecklist from "@/pages/tender-checklist";
import PrepareChecklist from "@/pages/prepare-checklist";
import DocumentManagement from "@/pages/document-management";
import DocumentBriefCase from "@/pages/document-brief-case";
import TenderTask from "@/pages/tender-task";
import FinanceManagement from "@/pages/finance-management";
import FinanceMIS from "@/pages/finance-mis";
import TenderAddModify from "@/pages/tender-add-modify";
import AddModifyTender from "@/pages/add-modify-tender";
import Approvals from "@/pages/approvals";
import Tasks from "@/pages/tasks";
import Login from "@/pages/login";
import LandingPage from "@/pages/landing";
import ResetPassword from "@/pages/reset-password";
import Rejected from "@/pages/rejected";
import Unauthorized from "@/pages/unauthorized";
import { ProtectedRoute } from "@/components/protected-route";
// Finance Management Submenu Pages
import NewRequest from "@/pages/finance-management/new-request";
import ApproveRequest from "@/pages/finance-management/approve-request";
import DeniedRequest from "@/pages/finance-management/denied-request";
import CompleteRequest from "@/pages/finance-management/complete-request";
// OEM Management Pages
import DealersPage from "@/pages/oem-management/dealers";
import OEMPage from "@/pages/oem-management/oem";
import BidManagement from "@/pages/bid-management";
import GeneralSettings from "@/pages/general-settings";
import MenuManagement from "@/pages/menu-management";

// Regular router with protected routes wrapped in MainLayout
function ProtectedRouter() {
  return (
    <MainLayout>
      <Switch>
        {/* Dashboard routes */}
        <ProtectedRoute path="/app" module="salesDashboard" component={SalesDashboard} />
        <ProtectedRoute path="/sales-dashboard" module="salesDashboard" component={SalesDashboard} />
        <ProtectedRoute path="/finance-dashboard" module="financeDashboard" component={FinanceDashboard} />
        
        {/* Tender routes - Require tender module permission */}
        <ProtectedRoute path="/tenders" module="tender" component={Tenders} />
        <ProtectedRoute path="/my-tenders" module="tenderTask" component={MyTenders} />
        <ProtectedRoute path="/tenders/:id" module="tender" component={TenderDetails} />
        <ProtectedRoute path="/tender/add-modify" module="addNewTender" component={TenderAddModify} />
        <ProtectedRoute path="/add-modify-tender" module="tender" component={AddModifyTender} />
        <ProtectedRoute 
          path="/import-tender" 
          module="tender" 
          component={() => (
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            }>
              {React.createElement(React.lazy(() => import("@/pages/import-tender")))}
            </Suspense>
          )} 
        />
        
        {/* Tender Task routes - Require tenderTask module permission */}
        <ProtectedRoute path="/in-process" module="tenderTask" component={InProcessTender} />
        <ProtectedRoute path="/assigned-team" module="tenderTask" component={AssignedTeamTenders} />
        <ProtectedRoute path="/submitted" module="tenderTask" component={SubmittedTender} />
        <ProtectedRoute path="/dropped" module="tenderTask" component={() => (
          <Suspense fallback={
            <div className="w-full h-screen flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          }>
            {React.createElement(React.lazy(() => import("@/pages/dropped")))}
          </Suspense>
        )} />
        <ProtectedRoute path="/tender-task" module="tenderTask" component={TenderTask} />
        <ProtectedRoute path="/tender-checklist" module="tenderTask" component={TenderChecklist} />
        <ProtectedRoute path="/tender-checklist/:id" module="tenderTask" component={TenderChecklist} />
        <ProtectedRoute path="/prepare-checklist" module="tenderTask" component={PrepareChecklist} />
        <ProtectedRoute path="/tender-responses" module="tenderTask" component={TenderChecklist} />
        <ProtectedRoute path="/tender-approval" module="tenderTask" component={TenderChecklist} />
        
        {/* Competitor and Tender Results routes - Require specific module permissions */}
        <ProtectedRoute path="/competitors" module="analytics" component={Competitors} />
        <ProtectedRoute path="/tender-results" module="tenderResult" component={TenderResults} />
        
        {/* MIS routes - Require mis module permission */}
        <ProtectedRoute path="/mis-reports" module="mis" component={MisReports} />
        <ProtectedRoute path="/mis" module="mis" component={MisReports} />
        <ProtectedRoute path="/finance-mis" module="mis" component={FinanceMIS} />
        <ProtectedRoute path="/login-mis" module="mis" component={() => (
          <Suspense fallback={
            <div className="w-full h-screen flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          }>
            {React.createElement(React.lazy(() => import("@/pages/login-mis")))}
          </Suspense>
        )} />
        <ProtectedRoute path="/sales-mis" module="mis" component={() => (
          <Suspense fallback={
            <div className="w-full h-screen flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          }>
            {React.createElement(React.lazy(() => import("@/pages/sales-mis")))}
          </Suspense>
        )} />
        
        {/* Document Management routes - Require folders/briefCase module permission */}
        <ProtectedRoute path="/documents" module="folders" component={DocumentManagement} />
        <ProtectedRoute path="/document-brief-case" module="documentBriefCase" component={DocumentBriefCase} />
        <ProtectedRoute path="/checklist" module="checklist" component={() => (
          <Suspense fallback={
            <div className="w-full h-screen flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          }>
            {React.createElement(React.lazy(() => import("@/pages/checklist")))}
          </Suspense>
        )} />
        
        {/* Approvals routes - Require approvals module permission */}
        <ProtectedRoute path="/approvals" module="approvals" component={Approvals} />

        {/* Task routes - Require task module permission */}
        <ProtectedRoute path="/tasks" module="task" component={Tasks} />
        
        {/* Purchase Order routes - Require purchaseOrder module permission */}
        <ProtectedRoute path="/purchase-order" module="purchaseOrder" component={() => (
          <Suspense fallback={
            <div className="w-full h-screen flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          }>
            {React.createElement(React.lazy(() => import("@/pages/purchase-order")))}
          </Suspense>
        )} />
        
        {/* OEM Management routes - Require oemManagement module permission */}
        <ProtectedRoute path="/dealers" module="oemManagement" component={DealersPage} />
        <ProtectedRoute path="/oem" module="oemManagement" component={OEMPage} />
        
        {/* Bid Management routes - Require bidManagement module permission */}
        <ProtectedRoute path="/bid-management" module="bidManagement" component={BidManagement} />
        
        {/* Finance Management routes - Made universally accessible */}
        <ProtectedRoute path="/finance-management" component={FinanceManagement} />
        <ProtectedRoute path="/finance-management/new-request" component={NewRequest} />
        <ProtectedRoute path="/finance-management/approve-request" component={ApproveRequest} />
        <ProtectedRoute path="/finance-management/denied-request" component={DeniedRequest} />
        <ProtectedRoute path="/finance-management/complete-request" component={CompleteRequest} />
        
        {/* Settings route - We'll handle tab-specific permissions in the ProtectedRoute component */}
        <ProtectedRoute path="/settings" component={Settings} />
        <ProtectedRoute path="/department" module="department" component={Settings} />
        <ProtectedRoute path="/designation" module="designation" component={Settings} />
        <ProtectedRoute path="/role" module="role" component={Settings} />
        <ProtectedRoute path="/user-management" module="userMaster" component={Settings} />
        <ProtectedRoute path="/checklist-settings" module="checklist" component={Settings} />
        <ProtectedRoute path="/general-settings" module="admin" component={GeneralSettings} />
        <ProtectedRoute path="/menu-management" module="admin" component={MenuManagement} />
        
        {/* Profile routes */}
        <ProtectedRoute path="/profile" component={() => (
          <Suspense fallback={
            <div className="w-full h-screen flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          }>
            {React.createElement(React.lazy(() => import("@/pages/profile")))}
          </Suspense>
        )} />
        
        <ProtectedRoute path="/change-password" component={() => (
          <Suspense fallback={
            <div className="w-full h-screen flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          }>
            {React.createElement(React.lazy(() => import("@/pages/change-password")))}
          </Suspense>
        )} />
        
        {/* Other routes */}
        <ProtectedRoute path="/rejected" component={Rejected} />
        <Route path="/unauthorized" component={Unauthorized} />
        <Route path="/404" component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

// Router that handles both protected and public routes
function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={Login} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route>
        <ProtectedRouter />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <PermissionsProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </PermissionsProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
