import { pgTable, text, serial, integer, boolean, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  department: text("department"),
  designation: text("designation"),
  role: text("role").notNull().default("user"),
  avatar: text("avatar"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  status: text("status").default("Active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  phone: true,
  department: true,
  designation: true,
  role: true,
  avatar: true,
  address: true,
  city: true,
  state: true,
  status: true,
});

// Tender Schema
export const tenders = pgTable("tenders", {
  id: serial("id").primaryKey(),
  referenceNo: text("reference_no").notNull().unique(),
  title: text("title").notNull(),
  brief: text("brief").notNull(),
  authority: text("authority").notNull(),
  location: text("location"),
  deadline: timestamp("deadline").notNull(),
  emdAmount: numeric("emd_amount"),
  documentFee: numeric("document_fee"),
  estimatedValue: numeric("estimated_value"),
  bidValue: numeric("bid_value"),
  status: text("status").notNull().default("new"),
  submittedBy: text("submitted_by"),
  submittedDate: timestamp("submitted_date"),
  bidDocumentPath: text("bid_document_path"),
  atcDocumentPath: text("atc_document_path"),
  techSpecsDocumentPath: text("tech_specs_document_path"),
  parsedData: jsonb("parsed_data"), // Store extracted document data
  itemCategories: text("item_categories").array(), // Array of item categories from bid document
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertTenderSchema = createInsertSchema(tenders)
  .pick({
    referenceNo: true,
    title: true,
    brief: true,
    authority: true,
    location: true,
    deadline: true,
    emdAmount: true,
    documentFee: true,
    estimatedValue: true,
    bidValue: true,
    status: true,
    submittedBy: true,
    submittedDate: true,
    bidDocumentPath: true,
    atcDocumentPath: true,
    techSpecsDocumentPath: true,
  })
  .extend({
    // Create a reusable date validator function
    deadline: z.union([
      z.date(),
      z.string().transform((val, ctx) => {
        try {
          const date = new Date(val);
          // Check if date is valid (will be NaN if invalid)
          if (isNaN(date.getTime())) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Invalid date format for bid expiry. Please provide a valid date string.",
            });
            return z.NEVER;
          }
          return date;
        } catch (error) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid date format for bid expiry. Please provide a valid date string.",
          });
          return z.NEVER;
        }
      })
    ]),
    // Apply the same validation to submittedDate if it's provided
    submittedDate: z.union([
      z.date(),
      z.string().transform((val, ctx) => {
        try {
          const date = new Date(val);
          // Check if date is valid (will be NaN if invalid)
          if (isNaN(date.getTime())) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Invalid date format for submission date. Please provide a valid date string.",
            });
            return z.NEVER;
          }
          return date;
        } catch (error) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid date format for submission date. Please provide a valid date string.",
          });
          return z.NEVER;
        }
      }),
      z.null(),
      z.undefined(),
    ]),
  });

// Tender Assignment Schema
export const tenderAssignments = pgTable("tender_assignments", {
  id: serial("id").primaryKey(),
  tenderId: integer("tender_id").notNull(),
  userId: integer("user_id").notNull(),
  assignedBy: integer("assigned_by").notNull(),
  assignType: text("assign_type").notNull().default("individual"),
  comments: text("comments"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTenderAssignmentSchema = createInsertSchema(tenderAssignments).pick({
  tenderId: true,
  userId: true,
  assignedBy: true,
  assignType: true,
  comments: true,
});

// User Tenders (for interests and stars)
export const userTenders = pgTable("user_tenders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  tenderId: integer("tender_id").notNull(),
  isStarred: boolean("is_starred").default(false),
  isInterested: boolean("is_interested").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserTenderSchema = createInsertSchema(userTenders).pick({
  userId: true,
  tenderId: true,
  isStarred: true,
  isInterested: true,
});

// Reminders
export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  tenderId: integer("tender_id").notNull(),
  userId: integer("user_id").notNull(),
  createdBy: integer("created_by").notNull(), // Who created the reminder
  reminderDate: timestamp("reminder_date").notNull(),
  comments: text("comments"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReminderSchema = createInsertSchema(reminders)
  .pick({
    tenderId: true,
    userId: true,
    createdBy: true,
    reminderDate: true,
    comments: true,
    isActive: true,
  })
  .extend({
    // Validate reminderDate
    reminderDate: z.union([
      z.date(),
      z.string().transform((val, ctx) => {
        try {
          const date = new Date(val);
          // Check if date is valid (will be NaN if invalid)
          if (isNaN(date.getTime())) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Invalid date format for reminder date. Please provide a valid date string.",
            });
            return z.NEVER;
          }
          return date;
        } catch (error) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid date format for reminder date. Please provide a valid date string.",
          });
          return z.NEVER;
        }
      })
    ]),
  });

// Eligibility Criteria
export const eligibilityCriteria = pgTable("eligibility_criteria", {
  id: serial("id").primaryKey(),
  tenderId: integer("tender_id").notNull(),
  criteria: text("criteria").notNull(),
  category: text("category"),
  isAiGenerated: boolean("is_ai_generated").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertEligibilityCriteriaSchema = createInsertSchema(eligibilityCriteria).pick({
  tenderId: true,
  criteria: true,
  category: true,
  isAiGenerated: true,
});

// Tender Documents
export const tenderDocuments = pgTable("tender_documents", {
  id: serial("id").primaryKey(),
  tenderId: integer("tender_id").notNull(),
  name: text("name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type"),
  category: text("category"),
  isPublic: boolean("is_public").default(true),
  uploadedBy: integer("uploaded_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTenderDocumentSchema = createInsertSchema(tenderDocuments).pick({
  tenderId: true,
  name: true,
  fileUrl: true,
  fileType: true,
  category: true,
  isPublic: true,
  uploadedBy: true,
});

// Competitors
export const competitors = pgTable("competitors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  location: text("location"),
  representativeName: text("representative_name"),
  contact: text("contact"),
  state: text("state"),
  category: text("category"),
  participatedTenders: integer("participated_tenders").default(0),
  awardedTenders: integer("awarded_tenders").default(0),
  lostTenders: integer("lost_tenders").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCompetitorSchema = createInsertSchema(competitors).pick({
  name: true,
  location: true,
  representativeName: true,
  contact: true,
  state: true,
  category: true,
  participatedTenders: true,
  awardedTenders: true,
  lostTenders: true,
});

// Tender Results
export const tenderResults = pgTable("tender_results", {
  id: serial("id").primaryKey(),
  tenderId: integer("tender_id").notNull(),
  status: text("status").notNull(), // awarded, lost, pending
  winnerId: integer("winner_id"),
  bidAmount: numeric("bid_amount"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTenderResultSchema = createInsertSchema(tenderResults).pick({
  tenderId: true,
  status: true,
  winnerId: true,
  bidAmount: true,
  remarks: true,
});

// Bid Participants Schema
export const bidParticipants = pgTable("bid_participants", {
  id: serial("id").primaryKey(),
  tenderId: integer("tender_id").notNull(),
  participantName: text("participant_name").notNull(),
  bidderStatus: text("bidder_status").notNull(), // L1, L2, L3, etc.
  bidAmount: numeric("bid_amount", { precision: 18, scale: 2 }).notNull(),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBidParticipantSchema = createInsertSchema(bidParticipants).pick({
  tenderId: true,
  participantName: true,
  bidderStatus: true,
  bidAmount: true,
  remarks: true,
});

// AI Insights
export const aiInsights = pgTable("ai_insights", {
  id: serial("id").primaryKey(),
  tenderId: integer("tender_id"),
  category: text("category").notNull(),
  insightData: jsonb("insight_data").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAiInsightSchema = createInsertSchema(aiInsights).pick({
  tenderId: true,
  category: true,
  insightData: true,
});

// Activities
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  action: true,
  entityType: true,
  entityId: true,
  metadata: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Tender = typeof tenders.$inferSelect;
export type InsertTender = z.infer<typeof insertTenderSchema>;

export type TenderAssignment = typeof tenderAssignments.$inferSelect;
export type InsertTenderAssignment = z.infer<typeof insertTenderAssignmentSchema>;

export type UserTender = typeof userTenders.$inferSelect;
export type InsertUserTender = z.infer<typeof insertUserTenderSchema>;

export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;

export type EligibilityCriteria = typeof eligibilityCriteria.$inferSelect;
export type InsertEligibilityCriteria = z.infer<typeof insertEligibilityCriteriaSchema>;

export type TenderDocument = typeof tenderDocuments.$inferSelect;
export type InsertTenderDocument = z.infer<typeof insertTenderDocumentSchema>;

export type Competitor = typeof competitors.$inferSelect;
export type InsertCompetitor = z.infer<typeof insertCompetitorSchema>;

export type TenderResult = typeof tenderResults.$inferSelect;
export type InsertTenderResult = z.infer<typeof insertTenderResultSchema>;

export type BidParticipant = typeof bidParticipants.$inferSelect;
export type InsertBidParticipant = z.infer<typeof insertBidParticipantSchema>;

export type AiInsight = typeof aiInsights.$inferSelect;
export type InsertAiInsight = z.infer<typeof insertAiInsightSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// Notifications Schema
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // reminder, finance_request, assignment, etc.
  title: text("title").notNull(),
  message: text("message").notNull(),
  entityType: text("entity_type"), // tender, user, etc.
  entityId: integer("entity_id"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  type: true,
  title: true,
  message: true,
  entityType: true,
  entityId: true,
  isRead: true,
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Financial Approval Schema
export const financialApprovals = pgTable("financial_approvals", {
  id: serial("id").primaryKey(),
  tenderId: integer("tender_id").notNull(),
  requesterId: integer("requester_id").notNull(),
  financeUserId: integer("finance_user_id"),
  approvalType: text("approval_type").notNull(), // Multiple types can be combined with comma
  requestAmount: numeric("request_amount"),
  reminderDate: timestamp("reminder_date").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected, in_process
  responseDate: timestamp("response_date"),
  responseNotes: text("response_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertFinancialApprovalSchema = createInsertSchema(financialApprovals)
  .pick({
    tenderId: true,
    requesterId: true,
    financeUserId: true,
    approvalType: true,
    requestAmount: true,
    reminderDate: true,
    notes: true,
    status: true,
  });

export type FinancialApproval = typeof financialApprovals.$inferSelect;
export type InsertFinancialApproval = z.infer<typeof insertFinancialApprovalSchema>;

// Roles
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  status: text("status").notNull().default("Active"),
});

export const insertRoleSchema = createInsertSchema(roles).pick({
  name: true,
  createdBy: true,
  status: true,
});

// Role Permissions
export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").notNull(),
  permissions: jsonb("permissions").notNull(), // Store the entire permissions object as JSON
  updatedBy: text("updated_by").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).pick({
  roleId: true,
  permissions: true,
  updatedBy: true,
});

export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;

// Dashboard Widget Layout Schema
export const dashboardLayouts = pgTable("dashboard_layouts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  layoutConfig: jsonb("layout_config").notNull(), // Store widget positions, sizes, visibility
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertDashboardLayoutSchema = createInsertSchema(dashboardLayouts).pick({
  userId: true,
  layoutConfig: true,
});

export type DashboardLayout = typeof dashboardLayouts.$inferSelect;
export type InsertDashboardLayout = z.infer<typeof insertDashboardLayoutSchema>;

// Departments
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  status: text("status").notNull().default("Active"),
});

export const insertDepartmentSchema = createInsertSchema(departments).pick({
  name: true,
  description: true,
  createdBy: true,
  status: true,
});

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;

// Designations
export const designations = pgTable("designations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  departmentId: integer("department_id").notNull(),
  description: text("description"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  status: text("status").notNull().default("Active"),
});

export const insertDesignationSchema = createInsertSchema(designations).pick({
  name: true,
  departmentId: true,
  description: true,
  createdBy: true,
  status: true,
});

export type Designation = typeof designations.$inferSelect;
export type InsertDesignation = z.infer<typeof insertDesignationSchema>;

// Folders Schema with Subfolder Support
export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  parentId: integer("parent_id").references(() => folders.id, { onDelete: "cascade" }),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFolderSchema = createInsertSchema(folders).pick({
  name: true,
  parentId: true,
  createdBy: true,
});

export type Folder = typeof folders.$inferSelect;
export type InsertFolder = z.infer<typeof insertFolderSchema>;

// Files Schema
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  originalName: text("original_name").notNull(),
  filePath: text("file_path").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  folderId: integer("folder_id").references(() => folders.id, { onDelete: "cascade" }),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFileSchema = createInsertSchema(files).pick({
  name: true,
  originalName: true,
  filePath: true,
  fileType: true,
  fileSize: true,
  folderId: true,
  createdBy: true,
});

export type File = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;

// Checklists Schema
export const checklists = pgTable("checklists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertChecklistSchema = createInsertSchema(checklists).pick({
  name: true,
  createdBy: true,
});

export type Checklist = typeof checklists.$inferSelect;
export type InsertChecklist = z.infer<typeof insertChecklistSchema>;

// Checklist Documents Schema
export const checklistDocuments = pgTable("checklist_documents", {
  id: serial("id").primaryKey(),
  checklistId: integer("checklist_id").notNull(),
  documentName: text("document_name").notNull(),
  fileId: integer("file_id"), // Reference to files table for documents from brief case
  filePath: text("file_path"), // For newly uploaded files
  fileName: text("file_name"), // For newly uploaded files
  fileType: text("file_type"), // For newly uploaded files
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertChecklistDocumentSchema = createInsertSchema(checklistDocuments).pick({
  checklistId: true,
  documentName: true,
  fileId: true,
  filePath: true,
  fileName: true,
  fileType: true,
  createdBy: true,
});

export type ChecklistDocument = typeof checklistDocuments.$inferSelect;
export type InsertChecklistDocument = z.infer<typeof insertChecklistDocumentSchema>;

// Document Briefcase Schema
export const documentBriefcase = pgTable("document_briefcase", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  filePath: text("file_path").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDocumentBriefcaseSchema = createInsertSchema(documentBriefcase).pick({
  name: true,
  description: true,
  filePath: true,
  fileType: true,
  fileSize: true,
  createdBy: true,
});

export type DocumentBriefcase = typeof documentBriefcase.$inferSelect;
export type InsertDocumentBriefcase = z.infer<typeof insertDocumentBriefcaseSchema>;

// Kick Off Calls Schema
export const kickOffCalls = pgTable("kick_off_calls", {
  id: serial("id").primaryKey(),
  tenderId: integer("tender_id").notNull(),
  tenderBrief: text("tender_brief").notNull(),
  tenderAuthority: text("tender_authority").notNull(),
  tenderValue: text("tender_value").notNull(),
  meetingHost: text("meeting_host").notNull(),
  registeredUserId: integer("registered_user_id").notNull(),
  meetingSubject: text("meeting_subject").notNull(),
  meetingDateTime: timestamp("meeting_date_time").notNull(),
  meetingLink: text("meeting_link"),
  momUserId: integer("mom_user_id").notNull(),
  nonRegisteredEmails: text("non_registered_emails"),
  description: text("description").notNull(),
  documentPath: text("document_path"),
  participants: text("participants").array().default([]),
  emailIds: text("email_ids"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertKickOffCallSchema = createInsertSchema(kickOffCalls).pick({
  tenderId: true,
  tenderBrief: true,
  tenderAuthority: true,
  tenderValue: true,
  meetingHost: true,
  registeredUserId: true,
  meetingSubject: true,
  meetingDateTime: true,
  meetingLink: true,
  momUserId: true,
  nonRegisteredEmails: true,
  description: true,
  documentPath: true,
  participants: true,
  emailIds: true,
});

export type KickOffCall = typeof kickOffCalls.$inferSelect;
export type InsertKickOffCall = z.infer<typeof insertKickOffCallSchema>;

// Purchase Orders
export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  gemContractNo: text("gem_contract_no").notNull(),
  organizationName: text("organization_name").notNull(),
  productName: text("product_name").notNull(),
  brand: text("brand"),
  model: text("model"),
  orderedQuantity: numeric("ordered_quantity"),
  unitPrice: numeric("unit_price"),
  totalPrice: numeric("total_price"),
  startDate: timestamp("start_date"),
  epbgPercentage: numeric("epbg_percentage"),
  generatedDate: timestamp("generated_date"),
  status: text("status").default("Active"),
  filePath: text("file_path").notNull(),
  fileType: text("file_type").notNull(),
  uploadedBy: integer("uploaded_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders)
  .pick({
    gemContractNo: true,
    organizationName: true,
    productName: true,
    brand: true,
    model: true,
    orderedQuantity: true,
    unitPrice: true,
    totalPrice: true,
    startDate: true,
    epbgPercentage: true,
    generatedDate: true,
    status: true,
    filePath: true,
    fileType: true,
    uploadedBy: true,
  })
  .extend({
    // Convert date fields
    startDate: z.union([
      z.date(),
      z.string().transform((val, ctx) => {
        try {
          const date = new Date(val);
          if (isNaN(date.getTime())) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Invalid date format for start date.",
            });
            return z.NEVER;
          }
          return date;
        } catch (error) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid date format for start date.",
          });
          return z.NEVER;
        }
      }),
      z.null(),
      z.undefined(),
    ]),
    generatedDate: z.union([
      z.date(),
      z.string().transform((val, ctx) => {
        try {
          const date = new Date(val);
          if (isNaN(date.getTime())) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Invalid date format for generated date.",
            });
            return z.NEVER;
          }
          return date;
        } catch (error) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid date format for generated date.",
          });
          return z.NEVER;
        }
      }),
      z.null(),
      z.undefined(),
    ]),
  });

// Dealers
export const dealers = pgTable("dealers", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  personName: text("person_name").notNull(),
  contactNo: text("contact_no").notNull(),
  alternativeContactNo: text("alternative_contact_no"),
  emailId: text("email_id").notNull(),
  alternativeEmailId: text("alternative_email_id"),
  streetAddress: text("street_address").notNull(),
  state: text("state").notNull(),
  city: text("city").notNull(),
  status: text("status").default("Active"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDealerSchema = createInsertSchema(dealers).pick({
  companyName: true,
  personName: true,
  contactNo: true,
  alternativeContactNo: true,
  emailId: true,
  alternativeEmailId: true,
  streetAddress: true,
  state: true,
  city: true,
  status: true,
  createdBy: true,
});

// OEM Schema
export const oems = pgTable("oems", {
  id: serial("id").primaryKey(),
  tenderNo: text("tender_no").notNull(),
  departmentName: text("department_name").notNull(),
  dealerId: integer("dealer_id").notNull(),
  authorizationDate: timestamp("authorization_date").notNull(),
  reminderDate: timestamp("reminder_date").notNull(),
  followupDate: timestamp("followup_date").notNull(),
  followupRemarks: text("followup_remarks"),
  authorizationLetterBrief: text("authorization_letter_brief"),
  documentPath: text("document_path"),
  documentType: text("document_type"),
  status: text("status").default("Active"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOEMSchema = createInsertSchema(oems).pick({
  tenderNo: true,
  departmentName: true,
  dealerId: true,
  authorizationDate: true,
  reminderDate: true,
  followupDate: true,
  followupRemarks: true,
  authorizationLetterBrief: true,
  documentPath: true,
  documentType: true,
  status: true,
  createdBy: true,
});

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;

export type Dealer = typeof dealers.$inferSelect;
export type InsertDealer = z.infer<typeof insertDealerSchema>;

export type OEM = typeof oems.$inferSelect;
export type InsertOEM = z.infer<typeof insertOEMSchema>;

// Task Allocation Schema
export const taskAllocations = pgTable("task_allocations", {
  id: serial("id").primaryKey(),
  tenderId: integer("tender_id").notNull(),
  taskName: text("task_name").notNull(),
  assignedBy: integer("assigned_by").notNull(),
  assignedTo: integer("assigned_to").notNull(),
  taskDeadline: timestamp("task_deadline").notNull(),
  filePath: text("file_path"),
  remarks: text("remarks"),
  status: text("status").default("Pending"), // Pending, In Progress, Completed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertTaskAllocationSchema = createInsertSchema(taskAllocations).pick({
  tenderId: true,
  taskName: true,
  assignedBy: true,
  assignedTo: true,
  taskDeadline: true,
  filePath: true,
  remarks: true,
  status: true,
});

export type TaskAllocation = typeof taskAllocations.$inferSelect;
export type InsertTaskAllocation = z.infer<typeof insertTaskAllocationSchema>;

// Company Schema (for Bid Management)
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "Dealer" or "OEM"
  address: text("address").notNull(),
  email: text("email"),
  phone: text("phone"),
  gst_number: text("gst_number"),
  pan_number: text("pan_number"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  created_by: integer("created_by").notNull(), // User ID who created this company
});

export const insertCompanySchema = createInsertSchema(companies)
  .extend({
    name: z.string().min(1, "Company name is required"),
    type: z.enum(["Dealer", "OEM"], { 
      errorMap: () => ({ message: "Type must be either Dealer or OEM" })
    }),
    address: z.string().min(1, "Address is required"),
    email: z.string().email("Invalid email format").or(z.literal("")).optional(),
    phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits").or(z.literal("")).optional(),
    gst_number: z.string().regex(/^[0-9A-Z]{15}$/, "GST Number must be 15 alphanumeric characters").or(z.literal("")).optional(),
    pan_number: z.string().regex(/^[A-Z0-9]{10}$/, "PAN Number must be 10 alphanumeric characters").or(z.literal("")).optional(),
  });

export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

// Company Document Linking Schema (for Bid Management)
export const companyDocuments = pgTable("company_documents", {
  id: serial("id").primaryKey(),
  company_id: integer("company_id").notNull(), // References companies.id
  document_id: integer("document_id").notNull(), // References documents.id
  created_at: timestamp("created_at").notNull().defaultNow(),
  created_by: integer("created_by").notNull(), // User ID who created this link
});

export const insertCompanyDocumentSchema = createInsertSchema(companyDocuments);

export type CompanyDocument = typeof companyDocuments.$inferSelect;
export type InsertCompanyDocument = z.infer<typeof insertCompanyDocumentSchema>;

// Bid Participation Schema (for Bid Management)
export const bidParticipations = pgTable("bid_participations", {
  id: serial("id").primaryKey(),
  tender_id: integer("tender_id").notNull(), // References tenders.id
  bid_amount: numeric("bid_amount", { precision: 18, scale: 2 }).notNull(),
  notes: text("notes"),
  status: text("status").default("draft").notNull(), // draft, submitted, approved, rejected
  created_at: timestamp("created_at").notNull().defaultNow(),
  created_by: integer("created_by").notNull(), // User ID who created this participation
  updated_at: timestamp("updated_at"),
});

export const insertBidParticipationSchema = createInsertSchema(bidParticipations)
  .extend({
    bid_amount: z.number().positive("Bid amount must be positive"),
    status: z.enum(["draft", "submitted", "approved", "rejected"], {
      errorMap: () => ({ message: "Status must be one of: draft, submitted, approved, rejected" })
    }).default("draft"),
  });

export type BidParticipation = typeof bidParticipations.$inferSelect;
export type InsertBidParticipation = z.infer<typeof insertBidParticipationSchema>;

// Bid Participation Company Schema (for tracking which companies are part of a bid)
export const bidParticipationCompanies = pgTable("bid_participation_companies", {
  id: serial("id").primaryKey(),
  bid_participation_id: integer("bid_participation_id").notNull(), // References bid_participations.id
  company_id: integer("company_id").notNull(), // References companies.id
  role: text("role").default("participant").notNull(), // participant, lead, subcontractor, etc.
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const insertBidParticipationCompanySchema = createInsertSchema(bidParticipationCompanies)
  .extend({
    role: z.enum(["participant", "lead", "subcontractor"], {
      errorMap: () => ({ message: "Role must be one of: participant, lead, subcontractor" })
    }).default("participant"),
  });

export type BidParticipationCompany = typeof bidParticipationCompanies.$inferSelect;
export type InsertBidParticipationCompany = z.infer<typeof insertBidParticipationCompanySchema>;

// Tender Responses Schema (for both Generate Response and Upload Response functionality)
export const tenderResponses = pgTable("tender_responses", {
  id: serial("id").primaryKey(),
  tenderId: integer("tender_id").notNull(),
  checklistId: integer("checklist_id"), // Optional for uploaded responses
  responseName: text("response_name").notNull(),
  responseType: text("response_type").notNull(), // Technical Response, Financial Response, EMD, BOQ
  remarks: text("remarks"),
  includeIndex: boolean("include_index").default(false),
  indexStartFrom: integer("index_start_from").default(1),
  selectedDocuments: jsonb("selected_documents"), // Array of document orders (for generated responses)
  filePath: text("file_path"), // Path to generated/uploaded file
  fileSize: text("file_size"), // File size in MB
  isCompressed: boolean("is_compressed").default(false),
  compressedFilePath: text("compressed_file_path"), // Path to compressed file
  originalSizeKB: integer("original_size_kb"), // Original file size in KB
  compressedSizeKB: integer("compressed_size_kb"), // Compressed file size in KB
  compressionRatio: integer("compression_ratio"), // Compression ratio percentage
  compressionType: text("compression_type"), // Compression type: light, recommended, extreme
  signStampPath: text("sign_stamp_path"), // Path to sign and stamp file
  status: text("status").default("generated").notNull(), // generated, downloaded, archived, uploaded
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTenderResponseSchema = createInsertSchema(tenderResponses)
  .pick({
    tenderId: true,
    checklistId: true,
    responseName: true,
    responseType: true,
    remarks: true,
    includeIndex: true,
    indexStartFrom: true,
    selectedDocuments: true,
    filePath: true,
    fileSize: true,
    isCompressed: true,
    signStampPath: true,
    status: true,
    uploadedBy: true,
  })
  .extend({
    responseType: z.enum(["Technical", "Financial", "BOQ", "EMD"], {
      errorMap: () => ({ message: "Response type must be one of: Technical, Financial, BOQ, EMD" })
    }),
    responseName: z.string().min(1, "Response name is required"),
    remarks: z.string().min(1, "Remarks are required"),
    indexStartFrom: z.number().min(1, "Index start must be at least 1"),
  });

export type TenderResponse = typeof tenderResponses.$inferSelect;
export type InsertTenderResponse = z.infer<typeof insertTenderResponseSchema>;

// Financial Request Schema
export const financialRequests = pgTable("financial_requests", {
  id: serial("id").primaryKey(),
  tenderId: integer("tender_id").notNull(),
  tenderBrief: text("tender_brief").notNull(),
  tenderAuthority: text("tender_authority").notNull(),
  tenderValue: numeric("tender_value", { precision: 18, scale: 2 }),
  requirement: text("requirement").notNull(), // Document Fees, EMD, Registration Fees, etc.
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  deadline: timestamp("deadline").notNull(),
  requestTo: integer("request_to").notNull(), // User ID
  payment: text("payment").notNull(), // Offline, Online, Upload File
  paymentDescription: text("payment_description"),
  status: text("status").default("Pending").notNull(),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertFinancialRequestSchema = createInsertSchema(financialRequests)
  .extend({
    requirement: z.enum([
      "Document Fees",
      "EMD", 
      "Registration Fees",
      "Bank Guarantee",
      "Security Deposit",
      "Other Expense",
      "Processing Fees"
    ], {
      errorMap: () => ({ message: "Please select a valid requirement" })
    }),
    amount: z.number().positive("Amount must be positive"),
    payment: z.enum(["Offline", "Online", "Upload File"], {
      errorMap: () => ({ message: "Please select a valid payment method" })
    }),
    status: z.enum(["Pending", "Approved", "Rejected", "Completed"], {
      errorMap: () => ({ message: "Invalid status" })
    }).default("Pending"),
  });

export type FinancialRequest = typeof financialRequests.$inferSelect;
export type InsertFinancialRequest = z.infer<typeof insertFinancialRequestSchema>;

// Approval Requests Schema
export const approvalRequests = pgTable("approval_requests", {
  id: serial("id").primaryKey(),
  tenderId: integer("tender_id").notNull().references(() => tenders.id),
  tenderBrief: text("tender_brief").notNull(),
  tenderAuthority: text("tender_authority").notNull(),
  tenderValue: numeric("tender_value", { precision: 18, scale: 2 }),
  approvalFor: text("approval_for").notNull(), // Price, EMD, Registration, etc.
  deadline: timestamp("deadline").notNull(),
  approvalFrom: integer("approval_from").notNull().references(() => users.id), // User ID to approve from
  inLoop: integer("in_loop").references(() => users.id), // User ID to keep in loop
  uploadFile: text("upload_file"), // Path to uploaded file
  remarks: text("remarks"),
  status: text("status").default("Pending").notNull(), // Pending, Approved, Rejected
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertApprovalRequestSchema = createInsertSchema(approvalRequests)
  .pick({
    tenderId: true,
    tenderBrief: true,
    tenderAuthority: true,
    tenderValue: true,
    approvalFor: true,
    deadline: true,
    approvalFrom: true,
    inLoop: true,
    uploadFile: true,
    remarks: true,
    status: true,
    createdBy: true,
  })
  .extend({
    approvalFor: z.string().min(1, "Approval for is required"),
    deadline: z.date(),
    approvalFrom: z.number().positive("Please select an approver"),
    status: z.enum(["Pending", "Approved", "Rejected"]).default("Pending"),
  });

export type ApprovalRequest = typeof approvalRequests.$inferSelect;
export type InsertApprovalRequest = z.infer<typeof insertApprovalRequestSchema>;

// General Settings Schema - matching actual database structure
export const generalSettings = pgTable("general_settings", {
  id: serial("id").primaryKey(),
  colorTheme: text("color_theme").default("#7c3aed"),
  companyLogo: text("company_logo"),
  logoSize: text("logo_size").default("64px"), // Height with units
  companyName: text("company_name").default("Tender247"),
  website: text("website"),
  showServerDateTime: boolean("show_server_datetime").default(true),
  // Email Settings
  emailHost: text("email_host"),
  emailPort: integer("email_port").default(587),
  emailUser: text("email_user"),
  emailPassword: text("email_password"),
  emailSecure: boolean("email_secure").default(false),
  emailFrom: text("email_from"),
  emailFromName: text("email_from_name"),
  // PDF Settings
  pdfFont: text("pdf_font").default("Arial"),
  pdfHeaderContent: text("pdf_header_content"),
  pdfFooterContent: text("pdf_footer_content"),
  pdfIndexPage: boolean("pdf_index_page").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGeneralSettingsSchema = createInsertSchema(generalSettings).pick({
  colorTheme: true,
  companyLogo: true,
  logoSize: true,
  companyName: true,
  website: true,
  showServerDateTime: true,
  emailHost: true,
  emailPort: true,
  emailUser: true,
  emailPassword: true,
  emailSecure: true,
  emailFrom: true,
  emailFromName: true,
  pdfFont: true,
  pdfHeaderContent: true,
  pdfFooterContent: true,
  pdfIndexPage: true,
});

export type GeneralSettings = typeof generalSettings.$inferSelect;
export type InsertGeneralSettings = z.infer<typeof insertGeneralSettingsSchema>;

// Database Backups Schema - matching actual database structure
export const databaseBackups = pgTable("database_backups", {
  id: serial("id").primaryKey(),
  backupName: text("backup_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(), // Size in bytes
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDatabaseBackupSchema = createInsertSchema(databaseBackups).pick({
  backupName: true,
  filePath: true,
  fileSize: true,
  createdBy: true,
});

export type DatabaseBackup = typeof databaseBackups.$inferSelect;
export type InsertDatabaseBackup = z.infer<typeof insertDatabaseBackupSchema>;

// Configuration Schema - for storing key-value configuration data like menu structure
export const configurations = pgTable("configurations", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  createdBy: integer("created_by").notNull().references(() => users.id),
  updatedBy: integer("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertConfigurationSchema = createInsertSchema(configurations).pick({
  key: true,
  value: true,
  createdBy: true,
  updatedBy: true,
});

export type Configuration = typeof configurations.$inferSelect;
export type InsertConfiguration = z.infer<typeof insertConfigurationSchema>;

// Menu Management Schema
export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  path: text("path"), // URL path for the menu item
  icon: text("icon"), // Icon name (lucide-react icon)
  parentId: integer("parent_id"), // Self-reference for submenus
  order: integer("order").default(0), // Display order
  isActive: boolean("is_active").default(true),
  isSystemMenu: boolean("is_system_menu").default(false), // Cannot be deleted
  createdBy: integer("created_by").references(() => users.id),
  updatedBy: integer("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMenuItemSchema = createInsertSchema(menuItems).pick({
  title: true,
  path: true,
  icon: true,
  parentId: true,
  order: true,
  isActive: true,
  isSystemMenu: true,
  createdBy: true,
  updatedBy: true,
});

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;

// Reverse Auction (RA) Schema
export const reverseAuctions = pgTable("reverse_auctions", {
  id: serial("id").primaryKey(),
  tenderId: integer("tender_id").notNull().references(() => tenders.id),
  bidNo: text("bid_no").notNull(),
  raNo: text("ra_no").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  startAmount: numeric("start_amount", { precision: 18, scale: 2 }),
  endAmount: numeric("end_amount", { precision: 18, scale: 2 }),
  documentPath: text("document_path"), // Path to uploaded document
  status: text("status").default("Active").notNull(), // Active, Completed, Cancelled
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertReverseAuctionSchema = createInsertSchema(reverseAuctions)
  .pick({
    tenderId: true,
    bidNo: true,
    raNo: true,
    startDate: true,
    endDate: true,
    startAmount: true,
    endAmount: true,
    documentPath: true,
    status: true,
    createdBy: true,
  })
  .extend({
    bidNo: z.string().min(1, "Bid number is required"),
    raNo: z.string().min(1, "RA number is required"),
    startDate: z.date(),
    endDate: z.date(),
    status: z.enum(["Active", "Completed", "Cancelled"]).default("Active"),
  });

export type ReverseAuction = typeof reverseAuctions.$inferSelect;
export type InsertReverseAuction = z.infer<typeof insertReverseAuctionSchema>;
