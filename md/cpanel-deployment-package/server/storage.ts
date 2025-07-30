import {
  users, type User, type InsertUser,
  tenders, type Tender, type InsertTender,
  tenderAssignments, type TenderAssignment, type InsertTenderAssignment,
  userTenders, type UserTender, type InsertUserTender,
  reminders, type Reminder, type InsertReminder,
  eligibilityCriteria, type EligibilityCriteria, type InsertEligibilityCriteria,
  tenderDocuments, type TenderDocument, type InsertTenderDocument,
  competitors, type Competitor, type InsertCompetitor,
  tenderResults, type TenderResult, type InsertTenderResult,
  aiInsights, type AiInsight, type InsertAiInsight,
  activities, type Activity, type InsertActivity,
  notifications, type Notification, type InsertNotification,
  roles, type Role, type InsertRole,
  rolePermissions, type RolePermission, type InsertRolePermission,
  departments, type Department, type InsertDepartment,
  designations, type Designation, type InsertDesignation,
  folders, type Folder, type InsertFolder,
  files, type File, type InsertFile,
  documentBriefcase, type DocumentBriefcase, type InsertDocumentBriefcase,
  oems, type OEM, type InsertOEM,
  dealers, type Dealer, type InsertDealer,
  financialApprovals, type FinancialApproval, type InsertFinancialApproval,
  companies, type Company, type InsertCompany,
  companyDocuments, type CompanyDocument, type InsertCompanyDocument,
  bidParticipations, type BidParticipation, type InsertBidParticipation,
  bidParticipationCompanies, type BidParticipationCompany, type InsertBidParticipationCompany,
  kickOffCalls, type KickOffCall, type InsertKickOffCall,
  checklists, type Checklist, type InsertChecklist,
  checklistDocuments, type ChecklistDocument, type InsertChecklistDocument,
  tenderResponses, type TenderResponse, type InsertTenderResponse,
  dashboardLayouts, type DashboardLayout, type InsertDashboardLayout,
  reverseAuctions, type ReverseAuction, type InsertReverseAuction,
  bidParticipants, type BidParticipant, type InsertBidParticipant,
  approvalRequests, type ApprovalRequest, type InsertApprovalRequest
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsersByRole(role: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  
  // Tender methods
  getTenders(): Promise<Tender[]>;
  getTender(id: number): Promise<Tender | undefined>;
  getTenderByReference(referenceNo: string): Promise<Tender | undefined>;
  createTender(tender: InsertTender): Promise<Tender>;
  updateTender(id: number, tender: Partial<InsertTender>): Promise<Tender | undefined>;
  getTendersByStatus(status: string): Promise<(Tender & { assignedUser?: { id: number, name: string } })[]>;
  getStarredTenders(userId: number): Promise<(Tender & { assignedUser?: { id: number, name: string } })[]>;
  getInterestedTenders(userId: number): Promise<(Tender & { assignedUser?: { id: number, name: string } })[]>;
  
  // Tender Assignment methods
  getTenderAssignments(tenderId: number): Promise<TenderAssignment[]>;
  createTenderAssignment(assignment: InsertTenderAssignment): Promise<TenderAssignment>;
  deleteTenderAssignment(assignmentId: number): Promise<boolean>;
  deleteAssignment(assignmentId: number): Promise<boolean>;
  
  // User Tenders methods
  getUserTenders(userId: number): Promise<(UserTender & { tender: Tender })[]>;
  getUserTender(userId: number, tenderId: number): Promise<UserTender | undefined>;
  createUserTender(userTender: InsertUserTender): Promise<UserTender>;
  updateUserTender(id: number, userTender: Partial<InsertUserTender>): Promise<UserTender | undefined>;
  toggleTenderStar(userId: number, tenderId: number, isStarred: boolean): Promise<UserTender>;
  toggleTenderInterest(userId: number, tenderId: number, isInterested: boolean): Promise<UserTender>;
  
  // Reminders methods
  getReminders(userId: number): Promise<(Reminder & { tender: Tender })[]>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  getTodaysReminderActivities(): Promise<any[]>;
  
  // Eligibility Criteria methods
  getEligibilityCriteria(tenderId: number): Promise<EligibilityCriteria[]>;
  createEligibilityCriteria(criteria: InsertEligibilityCriteria): Promise<EligibilityCriteria>;
  
  // Tender Documents methods
  getTenderDocuments(tenderId: number): Promise<TenderDocument[]>;
  createTenderDocument(document: InsertTenderDocument): Promise<TenderDocument>;
  
  // Competitors methods
  getCompetitors(): Promise<Competitor[]>;
  getCompetitor(id: number): Promise<Competitor | undefined>;
  createCompetitor(competitor: InsertCompetitor): Promise<Competitor>;
  
  // Tender Results methods
  getTenderResults(tenderId: number): Promise<TenderResult | undefined>;
  createTenderResult(result: InsertTenderResult): Promise<TenderResult>;
  
  // Bid Participants methods
  getBidParticipants(tenderId: number): Promise<BidParticipant[]>;
  getBidParticipant(id: number): Promise<BidParticipant | undefined>;
  createBidParticipant(participant: InsertBidParticipant): Promise<BidParticipant>;
  updateBidParticipant(id: number, participant: Partial<InsertBidParticipant>): Promise<BidParticipant | undefined>;
  deleteBidParticipant(id: number): Promise<boolean>;
  
  // AI Insights methods
  getAiInsights(tenderId: number): Promise<AiInsight[]>;
  createAiInsight(insight: InsertAiInsight): Promise<AiInsight>;
  
  // Activities methods
  getActivities(userId?: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  getTodaysReminderActivities(): Promise<any[]>;
  getTodaysReminderActivitiesByUser(userId: number): Promise<any[]>;
  getTodaysFinancialActivities(userId: number): Promise<any[]>;
  getDateReminderActivities(targetDate: Date): Promise<any[]>;
  getDateReminderActivitiesByUser(userId: number, targetDate: Date): Promise<any[]>;
  getDateFinancialActivities(userId: number, targetDate: Date): Promise<any[]>;
  getActivityDates(userId: number, startDate: Date, endDate: Date): Promise<string[]>;
  getTodaysRegistrationActivities(): Promise<any[]>;
  
  // Notifications methods
  getNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<boolean>;
  
  // Role methods
  getRoles(): Promise<Role[]>;
  getRole(id: number): Promise<Role | undefined>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: number, role: Partial<InsertRole>): Promise<Role | undefined>;
  
  // Role Permissions methods
  getRolePermissions(roleId: number): Promise<RolePermission | undefined>;
  saveRolePermissions(permissions: InsertRolePermission): Promise<RolePermission>;
  
  // Department methods
  getDepartments(): Promise<Department[]>;
  getDepartment(id: number): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: number, department: Partial<InsertDepartment>): Promise<Department | undefined>;
  
  // Designation methods
  getDesignations(): Promise<Designation[]>;
  getDesignationsByDepartment(departmentId: number): Promise<Designation[]>;
  getDesignation(id: number): Promise<Designation | undefined>;
  createDesignation(designation: InsertDesignation): Promise<Designation>;
  updateDesignation(id: number, designation: Partial<InsertDesignation>): Promise<Designation | undefined>;
  
  // Folder methods with subfolder support
  getFolders(): Promise<Folder[]>;
  getFoldersHierarchy(): Promise<(Folder & { subfolders?: Folder[] })[]>;
  getRootFolders(): Promise<Folder[]>;
  getSubfolders(parentId: number): Promise<Folder[]>;
  getFolder(id: number): Promise<Folder | undefined>;
  createFolder(folder: InsertFolder): Promise<Folder>;
  updateFolder(id: number, folder: Partial<InsertFolder>): Promise<Folder | undefined>;
  deleteFolder(id: number): Promise<boolean>;
  
  // File methods
  getFiles(): Promise<File[]>;
  getFilesByFolder(folderId: number): Promise<File[]>;
  getFolderFiles(folderId: number): Promise<any[]>;
  getFile(id: number): Promise<File | undefined>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: number, file: Partial<InsertFile>): Promise<File | undefined>;
  deleteFile(id: number): Promise<boolean>;
  
  // Document Briefcase methods
  getDocumentBriefcases(): Promise<DocumentBriefcase[]>;
  getDocumentBriefcase(id: number): Promise<DocumentBriefcase | undefined>;
  createDocumentBriefcase(doc: InsertDocumentBriefcase): Promise<DocumentBriefcase>;
  updateDocumentBriefcase(id: number, doc: Partial<InsertDocumentBriefcase>): Promise<DocumentBriefcase | undefined>;
  deleteDocumentBriefcase(id: number): Promise<boolean>;
  
  // Dealer methods
  getDealers(): Promise<Dealer[]>;
  searchDealers(filters: Partial<{
    companyName: string;
    emailId: string;
    contactNo: string;
    state: string;
    city: string;
  }>): Promise<Dealer[]>;
  getDealer(id: number): Promise<Dealer | undefined>;
  createDealer(dealer: InsertDealer): Promise<Dealer>;
  updateDealer(id: number, dealer: Partial<InsertDealer>): Promise<Dealer | undefined>;
  
  // OEM methods
  getOEMs(filters?: {
    tenderNumber?: string;
    departmentName?: string;
    tenderStatus?: string;
    authorizationDateFrom?: Date;
    authorizationDateTo?: Date;
    followupDateFrom?: Date;
    followupDateTo?: Date;
  }): Promise<(OEM & { dealer?: Dealer })[]>;
  getOEM(id: number): Promise<(OEM & { dealer?: Dealer }) | undefined>;
  createOEM(oem: InsertOEM): Promise<OEM>;
  updateOEM(id: number, oem: Partial<InsertOEM>): Promise<OEM | undefined>;
  
  // Financial Approval methods
  getFinancialApprovals(filters?: {
    status?: string;
    tenderId?: number;
    requesterId?: number;
    financeUserId?: number;
    approvalType?: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<FinancialApproval[]>;
  getFinancialApproval(id: number): Promise<FinancialApproval | undefined>;
  getTenderFinancialApprovals(tenderId: number): Promise<FinancialApproval[]>;
  createFinancialApproval(approval: InsertFinancialApproval): Promise<FinancialApproval>;
  updateFinancialApproval(id: number, approval: Partial<InsertFinancialApproval>): Promise<FinancialApproval | undefined>;
  cancelFinancialApproval(id: number): Promise<FinancialApproval | undefined>;
  getFinancialApprovalsByUser(userId: number): Promise<FinancialApproval[]>;
  
  // Company methods (Bid Management)
  getCompanies(): Promise<Company[]>;
  getCompaniesByType(type: "Dealer" | "OEM"): Promise<Company[]>;
  getCompany(id: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: number): Promise<boolean>;
  
  // Company Document methods (Bid Management)
  getCompanyDocuments(companyId: number): Promise<(CompanyDocument & { document: TenderDocument })[]>;
  linkCompanyDocument(link: InsertCompanyDocument): Promise<CompanyDocument>;
  unlinkCompanyDocument(companyId: number, documentId: number): Promise<boolean>;
  
  // Bid Participation methods (Bid Management)
  getBidParticipations(filters?: { status?: string, tenderId?: number }): Promise<BidParticipation[]>;
  getBidParticipation(id: number): Promise<BidParticipation | undefined>;
  createBidParticipation(participation: InsertBidParticipation): Promise<BidParticipation>;
  updateBidParticipation(id: number, participation: Partial<InsertBidParticipation>): Promise<BidParticipation | undefined>;
  deleteBidParticipation(id: number): Promise<boolean>;
  
  // Bid Participation Company methods
  getBidParticipationCompanies(bidParticipationId: number): Promise<(BidParticipationCompany & { company: Company })[]>;
  linkCompanyToBidParticipation(link: InsertBidParticipationCompany): Promise<BidParticipationCompany>;
  unlinkCompanyFromBidParticipation(bidParticipationId: number, companyId: number): Promise<boolean>;
  
  // Kick Off Call methods
  getKickOffCallsByTender(tenderId: number): Promise<KickOffCall[]>;
  createKickOffCall(data: InsertKickOffCall): Promise<KickOffCall>;
  getKickOffCall(id: number): Promise<KickOffCall | undefined>;
  updateKickOffCall(id: number, data: Partial<InsertKickOffCall>): Promise<KickOffCall | undefined>;
  deleteKickOffCall(id: number): Promise<boolean>;
  
  // Checklist methods
  getChecklists(): Promise<Checklist[]>;
  getChecklist(id: number): Promise<Checklist | undefined>;
  createChecklist(data: InsertChecklist): Promise<Checklist>;
  updateChecklist(id: number, data: Partial<InsertChecklist>): Promise<Checklist | undefined>;
  deleteChecklist(id: number): Promise<boolean>;
  
  // Checklist Document methods
  getChecklistDocuments(checklistId: number): Promise<ChecklistDocument[]>;
  getChecklistDocumentById(documentId: number): Promise<ChecklistDocument | undefined>;
  createChecklistDocument(data: InsertChecklistDocument): Promise<ChecklistDocument>;
  deleteChecklistDocument(id: number): Promise<boolean>;
  
  // Tender Response methods
  getTenderResponses(tenderId: number): Promise<TenderResponse[]>;
  getTenderResponse(id: number): Promise<TenderResponse | undefined>;
  createTenderResponse(data: InsertTenderResponse): Promise<TenderResponse>;
  updateTenderResponse(id: number, data: Partial<InsertTenderResponse>): Promise<TenderResponse | undefined>;
  deleteTenderResponse(id: number): Promise<boolean>;
  
  // Dashboard Layout methods
  getDashboardLayout(userId: number): Promise<DashboardLayout | undefined>;
  createDashboardLayout(data: InsertDashboardLayout): Promise<DashboardLayout>;
  updateDashboardLayout(userId: number, layoutConfig: any): Promise<DashboardLayout | undefined>;

  // Tender Response methods
  createTenderResponse(responseData: any): Promise<any>;
  getTenderResponsesByTender(tenderId: number): Promise<any[]>;
  getAllTenderResponses(): Promise<any[]>;
  deleteTenderResponse(responseId: number): Promise<void>;
  
  // Approval Request methods
  getApprovalRequests(tenderId?: number): Promise<ApprovalRequest[]>;
  getApprovalRequest(id: number): Promise<ApprovalRequest | undefined>;
  createApprovalRequest(data: InsertApprovalRequest): Promise<ApprovalRequest>;
  updateApprovalRequest(id: number, data: Partial<InsertApprovalRequest>): Promise<ApprovalRequest | undefined>;
  deleteApprovalRequest(id: number): Promise<boolean>;

  // Reverse Auction methods
  getReverseAuctions(tenderId?: number): Promise<ReverseAuction[]>;
  getReverseAuction(id: number): Promise<ReverseAuction | undefined>;
  createReverseAuction(data: InsertReverseAuction): Promise<ReverseAuction>;
  updateReverseAuction(id: number, data: Partial<InsertReverseAuction>): Promise<ReverseAuction | undefined>;
  deleteReverseAuction(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tenders: Map<number, Tender>;
  private tenderAssignments: Map<number, TenderAssignment>;
  private userTenders: Map<number, UserTender>;
  private reminders: Map<number, Reminder>;
  private eligibilityCriteria: Map<number, EligibilityCriteria>;
  private tenderDocuments: Map<number, TenderDocument>;
  private competitors: Map<number, Competitor>;
  private tenderResults: Map<number, TenderResult>;
  private aiInsights: Map<number, AiInsight>;
  private activities: Map<number, Activity>;
  private roles: Map<number, Role>;
  private rolePermissions: Map<number, RolePermission>;
  private departments: Map<number, Department>;
  private designations: Map<number, Designation>;
  private oems: Map<number, OEM>;
  private dealers: Map<number, Dealer>;
  private financialApprovals: Map<number, FinancialApproval>;
  private companies: Map<number, Company>;
  private companyDocuments: Map<number, CompanyDocument>;
  private bidParticipations: Map<number, BidParticipation>;
  private bidParticipationCompanies: Map<number, BidParticipationCompany>;
  private bidParticipants: Map<number, BidParticipant>;
  
  private userCurrentId: number;
  private tenderCurrentId: number;
  private tenderAssignmentCurrentId: number;
  private userTenderCurrentId: number;
  private reminderCurrentId: number;
  private eligibilityCriteriaCurrentId: number;
  private tenderDocumentCurrentId: number;
  private competitorCurrentId: number;
  private tenderResultCurrentId: number;
  private aiInsightCurrentId: number;
  private activityCurrentId: number;
  private roleCurrentId: number;
  private departmentCurrentId: number;
  private designationCurrentId: number;
  private oemCurrentId: number;
  private dealerCurrentId: number;
  private financialApprovalCurrentId: number;
  private companyCurrentId: number;
  private companyDocumentCurrentId: number;
  private bidParticipationCurrentId: number;
  private bidParticipationCompanyCurrentId: number;
  private bidParticipantCurrentId: number;

  constructor() {
    this.users = new Map();
    this.tenders = new Map();
    this.tenderAssignments = new Map();
    this.userTenders = new Map();
    this.reminders = new Map();
    this.eligibilityCriteria = new Map();
    this.tenderDocuments = new Map();
    this.competitors = new Map();
    this.tenderResults = new Map();
    this.aiInsights = new Map();
    this.activities = new Map();
    this.roles = new Map();
    this.rolePermissions = new Map();
    this.departments = new Map();
    this.designations = new Map();
    this.oems = new Map();
    this.dealers = new Map();
    this.financialApprovals = new Map();
    this.companies = new Map();
    this.companyDocuments = new Map();
    this.bidParticipations = new Map();
    this.bidParticipationCompanies = new Map();
    this.bidParticipants = new Map();
    
    this.userCurrentId = 1;
    this.tenderCurrentId = 1;
    this.tenderAssignmentCurrentId = 1;
    this.userTenderCurrentId = 1;
    this.reminderCurrentId = 1;
    this.eligibilityCriteriaCurrentId = 1;
    this.tenderDocumentCurrentId = 1;
    this.competitorCurrentId = 1;
    this.tenderResultCurrentId = 1;
    this.aiInsightCurrentId = 1;
    this.activityCurrentId = 1;
    this.roleCurrentId = 1;
    this.departmentCurrentId = 1;
    this.designationCurrentId = 1;
    this.oemCurrentId = 1;
    this.dealerCurrentId = 1;
    this.financialApprovalCurrentId = 1;
    this.companyCurrentId = 1;
    this.companyDocumentCurrentId = 1;
    this.bidParticipationCurrentId = 1;
    this.bidParticipationCompanyCurrentId = 1;
    this.bidParticipantCurrentId = 1;
    
    // Initialize with some sample data
    this.initializeData();
  }

  private initializeData() {
    // Create admin user first
    const admin = this.createUser({
      username: "admin",
      password: "admin123",
      name: "Admin User",
      email: "admin@startender.com",
      role: "admin",
      avatar: "",
    });
    
    // Create departments
    const engineeringDept = this.createDepartment({
      name: "Engineering",
      description: "Engineering department handling technical aspects of tenders",
      createdBy: admin.id,
      status: "Active"
    });
    
    const financeDept = this.createDepartment({
      name: "Finance",
      description: "Finance department handling financial aspects of tenders",
      createdBy: admin.id,
      status: "Active"
    });
    
    const salesDept = this.createDepartment({
      name: "Sales",
      description: "Sales department handling client relationships",
      createdBy: admin.id,
      status: "Active"
    });
    
    const hrDept = this.createDepartment({
      name: "Human Resources",
      description: "Human Resources department",
      createdBy: admin.id,
      status: "Active"
    });
    
    // Create designations
    this.createDesignation({
      name: "Engineering Manager",
      departmentId: engineeringDept.id,
      description: "Engineering Manager",
      createdBy: admin.id,
      status: "Active"
    });
    
    this.createDesignation({
      name: "Technical Engineer",
      departmentId: engineeringDept.id,
      description: "Technical Engineer",
      createdBy: admin.id,
      status: "Active"
    });
    
    this.createDesignation({
      name: "Finance Manager",
      departmentId: financeDept.id,
      description: "Finance Manager",
      createdBy: admin.id,
      status: "Active"
    });
    
    this.createDesignation({
      name: "Finance Accountant",
      departmentId: financeDept.id,
      description: "Finance Accountant",
      createdBy: admin.id,
      status: "Active"
    });
    
    this.createDesignation({
      name: "Sales Manager",
      departmentId: salesDept.id,
      description: "Sales Manager",
      createdBy: admin.id,
      status: "Active"
    });
    
    this.createDesignation({
      name: "Sales Executive",
      departmentId: salesDept.id,
      description: "Sales Executive",
      createdBy: admin.id,
      status: "Active"
    });
    
    this.createDesignation({
      name: "HR Manager",
      departmentId: hrDept.id,
      description: "Human Resources Manager",
      createdBy: admin.id,
      status: "Active"
    });
    
    this.createDesignation({
      name: "HR Executive",
      departmentId: hrDept.id,
      description: "Human Resources Executive",
      createdBy: admin.id,
      status: "Active"
    });
    
    // Create some sample tenders
    this.createTender({
      referenceNo: "IOCL/REF/KR2/2023",
      title: "Supply of combustible material for refinery units",
      brief: "Supply of combustible material for refinery units - oil analyzer units[5] - analyzer on sensor fuze[2] - no analyzer umezono[32] - quartz[2] - in-series analyzer[3] - no carbon-carbon[5] - thermocouple element at high temperature for boilers and surface production.",
      authority: "Indian Oil Corporation Limited",
      location: "Bangalore, Karnataka",
      deadline: new Date("2023-06-21T15:00:00"),
      emdAmount: 50000,
      documentFee: 2000,
      estimatedValue: 5000000,
      status: "in-process",
    });
    
    this.createTender({
      referenceNo: "BHEL/2023/TN/456",
      title: "Tender for Supply of Electrical Components",
      brief: "Supply of high-quality electrical components for power plant maintenance and operation",
      authority: "Bharat Heavy Electricals Limited",
      location: "Chennai, Tamil Nadu",
      deadline: new Date("2023-06-25T17:00:00"),
      emdAmount: 75000,
      documentFee: 3000,
      estimatedValue: 7500000,
      status: "in-process",
    });
    
    this.createTender({
      referenceNo: "SWR/HBL/2023/123",
      title: "Provision of all construction material needed for sewer cleaning",
      brief: "Provision of all construction materials required for comprehensive sewer cleaning across municipal areas",
      authority: "South Western Railway",
      location: "Hubli, Karnataka",
      deadline: new Date("2023-07-02T17:00:00"),
      emdAmount: 45000,
      documentFee: 1500,
      estimatedValue: 4585000,
      status: "new",
    });
    
    this.createTender({
      referenceNo: "NMDC/JGP/2023/789",
      title: "Construction material supplies for railway quarters",
      brief: "Supply of construction materials for the development and maintenance of railway staff quarters",
      authority: "National Mineral Development Corporation Limited",
      location: "Jagdalpur, Chhattisgarh",
      deadline: new Date("2023-06-30T15:00:00"),
      emdAmount: 60000,
      documentFee: 2500,
      estimatedValue: 6333000,
      status: "in-process",
    });

    // Add some competitors
    this.createCompetitor({
      name: "Ncc Limited",
      state: "Karnataka",
      category: "Construction",
      participatedTenders: 145,
      awardedTenders: 58,
      lostTenders: 87
    });

    this.createCompetitor({
      name: "Rcc Developers Limited",
      state: "Maharashtra",
      category: "Construction",
      participatedTenders: 98,
      awardedTenders: 35,
      lostTenders: 63
    });

    this.createCompetitor({
      name: "M/S Globe Civil Projects Private Limited",
      state: "Tamil Nadu",
      category: "Civil Works",
      participatedTenders: 127,
      awardedTenders: 42,
      lostTenders: 85
    });

    this.createCompetitor({
      name: "Larsen And Toubro Limited",
      state: "Maharashtra",
      category: "Construction & Engineering",
      participatedTenders: 210,
      awardedTenders: 89,
      lostTenders: 121
    });

    // Add eligibility criteria for a tender
    this.createEligibilityCriteria({
      tenderId: 1,
      criteria: "Preference shall be given to Class-I Local Supplier as Defined in Public Procurement (Preference to Make in India), Order 2017 as Amended From Time to Time And Its Subsequent Orders/Notifications Issued by Concerned Nodal Ministry for Specific Goods/Products.",
      category: "Preference",
      isAiGenerated: true
    });

    this.createEligibilityCriteria({
      tenderId: 1,
      criteria: "Bidder Through Udyam Registration Portal as Defined in Public Procurement Policy for Micro and Small Enterprises (MSEs) Order, 2012 Dated 23.03.2012 Issued by Ministry of Micro, Small and Medium Enterprises and Any Subsequent Order Issued by The Central Government.",
      category: "MSE/Startup",
      isAiGenerated: true
    });

    this.createEligibilityCriteria({
      tenderId: 1,
      criteria: "Minimum 50% As 83.25% Local Content Required For Qualifying As Class-I And More Than 20% But Less Than 50% For Qualifying As Class-II Local Supplier In Conformity With The Provisions.",
      category: "Local Content",
      isAiGenerated: true
    });

    this.createEligibilityCriteria({
      tenderId: 1,
      criteria: "Manufacturers are Allowed (OEM). Suppliers dealing with Original Equipment Manufacturer. Dealers having Dealership from Original Equipment Manufacturer. OEMs are Also Eligible But Not Specific To Particular. However, Display Micro And Small Scale Industries Are Not Eligible To Participate.",
      category: "Bidder Type",
      isAiGenerated: true
    });

    // Create AI Insights
    this.createAiInsight({
      tenderId: null,
      category: "industry_insights",
      insightData: {
        waterTreatmentLiveTenders: 1180,
        waterTreatmentPastResults: 13750,
        maximumWins: [
          "M/S Satin Enterprise",
          "Mondal Construction",
          "Sakdaha Youth And Cultural Forum",
          "Mesa Paddarga Construction",
          "Tarasani Hardware And Contractor"
        ],
        probableParticipants: [
          "Ncc Limited",
          "Rcc Developers Limited",
          "M/S Globe Civil Projects Private Limited",
          "Renashus Projects Private Limited",
          "Larsen And Toubro Limited"
        ]
      }
    });

    // Add activities
    this.createActivity({
      userId: 1,
      action: "assign",
      entityType: "tender",
      entityId: 1,
      metadata: {
        assignedTo: "your team",
        tenderNumber: "1648"
      }
    });

    this.createActivity({
      userId: 1,
      action: "approve",
      entityType: "emd",
      entityId: 2,
      metadata: {
        tenderNumber: "1532"
      }
    });

    this.createActivity({
      userId: 1,
      action: "add",
      entityType: "tender",
      entityId: 3,
      metadata: {
        tenderNumber: "1650",
        action: "added to interests"
      }
    });

    this.createActivity({
      userId: 1,
      action: "reminder",
      entityType: "tender",
      entityId: 1,
      metadata: {
        tenderNumber: "1447"
      }
    });

    this.createActivity({
      userId: 1,
      action: "reject",
      entityType: "tender",
      entityId: 4,
      metadata: {
        tenderNumber: "1440"
      }
    });
  }

  // User methods
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const timestamp = new Date();
    const user: User = { ...insertUser, id, createdAt: timestamp };
    this.users.set(id, user);
    return user;
  }

  // Tender methods
  async getTenders(): Promise<Tender[]> {
    return Array.from(this.tenders.values());
  }

  async getTender(id: number): Promise<Tender | undefined> {
    return this.tenders.get(id);
  }

  async getTenderByReference(referenceNo: string): Promise<Tender | undefined> {
    return Array.from(this.tenders.values()).find(
      (tender) => tender.referenceNo === referenceNo,
    );
  }

  async createTender(insertTender: InsertTender): Promise<Tender> {
    const id = this.tenderCurrentId++;
    const timestamp = new Date();
    const tender: Tender = { 
      ...insertTender, 
      id, 
      createdAt: timestamp, 
      updatedAt: timestamp 
    };
    this.tenders.set(id, tender);
    return tender;
  }

  async updateTender(id: number, updateTender: Partial<InsertTender>): Promise<Tender | undefined> {
    const tender = this.tenders.get(id);
    if (!tender) return undefined;

    const updatedTender: Tender = { 
      ...tender, 
      ...updateTender, 
      updatedAt: new Date() 
    };
    this.tenders.set(id, updatedTender);
    return updatedTender;
  }

  // Tender Assignment methods
  async getTenderAssignments(tenderId: number): Promise<TenderAssignment[]> {
    return Array.from(this.tenderAssignments.values()).filter(
      (assignment) => assignment.tenderId === tenderId,
    );
  }

  async createTenderAssignment(insertAssignment: InsertTenderAssignment): Promise<TenderAssignment> {
    const id = this.tenderAssignmentCurrentId++;
    const timestamp = new Date();
    const assignment: TenderAssignment = { 
      ...insertAssignment, 
      id, 
      createdAt: timestamp 
    };
    this.tenderAssignments.set(id, assignment);
    return assignment;
  }

  async deleteAssignment(assignmentId: number): Promise<boolean> {
    return this.tenderAssignments.delete(assignmentId);
  }

  async deleteTenderAssignment(assignmentId: number): Promise<boolean> {
    return this.tenderAssignments.delete(assignmentId);
  }

  // User Tenders methods
  async getUserTenders(userId: number): Promise<(UserTender & { tender: Tender })[]> {
    const userTenderEntries = Array.from(this.userTenders.values()).filter(
      (userTender) => userTender.userId === userId,
    );

    return userTenderEntries.map(userTender => {
      const tender = this.tenders.get(userTender.tenderId);
      return { 
        ...userTender, 
        tender: tender!
      };
    });
  }

  async getUserTender(userId: number, tenderId: number): Promise<UserTender | undefined> {
    return Array.from(this.userTenders.values()).find(
      (userTender) => userTender.userId === userId && userTender.tenderId === tenderId,
    );
  }

  async createUserTender(insertUserTender: InsertUserTender): Promise<UserTender> {
    const id = this.userTenderCurrentId++;
    const timestamp = new Date();
    const userTender: UserTender = { 
      ...insertUserTender, 
      id, 
      createdAt: timestamp 
    };
    this.userTenders.set(id, userTender);
    return userTender;
  }

  async updateUserTender(id: number, updateUserTender: Partial<InsertUserTender>): Promise<UserTender | undefined> {
    const userTender = this.userTenders.get(id);
    if (!userTender) return undefined;

    const updatedUserTender: UserTender = { 
      ...userTender, 
      ...updateUserTender 
    };
    this.userTenders.set(id, updatedUserTender);
    return updatedUserTender;
  }

  async toggleTenderStar(userId: number, tenderId: number, isStarred: boolean): Promise<UserTender> {
    // Check if entry exists
    const existingEntry = Array.from(this.userTenders.values()).find(
      (entry) => entry.userId === userId && entry.tenderId === tenderId,
    );

    if (existingEntry) {
      const updatedEntry: UserTender = { 
        ...existingEntry, 
        isStarred 
      };
      this.userTenders.set(existingEntry.id, updatedEntry);
      return updatedEntry;
    } else {
      const id = this.userTenderCurrentId++;
      const timestamp = new Date();
      const newEntry: UserTender = {
        id,
        userId,
        tenderId,
        isStarred,
        isInterested: false,
        createdAt: timestamp
      };
      this.userTenders.set(id, newEntry);
      return newEntry;
    }
  }

  async toggleTenderInterest(userId: number, tenderId: number, isInterested: boolean): Promise<UserTender> {
    // Check if entry exists
    const existingEntry = Array.from(this.userTenders.values()).find(
      (entry) => entry.userId === userId && entry.tenderId === tenderId,
    );

    if (existingEntry) {
      const updatedEntry: UserTender = { 
        ...existingEntry, 
        isInterested 
      };
      this.userTenders.set(existingEntry.id, updatedEntry);
      return updatedEntry;
    } else {
      const id = this.userTenderCurrentId++;
      const timestamp = new Date();
      const newEntry: UserTender = {
        id,
        userId,
        tenderId,
        isStarred: false,
        isInterested,
        createdAt: timestamp
      };
      this.userTenders.set(id, newEntry);
      return newEntry;
    }
  }

  // Reminders methods
  async getReminders(userId: number): Promise<(Reminder & { tender: Tender })[]> {
    const reminderEntries = Array.from(this.reminders.values()).filter(
      (reminder) => reminder.userId === userId && reminder.isActive,
    );

    return reminderEntries.map(reminder => {
      const tender = this.tenders.get(reminder.tenderId);
      return { 
        ...reminder, 
        tender: tender!
      };
    });
  }

  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const id = this.reminderCurrentId++;
    const timestamp = new Date();
    const reminder: Reminder = { 
      ...insertReminder, 
      id, 
      createdAt: timestamp 
    };
    this.reminders.set(id, reminder);
    return reminder;
  }

  // Eligibility Criteria methods
  async getEligibilityCriteria(tenderId: number): Promise<EligibilityCriteria[]> {
    return Array.from(this.eligibilityCriteria.values()).filter(
      (criteria) => criteria.tenderId === tenderId,
    );
  }

  async createEligibilityCriteria(insertCriteria: InsertEligibilityCriteria): Promise<EligibilityCriteria> {
    const id = this.eligibilityCriteriaCurrentId++;
    const timestamp = new Date();
    const criteria: EligibilityCriteria = { 
      ...insertCriteria, 
      id, 
      createdAt: timestamp 
    };
    this.eligibilityCriteria.set(id, criteria);
    return criteria;
  }

  // Tender Documents methods
  async getTenderDocuments(tenderId: number): Promise<TenderDocument[]> {
    return Array.from(this.tenderDocuments.values()).filter(
      (document) => document.tenderId === tenderId,
    );
  }

  async createTenderDocument(insertDocument: InsertTenderDocument): Promise<TenderDocument> {
    const id = this.tenderDocumentCurrentId++;
    const timestamp = new Date();
    const document: TenderDocument = { 
      ...insertDocument, 
      id, 
      createdAt: timestamp 
    };
    this.tenderDocuments.set(id, document);
    return document;
  }

  // Competitors methods
  async getCompetitors(): Promise<Competitor[]> {
    return Array.from(this.competitors.values());
  }

  async getCompetitor(id: number): Promise<Competitor | undefined> {
    return this.competitors.get(id);
  }

  async createCompetitor(insertCompetitor: InsertCompetitor): Promise<Competitor> {
    const id = this.competitorCurrentId++;
    const timestamp = new Date();
    const competitor: Competitor = { 
      ...insertCompetitor, 
      id, 
      createdAt: timestamp 
    };
    this.competitors.set(id, competitor);
    return competitor;
  }

  // Tender Results methods
  async getTenderResults(tenderId: number): Promise<TenderResult | undefined> {
    return Array.from(this.tenderResults.values()).find(
      (result) => result.tenderId === tenderId,
    );
  }

  async createTenderResult(insertResult: InsertTenderResult): Promise<TenderResult> {
    const id = this.tenderResultCurrentId++;
    const timestamp = new Date();
    const result: TenderResult = { 
      ...insertResult, 
      id, 
      createdAt: timestamp 
    };
    this.tenderResults.set(id, result);
    return result;
  }

  // Bid Participants methods
  async getBidParticipants(tenderId: number): Promise<BidParticipant[]> {
    return Array.from(this.bidParticipants.values()).filter(
      (participant) => participant.tenderId === tenderId,
    );
  }

  async getBidParticipant(id: number): Promise<BidParticipant | undefined> {
    return this.bidParticipants.get(id);
  }

  async createBidParticipant(insertParticipant: InsertBidParticipant): Promise<BidParticipant> {
    const id = this.bidParticipantCurrentId++;
    const timestamp = new Date();
    const participant: BidParticipant = { 
      ...insertParticipant, 
      id, 
      createdAt: timestamp 
    };
    this.bidParticipants.set(id, participant);
    return participant;
  }

  async updateBidParticipant(id: number, updateData: Partial<InsertBidParticipant>): Promise<BidParticipant | undefined> {
    const participant = this.bidParticipants.get(id);
    if (!participant) return undefined;
    
    const updatedParticipant = { ...participant, ...updateData };
    this.bidParticipants.set(id, updatedParticipant);
    return updatedParticipant;
  }

  async deleteBidParticipant(id: number): Promise<boolean> {
    return this.bidParticipants.delete(id);
  }

  // AI Insights methods
  async getAiInsights(tenderId: number): Promise<AiInsight[]> {
    return Array.from(this.aiInsights.values()).filter(
      (insight) => insight.tenderId === tenderId || insight.tenderId === null,
    );
  }

  async createAiInsight(insertInsight: InsertAiInsight): Promise<AiInsight> {
    const id = this.aiInsightCurrentId++;
    const timestamp = new Date();
    const insight: AiInsight = { 
      ...insertInsight, 
      id, 
      createdAt: timestamp 
    };
    this.aiInsights.set(id, insight);
    return insight;
  }

  // Activities methods
  async getActivities(userId?: number, limit: number = 10): Promise<Activity[]> {
    let activities = Array.from(this.activities.values());
    
    if (userId) {
      activities = activities.filter((activity) => activity.userId === userId);
    }
    
    return activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityCurrentId++;
    const timestamp = new Date();
    const activity: Activity = { 
      ...insertActivity, 
      id, 
      createdAt: timestamp 
    };
    this.activities.set(id, activity);
    return activity;
  }
}

// Import the DatabaseStorage class
import { DatabaseStorage } from "./database-storage";

// Use the DatabaseStorage for persistence
export const storage = new DatabaseStorage();
