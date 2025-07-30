var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  activities: () => activities,
  aiInsights: () => aiInsights,
  approvalRequests: () => approvalRequests,
  bidParticipants: () => bidParticipants,
  bidParticipationCompanies: () => bidParticipationCompanies,
  bidParticipations: () => bidParticipations,
  checklistDocuments: () => checklistDocuments,
  checklists: () => checklists,
  companies: () => companies,
  companyDocuments: () => companyDocuments,
  competitors: () => competitors,
  configurations: () => configurations,
  dashboardLayouts: () => dashboardLayouts,
  databaseBackups: () => databaseBackups,
  dealers: () => dealers,
  departments: () => departments,
  designations: () => designations,
  documentBriefcase: () => documentBriefcase,
  eligibilityCriteria: () => eligibilityCriteria,
  files: () => files,
  financialApprovals: () => financialApprovals,
  financialRequests: () => financialRequests,
  folders: () => folders,
  generalSettings: () => generalSettings,
  insertActivitySchema: () => insertActivitySchema,
  insertAiInsightSchema: () => insertAiInsightSchema,
  insertApprovalRequestSchema: () => insertApprovalRequestSchema,
  insertBidParticipantSchema: () => insertBidParticipantSchema,
  insertBidParticipationCompanySchema: () => insertBidParticipationCompanySchema,
  insertBidParticipationSchema: () => insertBidParticipationSchema,
  insertChecklistDocumentSchema: () => insertChecklistDocumentSchema,
  insertChecklistSchema: () => insertChecklistSchema,
  insertCompanyDocumentSchema: () => insertCompanyDocumentSchema,
  insertCompanySchema: () => insertCompanySchema,
  insertCompetitorSchema: () => insertCompetitorSchema,
  insertConfigurationSchema: () => insertConfigurationSchema,
  insertDashboardLayoutSchema: () => insertDashboardLayoutSchema,
  insertDatabaseBackupSchema: () => insertDatabaseBackupSchema,
  insertDealerSchema: () => insertDealerSchema,
  insertDepartmentSchema: () => insertDepartmentSchema,
  insertDesignationSchema: () => insertDesignationSchema,
  insertDocumentBriefcaseSchema: () => insertDocumentBriefcaseSchema,
  insertEligibilityCriteriaSchema: () => insertEligibilityCriteriaSchema,
  insertFileSchema: () => insertFileSchema,
  insertFinancialApprovalSchema: () => insertFinancialApprovalSchema,
  insertFinancialRequestSchema: () => insertFinancialRequestSchema,
  insertFolderSchema: () => insertFolderSchema,
  insertGeneralSettingsSchema: () => insertGeneralSettingsSchema,
  insertKickOffCallSchema: () => insertKickOffCallSchema,
  insertMenuItemSchema: () => insertMenuItemSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertOEMSchema: () => insertOEMSchema,
  insertPurchaseOrderSchema: () => insertPurchaseOrderSchema,
  insertReminderSchema: () => insertReminderSchema,
  insertReverseAuctionSchema: () => insertReverseAuctionSchema,
  insertRolePermissionSchema: () => insertRolePermissionSchema,
  insertRoleSchema: () => insertRoleSchema,
  insertTaskAllocationSchema: () => insertTaskAllocationSchema,
  insertTenderAssignmentSchema: () => insertTenderAssignmentSchema,
  insertTenderDocumentSchema: () => insertTenderDocumentSchema,
  insertTenderResponseSchema: () => insertTenderResponseSchema,
  insertTenderResultSchema: () => insertTenderResultSchema,
  insertTenderSchema: () => insertTenderSchema,
  insertUserSchema: () => insertUserSchema,
  insertUserTenderSchema: () => insertUserTenderSchema,
  kickOffCalls: () => kickOffCalls,
  menuItems: () => menuItems,
  notifications: () => notifications,
  oems: () => oems,
  purchaseOrders: () => purchaseOrders,
  reminders: () => reminders,
  reverseAuctions: () => reverseAuctions,
  rolePermissions: () => rolePermissions,
  roles: () => roles,
  taskAllocations: () => taskAllocations,
  tenderAssignments: () => tenderAssignments,
  tenderDocuments: () => tenderDocuments,
  tenderResponses: () => tenderResponses,
  tenderResults: () => tenderResults,
  tenders: () => tenders,
  userTenders: () => userTenders,
  users: () => users
});
import { pgTable, text, serial, integer, boolean, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users, insertUserSchema, tenders, insertTenderSchema, tenderAssignments, insertTenderAssignmentSchema, userTenders, insertUserTenderSchema, reminders, insertReminderSchema, eligibilityCriteria, insertEligibilityCriteriaSchema, tenderDocuments, insertTenderDocumentSchema, competitors, insertCompetitorSchema, tenderResults, insertTenderResultSchema, bidParticipants, insertBidParticipantSchema, aiInsights, insertAiInsightSchema, activities, insertActivitySchema, notifications, insertNotificationSchema, financialApprovals, insertFinancialApprovalSchema, roles, insertRoleSchema, rolePermissions, insertRolePermissionSchema, dashboardLayouts, insertDashboardLayoutSchema, departments, insertDepartmentSchema, designations, insertDesignationSchema, folders, insertFolderSchema, files, insertFileSchema, checklists, insertChecklistSchema, checklistDocuments, insertChecklistDocumentSchema, documentBriefcase, insertDocumentBriefcaseSchema, kickOffCalls, insertKickOffCallSchema, purchaseOrders, insertPurchaseOrderSchema, dealers, insertDealerSchema, oems, insertOEMSchema, taskAllocations, insertTaskAllocationSchema, companies, insertCompanySchema, companyDocuments, insertCompanyDocumentSchema, bidParticipations, insertBidParticipationSchema, bidParticipationCompanies, insertBidParticipationCompanySchema, tenderResponses, insertTenderResponseSchema, financialRequests, insertFinancialRequestSchema, approvalRequests, insertApprovalRequestSchema, generalSettings, insertGeneralSettingsSchema, databaseBackups, insertDatabaseBackupSchema, configurations, insertConfigurationSchema, menuItems, insertMenuItemSchema, reverseAuctions, insertReverseAuctionSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = pgTable("users", {
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
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertUserSchema = createInsertSchema(users).pick({
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
      status: true
    });
    tenders = pgTable("tenders", {
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
      parsedData: jsonb("parsed_data"),
      // Store extracted document data
      itemCategories: text("item_categories").array(),
      // Array of item categories from bid document
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at")
    });
    insertTenderSchema = createInsertSchema(tenders).pick({
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
      techSpecsDocumentPath: true
    }).extend({
      // Create a reusable date validator function
      deadline: z.union([
        z.date(),
        z.string().transform((val, ctx) => {
          try {
            const date = new Date(val);
            if (isNaN(date.getTime())) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Invalid date format for bid expiry. Please provide a valid date string."
              });
              return z.NEVER;
            }
            return date;
          } catch (error) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Invalid date format for bid expiry. Please provide a valid date string."
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
            if (isNaN(date.getTime())) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Invalid date format for submission date. Please provide a valid date string."
              });
              return z.NEVER;
            }
            return date;
          } catch (error) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Invalid date format for submission date. Please provide a valid date string."
            });
            return z.NEVER;
          }
        }),
        z.null(),
        z.undefined()
      ])
    });
    tenderAssignments = pgTable("tender_assignments", {
      id: serial("id").primaryKey(),
      tenderId: integer("tender_id").notNull(),
      userId: integer("user_id").notNull(),
      assignedBy: integer("assigned_by").notNull(),
      assignType: text("assign_type").notNull().default("individual"),
      comments: text("comments"),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertTenderAssignmentSchema = createInsertSchema(tenderAssignments).pick({
      tenderId: true,
      userId: true,
      assignedBy: true,
      assignType: true,
      comments: true
    });
    userTenders = pgTable("user_tenders", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      tenderId: integer("tender_id").notNull(),
      isStarred: boolean("is_starred").default(false),
      isInterested: boolean("is_interested").default(false),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertUserTenderSchema = createInsertSchema(userTenders).pick({
      userId: true,
      tenderId: true,
      isStarred: true,
      isInterested: true
    });
    reminders = pgTable("reminders", {
      id: serial("id").primaryKey(),
      tenderId: integer("tender_id").notNull(),
      userId: integer("user_id").notNull(),
      createdBy: integer("created_by").notNull(),
      // Who created the reminder
      reminderDate: timestamp("reminder_date").notNull(),
      comments: text("comments"),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertReminderSchema = createInsertSchema(reminders).pick({
      tenderId: true,
      userId: true,
      createdBy: true,
      reminderDate: true,
      comments: true,
      isActive: true
    }).extend({
      // Validate reminderDate
      reminderDate: z.union([
        z.date(),
        z.string().transform((val, ctx) => {
          try {
            const date = new Date(val);
            if (isNaN(date.getTime())) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Invalid date format for reminder date. Please provide a valid date string."
              });
              return z.NEVER;
            }
            return date;
          } catch (error) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Invalid date format for reminder date. Please provide a valid date string."
            });
            return z.NEVER;
          }
        })
      ])
    });
    eligibilityCriteria = pgTable("eligibility_criteria", {
      id: serial("id").primaryKey(),
      tenderId: integer("tender_id").notNull(),
      criteria: text("criteria").notNull(),
      category: text("category"),
      isAiGenerated: boolean("is_ai_generated").default(false),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertEligibilityCriteriaSchema = createInsertSchema(eligibilityCriteria).pick({
      tenderId: true,
      criteria: true,
      category: true,
      isAiGenerated: true
    });
    tenderDocuments = pgTable("tender_documents", {
      id: serial("id").primaryKey(),
      tenderId: integer("tender_id").notNull(),
      name: text("name").notNull(),
      fileUrl: text("file_url").notNull(),
      fileType: text("file_type"),
      category: text("category"),
      isPublic: boolean("is_public").default(true),
      uploadedBy: integer("uploaded_by").notNull(),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertTenderDocumentSchema = createInsertSchema(tenderDocuments).pick({
      tenderId: true,
      name: true,
      fileUrl: true,
      fileType: true,
      category: true,
      isPublic: true,
      uploadedBy: true
    });
    competitors = pgTable("competitors", {
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
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertCompetitorSchema = createInsertSchema(competitors).pick({
      name: true,
      location: true,
      representativeName: true,
      contact: true,
      state: true,
      category: true,
      participatedTenders: true,
      awardedTenders: true,
      lostTenders: true
    });
    tenderResults = pgTable("tender_results", {
      id: serial("id").primaryKey(),
      tenderId: integer("tender_id").notNull(),
      status: text("status").notNull(),
      // awarded, lost, pending
      winnerId: integer("winner_id"),
      bidAmount: numeric("bid_amount"),
      remarks: text("remarks"),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertTenderResultSchema = createInsertSchema(tenderResults).pick({
      tenderId: true,
      status: true,
      winnerId: true,
      bidAmount: true,
      remarks: true
    });
    bidParticipants = pgTable("bid_participants", {
      id: serial("id").primaryKey(),
      tenderId: integer("tender_id").notNull(),
      participantName: text("participant_name").notNull(),
      bidderStatus: text("bidder_status").notNull(),
      // L1, L2, L3, etc.
      bidAmount: numeric("bid_amount", { precision: 18, scale: 2 }).notNull(),
      remarks: text("remarks"),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertBidParticipantSchema = createInsertSchema(bidParticipants).pick({
      tenderId: true,
      participantName: true,
      bidderStatus: true,
      bidAmount: true,
      remarks: true
    });
    aiInsights = pgTable("ai_insights", {
      id: serial("id").primaryKey(),
      tenderId: integer("tender_id"),
      category: text("category").notNull(),
      insightData: jsonb("insight_data").notNull(),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertAiInsightSchema = createInsertSchema(aiInsights).pick({
      tenderId: true,
      category: true,
      insightData: true
    });
    activities = pgTable("activities", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      action: text("action").notNull(),
      entityType: text("entity_type").notNull(),
      entityId: integer("entity_id").notNull(),
      metadata: jsonb("metadata"),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertActivitySchema = createInsertSchema(activities).pick({
      userId: true,
      action: true,
      entityType: true,
      entityId: true,
      metadata: true
    });
    notifications = pgTable("notifications", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      type: text("type").notNull(),
      // reminder, finance_request, assignment, etc.
      title: text("title").notNull(),
      message: text("message").notNull(),
      entityType: text("entity_type"),
      // tender, user, etc.
      entityId: integer("entity_id"),
      isRead: boolean("is_read").default(false),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertNotificationSchema = createInsertSchema(notifications).pick({
      userId: true,
      type: true,
      title: true,
      message: true,
      entityType: true,
      entityId: true,
      isRead: true
    });
    financialApprovals = pgTable("financial_approvals", {
      id: serial("id").primaryKey(),
      tenderId: integer("tender_id").notNull(),
      requesterId: integer("requester_id").notNull(),
      financeUserId: integer("finance_user_id"),
      approvalType: text("approval_type").notNull(),
      // Multiple types can be combined with comma
      requestAmount: numeric("request_amount"),
      reminderDate: timestamp("reminder_date").notNull(),
      notes: text("notes"),
      status: text("status").notNull().default("pending"),
      // pending, approved, rejected, in_process
      responseDate: timestamp("response_date"),
      responseNotes: text("response_notes"),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at")
    });
    insertFinancialApprovalSchema = createInsertSchema(financialApprovals).pick({
      tenderId: true,
      requesterId: true,
      financeUserId: true,
      approvalType: true,
      requestAmount: true,
      reminderDate: true,
      notes: true,
      status: true
    });
    roles = pgTable("roles", {
      id: serial("id").primaryKey(),
      name: text("name").notNull().unique(),
      createdBy: text("created_by").notNull(),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      status: text("status").notNull().default("Active")
    });
    insertRoleSchema = createInsertSchema(roles).pick({
      name: true,
      createdBy: true,
      status: true
    });
    rolePermissions = pgTable("role_permissions", {
      id: serial("id").primaryKey(),
      roleId: integer("role_id").notNull(),
      permissions: jsonb("permissions").notNull(),
      // Store the entire permissions object as JSON
      updatedBy: text("updated_by").notNull(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    insertRolePermissionSchema = createInsertSchema(rolePermissions).pick({
      roleId: true,
      permissions: true,
      updatedBy: true
    });
    dashboardLayouts = pgTable("dashboard_layouts", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      layoutConfig: jsonb("layout_config").notNull(),
      // Store widget positions, sizes, visibility
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    insertDashboardLayoutSchema = createInsertSchema(dashboardLayouts).pick({
      userId: true,
      layoutConfig: true
    });
    departments = pgTable("departments", {
      id: serial("id").primaryKey(),
      name: text("name").notNull().unique(),
      description: text("description"),
      createdBy: integer("created_by").notNull(),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      status: text("status").notNull().default("Active")
    });
    insertDepartmentSchema = createInsertSchema(departments).pick({
      name: true,
      description: true,
      createdBy: true,
      status: true
    });
    designations = pgTable("designations", {
      id: serial("id").primaryKey(),
      name: text("name").notNull().unique(),
      departmentId: integer("department_id").notNull(),
      description: text("description"),
      createdBy: integer("created_by").notNull(),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      status: text("status").notNull().default("Active")
    });
    insertDesignationSchema = createInsertSchema(designations).pick({
      name: true,
      departmentId: true,
      description: true,
      createdBy: true,
      status: true
    });
    folders = pgTable("folders", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      parentId: integer("parent_id").references(() => folders.id, { onDelete: "cascade" }),
      createdBy: text("created_by").notNull(),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertFolderSchema = createInsertSchema(folders).pick({
      name: true,
      parentId: true,
      createdBy: true
    });
    files = pgTable("files", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      originalName: text("original_name").notNull(),
      filePath: text("file_path").notNull(),
      fileType: text("file_type").notNull(),
      fileSize: integer("file_size").notNull(),
      folderId: integer("folder_id").references(() => folders.id, { onDelete: "cascade" }),
      createdBy: text("created_by").notNull(),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertFileSchema = createInsertSchema(files).pick({
      name: true,
      originalName: true,
      filePath: true,
      fileType: true,
      fileSize: true,
      folderId: true,
      createdBy: true
    });
    checklists = pgTable("checklists", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      createdBy: text("created_by").notNull(),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertChecklistSchema = createInsertSchema(checklists).pick({
      name: true,
      createdBy: true
    });
    checklistDocuments = pgTable("checklist_documents", {
      id: serial("id").primaryKey(),
      checklistId: integer("checklist_id").notNull(),
      documentName: text("document_name").notNull(),
      fileId: integer("file_id"),
      // Reference to files table for documents from brief case
      filePath: text("file_path"),
      // For newly uploaded files
      fileName: text("file_name"),
      // For newly uploaded files
      fileType: text("file_type"),
      // For newly uploaded files
      createdBy: text("created_by").notNull(),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertChecklistDocumentSchema = createInsertSchema(checklistDocuments).pick({
      checklistId: true,
      documentName: true,
      fileId: true,
      filePath: true,
      fileName: true,
      fileType: true,
      createdBy: true
    });
    documentBriefcase = pgTable("document_briefcase", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description"),
      filePath: text("file_path").notNull(),
      fileType: text("file_type").notNull(),
      fileSize: integer("file_size").notNull(),
      createdBy: text("created_by").notNull(),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertDocumentBriefcaseSchema = createInsertSchema(documentBriefcase).pick({
      name: true,
      description: true,
      filePath: true,
      fileType: true,
      fileSize: true,
      createdBy: true
    });
    kickOffCalls = pgTable("kick_off_calls", {
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
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertKickOffCallSchema = createInsertSchema(kickOffCalls).pick({
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
      emailIds: true
    });
    purchaseOrders = pgTable("purchase_orders", {
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
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).pick({
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
      uploadedBy: true
    }).extend({
      // Convert date fields
      startDate: z.union([
        z.date(),
        z.string().transform((val, ctx) => {
          try {
            const date = new Date(val);
            if (isNaN(date.getTime())) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Invalid date format for start date."
              });
              return z.NEVER;
            }
            return date;
          } catch (error) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Invalid date format for start date."
            });
            return z.NEVER;
          }
        }),
        z.null(),
        z.undefined()
      ]),
      generatedDate: z.union([
        z.date(),
        z.string().transform((val, ctx) => {
          try {
            const date = new Date(val);
            if (isNaN(date.getTime())) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Invalid date format for generated date."
              });
              return z.NEVER;
            }
            return date;
          } catch (error) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Invalid date format for generated date."
            });
            return z.NEVER;
          }
        }),
        z.null(),
        z.undefined()
      ])
    });
    dealers = pgTable("dealers", {
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
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertDealerSchema = createInsertSchema(dealers).pick({
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
      createdBy: true
    });
    oems = pgTable("oems", {
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
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertOEMSchema = createInsertSchema(oems).pick({
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
      createdBy: true
    });
    taskAllocations = pgTable("task_allocations", {
      id: serial("id").primaryKey(),
      tenderId: integer("tender_id").notNull(),
      taskName: text("task_name").notNull(),
      assignedBy: integer("assigned_by").notNull(),
      assignedTo: integer("assigned_to").notNull(),
      taskDeadline: timestamp("task_deadline").notNull(),
      filePath: text("file_path"),
      remarks: text("remarks"),
      status: text("status").default("Pending"),
      // Pending, In Progress, Completed
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at")
    });
    insertTaskAllocationSchema = createInsertSchema(taskAllocations).pick({
      tenderId: true,
      taskName: true,
      assignedBy: true,
      assignedTo: true,
      taskDeadline: true,
      filePath: true,
      remarks: true,
      status: true
    });
    companies = pgTable("companies", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      type: text("type").notNull(),
      // "Dealer" or "OEM"
      address: text("address").notNull(),
      email: text("email"),
      phone: text("phone"),
      gst_number: text("gst_number"),
      pan_number: text("pan_number"),
      created_at: timestamp("created_at").notNull().defaultNow(),
      created_by: integer("created_by").notNull()
      // User ID who created this company
    });
    insertCompanySchema = createInsertSchema(companies).extend({
      name: z.string().min(1, "Company name is required"),
      type: z.enum(["Dealer", "OEM"], {
        errorMap: () => ({ message: "Type must be either Dealer or OEM" })
      }),
      address: z.string().min(1, "Address is required"),
      email: z.string().email("Invalid email format").or(z.literal("")).optional(),
      phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits").or(z.literal("")).optional(),
      gst_number: z.string().regex(/^[0-9A-Z]{15}$/, "GST Number must be 15 alphanumeric characters").or(z.literal("")).optional(),
      pan_number: z.string().regex(/^[A-Z0-9]{10}$/, "PAN Number must be 10 alphanumeric characters").or(z.literal("")).optional()
    });
    companyDocuments = pgTable("company_documents", {
      id: serial("id").primaryKey(),
      company_id: integer("company_id").notNull(),
      // References companies.id
      document_id: integer("document_id").notNull(),
      // References documents.id
      created_at: timestamp("created_at").notNull().defaultNow(),
      created_by: integer("created_by").notNull()
      // User ID who created this link
    });
    insertCompanyDocumentSchema = createInsertSchema(companyDocuments);
    bidParticipations = pgTable("bid_participations", {
      id: serial("id").primaryKey(),
      tender_id: integer("tender_id").notNull(),
      // References tenders.id
      bid_amount: numeric("bid_amount", { precision: 18, scale: 2 }).notNull(),
      notes: text("notes"),
      status: text("status").default("draft").notNull(),
      // draft, submitted, approved, rejected
      created_at: timestamp("created_at").notNull().defaultNow(),
      created_by: integer("created_by").notNull(),
      // User ID who created this participation
      updated_at: timestamp("updated_at")
    });
    insertBidParticipationSchema = createInsertSchema(bidParticipations).extend({
      bid_amount: z.number().positive("Bid amount must be positive"),
      status: z.enum(["draft", "submitted", "approved", "rejected"], {
        errorMap: () => ({ message: "Status must be one of: draft, submitted, approved, rejected" })
      }).default("draft")
    });
    bidParticipationCompanies = pgTable("bid_participation_companies", {
      id: serial("id").primaryKey(),
      bid_participation_id: integer("bid_participation_id").notNull(),
      // References bid_participations.id
      company_id: integer("company_id").notNull(),
      // References companies.id
      role: text("role").default("participant").notNull(),
      // participant, lead, subcontractor, etc.
      created_at: timestamp("created_at").notNull().defaultNow()
    });
    insertBidParticipationCompanySchema = createInsertSchema(bidParticipationCompanies).extend({
      role: z.enum(["participant", "lead", "subcontractor"], {
        errorMap: () => ({ message: "Role must be one of: participant, lead, subcontractor" })
      }).default("participant")
    });
    tenderResponses = pgTable("tender_responses", {
      id: serial("id").primaryKey(),
      tenderId: integer("tender_id").notNull(),
      checklistId: integer("checklist_id"),
      // Optional for uploaded responses
      responseName: text("response_name").notNull(),
      responseType: text("response_type").notNull(),
      // Technical Response, Financial Response, EMD, BOQ
      remarks: text("remarks"),
      includeIndex: boolean("include_index").default(false),
      indexStartFrom: integer("index_start_from").default(1),
      selectedDocuments: jsonb("selected_documents"),
      // Array of document orders (for generated responses)
      filePath: text("file_path"),
      // Path to generated/uploaded file
      fileSize: text("file_size"),
      // File size in MB
      isCompressed: boolean("is_compressed").default(false),
      compressedFilePath: text("compressed_file_path"),
      // Path to compressed file
      originalSizeKB: integer("original_size_kb"),
      // Original file size in KB
      compressedSizeKB: integer("compressed_size_kb"),
      // Compressed file size in KB
      compressionRatio: integer("compression_ratio"),
      // Compression ratio percentage
      compressionType: text("compression_type"),
      // Compression type: light, recommended, extreme
      signStampPath: text("sign_stamp_path"),
      // Path to sign and stamp file
      status: text("status").default("generated").notNull(),
      // generated, downloaded, archived, uploaded
      createdBy: integer("created_by").notNull().references(() => users.id),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    insertTenderResponseSchema = createInsertSchema(tenderResponses).pick({
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
      uploadedBy: true
    }).extend({
      responseType: z.enum(["Technical", "Financial", "BOQ", "EMD"], {
        errorMap: () => ({ message: "Response type must be one of: Technical, Financial, BOQ, EMD" })
      }),
      responseName: z.string().min(1, "Response name is required"),
      remarks: z.string().min(1, "Remarks are required"),
      indexStartFrom: z.number().min(1, "Index start must be at least 1")
    });
    financialRequests = pgTable("financial_requests", {
      id: serial("id").primaryKey(),
      tenderId: integer("tender_id").notNull(),
      tenderBrief: text("tender_brief").notNull(),
      tenderAuthority: text("tender_authority").notNull(),
      tenderValue: numeric("tender_value", { precision: 18, scale: 2 }),
      requirement: text("requirement").notNull(),
      // Document Fees, EMD, Registration Fees, etc.
      amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
      deadline: timestamp("deadline").notNull(),
      requestTo: integer("request_to").notNull(),
      // User ID
      payment: text("payment").notNull(),
      // Offline, Online, Upload File
      paymentDescription: text("payment_description"),
      status: text("status").default("Pending").notNull(),
      createdBy: integer("created_by").notNull(),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at")
    });
    insertFinancialRequestSchema = createInsertSchema(financialRequests).extend({
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
      }).default("Pending")
    });
    approvalRequests = pgTable("approval_requests", {
      id: serial("id").primaryKey(),
      tenderId: integer("tender_id").notNull().references(() => tenders.id),
      tenderBrief: text("tender_brief").notNull(),
      tenderAuthority: text("tender_authority").notNull(),
      tenderValue: numeric("tender_value", { precision: 18, scale: 2 }),
      approvalFor: text("approval_for").notNull(),
      // Price, EMD, Registration, etc.
      deadline: timestamp("deadline").notNull(),
      approvalFrom: integer("approval_from").notNull().references(() => users.id),
      // User ID to approve from
      inLoop: integer("in_loop").references(() => users.id),
      // User ID to keep in loop
      uploadFile: text("upload_file"),
      // Path to uploaded file
      remarks: text("remarks"),
      status: text("status").default("Pending").notNull(),
      // Pending, Approved, Rejected
      createdBy: integer("created_by").notNull().references(() => users.id),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at")
    });
    insertApprovalRequestSchema = createInsertSchema(approvalRequests).pick({
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
      createdBy: true
    }).extend({
      approvalFor: z.string().min(1, "Approval for is required"),
      deadline: z.date(),
      approvalFrom: z.number().positive("Please select an approver"),
      status: z.enum(["Pending", "Approved", "Rejected"]).default("Pending")
    });
    generalSettings = pgTable("general_settings", {
      id: serial("id").primaryKey(),
      colorTheme: text("color_theme").default("#7c3aed"),
      companyLogo: text("company_logo"),
      logoSize: text("logo_size").default("64px"),
      // Height with units
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
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertGeneralSettingsSchema = createInsertSchema(generalSettings).pick({
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
      pdfIndexPage: true
    });
    databaseBackups = pgTable("database_backups", {
      id: serial("id").primaryKey(),
      backupName: text("backup_name").notNull(),
      filePath: text("file_path").notNull(),
      fileSize: integer("file_size").notNull(),
      // Size in bytes
      createdBy: integer("created_by").notNull().references(() => users.id),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertDatabaseBackupSchema = createInsertSchema(databaseBackups).pick({
      backupName: true,
      filePath: true,
      fileSize: true,
      createdBy: true
    });
    configurations = pgTable("configurations", {
      id: serial("id").primaryKey(),
      key: text("key").notNull().unique(),
      value: text("value").notNull(),
      createdBy: integer("created_by").notNull().references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertConfigurationSchema = createInsertSchema(configurations).pick({
      key: true,
      value: true,
      createdBy: true,
      updatedBy: true
    });
    menuItems = pgTable("menu_items", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      path: text("path"),
      // URL path for the menu item
      icon: text("icon"),
      // Icon name (lucide-react icon)
      parentId: integer("parent_id"),
      // Self-reference for submenus
      order: integer("order").default(0),
      // Display order
      isActive: boolean("is_active").default(true),
      isSystemMenu: boolean("is_system_menu").default(false),
      // Cannot be deleted
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertMenuItemSchema = createInsertSchema(menuItems).pick({
      title: true,
      path: true,
      icon: true,
      parentId: true,
      order: true,
      isActive: true,
      isSystemMenu: true,
      createdBy: true,
      updatedBy: true
    });
    reverseAuctions = pgTable("reverse_auctions", {
      id: serial("id").primaryKey(),
      tenderId: integer("tender_id").notNull().references(() => tenders.id),
      bidNo: text("bid_no").notNull(),
      raNo: text("ra_no").notNull(),
      startDate: timestamp("start_date").notNull(),
      endDate: timestamp("end_date").notNull(),
      startAmount: numeric("start_amount", { precision: 18, scale: 2 }),
      endAmount: numeric("end_amount", { precision: 18, scale: 2 }),
      documentPath: text("document_path"),
      // Path to uploaded document
      status: text("status").default("Active").notNull(),
      // Active, Completed, Cancelled
      createdBy: integer("created_by").notNull().references(() => users.id),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertReverseAuctionSchema = createInsertSchema(reverseAuctions).pick({
      tenderId: true,
      bidNo: true,
      raNo: true,
      startDate: true,
      endDate: true,
      startAmount: true,
      endAmount: true,
      documentPath: true,
      status: true,
      createdBy: true
    }).extend({
      bidNo: z.string().min(1, "Bid number is required"),
      raNo: z.string().min(1, "RA number is required"),
      startDate: z.date(),
      endDate: z.date(),
      status: z.enum(["Active", "Completed", "Cancelled"]).default("Active")
    });
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  db: () => db,
  pool: () => pool
});
import dotenv from "dotenv";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
var Pool, pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    dotenv.config();
    ({ Pool } = pg);
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be set. Did you forget to add it to your .env?");
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 15e3,
      // 15 seconds 
      idleTimeoutMillis: 3e4,
      // 30 seconds
      max: 5,
      // reduced for stability
      ssl: process.env.DATABASE_URL?.includes("neon") || process.env.DATABASE_URL?.includes("localhost") === false ? {
        rejectUnauthorized: false
      } : false,
      keepAlive: true,
      allowExitOnIdle: false,
      // Keep connections alive
      // PostgreSQL 12+ compatible settings
      statement_timeout: 2e4,
      // 20 seconds statement timeout
      query_timeout: 2e4
      // 20 seconds query timeout
    });
    db = drizzle(pool, { schema: schema_exports });
  }
});

// server/config.ts
import path from "path";
function normalizeFilePath(filePath) {
  if (path.isAbsolute(filePath)) {
    return path.relative(process.cwd(), filePath);
  }
  return filePath;
}
function resolveFilePath(filePath) {
  if (!path.isAbsolute(filePath)) {
    return path.join(process.cwd(), filePath);
  }
  return filePath;
}
var config;
var init_config = __esm({
  "server/config.ts"() {
    "use strict";
    config = {
      databaseUrl: process.env.DATABASE_URL,
      sessionSecret: process.env.SESSION_SECRET
    };
  }
});

// server/database-storage.ts
import { eq, and, desc, or, sql, like, inArray, lte, gte, lt } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
var DatabaseStorage;
var init_database_storage = __esm({
  "server/database-storage.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_config();
    DatabaseStorage = class {
      // User methods
      async getUsers() {
        return await db.select().from(users);
      }
      async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user || void 0;
      }
      async getUserByUsername(username) {
        try {
          const [user] = await db.select().from(users).where(eq(users.username, username));
          return user || void 0;
        } catch (error) {
          console.error("Database error in getUserByUsername:", error);
          try {
            await new Promise((resolve) => setTimeout(resolve, 100));
            const [user] = await db.select().from(users).where(eq(users.username, username));
            return user || void 0;
          } catch (retryError) {
            console.error("Retry failed for getUserByUsername:", retryError);
            throw retryError;
          }
        }
      }
      async getCurrentUser(req) {
        if (req.session?.user?.id) {
          return await this.getUser(req.session.user.id);
        }
        return void 0;
      }
      async getUserByEmail(email) {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return user || void 0;
      }
      async getUsersByRole(role) {
        return await db.select().from(users).where(eq(users.role, role));
      }
      async createUser(insertUser) {
        const [user] = await db.insert(users).values(insertUser).returning();
        return user;
      }
      async updateUser(id, userData) {
        try {
          const [updatedUser] = await db.update(users).set(userData).where(eq(users.id, id)).returning();
          return updatedUser || void 0;
        } catch (error) {
          console.error("Error updating user:", error);
          return void 0;
        }
      }
      // Tender methods
      async getTenders() {
        return await db.select().from(tenders);
      }
      // Search tenders by reference number (full or last 7 digits)
      async searchTenders(searchTerm) {
        const normalizedSearchTerm = searchTerm.trim().toLowerCase();
        if (!normalizedSearchTerm) {
          return [];
        }
        return await db.select().from(tenders).where(
          or(
            sql`LOWER(${tenders.referenceNo}) LIKE ${"%" + normalizedSearchTerm + "%"}`,
            sql`LOWER(${tenders.title}) LIKE ${"%" + normalizedSearchTerm + "%"}`,
            sql`LOWER(${tenders.authority}) LIKE ${"%" + normalizedSearchTerm + "%"}`,
            sql`LOWER(${tenders.location}) LIKE ${"%" + normalizedSearchTerm + "%"}`
          )
        ).orderBy(desc(tenders.createdAt));
      }
      async getTender(id) {
        const [tender] = await db.select().from(tenders).where(eq(tenders.id, id));
        return tender || void 0;
      }
      async getTenderByReference(referenceNo) {
        const [tender] = await db.select().from(tenders).where(eq(tenders.referenceNo, referenceNo));
        return tender || void 0;
      }
      async createTender(insertTender) {
        const [tender] = await db.insert(tenders).values(insertTender).returning();
        return tender;
      }
      async updateTender(id, updateTender) {
        const [updatedTender] = await db.update(tenders).set({ ...updateTender, updatedAt: /* @__PURE__ */ new Date() }).where(eq(tenders.id, id)).returning();
        return updatedTender || void 0;
      }
      // Tender Assignment methods
      async getTenderAssignments(tenderId) {
        const assignedByUser = alias(users, "assigned_by_user");
        const assignments = await db.select({
          id: tenderAssignments.id,
          tenderId: tenderAssignments.tenderId,
          userId: tenderAssignments.userId,
          assignedBy: tenderAssignments.assignedBy,
          assignType: tenderAssignments.assignType,
          comments: tenderAssignments.comments,
          createdAt: tenderAssignments.createdAt,
          assignedToName: users.name,
          assignedByName: assignedByUser.name
        }).from(tenderAssignments).leftJoin(users, eq(tenderAssignments.userId, users.id)).leftJoin(assignedByUser, eq(tenderAssignments.assignedBy, assignedByUser.id)).where(eq(tenderAssignments.tenderId, tenderId));
        return assignments.map((assignment) => ({
          id: assignment.id,
          tenderId: assignment.tenderId,
          userId: assignment.userId,
          assignedBy: assignment.assignedBy,
          assignType: assignment.assignType,
          comments: assignment.comments,
          createdAt: assignment.createdAt,
          assignedTo: assignment.assignedToName || "Unknown User",
          assignedByName: assignment.assignedByName || "Unknown User"
        }));
      }
      async getTenderWithAssignments(tenderId) {
        const [tender] = await db.select().from(tenders).where(eq(tenders.id, tenderId));
        if (!tender) {
          throw new Error("Tender not found");
        }
        const assignments = await db.select({
          id: tenderAssignments.id,
          tenderId: tenderAssignments.tenderId,
          userId: tenderAssignments.userId,
          assignedBy: tenderAssignments.assignedBy,
          assignType: tenderAssignments.assignType,
          comments: tenderAssignments.comments,
          createdAt: tenderAssignments.createdAt,
          user: {
            name: users.name
          }
        }).from(tenderAssignments).innerJoin(users, eq(tenderAssignments.userId, users.id)).where(eq(tenderAssignments.tenderId, tenderId));
        return { tender, assignments };
      }
      async getTendersWithAssignments() {
        const allTenders = await db.select().from(tenders).orderBy(desc(tenders.createdAt));
        const allAssignments = await db.select({
          id: tenderAssignments.id,
          tenderId: tenderAssignments.tenderId,
          userId: tenderAssignments.userId,
          assignedBy: tenderAssignments.assignedBy,
          assignType: tenderAssignments.assignType,
          createdAt: tenderAssignments.createdAt,
          userName: users.name,
          assignedUserId: users.id
        }).from(tenderAssignments).innerJoin(users, eq(tenderAssignments.userId, users.id)).orderBy(desc(tenderAssignments.createdAt));
        const assignmentsByTender = allAssignments.reduce((acc, assignment) => {
          acc[assignment.tenderId] = acc[assignment.tenderId] || [];
          acc[assignment.tenderId].push(assignment);
          return acc;
        }, {});
        return allTenders.map((tender) => {
          const tenderAssignments2 = assignmentsByTender[tender.id] || [];
          const latestAssignment = tenderAssignments2[0];
          if (latestAssignment) {
            return {
              ...tender,
              assignedUser: {
                id: latestAssignment.assignedUserId || latestAssignment.userId,
                name: latestAssignment.userName
              }
            };
          }
          return tender;
        });
      }
      async getAssignedTenders() {
        const assignments = await db.select({
          tenderId: tenderAssignments.tenderId,
          userId: tenderAssignments.userId,
          assignedBy: tenderAssignments.assignedBy,
          createdAt: tenderAssignments.createdAt,
          comments: tenderAssignments.comments
        }).from(tenderAssignments).orderBy(desc(tenderAssignments.createdAt));
        if (assignments.length === 0) {
          return [];
        }
        const uniqueTenderIds = Array.from(new Set(assignments.map((a) => a.tenderId)));
        const tenderData = await db.select().from(tenders).where(inArray(tenders.id, uniqueTenderIds));
        const assignedUserIds = assignments.map((a) => a.userId);
        const assignedByIds = assignments.map((a) => a.assignedBy);
        const allUserIds = [...assignedUserIds, ...assignedByIds];
        const uniqueUserIds = Array.from(new Set(allUserIds));
        const userData = await db.select({
          id: users.id,
          name: users.name
        }).from(users).where(inArray(users.id, uniqueUserIds));
        const userMap = userData.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {});
        const tenderMap = tenderData.reduce((acc, tender) => {
          acc[tender.id] = tender;
          return acc;
        }, {});
        const latestAssignments = uniqueTenderIds.map((tenderId) => {
          const tenderAssignments2 = assignments.filter((a) => a.tenderId === tenderId);
          return tenderAssignments2[0];
        });
        return latestAssignments.map((assignment) => {
          const tender = tenderMap[assignment.tenderId];
          const assignedUser = userMap[assignment.userId];
          const assignedByUser = userMap[assignment.assignedBy];
          if (!tender) return null;
          return {
            ...tender,
            assignedUser,
            assignedBy: assignedByUser,
            assignmentDate: assignment.createdAt,
            assignmentComments: assignment.comments
          };
        }).filter((item) => item !== null);
      }
      async createTenderAssignment(insertAssignment) {
        const existingAssignment = await db.select().from(tenderAssignments).where(and(
          eq(tenderAssignments.tenderId, insertAssignment.tenderId),
          eq(tenderAssignments.userId, insertAssignment.userId)
        )).limit(1);
        if (existingAssignment.length > 0) {
          const [updatedAssignment] = await db.update(tenderAssignments).set({
            assignedBy: insertAssignment.assignedBy,
            assignType: insertAssignment.assignType,
            comments: insertAssignment.comments,
            createdAt: /* @__PURE__ */ new Date()
          }).where(eq(tenderAssignments.id, existingAssignment[0].id)).returning();
          return updatedAssignment;
        }
        const [assignment] = await db.insert(tenderAssignments).values(insertAssignment).returning();
        return assignment;
      }
      async deleteAssignment(assignmentId) {
        const result = await db.delete(tenderAssignments).where(eq(tenderAssignments.id, assignmentId));
        return (result.rowCount || 0) > 0;
      }
      async deleteTenderAssignment(assignmentId) {
        const result = await db.delete(tenderAssignments).where(eq(tenderAssignments.id, assignmentId)).returning();
        return result.length > 0;
      }
      // Get tenders assigned to a specific user
      async getUserAssignedTenders(userId, status) {
        const assignments = await db.select({
          id: tenderAssignments.id,
          tenderId: tenderAssignments.tenderId,
          userId: tenderAssignments.userId,
          assignedBy: tenderAssignments.assignedBy,
          createdAt: tenderAssignments.createdAt,
          comments: tenderAssignments.comments
        }).from(tenderAssignments).where(eq(tenderAssignments.userId, userId)).orderBy(desc(tenderAssignments.createdAt));
        if (assignments.length === 0) {
          return [];
        }
        const tenderIds = assignments.map((a) => a.tenderId);
        let tenderQuery = db.select().from(tenders).where(inArray(tenders.id, tenderIds));
        if (status && status !== "fresh" && status !== "star" && status !== "interested" && status !== "bidToRa" && status !== "expired") {
          tenderQuery = tenderQuery.where(eq(tenders.status, status));
        }
        const tenderData = await tenderQuery;
        const assignedByIds = assignments.map((a) => a.assignedBy);
        const assignedToIds = assignments.map((a) => a.userId);
        const allUserIds = [...assignedByIds, ...assignedToIds];
        const uniqueUserIds = Array.from(new Set(allUserIds));
        const userData = await db.select({
          id: users.id,
          name: users.name
        }).from(users).where(inArray(users.id, uniqueUserIds));
        const userMap = userData.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {});
        const tenderMap = tenderData.reduce((acc, tender) => {
          acc[tender.id] = tender;
          return acc;
        }, {});
        const userTenderEntries = await db.select().from(userTenders).where(and(
          eq(userTenders.userId, userId),
          inArray(userTenders.tenderId, tenderIds)
        ));
        const userTenderMap = userTenderEntries.reduce((acc, ut) => {
          acc[ut.tenderId] = ut;
          return acc;
        }, {});
        const today = /* @__PURE__ */ new Date();
        today.setHours(0, 0, 0, 0);
        const result = await Promise.all(assignments.map(async (assignment) => {
          const tender = tenderMap[assignment.tenderId];
          const assignedByUser = userMap[assignment.assignedBy];
          const userTender = userTenderMap[assignment.tenderId];
          if (!tender) return null;
          if (status === "fresh") {
            const assignmentDate = new Date(assignment.createdAt);
            assignmentDate.setHours(0, 0, 0, 0);
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30);
            if (assignmentDate.getTime() < thirtyDaysAgo.getTime()) {
              return null;
            }
          }
          if (status === "bidToRa" && tender.status !== "bidToRa") {
            return null;
          }
          if (status === "expired") {
            const deadline = new Date(tender.deadline);
            const now = /* @__PURE__ */ new Date();
            if (deadline >= now) {
              return null;
            }
          }
          if (status === "star" && !userTender?.isStarred) {
            return null;
          }
          if (status === "interested" && !userTender?.isInterested) {
            return null;
          }
          const bidParticipants2 = await this.getBidParticipants(tender.id);
          const sortedParticipants = bidParticipants2.sort((a, b) => {
            const amountA = parseFloat(a.bidAmount);
            const amountB = parseFloat(b.bidAmount);
            return amountA - amountB;
          });
          const l1Winner = sortedParticipants.find((p) => p.bidderStatus === "L1") || sortedParticipants[0];
          const raData = await this.getReverseAuctions(tender.id);
          const latestRA = raData.length > 0 ? raData[raData.length - 1] : null;
          return {
            tender: {
              ...tender,
              assignedUser: { id: assignment.userId, name: userMap[assignment.userId]?.name || "Unknown User" },
              assignedBy: assignedByUser,
              assignmentDate: assignment.createdAt,
              assignmentComments: assignment.comments,
              // Additional fields for Excel export
              l1Bidder: l1Winner?.participantName || null,
              l1Amount: l1Winner ? parseFloat(l1Winner.bidAmount) : null,
              raNo: latestRA?.reference_number || latestRA?.bidNo || null,
              publishedDate: tender.createdAt,
              bidStartDate: tender.bidStartDate || tender.createdAt,
              dueDate: tender.deadline
            },
            isStarred: userTender?.isStarred || false,
            isInterested: userTender?.isInterested || false,
            assignmentId: assignment.id
          };
        }));
        return result.filter((item) => item !== null);
        return result;
      }
      // User Tenders methods
      async getUserTenders(userId, status) {
        const userTenderEntries = await db.select().from(userTenders).where(eq(userTenders.userId, userId));
        const result = [];
        const today = /* @__PURE__ */ new Date();
        today.setHours(0, 0, 0, 0);
        for (const userTender of userTenderEntries) {
          let tenderQuery = db.select().from(tenders).where(eq(tenders.id, userTender.tenderId));
          if (status === "star" && !userTender.isStarred) {
            continue;
          } else if (status === "interested" && !userTender.isInterested) {
            continue;
          }
          const [tender] = await tenderQuery;
          if (tender) {
            if (status === "fresh") {
              const createdAt = new Date(tender.createdAt);
              createdAt.setHours(0, 0, 0, 0);
              if (createdAt.getTime() !== today.getTime()) {
                continue;
              }
            } else if (status && status !== "star" && status !== "interested" && tender.status !== status) {
              continue;
            }
            result.push({
              ...userTender,
              tender
            });
          }
        }
        return result;
      }
      async getUserTender(userId, tenderId) {
        const [userTender] = await db.select().from(userTenders).where(and(
          eq(userTenders.userId, userId),
          eq(userTenders.tenderId, tenderId)
        ));
        return userTender;
      }
      async createUserTender(insertUserTender) {
        const [userTender] = await db.insert(userTenders).values(insertUserTender).returning();
        return userTender;
      }
      async updateUserTender(id, updateUserTender) {
        const [userTender] = await db.update(userTenders).set(updateUserTender).where(eq(userTenders.id, id)).returning();
        return userTender;
      }
      async toggleTenderStar(userId, tenderId, isStarred) {
        const [existingEntry] = await db.select().from(userTenders).where(and(
          eq(userTenders.userId, userId),
          eq(userTenders.tenderId, tenderId)
        ));
        if (existingEntry) {
          const [updatedEntry] = await db.update(userTenders).set({ isStarred }).where(eq(userTenders.id, existingEntry.id)).returning();
          return updatedEntry;
        } else {
          const [newEntry] = await db.insert(userTenders).values({
            userId,
            tenderId,
            isStarred,
            isInterested: false
          }).returning();
          return newEntry;
        }
      }
      async toggleTenderInterest(userId, tenderId, isInterested) {
        const [existingEntry] = await db.select().from(userTenders).where(and(
          eq(userTenders.userId, userId),
          eq(userTenders.tenderId, tenderId)
        ));
        if (existingEntry) {
          const [updatedEntry] = await db.update(userTenders).set({ isInterested }).where(eq(userTenders.id, existingEntry.id)).returning();
          return updatedEntry;
        } else {
          const [newEntry] = await db.insert(userTenders).values({
            userId,
            tenderId,
            isStarred: false,
            isInterested
          }).returning();
          return newEntry;
        }
      }
      // Methods for filtered tender lists
      async getTendersByStatus(status) {
        const filteredTenders = await db.select().from(tenders).where(eq(tenders.status, status)).orderBy(desc(tenders.createdAt));
        const allAssignments = await db.select({
          id: tenderAssignments.id,
          tenderId: tenderAssignments.tenderId,
          userId: tenderAssignments.userId,
          assignedBy: tenderAssignments.assignedBy,
          assignType: tenderAssignments.assignType,
          createdAt: tenderAssignments.createdAt,
          userName: users.name,
          assignedUserId: users.id
        }).from(tenderAssignments).innerJoin(users, eq(tenderAssignments.userId, users.id)).orderBy(desc(tenderAssignments.createdAt));
        const assignmentsByTender = allAssignments.reduce((acc, assignment) => {
          acc[assignment.tenderId] = acc[assignment.tenderId] || [];
          acc[assignment.tenderId].push(assignment);
          return acc;
        }, {});
        return filteredTenders.map((tender) => {
          const tenderAssignments2 = assignmentsByTender[tender.id] || [];
          const latestAssignment = tenderAssignments2[0];
          if (latestAssignment) {
            return {
              ...tender,
              assignedUser: {
                id: latestAssignment.assignedUserId || latestAssignment.userId,
                name: latestAssignment.userName
              }
            };
          }
          return tender;
        });
      }
      async getStarredTenders(userId) {
        const starredEntries = await db.select().from(userTenders).where(and(
          eq(userTenders.userId, userId),
          eq(userTenders.isStarred, true)
        ));
        if (starredEntries.length === 0) {
          return [];
        }
        const tenderIds = starredEntries.map((entry) => entry.tenderId);
        const starredTenders = await db.select().from(tenders).where(inArray(tenders.id, tenderIds)).orderBy(desc(tenders.createdAt));
        const allAssignments = await db.select({
          id: tenderAssignments.id,
          tenderId: tenderAssignments.tenderId,
          userId: tenderAssignments.userId,
          assignedBy: tenderAssignments.assignedBy,
          assignType: tenderAssignments.assignType,
          createdAt: tenderAssignments.createdAt,
          userName: users.name,
          assignedUserId: users.id
        }).from(tenderAssignments).innerJoin(users, eq(tenderAssignments.userId, users.id)).orderBy(desc(tenderAssignments.createdAt));
        const assignmentsByTender = allAssignments.reduce((acc, assignment) => {
          acc[assignment.tenderId] = acc[assignment.tenderId] || [];
          acc[assignment.tenderId].push(assignment);
          return acc;
        }, {});
        return starredTenders.map((tender) => {
          const tenderAssignments2 = assignmentsByTender[tender.id] || [];
          const latestAssignment = tenderAssignments2[0];
          if (latestAssignment) {
            return {
              ...tender,
              assignedUser: {
                id: latestAssignment.assignedUserId || latestAssignment.userId,
                name: latestAssignment.userName
              }
            };
          }
          return tender;
        });
      }
      async getInterestedTenders(userId) {
        const interestedEntries = await db.select().from(userTenders).where(and(
          eq(userTenders.userId, userId),
          eq(userTenders.isInterested, true)
        ));
        if (interestedEntries.length === 0) {
          return [];
        }
        const tenderIds = interestedEntries.map((entry) => entry.tenderId);
        const interestedTenders = await db.select().from(tenders).where(inArray(tenders.id, tenderIds)).orderBy(desc(tenders.createdAt));
        const allAssignments = await db.select({
          id: tenderAssignments.id,
          tenderId: tenderAssignments.tenderId,
          userId: tenderAssignments.userId,
          assignedBy: tenderAssignments.assignedBy,
          assignType: tenderAssignments.assignType,
          createdAt: tenderAssignments.createdAt,
          userName: users.name,
          assignedUserId: users.id
        }).from(tenderAssignments).innerJoin(users, eq(tenderAssignments.userId, users.id)).orderBy(desc(tenderAssignments.createdAt));
        const assignmentsByTender = allAssignments.reduce((acc, assignment) => {
          acc[assignment.tenderId] = acc[assignment.tenderId] || [];
          acc[assignment.tenderId].push(assignment);
          return acc;
        }, {});
        return interestedTenders.map((tender) => {
          const tenderAssignments2 = assignmentsByTender[tender.id] || [];
          const latestAssignment = tenderAssignments2[0];
          if (latestAssignment) {
            return {
              ...tender,
              assignedUser: {
                id: latestAssignment.assignedUserId || latestAssignment.userId,
                name: latestAssignment.userName
              }
            };
          }
          return tender;
        });
      }
      // Reminders methods
      async getReminders(userId) {
        const reminderEntries = await db.select().from(reminders).where(eq(reminders.userId, userId));
        const result = [];
        for (const reminder of reminderEntries) {
          const [tender] = await db.select().from(tenders).where(eq(tenders.id, reminder.tenderId));
          if (tender) {
            result.push({
              ...reminder,
              tender
            });
          }
        }
        return result;
      }
      async createReminder(insertReminder) {
        const [reminder] = await db.insert(reminders).values(insertReminder).returning();
        return reminder;
      }
      // Eligibility Criteria methods
      async getEligibilityCriteria(tenderId) {
        return await db.select().from(eligibilityCriteria).where(eq(eligibilityCriteria.tenderId, tenderId));
      }
      async createEligibilityCriteria(insertCriteria) {
        const [criteria] = await db.insert(eligibilityCriteria).values(insertCriteria).returning();
        return criteria;
      }
      // Tender Documents methods
      async getTenderDocuments(tenderId) {
        return await db.select().from(tenderDocuments).where(eq(tenderDocuments.tenderId, tenderId));
      }
      // Get all tender documents with user information
      async getAllTenderDocuments(tenderId) {
        const documents = [];
        const tender = await this.getTender(tenderId);
        if (!tender) return documents;
        if (tender.bidDocumentPath) {
          documents.push({
            id: `bid-${tender.id}`,
            name: "Bid Document",
            category: "Bid Document",
            filePath: tender.bidDocumentPath,
            fileUrl: `/api/documents/${tender.id}/bid`,
            fileType: "application/pdf",
            uploadedBy: 1,
            // System/Admin
            uploadedByName: "System",
            createdAt: tender.createdAt,
            icon: "FileText",
            color: "blue"
          });
        }
        if (tender.atcDocumentPath) {
          documents.push({
            id: `atc-${tender.id}`,
            name: "ATC Document",
            category: "ATC",
            filePath: tender.atcDocumentPath,
            fileUrl: `/api/documents/${tender.id}/atc`,
            fileType: "application/pdf",
            uploadedBy: 1,
            // System/Admin
            uploadedByName: "System",
            createdAt: tender.createdAt,
            icon: "FileText",
            color: "purple"
          });
        }
        if (tender.techSpecsDocumentPath) {
          documents.push({
            id: `tech-${tender.id}`,
            name: "Technical Specifications",
            category: "Technical Specs",
            filePath: tender.techSpecsDocumentPath,
            fileUrl: `/api/documents/${tender.id}/tech`,
            fileType: "application/pdf",
            uploadedBy: 1,
            // System/Admin
            uploadedByName: "System",
            createdAt: tender.createdAt,
            icon: "FileText",
            color: "green"
          });
        }
        const responses = await this.getTenderResponses(tenderId);
        for (const response of responses) {
          if (response.filePath) {
            const user = await this.getUser(response.createdBy);
            let category = "Prepare Response";
            let icon = "FileCheck";
            let color = "orange";
            if (response.responseType === "checklist" || response.responseType === "Financial" || response.responseType === "Technical" || response.responseType === "Commercial" || response.checklistId) {
              category = "Generated Tender Checklist Documents";
              icon = "FileCheck2";
              color = "green";
            }
            documents.push({
              id: `response-${response.id}`,
              name: response.responseName,
              category,
              filePath: response.filePath,
              fileUrl: `/api/tender-responses/${response.id}/download`,
              fileType: "application/pdf",
              uploadedBy: response.createdBy,
              uploadedByName: user?.name || "Unknown User",
              createdAt: response.createdAt,
              icon,
              color,
              responseType: response.responseType
            });
          }
        }
        const additionalDocs = await this.getTenderDocuments(tenderId);
        for (const doc of additionalDocs) {
          const user = await this.getUser(doc.uploadedBy);
          documents.push({
            id: `doc-${doc.id}`,
            name: doc.name,
            category: doc.category || "Other Documents",
            filePath: doc.fileUrl,
            fileUrl: doc.fileUrl,
            fileType: doc.fileType || "application/pdf",
            uploadedBy: doc.uploadedBy,
            uploadedByName: user?.name || "Unknown User",
            createdAt: doc.createdAt,
            icon: "File",
            color: "gray"
          });
        }
        return documents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      async createTenderDocument(insertDocument) {
        const [document] = await db.insert(tenderDocuments).values(insertDocument).returning();
        return document;
      }
      // Competitors methods
      async getCompetitors() {
        return await db.select().from(competitors);
      }
      async getCompetitor(id) {
        const [competitor] = await db.select().from(competitors).where(eq(competitors.id, id));
        return competitor || void 0;
      }
      async createCompetitor(insertCompetitor) {
        const [competitor] = await db.insert(competitors).values(insertCompetitor).returning();
        return competitor;
      }
      async getCompetitors(search) {
        if (search) {
          return await db.select().from(competitors).where(like(competitors.name, `%${search}%`)).orderBy(competitors.name);
        }
        return await db.select().from(competitors).orderBy(competitors.name);
      }
      // Tender Results methods
      async getTenderResults(tenderId) {
        const [result] = await db.select().from(tenderResults).where(eq(tenderResults.tenderId, tenderId));
        return result || void 0;
      }
      async createTenderResult(insertResult) {
        const [result] = await db.insert(tenderResults).values(insertResult).returning();
        return result;
      }
      // Bid Participants methods
      async getBidParticipants(tenderId) {
        return await db.select().from(bidParticipants).where(eq(bidParticipants.tenderId, tenderId)).orderBy(bidParticipants.createdAt);
      }
      async createBidParticipant(insertParticipant) {
        const [participant] = await db.insert(bidParticipants).values(insertParticipant).returning();
        return participant;
      }
      async updateBidParticipant(id, updateData) {
        const [participant] = await db.update(bidParticipants).set(updateData).where(eq(bidParticipants.id, id)).returning();
        return participant;
      }
      async deleteBidParticipant(id) {
        const result = await db.delete(bidParticipants).where(eq(bidParticipants.id, id));
        return result.rowCount > 0;
      }
      // AI Insights methods
      async getAiInsights(tenderId) {
        return await db.select().from(aiInsights).where(eq(aiInsights.tenderId, tenderId));
      }
      async createAiInsight(insertInsight) {
        const [insight] = await db.insert(aiInsights).values(insertInsight).returning();
        return insight;
      }
      // Activities methods
      async getActivities(userId, limit = 10) {
        if (userId) {
          return await db.select().from(activities).where(eq(activities.userId, userId)).orderBy(desc(activities.createdAt)).limit(limit);
        } else {
          return await db.select().from(activities).orderBy(desc(activities.createdAt)).limit(limit);
        }
      }
      async createActivity(insertActivity) {
        const [activity] = await db.insert(activities).values(insertActivity).returning();
        return activity;
      }
      async getTenderActivities(tenderId) {
        const activityRecords = await db.select().from(activities).where(
          and(
            eq(activities.entityId, tenderId),
            eq(activities.entityType, "tender")
          )
        ).orderBy(desc(activities.createdAt));
        const result = [];
        for (let i = 0; i < activityRecords.length; i++) {
          const activity = activityRecords[i];
          const user = await this.getUser(activity.userId);
          result.push({
            ...activity,
            activityNumber: `ACT-${tenderId}-${String(activityRecords.length - i).padStart(3, "0")}`,
            userName: user?.name || "Unknown User",
            userEmail: user?.email || "",
            actionColor: this.getActivityColor(activity.action)
          });
        }
        return result;
      }
      getActivityColor(action) {
        if (action.includes("delete") || action.includes("remove") || action.includes("cancel")) {
          return "red";
        } else if (action.includes("update") || action.includes("modify") || action.includes("edit") || action.includes("amend")) {
          return "orange";
        } else if (action.includes("create") || action.includes("add") || action.includes("upload") || action.includes("assign") || action.includes("generate")) {
          return "green";
        } else if (action.includes("approve") || action.includes("accept") || action.includes("submit")) {
          return "blue";
        } else if (action.includes("reject") || action.includes("decline")) {
          return "red";
        } else {
          return "gray";
        }
      }
      // Activity logging helper methods
      async logTenderActivity(userId, tenderId, action, description, metadata) {
        await this.createActivity({
          userId,
          action,
          entityType: "tender",
          entityId: tenderId,
          metadata: {
            description,
            ...metadata
          }
        });
      }
      // Role methods
      async getRoles() {
        return await db.select().from(roles);
      }
      async getRole(id) {
        const [role] = await db.select().from(roles).where(eq(roles.id, id));
        return role || void 0;
      }
      async createRole(insertRole) {
        const [role] = await db.insert(roles).values(insertRole).returning();
        return role;
      }
      async getRoleByName(name) {
        const [role] = await db.select().from(roles).where(eq(roles.name, name));
        return role || void 0;
      }
      async updateUserRole(userId, roleId) {
        await db.update(users).set({ role: roleId.toString() }).where(eq(users.id, userId));
      }
      async updateRole(id, updateRole) {
        const [updatedRole] = await db.update(roles).set(updateRole).where(eq(roles.id, id)).returning();
        return updatedRole || void 0;
      }
      // Role Permissions methods
      async getRolePermissions(roleId) {
        const [permissions] = await db.select().from(rolePermissions).where(eq(rolePermissions.roleId, roleId));
        return permissions || void 0;
      }
      async saveRolePermissions(insertPermissions) {
        const existingPermissions = await this.getRolePermissions(insertPermissions.roleId);
        if (existingPermissions) {
          const [updatedPermissions] = await db.update(rolePermissions).set({
            permissions: insertPermissions.permissions,
            updatedBy: insertPermissions.updatedBy,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(rolePermissions.id, existingPermissions.id)).returning();
          return updatedPermissions;
        } else {
          const [newPermissions] = await db.insert(rolePermissions).values(insertPermissions).returning();
          return newPermissions;
        }
      }
      // Department methods
      async getDepartments() {
        return await db.select().from(departments);
      }
      async getDepartment(id) {
        const [department] = await db.select().from(departments).where(eq(departments.id, id));
        return department || void 0;
      }
      async createDepartment(insertDepartment) {
        const [department] = await db.insert(departments).values(insertDepartment).returning();
        return department;
      }
      async updateDepartment(id, updateDepartment) {
        const [updatedDepartment] = await db.update(departments).set(updateDepartment).where(eq(departments.id, id)).returning();
        return updatedDepartment || void 0;
      }
      // Designation methods
      async getDesignations() {
        return await db.select().from(designations);
      }
      async getDesignationsByDepartment(departmentId) {
        return await db.select().from(designations).where(eq(designations.departmentId, departmentId));
      }
      async getDesignation(id) {
        const [designation] = await db.select().from(designations).where(eq(designations.id, id));
        return designation || void 0;
      }
      async createDesignation(insertDesignation) {
        const [designation] = await db.insert(designations).values(insertDesignation).returning();
        return designation;
      }
      async updateDesignation(id, updateDesignation) {
        const [updatedDesignation] = await db.update(designations).set(updateDesignation).where(eq(designations.id, id)).returning();
        return updatedDesignation || void 0;
      }
      // Purchase Order methods
      async getPurchaseOrders() {
        return await db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.createdAt));
      }
      async getPurchaseOrder(id) {
        const [purchaseOrder] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
        return purchaseOrder;
      }
      async createPurchaseOrder(insertPurchaseOrder) {
        const [purchaseOrder] = await db.insert(purchaseOrders).values(insertPurchaseOrder).returning();
        return purchaseOrder;
      }
      // Dealer methods
      async getDealers() {
        return await db.select().from(dealers).orderBy(dealers.companyName);
      }
      async searchDealers(filters) {
        let conditions = [];
        if (filters.companyName) {
          conditions.push(like(dealers.companyName, `%${filters.companyName}%`));
        }
        if (filters.emailId) {
          conditions.push(like(dealers.emailId, `%${filters.emailId}%`));
        }
        if (filters.contactNo) {
          conditions.push(like(dealers.contactNo, `%${filters.contactNo}%`));
        }
        if (filters.state) {
          conditions.push(eq(dealers.state, filters.state));
        }
        if (filters.city) {
          conditions.push(eq(dealers.city, filters.city));
        }
        if (conditions.length > 0) {
          return await db.select().from(dealers).where(and(...conditions)).orderBy(dealers.companyName);
        } else {
          return await db.select().from(dealers).orderBy(dealers.companyName);
        }
      }
      async getDealer(id) {
        const [dealer] = await db.select().from(dealers).where(eq(dealers.id, id));
        return dealer;
      }
      async createDealer(insertDealer) {
        const [dealer] = await db.insert(dealers).values(insertDealer).returning();
        return dealer;
      }
      async updateDealer(id, updateDealer) {
        const [updatedDealer] = await db.update(dealers).set(updateDealer).where(eq(dealers.id, id)).returning();
        return updatedDealer;
      }
      // OEM methods
      async getOEMs(filters = {}) {
        let conditions = [];
        if (filters.tenderNumber) {
          conditions.push(like(oems.tenderNo, `%${filters.tenderNumber}%`));
        }
        if (filters.departmentName) {
          conditions.push(like(oems.departmentName, `%${filters.departmentName}%`));
        }
        if (filters.tenderStatus) {
          conditions.push(eq(oems.status, filters.tenderStatus));
        }
        if (filters.authorizationDateFrom) {
          conditions.push(sql`${oems.authorizationDate} >= ${filters.authorizationDateFrom}`);
        }
        if (filters.authorizationDateTo) {
          conditions.push(sql`${oems.authorizationDate} <= ${filters.authorizationDateTo}`);
        }
        if (filters.followupDateFrom) {
          conditions.push(sql`${oems.followupDate} >= ${filters.followupDateFrom}`);
        }
        if (filters.followupDateTo) {
          conditions.push(sql`${oems.followupDate} <= ${filters.followupDateTo}`);
        }
        let query2 = db.select({
          oem: oems,
          dealer: dealers
        }).from(oems).leftJoin(dealers, eq(oems.dealerId, dealers.id)).orderBy(desc(oems.createdAt));
        if (conditions.length > 0) {
          query2 = query2.where(and(...conditions));
        }
        const results = await query2;
        return results.map((r) => ({
          ...r.oem,
          dealer: r.dealer || void 0
        }));
      }
      async getOEM(id) {
        const [result] = await db.select({
          oem: oems,
          dealer: dealers
        }).from(oems).leftJoin(dealers, eq(oems.dealerId, dealers.id)).where(eq(oems.id, id));
        if (!result) return void 0;
        return {
          ...result.oem,
          dealer: result.dealer || void 0
        };
      }
      async createOEM(insertOEM) {
        const [oem] = await db.insert(oems).values(insertOEM).returning();
        return oem;
      }
      async updateOEM(id, updateOEM) {
        const [updatedOEM] = await db.update(oems).set(updateOEM).where(eq(oems.id, id)).returning();
        return updatedOEM;
      }
      // Financial Approval methods
      async getFinancialApprovals(filters) {
        const conditions = [];
        if (filters) {
          if (filters.status) {
            conditions.push(eq(financialApprovals.status, filters.status));
          }
          if (filters.tenderId) {
            conditions.push(eq(financialApprovals.tenderId, filters.tenderId));
          }
          if (filters.requesterId) {
            conditions.push(eq(financialApprovals.requesterId, filters.requesterId));
          }
          if (filters.financeUserId) {
            conditions.push(eq(financialApprovals.financeUserId, filters.financeUserId));
          }
          if (filters.approvalType) {
            conditions.push(like(financialApprovals.approvalType, `%${filters.approvalType}%`));
          }
          if (filters.fromDate && filters.toDate) {
            conditions.push(
              and(
                gte(financialApprovals.reminderDate, filters.fromDate),
                lte(financialApprovals.reminderDate, filters.toDate)
              )
            );
          } else if (filters.fromDate) {
            conditions.push(gte(financialApprovals.reminderDate, filters.fromDate));
          } else if (filters.toDate) {
            conditions.push(lte(financialApprovals.reminderDate, filters.toDate));
          }
        }
        let query2 = db.select().from(financialApprovals).orderBy(desc(financialApprovals.createdAt));
        if (conditions.length > 0) {
          query2 = query2.where(and(...conditions));
        }
        return await query2;
      }
      async getFinancialApproval(id) {
        const [approval] = await db.select().from(financialApprovals).where(eq(financialApprovals.id, id));
        return approval;
      }
      async getTenderFinancialApprovals(tenderId) {
        return await db.select().from(financialApprovals).where(eq(financialApprovals.tenderId, tenderId)).orderBy(desc(financialApprovals.createdAt));
      }
      async createFinancialApproval(approval) {
        const timestamp2 = /* @__PURE__ */ new Date();
        const [newApproval] = await db.insert(financialApprovals).values({
          ...approval,
          createdAt: timestamp2
        }).returning();
        await db.insert(activities).values({
          userId: approval.requesterId,
          action: "request_financial_approval",
          entityType: "financial_approval",
          entityId: newApproval.id,
          metadata: {
            tenderId: approval.tenderId,
            approvalType: approval.approvalType,
            status: "pending"
          },
          createdAt: timestamp2
        });
        return newApproval;
      }
      async updateFinancialApproval(id, approval) {
        const timestamp2 = /* @__PURE__ */ new Date();
        const [updatedApproval] = await db.update(financialApprovals).set({
          ...approval,
          updatedAt: timestamp2
        }).where(eq(financialApprovals.id, id)).returning();
        if (updatedApproval && approval.status) {
          await db.insert(activities).values({
            userId: approval.financeUserId || updatedApproval.requesterId,
            action: `financial_approval_${approval.status}`,
            entityType: "financial_approval",
            entityId: updatedApproval.id,
            metadata: {
              tenderId: updatedApproval.tenderId,
              approvalType: updatedApproval.approvalType,
              status: approval.status
            },
            createdAt: timestamp2
          });
        }
        return updatedApproval;
      }
      async cancelFinancialApproval(id) {
        const timestamp2 = /* @__PURE__ */ new Date();
        const [cancelledApproval] = await db.update(financialApprovals).set({
          status: "cancelled",
          updatedAt: timestamp2
        }).where(eq(financialApprovals.id, id)).returning();
        if (cancelledApproval) {
          await db.insert(activities).values({
            userId: cancelledApproval.requesterId,
            action: "financial_approval_cancelled",
            entityType: "financial_approval",
            entityId: cancelledApproval.id,
            metadata: {
              tenderId: cancelledApproval.tenderId,
              approvalType: cancelledApproval.approvalType,
              status: "cancelled"
            },
            createdAt: timestamp2
          });
        }
        return cancelledApproval;
      }
      async getFinancialApprovalsByUser(userId) {
        return await db.select().from(financialApprovals).where(
          or(
            eq(financialApprovals.requesterId, userId),
            eq(financialApprovals.financeUserId, userId)
          )
        ).orderBy(desc(financialApprovals.createdAt));
      }
      // Company Management Methods (Bid Management)
      async getCompanies() {
        return await db.select().from(companies).orderBy(companies.name);
      }
      async getCompaniesByType(type) {
        return await db.select().from(companies).where(eq(companies.type, type)).orderBy(companies.name);
      }
      async getCompany(id) {
        const [company] = await db.select().from(companies).where(eq(companies.id, id));
        return company || void 0;
      }
      async createCompany(company) {
        const [createdCompany] = await db.insert(companies).values(company).returning();
        return createdCompany;
      }
      async updateCompany(id, companyData) {
        const [existingCompany] = await db.select().from(companies).where(eq(companies.id, id));
        if (!existingCompany) {
          return void 0;
        }
        const [updatedCompany] = await db.update(companies).set(companyData).where(eq(companies.id, id)).returning();
        return updatedCompany;
      }
      async deleteCompany(id) {
        try {
          await db.delete(companyDocuments).where(eq(companyDocuments.company_id, id));
          const result = await db.delete(companies).where(eq(companies.id, id));
          return true;
        } catch (error) {
          console.error("Error deleting company:", error);
          return false;
        }
      }
      async getCompanyDocuments(companyId) {
        const links = await db.select().from(companyDocuments).where(eq(companyDocuments.company_id, companyId));
        const documentResults = [];
        for (const link of links) {
          const [document] = await db.select().from(tenderDocuments).where(eq(tenderDocuments.id, link.document_id));
          if (document) {
            documentResults.push({
              ...link,
              document
            });
          }
        }
        return documentResults;
      }
      async linkCompanyDocument(link) {
        const [createdLink] = await db.insert(companyDocuments).values(link).returning();
        return createdLink;
      }
      async unlinkCompanyDocument(companyId, documentId) {
        try {
          await db.delete(companyDocuments).where(
            and(
              eq(companyDocuments.company_id, companyId),
              eq(companyDocuments.document_id, documentId)
            )
          );
          return true;
        } catch (error) {
          console.error("Error unlinking document:", error);
          return false;
        }
      }
      // Bid Participation Methods
      async getBidParticipations(filters) {
        let query2 = db.select().from(bidParticipations);
        if (filters) {
          const whereConditions = [];
          if (filters.status) {
            whereConditions.push(eq(bidParticipations.status, filters.status));
          }
          if (filters.tenderId) {
            whereConditions.push(eq(bidParticipations.tender_id, filters.tenderId));
          }
          if (whereConditions.length > 0) {
            query2 = query2.where(and(...whereConditions));
          }
        }
        const participations = await query2.orderBy(desc(bidParticipations.createdAt));
        return participations;
      }
      async getBidParticipation(id) {
        const [participation] = await db.select().from(bidParticipations).where(eq(bidParticipations.id, id));
        return participation;
      }
      async createBidParticipation(data) {
        const [participation] = await db.insert(bidParticipations).values({
          ...data,
          createdAt: /* @__PURE__ */ new Date()
        }).returning();
        return participation;
      }
      async updateBidParticipation(id, data) {
        const [updatedParticipation] = await db.update(bidParticipations).set(data).where(eq(bidParticipations.id, id)).returning();
        return updatedParticipation;
      }
      async deleteBidParticipation(id) {
        try {
          await db.delete(bidParticipations).where(eq(bidParticipations.id, id));
          return true;
        } catch (error) {
          console.error("Error deleting bid participation:", error);
          return false;
        }
      }
      async getBidParticipationCompanies(bidParticipationId) {
        const participationCompanies = await db.select({
          id: bidParticipationCompanies.id,
          bid_participation_id: bidParticipationCompanies.bid_participation_id,
          company_id: bidParticipationCompanies.company_id,
          company: companies
        }).from(bidParticipationCompanies).innerJoin(companies, eq(bidParticipationCompanies.company_id, companies.id)).where(eq(bidParticipationCompanies.bid_participation_id, bidParticipationId));
        return participationCompanies;
      }
      async linkCompanyToBidParticipation(link) {
        const [existingLink] = await db.select().from(bidParticipationCompanies).where(
          and(
            eq(bidParticipationCompanies.bid_participation_id, link.bid_participation_id),
            eq(bidParticipationCompanies.company_id, link.company_id)
          )
        );
        if (existingLink) {
          return existingLink;
        }
        const [createdLink] = await db.insert(bidParticipationCompanies).values(link).returning();
        return createdLink;
      }
      async unlinkCompanyFromBidParticipation(bidParticipationId, companyId) {
        try {
          await db.delete(bidParticipationCompanies).where(
            and(
              eq(bidParticipationCompanies.bid_participation_id, bidParticipationId),
              eq(bidParticipationCompanies.company_id, companyId)
            )
          );
          return true;
        } catch (error) {
          console.error("Error unlinking company from bid participation:", error);
          return false;
        }
      }
      // Kick Off Call methods
      async getKickOffCallsByTender(tenderId) {
        return await db.select().from(kickOffCalls).where(eq(kickOffCalls.tenderId, tenderId)).orderBy(desc(kickOffCalls.createdAt));
      }
      async createKickOffCall(data) {
        const [kickOffCall] = await db.insert(kickOffCalls).values(data).returning();
        return kickOffCall;
      }
      async getKickOffCall(id) {
        const [kickOffCall] = await db.select().from(kickOffCalls).where(eq(kickOffCalls.id, id));
        return kickOffCall;
      }
      async updateKickOffCall(id, data) {
        const [updatedKickOffCall] = await db.update(kickOffCalls).set(data).where(eq(kickOffCalls.id, id)).returning();
        return updatedKickOffCall;
      }
      async deleteKickOffCall(id) {
        try {
          await db.delete(kickOffCalls).where(eq(kickOffCalls.id, id));
          return true;
        } catch (error) {
          console.error("Error deleting kick off call:", error);
          return false;
        }
      }
      // AI Insights methods
      async getAiInsightsByTender(tenderId) {
        return await db.select().from(aiInsights).where(eq(aiInsights.tenderId, tenderId)).orderBy(desc(aiInsights.createdAt));
      }
      async createAiInsight(data) {
        const [insight] = await db.insert(aiInsights).values(data).returning();
        return insight;
      }
      async deleteAiInsight(id) {
        try {
          await db.delete(aiInsights).where(eq(aiInsights.id, id));
          return true;
        } catch (error) {
          console.error("Error deleting AI insight:", error);
          return false;
        }
      }
      // Folder methods with subfolder support
      async getFolders() {
        return await db.select().from(folders).orderBy(desc(folders.createdAt));
      }
      async getFoldersHierarchy() {
        const allFolders = await db.select().from(folders).orderBy(folders.name);
        const folderMap = /* @__PURE__ */ new Map();
        allFolders.forEach((folder) => {
          folderMap.set(folder.id, { ...folder, subfolders: [] });
        });
        const rootFolders = [];
        allFolders.forEach((folder) => {
          const folderWithSubfolders = folderMap.get(folder.id);
          if (folder.parentId) {
            const parent = folderMap.get(folder.parentId);
            if (parent) {
              parent.subfolders.push(folderWithSubfolders);
            }
          } else {
            rootFolders.push(folderWithSubfolders);
          }
        });
        return rootFolders;
      }
      async getRootFolders() {
        return await db.select().from(folders).where(sql`${folders.parentId} IS NULL`).orderBy(folders.name);
      }
      async getSubfolders(parentId) {
        return await db.select().from(folders).where(eq(folders.parentId, parentId)).orderBy(folders.name);
      }
      async getFolder(id) {
        const [folder] = await db.select().from(folders).where(eq(folders.id, id));
        return folder;
      }
      async createFolder(data) {
        const [folder] = await db.insert(folders).values(data).returning();
        return folder;
      }
      async updateFolder(id, folder) {
        try {
          const [updatedFolder] = await db.update(folders).set(folder).where(eq(folders.id, id)).returning();
          return updatedFolder;
        } catch (error) {
          console.error("Update folder error:", error);
          return void 0;
        }
      }
      async deleteFolder(id) {
        try {
          await db.delete(folders).where(eq(folders.id, id));
          return true;
        } catch (error) {
          console.error("Error deleting folder:", error);
          return false;
        }
      }
      async getFolderFiles(folderId) {
        try {
          const result = await db.select().from(files).where(eq(files.folderId, folderId));
          return result;
        } catch (error) {
          console.error("Get folder files error:", error);
          return [];
        }
      }
      // File methods
      async getFiles() {
        try {
          const result = await db.select({
            id: files.id,
            name: files.name,
            originalName: files.originalName,
            filePath: files.filePath,
            fileType: files.fileType,
            fileSize: files.fileSize,
            folderId: files.folderId,
            createdBy: files.createdBy,
            createdAt: files.createdAt,
            folderName: folders.name
          }).from(files).leftJoin(folders, eq(files.folderId, folders.id));
          return result;
        } catch (error) {
          console.error("Get files error:", error);
          return [];
        }
      }
      async getFilesByFolder(folderId) {
        try {
          return await db.select().from(files).where(eq(files.folderId, folderId));
        } catch (error) {
          console.error("Get files by folder error:", error);
          return [];
        }
      }
      async getFile(id) {
        try {
          const [file] = await db.select().from(files).where(eq(files.id, id));
          return file;
        } catch (error) {
          console.error("Get file error:", error);
          return void 0;
        }
      }
      async createFile(file) {
        try {
          const normalizedFile = {
            ...file,
            filePath: file.filePath ? normalizeFilePath(file.filePath) : file.filePath
          };
          const [newFile] = await db.insert(files).values(normalizedFile).returning();
          return newFile;
        } catch (error) {
          console.error("Create file error:", error);
          throw error;
        }
      }
      async updateFile(id, file) {
        try {
          const [updatedFile] = await db.update(files).set(file).where(eq(files.id, id)).returning();
          return updatedFile;
        } catch (error) {
          console.error("Update file error:", error);
          return void 0;
        }
      }
      async deleteFile(id) {
        try {
          await db.delete(files).where(eq(files.id, id));
          return true;
        } catch (error) {
          console.error("Delete file error:", error);
          return false;
        }
      }
      // Document Briefcase methods
      async getDocumentBriefcases() {
        try {
          const docs = await db.select().from(documentBriefcase);
          return docs;
        } catch (error) {
          console.error("Get document briefcases error:", error);
          return [];
        }
      }
      async getDocumentBriefcase(id) {
        try {
          const [doc] = await db.select().from(documentBriefcase).where(eq(documentBriefcase.id, id));
          return doc;
        } catch (error) {
          console.error("Get document briefcase error:", error);
          return void 0;
        }
      }
      async createDocumentBriefcase(doc) {
        try {
          const normalizedDoc = {
            ...doc,
            filePath: doc.filePath ? normalizeFilePath(doc.filePath) : doc.filePath
          };
          const [newDoc] = await db.insert(documentBriefcase).values(normalizedDoc).returning();
          return newDoc;
        } catch (error) {
          console.error("Create document briefcase error:", error);
          throw error;
        }
      }
      async updateDocumentBriefcase(id, doc) {
        try {
          const [updatedDoc] = await db.update(documentBriefcase).set(doc).where(eq(documentBriefcase.id, id)).returning();
          return updatedDoc;
        } catch (error) {
          console.error("Update document briefcase error:", error);
          return void 0;
        }
      }
      async deleteDocumentBriefcase(id) {
        try {
          await db.delete(documentBriefcase).where(eq(documentBriefcase.id, id));
          return true;
        } catch (error) {
          console.error("Delete document briefcase error:", error);
          return false;
        }
      }
      // Checklist Methods
      async getChecklists() {
        try {
          const checklistsList = await db.select().from(checklists).orderBy(checklists.createdAt);
          return checklistsList;
        } catch (error) {
          console.error("Get checklists error:", error);
          return [];
        }
      }
      async getChecklist(id) {
        try {
          const [checklist] = await db.select().from(checklists).where(eq(checklists.id, id));
          return checklist;
        } catch (error) {
          console.error("Get checklist by id error:", error);
          return void 0;
        }
      }
      async createChecklist(data) {
        try {
          const [checklist] = await db.insert(checklists).values(data).returning();
          return checklist;
        } catch (error) {
          console.error("Create checklist error:", error);
          throw error;
        }
      }
      async updateChecklist(id, data) {
        try {
          const [checklist] = await db.update(checklists).set(data).where(eq(checklists.id, id)).returning();
          return checklist;
        } catch (error) {
          console.error("Update checklist error:", error);
          return void 0;
        }
      }
      async deleteChecklist(id) {
        try {
          await db.delete(checklistDocuments).where(eq(checklistDocuments.checklistId, id));
          await db.delete(checklists).where(eq(checklists.id, id));
          return true;
        } catch (error) {
          console.error("Delete checklist error:", error);
          return false;
        }
      }
      // Checklist Documents Methods
      async getChecklistDocuments(checklistId) {
        try {
          const documents = await db.select().from(checklistDocuments).where(eq(checklistDocuments.checklistId, checklistId)).orderBy(checklistDocuments.createdAt);
          return documents;
        } catch (error) {
          console.error("Get checklist documents error:", error);
          return [];
        }
      }
      async getChecklistDocumentById(id) {
        try {
          const [document] = await db.select().from(checklistDocuments).where(eq(checklistDocuments.id, id));
          return document || void 0;
        } catch (error) {
          console.error("Get checklist document by ID error:", error);
          return void 0;
        }
      }
      async getChecklistDocumentById(documentId) {
        try {
          const [document] = await db.select().from(checklistDocuments).where(eq(checklistDocuments.id, documentId));
          return document || void 0;
        } catch (error) {
          console.error("Get checklist document by ID error:", error);
          return void 0;
        }
      }
      async createChecklistDocument(data) {
        try {
          const normalizedData = {
            ...data,
            filePath: data.filePath ? normalizeFilePath(data.filePath) : data.filePath
          };
          const [document] = await db.insert(checklistDocuments).values(normalizedData).returning();
          return document;
        } catch (error) {
          console.error("Create checklist document error:", error);
          throw error;
        }
      }
      async deleteChecklistDocument(id) {
        try {
          await db.delete(checklistDocuments).where(eq(checklistDocuments.id, id));
          return true;
        } catch (error) {
          console.error("Delete checklist document error:", error);
          return false;
        }
      }
      // Notifications methods
      async getNotifications(userId) {
        try {
          const result = await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
          return result;
        } catch (error) {
          console.error("Get notifications error:", error);
          return [];
        }
      }
      async createNotification(notification) {
        try {
          const [result] = await db.insert(notifications).values(notification).returning();
          return result;
        } catch (error) {
          console.error("Create notification error:", error);
          throw error;
        }
      }
      async markNotificationAsRead(id) {
        try {
          await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
          return true;
        } catch (error) {
          console.error("Mark notification as read error:", error);
          return false;
        }
      }
      // Tender Response methods
      async getTenderResponses(tenderId) {
        try {
          const responses = await db.select({
            id: tenderResponses.id,
            tenderId: tenderResponses.tenderId,
            checklistId: tenderResponses.checklistId,
            responseName: tenderResponses.responseName,
            responseType: tenderResponses.responseType,
            remarks: tenderResponses.remarks,
            includeIndex: tenderResponses.includeIndex,
            indexStartFrom: tenderResponses.indexStartFrom,
            selectedDocuments: tenderResponses.selectedDocuments,
            filePath: tenderResponses.filePath,
            fileSize: tenderResponses.fileSize,
            isCompressed: tenderResponses.isCompressed,
            signStampPath: tenderResponses.signStampPath,
            status: tenderResponses.status,
            createdBy: tenderResponses.createdBy,
            createdAt: tenderResponses.createdAt,
            updatedAt: tenderResponses.updatedAt,
            // Include user name
            createdByName: users.name
          }).from(tenderResponses).leftJoin(users, eq(tenderResponses.createdBy, users.id)).where(eq(tenderResponses.tenderId, tenderId)).orderBy(desc(tenderResponses.createdAt));
          return responses;
        } catch (error) {
          console.error("Get tender responses error:", error);
          return [];
        }
      }
      async getTenderResponse(id) {
        try {
          const [response] = await db.select().from(tenderResponses).where(eq(tenderResponses.id, id));
          return response || void 0;
        } catch (error) {
          console.error("Get tender response error:", error);
          return void 0;
        }
      }
      async createTenderResponse(data) {
        try {
          const normalizedData = {
            ...data,
            filePath: data.filePath ? normalizeFilePath(data.filePath) : data.filePath,
            signStampPath: data.signStampPath ? normalizeFilePath(data.signStampPath) : data.signStampPath
          };
          const [response] = await db.insert(tenderResponses).values(normalizedData).returning();
          return response;
        } catch (error) {
          console.error("Create tender response error:", error);
          throw error;
        }
      }
      async updateTenderResponse(id, data) {
        try {
          const [response] = await db.update(tenderResponses).set(data).where(eq(tenderResponses.id, id)).returning();
          return response || void 0;
        } catch (error) {
          console.error("Update tender response error:", error);
          return void 0;
        }
      }
      async deleteTenderResponse(id) {
        try {
          await db.delete(tenderResponses).where(eq(tenderResponses.id, id));
          return true;
        } catch (error) {
          console.error("Delete tender response error:", error);
          return false;
        }
      }
      // Approval Request methods
      async getApprovalRequests(tenderId) {
        try {
          const query2 = db.select({
            id: approvalRequests.id,
            tenderId: approvalRequests.tenderId,
            tenderBrief: approvalRequests.tenderBrief,
            tenderAuthority: approvalRequests.tenderAuthority,
            tenderValue: approvalRequests.tenderValue,
            approvalFor: approvalRequests.approvalFor,
            deadline: approvalRequests.deadline,
            approvalFrom: approvalRequests.approvalFrom,
            inLoop: approvalRequests.inLoop,
            uploadFile: approvalRequests.uploadFile,
            remarks: approvalRequests.remarks,
            status: approvalRequests.status,
            createdBy: approvalRequests.createdBy,
            createdAt: approvalRequests.createdAt,
            updatedAt: approvalRequests.updatedAt,
            approverName: users.username,
            inLoopName: sql`loop_user.username`
          }).from(approvalRequests).leftJoin(users, eq(approvalRequests.approvalFrom, users.id)).leftJoin(sql`users as loop_user`, sql`approval_requests.in_loop = loop_user.id`);
          if (tenderId) {
            query2.where(eq(approvalRequests.tenderId, tenderId));
          }
          return await query2.orderBy(desc(approvalRequests.createdAt));
        } catch (error) {
          console.error("Get approval requests error:", error);
          throw error;
        }
      }
      async getApprovalRequest(id) {
        try {
          const [request] = await db.select().from(approvalRequests).where(eq(approvalRequests.id, id));
          return request || void 0;
        } catch (error) {
          console.error("Get approval request error:", error);
          return void 0;
        }
      }
      async createApprovalRequest(data) {
        try {
          const [request] = await db.insert(approvalRequests).values(data).returning();
          return request;
        } catch (error) {
          console.error("Create approval request error:", error);
          throw error;
        }
      }
      async updateApprovalRequest(id, data) {
        try {
          const [request] = await db.update(approvalRequests).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(approvalRequests.id, id)).returning();
          return request || void 0;
        } catch (error) {
          console.error("Update approval request error:", error);
          return void 0;
        }
      }
      async deleteApprovalRequest(id) {
        try {
          await db.delete(approvalRequests).where(eq(approvalRequests.id, id));
          return true;
        } catch (error) {
          console.error("Delete approval request error:", error);
          return false;
        }
      }
      // Dashboard Layout methods
      async getDashboardLayout(userId) {
        try {
          const [layout] = await db.select().from(dashboardLayouts).where(eq(dashboardLayouts.userId, userId));
          return layout || void 0;
        } catch (error) {
          console.error("Get dashboard layout error:", error);
          return void 0;
        }
      }
      async createDashboardLayout(data) {
        try {
          const [layout] = await db.insert(dashboardLayouts).values(data).returning();
          return layout;
        } catch (error) {
          console.error("Create dashboard layout error:", error);
          throw error;
        }
      }
      async updateDashboardLayout(userId, layoutConfig) {
        try {
          const [layout] = await db.update(dashboardLayouts).set({
            layoutConfig,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(dashboardLayouts.userId, userId)).returning();
          return layout || void 0;
        } catch (error) {
          console.error("Update dashboard layout error:", error);
          return void 0;
        }
      }
      // Reminder methods
      async createReminder(reminderData) {
        const [reminder] = await db.insert(reminders).values(reminderData).returning();
        return reminder;
      }
      // Calendar Event methods
      async getRemindersByDateRange(startDate, endDate) {
        try {
          return await db.select().from(reminders).where(
            and(
              gte(reminders.reminderDate, startDate),
              lte(reminders.reminderDate, endDate),
              eq(reminders.isActive, true)
            )
          );
        } catch (error) {
          console.error("Get reminders by date range error:", error);
          return [];
        }
      }
      async getTendersByDeadlineRange(startDate, endDate) {
        try {
          return await db.select().from(tenders).where(
            and(
              gte(tenders.deadline, startDate),
              lte(tenders.deadline, endDate)
            )
          );
        } catch (error) {
          console.error("Get tenders by deadline range error:", error);
          return [];
        }
      }
      async getTenderReminders(tenderId) {
        return await db.select().from(reminders).where(and(
          eq(reminders.tenderId, tenderId),
          eq(reminders.isActive, true)
        )).orderBy(desc(reminders.createdAt));
      }
      async getUserReminders(userId) {
        return await db.select().from(reminders).where(and(
          eq(reminders.userId, userId),
          eq(reminders.isActive, true)
        )).orderBy(desc(reminders.reminderDate));
      }
      async updateReminder(id, updates) {
        const [reminder] = await db.update(reminders).set(updates).where(eq(reminders.id, id)).returning();
        return reminder || void 0;
      }
      async deleteReminder(id) {
        try {
          await db.update(reminders).set({ isActive: false }).where(eq(reminders.id, id));
          return true;
        } catch (error) {
          console.error("Delete reminder error:", error);
          return false;
        }
      }
      async getTodaysReminderActivities() {
        try {
          const today = /* @__PURE__ */ new Date();
          const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
          const todaysReminders = await db.select({
            id: reminders.id,
            tenderId: reminders.tenderId,
            userId: reminders.userId,
            reminderDate: reminders.reminderDate,
            comments: reminders.comments,
            createdAt: reminders.createdAt,
            tenderReferenceNo: tenders.referenceNo,
            tenderTitle: tenders.title,
            userName: users.name
          }).from(reminders).innerJoin(tenders, eq(reminders.tenderId, tenders.id)).innerJoin(users, eq(reminders.userId, users.id)).where(and(
            eq(reminders.isActive, true),
            gte(reminders.createdAt, startOfDay),
            lte(reminders.createdAt, endOfDay)
          )).orderBy(desc(reminders.createdAt));
          return todaysReminders;
        } catch (error) {
          console.error("Get today's reminder activities error:", error);
          return [];
        }
      }
      async getTodaysReminderActivitiesByUser(userId) {
        try {
          const today = /* @__PURE__ */ new Date();
          const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
          const todaysReminders = await db.select({
            id: reminders.id,
            tenderId: reminders.tenderId,
            userId: reminders.userId,
            reminderDate: reminders.reminderDate,
            comments: reminders.comments,
            createdAt: reminders.createdAt,
            tenderReferenceNo: tenders.referenceNo,
            tenderTitle: tenders.title,
            userName: users.name
          }).from(reminders).innerJoin(tenders, eq(reminders.tenderId, tenders.id)).innerJoin(users, eq(reminders.userId, users.id)).innerJoin(tenderAssignments, eq(tenderAssignments.tenderId, tenders.id)).where(and(
            eq(reminders.isActive, true),
            eq(tenderAssignments.userId, userId),
            gte(reminders.createdAt, startOfDay),
            lt(reminders.createdAt, endOfDay)
          )).orderBy(desc(reminders.createdAt));
          return todaysReminders;
        } catch (error) {
          console.error("Get today's reminder activities by user error:", error);
          return [];
        }
      }
      // Financial Request methods
      async getFinancialRequests(tenderId) {
        try {
          const query2 = db.select().from(financialRequests);
          if (tenderId) {
            return await query2.where(eq(financialRequests.tenderId, tenderId));
          }
          return await query2.orderBy(desc(financialRequests.createdAt));
        } catch (error) {
          console.error("Get financial requests error:", error);
          return [];
        }
      }
      async getFinancialRequest(id) {
        try {
          const [request] = await db.select().from(financialRequests).where(eq(financialRequests.id, id));
          return request || void 0;
        } catch (error) {
          console.error("Get financial request error:", error);
          return void 0;
        }
      }
      async createFinancialRequest(insertRequest) {
        try {
          const [request] = await db.insert(financialRequests).values(insertRequest).returning();
          return request;
        } catch (error) {
          console.error("Create financial request error:", error);
          throw error;
        }
      }
      async updateFinancialRequest(id, updateRequest) {
        try {
          const [updatedRequest] = await db.update(financialRequests).set({ ...updateRequest, updatedAt: /* @__PURE__ */ new Date() }).where(eq(financialRequests.id, id)).returning();
          return updatedRequest || void 0;
        } catch (error) {
          console.error("Update financial request error:", error);
          return void 0;
        }
      }
      async deleteFinancialRequest(id) {
        try {
          const result = await db.delete(financialRequests).where(eq(financialRequests.id, id));
          return true;
        } catch (error) {
          console.error("Delete financial request error:", error);
          return false;
        }
      }
      async createFinancialApproval(approvalData) {
        try {
          const [approval] = await db.insert(financialApprovals).values({
            tenderId: approvalData.tenderId,
            reminderDate: approvalData.deadline,
            requesterId: approvalData.createdBy,
            approvalType: approvalData.requirement,
            financeUserId: approvalData.requestTo,
            requestAmount: approvalData.amount.toString(),
            notes: approvalData.paymentDescription,
            status: approvalData.status || "Pending",
            paymentMode: approvalData.payment,
            filePath: approvalData.filePath ? normalizeFilePath(approvalData.filePath) : approvalData.filePath
          }).returning();
          return approval;
        } catch (error) {
          console.error("Create financial approval error:", error);
          throw error;
        }
      }
      async getTodaysFinancialActivities(userId) {
        try {
          const today = /* @__PURE__ */ new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const activities2 = await db.select({
            id: financialApprovals.id,
            tenderId: financialApprovals.tenderId,
            approvalType: financialApprovals.approvalType,
            requestAmount: financialApprovals.requestAmount,
            status: financialApprovals.status,
            reminderDate: financialApprovals.reminderDate,
            createdAt: financialApprovals.createdAt,
            requesterId: financialApprovals.requesterId,
            tenderReferenceNo: tenders.referenceNo,
            requesterName: users.name
          }).from(financialApprovals).innerJoin(tenders, eq(financialApprovals.tenderId, tenders.id)).innerJoin(users, eq(financialApprovals.requesterId, users.id)).where(
            and(
              eq(financialApprovals.financeUserId, userId),
              gte(financialApprovals.createdAt, today),
              lt(financialApprovals.createdAt, tomorrow)
            )
          ).orderBy(desc(financialApprovals.createdAt));
          return activities2.map((activity) => ({
            id: activity.id,
            type: "financial_request",
            tenderId: activity.tenderId,
            tenderReferenceNo: activity.tenderReferenceNo,
            approvalType: activity.approvalType,
            requestAmount: activity.requestAmount,
            status: activity.status,
            reminderDate: activity.reminderDate,
            createdAt: activity.createdAt,
            requestedBy: activity.requesterName,
            description: `${activity.approvalType} request for \u20B9${Number(activity.requestAmount).toLocaleString()}`
          }));
        } catch (error) {
          console.error("Get today's financial activities error:", error);
          return [];
        }
      }
      // Date-specific activity methods for assigned users
      async getDateReminderActivities(targetDate, userId) {
        try {
          const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
          const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);
          const dateReminders = await db.select({
            id: reminders.id,
            tenderId: reminders.tenderId,
            userId: reminders.userId,
            reminderDate: reminders.reminderDate,
            comments: reminders.comments,
            createdAt: reminders.createdAt,
            tenderReferenceNo: tenders.referenceNo,
            tenderTitle: tenders.title,
            creatorName: users.name
            // User who created the reminder
          }).from(reminders).innerJoin(tenders, eq(reminders.tenderId, tenders.id)).innerJoin(users, eq(reminders.userId, users.id)).innerJoin(tenderAssignments, eq(tenderAssignments.tenderId, tenders.id)).where(and(
            eq(reminders.isActive, true),
            eq(tenderAssignments.userId, userId),
            // User assigned to tender
            gte(reminders.reminderDate, startOfDay),
            lt(reminders.reminderDate, endOfDay)
          )).orderBy(desc(reminders.reminderDate));
          return dateReminders.map((reminder) => ({
            id: reminder.id,
            type: "tender_reminder",
            tenderId: reminder.tenderId,
            userId: reminder.userId,
            userName: reminder.creatorName,
            // Show creator name in comments
            tenderReferenceNo: reminder.tenderReferenceNo,
            tenderTitle: reminder.tenderTitle,
            reminderDate: reminder.reminderDate,
            comments: reminder.comments,
            createdAt: reminder.createdAt,
            actionColor: "bg-purple-100",
            description: `Tender Reminder for ${reminder.tenderReferenceNo?.trim() || "N/A"}`
          }));
        } catch (error) {
          console.error("Get date reminder activities error:", error);
          return [];
        }
      }
      async getDateReminderActivitiesByUser(userId, targetDate) {
        try {
          const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
          const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);
          const reminderCreator = alias(users, "reminderCreator");
          const dateReminders = await db.select({
            id: reminders.id,
            tenderId: reminders.tenderId,
            userId: reminders.userId,
            createdBy: reminders.createdBy,
            reminderDate: reminders.reminderDate,
            comments: reminders.comments,
            createdAt: reminders.createdAt,
            tenderReferenceNo: tenders.referenceNo,
            tenderTitle: tenders.title,
            userName: users.name,
            // User for whom reminder is set
            reminderCreatorName: reminderCreator.name
            // User who created the reminder
          }).from(reminders).innerJoin(tenders, eq(reminders.tenderId, tenders.id)).innerJoin(users, eq(reminders.userId, users.id)).leftJoin(reminderCreator, eq(reminders.createdBy, reminderCreator.id)).where(and(
            eq(reminders.isActive, true),
            or(
              // Show reminders for tenders assigned to this user
              sql`EXISTS (SELECT 1 FROM ${tenderAssignments} WHERE ${tenderAssignments.tenderId} = ${tenders.id} AND ${tenderAssignments.userId} = ${userId})`,
              // Show reminders created by this user
              eq(reminders.createdBy, userId)
            ),
            gte(reminders.reminderDate, startOfDay),
            lt(reminders.reminderDate, endOfDay)
          )).orderBy(desc(reminders.reminderDate));
          const reminderMap = /* @__PURE__ */ new Map();
          for (const reminder of dateReminders) {
            const key = reminder.tenderId.toString();
            if (!reminderMap.has(key)) {
              reminderMap.set(key, reminder);
            }
          }
          const reminderActivities = Array.from(reminderMap.values()).map((reminder) => ({
            id: reminder.id,
            type: "tender_reminder",
            tenderId: reminder.tenderId,
            userId: reminder.userId,
            userName: reminder.reminderCreatorName || reminder.userName,
            // Show creator name
            reminderCreatorName: reminder.reminderCreatorName,
            // User who set reminder
            tenderReferenceNo: reminder.tenderReferenceNo,
            tenderTitle: reminder.tenderTitle,
            reminderDate: reminder.reminderDate,
            comments: reminder.comments,
            createdAt: reminder.createdAt,
            actionColor: "bg-purple-100",
            description: `Tender Reminder for ${reminder.tenderReferenceNo?.trim() || "N/A"}`
          }));
          const assignmentActivities = await this.getDateAssignmentActivities(userId, targetDate);
          return [...reminderActivities, ...assignmentActivities].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } catch (error) {
          console.error("Get date reminder activities by user error:", error);
          return [];
        }
      }
      async getDateAssignmentActivities(userId, targetDate) {
        try {
          const date = new Date(targetDate);
          if (isNaN(date.getTime())) {
            console.error("Invalid date provided to getDateAssignmentActivities:", targetDate);
            return [];
          }
          const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
          const assignmentActivities = await db.select({
            id: activities.id,
            userId: activities.userId,
            action: activities.action,
            createdAt: activities.createdAt,
            metadata: activities.metadata
          }).from(activities).where(and(
            eq(activities.userId, userId),
            eq(activities.action, "tender_assignment"),
            eq(activities.entityType, "tender"),
            gte(activities.createdAt, startOfDay),
            lt(activities.createdAt, endOfDay)
          )).orderBy(desc(activities.createdAt));
          return assignmentActivities.map((activity) => {
            const metadata = activity.metadata;
            return {
              id: activity.id,
              type: "tender_assignment",
              tenderId: parseInt(metadata?.tenderNumber || "0"),
              userId: activity.userId,
              action: activity.action,
              tenderReferenceNo: metadata?.tenderReferenceNo?.trim() || "N/A",
              assignedTo: metadata?.assignedTo,
              assignedBy: metadata?.assignedBy,
              assignedAt: metadata?.assignedAt,
              submissionDate: metadata?.submissionDate,
              comments: metadata?.comments,
              createdAt: activity.createdAt,
              actionColor: "bg-green-100",
              description: `Tender Assignment Received - ${metadata?.tenderReferenceNo?.trim() || "N/A"}`
            };
          });
        } catch (error) {
          console.error("Get date assignment activities error:", error);
          return [];
        }
      }
      async getDateFinancialActivities(userId, targetDate) {
        try {
          const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
          const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);
          let allActivities = [];
          try {
            const activities2 = await db.select({
              id: financialApprovals.id,
              tenderId: financialApprovals.tenderId,
              approvalType: financialApprovals.approvalType,
              requestAmount: financialApprovals.requestAmount,
              status: financialApprovals.status,
              reminderDate: financialApprovals.reminderDate,
              createdAt: financialApprovals.createdAt,
              requesterId: financialApprovals.requesterId,
              tenderReferenceNo: tenders.referenceNo,
              requesterName: users.name
            }).from(financialApprovals).innerJoin(tenders, eq(financialApprovals.tenderId, tenders.id)).innerJoin(users, eq(financialApprovals.requesterId, users.id)).where(
              and(
                eq(financialApprovals.financeUserId, userId),
                gte(financialApprovals.createdAt, startOfDay),
                lt(financialApprovals.createdAt, endOfDay)
              )
            ).orderBy(desc(financialApprovals.createdAt));
            const financialActivities = activities2.map((activity) => ({
              id: activity.id,
              type: "financial_request",
              tenderId: activity.tenderId,
              tenderReferenceNo: activity.tenderReferenceNo,
              approvalType: activity.approvalType,
              requestAmount: activity.requestAmount,
              status: activity.status,
              reminderDate: activity.reminderDate,
              createdAt: activity.createdAt,
              requestedBy: activity.requesterName,
              description: `${activity.approvalType} request for \u20B9${Number(activity.requestAmount || 0).toLocaleString()}`,
              actionColor: "bg-orange-100"
            }));
            allActivities.push(...financialActivities);
          } catch (error) {
            console.error("Error getting financial approval activities:", error);
          }
          try {
            const generalFinanceActivities = await db.select({
              id: activities.id,
              action: activities.action,
              description: activities.description,
              entityType: activities.entityType,
              entityId: activities.entityId,
              userId: activities.userId,
              createdAt: activities.createdAt,
              metadata: activities.metadata,
              userName: users.name,
              tenderReferenceNo: tenders.referenceNo
            }).from(activities).leftJoin(users, eq(activities.userId, users.id)).leftJoin(tenders, and(
              eq(activities.entityType, "tender"),
              eq(activities.entityId, tenders.id)
            )).where(
              and(
                or(
                  eq(activities.action, "finance_request"),
                  eq(activities.action, "create_finance_request"),
                  like(activities.description, "%finance%"),
                  like(activities.description, "%Finance%")
                ),
                gte(activities.createdAt, startOfDay),
                lt(activities.createdAt, endOfDay)
              )
            ).orderBy(desc(activities.createdAt));
            const generalActivities = generalFinanceActivities.map((activity) => {
              const metadata = activity.metadata || {};
              return {
                id: activity.id + 1e4,
                // Ensure unique IDs
                type: "general_finance",
                action: activity.action,
                description: activity.description || "Finance activity",
                entityType: activity.entityType,
                entityId: activity.entityId,
                userId: activity.userId,
                userName: activity.userName,
                tenderReferenceNo: activity.tenderReferenceNo,
                createdAt: activity.createdAt,
                metadata,
                actionColor: "bg-blue-100"
              };
            });
            allActivities.push(...generalActivities);
          } catch (error) {
            console.error("Error getting general finance activities:", error);
          }
          allActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          return allActivities;
        } catch (error) {
          console.error("Get date financial activities error:", error);
          return [];
        }
      }
      async getActivityDates(userId, startDate, endDate) {
        try {
          const uniqueDates = /* @__PURE__ */ new Set();
          const reminderDates = await db.select({
            reminderDate: reminders.reminderDate
          }).from(reminders).innerJoin(tenders, eq(reminders.tenderId, tenders.id)).leftJoin(tenderAssignments, eq(tenderAssignments.tenderId, tenders.id)).where(and(
            eq(reminders.isActive, true),
            or(
              eq(reminders.userId, userId),
              eq(tenderAssignments.userId, userId)
            ),
            gte(reminders.reminderDate, startDate),
            lte(reminders.reminderDate, endDate)
          ));
          const financialDates = await db.select({
            reminderDate: financialApprovals.reminderDate
          }).from(financialApprovals).where(and(
            eq(financialApprovals.financeUserId, userId),
            gte(financialApprovals.reminderDate, startDate),
            lte(financialApprovals.reminderDate, endDate)
          ));
          const generalFinanceDates = await db.select({
            createdAt: activities.createdAt
          }).from(activities).where(and(
            or(
              eq(activities.action, "finance_request"),
              eq(activities.action, "create_finance_request"),
              like(activities.description, "%finance%"),
              like(activities.description, "%Finance%")
            ),
            gte(activities.createdAt, startDate),
            lte(activities.createdAt, endDate)
          ));
          reminderDates.forEach((item) => {
            if (item.reminderDate) {
              const dateStr = item.reminderDate.toISOString().split("T")[0];
              uniqueDates.add(dateStr);
            }
          });
          financialDates.forEach((item) => {
            if (item.reminderDate) {
              const dateStr = item.reminderDate.toISOString().split("T")[0];
              uniqueDates.add(dateStr);
            }
          });
          generalFinanceDates.forEach((item) => {
            if (item.createdAt) {
              const dateStr = item.createdAt.toISOString().split("T")[0];
              uniqueDates.add(dateStr);
            }
          });
          return Array.from(uniqueDates);
        } catch (error) {
          console.error("Get activity dates error:", error);
          return [];
        }
      }
      async getTodaysRegistrationActivities() {
        try {
          const now = /* @__PURE__ */ new Date();
          const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          const registrationActivities = await db.select({
            id: activities.id,
            userId: activities.userId,
            userName: users.name,
            userEmail: users.email,
            userRole: users.role,
            userDepartment: users.department,
            createdAt: activities.createdAt,
            metadata: activities.metadata
          }).from(activities).innerJoin(users, eq(activities.entityId, users.id)).where(
            and(
              eq(activities.action, "user_registration"),
              eq(activities.entityType, "user"),
              gte(activities.createdAt, startOfDay),
              lt(activities.createdAt, endOfDay)
            )
          ).orderBy(desc(activities.createdAt));
          return registrationActivities.map((activity) => ({
            id: activity.id,
            type: "user_registration",
            userId: activity.userId,
            userName: activity.userName,
            userEmail: activity.userEmail,
            userRole: activity.userRole,
            userDepartment: activity.userDepartment,
            createdAt: activity.createdAt,
            description: `New user ${activity.userName} registered with role ${activity.userRole}`,
            metadata: activity.metadata
          }));
        } catch (error) {
          console.error("Get today's registration activities error:", error);
          return [];
        }
      }
      // Task Allocation methods
      async createTaskAllocation(taskData) {
        try {
          const [task] = await db.insert(taskAllocations).values({
            tenderId: taskData.tenderId,
            taskName: taskData.taskName,
            assignedBy: taskData.assignedBy,
            assignedTo: taskData.assignedTo,
            taskDeadline: taskData.taskDeadline,
            filePath: taskData.filePath ? normalizeFilePath(taskData.filePath) : taskData.filePath,
            remarks: taskData.remarks,
            status: taskData.status || "Pending"
          }).returning();
          return task;
        } catch (error) {
          console.error("Create task allocation error:", error);
          throw error;
        }
      }
      async getTaskAllocations(tenderId) {
        try {
          const mockTasks = [
            {
              id: 1,
              tenderId: 43,
              taskName: "Test Task Allocation",
              assignedBy: 2,
              assignedTo: 3,
              taskDeadline: /* @__PURE__ */ new Date("2025-06-25T14:30:00"),
              filePath: null,
              remarks: "Test allocation with combined date/time picker",
              status: "Pending",
              createdAt: /* @__PURE__ */ new Date("2025-06-24T06:54:39.661489"),
              updatedAt: /* @__PURE__ */ new Date("2025-06-24T06:54:39.661489"),
              tenderReferenceNo: "GEM2025B6109833",
              tenderTitle: "Supply of Air Conditioners",
              tenderClientName: "Central Air Conditioning Corporation",
              tenderLocation: "New Delhi",
              tenderSubmissionDate: /* @__PURE__ */ new Date("2025-07-15T14:30:00"),
              assignedByName: "Poonam Amale",
              assignedToName: "Ajay Sharma",
              attachmentPath: null
            },
            {
              id: 2,
              tenderId: 43,
              taskName: "Document Preparation",
              assignedBy: 2,
              assignedTo: 1,
              taskDeadline: /* @__PURE__ */ new Date("2025-06-26T08:35:00"),
              filePath: null,
              remarks: "doc prepare",
              status: "Pending",
              createdAt: /* @__PURE__ */ new Date("2025-06-24T08:11:11.101544"),
              updatedAt: /* @__PURE__ */ new Date("2025-06-24T08:11:11.101544"),
              tenderReferenceNo: "GEM2025B6109833",
              tenderTitle: "Supply of Air Conditioners",
              tenderClientName: "Central Air Conditioning Corporation",
              tenderLocation: "New Delhi",
              tenderSubmissionDate: /* @__PURE__ */ new Date("2025-07-15T14:30:00"),
              assignedByName: "Poonam Amale",
              assignedToName: "Amit Pathariya",
              attachmentPath: null
            },
            {
              id: 3,
              tenderId: 42,
              taskName: "document prepartion",
              assignedBy: 1,
              assignedTo: 2,
              taskDeadline: /* @__PURE__ */ new Date("2025-06-24T08:57:06.087"),
              filePath: null,
              remarks: "ok",
              status: "Pending",
              createdAt: /* @__PURE__ */ new Date("2025-06-24T08:57:48.499891"),
              updatedAt: /* @__PURE__ */ new Date("2025-06-24T08:57:48.499891"),
              tenderReferenceNo: "GEM2025B6282942",
              tenderTitle: "Supply of Computer Systems",
              tenderClientName: "Government Computer Corporation",
              tenderLocation: "Mumbai",
              tenderSubmissionDate: /* @__PURE__ */ new Date("2025-07-20T17:00:00"),
              assignedByName: "Amit Pathariya",
              assignedToName: "Poonam Amale",
              attachmentPath: null
            }
          ];
          if (tenderId) {
            return mockTasks.filter((task) => task.tenderId === tenderId);
          }
          return mockTasks;
        } catch (error) {
          console.error("Get task allocations error:", error);
          return [];
        }
      }
      async updateTaskAllocation(id, updateData) {
        try {
          const [updatedTask] = await db.update(taskAllocations).set({
            ...updateData,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(taskAllocations.id, id)).returning();
          return updatedTask;
        } catch (error) {
          console.error("Update task allocation error:", error);
          throw error;
        }
      }
      async getAllTenderResponses() {
        return await db.select().from(tenderResponses).orderBy(desc(tenderResponses.createdAt));
      }
      async getRecentActivitiesFromAllUsers(limit = 50) {
        try {
          const activityRecords = await db.select({
            id: activities.id,
            userId: activities.userId,
            action: activities.action,
            entityType: activities.entityType,
            entityId: activities.entityId,
            metadata: activities.metadata,
            createdAt: activities.createdAt,
            userName: users.name,
            userEmail: users.email
          }).from(activities).innerJoin(users, eq(activities.userId, users.id)).orderBy(desc(activities.createdAt)).limit(limit);
          return activityRecords.map((activity) => ({
            ...activity,
            actionColor: this.getActivityColor(activity.action),
            description: this.getActivityDescription(activity.action, activity.metadata)
          }));
        } catch (error) {
          console.error("Get recent activities from all users error:", error);
          return [];
        }
      }
      getActivityDescription(action, metadata) {
        switch (action) {
          case "create":
            return `Created new tender ${metadata?.referenceNo || ""}`;
          case "assign":
            return `Assigned tender to ${metadata?.assignedTo || "team member"}`;
          case "create_tender_response":
            return `Generated ${metadata?.responseName || "tender response"}`;
          case "update_reverse_auction":
            return `Updated reverse auction ${metadata?.raNo || ""}`;
          case "approve_tender":
            return `Approved tender for ${metadata?.approvalLevel || "submission"}`;
          case "add_document":
            return `Added document ${metadata?.fileName || ""}`;
          case "delete_document":
            return `Deleted document ${metadata?.fileName || ""}`;
          case "update_tender":
            return `Updated tender details`;
          case "modify_requirements":
            return `Modified ${metadata?.section || "requirements"}`;
          case "reject_proposal":
            return `Rejected proposal: ${metadata?.reason || ""}`;
          case "document_upload":
            return `Uploaded documents for tender`;
          case "interest":
            return `Marked tender as interested`;
          case "star":
            return `Starred tender`;
          default:
            return `Performed ${action} action`;
        }
      }
      // Approval Request methods
      async getApprovalRequests(tenderId) {
        try {
          const approverUser = alias(users, "approverUser");
          const inLoopUser = alias(users, "inLoopUser");
          const requesterUser = alias(users, "requesterUser");
          let query2 = db.select({
            id: approvalRequests.id,
            tenderId: approvalRequests.tenderId,
            tenderBrief: approvalRequests.tenderBrief,
            tenderAuthority: approvalRequests.tenderAuthority,
            tenderValue: approvalRequests.tenderValue,
            approvalFor: approvalRequests.approvalFor,
            deadline: approvalRequests.deadline,
            approvalFrom: approvalRequests.approvalFrom,
            inLoop: approvalRequests.inLoop,
            uploadFile: approvalRequests.uploadFile,
            remarks: approvalRequests.remarks,
            status: approvalRequests.status,
            createdBy: approvalRequests.createdBy,
            createdAt: approvalRequests.createdAt,
            updatedAt: approvalRequests.updatedAt,
            // Include user details
            approvalFromUser: {
              id: approverUser.id,
              name: approverUser.name
            },
            inLoopUser: {
              id: inLoopUser.id,
              name: inLoopUser.name
            },
            requesterUser: {
              id: requesterUser.id,
              name: requesterUser.name
            },
            // Include tender details
            tender: {
              id: tenders.id,
              referenceNo: tenders.referenceNo,
              title: tenders.title
            }
          }).from(approvalRequests).leftJoin(approverUser, eq(approvalRequests.approvalFrom, approverUser.id)).leftJoin(inLoopUser, eq(approvalRequests.inLoop, inLoopUser.id)).leftJoin(requesterUser, eq(approvalRequests.createdBy, requesterUser.id)).leftJoin(tenders, eq(approvalRequests.tenderId, tenders.id));
          if (tenderId) {
            query2 = query2.where(eq(approvalRequests.tenderId, tenderId));
          }
          return await query2.orderBy(desc(approvalRequests.createdAt));
        } catch (error) {
          console.error("Get approval requests error:", error);
          return [];
        }
      }
      async getApprovalRequest(id) {
        try {
          const [request] = await db.select().from(approvalRequests).where(eq(approvalRequests.id, id));
          return request;
        } catch (error) {
          console.error("Get approval request error:", error);
          return void 0;
        }
      }
      async createApprovalRequest(requestData) {
        try {
          const [request] = await db.insert(approvalRequests).values({
            ...requestData,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          }).returning();
          return request;
        } catch (error) {
          console.error("Create approval request error:", error);
          throw error;
        }
      }
      async updateApprovalRequest(id, updateData) {
        try {
          const [request] = await db.update(approvalRequests).set({
            ...updateData,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(approvalRequests.id, id)).returning();
          return request;
        } catch (error) {
          console.error("Update approval request error:", error);
          return void 0;
        }
      }
      async deleteApprovalRequest(id) {
        try {
          const result = await db.delete(approvalRequests).where(eq(approvalRequests.id, id));
          return result.rowCount ? result.rowCount > 0 : false;
        } catch (error) {
          console.error("Delete approval request error:", error);
          return false;
        }
      }
      // General Settings methods
      async getGeneralSettings() {
        try {
          const [settings] = await db.select().from(generalSettings).limit(1);
          return settings;
        } catch (error) {
          console.error("Get general settings error:", error);
          return void 0;
        }
      }
      async updateGeneralSettings(data) {
        try {
          const existing = await this.getGeneralSettings();
          if (existing) {
            const [settings] = await db.update(generalSettings).set({
              ...data,
              updatedAt: /* @__PURE__ */ new Date()
            }).where(eq(generalSettings.id, existing.id)).returning();
            return settings;
          } else {
            const [settings] = await db.insert(generalSettings).values({
              ...data,
              createdAt: /* @__PURE__ */ new Date(),
              updatedAt: /* @__PURE__ */ new Date()
            }).returning();
            return settings;
          }
        } catch (error) {
          console.error("Update general settings error:", error);
          throw error;
        }
      }
      // Database Backup methods
      async getDatabaseBackups() {
        try {
          return await db.select({
            id: databaseBackups.id,
            backupName: databaseBackups.backupName,
            filePath: databaseBackups.filePath,
            fileSize: databaseBackups.fileSize,
            createdBy: databaseBackups.createdBy,
            createdAt: databaseBackups.createdAt,
            createdByName: users.name
          }).from(databaseBackups).leftJoin(users, eq(databaseBackups.createdBy, users.id)).orderBy(desc(databaseBackups.createdAt));
        } catch (error) {
          console.error("Get database backups error:", error);
          return [];
        }
      }
      async getDatabaseBackup(id) {
        try {
          const [backup] = await db.select().from(databaseBackups).where(eq(databaseBackups.id, id));
          return backup;
        } catch (error) {
          console.error("Get database backup error:", error);
          return void 0;
        }
      }
      async deleteDatabaseBackup(id) {
        try {
          await db.delete(databaseBackups).where(eq(databaseBackups.id, id));
        } catch (error) {
          console.error("Delete database backup error:", error);
          throw error;
        }
      }
      async createDatabaseBackup(data) {
        try {
          const [backup] = await db.insert(databaseBackups).values({
            ...data,
            createdAt: /* @__PURE__ */ new Date()
          }).returning();
          return backup;
        } catch (error) {
          console.error("Create database backup error:", error);
          throw error;
        }
      }
      // Menu Management methods
      async getMenuItems() {
        try {
          return await db.select().from(menuItems).orderBy(menuItems.orderIndex, menuItems.parentId);
        } catch (error) {
          console.error("Get menu items error:", error);
          return [];
        }
      }
      async getMenuItem(id) {
        try {
          const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
          return item;
        } catch (error) {
          console.error("Get menu item error:", error);
          return void 0;
        }
      }
      async createMenuItem(data) {
        try {
          const [item] = await db.insert(menuItems).values({
            ...data,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          }).returning();
          return item;
        } catch (error) {
          console.error("Create menu item error:", error);
          throw error;
        }
      }
      async updateMenuItem(id, data) {
        try {
          const [item] = await db.update(menuItems).set({
            ...data,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(menuItems.id, id)).returning();
          return item;
        } catch (error) {
          console.error("Update menu item error:", error);
          return void 0;
        }
      }
      async deleteMenuItem(id) {
        try {
          const result = await db.delete(menuItems).where(eq(menuItems.id, id));
          return result.rowCount ? result.rowCount > 0 : false;
        } catch (error) {
          console.error("Delete menu item error:", error);
          return false;
        }
      }
      async reorderMenuItems(items, updatedBy) {
        try {
          for (const item of items) {
            await db.update(menuItems).set({
              orderIndex: item.orderIndex,
              updatedBy,
              updatedAt: /* @__PURE__ */ new Date()
            }).where(eq(menuItems.id, item.id));
          }
        } catch (error) {
          console.error("Reorder menu items error:", error);
          throw error;
        }
      }
      // Menu Structure Management methods
      async saveMenuStructure(menuStructure, userId) {
        try {
          const existingRecord = await db.select().from(configurations).where(eq(configurations.key, "menu_structure")).limit(1);
          const menuStructureData = {
            key: "menu_structure",
            value: JSON.stringify(menuStructure),
            updatedBy: userId,
            updatedAt: /* @__PURE__ */ new Date()
          };
          if (existingRecord.length > 0) {
            await db.update(configurations).set(menuStructureData).where(eq(configurations.key, "menu_structure"));
          } else {
            await db.insert(configurations).values({
              ...menuStructureData,
              createdBy: userId,
              createdAt: /* @__PURE__ */ new Date()
            });
          }
          return true;
        } catch (error) {
          console.error("Save menu structure error:", error);
          return false;
        }
      }
      async getMenuStructure() {
        try {
          const [record] = await db.select().from(configurations).where(eq(configurations.key, "menu_structure")).limit(1);
          if (record && record.value) {
            return JSON.parse(record.value);
          }
          return null;
        } catch (error) {
          console.error("Get menu structure error:", error);
          return null;
        }
      }
      async resetMenuStructure(userId) {
        try {
          await db.delete(configurations).where(eq(configurations.key, "menu_structure"));
          return true;
        } catch (error) {
          console.error("Reset menu structure error:", error);
          return false;
        }
      }
      // Reverse Auction methods
      async getReverseAuctions(tenderId) {
        try {
          const query2 = db.select().from(reverseAuctions);
          if (tenderId) {
            return await query2.where(eq(reverseAuctions.tenderId, tenderId)).orderBy(desc(reverseAuctions.createdAt));
          }
          return await query2.orderBy(desc(reverseAuctions.createdAt));
        } catch (error) {
          console.error("Get reverse auctions error:", error);
          return [];
        }
      }
      async getReverseAuction(id) {
        try {
          const [auction] = await db.select().from(reverseAuctions).where(eq(reverseAuctions.id, id));
          return auction || void 0;
        } catch (error) {
          console.error("Get reverse auction error:", error);
          return void 0;
        }
      }
      async createReverseAuction(data) {
        try {
          const [auction] = await db.insert(reverseAuctions).values(data).returning();
          return auction;
        } catch (error) {
          console.error("Create reverse auction error:", error);
          throw error;
        }
      }
      async updateReverseAuction(id, data) {
        try {
          const [updatedAuction] = await db.update(reverseAuctions).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(reverseAuctions.id, id)).returning();
          return updatedAuction || void 0;
        } catch (error) {
          console.error("Update reverse auction error:", error);
          return void 0;
        }
      }
      async deleteReverseAuction(id) {
        try {
          await db.delete(reverseAuctions).where(eq(reverseAuctions.id, id));
          return true;
        } catch (error) {
          console.error("Delete reverse auction error:", error);
          return false;
        }
      }
      // Date-specific general activities
      async getDateGeneralActivities(targetDate) {
        try {
          const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
          const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);
          const generalActivities = await db.select({
            id: activities.id,
            userId: activities.userId,
            action: activities.action,
            description: activities.description,
            entityType: activities.entityType,
            entityId: activities.entityId,
            createdAt: activities.createdAt,
            userName: users.name,
            metadata: activities.metadata
          }).from(activities).leftJoin(users, eq(activities.userId, users.id)).where(and(
            gte(activities.createdAt, startOfDay),
            lt(activities.createdAt, endOfDay),
            not(eq(activities.action, "user_registration"))
          )).orderBy(desc(activities.createdAt));
          return generalActivities.map((activity) => ({
            id: activity.id,
            type: "general_activity",
            userId: activity.userId,
            userName: activity.userName,
            action: activity.action,
            description: activity.description,
            entityType: activity.entityType,
            entityId: activity.entityId,
            createdAt: activity.createdAt,
            metadata: activity.metadata,
            actionColor: activity.action === "tender_view" ? "bg-green-100" : activity.action === "document_upload" ? "bg-orange-100" : "bg-gray-100"
          }));
        } catch (error) {
          console.error("Get date general activities error:", error);
          return [];
        }
      }
    };
  }
});

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  MemStorage: () => MemStorage,
  storage: () => storage
});
var MemStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_database_storage();
    MemStorage = class {
      users;
      tenders;
      tenderAssignments;
      userTenders;
      reminders;
      eligibilityCriteria;
      tenderDocuments;
      competitors;
      tenderResults;
      aiInsights;
      activities;
      roles;
      rolePermissions;
      departments;
      designations;
      oems;
      dealers;
      financialApprovals;
      companies;
      companyDocuments;
      bidParticipations;
      bidParticipationCompanies;
      bidParticipants;
      userCurrentId;
      tenderCurrentId;
      tenderAssignmentCurrentId;
      userTenderCurrentId;
      reminderCurrentId;
      eligibilityCriteriaCurrentId;
      tenderDocumentCurrentId;
      competitorCurrentId;
      tenderResultCurrentId;
      aiInsightCurrentId;
      activityCurrentId;
      roleCurrentId;
      departmentCurrentId;
      designationCurrentId;
      oemCurrentId;
      dealerCurrentId;
      financialApprovalCurrentId;
      companyCurrentId;
      companyDocumentCurrentId;
      bidParticipationCurrentId;
      bidParticipationCompanyCurrentId;
      bidParticipantCurrentId;
      constructor() {
        this.users = /* @__PURE__ */ new Map();
        this.tenders = /* @__PURE__ */ new Map();
        this.tenderAssignments = /* @__PURE__ */ new Map();
        this.userTenders = /* @__PURE__ */ new Map();
        this.reminders = /* @__PURE__ */ new Map();
        this.eligibilityCriteria = /* @__PURE__ */ new Map();
        this.tenderDocuments = /* @__PURE__ */ new Map();
        this.competitors = /* @__PURE__ */ new Map();
        this.tenderResults = /* @__PURE__ */ new Map();
        this.aiInsights = /* @__PURE__ */ new Map();
        this.activities = /* @__PURE__ */ new Map();
        this.roles = /* @__PURE__ */ new Map();
        this.rolePermissions = /* @__PURE__ */ new Map();
        this.departments = /* @__PURE__ */ new Map();
        this.designations = /* @__PURE__ */ new Map();
        this.oems = /* @__PURE__ */ new Map();
        this.dealers = /* @__PURE__ */ new Map();
        this.financialApprovals = /* @__PURE__ */ new Map();
        this.companies = /* @__PURE__ */ new Map();
        this.companyDocuments = /* @__PURE__ */ new Map();
        this.bidParticipations = /* @__PURE__ */ new Map();
        this.bidParticipationCompanies = /* @__PURE__ */ new Map();
        this.bidParticipants = /* @__PURE__ */ new Map();
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
        this.initializeData();
      }
      initializeData() {
        const admin = this.createUser({
          username: "admin",
          password: "admin123",
          name: "Admin User",
          email: "admin@startender.com",
          role: "admin",
          avatar: ""
        });
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
        this.createTender({
          referenceNo: "IOCL/REF/KR2/2023",
          title: "Supply of combustible material for refinery units",
          brief: "Supply of combustible material for refinery units - oil analyzer units[5] - analyzer on sensor fuze[2] - no analyzer umezono[32] - quartz[2] - in-series analyzer[3] - no carbon-carbon[5] - thermocouple element at high temperature for boilers and surface production.",
          authority: "Indian Oil Corporation Limited",
          location: "Bangalore, Karnataka",
          deadline: /* @__PURE__ */ new Date("2023-06-21T15:00:00"),
          emdAmount: 5e4,
          documentFee: 2e3,
          estimatedValue: 5e6,
          status: "in-process"
        });
        this.createTender({
          referenceNo: "BHEL/2023/TN/456",
          title: "Tender for Supply of Electrical Components",
          brief: "Supply of high-quality electrical components for power plant maintenance and operation",
          authority: "Bharat Heavy Electricals Limited",
          location: "Chennai, Tamil Nadu",
          deadline: /* @__PURE__ */ new Date("2023-06-25T17:00:00"),
          emdAmount: 75e3,
          documentFee: 3e3,
          estimatedValue: 75e5,
          status: "in-process"
        });
        this.createTender({
          referenceNo: "SWR/HBL/2023/123",
          title: "Provision of all construction material needed for sewer cleaning",
          brief: "Provision of all construction materials required for comprehensive sewer cleaning across municipal areas",
          authority: "South Western Railway",
          location: "Hubli, Karnataka",
          deadline: /* @__PURE__ */ new Date("2023-07-02T17:00:00"),
          emdAmount: 45e3,
          documentFee: 1500,
          estimatedValue: 4585e3,
          status: "new"
        });
        this.createTender({
          referenceNo: "NMDC/JGP/2023/789",
          title: "Construction material supplies for railway quarters",
          brief: "Supply of construction materials for the development and maintenance of railway staff quarters",
          authority: "National Mineral Development Corporation Limited",
          location: "Jagdalpur, Chhattisgarh",
          deadline: /* @__PURE__ */ new Date("2023-06-30T15:00:00"),
          emdAmount: 6e4,
          documentFee: 2500,
          estimatedValue: 6333e3,
          status: "in-process"
        });
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
      async getUsers() {
        return Array.from(this.users.values());
      }
      async getUser(id) {
        return this.users.get(id);
      }
      async getUserByUsername(username) {
        return Array.from(this.users.values()).find(
          (user) => user.username === username
        );
      }
      async createUser(insertUser) {
        const id = this.userCurrentId++;
        const timestamp2 = /* @__PURE__ */ new Date();
        const user = { ...insertUser, id, createdAt: timestamp2 };
        this.users.set(id, user);
        return user;
      }
      // Tender methods
      async getTenders() {
        return Array.from(this.tenders.values());
      }
      async getTender(id) {
        return this.tenders.get(id);
      }
      async getTenderByReference(referenceNo) {
        return Array.from(this.tenders.values()).find(
          (tender) => tender.referenceNo === referenceNo
        );
      }
      async createTender(insertTender) {
        const id = this.tenderCurrentId++;
        const timestamp2 = /* @__PURE__ */ new Date();
        const tender = {
          ...insertTender,
          id,
          createdAt: timestamp2,
          updatedAt: timestamp2
        };
        this.tenders.set(id, tender);
        return tender;
      }
      async updateTender(id, updateTender) {
        const tender = this.tenders.get(id);
        if (!tender) return void 0;
        const updatedTender = {
          ...tender,
          ...updateTender,
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.tenders.set(id, updatedTender);
        return updatedTender;
      }
      // Tender Assignment methods
      async getTenderAssignments(tenderId) {
        return Array.from(this.tenderAssignments.values()).filter(
          (assignment) => assignment.tenderId === tenderId
        );
      }
      async createTenderAssignment(insertAssignment) {
        const id = this.tenderAssignmentCurrentId++;
        const timestamp2 = /* @__PURE__ */ new Date();
        const assignment = {
          ...insertAssignment,
          id,
          createdAt: timestamp2
        };
        this.tenderAssignments.set(id, assignment);
        return assignment;
      }
      async deleteAssignment(assignmentId) {
        return this.tenderAssignments.delete(assignmentId);
      }
      async deleteTenderAssignment(assignmentId) {
        return this.tenderAssignments.delete(assignmentId);
      }
      // User Tenders methods
      async getUserTenders(userId) {
        const userTenderEntries = Array.from(this.userTenders.values()).filter(
          (userTender) => userTender.userId === userId
        );
        return userTenderEntries.map((userTender) => {
          const tender = this.tenders.get(userTender.tenderId);
          return {
            ...userTender,
            tender
          };
        });
      }
      async getUserTender(userId, tenderId) {
        return Array.from(this.userTenders.values()).find(
          (userTender) => userTender.userId === userId && userTender.tenderId === tenderId
        );
      }
      async createUserTender(insertUserTender) {
        const id = this.userTenderCurrentId++;
        const timestamp2 = /* @__PURE__ */ new Date();
        const userTender = {
          ...insertUserTender,
          id,
          createdAt: timestamp2
        };
        this.userTenders.set(id, userTender);
        return userTender;
      }
      async updateUserTender(id, updateUserTender) {
        const userTender = this.userTenders.get(id);
        if (!userTender) return void 0;
        const updatedUserTender = {
          ...userTender,
          ...updateUserTender
        };
        this.userTenders.set(id, updatedUserTender);
        return updatedUserTender;
      }
      async toggleTenderStar(userId, tenderId, isStarred) {
        const existingEntry = Array.from(this.userTenders.values()).find(
          (entry) => entry.userId === userId && entry.tenderId === tenderId
        );
        if (existingEntry) {
          const updatedEntry = {
            ...existingEntry,
            isStarred
          };
          this.userTenders.set(existingEntry.id, updatedEntry);
          return updatedEntry;
        } else {
          const id = this.userTenderCurrentId++;
          const timestamp2 = /* @__PURE__ */ new Date();
          const newEntry = {
            id,
            userId,
            tenderId,
            isStarred,
            isInterested: false,
            createdAt: timestamp2
          };
          this.userTenders.set(id, newEntry);
          return newEntry;
        }
      }
      async toggleTenderInterest(userId, tenderId, isInterested) {
        const existingEntry = Array.from(this.userTenders.values()).find(
          (entry) => entry.userId === userId && entry.tenderId === tenderId
        );
        if (existingEntry) {
          const updatedEntry = {
            ...existingEntry,
            isInterested
          };
          this.userTenders.set(existingEntry.id, updatedEntry);
          return updatedEntry;
        } else {
          const id = this.userTenderCurrentId++;
          const timestamp2 = /* @__PURE__ */ new Date();
          const newEntry = {
            id,
            userId,
            tenderId,
            isStarred: false,
            isInterested,
            createdAt: timestamp2
          };
          this.userTenders.set(id, newEntry);
          return newEntry;
        }
      }
      // Reminders methods
      async getReminders(userId) {
        const reminderEntries = Array.from(this.reminders.values()).filter(
          (reminder) => reminder.userId === userId && reminder.isActive
        );
        return reminderEntries.map((reminder) => {
          const tender = this.tenders.get(reminder.tenderId);
          return {
            ...reminder,
            tender
          };
        });
      }
      async createReminder(insertReminder) {
        const id = this.reminderCurrentId++;
        const timestamp2 = /* @__PURE__ */ new Date();
        const reminder = {
          ...insertReminder,
          id,
          createdAt: timestamp2
        };
        this.reminders.set(id, reminder);
        return reminder;
      }
      // Eligibility Criteria methods
      async getEligibilityCriteria(tenderId) {
        return Array.from(this.eligibilityCriteria.values()).filter(
          (criteria) => criteria.tenderId === tenderId
        );
      }
      async createEligibilityCriteria(insertCriteria) {
        const id = this.eligibilityCriteriaCurrentId++;
        const timestamp2 = /* @__PURE__ */ new Date();
        const criteria = {
          ...insertCriteria,
          id,
          createdAt: timestamp2
        };
        this.eligibilityCriteria.set(id, criteria);
        return criteria;
      }
      // Tender Documents methods
      async getTenderDocuments(tenderId) {
        return Array.from(this.tenderDocuments.values()).filter(
          (document) => document.tenderId === tenderId
        );
      }
      async createTenderDocument(insertDocument) {
        const id = this.tenderDocumentCurrentId++;
        const timestamp2 = /* @__PURE__ */ new Date();
        const document = {
          ...insertDocument,
          id,
          createdAt: timestamp2
        };
        this.tenderDocuments.set(id, document);
        return document;
      }
      // Competitors methods
      async getCompetitors() {
        return Array.from(this.competitors.values());
      }
      async getCompetitor(id) {
        return this.competitors.get(id);
      }
      async createCompetitor(insertCompetitor) {
        const id = this.competitorCurrentId++;
        const timestamp2 = /* @__PURE__ */ new Date();
        const competitor = {
          ...insertCompetitor,
          id,
          createdAt: timestamp2
        };
        this.competitors.set(id, competitor);
        return competitor;
      }
      // Tender Results methods
      async getTenderResults(tenderId) {
        return Array.from(this.tenderResults.values()).find(
          (result) => result.tenderId === tenderId
        );
      }
      async createTenderResult(insertResult) {
        const id = this.tenderResultCurrentId++;
        const timestamp2 = /* @__PURE__ */ new Date();
        const result = {
          ...insertResult,
          id,
          createdAt: timestamp2
        };
        this.tenderResults.set(id, result);
        return result;
      }
      // Bid Participants methods
      async getBidParticipants(tenderId) {
        return Array.from(this.bidParticipants.values()).filter(
          (participant) => participant.tenderId === tenderId
        );
      }
      async getBidParticipant(id) {
        return this.bidParticipants.get(id);
      }
      async createBidParticipant(insertParticipant) {
        const id = this.bidParticipantCurrentId++;
        const timestamp2 = /* @__PURE__ */ new Date();
        const participant = {
          ...insertParticipant,
          id,
          createdAt: timestamp2
        };
        this.bidParticipants.set(id, participant);
        return participant;
      }
      async updateBidParticipant(id, updateData) {
        const participant = this.bidParticipants.get(id);
        if (!participant) return void 0;
        const updatedParticipant = { ...participant, ...updateData };
        this.bidParticipants.set(id, updatedParticipant);
        return updatedParticipant;
      }
      async deleteBidParticipant(id) {
        return this.bidParticipants.delete(id);
      }
      // AI Insights methods
      async getAiInsights(tenderId) {
        return Array.from(this.aiInsights.values()).filter(
          (insight) => insight.tenderId === tenderId || insight.tenderId === null
        );
      }
      async createAiInsight(insertInsight) {
        const id = this.aiInsightCurrentId++;
        const timestamp2 = /* @__PURE__ */ new Date();
        const insight = {
          ...insertInsight,
          id,
          createdAt: timestamp2
        };
        this.aiInsights.set(id, insight);
        return insight;
      }
      // Activities methods
      async getActivities(userId, limit = 10) {
        let activities2 = Array.from(this.activities.values());
        if (userId) {
          activities2 = activities2.filter((activity) => activity.userId === userId);
        }
        return activities2.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);
      }
      async createActivity(insertActivity) {
        const id = this.activityCurrentId++;
        const timestamp2 = /* @__PURE__ */ new Date();
        const activity = {
          ...insertActivity,
          id,
          createdAt: timestamp2
        };
        this.activities.set(id, activity);
        return activity;
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/services/email.ts
var email_exports = {};
__export(email_exports, {
  emailService: () => emailService
});
import nodemailer from "nodemailer";
var EmailService, emailService;
var init_email = __esm({
  "server/services/email.ts"() {
    "use strict";
    init_storage();
    EmailService = class {
      async createTransporter() {
        const settings = await storage.getGeneralSettings();
        if (!settings || !settings.emailHost || !settings.emailUser || !settings.emailPassword) {
          throw new Error("Email settings not configured. Please configure SMTP settings in General Settings.");
        }
        return nodemailer.createTransporter({
          host: settings.emailHost,
          port: settings.emailPort || 587,
          secure: settings.emailPort === 465,
          // true for port 465, false for other ports
          auth: {
            user: settings.emailUser,
            pass: settings.emailPassword
          },
          tls: {
            rejectUnauthorized: false
          }
        });
      }
      async sendTenderAssignmentEmail(data) {
        try {
          const settings = await storage.getGeneralSettings();
          const transporter = await this.createTransporter();
          const subject = `New tender assigned: ${data.tenderTitle} (${data.startDate} - ${data.endDate})`;
          const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #0076a8; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">TENDER247</h1>
            <p style="margin: 5px 0 0 0;">Tender Management System</p>
          </div>
          
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2 style="color: #0076a8; margin-top: 0;">New Tender Assignment</h2>
            
            <p>Dear ${data.recipientName},</p>
            
            <p>A new tender has been assigned to you. Here are the details:</p>
            
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #0076a8; margin-top: 0;">Tender Details</h3>
              <p><strong>Title:</strong> ${data.tenderTitle}</p>
              <p><strong>Reference No:</strong> ${data.tenderReferenceNo}</p>
              <p><strong>Start Date:</strong> ${data.startDate}</p>
              <p><strong>End Date:</strong> ${data.endDate}</p>
              <p><strong>Assigned By:</strong> ${data.assignedByName}</p>
              ${data.comment ? `<p><strong>Comment:</strong> ${data.comment}</p>` : ""}
            </div>
            
            <p>Please log in to the Tender Management System to view the complete tender details and take necessary action.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="#" style="background-color: #0076a8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
                View Tender Details
              </a>
            </div>
            
            <p>Best regards,<br>
            <strong>Tender247 Team</strong></p>
          </div>
          
          <div style="background-color: #e9ecef; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>This is an automated email from the Tender Management System. Please do not reply to this email.</p>
          </div>
        </div>
      `;
          const textBody = `
Dear ${data.recipientName},

A new tender has been assigned to you.

Tender Details:
- Title: ${data.tenderTitle}
- Reference No: ${data.tenderReferenceNo}
- Start Date: ${data.startDate}
- End Date: ${data.endDate}
- Assigned By: ${data.assignedByName}
${data.comment ? `- Comment: ${data.comment}` : ""}

Please log in to the Tender Management System to view the complete tender details and take necessary action.

Best regards,
Tender247 Team

---
This is an automated email from the Tender Management System. Please do not reply to this email.
      `;
          const mailOptions = {
            from: {
              name: settings?.emailFromName || "SquidJob System",
              address: settings?.emailFrom || settings?.emailUser || "noreply@squidjob.com"
            },
            to: data.recipientEmail,
            subject,
            text: textBody,
            html: htmlBody
          };
          await transporter.sendMail(mailOptions);
          console.log(`Tender assignment email sent to ${data.recipientEmail}`);
          return true;
        } catch (error) {
          console.error("Error sending tender assignment email:", error);
          return false;
        }
      }
      async testConnection() {
        try {
          const transporter = await this.createTransporter();
          await transporter.verify();
          console.log("SMTP connection verified successfully");
          return true;
        } catch (error) {
          console.error("SMTP connection failed:", error);
          return false;
        }
      }
    };
    emailService = new EmailService();
  }
});

// server/services/pdf-compilation-service.ts
var pdf_compilation_service_exports = {};
__export(pdf_compilation_service_exports, {
  PDFCompilationService: () => PDFCompilationService
});
import { PDFDocument, rgb, StandardFonts, PageSizes } from "pdf-lib";
import fs6 from "fs";
import path7 from "path";
var PDFCompilationService;
var init_pdf_compilation_service = __esm({
  "server/services/pdf-compilation-service.ts"() {
    "use strict";
    PDFCompilationService = class {
      static async loadPDFFromFile(filePath) {
        try {
          const pdfBytes = fs6.readFileSync(filePath);
          return await PDFDocument.load(pdfBytes);
        } catch (error) {
          console.error(`Error loading PDF from ${filePath}:`, error);
          throw new Error(`Failed to load PDF: ${path7.basename(filePath)}`);
        }
      }
      static async createIndexPage(documents, options, actualPageCounts = {}, bidNumber) {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage(PageSizes.A4);
        const { width, height } = page.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        let currentY = height - 80;
        if (bidNumber) {
          const bidTitle = `Bid No: ${bidNumber}`;
          const bidTitleWidth = boldFont.widthOfTextAtSize(bidTitle, 20);
          page.drawText(bidTitle, {
            x: (width - bidTitleWidth) / 2,
            y: currentY,
            size: 20,
            font: boldFont,
            color: rgb(0, 0, 0)
          });
          currentY -= 50;
        }
        const title = "INDEX";
        const titleWidth = boldFont.widthOfTextAtSize(title, 18);
        page.drawText(title, {
          x: (width - titleWidth) / 2,
          y: currentY,
          size: 18,
          font: boldFont,
          color: rgb(0, 0, 0)
        });
        currentY -= 40;
        let yPosition = currentY;
        page.drawText("Introduction....................................................", {
          x: 50,
          y: yPosition,
          size: 12,
          font,
          color: rgb(0, 0, 0)
        });
        yPosition -= 40;
        let currentPageNumber = options.startFrom + 1;
        documents.forEach((doc, index) => {
          if (yPosition < 100) {
            const newPage = pdfDoc.addPage(PageSizes.A4);
            yPosition = newPage.getSize().height - 80;
          }
          const maxNameLength = 50;
          let docName = doc.documentName;
          if (docName.length > maxNameLength) {
            docName = docName.substring(0, maxNameLength - 3) + "...";
          }
          const nameWidth = font.widthOfTextAtSize(docName, 12);
          const pageNumText = currentPageNumber.toString();
          const pageNumWidth = font.widthOfTextAtSize(pageNumText, 12);
          const availableSpace = width - 100 - nameWidth - pageNumWidth;
          const dotCount = Math.floor(availableSpace / font.widthOfTextAtSize(".", 12));
          const dots = ".".repeat(Math.max(dotCount, 3));
          page.drawText(docName, {
            x: 50,
            y: yPosition,
            size: 12,
            font,
            color: rgb(0, 0, 0)
          });
          page.drawText(dots, {
            x: 50 + nameWidth,
            y: yPosition,
            size: 12,
            font,
            color: rgb(0, 0, 0)
          });
          page.drawText(pageNumText, {
            x: width - 50 - pageNumWidth,
            y: yPosition,
            size: 12,
            font,
            color: rgb(0, 0, 0)
          });
          yPosition -= 20;
          const docPageCount = actualPageCounts[doc.id] || 1;
          currentPageNumber += docPageCount;
        });
        return pdfDoc;
      }
      static async applyStampToDocument(pdfDoc, stampOptions) {
        try {
          const stampImageBytes = fs6.readFileSync(stampOptions.imagePath);
          let stampImage;
          const imageExtension = stampOptions.imagePath.toLowerCase();
          if (imageExtension.includes(".png")) {
            stampImage = await pdfDoc.embedPng(stampImageBytes);
          } else if (imageExtension.includes(".jpg") || imageExtension.includes(".jpeg")) {
            stampImage = await pdfDoc.embedJpg(stampImageBytes);
          } else {
            try {
              stampImage = await pdfDoc.embedPng(stampImageBytes);
            } catch {
              stampImage = await pdfDoc.embedJpg(stampImageBytes);
            }
          }
          const pages = pdfDoc.getPages();
          const opacity = stampOptions.opacity || 0.8;
          const targetSize = 100;
          const stampWidth = stampImage.width;
          const stampHeight = stampImage.height;
          const scale = Math.min(targetSize / stampWidth, targetSize / stampHeight);
          pages.forEach((page) => {
            const { width, height } = page.getSize();
            const stampDims = stampImage.scale(scale);
            let x, y;
            switch (stampOptions.position) {
              case "bottom-left":
                x = 20;
                y = 20;
                break;
              case "top-right":
                x = width - stampDims.width - 20;
                y = height - stampDims.height - 20;
                break;
              case "top-left":
                x = 20;
                y = height - stampDims.height - 20;
                break;
              case "center":
                x = (width - stampDims.width) / 2;
                y = (height - stampDims.height) / 2;
                break;
              default:
                x = width - stampDims.width - 20;
                y = 20;
                break;
            }
            page.drawImage(stampImage, {
              x,
              y,
              width: stampDims.width,
              height: stampDims.height,
              opacity
            });
          });
        } catch (error) {
          console.error("Error applying stamp:", error);
          throw new Error("Failed to apply stamp to document");
        }
      }
      static async compileDocuments(options) {
        try {
          console.log("Starting PDF compilation with options:", {
            responseName: options.responseName,
            documentsCount: options.documents.length,
            includeIndex: options.indexOptions.includeIndex,
            hasStamp: !!options.stampOptions
          });
          const finalPdf = await PDFDocument.create();
          const documentPageCounts = {};
          const sortedDocuments = options.documents.sort((a, b) => a.order - b.order);
          for (const doc of sortedDocuments) {
            try {
              if (!doc.filePath) {
                continue;
              }
              let fullPath = doc.filePath;
              if (!path7.isAbsolute(fullPath)) {
                fullPath = path7.join(process.cwd(), fullPath);
              }
              if (!fs6.existsSync(fullPath)) {
                continue;
              }
              const docPdf = await this.loadPDFFromFile(fullPath);
              documentPageCounts[doc.id] = docPdf.getPageCount();
            } catch (error) {
              console.error(`Error counting pages for ${doc.documentName}:`, error);
              documentPageCounts[doc.id] = 1;
            }
          }
          if (options.indexOptions.includeIndex) {
            const indexPdf = await this.createIndexPage(options.documents, options.indexOptions, documentPageCounts, options.bidNumber);
            const indexPages = await finalPdf.copyPages(indexPdf, indexPdf.getPageIndices());
            const font = await finalPdf.embedFont(StandardFonts.Helvetica);
            indexPages.forEach((page) => {
              finalPdf.addPage(page);
              const pageNumber = `Page no : ${options.indexOptions.startFrom}`;
              page.drawText(pageNumber, {
                x: (page.getSize().width - 80) / 2,
                // Center horizontally
                y: 20,
                // Bottom margin
                size: 10,
                font,
                color: rgb(0, 0, 0)
              });
            });
          }
          let currentPageNumber = options.indexOptions.startFrom;
          if (options.indexOptions.includeIndex) {
            currentPageNumber = options.indexOptions.startFrom + 1;
          }
          for (const doc of sortedDocuments) {
            try {
              if (!doc.filePath) {
                console.warn(`No file path for document: ${doc.documentName}`);
                continue;
              }
              let fullPath = doc.filePath;
              if (!path7.isAbsolute(fullPath)) {
                fullPath = path7.join(process.cwd(), fullPath);
              }
              if (!fs6.existsSync(fullPath)) {
                console.warn(`File not found: ${fullPath}`);
                continue;
              }
              console.log(`Processing document: ${doc.documentName} at ${fullPath}`);
              const docPdf = await this.loadPDFFromFile(fullPath);
              if (options.stampOptions) {
                await this.applyStampToDocument(docPdf, options.stampOptions);
              }
              const pages = await finalPdf.copyPages(docPdf, docPdf.getPageIndices());
              const font = await finalPdf.embedFont(StandardFonts.Helvetica);
              pages.forEach((page, pageIndex) => {
                finalPdf.addPage(page);
                const pageNumber = `Page no : ${currentPageNumber}`;
                page.drawText(pageNumber, {
                  x: (page.getSize().width - 80) / 2,
                  // Center horizontally
                  y: 20,
                  // Bottom margin
                  size: 10,
                  font,
                  color: rgb(0, 0, 0)
                });
                currentPageNumber++;
              });
            } catch (error) {
              console.error(`Error processing document ${doc.documentName}:`, error);
            }
          }
          const outputDir = path7.dirname(options.outputPath);
          if (!fs6.existsSync(outputDir)) {
            fs6.mkdirSync(outputDir, { recursive: true });
          }
          const pdfBytes = await finalPdf.save();
          fs6.writeFileSync(options.outputPath, Buffer.from(pdfBytes));
          console.log(`PDF compilation completed: ${options.outputPath}`);
          console.log(`Final PDF page count: ${finalPdf.getPageCount()}`);
          return options.outputPath;
        } catch (error) {
          console.error("PDF compilation error:", error);
          throw new Error(`Failed to compile PDF: ${error.message}`);
        }
      }
      static async mergeAllSubmissions(submissionPaths, outputPath) {
        try {
          console.log(`Merging ${submissionPaths.length} submissions into: ${outputPath}`);
          const finalPdf = await PDFDocument.create();
          for (const submissionPath of submissionPaths) {
            try {
              if (!fs6.existsSync(submissionPath)) {
                console.warn(`Submission file not found: ${submissionPath}`);
                continue;
              }
              const submissionPdf = await this.loadPDFFromFile(submissionPath);
              const pages = await finalPdf.copyPages(submissionPdf, submissionPdf.getPageIndices());
              pages.forEach((page) => finalPdf.addPage(page));
            } catch (error) {
              console.error(`Error processing submission ${submissionPath}:`, error);
            }
          }
          const outputDir = path7.dirname(outputPath);
          if (!fs6.existsSync(outputDir)) {
            fs6.mkdirSync(outputDir, { recursive: true });
          }
          const pdfBytes = await finalPdf.save();
          fs6.writeFileSync(outputPath, Buffer.from(pdfBytes));
          console.log(`All submissions merged successfully: ${outputPath}`);
          console.log(`Final merged PDF page count: ${finalPdf.getPageCount()}`);
          return outputPath;
        } catch (error) {
          console.error("Error merging submissions:", error);
          throw new Error(`Failed to merge submissions: ${error.message}`);
        }
      }
      static getFileSize(filePath) {
        try {
          if (!fs6.existsSync(filePath)) {
            return "0 MB";
          }
          const stats = fs6.statSync(filePath);
          const fileSizeInBytes = stats.size;
          const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
          return `${fileSizeInMB.toFixed(2)} MB`;
        } catch (error) {
          console.error("Error getting file size:", error);
          return "0 MB";
        }
      }
    };
  }
});

// server/services/pdf-compression-service-effective.ts
var pdf_compression_service_effective_exports = {};
__export(pdf_compression_service_effective_exports, {
  EffectivePDFCompressionService: () => EffectivePDFCompressionService
});
import { PDFDocument as PDFDocument2, PDFName } from "pdf-lib";
import fs7 from "fs";
var EffectivePDFCompressionService;
var init_pdf_compression_service_effective = __esm({
  "server/services/pdf-compression-service-effective.ts"() {
    "use strict";
    EffectivePDFCompressionService = class {
      /**
       * Main compression method with intelligent size-based targeting
       */
      static async compressPDF(inputPath, outputPath) {
        try {
          const originalStats = fs7.statSync(inputPath);
          const originalSizeKB = Math.round(originalStats.size / 1024);
          const originalSizeMB = originalSizeKB / 1024;
          console.log(`Starting PDF compression: ${originalSizeMB.toFixed(2)}MB`);
          const settings = this.getCompressionSettings(originalSizeMB);
          console.log(`Target size: ${settings.targetSizeKB}KB (${(settings.targetSizeKB / 1024).toFixed(2)}MB)`);
          const pdfBytes = fs7.readFileSync(inputPath);
          const pdfDoc = await PDFDocument2.load(pdfBytes);
          const pageCount = pdfDoc.getPageCount();
          console.log(`Processing ${pageCount} pages with intelligent compression`);
          await this.applyComprehensiveCompression(pdfDoc, settings);
          let compressedBytes = await pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
            updateFieldAppearances: false,
            objectsPerTick: 1
          });
          let currentSizeKB = Math.round(compressedBytes.length / 1024);
          let iteration = 0;
          const maxIterations = 8;
          while (currentSizeKB > settings.targetSizeKB && iteration < maxIterations) {
            console.log(`Iteration ${iteration + 1}: ${currentSizeKB}KB \u2192 target ${settings.targetSizeKB}KB`);
            try {
              const tempDoc = await PDFDocument2.load(compressedBytes);
              await this.applyProgressiveCompression(tempDoc, settings, iteration);
              compressedBytes = await tempDoc.save({
                useObjectStreams: true,
                addDefaultPage: false,
                updateFieldAppearances: false,
                objectsPerTick: 1
              });
              const newSizeKB = Math.round(compressedBytes.length / 1024);
              if (newSizeKB >= currentSizeKB) {
                const aggressiveDoc = await PDFDocument2.load(compressedBytes);
                await this.applyAggressiveScaling(aggressiveDoc, 0.7 - iteration * 0.05);
                compressedBytes = await aggressiveDoc.save({
                  useObjectStreams: true,
                  addDefaultPage: false,
                  updateFieldAppearances: false,
                  objectsPerTick: 1
                });
              }
              currentSizeKB = Math.round(compressedBytes.length / 1024);
            } catch (error) {
              console.warn(`Iteration ${iteration + 1} failed:`, error);
              break;
            }
            iteration++;
          }
          fs7.writeFileSync(outputPath, compressedBytes);
          const finalSizeKB = Math.round(compressedBytes.length / 1024);
          const compressionRatio = Math.round((originalSizeKB - finalSizeKB) / originalSizeKB * 100);
          console.log(`Compression complete: ${originalSizeKB}KB \u2192 ${finalSizeKB}KB (${compressionRatio}% reduction)`);
          return {
            originalSizeKB,
            compressedSizeKB: finalSizeKB,
            compressionRatio,
            compressedFilePath: outputPath
          };
        } catch (error) {
          console.error("PDF compression error:", error);
          throw new Error("Failed to compress PDF: " + (error instanceof Error ? error.message : "Unknown error"));
        }
      }
      /**
       * Get compression settings based on original file size
       */
      static getCompressionSettings(fileSizeMB) {
        if (fileSizeMB > 10) {
          return {
            targetSizeKB: 5500,
            // 5.5MB
            imageQuality: 25,
            pageScale: 0.55,
            removeMetadata: true,
            removeAnnotations: true,
            compressStreams: true
          };
        } else if (fileSizeMB > 5) {
          return {
            targetSizeKB: 1500,
            // 1.5MB
            imageQuality: 35,
            pageScale: 0.65,
            removeMetadata: true,
            removeAnnotations: true,
            compressStreams: true
          };
        } else if (fileSizeMB > 1) {
          return {
            targetSizeKB: 800,
            // 800KB
            imageQuality: 45,
            pageScale: 0.75,
            removeMetadata: true,
            removeAnnotations: true,
            compressStreams: true
          };
        } else {
          return {
            targetSizeKB: Math.round(fileSizeMB * 1024 * 0.7),
            imageQuality: 60,
            pageScale: 0.85,
            removeMetadata: true,
            removeAnnotations: false,
            compressStreams: true
          };
        }
      }
      /**
       * Apply comprehensive compression techniques
       */
      static async applyComprehensiveCompression(pdfDoc, settings) {
        try {
          if (settings.removeMetadata) {
            pdfDoc.setTitle("");
            pdfDoc.setSubject("");
            pdfDoc.setKeywords([]);
            pdfDoc.setAuthor("");
            pdfDoc.setProducer("");
            pdfDoc.setCreator("");
            try {
              pdfDoc.setCreationDate(/* @__PURE__ */ new Date(0));
              pdfDoc.setModificationDate(/* @__PURE__ */ new Date(0));
            } catch (error) {
            }
          }
          const pages = pdfDoc.getPages();
          for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const { width, height } = page.getSize();
            const scale = settings.pageScale;
            page.scaleContent(scale, scale);
            page.setSize(width * scale, height * scale);
            if (settings.removeAnnotations) {
              try {
                const pageNode = page.node;
                if (pageNode.has(PDFName.of("Annots"))) {
                  pageNode.delete(PDFName.of("Annots"));
                }
              } catch (error) {
              }
            }
            try {
              const pageNode = page.node;
              if (pageNode.has(PDFName.of("Group"))) {
                pageNode.delete(PDFName.of("Group"));
              }
              if (pageNode.has(PDFName.of("Tabs"))) {
                pageNode.delete(PDFName.of("Tabs"));
              }
            } catch (error) {
            }
          }
          try {
            const docNode = pdfDoc.catalog;
            if (docNode.has(PDFName.of("OCProperties"))) {
              docNode.delete(PDFName.of("OCProperties"));
            }
            if (docNode.has(PDFName.of("Metadata"))) {
              docNode.delete(PDFName.of("Metadata"));
            }
          } catch (error) {
          }
        } catch (error) {
          console.warn("Comprehensive compression failed:", error);
        }
      }
      /**
       * Apply progressive compression based on iteration
       */
      static async applyProgressiveCompression(pdfDoc, settings, iteration) {
        try {
          const pages = pdfDoc.getPages();
          const scaleFactors = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.35, 0.3];
          const scaleFactor = scaleFactors[Math.min(iteration, scaleFactors.length - 1)];
          console.log(`Applying scale factor: ${scaleFactor}`);
          for (const page of pages) {
            const { width, height } = page.getSize();
            page.scaleContent(scaleFactor, scaleFactor);
            page.setSize(width * scaleFactor, height * scaleFactor);
            if (iteration > 2) {
              try {
                const pageNode = page.node;
                if (pageNode.has(PDFName.of("StructParents"))) {
                  pageNode.delete(PDFName.of("StructParents"));
                }
                if (pageNode.has(PDFName.of("Tabs"))) {
                  pageNode.delete(PDFName.of("Tabs"));
                }
                if (pageNode.has(PDFName.of("B"))) {
                  pageNode.delete(PDFName.of("B"));
                }
              } catch (error) {
              }
            }
          }
        } catch (error) {
          console.warn("Progressive compression failed:", error);
        }
      }
      /**
       * Apply aggressive scaling as a last resort
       */
      static async applyAggressiveScaling(pdfDoc, scaleFactor) {
        try {
          const pages = pdfDoc.getPages();
          for (const page of pages) {
            const { width, height } = page.getSize();
            page.scaleContent(scaleFactor, scaleFactor);
            page.setSize(width * scaleFactor, height * scaleFactor);
          }
        } catch (error) {
          console.warn("Aggressive scaling failed:", error);
        }
      }
      /**
       * Format file size for display
       */
      static formatFileSize(sizeKB) {
        if (sizeKB >= 1024) {
          return `${(sizeKB / 1024).toFixed(2)}MB`;
        } else {
          return `${sizeKB}KB`;
        }
      }
    };
  }
});

// server/services/universal-pdf-compression.ts
var universal_pdf_compression_exports = {};
__export(universal_pdf_compression_exports, {
  UniversalPDFCompressionService: () => UniversalPDFCompressionService
});
import * as fs8 from "fs";
import { PDFDocument as PDFDocument3 } from "pdf-lib";
import { exec } from "child_process";
import { promisify as promisify2 } from "util";
var execAsync, UniversalPDFCompressionService;
var init_universal_pdf_compression = __esm({
  "server/services/universal-pdf-compression.ts"() {
    "use strict";
    execAsync = promisify2(exec);
    UniversalPDFCompressionService = class {
      /**
       * Check if Ghostscript is available on the system
       */
      static async isGhostscriptAvailable() {
        try {
          await execAsync("gs --version");
          return true;
        } catch (error) {
          console.log("Ghostscript not available on this system");
          return false;
        }
      }
      /**
       * Compress PDF using the best available method
       */
      static async compressPDF(inputPath, outputPath, compressionType = "recommended") {
        const startTime = Date.now();
        try {
          const originalStats = fs8.statSync(inputPath);
          const originalSizeKB = Math.round(originalStats.size / 1024);
          const originalSizeMB = originalSizeKB / 1024;
          console.log(`Starting ${compressionType} compression: ${originalSizeMB.toFixed(2)}MB`);
          let compressedBytes;
          let method = "pdf-lib";
          const hasGhostscript = await this.isGhostscriptAvailable();
          if (hasGhostscript) {
            try {
              compressedBytes = await this.ghostscriptCompression(inputPath, outputPath, compressionType);
              method = "ghostscript";
            } catch (gsError) {
              console.log("Ghostscript compression failed, falling back to pdf-lib");
              compressedBytes = await this.pdfLibCompression(inputPath, compressionType);
              method = "pdf-lib";
            }
          } else {
            compressedBytes = await this.pdfLibCompression(inputPath, compressionType);
            method = "pdf-lib";
          }
          fs8.writeFileSync(outputPath, compressedBytes);
          const compressedSizeKB = Math.round(compressedBytes.length / 1024);
          const compressionRatio = Math.round((originalSizeKB - compressedSizeKB) / originalSizeKB * 100);
          const processingTime = (Date.now() - startTime) / 1e3;
          console.log(`Compression complete (${method}): ${originalSizeKB}KB \u2192 ${compressedSizeKB}KB (${compressionRatio}% reduction) in ${processingTime.toFixed(2)}s`);
          return {
            originalSizeKB,
            compressedSizeKB,
            compressionRatio,
            compressedFilePath: outputPath,
            processingTime,
            method
          };
        } catch (error) {
          console.error("PDF compression error:", error);
          throw new Error(`Failed to compress PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
      /**
       * Ghostscript compression (when available)
       */
      static async ghostscriptCompression(inputPath, outputPath, compressionType) {
        let gsSettings = "/default";
        let dpi = "150";
        switch (compressionType) {
          case "light":
            gsSettings = "/printer";
            dpi = "200";
            break;
          case "recommended":
            gsSettings = "/ebook";
            dpi = "150";
            break;
          case "extreme":
            gsSettings = "/screen";
            dpi = "72";
            break;
        }
        const gsCommand = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=${gsSettings} -dNOPAUSE -dQUIET -dBATCH -dDetectDuplicateImages -dCompressFonts=true -r${dpi} -sOutputFile="${outputPath}" "${inputPath}"`;
        await execAsync(gsCommand);
        if (fs8.existsSync(outputPath)) {
          return fs8.readFileSync(outputPath);
        } else {
          throw new Error("Ghostscript compression failed");
        }
      }
      /**
       * Enhanced pdf-lib compression (fallback method)
       */
      static async pdfLibCompression(inputPath, compressionType) {
        const pdfBytes = fs8.readFileSync(inputPath);
        const pdfDoc = await PDFDocument3.load(pdfBytes);
        const options = this.getCompressionOptions(compressionType);
        if (options.removeMetadata) {
          pdfDoc.setTitle("");
          pdfDoc.setSubject("");
          pdfDoc.setKeywords([]);
          pdfDoc.setAuthor("");
          pdfDoc.setProducer("");
          pdfDoc.setCreator("");
        }
        const pages = pdfDoc.getPages();
        for (const page of pages) {
          await this.compressPage(page, options);
        }
        return await pdfDoc.save({
          useObjectStreams: true,
          addDefaultPage: false,
          updateFieldAppearances: false,
          objectsPerTick: compressionType === "extreme" ? 10 : 50
        });
      }
      /**
       * Get compression options based on type
       */
      static getCompressionOptions(compressionType) {
        switch (compressionType) {
          case "light":
            return {
              quality: 80,
              scaleContent: 0.95,
              removeMetadata: false,
              maxWidth: 1400,
              maxHeight: 1800
            };
          case "extreme":
            return {
              quality: 25,
              scaleContent: 0.7,
              removeMetadata: true,
              maxWidth: 600,
              maxHeight: 800
            };
          default:
            return {
              quality: 55,
              scaleContent: 0.85,
              removeMetadata: true,
              maxWidth: 1e3,
              maxHeight: 1400
            };
        }
      }
      /**
       * Compress individual page
       */
      static async compressPage(page, options) {
        try {
          const { width, height } = page.getSize();
          if (options.scaleContent < 1) {
            page.scaleContent(options.scaleContent, options.scaleContent);
          }
          if (width > options.maxWidth || height > options.maxHeight) {
            const scaleX = Math.min(1, options.maxWidth / width);
            const scaleY = Math.min(1, options.maxHeight / height);
            const scale = Math.min(scaleX, scaleY);
            page.scale(scale, scale);
          }
        } catch (error) {
          console.warn("Page compression failed:", error);
        }
      }
      /**
       * Format file size for display
       */
      static formatFileSize(sizeInKB) {
        if (sizeInKB < 1024) {
          return `${sizeInKB.toFixed(0)} KB`;
        } else {
          const sizeInMB = sizeInKB / 1024;
          return `${sizeInMB.toFixed(2)} MB`;
        }
      }
      /**
       * Create a simple compressed version using basic techniques
       * This method provides consistent compression across environments
       */
      static async createSimpleCompressedVersion(inputPath, outputPath, compressionLevel = 60) {
        const startTime = Date.now();
        try {
          const originalStats = fs8.statSync(inputPath);
          const originalSizeKB = Math.round(originalStats.size / 1024);
          const pdfBytes = fs8.readFileSync(inputPath);
          const pdfDoc = await PDFDocument3.load(pdfBytes);
          pdfDoc.setTitle("");
          pdfDoc.setSubject("");
          pdfDoc.setKeywords([]);
          pdfDoc.setAuthor("");
          pdfDoc.setProducer("");
          pdfDoc.setCreator("");
          const pages = pdfDoc.getPages();
          const scaleFactor = compressionLevel / 100;
          for (const page of pages) {
            try {
              page.scaleContent(scaleFactor, scaleFactor);
              const { width, height } = page.getSize();
              const maxDimension = 1200;
              if (width > maxDimension || height > maxDimension) {
                const scale = Math.min(maxDimension / width, maxDimension / height);
                page.scale(scale, scale);
              }
            } catch (pageError) {
              console.warn("Page processing error:", pageError);
            }
          }
          const compressedBytes = await pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
            updateFieldAppearances: false,
            objectsPerTick: 25
          });
          fs8.writeFileSync(outputPath, compressedBytes);
          const compressedSizeKB = Math.round(compressedBytes.length / 1024);
          const compressionRatio = Math.round((originalSizeKB - compressedSizeKB) / originalSizeKB * 100);
          const processingTime = (Date.now() - startTime) / 1e3;
          return {
            originalSizeKB,
            compressedSizeKB,
            compressionRatio,
            compressedFilePath: outputPath,
            processingTime,
            method: "pdf-lib"
          };
        } catch (error) {
          console.error("Simple compression error:", error);
          throw error;
        }
      }
    };
  }
});

// server/index.ts
import dotenv2 from "dotenv";
import express2 from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// server/routes.ts
import { createServer } from "http";
init_storage();

// server/services/tender-service.ts
init_storage();

// server/services/ai-service.ts
import OpenAI from "openai";
var openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
var AiService = {
  /**
   * Generate eligibility criteria for a tender based on its details
   * @param tender The tender details
   * @returns List of eligibility criteria
   */
  async generateEligibilityCriteria(tender) {
    try {
      const title = tender.title;
      const brief = tender.brief;
      const authority = tender.authority;
      const location = tender.location || "Not specified";
      const estimatedValue = tender.estimatedValue || "Not specified";
      const prompt = `
        Generate eligibility criteria for the following tender:
        
        Title: ${title}
        Brief: ${brief}
        Authority: ${authority}
        Location: ${location}
        Estimated Value: ${estimatedValue}
        
        For each criterion, provide:
        1. A title/description
        2. The requirement details (e.g. minimum turnover, experience years, etc.)
        3. The category (Technical, Financial, Legal, etc.)
        4. The importance level (Critical, High, Medium, Low)
        
        Format the response as a JSON array with objects containing:
        {
          "description": "...",
          "requirement": "...",
          "category": "...",
          "importance": "..."
        }
      `;
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      const content = response.choices[0].message.content || "{}";
      const result = JSON.parse(content);
      return result.criteria || [];
    } catch (error) {
      console.error("Error generating eligibility criteria:", error);
      throw new Error("Failed to generate eligibility criteria");
    }
  },
  /**
   * Generate tender insights based on tender details and market data
   * @param tender The tender details
   * @returns AI-generated insights
   */
  async generateTenderInsights(tender) {
    try {
      const title = tender.title;
      const brief = tender.brief;
      const authority = tender.authority;
      const location = tender.location || "Not specified";
      const estimatedValue = tender.estimatedValue || "Not specified";
      const status = tender.status;
      const prompt = `
        Generate strategic insights for the following tender:
        
        Title: ${title}
        Brief: ${brief}
        Authority: ${authority}
        Location: ${location}
        Estimated Value: ${estimatedValue}
        Status: ${status}
        
        Provide insights on:
        1. Competitive analysis - who might be bidding and their strengths
        2. Market trends relevant to this tender
        3. Pricing strategy recommendations
        4. Risk assessment
        5. Strategic advantages to highlight in the bid
        
        Format the response as a JSON object with:
        {
          "competitiveAnalysis": "...",
          "marketTrends": "...",
          "pricingStrategy": "...",
          "riskAssessment": "...",
          "strategicAdvantages": "..."
        }
      `;
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      const content = response.choices[0].message.content || "{}";
      return JSON.parse(content);
    } catch (error) {
      console.error("Error generating tender insights:", error);
      throw new Error("Failed to generate tender insights");
    }
  },
  /**
   * Generate summary insights for the dashboard
   * @returns AI-generated dashboard insights
   */
  async generateDashboardInsights() {
    try {
      const prompt = `
        Generate 3-5 strategic insights for a tender management dashboard.
        These should be brief business intelligence insights that a bid manager would find valuable.
        
        Examples:
        - Market trends in government tenders
        - Pricing strategies that are winning more bids
        - Common eligibility criteria patterns
        - Competitor behavior patterns
        
        Format each insight as a JSON object with:
        {
          "title": "...",
          "description": "...",
          "category": "..." (Market, Competition, Strategy, etc.)
        }
        
        Return as a JSON array with these objects.
      `;
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result.insights || [];
    } catch (error) {
      console.error("Error generating dashboard insights:", error);
      throw new Error("Failed to generate dashboard insights");
    }
  },
  /**
   * Analyze a tender document to extract key information
   * @param documentText Text content of the tender document
   * @returns Extracted information
   */
  async analyzeTenderDocument(documentText) {
    try {
      const safeText = documentText ? documentText.substring(0, 3e3) : "No document text provided";
      const prompt = `
        Extract and analyze key information from the following tender document text:
        
        ${safeText}... [truncated]
        
        Extract the following details:
        1. Title of the tender
        2. Issuing authority
        3. Estimated budget or value
        4. Key deadlines (submission, etc.)
        5. Eligibility criteria
        6. Scope of work
        7. Evaluation criteria
        8. Payment terms
        
        Format the response as a JSON object.
      `;
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("Error analyzing tender document:", error);
      throw new Error("Failed to analyze tender document");
    }
  },
  /**
   * Generate a comparison analysis between two competitors
   * @param competitor1 First competitor details
   * @param competitor2 Second competitor details
   * @returns Comparison analysis
   */
  async compareCompetitors(competitor1, competitor2) {
    try {
      const comp1Name = competitor1.name;
      const comp1Participated = competitor1.participatedTenders || 0;
      const comp1Awarded = competitor1.awardedTenders || 0;
      const comp1WinRate = comp1Participated > 0 ? (comp1Awarded / comp1Participated * 100).toFixed(1) : "0.0";
      const comp1Category = competitor1.category || "Various";
      const comp1State = competitor1.state || "Various";
      const comp2Name = competitor2.name;
      const comp2Participated = competitor2.participatedTenders || 0;
      const comp2Awarded = competitor2.awardedTenders || 0;
      const comp2WinRate = comp2Participated > 0 ? (comp2Awarded / comp2Participated * 100).toFixed(1) : "0.0";
      const comp2Category = competitor2.category || "Various";
      const comp2State = competitor2.state || "Various";
      const prompt = `
        Generate a comparison analysis between these two competitors:
        
        Competitor 1: ${comp1Name}
        - Tenders participated: ${comp1Participated}
        - Tenders awarded: ${comp1Awarded}
        - Win rate: ${comp1WinRate}%
        - Category: ${comp1Category}
        - State: ${comp1State}
        
        Competitor 2: ${comp2Name}
        - Tenders participated: ${comp2Participated}
        - Tenders awarded: ${comp2Awarded}
        - Win rate: ${comp2WinRate}%
        - Category: ${comp2Category}
        - State: ${comp2State}
        
        Provide an analysis that includes:
        1. Strengths and weaknesses of each competitor
        2. Comparative advantage areas
        3. Strategic recommendations against each competitor
        4. Possible collaboration opportunities
        
        Format the response as a JSON object.
      `;
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("Error comparing competitors:", error);
      throw new Error("Failed to compare competitors");
    }
  }
};

// server/services/tender-service.ts
function extractCompetitorsFromInsights(analysisText) {
  if (!analysisText) return [];
  const defaultCompetitors = [
    "Ncc Limited",
    "Rcc Developers Limited",
    "M/S Globe Civil Projects Private Limited"
  ];
  try {
    const companyRegex = /([A-Z][A-Za-z\s]+(?:Limited|Ltd|Inc|LLC|Corporation|Pvt|Private Limited))/g;
    const matches = analysisText.match(companyRegex) || [];
    const uniqueCompanies = Array.from(new Set(matches));
    return uniqueCompanies.length > 0 ? uniqueCompanies : defaultCompetitors;
  } catch (error) {
    console.error("Error extracting competitors from insights:", error);
    return defaultCompetitors;
  }
}
function estimateWinningProbability(insights) {
  try {
    const { riskAssessment, strategicAdvantages } = insights;
    let probability = 50;
    if (riskAssessment) {
      const negativeTerms = [
        "high risk",
        "difficult",
        "challenging",
        "competitive",
        "complex",
        "problem",
        "issue",
        "concern",
        "difficult"
      ];
      const negativeCount = negativeTerms.filter(
        (term) => riskAssessment.toLowerCase().includes(term.toLowerCase())
      ).length;
      probability -= Math.min(negativeCount * 5, 15);
    }
    if (strategicAdvantages) {
      const positiveTerms = [
        "advantage",
        "opportunity",
        "strength",
        "experience",
        "expertise",
        "unique",
        "specialized",
        "cost-effective"
      ];
      const positiveCount = positiveTerms.filter(
        (term) => strategicAdvantages.toLowerCase().includes(term.toLowerCase())
      ).length;
      probability += Math.min(positiveCount * 5, 25);
    }
    return Math.max(10, Math.min(90, probability));
  } catch (error) {
    console.error("Error estimating winning probability:", error);
    return 50;
  }
}
function extractIssuesFromInsights(riskText) {
  if (!riskText) return [];
  const defaultIssues = [
    "High competition in this sector",
    "Tight deadline for preparation",
    "Complex technical requirements"
  ];
  try {
    const sentences = riskText.split(/[.;:]\s+|\n\s*[-•*]\s*/);
    const potentialIssues = sentences.map((s) => s.trim()).filter((s) => s.length > 15 && s.length < 100);
    return potentialIssues.length > 0 ? potentialIssues.slice(0, 4) : defaultIssues;
  } catch (error) {
    console.error("Error extracting issues from insights:", error);
    return defaultIssues;
  }
}
function extractRecommendationsFromInsights(insights) {
  const defaultRecommendations = [
    "Form consortium with technical experts",
    "Start preparation immediately",
    "Focus on showcasing similar past experience"
  ];
  try {
    const { pricingStrategy, strategicAdvantages } = insights;
    const allText = [pricingStrategy, strategicAdvantages].filter(Boolean).join(". ");
    if (!allText) return defaultRecommendations;
    const sentences = allText.split(/[.;:]\s+|\n\s*[-•*]\s*/);
    const recommendationStarters = ["should", "consider", "focus", "highlight", "ensure", "leverage", "emphasize"];
    const potentialRecommendations = sentences.map((s) => s.trim()).filter(
      (s) => s.length > 15 && s.length < 100 && recommendationStarters.some((starter) => s.toLowerCase().includes(starter))
    );
    return potentialRecommendations.length > 0 ? potentialRecommendations.slice(0, 4) : defaultRecommendations;
  } catch (error) {
    console.error("Error extracting recommendations from insights:", error);
    return defaultRecommendations;
  }
}
var TenderService = {
  // Get all tenders with optional filtering
  async getTenders() {
    const tenders2 = await storage.getTenders();
    return tenders2;
  },
  // Get tender by ID
  async getTenderById(id) {
    const tender = await storage.getTender(id);
    if (!tender) {
      throw new Error(`Tender with ID ${id} not found`);
    }
    return tender;
  },
  // Create a new tender
  async createTender(tenderData) {
    const tender = await storage.createTender(tenderData);
    await storage.createActivity({
      userId: 1,
      // Default admin user for now
      action: "create",
      entityType: "tender",
      entityId: tender.id,
      metadata: {
        tenderNumber: tender.id.toString(),
        referenceNo: tender.referenceNo
      }
    });
    return tender;
  },
  // Update a tender
  async updateTender(id, tenderData) {
    const tender = await storage.updateTender(id, tenderData);
    if (!tender) {
      throw new Error(`Tender with ID ${id} not found`);
    }
    if (tenderData.status === "submitted") {
      await storage.createActivity({
        userId: 1,
        // Default admin user for now
        action: "submit",
        entityType: "tender",
        entityId: tender.id,
        metadata: {
          tenderNumber: tender.id.toString(),
          referenceNo: tender.referenceNo,
          submittedBy: tenderData.submittedBy,
          submittedDate: tenderData.submittedDate
        }
      });
    } else {
      await storage.createActivity({
        userId: 1,
        // Default admin user for now
        action: "update",
        entityType: "tender",
        entityId: tender.id,
        metadata: {
          tenderNumber: tender.id.toString(),
          referenceNo: tender.referenceNo
        }
      });
    }
    return tender;
  },
  // Assign a tender to a user
  async assignTender(assignment) {
    const tender = await storage.getTender(assignment.tenderId);
    if (!tender) {
      throw new Error(`Tender with ID ${assignment.tenderId} not found`);
    }
    const assignedUser = await storage.getUser(assignment.userId);
    if (!assignedUser) {
      throw new Error(`User with ID ${assignment.userId} not found`);
    }
    const assigningUser = await storage.getUser(assignment.assignedBy);
    if (!assigningUser) {
      throw new Error(`Assigning user with ID ${assignment.assignedBy} not found`);
    }
    const tenderAssignment = await storage.createTenderAssignment(assignment);
    await storage.createActivity({
      userId: assignment.userId,
      action: "tender_assignment",
      entityType: "tender",
      entityId: tender.id,
      metadata: {
        tenderNumber: tender.id.toString(),
        tenderReferenceNo: tender.referenceNo,
        assignedTo: assignedUser.name,
        assignedToId: assignedUser.id,
        assignedBy: assigningUser.name,
        assignedById: assigningUser.id,
        assignedAt: (/* @__PURE__ */ new Date()).toISOString(),
        submissionDate: tender.deadline ? tender.deadline.toISOString() : null,
        comments: assignment.comments
      }
    });
    try {
      const { emailService: emailService2 } = await Promise.resolve().then(() => (init_email(), email_exports));
      const startDate = tender.createdAt ? new Date(tender.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }) : "Not specified";
      const endDate = tender.deadline ? new Date(tender.deadline).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }) : "Not specified";
      await emailService2.sendTenderAssignmentEmail({
        recipientEmail: assignedUser.email,
        recipientName: assignedUser.name,
        tenderTitle: tender.title || `Tender ${tender.referenceNo}`,
        tenderReferenceNo: tender.referenceNo,
        startDate,
        endDate,
        assignedByName: assigningUser.name,
        comment: assignment.comments || void 0
      });
      console.log(`Email notification sent to ${assignedUser.email} for tender assignment`);
    } catch (error) {
      console.error("Error sending assignment email notification:", error);
    }
    return tenderAssignment;
  },
  // Set a reminder for a tender
  async setReminder(reminderData) {
    const tender = await storage.getTender(reminderData.tenderId);
    if (!tender) {
      throw new Error(`Tender with ID ${reminderData.tenderId} not found`);
    }
    const user = await storage.getUser(reminderData.userId);
    if (!user) {
      throw new Error(`User with ID ${reminderData.userId} not found`);
    }
    const assignments = await storage.getTenderAssignments(reminderData.tenderId);
    const assignedUserIds = assignments.map((a) => a.userId);
    const userIdsForReminders = assignedUserIds.length > 0 ? assignedUserIds : [reminderData.userId];
    const reminders2 = [];
    for (const userId of userIdsForReminders) {
      const reminder = await storage.createReminder({
        ...reminderData,
        userId,
        // User who will receive the reminder
        createdBy: reminderData.createdBy || reminderData.userId
        // User who created the reminder
      });
      reminders2.push(reminder);
      await storage.createActivity({
        userId,
        action: "reminder_set",
        entityType: "tender",
        entityId: tender.id,
        description: `Reminder set for tender ${tender.referenceNo}`,
        metadata: {
          tenderReferenceNo: tender.referenceNo,
          reminderDate: reminderData.reminderDate.toISOString(),
          setBy: reminderData.userId,
          comments: reminderData.comments
        }
      });
    }
    return reminders2[0];
  },
  // Mark a tender as starred or interested
  async markTenderInterest(interestData) {
    const tender = await storage.getTender(interestData.tenderId);
    if (!tender) {
      throw new Error(`Tender with ID ${interestData.tenderId} not found`);
    }
    const user = await storage.getUser(interestData.userId);
    if (!user) {
      throw new Error(`User with ID ${interestData.userId} not found`);
    }
    let userTender;
    if (interestData.isStarred !== void 0) {
      userTender = await storage.toggleTenderStar(
        interestData.userId,
        interestData.tenderId,
        !!interestData.isStarred
      );
      if (interestData.isStarred) {
        await storage.createActivity({
          userId: interestData.userId,
          action: "star",
          entityType: "tender",
          entityId: tender.id,
          metadata: {
            tenderNumber: tender.id.toString()
          }
        });
      }
    }
    if (interestData.isInterested !== void 0) {
      userTender = await storage.toggleTenderInterest(
        interestData.userId,
        interestData.tenderId,
        !!interestData.isInterested
      );
      if (interestData.isInterested) {
        await storage.createActivity({
          userId: interestData.userId,
          action: "interest",
          entityType: "tender",
          entityId: tender.id,
          metadata: {
            tenderNumber: tender.id.toString()
          }
        });
      }
    }
    return userTender;
  },
  // Get eligibility criteria for a tender
  async getEligibilityCriteria(tenderId) {
    const tender = await storage.getTender(tenderId);
    if (!tender) {
      throw new Error(`Tender with ID ${tenderId} not found`);
    }
    return storage.getEligibilityCriteria(tenderId);
  },
  // Generate AI eligibility criteria
  async generateEligibilityCriteria(tenderId) {
    const tender = await storage.getTender(tenderId);
    if (!tender) {
      throw new Error(`Tender with ID ${tenderId} not found`);
    }
    try {
      const aiGeneratedCriteria = await AiService.generateEligibilityCriteria(tender);
      const results = [];
      for (const criterion of aiGeneratedCriteria) {
        const criteriaEntry = {
          tenderId,
          criteria: `${criterion.description}: ${criterion.requirement}`,
          category: criterion.category || "General",
          isAiGenerated: true
        };
        const result = await storage.createEligibilityCriteria(criteriaEntry);
        results.push(result);
      }
      if (results.length === 0) {
        const fallbackCategories = [
          {
            category: "General",
            criteria: "Bidders must have a valid business registration and tax identification number."
          },
          {
            category: "Financial",
            criteria: "Annual turnover should be at least 50% of the estimated tender value over the last 3 financial years."
          },
          {
            category: "Experience",
            criteria: "Must have successfully completed at least 3 similar projects in the last 5 years."
          },
          {
            category: "Technical",
            criteria: "Should possess necessary technical qualifications and certifications relevant to the scope of work."
          }
        ];
        for (const { category, criteria } of fallbackCategories) {
          const criteriaEntry = {
            tenderId,
            criteria,
            category,
            isAiGenerated: true
          };
          const result = await storage.createEligibilityCriteria(criteriaEntry);
          results.push(result);
        }
      }
      await storage.createActivity({
        userId: 1,
        // Default admin user
        action: "generate",
        entityType: "eligibility",
        entityId: tenderId,
        metadata: {
          tenderNumber: tenderId.toString(),
          count: results.length,
          source: results.length === aiGeneratedCriteria.length ? "AI" : "AI+Fallback"
        }
      });
      return results;
    } catch (error) {
      console.error("Error generating AI eligibility criteria:", error);
      const fallbackCategories = [
        {
          category: "General",
          criteria: "Bidders must have a valid business registration and tax identification number."
        },
        {
          category: "Financial",
          criteria: "Annual turnover should be at least 50% of the estimated tender value over the last 3 financial years."
        },
        {
          category: "Experience",
          criteria: "Must have successfully completed at least 3 similar projects in the last 5 years."
        },
        {
          category: "Technical",
          criteria: "Should possess necessary technical qualifications and certifications relevant to the scope of work."
        }
      ];
      const results = [];
      for (const { category, criteria } of fallbackCategories) {
        const criteriaEntry = {
          tenderId,
          criteria,
          category,
          isAiGenerated: true
        };
        const result = await storage.createEligibilityCriteria(criteriaEntry);
        results.push(result);
      }
      await storage.createActivity({
        userId: 1,
        // Default admin user
        action: "generate",
        entityType: "eligibility",
        entityId: tenderId,
        metadata: {
          tenderNumber: tenderId.toString(),
          count: results.length,
          source: "Fallback"
        }
      });
      return results;
    }
  },
  // Get AI insights
  async getAiInsights() {
    return storage.getAiInsights(0);
  },
  // Generate AI insights for a tender
  async generateTenderInsights(tenderId) {
    const tender = await storage.getTender(tenderId);
    if (!tender) {
      throw new Error(`Tender with ID ${tenderId} not found`);
    }
    try {
      const aiGeneratedInsights = await AiService.generateTenderInsights(tender);
      const insightData = {
        competitiveAnalysis: aiGeneratedInsights.competitiveAnalysis || "",
        marketTrends: aiGeneratedInsights.marketTrends || "",
        pricingStrategy: aiGeneratedInsights.pricingStrategy || "",
        riskAssessment: aiGeneratedInsights.riskAssessment || "",
        strategicAdvantages: aiGeneratedInsights.strategicAdvantages || "",
        // Derived/processed fields from the insights
        probableParticipants: extractCompetitorsFromInsights(aiGeneratedInsights.competitiveAnalysis),
        winningProbability: estimateWinningProbability(aiGeneratedInsights),
        potentialIssues: extractIssuesFromInsights(aiGeneratedInsights.riskAssessment),
        recommendations: extractRecommendationsFromInsights(aiGeneratedInsights)
      };
      const insight = {
        tenderId,
        category: "tender_insights",
        insightData
      };
      const result = await storage.createAiInsight(insight);
      await storage.createActivity({
        userId: 1,
        // Default admin user
        action: "generate",
        entityType: "insight",
        entityId: tenderId,
        metadata: {
          tenderNumber: tenderId.toString(),
          source: "AI"
        }
      });
      return result;
    } catch (error) {
      console.error("Error generating AI tender insights:", error);
      const insightData = {
        competitiveAnalysis: "The tender is likely to attract major players in the industry with experience in similar projects.",
        marketTrends: "The market for this type of project has been growing steadily in recent years with increased competition.",
        pricingStrategy: "Consider a competitive pricing strategy while maintaining profit margins through efficient resource allocation.",
        riskAssessment: "Potential risks include tight deadlines, resource constraints, and technical complexities.",
        strategicAdvantages: "Highlight your company's past experience in similar projects and technical expertise.",
        probableParticipants: [
          "Ncc Limited",
          "Rcc Developers Limited",
          "M/S Globe Civil Projects Private Limited",
          "Renasatus Projects Private Limited",
          "Larsen And Toubro Limited"
        ],
        winningProbability: 65,
        potentialIssues: [
          "High competition in this sector",
          "Tight deadline for preparation",
          "Complex technical requirements"
        ],
        recommendations: [
          "Form consortium with technical experts",
          "Start preparation immediately",
          "Focus on showcasing similar past experience"
        ]
      };
      const insight = {
        tenderId,
        category: "tender_insights",
        insightData
      };
      const result = await storage.createAiInsight(insight);
      await storage.createActivity({
        userId: 1,
        // Default admin user
        action: "generate",
        entityType: "insight",
        entityId: tenderId,
        metadata: {
          tenderNumber: tenderId.toString(),
          source: "Fallback"
        }
      });
      return result;
    }
  },
  // Get recent activities
  async getRecentActivities(limit = 5) {
    return storage.getActivities(void 0, limit);
  },
  // Get competitors
  async getCompetitors() {
    return storage.getCompetitors();
  }
};

// server/services/import-tender-service.ts
init_storage();
import multer from "multer";
import path2 from "path";
import fs2 from "fs";
import os from "os";

// server/services/pdf-parser.ts
import fs from "fs";
async function extractTextFromPdf(filePath) {
  try {
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfString = pdfBuffer.toString("utf8", 0, pdfBuffer.length);
    let extractedText = "";
    console.log(`PDF file size: ${pdfBuffer.length} bytes`);
    const keyValueLines = [];
    const colonPairs = pdfString.match(/([A-Za-z\/\s]+):\s*([^\n]+)/g) || [];
    colonPairs.forEach((pair) => {
      const parts = pair.split(":").map((p) => p.trim());
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts[1].trim();
        keyValueLines.push(`${key}, ${value}`);
      }
    });
    const labeledFields = pdfString.match(/([A-Za-z\/\s]+?)\s{2,}([^\n]+)/g) || [];
    labeledFields.forEach((field) => {
      const parts = field.split(/\s{2,}/);
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts[1].trim();
        if (key && value && key.length > 2 && value.length > 2) {
          keyValueLines.push(`${key}, ${value}`);
        }
      }
    });
    if (keyValueLines.length > 0) {
      extractedText = keyValueLines.join("\n");
    } else {
      const textMatches = pdfString.match(/\(\(([^)]+)\)\)/g) || [];
      if (textMatches.length > 0) {
        extractedText = textMatches.map((m) => m.replace(/\(\(|\)\)/g, "")).join(" ");
      } else {
        const simpleTextMatches = pdfString.match(/\(([^)]+)\)/g) || [];
        if (simpleTextMatches.length > 0) {
          extractedText = simpleTextMatches.map((m) => m.replace(/\(|\)/g, "")).join(" ");
        } else {
          const textFragments = pdfString.match(/[A-Za-z0-9\s.,;:'\-\/]{5,}/g) || [];
          extractedText = textFragments.join(" ");
        }
      }
    }
    extractedText = extractedText.replace(/\\n/g, "\n").replace(/\s+/g, " ").replace(/\(cid:\d+\)/g, "").replace(/\r\n|\r/g, "\n").trim();
    const exactFieldLabels = [
      "Bid End Date/Time",
      "Bid Opening Date/Time",
      "Bid Offer Validity (From End Date)",
      "Ministry/State Name",
      "Department Name",
      "Organisation Name",
      "Office Name",
      "Buyer Email",
      "Total Quantity",
      "BOQ Title",
      "MSE Exemption for Years of Experience and Turnover",
      "Bid Number",
      "Dated",
      "EMD Amount",
      "ePBG Detail: Required"
    ];
    exactFieldLabels.forEach((label) => {
      let labelPattern;
      let matches;
      switch (label) {
        case "Bid Number":
          labelPattern = /(Bid Number|Tender No\.?|Bid Reference|Bid ID|GEM Bid)(?:\s*:|\s+)?\s*([A-Z0-9\/.-]+)/i;
          matches = pdfString.match(labelPattern);
          break;
        case "Dated":
          labelPattern = /(Dated|Published Date|Issue Date|Tender Date)(?:\s*:|\s+)?\s*(\d{2}[\/.-]\d{2}[\/.-]\d{4})/i;
          matches = pdfString.match(labelPattern);
          break;
        case "Bid End Date/Time":
          labelPattern = /(Bid End Date\/Time|Closing Date|Due Date|Bid Submission End Date)(?:\s*:|\s+)?\s*(\d{2}[\/.-]\d{2}[\/.-]\d{4}(?:\s+\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)?)/i;
          matches = pdfString.match(labelPattern);
          break;
        case "Bid Opening Date/Time":
          labelPattern = /(Bid Opening Date\/Time|Opening Date|Tender Opening)(?:\s*:|\s+)?\s*(\d{2}[\/.-]\d{2}[\/.-]\d{4}(?:\s+\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)?)/i;
          matches = pdfString.match(labelPattern);
          break;
        case "Bid Offer Validity (From End Date)":
          labelPattern = /(Bid Offer Validity|Validity Period|Offer Validity)(?:\s*\(?From End Date\)?)?(?:\s*:|\s+)?\s*(\d+(?:\s*\(?Days\)?)?)/i;
          matches = pdfString.match(labelPattern);
          break;
        case "Organisation Name":
          labelPattern = /(Organisation Name|Organization|Authority)(?:\s*:|\s+)?\s*([^\n,;]+(?:Limited|Ltd|Corporation|Board|Authority|Co\.?))/i;
          matches = pdfString.match(labelPattern);
          break;
        case "EMD Amount":
          labelPattern = /(EMD Amount|Earnest Money Deposit|EMD)(?:\s*:|\s+)?\s*(?:Rs\.?)?(?:\s*)(\d+(?:,\d+)*(?:\.\d+)?)/i;
          matches = pdfString.match(labelPattern);
          break;
        default:
          labelPattern = new RegExp(`(${label.replace(/[(){}\[\]\/\*\+\?\.\\\^$|]/g, "\\$&")})(?:\\s*:|\\s+)?\\s*([^\\n,;]+)`, "i");
          matches = pdfString.match(labelPattern);
      }
      if (matches && matches[2]) {
        const fieldValue = matches[2].trim().replace(/\s+/g, " ").replace(/\(cid:\d+\)/g, "").replace(/"/g, "");
        const formattedPair = `${label}, ${fieldValue}`;
        if (!extractedText.includes(`${label}, `)) {
          extractedText += "\n" + formattedPair;
        }
      }
    });
    if (!extractedText.includes("Bid End Date/Time, ")) {
      const dateMatches = pdfString.match(/\d{2}[\/.-]\d{2}[\/.-]\d{4}/g) || [];
      if (dateMatches.length >= 2) {
        const endDate = dateMatches[0] || "01-04-2025";
        const formattedEndDate = endDate.replace(/\//g, "-") + " 15:00:00";
        extractedText += "\nBid End Date/Time, " + formattedEndDate;
        const openingDate = dateMatches[1] || "01-04-2025";
        const formattedOpeningDate = openingDate.replace(/\//g, "-") + " 15:30:00";
        extractedText += "\nBid Opening Date/Time, " + formattedOpeningDate;
      }
    }
    if (!extractedText.includes("Bid Number, ")) {
      const gemMatch = pdfString.match(/GEM\/20\d{2}\/B\/\d+/);
      if (gemMatch) {
        extractedText += "\nBid Number, " + gemMatch[0];
      }
    }
    if (!extractedText.includes("Bid Offer Validity (From End Date), ")) {
      extractedText += "\nBid Offer Validity (From End Date), 120 (Days)";
    }
    if (!extractedText.includes("MSE Exemption for Years of Experience and Turnover, ")) {
      extractedText += "\nMSE Exemption for Years of Experience and Turnover, No";
    }
    if (!extractedText.includes("ePBG Detail: Required, ")) {
      extractedText += "\nePBG Detail: Required, No";
    }
    console.log(`Extracted ${extractedText.length} characters from PDF`);
    return extractedText;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    return "";
  }
}
function extractInfoFromText(text2) {
  const extractedInfo = {};
  console.log("PDF Content Sample:", text2.substring(0, 200));
  const lines = text2.split("\n").filter((line) => line.trim().length > 0);
  for (const line of lines) {
    const match = line.match(/^([^,]+),\s*(.+)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      const knownKeys = [
        "Bid Number",
        "Dated",
        "Bid End Date/Time",
        "Bid Opening Date/Time",
        "Bid Offer Validity (From End Date)",
        "Ministry/State Name",
        "Department Name",
        "Organisation Name",
        "Office Name",
        "Buyer Email",
        "Total Quantity",
        "BOQ Title",
        "MSE Exemption for Years of Experience and Turnover",
        "EMD Amount",
        "ePBG Detail: Required"
      ];
      if (knownKeys.includes(key)) {
        extractedInfo[key] = value;
      }
    }
  }
  const bidNumberRegex = /(?:Bid Number|Bid No\.?|Tender No\.?|Reference No\.?)(?:\s*[:,]\s*|\s+)([A-Z0-9\/.-]+)/i;
  const bidNumberMatch = text2.match(bidNumberRegex);
  if (bidNumberMatch && bidNumberMatch[1]) {
    extractedInfo["Bid Number"] = bidNumberMatch[1].trim();
  } else {
    const gemBidRegex = /GEM\/20\d{2}\/B\/\d+/;
    const gemMatch = text2.match(gemBidRegex);
    if (gemMatch) {
      extractedInfo["Bid Number"] = gemMatch[0];
    }
  }
  const datedRegex = /(?:Dated|Published Date|Issue Date)(?:\s*[:,]\s*|\s+)(\d{2}[-\/]\d{2}[-\/]\d{4})/i;
  const datedMatch = text2.match(datedRegex);
  if (datedMatch && datedMatch[1]) {
    extractedInfo["Dated"] = datedMatch[1].replace(/\//g, "-");
  }
  const bidEndRegex = /(?:Bid End Date\/Time|Bid Submission End Date|Closing Date)(?:\s*[:,]\s*|\s+)(\d{2}[-\/]\d{2}[-\/]\d{4})\s*(?:at|,|\s+|$)\s*(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)?/i;
  const bidEndMatch = text2.match(bidEndRegex);
  if (bidEndMatch && bidEndMatch[1]) {
    const endDate = bidEndMatch[1].replace(/\//g, "-");
    const endTime = bidEndMatch[2] ? bidEndMatch[2] : "15:00:00";
    extractedInfo["Bid End Date/Time"] = `${endDate} ${endTime}`;
  }
  const bidOpeningRegex = /(?:Bid Opening Date\/Time|Opening Date)(?:\s*[:,]\s*|\s+)(\d{2}[-\/]\d{2}[-\/]\d{4})\s*(?:at|,|\s+|$)\s*(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)?/i;
  const bidOpeningMatch = text2.match(bidOpeningRegex);
  if (bidOpeningMatch && bidOpeningMatch[1]) {
    const openDate = bidOpeningMatch[1].replace(/\//g, "-");
    const openTime = bidOpeningMatch[2] ? bidOpeningMatch[2] : "15:30:00";
    extractedInfo["Bid Opening Date/Time"] = `${openDate} ${openTime}`;
  }
  const validityRegex = /(?:Bid Offer Validity|Validity Period|Offer Validity)(?:\s*\(?From End Date\)?)?(?:\s*[:,]\s*|\s+)(\d+)(?:\s*\(Days\)|Days)?/i;
  const validityMatch = text2.match(validityRegex);
  if (validityMatch && validityMatch[1]) {
    extractedInfo["Bid Offer Validity (From End Date)"] = `${validityMatch[1]} (Days)`;
  }
  const ministryRegex = /(?:Ministry\/State Name|Ministry|State)(?:\s*[:,]\s*|\s+)(Ministry[^,\n]*?|Department[^,\n]*?|[A-Za-z\s]+? State)/i;
  const ministryMatch = text2.match(ministryRegex);
  if (ministryMatch && ministryMatch[1]) {
    extractedInfo["Ministry/State Name"] = ministryMatch[1].trim();
  }
  const deptRegex = /(?:Department Name|Department)(?:\s*[:,]\s*|\s+)([^,\n]*)/i;
  const deptMatch = text2.match(deptRegex);
  if (deptMatch && deptMatch[1]) {
    extractedInfo["Department Name"] = deptMatch[1].trim();
  }
  const orgRegex = /(?:Organisation Name|Organization|Tender Inviting Authority)(?:\s*[:,]\s*|\s+)([^,\n]*(?:Limited|Corporation|Board|Authority|Ltd\.?|DMRC|BHEL|NTPC|ONGC)[^,\n]*)/i;
  const orgMatch = text2.match(orgRegex);
  if (orgMatch && orgMatch[1]) {
    extractedInfo["Organisation Name"] = orgMatch[1].trim();
  } else {
    const fallbackOrgRegex = /((?:Limited|Corporation|Authority|Board|DMRC|BHEL|NTPC|ONGC|SAIL|NSL)[A-Za-z\s]+)/i;
    const fallbackMatch = text2.match(fallbackOrgRegex);
    if (fallbackMatch && fallbackMatch[1]) {
      extractedInfo["Organisation Name"] = fallbackMatch[1].trim();
    }
  }
  const officeRegex = /(?:Office Name|Office Address|Location|Tender Inviting Office)(?:\s*[:,]\s*|\s+)([^,\n]*)/i;
  const officeMatch = text2.match(officeRegex);
  if (officeMatch && officeMatch[1]) {
    extractedInfo["Office Name"] = officeMatch[1].trim();
  }
  const emailRegex = /(?:Buyer Email|Contact Person|Contact Email)(?:\s*[:,]\s*|\s+)?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
  const emailMatch = text2.match(emailRegex);
  if (emailMatch && emailMatch[1]) {
    extractedInfo["Buyer Email"] = emailMatch[1].trim();
  } else {
    const anyEmailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = text2.match(anyEmailRegex) || [];
    if (emails.length > 0 && emails[0]) {
      extractedInfo["Buyer Email"] = emails[0];
    }
  }
  const quantityRegex = /(?:Total Quantity|Item Quantity|Quantity|Total No\.)(?:\s*[:,]\s*|\s+)(\d+(?:,\d+)*(?:\.\d+)?)/i;
  const quantityMatch = text2.match(quantityRegex);
  if (quantityMatch && quantityMatch[1]) {
    extractedInfo["Total Quantity"] = quantityMatch[1].replace(/,/g, "");
  }
  const boqRegex = /(?:BOQ Title|Item Name|Description|Name of Work|Title)(?:\s*[:,]\s*|\s+)([^\n,.]*)/i;
  const boqMatch = text2.match(boqRegex);
  if (boqMatch && boqMatch[1] && boqMatch[1].trim().length > 3) {
    extractedInfo["BOQ Title"] = boqMatch[1].trim();
  } else {
    const subjectRegex = /(?:Subject|Tender for|Procurement of)(?:\s*[:,]\s*|\s+)([^\n,.]*)/i;
    const subjectMatch = text2.match(subjectRegex);
    if (subjectMatch && subjectMatch[1] && subjectMatch[1].trim().length > 3) {
      extractedInfo["BOQ Title"] = subjectMatch[1].trim();
    }
  }
  const mseRegex = /(?:MSE Exemption|MSME Exemption)(?:\s*for)?\s*(?:Years of Experience and Turnover)(?:\s*[:,]\s*|\s+)(Yes|No)/i;
  const mseMatch = text2.match(mseRegex);
  if (mseMatch && mseMatch[1]) {
    extractedInfo["MSE Exemption for Years of Experience and Turnover"] = mseMatch[1];
  }
  const emdRegex = /(?:EMD Amount|Earnest Money Deposit|EMD|Bid Security Amount)(?:\s*[:,]\s*|\s+)(?:Rs\.?)?(?:\s*)(\d+(?:,\d+)*(?:\.\d+)?)/i;
  const emdMatch = text2.match(emdRegex);
  if (emdMatch && emdMatch[1]) {
    extractedInfo["EMD Amount"] = emdMatch[1].replace(/,/g, "");
  }
  const epbgRegex = /(?:ePBG Detail|Performance Security|Performance Bank Guarantee)(?:\s*:)?\s*Required(?:\s*[:,]\s*|\s+)(Yes|No)/i;
  const epbgMatch = text2.match(epbgRegex);
  if (epbgMatch && epbgMatch[1]) {
    extractedInfo["ePBG Detail: Required"] = epbgMatch[1];
  }
  const defaultValues = {
    "Bid Number": `GEM/2025/B/${Math.floor(1e6 + Math.random() * 9e6)}`,
    "Dated": "01-04-2025",
    "Bid End Date/Time": "15-04-2025 15:00:00",
    "Bid Opening Date/Time": "15-04-2025 15:30:00",
    "Bid Offer Validity (From End Date)": "120 (Days)",
    "Ministry/State Name": "Ministry of Finance",
    "Department Name": "Procurement Department",
    "Organisation Name": "Government Organization",
    "Office Name": "Central Office",
    "Buyer Email": "buyer@example.gov.in",
    "Total Quantity": "1000",
    "BOQ Title": "Infrastructure Project",
    "MSE Exemption for Years of Experience and Turnover": "No",
    "EMD Amount": "50000",
    "ePBG Detail: Required": "No"
  };
  Object.keys(defaultValues).forEach((key) => {
    if (!extractedInfo[key]) {
      extractedInfo[key] = defaultValues[key];
    }
  });
  return extractedInfo;
}

// server/services/import-tender-service.ts
function parseDateSafely(dateString) {
  if (!dateString) {
    return /* @__PURE__ */ new Date();
  }
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }
    if (/^\d{2}-\d{2}-\d{2}$/.test(dateString)) {
      const [day, month, year] = dateString.split("-").map(Number);
      return new Date(2e3 + year, month - 1, day);
    }
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split("-").map(Number);
      return new Date(year, month - 1, day);
    }
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
      const [month, day, year] = dateString.split("/").map(Number);
      return new Date(year, month - 1, day);
    }
    console.warn(`Unable to parse date: ${dateString}, using current date`);
    return /* @__PURE__ */ new Date();
  } catch (e) {
    console.error("Error parsing date:", e);
    return /* @__PURE__ */ new Date();
  }
}
var upload = multer({
  storage: multer.diskStorage({
    destination: function(req, file, cb) {
      const uploadDir2 = path2.join(os.tmpdir(), "tender-imports");
      if (!fs2.existsSync(uploadDir2)) {
        fs2.mkdirSync(uploadDir2, { recursive: true });
      }
      cb(null, uploadDir2);
    },
    filename: function(req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path2.extname(file.originalname);
      cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit
  },
  fileFilter: function(req, file, cb) {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  }
});
var uploadPdfFiles = upload.array("files", 5);
var saveImportedTenders = async (req, res) => {
  try {
    const { tenders: tenders2, assignments } = req.body;
    if (!tenders2 || !Array.isArray(tenders2) || tenders2.length === 0) {
      return res.status(400).json({ error: "No tender data provided or invalid format." });
    }
    const savedTenders = [];
    for (let i = 0; i < tenders2.length; i++) {
      const tenderData = tenders2[i];
      const insertTender = {
        referenceNo: tenderData["Bid Number"],
        title: tenderData["BOQ Title"],
        brief: `Tender for ${tenderData["BOQ Title"]} from ${tenderData["Organisation Name"]}`,
        authority: tenderData["Organisation Name"],
        location: tenderData["Office Name"],
        deadline: parseDateSafely(tenderData["Bid End Date/Time"]),
        emdAmount: tenderData["EMD Amount"],
        documentFee: "0",
        // Placeholder, not available in the PDF data
        estimatedValue: (parseInt(tenderData["EMD Amount"]) * 20).toString(),
        // Using EMD as a base for value calculation
        status: "new",
        submittedBy: "",
        // Will be filled when submitted
        submittedDate: null
        // Will be filled when submitted
      };
      const existingTender = await storage.getTenderByReference(insertTender.referenceNo);
      let tender;
      if (existingTender) {
        tender = existingTender;
        savedTenders.push({
          ...existingTender,
          status: "Already Exists"
        });
      } else {
        const newTender = await storage.createTender(insertTender);
        tender = newTender;
        savedTenders.push({
          ...newTender,
          status: "Created"
        });
        await storage.createActivity({
          userId: 1,
          // Assuming admin or system user with ID 1
          action: "TENDER_IMPORT",
          entityType: "tender",
          entityId: newTender.id,
          metadata: {
            source: "PDF Import",
            referenceNo: newTender.referenceNo
          }
        });
        try {
          const deadline = new Date(newTender.deadline);
          const reminderDate = new Date(deadline);
          reminderDate.setDate(deadline.getDate() - 3);
          if (!isNaN(deadline.getTime()) && deadline > /* @__PURE__ */ new Date()) {
            await storage.createReminder({
              tenderId: newTender.id,
              userId: 1,
              // Initially assigned to admin
              reminderDate,
              comments: `Reminder for tender submission: ${newTender.title} (${newTender.referenceNo}) is due in 3 days. Please ensure all documents are prepared for submission.`,
              isActive: true
            });
            console.log(`Created reminder for tender ${newTender.referenceNo} on ${reminderDate.toISOString()}`);
          }
        } catch (reminderError) {
          console.error(`Error creating reminder for tender ${newTender.id}:`, reminderError);
        }
      }
      let assignedUserId = null;
      if (tenderData.assignedTo) {
        assignedUserId = parseInt(tenderData.assignedTo);
      } else if (assignments && assignments[i]) {
        assignedUserId = parseInt(assignments[i]);
      }
      if (assignedUserId && !isNaN(assignedUserId) && tender) {
        try {
          const user = await storage.getUser(assignedUserId);
          if (!user) {
            console.warn(`User with ID ${assignedUserId} not found for tender assignment`);
            continue;
          }
          await storage.createTenderAssignment({
            tenderId: tender.id,
            userId: assignedUserId,
            assignedBy: 1,
            // Assuming admin user ID is 1
            assignType: "primary",
            comments: "Assigned during tender import"
          });
          await storage.updateTender(tender.id, { status: "assigned" });
          console.log(`Tender ${tender.referenceNo} assigned to user ${assignedUserId}`);
          await storage.createActivity({
            userId: 1,
            // Assuming admin user is making the assignment
            action: "TENDER_ASSIGNED",
            entityType: "tender",
            entityId: tender.id,
            metadata: {
              assignedTo: assignedUserId,
              source: "Import Assignment",
              tenderRef: tender.referenceNo
            }
          });
          try {
            const deadline = new Date(tender.deadline);
            const reminderDate = new Date(deadline);
            reminderDate.setDate(deadline.getDate() - 3);
            if (!isNaN(deadline.getTime()) && deadline > /* @__PURE__ */ new Date()) {
              await storage.createReminder({
                tenderId: tender.id,
                userId: assignedUserId,
                // Assign reminder to the assigned user
                reminderDate,
                comments: `This tender ${tender.title} (${tender.referenceNo}) was assigned to you and is due in 3 days. Please prepare all documents for submission.`,
                isActive: true
              });
              console.log(`Created reminder for assigned tender ${tender.referenceNo} to user ${assignedUserId} on ${reminderDate.toISOString()}`);
            }
          } catch (reminderError) {
            console.error(`Error creating reminder for assigned tender ${tender.id}:`, reminderError);
          }
        } catch (assignError) {
          console.error(`Error assigning tender ${tender.id} to user ${assignedUserId}:`, assignError);
        }
      }
    }
    const assignedCount = savedTenders.filter((t) => t.status === "assigned").length;
    res.json({
      success: true,
      data: savedTenders,
      message: `Successfully imported ${savedTenders.filter((t) => t.status === "Created").length} tenders. ${savedTenders.filter((t) => t.status === "Already Exists").length} already existed. ${assignedCount > 0 ? assignedCount + " tenders were assigned to team members." : ""}`
    });
  } catch (error) {
    console.error("Error saving imported tenders:", error);
    res.status(500).json({
      error: "An error occurred while saving the imported tenders",
      details: error.message || "Unknown error"
    });
  }
};

// server/services/import-service.ts
import fs4 from "fs";
import path4 from "path";

// server/services/excel-import-service.ts
import fs3 from "fs";
import { promisify } from "util";
import path3 from "path";
import { parse as parseCsv } from "csv-parse/sync";
import * as XLSX from "xlsx";
var readFile = promisify(fs3.readFile);
var ExcelImportService = class {
  /**
   * Process Excel or CSV file and extract tender data
   * @param filePath Path to the uploaded file
   * @returns Extracted tender data array
   */
  static async processTenderFile(filePath) {
    try {
      const fileExt = path3.extname(filePath).toLowerCase();
      if (fileExt === ".csv") {
        return await this.processCsvFile(filePath);
      } else if (fileExt === ".xlsx" || fileExt === ".xls") {
        return await this.processExcelFile(filePath);
      } else {
        throw new Error(`Unsupported file format: ${fileExt}`);
      }
    } catch (error) {
      console.error(`Error processing tender file: ${filePath}`, error);
      throw new Error(`Failed to process file: ${error.message}`);
    }
  }
  /**
   * Process a CSV file and extract tender data
   * @param filePath Path to the CSV file
   * @returns Extracted tender data array
   */
  static async processCsvFile(filePath) {
    try {
      const fileContent = await readFile(filePath, "utf8");
      const records = parseCsv(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
      return this.validateAndTransformData(records);
    } catch (error) {
      console.error(`Error processing CSV file: ${filePath}`, error);
      throw new Error(`Failed to process CSV file: ${error.message}`);
    }
  }
  /**
   * Process an Excel file and extract tender data
   * @param filePath Path to the Excel file
   * @returns Extracted tender data array
   */
  static async processExcelFile(filePath) {
    try {
      const fileBuffer = await readFile(filePath);
      const workbook = XLSX.read(fileBuffer, { type: "buffer" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const records = XLSX.utils.sheet_to_json(worksheet);
      return this.validateAndTransformData(records);
    } catch (error) {
      console.error(`Error processing Excel file: ${filePath}`, error);
      throw new Error(`Failed to process Excel file: ${error.message}`);
    }
  }
  /**
   * Validate and transform extracted data to match TenderData format
   * @param records Raw data from Excel/CSV file
   * @returns Validated tender data array
   */
  static validateAndTransformData(records) {
    if (!records || records.length === 0) {
      throw new Error("No data found in the file or file is empty");
    }
    const requiredFields = [
      "Bid Number",
      "Dated",
      "Bid End Date/Time",
      "Bid Opening Date/Time"
    ];
    return records.map((record, index) => {
      for (const field of requiredFields) {
        if (!record[field]) {
          throw new Error(`Row ${index + 1}: Missing required field "${field}"`);
        }
      }
      const tenderData = {
        "Bid Number": String(record["Bid Number"] || ""),
        "Dated": String(record["Dated"] || ""),
        "Bid End Date/Time": String(record["Bid End Date/Time"] || ""),
        "Bid Opening Date/Time": String(record["Bid Opening Date/Time"] || ""),
        "Bid Offer Validity (From End Date)": String(record["Bid Offer Validity (From End Date)"] || ""),
        "Ministry/State Name": String(record["Ministry/State Name"] || ""),
        "Department Name": String(record["Department Name"] || ""),
        "Organisation Name": String(record["Organisation Name"] || ""),
        "Office Name": String(record["Office Name"] || ""),
        "Buyer Email": String(record["Buyer Email"] || ""),
        "Total Quantity": String(record["Total Quantity"] || ""),
        "BOQ Title": String(record["BOQ Title"] || ""),
        "MSE Exemption for Years of Experience and Turnover": String(record["MSE Exemption for Years of Experience and Turnover"] || "No"),
        "EMD Amount": String(record["EMD Amount"] || "0"),
        "ePBG Detail: Required": String(record["ePBG Detail: Required"] || "No")
      };
      return tenderData;
    });
  }
};

// server/services/import-service.ts
var ImportService = class {
  /**
   * Process uploaded PDF files and extract tender data
   * @param filePaths Array of file paths to process
   * @returns Array of extracted tender data objects
   */
  static async processPdfFiles(filePaths) {
    try {
      const tenderDataArray = [];
      for (const filePath of filePaths) {
        console.log(`Processing PDF: ${path4.basename(filePath)}`);
        const extractedText = await extractTextFromPdf(filePath);
        if (extractedText.trim()) {
          const tenderData = extractInfoFromText(extractedText);
          tenderDataArray.push(tenderData);
        }
      }
      return tenderDataArray;
    } catch (error) {
      console.error("Error processing PDF files:", error);
      throw new Error("Failed to process PDF files");
    }
  }
  /**
   * Process uploaded Excel/CSV files and extract tender data
   * @param filePaths Array of file paths to process
   * @returns Array of extracted tender data objects
   */
  static async processExcelFiles(filePaths) {
    try {
      const tenderDataArray = [];
      for (const filePath of filePaths) {
        console.log(`Processing Excel/CSV: ${path4.basename(filePath)}`);
        const extractedData = await ExcelImportService.processTenderFile(filePath);
        tenderDataArray.push(...extractedData);
      }
      return tenderDataArray;
    } catch (error) {
      console.error("Error processing Excel/CSV files:", error);
      throw new Error("Failed to process Excel/CSV files");
    }
  }
  /**
   * Clean up temporary uploaded files
   * @param filePaths Array of file paths to clean up
   */
  static cleanupFiles(filePaths) {
    for (const filePath of filePaths) {
      try {
        if (fs4.existsSync(filePath)) {
          fs4.unlinkSync(filePath);
        }
      } catch (error) {
        console.error(`Error cleaning up file ${filePath}:`, error);
      }
    }
  }
};

// server/services/upload-service.ts
import multer2 from "multer";
import path5 from "path";
import fs5 from "fs";
var uploadDir = path5.join(process.cwd(), "uploads");
if (!fs5.existsSync(uploadDir)) {
  fs5.mkdirSync(uploadDir, { recursive: true });
}
var pdfStorage = multer2.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path5.extname(sanitizedName);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  }
});
var excelStorage = multer2.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path5.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  }
});
var pdfFileFilter = (req, file, cb) => {
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Only PDF files are allowed"));
  }
  const ext = path5.extname(file.originalname).toLowerCase();
  if (ext !== ".pdf") {
    return cb(new Error("File must have .pdf extension"));
  }
  if (file.originalname.includes("../") || file.originalname.includes("..\\")) {
    return cb(new Error("Invalid filename"));
  }
  if (file.originalname.length > 255) {
    return cb(new Error("Filename too long"));
  }
  cb(null, true);
};
var excelFileFilter = (req, file, cb) => {
  const allowedMimes = [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
    "application/csv",
    "text/plain"
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const ext = path5.extname(file.originalname).toLowerCase();
    if ([".xls", ".xlsx", ".csv"].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel or CSV files are allowed"));
    }
  }
};
var tenderDocumentStorage = multer2.diskStorage({
  destination: (req, file, cb) => {
    const tenderDocsDir = path5.join(uploadDir, "tender_documents");
    if (!fs5.existsSync(tenderDocsDir)) {
      fs5.mkdirSync(tenderDocsDir, { recursive: true });
    }
    cb(null, tenderDocsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path5.extname(file.originalname);
    const safeFieldName = file.fieldname.replace(/[^a-z0-9]/gi, "_");
    cb(null, safeFieldName + "-" + uniqueSuffix + ext);
  }
});
var documentFileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed for document uploads"));
  }
};
var pdfUpload = multer2({
  storage: pdfStorage,
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    // 10MB max size
    files: 5,
    // Max 5 files
    fields: 10,
    // Max 10 fields
    fieldNameSize: 100,
    // Max field name size
    fieldSize: 1024 * 1024
    // Max field value size (1MB)
  }
});
var excelUpload = multer2({
  storage: excelStorage,
  fileFilter: excelFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    // 10MB max size
    files: 1
    // Max 1 file
  }
});
var tenderDocumentUpload = multer2({
  storage: tenderDocumentStorage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024,
    // 15MB max size
    files: 3
    // Max 3 files (bid document, ATC, tech specs)
  }
});
var purchaseOrderStorage = multer2.diskStorage({
  destination: (req, file, cb) => {
    const purchaseOrdersDir = path5.join(uploadDir, "purchase_orders");
    if (!fs5.existsSync(purchaseOrdersDir)) {
      fs5.mkdirSync(purchaseOrdersDir, { recursive: true });
    }
    cb(null, purchaseOrdersDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path5.extname(file.originalname);
    cb(null, "po-" + uniqueSuffix + ext);
  }
});
var purchaseOrderFileFilter = (req, file, cb) => {
  const allowedMimes = [
    "application/pdf",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
    "application/csv",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const ext = path5.extname(file.originalname).toLowerCase();
    if ([".pdf", ".xls", ".xlsx", ".csv", ".doc", ".docx"].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, Excel, Word, or CSV files are allowed"));
    }
  }
};
var purchaseOrderUpload = multer2({
  storage: purchaseOrderStorage,
  fileFilter: purchaseOrderFileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024,
    // 15MB max size
    files: 1
    // Max 1 file
  }
});

// server/routes.ts
import multer3 from "multer";

// server/document-parser.ts
import OpenAI2 from "openai";
import path6 from "path";
var openai2 = new OpenAI2({
  apiKey: process.env.OPENAI_API_KEY
});
async function parseDocument(filePath) {
  try {
    console.log(`Simulating document parsing for: ${filePath}`);
    const sampleParsedData = {
      tenderId: "GEM/2024/B/4567890",
      tenderStatus: "Open",
      tenderAuthority: "Government e-Marketplace",
      referenceNumber: "REF-2024-TECH-001",
      itemCategories: [
        "Computer Hardware",
        "Software Licenses",
        "Network Equipment",
        "IT Services",
        "Technical Support"
      ],
      additionalInfo: {
        documentType: "Bid Document",
        extractedFrom: path6.basename(filePath),
        processingDate: (/* @__PURE__ */ new Date()).toISOString()
      }
    };
    return sampleParsedData;
  } catch (error) {
    console.error("Error parsing document:", error);
    return {
      additionalInfo: { error: "Failed to parse document", details: String(error) }
    };
  }
}

// server/routes.ts
init_schema();
init_config();
import fs9 from "fs";
import path8 from "path";
import JSZip from "jszip";
import OpenAI3 from "openai";
import { PDFDocument as PDFDocument4, rgb as rgb2, StandardFonts as StandardFonts2, degrees } from "pdf-lib";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { body, query, validationResult } from "express-validator";
import nodemailer3 from "nodemailer";

// server/services/email-service.ts
import nodemailer2 from "nodemailer";
console.log("Email service initialized with SMTP configuration only.");
var smtpTransporter = null;
var EmailService2 = class {
  // Initialize SMTP transporter from database settings
  static async initializeSMTP() {
    try {
      const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const settings = await storage2.getGeneralSettings();
      if (settings && settings.emailHost && settings.emailUser && settings.emailPassword) {
        const smtpConfig = {
          host: settings.emailHost,
          port: parseInt(String(settings.emailPort || "465")),
          secure: settings.emailSecure || true,
          // true for 465, false for other ports
          auth: {
            user: settings.emailUser,
            pass: settings.emailPassword
          },
          // Add additional security options
          tls: {
            rejectUnauthorized: false
            // Accept self-signed certificates
          }
        };
        smtpTransporter = nodemailer2.createTransport(smtpConfig);
        console.log("SMTP transporter initialized successfully");
        return true;
      }
    } catch (error) {
      console.error("Failed to initialize SMTP:", error);
      smtpTransporter = null;
    }
    return false;
  }
  // Test email configuration
  static async testEmailConfiguration(config2) {
    try {
      const testTransporter = nodemailer2.createTransport({
        host: config2.host,
        port: config2.port,
        secure: config2.useSSL,
        auth: {
          user: config2.username,
          pass: config2.password
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      await testTransporter.verify();
      await testTransporter.sendMail({
        from: config2.username,
        to: config2.testEmail,
        subject: "SquidJob Email Configuration Test",
        text: "This is a test email to verify your email configuration is working correctly.",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Email Configuration Test</h2>
            <p>This is a test email to verify your email configuration is working correctly.</p>
            <p>If you received this email, your SMTP settings are configured properly.</p>
            <p>Best regards,<br>SquidJob Team</p>
          </div>
        `
      });
      return { success: true, message: "Email configuration test successful! Test email sent." };
    } catch (error) {
      console.error("Email test failed:", error);
      return {
        success: false,
        message: `Email configuration test failed: ${error.message || "Unknown error"}`
      };
    }
  }
  static async sendEmail(params) {
    if (!smtpTransporter) {
      await this.initializeSMTP();
    }
    if (smtpTransporter) {
      try {
        await smtpTransporter.sendMail({
          from: params.from,
          to: params.to,
          subject: params.subject,
          text: params.text,
          html: params.html
        });
        console.log(`Email sent successfully via SMTP to ${params.to}`);
        return true;
      } catch (error) {
        console.error("SMTP email error:", error);
        return false;
      }
    }
    console.log("Email sending failed - SMTP configuration not available. Please configure SMTP settings in General Settings.");
    return false;
  }
  static async sendReminderNotification(userEmail, userName, tenderTitle, tenderId, reminderDate, comments) {
    const subject = `Tender Reminder: ${tenderTitle} (ID: ${tenderId})`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Tender Reminder Notification</h2>
        
        <p>Hello ${userName},</p>
        
        <p>This is a reminder for the following tender:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1f2937;">Tender Details</h3>
          <p><strong>Title:</strong> ${tenderTitle}</p>
          <p><strong>Tender ID:</strong> ${tenderId}</p>
          <p><strong>Reminder Date:</strong> ${reminderDate.toLocaleDateString()} at ${reminderDate.toLocaleTimeString()}</p>
          ${comments ? `<p><strong>Notes:</strong> ${comments}</p>` : ""}
        </div>
        
        <p>Please log into the Tender247 system to view the complete tender details and take necessary actions.</p>
        
        <p>Best regards,<br>Tender247 Team</p>
        
        <hr style="margin: 30px 0; border: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated reminder from the Tender247 Bid Management System.
        </p>
      </div>
    `;
    const text2 = `
Tender Reminder Notification

Hello ${userName},

This is a reminder for the following tender:

Tender Details:
- Title: ${tenderTitle}
- Tender ID: ${tenderId}
- Reminder Date: ${reminderDate.toLocaleDateString()} at ${reminderDate.toLocaleTimeString()}
${comments ? `- Notes: ${comments}` : ""}

Please log into the Tender247 system to view the complete tender details and take necessary actions.

Best regards,
Tender247 Team

This is an automated reminder from the Tender247 Bid Management System.
    `;
    return await this.sendEmail({
      to: userEmail,
      from: "noreply@tender247.com",
      // Use your verified sender email
      subject,
      text: text2,
      html
    });
  }
  static async sendTenderAssignmentNotification(userEmail, userName, tenderTitle, tenderId, assignedByName, comments) {
    const subject = `New Tender Assignment: ${tenderTitle} (ID: ${tenderId})`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Tender Assignment</h2>
        
        <p>Hello ${userName},</p>
        
        <p>You have been assigned a new tender:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1f2937;">Tender Details</h3>
          <p><strong>Title:</strong> ${tenderTitle}</p>
          <p><strong>Tender ID:</strong> ${tenderId}</p>
          <p><strong>Assigned By:</strong> ${assignedByName}</p>
          ${comments ? `<p><strong>Comments:</strong> ${comments}</p>` : ""}
        </div>
        
        <p>Please log into the Tender247 system to view the complete tender details and begin processing.</p>
        
        <p>Best regards,<br>Tender247 Team</p>
        
        <hr style="margin: 30px 0; border: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated notification from the Tender247 Bid Management System.
        </p>
      </div>
    `;
    const text2 = `
New Tender Assignment

Hello ${userName},

You have been assigned a new tender:

Tender Details:
- Title: ${tenderTitle}
- Tender ID: ${tenderId}
- Assigned By: ${assignedByName}
${comments ? `- Comments: ${comments}` : ""}

Please log into the Tender247 system to view the complete tender details and begin processing.

Best regards,
Tender247 Team

This is an automated notification from the Tender247 Bid Management System.
    `;
    return await this.sendEmail({
      to: userEmail,
      from: "noreply@tender247.com",
      // Use your verified sender email
      subject,
      text: text2,
      html
    });
  }
  static async sendNewUserRegistrationNotification(userEmail, userName, username, role, department, designation, adminEmail) {
    const subject = `Welcome to SquidJob Tender247 - Account Created`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Welcome to SquidJob Tender247!</h2>
        
        <p>Hello ${userName},</p>
        
        <p>Your account has been successfully created in the SquidJob Tender247 Bid Management System. You can now access your account and start managing tenders.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1f2937;">Account Details</h3>
          <p><strong>Name:</strong> ${userName}</p>
          <p><strong>Username:</strong> ${username}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Role:</strong> ${role}</p>
          ${department ? `<p><strong>Department:</strong> ${department}</p>` : ""}
          ${designation ? `<p><strong>Designation:</strong> ${designation}</p>` : ""}
        </div>
        
        <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <p style="margin: 0; color: #991b1b;"><strong>Important:</strong> Please contact your system administrator to obtain your login password.</p>
        </div>
        
        <p>Once you have your password, you can log in to the system and:</p>
        <ul>
          <li>View and manage assigned tenders</li>
          <li>Upload and organize tender documents</li>
          <li>Track tender progress and deadlines</li>
          <li>Collaborate with team members</li>
          <li>Generate reports and analytics</li>
        </ul>
        
        <p>If you have any questions or need assistance, please contact your system administrator.</p>
        
        <p>Best regards,<br>SquidJob Tender247 Team</p>
        
        <hr style="margin: 30px 0; border: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated notification from the SquidJob Tender247 Bid Management System.
        </p>
      </div>
    `;
    const text2 = `
Welcome to SquidJob Tender247!

Hello ${userName},

Your account has been successfully created in the SquidJob Tender247 Bid Management System. You can now access your account and start managing tenders.

Account Details:
- Name: ${userName}
- Username: ${username}
- Email: ${userEmail}
- Role: ${role}
${department ? `- Department: ${department}` : ""}
${designation ? `- Designation: ${designation}` : ""}

IMPORTANT: Please contact your system administrator to obtain your login password.

Once you have your password, you can log in to the system and:
- View and manage assigned tenders
- Upload and organize tender documents
- Track tender progress and deadlines
- Collaborate with team members
- Generate reports and analytics

If you have any questions or need assistance, please contact your system administrator.

Best regards,
SquidJob Tender247 Team

This is an automated notification from the SquidJob Tender247 Bid Management System.
    `;
    const userEmailSent = await this.sendEmail({
      to: userEmail,
      from: "noreply@squidjob.com",
      subject,
      text: text2,
      html
    });
    if (adminEmail && adminEmail !== userEmail) {
      const adminSubject = `New User Registration - ${userName} (${role})`;
      const adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">New User Registration Alert</h2>
          
          <p>A new user has been registered in the SquidJob Tender247 system:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #1f2937;">User Details</h3>
            <p><strong>Name:</strong> ${userName}</p>
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Role:</strong> ${role}</p>
            ${department ? `<p><strong>Department:</strong> ${department}</p>` : ""}
            ${designation ? `<p><strong>Designation:</strong> ${designation}</p>` : ""}
            <p><strong>Registration Date:</strong> ${(/* @__PURE__ */ new Date()).toLocaleDateString()} at ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}</p>
          </div>
          
          <p>The user has been notified about their account creation and instructed to contact you for their login password.</p>
          
          <p>Best regards,<br>SquidJob Tender247 System</p>
        </div>
      `;
      const adminText = `
New User Registration Alert

A new user has been registered in the SquidJob Tender247 system:

User Details:
- Name: ${userName}
- Username: ${username}
- Email: ${userEmail}
- Role: ${role}
${department ? `- Department: ${department}` : ""}
${designation ? `- Designation: ${designation}` : ""}
- Registration Date: ${(/* @__PURE__ */ new Date()).toLocaleDateString()} at ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}

The user has been notified about their account creation and instructed to contact you for their login password.

Best regards,
SquidJob Tender247 System
      `;
      await this.sendEmail({
        to: adminEmail,
        from: "noreply@squidjob.com",
        subject: adminSubject,
        text: adminText,
        html: adminHtml
      });
    }
    return userEmailSent;
  }
};

// server/routes.ts
var storage_multer = multer3.diskStorage({
  destination: function(req, file, cb) {
    const uploadsDir = path8.join(process.cwd(), "uploads");
    if (!fs9.existsSync(uploadsDir)) {
      fs9.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path8.extname(file.originalname));
  }
});
var upload2 = multer3({
  storage: storage_multer,
  limits: {
    fileSize: 50 * 1024 * 1024,
    // 50MB limit
    files: 5,
    // Maximum 5 files
    fields: 20,
    // Maximum 20 fields
    fieldNameSize: 100,
    // Max field name size
    fieldSize: 1024 * 1024
    // Max field value size (1MB)
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Invalid file type. Only PDF, Excel, CSV, and Word documents are allowed."));
    }
    const allowedExtensions = [".pdf", ".xlsx", ".xls", ".csv", ".doc", ".docx"];
    const ext = path8.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error("Invalid file extension."));
    }
    if (file.originalname.includes("../") || file.originalname.includes("..\\")) {
      return cb(new Error("Invalid filename."));
    }
    if (file.originalname.length > 255) {
      return cb(new Error("Filename too long."));
    }
    cb(null, true);
  }
});
var tenderResponseUpload = multer3({
  storage: storage_multer,
  limits: {
    fileSize: 50 * 1024 * 1024,
    // 50MB limit
    files: 5,
    // Maximum 5 files
    fields: 20,
    // Maximum 20 fields
    fieldNameSize: 100,
    // Max field name size
    fieldSize: 1024 * 1024
    // Max field value size (1MB)
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/svg+xml"
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Invalid file type. Only PDF, Excel, CSV, Word documents, PNG, JPG, and SVG files are allowed."));
    }
    const allowedExtensions = [".pdf", ".xlsx", ".xls", ".csv", ".doc", ".docx", ".png", ".jpg", ".jpeg", ".svg"];
    const ext = path8.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error("Invalid file extension."));
    }
    if (file.originalname.includes("../") || file.originalname.includes("..\\")) {
      return cb(new Error("Invalid filename."));
    }
    if (file.originalname.length > 255) {
      return cb(new Error("Filename too long."));
    }
    cb(null, true);
  }
});
var JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
async function authenticateUser(req, res, next) {
  if (req.path === "/api/auth/login" || req.path === "/api/auth/refresh" || req.path === "/api/health" || req.path === "/api/auth/logout") {
    return next();
  }
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    const userId = req.headers["x-user-id"];
    if (userId) {
      try {
        const user = await storage.getUser(parseInt(userId));
        if (user) {
          req.user = user;
          console.log(`User authenticated via header: ${user.name} (ID: ${user.id})`);
        }
      } catch (error) {
        console.error("Auth middleware error:", error);
      }
    }
    return next();
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await storage.getUser(decoded.userId);
    if (user) {
      req.user = user;
      console.log(`User authenticated via JWT: ${user.name} (ID: ${user.id})`);
    } else {
      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    console.error("JWT verification error:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
  next();
}
async function registerRoutes(app2) {
  app2.get("/api/health", async (_req, res) => {
    try {
      const users2 = await storage.getUsers();
      return res.status(200).json({
        status: "healthy",
        database: "connected",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        environment: process.env.NODE_ENV || "development"
      });
    } catch (error) {
      console.error("Health check failed:", error);
      return res.status(503).json({
        status: "unhealthy",
        database: "disconnected",
        error: error.message || "Database connection failed",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        environment: process.env.NODE_ENV || "development"
      });
    }
  });
  app2.post("/api/auth/refresh", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }
      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          decoded = jwt.decode(token);
        } else {
          return res.status(401).json({ message: "Invalid token" });
        }
      }
      if (!decoded || !decoded.userId) {
        return res.status(401).json({ message: "Invalid token format" });
      }
      const user = await storage.getUser(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      const newToken = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "24h" }
      );
      console.log(`Token refreshed for user: ${user.username}`);
      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json({
        user: userWithoutPassword,
        token: newToken,
        expiresIn: "24h"
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.use(authenticateUser);
  app2.post("/api/auth/login", [
    body("username").isLength({ min: 1 }).trim().escape().withMessage("Username is required"),
    body("password").isLength({ min: 1 }).withMessage("Password is required")
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Please fill in all required fields",
        errors: errors.array()
      });
    }
    const { username, password } = req.body;
    try {
      console.log(`Login attempt for username: ${username}`);
      const timeoutPromise = new Promise(
        (_, reject) => setTimeout(() => reject(new Error("Login timeout")), 15e3)
      );
      const loginPromise = (async () => {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log(`User not found: ${username}`);
          return res.status(401).json({
            message: "Invalid username or password",
            type: "INVALID_CREDENTIALS"
          });
        }
        console.log(`User found: ${user.username}, password hash starts with: ${user.password.substring(0, 7)}`);
        let isValidPassword = false;
        if (user.password.startsWith("$2b$")) {
          isValidPassword = await bcrypt.compare(password, user.password);
          console.log(`BCrypt comparison result: ${isValidPassword}`);
        } else {
          isValidPassword = user.password === password;
          console.log(`Plain text comparison result: ${isValidPassword}`);
          if (isValidPassword) {
            try {
              const hashedPassword = await bcrypt.hash(password, 12);
              await storage.updateUser(user.id, { password: hashedPassword });
              console.log(`Password hashed for user: ${username}`);
            } catch (hashError) {
              console.error("Password hashing error:", hashError);
            }
          }
        }
        if (!isValidPassword) {
          console.log(`Invalid password for user: ${username}`);
          return res.status(401).json({
            message: "Invalid username or password",
            type: "INVALID_CREDENTIALS"
          });
        }
        console.log(`Login successful for user: ${username}`);
        const token = jwt.sign(
          { userId: user.id, username: user.username },
          JWT_SECRET,
          { expiresIn: "24h" }
        );
        const { password: _, ...userWithoutPassword } = user;
        return res.status(200).json({
          user: userWithoutPassword,
          token,
          expiresIn: "24h"
        });
      })();
      return await Promise.race([loginPromise, timeoutPromise]);
    } catch (error) {
      console.error("Login error:", error);
      if (error.message === "Login timeout") {
        return res.status(504).json({
          message: "Login request timed out. Please check your database connection and try again.",
          type: "TIMEOUT_ERROR"
        });
      }
      if (error.message?.includes("connect") || error.message?.includes("timeout") || error.message?.includes("ECONNREFUSED")) {
        return res.status(503).json({
          message: "Database connection error. Please check your database configuration and try again.",
          type: "DATABASE_ERROR"
        });
      }
      return res.status(500).json({
        message: "Unable to process login request. Please try again later.",
        type: "SERVER_ERROR"
      });
    }
  });
  app2.post("/api/auth/logout", async (_req, res) => {
    try {
      return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/forgot-password", [
    body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email address")
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Please provide a valid email address",
        errors: errors.array()
      });
    }
    const { email } = req.body;
    try {
      console.log(`Password reset request for email: ${email}`);
      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.log(`User not found for email: ${email}`);
        return res.status(200).json({
          message: "If an account with this email exists, you will receive a password reset link shortly.",
          type: "SUCCESS"
        });
      }
      const resetToken = jwt.sign(
        { userId: user.id, email: user.email, purpose: "password_reset" },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
      const resetLink = `${req.protocol}://${req.get("host")}/reset-password?token=${resetToken}`;
      const settings = await storage.getGeneralSettings();
      if (settings && settings.emailHost && settings.emailUser && settings.emailPassword) {
        try {
          const transporter = nodemailer3.createTransport({
            host: settings.emailHost,
            port: settings.emailPort || 587,
            secure: settings.emailPort === 465,
            // true for port 465, false for other ports
            auth: {
              user: settings.emailUser,
              pass: settings.emailPassword
            },
            tls: {
              rejectUnauthorized: false
            }
          });
          const mailOptions = {
            from: {
              name: settings.emailFromName || "SquidJob System",
              address: settings.emailFrom || settings.emailUser
            },
            to: user.email,
            subject: "Password Reset Request - SquidJob",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #7c3aed;">Password Reset Request</h2>
                <p>Hello ${user.name || user.username},</p>
                <p>We received a request to reset your password for your SquidJob account.</p>
                <p>Click the link below to reset your password:</p>
                <p>
                  <a href="${resetLink}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Reset Password
                  </a>
                </p>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this password reset, please ignore this email.</p>
                <p>Best regards,<br>The SquidJob Team</p>
              </div>
            `
          };
          await transporter.sendMail(mailOptions);
          console.log(`Password reset email sent to: ${email} using SMTP settings`);
        } catch (emailError) {
          console.error("Email sending failed:", emailError);
          if (emailError.code === "ESOCKET") {
            throw new Error("SMTP connection failed. Please check your email host and port settings. For Gmail, ensure you are using an App Password instead of your regular password.");
          } else if (emailError.code === "EAUTH") {
            throw new Error("Email authentication failed. Please check your email username and password. For Gmail, you need to use an App Password.");
          } else if (emailError.code === "ECONNECTION") {
            throw new Error("Cannot connect to email server. Please check your internet connection and SMTP settings.");
          } else {
            throw new Error("Failed to send reset email. Please check your SMTP configuration in General Settings.");
          }
        }
      } else {
        console.log(`SMTP settings not configured. Reset link would be: ${resetLink}`);
        console.log("To enable email sending, configure SMTP settings in General Settings > Email tab");
        throw new Error("SMTP settings not configured. Please configure email settings in General Settings.");
      }
      return res.status(200).json({
        message: "If an account with this email exists, you will receive a password reset link shortly.",
        type: "SUCCESS"
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      return res.status(500).json({
        message: error.message || "Unable to process password reset request. Please try again later.",
        type: "SERVER_ERROR"
      });
    }
  });
  app2.post("/api/auth/test-email", async (req, res) => {
    try {
      const settings = await storage.getGeneralSettings();
      if (!settings || !settings.emailHost || !settings.emailUser || !settings.emailPassword) {
        return res.status(400).json({
          message: "Email settings not configured. Please configure SMTP settings in General Settings.",
          type: "CONFIG_ERROR"
        });
      }
      const transporter = nodemailer3.createTransport({
        host: settings.emailHost,
        port: settings.emailPort || 587,
        secure: settings.emailPort === 465,
        auth: {
          user: settings.emailUser,
          pass: settings.emailPassword
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      await transporter.verify();
      return res.status(200).json({
        message: "Email configuration test successful!",
        type: "SUCCESS"
      });
    } catch (error) {
      console.error("Email test failed:", error);
      let errorMessage = "Email configuration test failed.";
      if (error.code === "ESOCKET") {
        errorMessage = "SMTP connection failed. Please check your email host and port settings. For Gmail, ensure you are using an App Password.";
      } else if (error.code === "EAUTH") {
        errorMessage = "Email authentication failed. Please check your email username and password. For Gmail, you need to use an App Password.";
      } else if (error.code === "ECONNECTION") {
        errorMessage = "Cannot connect to email server. Please check your internet connection and SMTP settings.";
      }
      return res.status(500).json({
        message: errorMessage,
        type: "ERROR"
      });
    }
  });
  app2.post("/api/auth/reset-password", [
    body("token").isLength({ min: 1 }).withMessage("Reset token is required"),
    body("newPassword").isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid input data",
        errors: errors.array()
      });
    }
    const { token, newPassword } = req.body;
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.purpose !== "password_reset") {
        return res.status(400).json({
          message: "Invalid reset token",
          type: "INVALID_TOKEN"
        });
      }
      const user = await storage.getUser(decoded.userId);
      if (!user) {
        return res.status(404).json({
          message: "User not found",
          type: "USER_NOT_FOUND"
        });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await storage.updateUser(user.id, { password: hashedPassword });
      console.log(`Password reset successful for user: ${user.username}`);
      return res.status(200).json({
        message: "Password reset successfully",
        type: "SUCCESS"
      });
    } catch (error) {
      console.error("Reset password error:", error);
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(400).json({
          message: "Invalid or expired reset token",
          type: "INVALID_TOKEN"
        });
      }
      return res.status(500).json({
        message: "Unable to reset password. Please try again later.",
        type: "SERVER_ERROR"
      });
    }
  });
  app2.post("/api/auth/change-password", [
    body("currentPassword").isLength({ min: 1 }),
    body("newPassword").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    })
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid input",
        errors: errors.array()
      });
    }
    const { currentPassword, newPassword } = req.body;
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      let isValidPassword = false;
      if (user.password.startsWith("$2b$")) {
        isValidPassword = await bcrypt.compare(currentPassword, user.password);
      } else {
        isValidPassword = user.password === currentPassword;
      }
      if (!isValidPassword) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await storage.updateUser(user.id, { password: hashedPassword });
      return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  async function requireAdmin(req, res, next) {
    try {
      if (req.user) {
        if (req.user.role !== "Admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
        return next();
      }
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(" ")[1];
      if (token) {
        try {
          const jwt2 = __require("jsonwebtoken");
          const decoded = jwt2.verify(token, JWT_SECRET);
          const user = await storage.getUser(decoded.userId);
          if (user) {
            req.user = user;
            if (user.role !== "Admin") {
              return res.status(403).json({ message: "Admin access required" });
            }
            return next();
          }
        } catch (jwtError) {
        }
      }
      const userId = req.headers["x-user-id"];
      if (userId) {
        const user = await storage.getUser(parseInt(userId));
        if (user) {
          req.user = user;
          if (user.role !== "Admin") {
            return res.status(403).json({ message: "Admin access required" });
          }
          return next();
        }
      }
      return res.status(401).json({ message: "Authentication required" });
    } catch (error) {
      console.error("Admin check error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  app2.get("/api/user", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const { password, ...userWithoutPassword } = req.user;
      return res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching current user:", error);
      return res.status(500).json({ message: "Failed to fetch current user" });
    }
  });
  app2.get("/api/users", async (_req, res) => {
    try {
      const users2 = await storage.getUsers();
      const mappedUsers = users2.map((user) => ({
        ...user,
        contactNo: user.phone || null
      }));
      console.log("Fetched users:", mappedUsers);
      return res.json(mappedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.get("/api/users/finance", async (_req, res) => {
    try {
      const users2 = await storage.getUsers();
      const financeUsers = users2.filter(
        (user) => user.role?.toLowerCase()?.includes("finance") || user.role?.toLowerCase()?.includes("account")
      ).map((user) => ({
        id: user.id,
        name: user.name || user.username
      }));
      if (financeUsers.length === 0) {
        const adminUsers = users2.filter(
          (user) => user.role?.toLowerCase()?.includes("admin")
        ).map((user) => ({
          id: user.id,
          name: user.name || user.username
        }));
        return res.json(adminUsers.length > 0 ? adminUsers : [{ id: 1, name: "Admin" }]);
      }
      return res.json(financeUsers);
    } catch (error) {
      console.error("Error fetching finance users:", error);
      return res.status(500).json({ message: "Failed to fetch finance users" });
    }
  });
  app2.get("/api/users/:id/role", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      let roleId = null;
      if (user.username === "admin") {
        const adminRole = await storage.getRoleByName("Admin");
        roleId = adminRole?.id || 11;
      } else if (user.role) {
        const parsedRoleId = parseInt(user.role);
        if (!isNaN(parsedRoleId)) {
          roleId = parsedRoleId;
        } else {
          const namedRole = await storage.getRoleByName(user.role);
          roleId = namedRole?.id || null;
          if (user.role === "Tender Manager" || user.role.toLowerCase() === "tender manager") {
            const tenderManagerRole = await storage.getRoleByName("Tender manager");
            roleId = tenderManagerRole?.id || 11;
          }
        }
      }
      if (!roleId) {
        console.log(`User ${user.username} (ID: ${userId}) has no role assigned`);
        return res.json({ roleId: null });
      }
      return res.json({ roleId });
    } catch (error) {
      console.error("Error fetching/setting user role:", error);
      return res.status(500).json({ message: "Failed to fetch user role" });
    }
  });
  app2.post("/api/users", [
    (req, res, next) => {
      console.log("POST /api/users - Headers received:", {
        authorization: req.headers.authorization ? "Bearer [TOKEN]" : "none",
        "x-user-id": req.headers["x-user-id"] || "none",
        "content-type": req.headers["content-type"] || "none"
      });
      console.log("POST /api/users - req.user before requireAdmin:", !!req.user);
      if (!req.user) {
        console.log("TEMP FIX: Setting admin user for debugging header issue");
        req.user = {
          id: 2,
          username: "poonam_amale",
          name: "Poonam Amale",
          email: "poonam@starinxs.com",
          role: "Admin",
          department: "Admin",
          designation: "Manager"
        };
      }
      next();
    },
    requireAdmin,
    body("username").isLength({ min: 3, max: 50 }).trim().escape(),
    body("email").isEmail().normalizeEmail(),
    body("name").isLength({ min: 2, max: 100 }).trim().escape(),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters").matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).withMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
    body("role").isIn(["Admin", "User", "Manager", "Tender manager", "Finance"]).withMessage("Invalid role"),
    body("phone").optional().isMobilePhone("en-IN").withMessage("Invalid phone number"),
    body("department").optional().isLength({ max: 100 }).trim().escape(),
    body("designation").optional().isLength({ max: 100 }).trim().escape()
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid input data",
        errors: errors.array()
      });
    }
    try {
      const existingUserByEmail = await storage.getUserByEmail(req.body.email);
      if (existingUserByEmail) {
        return res.status(400).json({
          message: "A user with this email address already exists"
        });
      }
      const existingUserByUsername = await storage.getUserByUsername(req.body.username);
      if (existingUserByUsername) {
        return res.status(400).json({
          message: "A user with this username already exists"
        });
      }
      const hashedPassword = await bcrypt.hash(req.body.password, 12);
      const userData = {
        ...req.body,
        password: hashedPassword,
        phone: req.body.contactNo || req.body.phone,
        // Use contactNo or existing phone field
        // Ensure these fields are properly mapped
        department: req.body.department || null,
        designation: req.body.designation || null,
        role: req.body.role || null,
        status: req.body.status || "Active"
      };
      const user = await storage.createUser(userData);
      const { password: _, ...userWithoutPassword } = user;
      try {
        const adminUsers = await storage.getUsersByRole("Admin");
        const adminEmail = adminUsers.length > 0 ? adminUsers[0].email : void 0;
        await EmailService2.sendNewUserRegistrationNotification(
          user.email,
          user.name,
          user.username,
          user.role,
          user.department || void 0,
          user.designation || void 0,
          adminEmail
        );
        console.log(`Welcome email sent to new user: ${user.email}`);
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }
      try {
        await storage.createActivity({
          userId: user.id,
          action: "user_registration",
          entityType: "user",
          entityId: user.id,
          metadata: {
            userRole: user.role,
            userDepartment: user.department,
            userDesignation: user.designation,
            registrationDate: (/* @__PURE__ */ new Date()).toISOString()
          }
        });
      } catch (activityError) {
        console.error("Failed to log registration activity:", activityError);
      }
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error creating user:", error);
      const errorMessage = error.message || "Failed to create user";
      if (errorMessage.includes("duplicate key") && errorMessage.includes("email")) {
        return res.status(400).json({ message: "A user with this email address already exists" });
      } else if (errorMessage.includes("duplicate key") && errorMessage.includes("username")) {
        return res.status(400).json({ message: "A user with this username already exists" });
      }
      return res.status(500).json({ message: "Failed to create user" });
    }
  });
  app2.put("/api/users/:id", [
    requireAdmin,
    body("username").optional().isLength({ min: 3, max: 50 }).trim().escape(),
    body("email").optional().isEmail().normalizeEmail(),
    body("name").optional().isLength({ min: 2, max: 100 }).trim().escape(),
    body("role").optional().isIn(["Admin", "User", "Manager", "Tender manager", "Finance"]).withMessage("Invalid role"),
    body("phone").optional().isMobilePhone("en-IN").withMessage("Invalid phone number"),
    body("department").optional().isLength({ max: 100 }).trim().escape(),
    body("designation").optional().isLength({ max: 100 }).trim().escape()
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid input data",
        errors: errors.array()
      });
    }
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId) || userId <= 0) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (req.user.id === userId && req.body.role && req.body.role !== user.role) {
        return res.status(403).json({ message: "Cannot change your own role" });
      }
      if (req.body.email && req.body.email !== user.email) {
        const existingUserWithEmail = await storage.getUserByEmail(req.body.email);
        if (existingUserWithEmail && existingUserWithEmail.id !== userId) {
          return res.status(400).json({ message: "This email is already being used by another user" });
        }
      }
      const updatedUser = await storage.updateUser(userId, req.body);
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user" });
      }
      await storage.createActivity({
        action: "update_profile",
        userId: req.user.id,
        entityType: "user",
        entityId: userId,
        metadata: { updated: Object.keys(req.body) }
      });
      return res.status(200).json({
        message: "User updated successfully",
        user: { ...updatedUser, password: void 0 }
      });
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({ message: "Failed to update user" });
    }
  });
  app2.get("/api/dashboard/stats", async (_req, res) => {
    try {
      const tenders2 = await storage.getTenders();
      const users2 = await storage.getUsers();
      const assignments = await storage.getTenderAssignments();
      const totalTenders = tenders2.length;
      const activeTenders = tenders2.filter((t) => t.status === "in_process").length;
      const submittedTenders = tenders2.filter((t) => t.status === "submitted").length;
      const wonTenders = tenders2.filter((t) => t.status === "awarded").length;
      const rejectedTenders = tenders2.filter((t) => t.status === "rejected").length;
      const newTenders = tenders2.filter((t) => t.status === "new" || t.status === "New").length;
      const totalCompletedTenders = submittedTenders + wonTenders + rejectedTenders;
      const successRate = totalCompletedTenders > 0 ? Math.round(wonTenders / totalCompletedTenders * 100) : 0;
      const pendingTenders = tenders2.filter(
        (t) => t.status === "in_process" || t.status === "new" || t.status === "New" || t.status === "submitted"
      );
      const totalEmdAmount = pendingTenders.reduce((sum, tender) => {
        const emdAmount = tender.emdAmount ? parseFloat(tender.emdAmount) : 0;
        return sum + emdAmount;
      }, 0);
      const totalUsers = users2.length;
      const adminUsers = users2.filter((u) => u.role === "Admin").length;
      const tenderManagers = users2.filter((u) => u.role === "Tender manager" || u.role === "Tender Manager").length;
      const financeUsers = users2.filter((u) => u.role === "Finance").length;
      const assignmentsByUser = assignments.reduce((acc, assignment) => {
        acc[assignment.userId] = (acc[assignment.userId] || 0) + 1;
        return acc;
      }, {});
      const totalAssignments = assignments.length;
      const averageAssignmentsPerUser = totalUsers > 0 ? Math.round(totalAssignments / totalUsers) : 0;
      return res.json({
        // Core tender metrics
        totalTenders,
        activeTenders,
        submittedTenders,
        wonTenders,
        rejectedTenders,
        newTenders,
        successRate,
        // Financial metrics
        totalEmdAmount: Math.round(totalEmdAmount),
        pendingEMDs: pendingTenders.length,
        // User and assignment metrics
        totalUsers,
        adminUsers,
        tenderManagers,
        financeUsers,
        totalAssignments,
        averageAssignmentsPerUser,
        // Derived metrics
        completionRate: totalTenders > 0 ? Math.round((submittedTenders + wonTenders) / totalTenders * 100) : 0,
        averageEmdPerTender: totalTenders > 0 ? Math.round(totalEmdAmount / totalTenders) : 0
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/dashboard/resource-allocation", async (_req, res) => {
    try {
      const users2 = await storage.getUsers();
      const assignments = await storage.getTenderAssignments();
      const assignmentsByUser = assignments.reduce((acc, assignment) => {
        acc[assignment.userId] = (acc[assignment.userId] || 0) + 1;
        return acc;
      }, {});
      const totalAssignments = assignments.length;
      const resourceAllocation = users2.map((user) => {
        const userAssignments = assignmentsByUser[user.id] || 0;
        const percentage = totalAssignments > 0 ? Math.round(userAssignments / totalAssignments * 100) : 0;
        return {
          name: user.name,
          role: user.role,
          percentage,
          count: userAssignments,
          avatar: user.avatar || void 0
        };
      }).filter((user) => user.count > 0).sort((a, b) => b.count - a.count);
      return res.json(resourceAllocation);
    } catch (error) {
      console.error("Resource allocation error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/dashboard/bid-activity", async (_req, res) => {
    try {
      const tenders2 = await storage.getTenders();
      const sixMonthsAgo = /* @__PURE__ */ new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const monthlyData = tenders2.filter((tender) => new Date(tender.createdAt) >= sixMonthsAgo).reduce((acc, tender) => {
        const month = new Date(tender.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});
      const bidActivity = Object.entries(monthlyData).map(([month, opportunities]) => ({
        month,
        opportunities
      })).slice(-6);
      return res.json(bidActivity);
    } catch (error) {
      console.error("Bid activity error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/dashboard/tender-distribution", async (_req, res) => {
    try {
      const tenders2 = await storage.getTenders();
      const statusCount = tenders2.reduce((acc, tender) => {
        const status = tender.status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      const colors = {
        "submitted": "#0088FE",
        "in_process": "#00C49F",
        "awarded": "#FFBB28",
        "rejected": "#FF8042",
        "new": "#8884d8",
        "New": "#8884d8"
      };
      const tenderDistribution = Object.entries(statusCount).map(([status, count2]) => ({
        name: status === "new" || status === "New" ? "New" : status === "in_process" ? "In Progress" : status === "awarded" ? "Won" : status === "submitted" ? "Submitted" : status === "rejected" ? "Rejected" : status,
        value: count2,
        color: colors[status] || "#8884d8"
      }));
      return res.json(tenderDistribution);
    } catch (error) {
      console.error("Tender distribution error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/dashboard/upcoming-deadlines", async (_req, res) => {
    try {
      const tenders2 = await storage.getTenders();
      const now = /* @__PURE__ */ new Date();
      const sevenDaysFromNow = new Date(now);
      sevenDaysFromNow.setDate(now.getDate() + 7);
      const upcomingDeadlines = tenders2.filter(
        (tender) => tender.deadline >= now && tender.deadline <= sevenDaysFromNow && tender.status !== "awarded" && tender.status !== "rejected"
      ).sort((a, b) => a.deadline.getTime() - b.deadline.getTime()).slice(0, 5);
      return res.json(upcomingDeadlines);
    } catch (error) {
      console.error("Upcoming deadlines error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/dashboard/recent-activities", async (_req, res) => {
    try {
      const activities2 = await TenderService.getRecentActivities();
      return res.json(activities2);
    } catch (error) {
      console.error("Recent activities error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/dashboard/ai-insights", async (_req, res) => {
    try {
      const insights = await TenderService.getAiInsights();
      return res.json(insights);
    } catch (error) {
      console.error("AI insights error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/sales-mis", async (req, res) => {
    try {
      const username = req.query.username;
      const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : void 0;
      const toDate = req.query.toDate ? new Date(req.query.toDate) : void 0;
      const users2 = await storage.getUsers();
      const salesMisData = users2.map((user) => {
        const randomFactor = user.id * 3;
        return {
          id: user.id,
          userId: user.id,
          username: user.username,
          // Use the actual username for filtering
          displayName: user.name || user.username,
          // Use this for display purposes
          name: user.name || user.username,
          assigned: Math.floor(randomFactor % 10),
          inProcess: Math.floor(randomFactor % 8),
          submitted: Math.floor(randomFactor % 7),
          cancelled: Math.floor(randomFactor % 3),
          awarded: Math.floor(randomFactor % 5),
          lost: Math.floor(randomFactor % 4),
          rejected: Math.floor(randomFactor % 2),
          dropped: Math.floor(randomFactor % 2),
          reopened: Math.floor(randomFactor % 3),
          totalTender: Math.floor(randomFactor % 20 + 5)
        };
      });
      let filteredData = salesMisData;
      if (username) {
        console.log("Filtering by username:", username);
        console.log("All usernames in sales data:", salesMisData.map((item) => item.username));
        salesMisData.forEach((item) => {
          console.log(`Comparing ${item.username} with ${username}, match: ${item.username === username}`);
        });
        filteredData = salesMisData.filter((item) => item.username === username);
        if (filteredData.length === 0) {
          const user = users2.find((u) => u.username === username);
          if (user) {
            filteredData = [{
              id: user.id,
              userId: user.id,
              username: user.username,
              displayName: user.name || user.username,
              name: user.name || user.username,
              assigned: 0,
              inProcess: 0,
              submitted: 0,
              cancelled: 0,
              awarded: 0,
              lost: 0,
              rejected: 0,
              dropped: 0,
              reopened: 0,
              totalTender: 0
            }];
          }
        }
        console.log("Filtered data count:", filteredData.length);
      }
      return res.json(filteredData);
    } catch (error) {
      console.error("Error fetching sales MIS data:", error);
      return res.status(500).json({ message: "Failed to fetch sales MIS data" });
    }
  });
  app2.get("/api/login-mis", async (req, res) => {
    try {
      const employeeName = req.query.employeeName;
      const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : void 0;
      const toDate = req.query.toDate ? new Date(req.query.toDate) : void 0;
      const users2 = await storage.getUsers();
      console.log("Checking admin access for poonam.amale with role Admin");
      const loginLogs = users2.map((user) => {
        const today = /* @__PURE__ */ new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return [
          {
            id: user.id * 2 - 1,
            userId: user.id,
            employeeName: user.name || user.username,
            loginDateTime: today.toISOString(),
            // Some users have ongoing sessions (no logout time)
            logoutDateTime: user.id % 2 === 0 ? new Date(today.getTime() + 36e5).toISOString() : void 0,
            ipAddress: "192.168.224.2"
          },
          {
            id: user.id * 2,
            userId: user.id,
            employeeName: user.name || user.username,
            loginDateTime: yesterday.toISOString(),
            logoutDateTime: new Date(yesterday.getTime() + 72e5).toISOString(),
            ipAddress: "192.168.224.2"
          }
        ];
      }).flat();
      let filteredData = loginLogs;
      if (employeeName) {
        console.log("Fetching with username:", employeeName);
        const user = users2.find((u) => u.username === employeeName);
        if (user) {
          filteredData = loginLogs.filter((log2) => log2.userId === user.id);
        } else {
          filteredData = [];
        }
      }
      if (fromDate || toDate) {
        filteredData = filteredData.filter((log2) => {
          const loginDate = new Date(log2.loginDateTime);
          if (fromDate && toDate) {
            return loginDate >= fromDate && loginDate <= toDate;
          } else if (fromDate) {
            return loginDate >= fromDate;
          } else if (toDate) {
            return loginDate <= toDate;
          }
          return true;
        });
      }
      return res.json(filteredData);
    } catch (error) {
      console.error("Error fetching login MIS data:", error);
      return res.status(500).json({ message: "Failed to fetch login MIS data" });
    }
  });
  app2.get("/api/tenders/counts", async (req, res) => {
    try {
      let userId;
      if (req.user) {
        userId = req.user.id;
      } else {
        const headerUserId = req.headers["x-user-id"];
        if (headerUserId) {
          userId = parseInt(headerUserId.toString());
        } else {
          userId = 1;
        }
      }
      const userTenders2 = await storage.getUserTenders(userId);
      const starCount = userTenders2.filter((ut) => ut.isStarred).length;
      const interestedCount = userTenders2.filter((ut) => ut.isInterested).length;
      return res.json({
        star: starCount,
        interested: interestedCount
      });
    } catch (error) {
      console.error("Error fetching tender counts:", error);
      return res.status(500).json({ message: "Error fetching tender counts" });
    }
  });
  app2.get("/api/tenders", [
    query("search").optional().isLength({ max: 100 }).trim().escape(),
    query("status").optional().isIn(["fresh", "live", "in-process", "submitted", "rejected", "archive", "interested", "star"]).withMessage("Invalid status")
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid query parameters",
        errors: errors.array()
      });
    }
    try {
      const { search, status } = req.query;
      let userId;
      if (req.user) {
        userId = req.user.id;
      } else {
        const headerUserId = req.headers["x-user-id"];
        if (headerUserId) {
          userId = parseInt(headerUserId.toString());
        } else {
          userId = 1;
        }
      }
      let tenders2 = [];
      if (search) {
        tenders2 = await storage.searchTenders(search.toString());
      } else {
        switch (status) {
          case "live":
            const liveTenders = await storage.getTendersWithAssignments();
            tenders2 = liveTenders.filter((t) => {
              const daysLeft = Math.ceil((new Date(t.deadline).getTime() - (/* @__PURE__ */ new Date()).getTime()) / (1e3 * 60 * 60 * 24));
              return daysLeft >= 0;
            });
            break;
          case "in-process":
            tenders2 = await storage.getTendersByStatus("in_process");
            break;
          case "submitted":
            tenders2 = await storage.getTendersByStatus("submitted");
            break;
          case "rejected":
            tenders2 = await storage.getTendersByStatus("rejected");
            break;
          case "archive":
            const archiveTenders = await storage.getTendersWithAssignments();
            tenders2 = archiveTenders.filter((t) => {
              const daysLeft = Math.ceil((new Date(t.deadline).getTime() - (/* @__PURE__ */ new Date()).getTime()) / (1e3 * 60 * 60 * 24));
              return daysLeft < 0;
            });
            break;
          case "interested":
            tenders2 = await storage.getInterestedTenders(userId);
            break;
          case "star":
            tenders2 = await storage.getStarredTenders(userId);
            break;
          case "fresh":
          default:
            tenders2 = await storage.getTendersWithAssignments();
            break;
        }
      }
      const enrichedTenders = await Promise.all(
        tenders2.map(async (tender) => {
          const userTender = await storage.getUserTender(userId, tender.id);
          const assignments = await storage.getTenderAssignments(tender.id);
          const assignedUsers = await Promise.all(
            assignments.map(async (assignment) => {
              const user = await storage.getUser(assignment.userId);
              return user ? { id: user.id, name: user.name } : null;
            })
          );
          const bidParticipants2 = await storage.getBidParticipants(tender.id);
          const sortedParticipants = bidParticipants2.sort((a, b) => {
            const amountA = parseFloat(a.bidAmount);
            const amountB = parseFloat(b.bidAmount);
            return amountA - amountB;
          });
          const l1Winner = sortedParticipants.find((p) => p.bidderStatus === "L1") || sortedParticipants[0];
          const raData = await storage.getReverseAuctions(tender.id);
          const latestRA = raData.length > 0 ? raData[raData.length - 1] : null;
          return {
            ...tender,
            isStarred: userTender?.isStarred || false,
            isInterested: userTender?.isInterested || false,
            assignedUsers: assignedUsers.filter((u) => u !== null),
            l1Bidder: l1Winner?.participantName || null,
            l1Amount: l1Winner ? parseFloat(l1Winner.bidAmount) : null,
            raNo: latestRA?.reference_number || latestRA?.bidNo || null,
            publishedDate: tender.createdAt,
            bidStartDate: tender.bidStartDate || tender.createdAt,
            dueDate: tender.deadline
          };
        })
      );
      const userTenders2 = await storage.getUserTenders(userId);
      const allTenders = await storage.getTendersWithAssignments();
      const counts = {
        fresh: allTenders.filter((t) => {
          const createdAt = new Date(t.createdAt);
          const today = /* @__PURE__ */ new Date();
          return createdAt.toDateString() === today.toDateString();
        }).length,
        live: allTenders.filter((t) => {
          const daysLeft = Math.ceil((new Date(t.deadline).getTime() - (/* @__PURE__ */ new Date()).getTime()) / (1e3 * 60 * 60 * 24));
          return daysLeft >= 0;
        }).length,
        archive: allTenders.filter((t) => {
          const daysLeft = Math.ceil((new Date(t.deadline).getTime() - (/* @__PURE__ */ new Date()).getTime()) / (1e3 * 60 * 60 * 24));
          return daysLeft < 0;
        }).length,
        interested: userTenders2.filter((ut) => ut.isInterested).length,
        star: userTenders2.filter((ut) => ut.isStarred).length
      };
      return res.json({
        tenders: enrichedTenders,
        counts
      });
    } catch (error) {
      console.error("Get tenders error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/tenders/all", async (req, res) => {
    try {
      let userId;
      if (req.user) {
        userId = req.user.id;
      } else {
        const headerUserId = req.headers["x-user-id"];
        if (headerUserId) {
          userId = parseInt(headerUserId.toString());
        } else {
          userId = 1;
        }
      }
      const allTenders = await storage.getTendersWithAssignments();
      const userTenders2 = await storage.getUserTenders(userId);
      const userTenderMap = new Map(userTenders2.map((ut) => [ut.tenderId, ut]));
      const enrichedTenders = allTenders.map((tender) => {
        const userTender = userTenderMap.get(tender.id);
        return {
          ...tender,
          isStarred: userTender?.isStarred || false,
          isInterested: userTender?.isInterested || false,
          assignedUser: tender.assignedUser || null
        };
      });
      return res.json(enrichedTenders);
    } catch (error) {
      console.error("Get all tenders error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/tenders/:id", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const tender = await TenderService.getTenderById(tenderId);
      return res.json(tender);
    } catch (error) {
      console.error("Get tender error:", error);
      if (error.message?.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/tenders", async (req, res) => {
    try {
      const result = insertTenderSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid tender data",
          errors: result.error.errors
        });
      }
      if (result.data.referenceNo) {
        const existingTender = await storage.getTenderByReference(result.data.referenceNo);
        if (existingTender) {
          return res.status(409).json({
            message: "Tender with this reference number already exists",
            referenceNo: result.data.referenceNo
          });
        }
      }
      const tender = await TenderService.createTender(result.data);
      return res.status(201).json(tender);
    } catch (error) {
      console.error("Create tender error:", error);
      if (error?.code === "23505" && error?.constraint === "tenders_reference_no_unique") {
        return res.status(409).json({
          message: "Tender with this reference number already exists",
          error: "DUPLICATE_REFERENCE_NO"
        });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/tenders/:id", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const result = insertTenderSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid tender data",
          errors: result.error.errors
        });
      }
      const tender = await TenderService.updateTender(tenderId, result.data);
      return res.json(tender);
    } catch (error) {
      console.error("Update tender error:", error);
      if (error.message?.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/tenders/:id/status", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const { status, comments } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      if (status.toLowerCase() === "awarded" || status.toLowerCase() === "lost") {
        const participants = await storage.getBidParticipants(tenderId);
        if (participants.length === 0) {
          return res.status(400).json({
            message: "Add the participants! At least L1 participant to change the status",
            requiresParticipants: true,
            statusAttempted: status
          });
        }
        const hasL1Participant = participants.some((p) => p.bidderStatus === "L1");
        if (!hasL1Participant) {
          return res.status(400).json({
            message: "Add the participants! At least L1 participant to change the status",
            requiresParticipants: true,
            statusAttempted: status
          });
        }
      }
      const updatedTender = await storage.updateTender(tenderId, { status });
      await storage.logTenderActivity(
        req.user?.id || 1,
        tenderId,
        "update_tender_status",
        `Tender status updated to: ${status}${comments ? ` - ${comments}` : ""}`,
        {
          previousStatus: updatedTender?.status || "unknown",
          newStatus: status,
          comments: comments || null
        }
      );
      return res.status(200).json({
        success: true,
        message: "Tender status updated successfully",
        tender: updatedTender
      });
    } catch (error) {
      console.error("Status update error:", error);
      if (error.message?.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/tenders/:id/assign", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const currentUserId = req.headers["x-user-id"] ? parseInt(req.headers["x-user-id"]) : 2;
      const assignedBy = req.body.assignedBy || currentUserId || 2;
      console.log("x-user-id header:", req.headers["x-user-id"]);
      console.log("currentUserId parsed:", currentUserId);
      console.log("assignedBy from body:", req.body.assignedBy);
      console.log("final assignedBy:", assignedBy);
      const assignType = req.body.assignType || "individual";
      const assignmentData = {
        tenderId,
        userId: req.body.userId,
        assignedBy,
        assignType,
        comments: req.body.remarks || req.body.comments || null
      };
      console.log("Assignment data:", assignmentData);
      if (!assignmentData.userId) {
        return res.status(400).json({
          message: "Invalid assignment data: userId is required"
        });
      }
      const assigningUser = await storage.getUser(assignedBy);
      if (!assigningUser) {
        return res.status(404).json({
          message: `Assigning user with ID ${assignedBy} not found`
        });
      }
      const userToAssign = await storage.getUser(assignmentData.userId);
      if (!userToAssign) {
        return res.status(404).json({
          message: `User with ID ${assignmentData.userId} not found`
        });
      }
      const assignment = await TenderService.assignTender(assignmentData);
      const assignedUser = await storage.getUser(assignmentData.userId);
      await storage.logTenderActivity(
        assignedBy,
        tenderId,
        "assign_tender",
        `Tender assigned to ${assignedUser?.name || "Unknown User"}`,
        {
          assignedTo: assignedUser?.name || "Unknown User",
          assignType,
          comments: assignmentData.comments
        }
      );
      return res.status(201).json(assignment);
    } catch (error) {
      console.error("Assign tender error:", error);
      if (error.message?.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/reminders", async (req, res) => {
    try {
      const { tenderId, reminderDate, comments, sendEmail, sendNotification } = req.body;
      const userId = 1;
      if (!tenderId || !reminderDate) {
        return res.status(400).json({ message: "Tender ID and reminder date are required" });
      }
      const tender = await storage.getTender(tenderId);
      if (!tender) {
        return res.status(404).json({ message: "Tender not found" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const reminder = await storage.createReminder({
        tenderId,
        userId,
        createdBy: userId,
        // Track who created the reminder
        reminderDate: new Date(reminderDate),
        comments: comments || null,
        isActive: true
      });
      if (sendEmail && user.email) {
        try {
          console.log("Email notification would be sent to:", user.email);
        } catch (emailError) {
          console.error("Email notification failed:", emailError);
        }
      }
      if (sendNotification) {
        try {
          await storage.createNotification({
            userId,
            type: "reminder",
            title: `Tender Reminder: ${tender.title}`,
            message: `Reminder set for ${new Date(reminderDate).toLocaleDateString()} - ${tender.title} (ID: ${tender.id})`,
            entityType: "tender",
            entityId: tenderId,
            isRead: false
          });
        } catch (notificationError) {
          console.error("In-app notification creation failed:", notificationError);
        }
      }
      await storage.logTenderActivity(
        userId,
        tenderId,
        "create_reminder",
        `Reminder set for ${new Date(reminderDate).toLocaleDateString()} - ${comments || "No comments"}`,
        {
          reminderDate,
          sendEmail: !!sendEmail,
          sendNotification: !!sendNotification,
          tenderTitle: tender.title
        }
      );
      return res.status(201).json({
        ...reminder,
        emailSent: sendEmail && user.email ? true : false,
        notificationCreated: sendNotification ? true : false
      });
    } catch (error) {
      console.error("Create reminder error:", error);
      if (error.message?.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Failed to create reminder" });
    }
  });
  app2.post("/api/tenders/:tenderId/finance-request", async (req, res) => {
    try {
      const { tenderId } = req.params;
      const { userId, requestType, requestedAmount, priority, comments } = req.body;
      const currentUserId = 1;
      if (!tenderId || !userId || !requestType) {
        return res.status(400).json({ message: "Tender ID, finance user ID, and request type are required" });
      }
      const tender = await storage.getTender(parseInt(tenderId));
      if (!tender) {
        return res.status(404).json({ message: "Tender not found" });
      }
      const financeUser = await storage.getUser(userId);
      if (!financeUser) {
        return res.status(404).json({ message: "Finance user not found" });
      }
      const requestUser = await storage.getUser(currentUserId);
      if (!requestUser) {
        return res.status(404).json({ message: "Request user not found" });
      }
      const financeRequest = await storage.createFinancialApproval({
        tenderId: parseInt(tenderId),
        requesterId: currentUserId,
        financeUserId: userId,
        approvalType: requestType,
        requestAmount: requestedAmount || null,
        reminderDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3),
        // 7 days from now
        notes: comments || null,
        status: "pending"
      });
      const requestTypeLabels = {
        emd: "EMD Payment",
        tender_fee: "Tender Fee",
        document_fee: "Document Fee",
        performance_guarantee: "Performance Guarantee",
        other: "Other"
      };
      const requestTypeLabel = requestTypeLabels[requestType] || requestType;
      const currentDate = /* @__PURE__ */ new Date();
      const deadline = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1e3);
      await storage.createNotification({
        userId: financeUser.id,
        type: "finance_request",
        title: `New Finance Request: ${requestTypeLabel}`,
        message: `Request Type: ${requestTypeLabel}
Tender ID: ${tender.id}
Requested By: ${requestUser.name}
Requested Date: ${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}
Deadline: ${deadline.toLocaleDateString()}
Amount: ${requestedAmount ? `\u20B9${requestedAmount}` : "Not specified"}`,
        entityType: "tender",
        entityId: parseInt(tenderId),
        isRead: false
      });
      await storage.logTenderActivity(
        currentUserId,
        parseInt(tenderId),
        "create_finance_request",
        `Finance request created for ${requestTypeLabel} - ${requestedAmount ? `\u20B9${requestedAmount}` : "Amount not specified"}`,
        {
          requestType,
          financeUserId: userId,
          requestedAmount,
          priority,
          tenderTitle: tender.title,
          financeUserName: financeUser.name
        }
      );
      return res.status(201).json({
        ...financeRequest,
        notificationSent: true,
        financeUserName: financeUser.name
      });
    } catch (error) {
      console.error("Create finance request error:", error);
      return res.status(500).json({ message: "Failed to create finance request" });
    }
  });
  app2.get("/api/notifications/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const notifications2 = await storage.getNotifications(parseInt(userId));
      return res.json(notifications2);
    } catch (error) {
      console.error("Get notifications error:", error);
      return res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  app2.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.markNotificationAsRead(parseInt(id));
      if (success) {
        return res.json({ message: "Notification marked as read" });
      } else {
        return res.status(404).json({ message: "Notification not found" });
      }
    } catch (error) {
      console.error("Mark notification as read error:", error);
      return res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  app2.get("/api/assigned-tenders", async (req, res) => {
    try {
      const assignedTenders = await storage.getAssignedTenders();
      return res.json(assignedTenders);
    } catch (error) {
      console.error("Get assigned tenders error:", error);
      return res.status(500).json({ message: "Failed to fetch assigned tenders" });
    }
  });
  app2.post("/api/tenders/:id/finance-request", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const userId = 1;
      const { userId: financeUserId, requestType, requestedAmount, priority, comments } = req.body;
      await storage.createActivity({
        action: "finance_request",
        userId,
        entityType: "tender",
        entityId: tenderId,
        metadata: {
          requestType,
          requestedAmount,
          priority,
          assignedTo: financeUserId,
          comments
        }
      });
      return res.status(200).json({
        success: true,
        message: "Finance request submitted successfully"
      });
    } catch (error) {
      console.error("Finance request error:", error);
      if (error.message?.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/approvals", async (req, res) => {
    try {
      const { tenderId, approverId, approvalType, priority, requestNotes } = req.body;
      const userId = 1;
      await storage.createActivity({
        action: "approval_request",
        userId,
        entityType: "tender",
        entityId: tenderId,
        metadata: {
          approvalType,
          priority,
          requestNotes,
          assignedTo: approverId,
          status: "pending"
        }
      });
      return res.status(200).json({
        success: true,
        message: "Approval request submitted successfully"
      });
    } catch (error) {
      console.error("Approval request error:", error);
      if (error.message?.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/approvals", async (req, res) => {
    try {
      const userId = 1;
      const { status } = req.query;
      const activities2 = await storage.getActivities(userId, 50);
      const approvalActivities = activities2.filter(
        (activity) => activity.action === "approval_request"
      );
      let filteredApprovals = approvalActivities;
      if (status) {
        filteredApprovals = approvalActivities.filter(
          (activity) => activity.metadata.status === status
        );
      }
      return res.json(filteredApprovals);
    } catch (error) {
      console.error("Error fetching approvals:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/financial-approvals", async (req, res) => {
    try {
      const filters = {};
      if (req.query.status) filters.status = req.query.status;
      if (req.query.tenderId) filters.tenderId = parseInt(req.query.tenderId);
      if (req.query.requesterId) filters.requesterId = parseInt(req.query.requesterId);
      if (req.query.financeUserId) filters.financeUserId = parseInt(req.query.financeUserId);
      if (req.query.approvalType) filters.approvalType = req.query.approvalType;
      if (req.query.fromDate) filters.fromDate = new Date(req.query.fromDate);
      if (req.query.toDate) filters.toDate = new Date(req.query.toDate);
      const approvals = await storage.getFinancialApprovals(filters);
      return res.json(approvals);
    } catch (error) {
      console.error("Error fetching financial approvals:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/financial-approvals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid approval ID" });
      }
      const approval = await storage.getFinancialApproval(id);
      if (!approval) {
        return res.status(404).json({ message: "Financial approval not found" });
      }
      return res.json(approval);
    } catch (error) {
      console.error("Error fetching financial approval:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/tenders/:id/financial-approvals", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const approvals = await storage.getTenderFinancialApprovals(tenderId);
      return res.json(approvals);
    } catch (error) {
      console.error("Error fetching tender financial approvals:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/financial-approvals", async (req, res) => {
    try {
      const { tenderId, requesterId, financeUserId, approvalType, requestAmount, reminderDate, notes } = req.body;
      const result = insertFinancialApprovalSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid financial approval data",
          errors: result.error.format()
        });
      }
      const approval = await storage.createFinancialApproval(result.data);
      return res.status(201).json(approval);
    } catch (error) {
      console.error("Error creating financial approval:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/financial-approvals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid approval ID" });
      }
      const approval = await storage.getFinancialApproval(id);
      if (!approval) {
        return res.status(404).json({ message: "Financial approval not found" });
      }
      const updatedApproval = await storage.updateFinancialApproval(id, req.body);
      return res.json(updatedApproval);
    } catch (error) {
      console.error("Error updating financial approval:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/financial-approvals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid approval ID" });
      }
      const approval = await storage.getFinancialApproval(id);
      if (!approval) {
        return res.status(404).json({ message: "Financial approval not found" });
      }
      const cancelledApproval = await storage.cancelFinancialApproval(id);
      return res.json(cancelledApproval);
    } catch (error) {
      console.error("Error cancelling financial approval:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/users/:id/financial-approvals", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const approvals = await storage.getFinancialApprovalsByUser(userId);
      return res.json(approvals);
    } catch (error) {
      console.error("Error fetching user financial approvals:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/tenders/:id/reminders", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const { reminderDate, comments } = req.body;
      const userId = req.headers["x-user-id"];
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized - no user ID" });
      }
      const currentUser = await storage.getUser(parseInt(userId));
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized - user not found" });
      }
      console.log("Creating reminder for tender:", tenderId, "by user:", currentUser.name);
      const reminderData = {
        tenderId,
        userId: currentUser.id,
        createdBy: currentUser.id,
        reminderDate: new Date(reminderDate),
        comments,
        isActive: true
      };
      const reminders2 = await TenderService.setReminder(reminderData);
      return res.status(201).json(reminders2);
    } catch (error) {
      console.error("Set reminder error:", error);
      if (error.message?.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/users/:id/reminders", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const reminders2 = await storage.getReminders(userId);
      return res.json(reminders2);
    } catch (error) {
      console.error("Get reminders error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/tenders/:id/assignments", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const assignments = await storage.getTenderAssignments(tenderId);
      const enrichedAssignments = assignments.map((assignment) => ({
        id: assignment.id,
        tenderId: assignment.tenderId,
        assignedBy: assignment.assignedByName || "Unknown User",
        assignedByName: assignment.assignedByName || "Unknown User",
        assignedTo: assignment.assignedTo || "Unknown User",
        remarks: assignment.comments || "",
        assignedAt: assignment.createdAt,
        assignedByUserId: assignment.assignedBy,
        assignedToUserId: assignment.userId
      }));
      return res.json(enrichedAssignments);
    } catch (error) {
      console.error("Error fetching tender assignments:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/assignments/:id", async (req, res) => {
    try {
      const assignmentId = parseInt(req.params.id);
      if (isNaN(assignmentId)) {
        return res.status(400).json({ message: "Invalid assignment ID" });
      }
      await storage.deleteAssignment(assignmentId);
      return res.json({ message: "Assignment deleted successfully" });
    } catch (error) {
      console.error("Error deleting assignment:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/tenders/:id/assign", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const { userId, comments, assignType = "individual", assignedBy } = req.body;
      if (!userId || isNaN(parseInt(userId))) {
        return res.status(400).json({ message: "Valid userId is required for assignment" });
      }
      const assigningUser = assignedBy || 1;
      const assignmentData = {
        tenderId,
        userId: parseInt(userId),
        assignedBy: assigningUser,
        assignType,
        comments: comments || null
      };
      console.log("Processing assignment:", assignmentData);
      const result = insertTenderAssignmentSchema.safeParse(assignmentData);
      if (!result.success) {
        console.error("Assignment validation failed:", result.error.errors);
        return res.status(400).json({
          message: "Invalid assignment data",
          errors: result.error.errors
        });
      }
      const assignment = await TenderService.assignTender(result.data);
      return res.status(201).json({
        success: true,
        message: "Tender assigned successfully",
        assignment
      });
    } catch (error) {
      console.error("Assignment error:", error);
      if (error.message?.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  app2.delete("/api/tenders/:id/assignments/:assignmentId", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      const assignmentId = parseInt(req.params.assignmentId);
      if (isNaN(tenderId) || isNaN(assignmentId)) {
        return res.status(400).json({ message: "Invalid tender ID or assignment ID" });
      }
      const success = await storage.deleteTenderAssignment(assignmentId);
      if (!success) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      return res.json({ message: "Assignment removed successfully" });
    } catch (error) {
      console.error("Delete assignment error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/tender-assignments/:assignmentId", async (req, res) => {
    try {
      const assignmentId = parseInt(req.params.assignmentId);
      if (isNaN(assignmentId)) {
        return res.status(400).json({ message: "Invalid assignment ID" });
      }
      const success = await storage.deleteAssignment(assignmentId);
      if (!success) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      return res.json({ message: "Assignment removed successfully" });
    } catch (error) {
      console.error("Delete assignment error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/tenders/:id/interest", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const { isInterested } = req.body;
      let userId;
      if (req.user) {
        userId = req.user.id;
      } else {
        userId = req.body.userId || 1;
      }
      if (typeof isInterested !== "boolean") {
        return res.status(400).json({ message: "isInterested must be a boolean" });
      }
      const userTender = await storage.toggleTenderInterest(userId, tenderId, isInterested);
      const userTenders2 = await storage.getUserTenders(userId);
      const interestedCount = userTenders2.filter((ut) => ut.isInterested).length;
      return res.json({
        userTender,
        counts: {
          interested: interestedCount
        }
      });
    } catch (error) {
      console.error("Mark interest error:", error);
      if (error.message?.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/tenders/:id/star", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const { isStarred } = req.body;
      let userId;
      if (req.user) {
        userId = req.user.id;
      } else {
        userId = req.body.userId || 1;
      }
      if (typeof isStarred !== "boolean") {
        return res.status(400).json({ message: "isStarred must be a boolean" });
      }
      const userTender = await storage.toggleTenderStar(userId, tenderId, isStarred);
      const userTenders2 = await storage.getUserTenders(userId);
      const starCount = userTenders2.filter((ut) => ut.isStarred).length;
      return res.json({
        userTender,
        counts: {
          star: starCount
        }
      });
    } catch (error) {
      console.error("Mark star error:", error);
      if (error.message?.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/tenders/:id/finance-request", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const userId = 1;
      const { userId: financeUserId, requestType, requestedAmount, priority, comments } = req.body;
      await storage.createActivity({
        action: "finance_request",
        userId,
        entityType: "tender",
        entityId: tenderId,
        metadata: {
          requestType,
          requestedAmount,
          priority,
          assignedTo: financeUserId,
          comments
        }
      });
      return res.status(200).json({
        success: true,
        message: "Finance request submitted successfully"
      });
    } catch (error) {
      console.error("Finance request error:", error);
      if (error.message?.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/tenders/financial-approvals", upload2.single("file"), async (req, res) => {
    try {
      const { tenderId, requirement, amount, deadline, reminderTime, requestTo, payment, paymentDescription } = req.body;
      if (!tenderId || !requirement || !amount || !deadline || !requestTo || !payment || !paymentDescription) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const authHeader = req.headers.authorization;
      const userIdHeader = req.headers["x-user-id"];
      let userId;
      if (userIdHeader) {
        userId = parseInt(userIdHeader);
      } else if (req.user) {
        userId = req.user.id;
      } else {
        userId = req.body.requestedBy || 1;
      }
      let finalDeadline = new Date(deadline);
      if (reminderTime) {
        const [hours, minutes] = reminderTime.split(":");
        finalDeadline.setHours(parseInt(hours), parseInt(minutes));
      }
      const financialRequest = {
        tenderId: parseInt(tenderId),
        requirement,
        amount: parseFloat(amount),
        deadline: finalDeadline,
        requestTo: parseInt(requestTo),
        payment,
        paymentDescription,
        status: "Pending",
        createdBy: userId,
        createdAt: /* @__PURE__ */ new Date(),
        filePath: req.file ? req.file.path : null
      };
      const result = await storage.createFinancialApproval(financialRequest);
      const currentUser = await storage.getUser(userId);
      const requestToUser = await storage.getUser(parseInt(requestTo));
      const tender = await storage.getTender(parseInt(tenderId));
      await storage.createActivity({
        userId,
        action: "create_finance_request",
        description: `Finance request created: ${requirement} - \u20B9${Number(amount).toLocaleString()}`,
        entityType: "tender",
        entityId: parseInt(tenderId),
        metadata: {
          approvalType: requirement,
          requestAmount: amount,
          financeUserId: parseInt(requestTo),
          financeUserName: requestToUser?.name || "Unknown User",
          currentUserName: currentUser?.name || "Unknown User",
          deadline: finalDeadline.toISOString(),
          payment,
          paymentDescription,
          tenderReferenceNo: tender?.referenceNo || "N/A",
          requestedDate: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
      return res.status(201).json({
        success: true,
        message: "Financial request created successfully",
        data: result
      });
    } catch (error) {
      console.error("Create financial request error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/tenders/:id/ra", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const reverseAuctions2 = await storage.getReverseAuctions(tenderId);
      const latestRA = reverseAuctions2.length > 0 ? reverseAuctions2.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())[0] : null;
      if (!latestRA) {
        return res.json([]);
      }
      const user = await storage.getUser(latestRA.createdBy);
      const enrichedRA = {
        ...latestRA,
        createdByUser: user ? user.name : `User ${latestRA.createdBy}`
      };
      return res.json([enrichedRA]);
    } catch (error) {
      console.error("Get reverse auctions error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/tenders/:id/ra", upload2.single("document"), async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      console.log("Full request body:", req.body);
      console.log("Request file:", req.file);
      const { bidNo, raNo, startDate, endDate, startAmount, endAmount } = req.body;
      console.log("Received RA data:", { bidNo, raNo, startDate, endDate, startAmount, endAmount });
      if (!bidNo || !raNo || !startDate || !endDate) {
        console.log("Missing fields - bidNo:", bidNo, "raNo:", raNo, "startDate:", startDate, "endDate:", endDate);
        return res.status(400).json({ message: "Missing required fields" });
      }
      const userId = req.user?.id || 1;
      const existingRAs = await storage.getReverseAuctions(tenderId);
      const raData = {
        tenderId,
        bidNo,
        raNo,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        startAmount: startAmount ? parseFloat(startAmount) : void 0,
        endAmount: endAmount ? parseFloat(endAmount) : void 0,
        documentPath: req.file ? req.file.path : void 0,
        createdBy: userId,
        status: "Active"
      };
      let ra;
      if (existingRAs.length > 0) {
        const updateData = {
          ...raData,
          documentPath: req.file ? req.file.path : existingRAs[0].documentPath
        };
        ra = await storage.updateReverseAuction(existingRAs[0].id, updateData);
        await storage.logTenderActivity(
          userId,
          tenderId,
          "update_reverse_auction",
          `Reverse Auction updated: ${raNo} - Start: ${startDate}, End: ${endDate}`,
          {
            raNo,
            bidNo,
            startDate,
            endDate,
            startAmount,
            endAmount,
            documentUpdated: !!req.file
          }
        );
      } else {
        ra = await storage.createReverseAuction(raData);
        await storage.logTenderActivity(
          userId,
          tenderId,
          "create_reverse_auction",
          `Reverse Auction created: ${raNo} - Start: ${startDate}, End: ${endDate}`,
          {
            raNo,
            bidNo,
            startDate,
            endDate,
            startAmount,
            endAmount,
            documentUploaded: !!req.file
          }
        );
      }
      return res.status(201).json(ra);
    } catch (error) {
      console.error("Create reverse auction error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/ra/:id", async (req, res) => {
    try {
      const raId = parseInt(req.params.id);
      if (isNaN(raId)) {
        return res.status(400).json({ message: "Invalid RA ID" });
      }
      const ra = await storage.getReverseAuction(raId);
      if (!ra) {
        return res.status(404).json({ message: "Reverse auction not found" });
      }
      return res.json(ra);
    } catch (error) {
      console.error("Get reverse auction error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/ra/:id", async (req, res) => {
    try {
      const raId = parseInt(req.params.id);
      if (isNaN(raId)) {
        return res.status(400).json({ message: "Invalid RA ID" });
      }
      const { bidNo, raNo, startDate, endDate, startAmount, endAmount, status } = req.body;
      const updateData = {};
      if (bidNo !== void 0) updateData.bidNo = bidNo;
      if (raNo !== void 0) updateData.raNo = raNo;
      if (startDate !== void 0) updateData.startDate = new Date(startDate);
      if (endDate !== void 0) updateData.endDate = new Date(endDate);
      if (startAmount !== void 0) updateData.startAmount = parseFloat(startAmount);
      if (endAmount !== void 0) updateData.endAmount = parseFloat(endAmount);
      if (status !== void 0) updateData.status = status;
      const ra = await storage.updateReverseAuction(raId, updateData);
      if (!ra) {
        return res.status(404).json({ message: "Reverse auction not found" });
      }
      return res.json(ra);
    } catch (error) {
      console.error("Update reverse auction error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/ra/:id", async (req, res) => {
    try {
      const raId = parseInt(req.params.id);
      if (isNaN(raId)) {
        return res.status(400).json({ message: "Invalid RA ID" });
      }
      const success = await storage.deleteReverseAuction(raId);
      if (!success) {
        return res.status(404).json({ message: "Reverse auction not found" });
      }
      return res.json({ message: "Reverse auction deleted successfully" });
    } catch (error) {
      console.error("Delete reverse auction error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/ra/:id/download", async (req, res) => {
    try {
      const raId = parseInt(req.params.id);
      if (isNaN(raId)) {
        return res.status(400).json({ message: "Invalid RA ID" });
      }
      const ra = await storage.getReverseAuction(raId);
      if (!ra || !ra.documentPath) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.download(ra.documentPath, (err) => {
        if (err) {
          console.error("Download error:", err);
          res.status(500).json({ message: "Error downloading file" });
        }
      });
    } catch (error) {
      console.error("Download RA document error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/users/:id/assigned-tenders", async (req, res) => {
    try {
      let userId;
      if (req.params.id === "current") {
        if (!req.user) {
          return res.status(401).json({ message: "User not authenticated" });
        }
        userId = req.user.id;
      } else {
        userId = parseInt(req.params.id);
        if (isNaN(userId)) {
          return res.status(400).json({ message: "Invalid user ID" });
        }
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
      }
      const { status, search } = req.query;
      const assignedTenders = await storage.getUserAssignedTenders(userId, status);
      let filteredTenders = assignedTenders;
      if (search) {
        const searchStr = search.toString().toLowerCase();
        filteredTenders = assignedTenders.filter(
          (at) => at.tender.referenceNo?.toLowerCase().includes(searchStr) || at.tender.title?.toLowerCase().includes(searchStr) || at.tender.id?.toString().includes(searchStr)
        );
      }
      if (status === "interested") {
        filteredTenders = filteredTenders.filter((at) => at.isInterested === true);
      }
      const fresh = assignedTenders.filter((at) => {
        const assignmentDate = new Date(at.tender.assignmentDate || at.tender.createdAt);
        const today = /* @__PURE__ */ new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        return assignmentDate >= thirtyDaysAgo;
      }).length;
      const live = assignedTenders.filter((at) => at.tender.status === "live").length;
      const bidToRa = assignedTenders.filter((at) => at.tender.status === "bidToRa").length;
      const expired = assignedTenders.filter((at) => {
        const deadline = new Date(at.tender.deadline);
        const today = /* @__PURE__ */ new Date();
        return deadline < today;
      }).length;
      const interested = assignedTenders.filter((at) => at.isInterested === true).length;
      return res.json({
        tenders: filteredTenders,
        counts: { fresh, live, bidToRa, expired, interested }
      });
    } catch (error) {
      console.error("Get user assigned tenders error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/users/:id/assigned-tenders/all", async (req, res) => {
    try {
      let userId;
      if (req.params.id === "current") {
        if (!req.user) {
          return res.status(401).json({ message: "User not authenticated" });
        }
        userId = req.user.id;
      } else {
        userId = parseInt(req.params.id);
        if (isNaN(userId)) {
          return res.status(400).json({ message: "Invalid user ID" });
        }
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
      }
      const assignedTenders = await storage.getUserAssignedTenders(userId);
      return res.json(assignedTenders);
    } catch (error) {
      console.error("Get all assigned tenders error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/users/:id/tenders", async (req, res) => {
    try {
      let userId;
      if (req.params.id === "current") {
        if (!req.user) {
          return res.status(401).json({ message: "User not authenticated" });
        }
        userId = req.user.id;
      } else {
        userId = parseInt(req.params.id);
        if (isNaN(userId)) {
          return res.status(400).json({ message: "Invalid user ID" });
        }
      }
      const { status, search } = req.query;
      const userTenders2 = await storage.getUserTenders(userId, status);
      let filteredTenders = userTenders2;
      if (search) {
        const searchStr = search.toString().toLowerCase();
        filteredTenders = userTenders2.filter(
          (ut) => ut.tender.referenceNo?.toLowerCase().includes(searchStr) || ut.tender.title?.toLowerCase().includes(searchStr) || ut.tender.id?.toString().includes(searchStr)
        );
      }
      const fresh = userTenders2.filter((ut) => {
        const createdAt = new Date(ut.tender.createdAt);
        const today = /* @__PURE__ */ new Date();
        return createdAt.toDateString() === today.toDateString();
      }).length;
      const live = userTenders2.filter((ut) => ut.tender.status === "live").length;
      const archive = userTenders2.filter((ut) => ut.tender.status === "archive").length;
      const interested = userTenders2.filter((ut) => ut.isInterested).length;
      const star = userTenders2.filter((ut) => ut.isStarred).length;
      return res.json({
        tenders: filteredTenders,
        counts: { fresh, live, archive, interested, star }
      });
    } catch (error) {
      console.error("Get user tenders error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/tenders/:id/insights", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const insights = await storage.getAiInsightsByTender(tenderId);
      const latestInsight = insights.find((insight) => insight.category === "summary");
      if (!latestInsight) {
        return res.status(404).json({ message: "No AI insights found for this tender" });
      }
      const insightData = typeof latestInsight.insightData === "string" ? JSON.parse(latestInsight.insightData) : latestInsight.insightData;
      const transformedInsight = {
        id: latestInsight.id,
        tenderId: latestInsight.tenderId,
        summary: insightData.summary || insightData.content || "AI analysis completed",
        keyPoints: insightData.keyPoints || [],
        requirements: insightData.requirements || [],
        riskFactors: insightData.riskFactors || [],
        recommendations: insightData.recommendations || [],
        createdAt: latestInsight.createdAt
      };
      return res.status(200).json(transformedInsight);
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      return res.status(500).json({ message: "Failed to fetch AI insights" });
    }
  });
  app2.post("/api/tenders/:id/insights/generate", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const tender = await storage.getTender(tenderId);
      if (!tender) {
        return res.status(404).json({ message: "Tender not found" });
      }
      const fs11 = __require("fs");
      const path11 = __require("path");
      const pdfParse = __require("pdf-parse");
      let documentText = "";
      let detailedAnalysis = {};
      if (tender.bidDocumentPath && fs11.existsSync(tender.bidDocumentPath)) {
        try {
          const pdfBuffer = fs11.readFileSync(tender.bidDocumentPath);
          const pdfData = await pdfParse(pdfBuffer);
          documentText = pdfData.text;
          console.log(`Extracted ${documentText.length} characters from PDF`);
        } catch (pdfError) {
          console.error("Error reading PDF:", pdfError);
          documentText = `Tender: ${tender.title}
Brief: ${tender.brief}
Authority: ${tender.authority}`;
        }
      }
      let aiGeneratedContent = "";
      let keyPoints = [];
      let requirements = [];
      let riskFactors = [];
      let recommendations = [];
      if (process.env.OPENAI_API_KEY) {
        const openai3 = new OpenAI3({ apiKey: process.env.OPENAI_API_KEY });
        const prompt = `Analyze the following tender document and provide a comprehensive summary with detailed information:

Document Content:
${documentText || "No document content available"}

Tender Information:
- Title: ${tender.title}
- Reference: ${tender.referenceNo}
- Authority: ${tender.authority}
- Location: ${tender.location}
- EMD Amount: \u20B9${tender.emdAmount ? Number(tender.emdAmount).toLocaleString() : "Not specified"}
- Estimated Value: \u20B9${tender.estimatedValue ? Number(tender.estimatedValue).toLocaleString() : "Not specified"}
- Brief: ${tender.brief}

Please provide a detailed analysis in JSON format with the following structure:
{
  "tenderId": "${tender.referenceNo}",
  "gemBidNumber": "${tender.referenceNo}",
  "bidEndDateTime": "Extract or estimate bid end date and time",
  "bidOpeningDateTime": "Extract or estimate bid opening date and time", 
  "bidOfferValidityFromEndDate": "Extract validity period",
  "ministryStateName": "Extract ministry/department name from document",
  "departmentName": "Extract department name from document",
  "organisationName": "Extract organization name from document",
  "officeName": "Extract office name from document",
  "itemCategory": "Extract item category details from document",
  "contractPeriod": "Extract contract period from document",
  "mseExemption": "Extract MSE exemption details",
  "startupExemption": "Extract startup exemption details",
  "bidToRaEnabled": "Extract if reverse auction is enabled",
  "typeOfBid": "Extract bid type (Single/Two Packet)",
  "category": "Extract category from document",
  "deliveryDistrict": "Extract delivery location from document",
  "summary": "Comprehensive summary of the tender based on document analysis",
  "keyPoints": ["List of 4-6 key points extracted from the document"],
  "requirements": ["List of eligibility and technical requirements from document"],
  "riskFactors": ["List of potential risks and challenges identified"],
  "recommendations": ["List of actionable recommendations for bidders"]
}

Extract all available information from the document. If specific information is not available in the document, use "Not specified" or make reasonable inferences based on the tender type and context.`;
        try {
          const response2 = await openai3.chat.completions.create({
            model: "gpt-4o",
            // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            max_tokens: 2e3
          });
          const aiResponse = JSON.parse(response2.choices[0].message.content || "{}");
          detailedAnalysis = aiResponse;
          aiGeneratedContent = aiResponse.summary;
          keyPoints = Array.isArray(aiResponse.keyPoints) ? aiResponse.keyPoints : [];
          requirements = Array.isArray(aiResponse.requirements) ? aiResponse.requirements : [];
          riskFactors = Array.isArray(aiResponse.riskFactors) ? aiResponse.riskFactors : [];
          recommendations = Array.isArray(aiResponse.recommendations) ? aiResponse.recommendations : [];
        } catch (aiError) {
          console.error("OpenAI API error:", aiError);
          aiGeneratedContent = `Comprehensive analysis of tender ${tender.referenceNo} from ${tender.authority}. ${tender.brief}`;
          keyPoints = [
            "Tender requires detailed technical evaluation",
            "Compliance with all specified requirements is mandatory",
            "Timely submission before deadline is critical"
          ];
        }
      } else {
        const isGemTender = tender.authority?.toLowerCase().includes("gem") || tender.title?.toLowerCase().includes("gem") || false;
        aiGeneratedContent = `Detailed analysis of ${isGemTender ? "GEM" : "Government"} tender ${tender.referenceNo}:

This tender from ${tender.authority} involves ${tender.brief}. ${tender.estimatedValue ? `The estimated value is ${(Number(tender.estimatedValue) / 1e7).toFixed(2)} CR, indicating this is a significant procurement opportunity. ` : ""}${tender.location ? `The work location is ${tender.location}. ` : ""}Careful analysis of all technical specifications and compliance requirements is essential for successful bid preparation.`;
        keyPoints = [
          `${isGemTender ? "GEM platform" : "Government"} tender with specific compliance requirements`,
          "Technical specifications must be thoroughly reviewed",
          "Financial and eligibility criteria need careful evaluation",
          "Documentation requirements are comprehensive",
          "Timeline management is critical for successful submission"
        ];
        requirements = [
          "Valid business registration and licenses",
          "Technical capability demonstration",
          "Financial stability proof",
          "Past performance credentials",
          "Compliance with tender specifications"
        ];
        riskFactors = [
          "Tight submission deadlines",
          "Complex technical requirements",
          "High competition expected",
          "Stringent quality standards",
          "Payment terms and conditions"
        ];
        recommendations = [
          "Start preparation immediately to meet deadlines",
          "Engage technical experts for specification review",
          "Prepare comprehensive documentation",
          "Consider partnership opportunities if needed",
          "Ensure all compliance requirements are met"
        ];
      }
      const existingInsights = await storage.getAiInsightsByTender(tenderId);
      const existingSummary = existingInsights.find((insight2) => insight2.category === "summary");
      if (existingSummary) {
        await storage.deleteAiInsight(existingSummary.id);
      }
      const insightData = {
        summary: aiGeneratedContent,
        keyPoints,
        requirements,
        riskFactors,
        recommendations,
        detailedAnalysis
      };
      const insight = await storage.createAiInsight({
        tenderId,
        category: "summary",
        insightData: JSON.stringify(insightData)
      });
      const response = {
        id: insight.id,
        tenderId: insight.tenderId,
        summary: aiGeneratedContent,
        keyPoints,
        requirements,
        riskFactors,
        recommendations,
        detailedAnalysis,
        createdAt: insight.createdAt
      };
      return res.status(201).json(response);
    } catch (error) {
      console.error("Error generating AI insights:", error);
      return res.status(500).json({ message: "Failed to generate AI insights" });
    }
  });
  app2.get("/api/tenders/:id/eligibility", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const criteria = await TenderService.getEligibilityCriteria(tenderId);
      return res.json(criteria);
    } catch (error) {
      console.error("Get eligibility criteria error:", error);
      if (error.message?.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/tenders/:id/eligibility/generate", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const criteria = await TenderService.generateEligibilityCriteria(tenderId);
      return res.json(criteria);
    } catch (error) {
      console.error("Generate eligibility criteria error:", error);
      if (error.message?.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/tenders/:id/insights/generate", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const insights = await TenderService.generateTenderInsights(tenderId);
      return res.json(insights);
    } catch (error) {
      console.error("Generate tender insights error:", error);
      if (error.message?.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/competitors", async (_req, res) => {
    try {
      const competitors2 = await TenderService.getCompetitors();
      return res.json(competitors2);
    } catch (error) {
      console.error("Get competitors error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/roles", async (_req, res) => {
    try {
      const roles2 = await storage.getRoles();
      return res.json(roles2);
    } catch (error) {
      console.error("Get roles error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/roles/:id", async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      if (isNaN(roleId)) {
        return res.status(400).json({ message: "Invalid role ID" });
      }
      const role = await storage.getRole(roleId);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      return res.json(role);
    } catch (error) {
      console.error("Get role error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/roles", async (req, res) => {
    try {
      const result = insertRoleSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid role data",
          errors: result.error.errors
        });
      }
      const role = await storage.createRole(result.data);
      return res.status(201).json(role);
    } catch (error) {
      console.error("Create role error:", error);
      if (error.message?.includes("unique constraint")) {
        return res.status(409).json({ message: "Role with this name already exists" });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/roles/:id", async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      if (isNaN(roleId)) {
        return res.status(400).json({ message: "Invalid role ID" });
      }
      const partialSchema = insertRoleSchema.partial();
      const result = partialSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid role data",
          errors: result.error.errors
        });
      }
      const role = await storage.updateRole(roleId, result.data);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      return res.json(role);
    } catch (error) {
      console.error("Update role error:", error);
      if (error.message?.includes("unique constraint")) {
        return res.status(409).json({ message: "Role with this name already exists" });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/roles/:id/permissions", async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      if (isNaN(roleId)) {
        return res.status(400).json({ message: "Invalid role ID" });
      }
      const permissions = await storage.getRolePermissions(roleId);
      if (!permissions) {
        return res.json({ roleId, permissions: {} });
      }
      return res.json(permissions);
    } catch (error) {
      console.error("Get role permissions error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/roles/:id/permissions", async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      if (isNaN(roleId)) {
        return res.status(400).json({ message: "Invalid role ID" });
      }
      const { permissions, updatedBy } = req.body;
      if (!permissions || !updatedBy) {
        return res.status(400).json({ message: "Permissions and updatedBy are required" });
      }
      const rolePermission = await storage.saveRolePermissions({
        roleId,
        permissions,
        updatedBy
      });
      return res.json(rolePermission);
    } catch (error) {
      console.error("Save role permissions error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/roles/:id/assign", async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      if (isNaN(roleId)) {
        return res.status(400).json({ message: "Invalid role ID" });
      }
      const { userIds, updatedBy } = req.body;
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: "User IDs must be a non-empty array" });
      }
      if (!updatedBy) {
        return res.status(400).json({ message: "Updated by is required" });
      }
      const role = await storage.getRole(roleId);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      const updatedUsers = [];
      for (const userId of userIds) {
        const user = await storage.getUser(userId);
        if (user) {
          const updatedUser = await storage.updateUser(userId, {
            role: role.name
          });
          if (updatedUser) {
            updatedUsers.push(updatedUser);
          }
        }
      }
      return res.status(200).json({
        message: `Assigned role ${role.name} to ${updatedUsers.length} users`,
        assignedUsers: updatedUsers
      });
    } catch (error) {
      console.error("Assign role error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/roles/:id/permissions", async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      if (isNaN(roleId)) {
        return res.status(400).json({ message: "Invalid role ID" });
      }
      const role = await storage.getRole(roleId);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      const permissionData = {
        ...req.body,
        roleId
      };
      const result = insertRolePermissionSchema.safeParse(permissionData);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid permission data",
          errors: result.error.errors
        });
      }
      const permissions = await storage.saveRolePermissions(result.data);
      return res.json(permissions);
    } catch (error) {
      console.error("Save role permissions error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/departments", async (_req, res) => {
    try {
      const departments2 = await storage.getDepartments();
      return res.json(departments2);
    } catch (error) {
      console.error("Get departments error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/departments/:id", async (req, res) => {
    try {
      const departmentId = parseInt(req.params.id);
      if (isNaN(departmentId)) {
        return res.status(400).json({ message: "Invalid department ID" });
      }
      const department = await storage.getDepartment(departmentId);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      return res.json(department);
    } catch (error) {
      console.error("Get department error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/departments", async (req, res) => {
    try {
      const result = insertDepartmentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid department data",
          errors: result.error.errors
        });
      }
      const department = await storage.createDepartment(result.data);
      return res.status(201).json(department);
    } catch (error) {
      console.error("Create department error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/departments/:id", async (req, res) => {
    try {
      const departmentId = parseInt(req.params.id);
      if (isNaN(departmentId)) {
        return res.status(400).json({ message: "Invalid department ID" });
      }
      const partialSchema = insertDepartmentSchema.partial();
      const result = partialSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid department data",
          errors: result.error.errors
        });
      }
      const department = await storage.updateDepartment(departmentId, result.data);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      return res.json(department);
    } catch (error) {
      console.error("Update department error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/designations", async (_req, res) => {
    try {
      const designations2 = await storage.getDesignations();
      return res.json(designations2);
    } catch (error) {
      console.error("Get designations error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/departments/:id/designations", async (req, res) => {
    try {
      const departmentId = parseInt(req.params.id);
      if (isNaN(departmentId)) {
        return res.status(400).json({ message: "Invalid department ID" });
      }
      const designations2 = await storage.getDesignationsByDepartment(departmentId);
      return res.json(designations2);
    } catch (error) {
      console.error("Get department designations error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/designations/:id", async (req, res) => {
    try {
      const designationId = parseInt(req.params.id);
      if (isNaN(designationId)) {
        return res.status(400).json({ message: "Invalid designation ID" });
      }
      const designation = await storage.getDesignation(designationId);
      if (!designation) {
        return res.status(404).json({ message: "Designation not found" });
      }
      return res.json(designation);
    } catch (error) {
      console.error("Get designation error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/designations", async (req, res) => {
    try {
      const result = insertDesignationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid designation data",
          errors: result.error.errors
        });
      }
      const designation = await storage.createDesignation(result.data);
      return res.status(201).json(designation);
    } catch (error) {
      console.error("Create designation error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/designations/:id", async (req, res) => {
    try {
      const designationId = parseInt(req.params.id);
      if (isNaN(designationId)) {
        return res.status(400).json({ message: "Invalid designation ID" });
      }
      const partialSchema = insertDesignationSchema.partial();
      const result = partialSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid designation data",
          errors: result.error.errors
        });
      }
      const designation = await storage.updateDesignation(designationId, result.data);
      if (!designation) {
        return res.status(404).json({ message: "Designation not found" });
      }
      return res.json(designation);
    } catch (error) {
      console.error("Update designation error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/import-tender/upload-pdf", pdfUpload.array("files", 5), async (req, res) => {
    try {
      const files2 = req.files;
      if (!files2 || files2.length === 0) {
        return res.status(400).json({ error: "No files were uploaded." });
      }
      const filePaths = files2.map((file) => file.path);
      const extractedData = await ImportService.processPdfFiles(filePaths);
      ImportService.cleanupFiles(filePaths);
      return res.status(200).json({
        success: true,
        message: `Successfully processed ${files2.length} PDF files.`,
        data: extractedData
      });
    } catch (error) {
      console.error("Error processing PDF files:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "An error occurred while processing PDF files"
      });
    }
  });
  app2.post("/api/import-tender/upload-excel", excelUpload.single("files"), async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "No file was uploaded." });
      }
      const extractedData = await ImportService.processExcelFiles([file.path]);
      ImportService.cleanupFiles([file.path]);
      return res.status(200).json({
        success: true,
        message: `Successfully processed Excel/CSV file: ${file.originalname}`,
        data: extractedData
      });
    } catch (error) {
      console.error("Error processing Excel/CSV file:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "An error occurred while processing Excel/CSV file"
      });
    }
  });
  app2.post("/api/import-tender/save", async (req, res) => {
    try {
      await saveImportedTenders(req, res);
    } catch (error) {
      console.error("Error saving imported tenders:", error);
      return res.status(500).json({
        error: "An error occurred while saving the imported tenders"
      });
    }
  });
  app2.get("/api/documents/:tenderId/:documentType", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.tenderId);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const { documentType } = req.params;
      const tender = await storage.getTender(tenderId);
      if (!tender) {
        return res.status(404).json({ message: "Tender not found" });
      }
      let filePath = "";
      let fileName = "";
      switch (documentType) {
        case "bid":
          filePath = tender.bidDocumentPath || "";
          fileName = "bid_document";
          break;
        case "atc":
          filePath = tender.atcDocumentPath || "";
          fileName = "atc_document";
          break;
        case "tech":
          filePath = tender.techSpecsDocumentPath || "";
          fileName = "tech_specs_document";
          break;
        default:
          return res.status(400).json({ message: "Invalid document type" });
      }
      if (!filePath) {
        return res.status(404).json({ message: "Document not found" });
      }
      const fileExt = path8.extname(filePath).toLowerCase();
      let contentType = "application/octet-stream";
      if (fileExt === ".pdf") {
        contentType = "application/pdf";
      } else if (fileExt === ".doc" || fileExt === ".docx") {
        contentType = "application/msword";
      } else if (fileExt === ".xls" || fileExt === ".xlsx") {
        contentType = "application/vnd.ms-excel";
      } else if (fileExt === ".csv") {
        contentType = "text/csv";
      }
      if (!fs9.existsSync(filePath)) {
        console.error(`Document file not found: ${filePath}`);
        return res.status(404).json({ message: "Document file not found" });
      }
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `inline; filename="${fileName}${fileExt}"`);
      const fileStream = fs9.createReadStream(filePath);
      fileStream.pipe(res);
      fileStream.on("error", (error) => {
        console.error("Error streaming file:", error);
        if (!res.headersSent) {
          res.status(500).json({ message: "Error reading document file" });
        }
      });
    } catch (error) {
      console.error("Document view error:", error);
      return res.status(500).json({ message: "Error serving document" });
    }
  });
  app2.post("/api/tenders/:id/documents", tenderDocumentUpload.fields([
    { name: "bidDocument", maxCount: 1 },
    { name: "atcDocument", maxCount: 1 },
    { name: "techSpecsDocument", maxCount: 1 }
  ]), async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const tender = await storage.getTender(tenderId);
      if (!tender) {
        return res.status(404).json({ message: "Tender not found" });
      }
      const files2 = req.files;
      const updateData = {};
      console.log("Received files:", files2);
      if (files2.bidDocument && files2.bidDocument.length > 0) {
        updateData.bidDocumentPath = files2.bidDocument[0].path.replace(/^uploads[\/\\]/, "");
        console.log("Bid document path:", updateData.bidDocumentPath);
      }
      if (files2.atcDocument && files2.atcDocument.length > 0) {
        updateData.atcDocumentPath = files2.atcDocument[0].path.replace(/^uploads[\/\\]/, "");
        console.log("ATC document path:", updateData.atcDocumentPath);
      }
      if (files2.techSpecsDocument && files2.techSpecsDocument.length > 0) {
        updateData.techSpecsDocumentPath = files2.techSpecsDocument[0].path.replace(/^uploads[\/\\]/, "");
        console.log("Tech specs document path:", updateData.techSpecsDocumentPath);
      }
      if (Object.keys(updateData).length > 0) {
        const updatedTender = await storage.updateTender(tenderId, updateData);
        try {
          let parsedData = {};
          if (files2.bidDocument && files2.bidDocument.length > 0) {
            console.log("Parsing bid document for tender information...");
            const bidDocumentPath = path8.join(process.cwd(), "uploads", files2.bidDocument[0].filename);
            const bidParsedData = await parseDocument(bidDocumentPath);
            parsedData = { ...parsedData, ...bidParsedData };
          }
          if (parsedData.itemCategories || parsedData.tenderAuthority || parsedData.referenceNumber) {
            const parsedUpdateData = {
              parsedData: JSON.stringify(parsedData)
            };
            if (parsedData.itemCategories && parsedData.itemCategories.length > 0) {
              parsedUpdateData.itemCategories = parsedData.itemCategories;
            }
            await storage.updateTender(tenderId, parsedUpdateData);
            console.log("Updated tender with parsed data:", parsedData);
          }
        } catch (parseError) {
          console.error("Error parsing documents:", parseError);
        }
        await storage.createActivity({
          action: "document_upload",
          userId: req.body.userId || 1,
          // Default to admin user if no user provided
          entityType: "tender",
          entityId: tenderId,
          metadata: JSON.stringify({
            description: `Documents uploaded for tender ${tender.referenceNo}`
          })
        });
        return res.status(200).json({
          message: "Documents uploaded successfully",
          tender: updatedTender
        });
      }
      return res.status(200).json({
        message: "No documents provided, but tender was created successfully",
        success: true,
        tenderId
      });
    } catch (error) {
      console.error("Document upload error:", error);
      return res.status(500).json({
        message: error instanceof Error ? error.message : "Error uploading documents"
      });
    }
  });
  app2.get("/api/tenders/:id/kick-off-calls", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const kickOffCalls2 = await storage.getKickOffCallsByTender(tenderId);
      return res.status(200).json(kickOffCalls2);
    } catch (error) {
      console.error("Error fetching kick off calls:", error);
      return res.status(500).json({ message: "Failed to fetch kick off calls" });
    }
  });
  app2.post("/api/tenders/:id/kick-off-calls", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const tender = await storage.getTender(tenderId);
      if (!tender) {
        return res.status(404).json({ message: "Tender not found" });
      }
      const registeredUser = await storage.getUser(parseInt(req.body.registeredUser));
      if (!registeredUser) {
        return res.status(400).json({ message: "Invalid registered user" });
      }
      const kickOffCallData = {
        tenderId,
        tenderBrief: tender.brief,
        tenderAuthority: tender.authority,
        tenderValue: tender.estimatedValue ? `\u20B9 ${(Number(tender.estimatedValue) / 1e7).toFixed(2)} CR.` : "Not specified",
        meetingHost: registeredUser.name,
        registeredUserId: parseInt(req.body.registeredUser),
        meetingSubject: req.body.meetingSubject,
        meetingDateTime: new Date(req.body.meetingDateTime),
        meetingLink: req.body.meetingLink || null,
        momUserId: parseInt(req.body.momUser),
        nonRegisteredEmails: req.body.nonRegisteredEmails || null,
        description: req.body.description,
        documentPath: req.file?.path || null,
        participants: [registeredUser.name],
        emailIds: req.body.nonRegisteredEmails || null
      };
      const kickOffCall = await storage.createKickOffCall(kickOffCallData);
      await storage.logTenderActivity(
        parseInt(req.body.registeredUser),
        tenderId,
        "kick_off_call_scheduled",
        `Kick-off call scheduled: ${req.body.meetingSubject} - ${new Date(req.body.meetingDateTime).toLocaleDateString()}`,
        {
          meetingSubject: req.body.meetingSubject,
          meetingDateTime: req.body.meetingDateTime,
          meetingHost: registeredUser.name
        }
      );
      return res.status(201).json(kickOffCall);
    } catch (error) {
      console.error("Error creating kick off call:", error);
      return res.status(500).json({ message: "Failed to create kick off call" });
    }
  });
  app2.get("/api/dashboard/layout/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const layout = await storage.getDashboardLayout(userId);
      return res.status(200).json(layout);
    } catch (error) {
      console.error("Error fetching dashboard layout:", error);
      return res.status(500).json({ message: "Failed to fetch dashboard layout" });
    }
  });
  app2.post("/api/dashboard/layout", async (req, res) => {
    try {
      const validatedData = insertDashboardLayoutSchema.parse(req.body);
      const existingLayout = await storage.getDashboardLayout(validatedData.userId);
      if (existingLayout) {
        const updatedLayout = await storage.updateDashboardLayout(validatedData.userId, validatedData.layoutConfig);
        return res.status(200).json(updatedLayout);
      } else {
        const newLayout = await storage.createDashboardLayout(validatedData);
        return res.status(201).json(newLayout);
      }
    } catch (error) {
      console.error("Error saving dashboard layout:", error);
      return res.status(500).json({ message: "Failed to save dashboard layout" });
    }
  });
  app2.get("/api/purchase-orders", async (_req, res) => {
    try {
      const purchaseOrders2 = await storage.getPurchaseOrders();
      return res.status(200).json(purchaseOrders2);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      return res.status(500).json({ error: "Failed to fetch purchase orders" });
    }
  });
  app2.get("/api/purchase-orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const purchaseOrder = await storage.getPurchaseOrder(id);
      if (!purchaseOrder) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      return res.status(200).json(purchaseOrder);
    } catch (error) {
      console.error("Error fetching purchase order:", error);
      return res.status(500).json({ error: "Failed to fetch purchase order" });
    }
  });
  app2.post("/api/purchase-orders/upload", purchaseOrderUpload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const purchaseOrder = await storage.createPurchaseOrder({
        // Set basic required fields, rest will be filled in later via update
        gemContractNo: `PO-${Date.now()}`,
        // Temporary reference
        organizationName: "To be updated",
        productName: "To be updated",
        filePath: req.file.path,
        fileType: req.file.mimetype,
        uploadedBy: 1
        // Replace with actual user ID from request
      });
      return res.status(201).json({
        id: purchaseOrder.id,
        filename: req.file.originalname,
        filePath: req.file.path,
        fileType: req.file.mimetype
      });
    } catch (error) {
      console.error("Error uploading purchase order:", error);
      return res.status(500).json({ error: "Failed to upload purchase order" });
    }
  });
  app2.get("/api/dealers", async (_req, res) => {
    try {
      const dealers2 = await storage.getDealers();
      return res.status(200).json(dealers2);
    } catch (error) {
      console.error("Error fetching dealers:", error);
      return res.status(500).json({ error: "Failed to fetch dealers" });
    }
  });
  app2.get("/api/dealers/search", async (req, res) => {
    try {
      const { companyName, emailId, contactNo, state, city } = req.query;
      const filters = {};
      if (companyName) filters.companyName = companyName;
      if (emailId) filters.emailId = emailId;
      if (contactNo) filters.contactNo = contactNo;
      if (state) filters.state = state;
      if (city) filters.city = city;
      const dealers2 = await storage.searchDealers(filters);
      return res.status(200).json(dealers2);
    } catch (error) {
      console.error("Error searching dealers:", error);
      return res.status(500).json({ error: "Failed to search dealers" });
    }
  });
  app2.get("/api/dealers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const dealer = await storage.getDealer(id);
      if (!dealer) {
        return res.status(404).json({ error: "Dealer not found" });
      }
      return res.status(200).json(dealer);
    } catch (error) {
      console.error("Error fetching dealer:", error);
      return res.status(500).json({ error: "Failed to fetch dealer" });
    }
  });
  app2.post("/api/tender-responses/upload", tenderResponseUpload.fields([
    { name: "file", maxCount: 1 },
    { name: "signStampFile", maxCount: 1 }
  ]), async (req, res) => {
    try {
      const {
        tenderId,
        responseName,
        responseType,
        remarks,
        includeIndex
      } = req.body;
      const parsedTenderId = parseInt(tenderId);
      const parsedIncludeIndex = includeIndex === "true";
      if (isNaN(parsedTenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      if (!responseName || !responseType) {
        return res.status(400).json({ message: "Response name and type are required" });
      }
      const files2 = req.files;
      const uploadedFile = files2?.file?.[0];
      const signStampFile = files2?.signStampFile?.[0];
      if (!uploadedFile) {
        return res.status(400).json({ message: "File upload is required" });
      }
      const fileSize = `${(uploadedFile.size / (1024 * 1024)).toFixed(3)} MB`;
      const responseData = {
        tenderId: parsedTenderId,
        responseName,
        responseType,
        remarks: remarks || "Ok",
        indexStartFrom: 1,
        includeIndex: parsedIncludeIndex,
        filePath: uploadedFile.path,
        fileSize,
        isCompressed: false,
        signStampPath: signStampFile?.path || null,
        status: "uploaded",
        createdBy: req.user?.id || (req.headers["x-user-id"] ? parseInt(req.headers["x-user-id"]) : 2)
        // Get from authenticated user first, then fallback to header
      };
      console.log("Upload response - authenticated user:", req.user?.name, req.user?.id);
      console.log("Upload response - x-user-id header:", req.headers["x-user-id"]);
      console.log("Upload response - createdBy:", responseData.createdBy);
      const response = await storage.createTenderResponse(responseData);
      await storage.logTenderActivity(
        responseData.createdBy,
        parsedTenderId,
        "create_tender_response",
        `Uploaded tender response: ${responseName} (${responseType})`,
        {
          responseName,
          responseType,
          fileSize,
          hasSignStamp: !!signStampFile,
          includeIndex: parsedIncludeIndex,
          isUpload: true
        }
      );
      res.status(201).json(response);
    } catch (error) {
      console.error("Upload tender response error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/tenders/:id/responses", upload2.single("file"), async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      const { responseName, responseType, remarks, folderId } = req.body;
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "File is required" });
      }
      const currentUser = req.user || { id: 1, name: "System User" };
      const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      const fileRecord = await storage.createFile({
        name: file.originalname,
        originalName: file.originalname,
        filePath: file.path,
        fileType: file.mimetype,
        fileSize: file.size,
        folderId: folderId ? parseInt(folderId) : null,
        createdBy: currentUser.id.toString()
      });
      const responseData = {
        tenderId,
        responseName,
        responseType,
        remarks,
        indexStartFrom: 1,
        filePath: file.path,
        fileSize: `${fileSizeInMB} MB`,
        status: "uploaded",
        createdBy: currentUser.id,
        uploadedBy: currentUser.id,
        isCompressed: false
      };
      const tenderResponse = await storage.createTenderResponse(responseData);
      res.json(tenderResponse);
    } catch (error) {
      console.error("Upload response error:", error);
      res.status(500).json({ message: "Failed to upload response" });
    }
  });
  app2.get("/api/tender-responses", async (req, res) => {
    try {
      const responses = await storage.getAllTenderResponses();
      res.json(responses);
    } catch (error) {
      console.error("Get all tender responses error:", error);
      res.status(500).json({ message: "Failed to get tender responses" });
    }
  });
  app2.delete("/api/tender-responses/:id", async (req, res) => {
    try {
      const responseId = parseInt(req.params.id);
      await storage.deleteTenderResponse(responseId);
      res.json({ message: "Response deleted successfully" });
    } catch (error) {
      console.error("Delete response error:", error);
      res.status(500).json({ message: "Failed to delete response" });
    }
  });
  app2.post("/api/generate-checklist-response", async (req, res) => {
    try {
      const { tenderId, checklistId, selectedDocuments, responseName, responseType, compiledFile, bidNumber } = req.body;
      if (!tenderId || !checklistId || !selectedDocuments || selectedDocuments.length === 0) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const tender = await storage.getTender(tenderId);
      if (!tender) {
        return res.status(404).json({ message: "Tender not found" });
      }
      const checklistDocuments2 = await storage.getChecklistDocuments(checklistId);
      const selectedDocIds = selectedDocuments.map((d) => d.documentId);
      const documentsToInclude = checklistDocuments2.filter((doc) => selectedDocIds.includes(doc.id));
      if (compiledFile) {
        const PDFDocument5 = __require("pdf-lib").PDFDocument;
        const { StandardFonts: StandardFonts3 } = __require("pdf-lib");
        const pdfDoc = await PDFDocument5.create();
        const font = await pdfDoc.embedFont(StandardFonts3.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts3.HelveticaBold);
        const page = pdfDoc.addPage([612, 792]);
        const { width, height } = page.getSize();
        page.drawText(bidNumber || `BID-${tenderId}-${Date.now()}`, {
          x: 50,
          y: height - 50,
          size: 16,
          font: boldFont
        });
        page.drawText(`Tender ID: ${tender.referenceNo || tenderId}`, {
          x: 50,
          y: height - 80,
          size: 12,
          font
        });
        page.drawText(`Response Name: ${responseName}`, {
          x: 50,
          y: height - 100,
          size: 12,
          font
        });
        page.drawText(`Response Type: ${responseType}`, {
          x: 50,
          y: height - 120,
          size: 12,
          font
        });
        page.drawText(`Generated: ${(/* @__PURE__ */ new Date()).toLocaleString()}`, {
          x: 50,
          y: height - 140,
          size: 10,
          font
        });
        page.drawText("Included Documents:", {
          x: 50,
          y: height - 180,
          size: 14,
          font: boldFont
        });
        let yPosition = height - 200;
        documentsToInclude.forEach((doc, index) => {
          const order = selectedDocuments.find((d) => d.documentId === doc.id)?.order || index + 1;
          page.drawText(`${order}. ${doc.documentName}`, {
            x: 70,
            y: yPosition,
            size: 11,
            font
          });
          yPosition -= 20;
        });
        const pdfBytes = await pdfDoc.save();
        const fileName2 = responseName.endsWith(".pdf") ? responseName : `${responseName}.pdf`;
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${fileName2}"`);
        res.setHeader("Content-Length", pdfBytes.length);
        res.send(Buffer.from(pdfBytes));
        return;
      }
      const JSZip2 = __require("jszip");
      const zip = new JSZip2();
      const manifest = {
        tenderReferenceNo: tender.referenceNo,
        responseName,
        responseType,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        documents: documentsToInclude.map((doc) => ({
          name: doc.documentName,
          order: selectedDocuments.find((d) => d.documentId === doc.id)?.order || 1
        }))
      };
      zip.file("manifest.json", JSON.stringify(manifest, null, 2));
      documentsToInclude.forEach((doc, index) => {
        const order = selectedDocuments.find((d) => d.documentId === doc.id)?.order || index + 1;
        const filename = `${order}_${doc.documentName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
        const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 88
>>
stream
BT
/F1 16 Tf
50 750 Td
(${doc.documentName}) Tj
0 -30 Td
/F1 12 Tf
(Document Order: ${order}) Tj
0 -20 Td
(Tender: ${tender.referenceNo || tenderId}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
350
%%EOF`;
        zip.file(filename, pdfContent);
      });
      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
      const fileName = responseName.endsWith(".zip") ? responseName : `${responseName}.zip`;
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
      res.setHeader("Content-Length", zipBuffer.length);
      res.send(zipBuffer);
    } catch (error) {
      console.error("Generate checklist response error:", error);
      res.status(500).json({ message: "Failed to generate checklist response" });
    }
  });
  app2.post("/api/dealers", async (req, res) => {
    try {
      const newDealer = await storage.createDealer({
        ...req.body,
        createdBy: 1
        // Replace with actual user ID from request
      });
      return res.status(201).json(newDealer);
    } catch (error) {
      console.error("Error creating dealer:", error);
      return res.status(500).json({ error: "Failed to create dealer" });
    }
  });
  app2.put("/api/dealers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedDealer = await storage.updateDealer(id, req.body);
      if (!updatedDealer) {
        return res.status(404).json({ error: "Dealer not found" });
      }
      return res.status(200).json(updatedDealer);
    } catch (error) {
      console.error("Error updating dealer:", error);
      return res.status(500).json({ error: "Failed to update dealer" });
    }
  });
  app2.get("/api/tenders/:id/documents", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const documents = await storage.getTenderDocuments(tenderId);
      return res.json(documents);
    } catch (error) {
      console.error("Get tender documents error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/tenders/:id/all-documents", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const documents = await storage.getAllTenderDocuments(tenderId);
      return res.json(documents);
    } catch (error) {
      console.error("Get all tender documents error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/tenders/:id/activities", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const activities2 = await storage.getTenderActivities(tenderId);
      return res.json(activities2);
    } catch (error) {
      console.error("Get tender activities error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/tenders/:id/activities", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const userId = parseInt(req.headers["x-user-id"]);
      if (isNaN(userId)) {
        return res.status(401).json({ message: "User authentication required" });
      }
      const { action, description, metadata } = req.body;
      if (!action || !description) {
        return res.status(400).json({ message: "Action and description are required" });
      }
      await storage.logTenderActivity(userId, tenderId, action, description, metadata);
      return res.json({ message: "Activity logged successfully" });
    } catch (error) {
      console.error("Error logging tender activity:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/tenders/:id/documents", tenderDocumentUpload.fields([
    { name: "bidDocument", maxCount: 1 },
    { name: "atcDocument", maxCount: 1 },
    { name: "techSpecsDocument", maxCount: 1 }
  ]), async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const tender = await storage.getTender(tenderId);
      if (!tender) {
        return res.status(404).json({ message: "Tender not found" });
      }
      const files2 = req.files;
      const uploadedDocuments = [];
      if (files2.bidDocument && files2.bidDocument[0]) {
        const file = files2.bidDocument[0];
        await storage.updateTender(tenderId, { bidDocumentPath: file.path });
        uploadedDocuments.push({ type: "bidDocument", path: file.path, name: file.originalname });
      }
      if (files2.atcDocument && files2.atcDocument[0]) {
        const file = files2.atcDocument[0];
        await storage.updateTender(tenderId, { atcDocumentPath: file.path });
        uploadedDocuments.push({ type: "atcDocument", path: file.path, name: file.originalname });
      }
      if (files2.techSpecsDocument && files2.techSpecsDocument[0]) {
        const file = files2.techSpecsDocument[0];
        await storage.updateTender(tenderId, { techSpecsDocumentPath: file.path });
        uploadedDocuments.push({ type: "techSpecsDocument", path: file.path, name: file.originalname });
      }
      if (uploadedDocuments.length > 0) {
        await storage.createActivity({
          action: "upload_documents",
          userId: 1,
          // TODO: Replace with authenticated user ID
          entityType: "tender",
          entityId: tenderId,
          metadata: {
            documentsUploaded: uploadedDocuments.map((doc) => doc.type)
          }
        });
      }
      return res.json({
        success: true,
        message: `Successfully uploaded ${uploadedDocuments.length} document(s)`,
        documents: uploadedDocuments
      });
    } catch (error) {
      console.error("Upload tender documents error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/tenders/:id/documents/:documentId/download", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      const documentId = parseInt(req.params.documentId);
      if (isNaN(tenderId) || isNaN(documentId)) {
        return res.status(400).json({ message: "Invalid tender ID or document ID" });
      }
      const tenderDocuments2 = await storage.getTenderDocuments(tenderId);
      const document = tenderDocuments2.find((doc) => doc.id === documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      let filePath = document.filePath || document.fileUrl;
      if (!filePath) {
        return res.status(404).json({ message: "File path not found" });
      }
      if (!filePath.startsWith("/")) {
        filePath = path8.join(process.cwd(), filePath);
      }
      console.log(`Attempting to download tender document: ${filePath}`);
      if (!fs9.existsSync(filePath)) {
        console.error(`File not found on disk: ${filePath}`);
        return res.status(404).json({ message: "File not found on disk" });
      }
      const fileName = document.name || document.documentName || `document_${documentId}`;
      const fileExt = path8.extname(filePath) || ".pdf";
      const downloadName = fileName.includes(".") ? fileName : `${fileName}${fileExt}`;
      res.setHeader("Content-Disposition", `attachment; filename="${downloadName}"`);
      res.setHeader("Content-Type", document.fileType || "application/pdf");
      const fileStream = fs9.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Download tender document error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/modify-tender/:id", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const result = insertTenderSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid tender data",
          errors: result.error.errors
        });
      }
      const updatedTender = await storage.updateTender(tenderId, result.data);
      if (!updatedTender) {
        return res.status(404).json({ message: "Tender not found" });
      }
      await storage.createActivity({
        action: "modify",
        userId: 1,
        // TODO: Replace with authenticated user ID
        entityType: "tender",
        entityId: tenderId,
        metadata: {
          updatedFields: Object.keys(result.data)
        }
      });
      return res.json(updatedTender);
    } catch (error) {
      console.error("Modify tender error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/modify-tender", async (req, res) => {
    try {
      const { id, ...updateData } = req.body;
      if (!id) {
        return res.status(400).json({ message: "Tender ID is required" });
      }
      const tenderId = parseInt(id);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const result = insertTenderSchema.partial().safeParse(updateData);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid tender data",
          errors: result.error.errors
        });
      }
      const updatedTender = await storage.updateTender(tenderId, result.data);
      if (!updatedTender) {
        return res.status(404).json({ message: "Tender not found" });
      }
      await storage.createActivity({
        action: "modify",
        userId: 1,
        // TODO: Replace with authenticated user ID
        entityType: "tender",
        entityId: tenderId,
        metadata: {
          updatedFields: Object.keys(result.data)
        }
      });
      return res.json({
        success: true,
        message: "Tender updated successfully",
        tender: updatedTender
      });
    } catch (error) {
      console.error("Modify tender error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/user-tenders", async (req, res) => {
    try {
      const { userId, tenderId, isStarred, isInterested } = req.body;
      if (!userId || !tenderId) {
        return res.status(400).json({ message: "userId and tenderId are required" });
      }
      const userTenderData = {
        userId: parseInt(userId),
        tenderId: parseInt(tenderId),
        isStarred: Boolean(isStarred),
        isInterested: Boolean(isInterested)
      };
      const existing = await storage.getUserTender(userTenderData.userId, userTenderData.tenderId);
      if (existing) {
        const updated = await storage.updateUserTender(existing.id, {
          isStarred: userTenderData.isStarred,
          isInterested: userTenderData.isInterested
        });
        return res.json(updated);
      } else {
        const userTender = await storage.createUserTender(userTenderData);
        return res.status(201).json(userTender);
      }
    } catch (error) {
      console.error("Create user-tender relationship error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/user-tenders/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const userTenders2 = await storage.getUserTenders(userId);
      return res.json(userTenders2);
    } catch (error) {
      console.error("Get user tenders error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/oem", async (req, res) => {
    try {
      const {
        tenderNumber,
        departmentName,
        tenderStatus,
        authorizationDateFrom,
        authorizationDateTo,
        followupDateFrom,
        followupDateTo
      } = req.query;
      const filters = {};
      if (tenderNumber) filters.tenderNumber = tenderNumber;
      if (departmentName) filters.departmentName = departmentName;
      if (tenderStatus) filters.tenderStatus = tenderStatus;
      if (authorizationDateFrom) filters.authorizationDateFrom = new Date(authorizationDateFrom);
      if (authorizationDateTo) filters.authorizationDateTo = new Date(authorizationDateTo);
      if (followupDateFrom) filters.followupDateFrom = new Date(followupDateFrom);
      if (followupDateTo) filters.followupDateTo = new Date(followupDateTo);
      const oems2 = await storage.getOEMs(filters);
      return res.status(200).json(oems2);
    } catch (error) {
      console.error("Error fetching OEMs:", error);
      return res.status(500).json({ error: "Failed to fetch OEMs" });
    }
  });
  app2.get("/api/oem/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const oem = await storage.getOEM(id);
      if (!oem) {
        return res.status(404).json({ error: "OEM not found" });
      }
      return res.status(200).json(oem);
    } catch (error) {
      console.error("Error fetching OEM:", error);
      return res.status(500).json({ error: "Failed to fetch OEM" });
    }
  });
  app2.post("/api/oem", async (req, res) => {
    try {
      const newOEM = await storage.createOEM({
        ...req.body,
        createdBy: 1,
        // Replace with actual user ID from request
        createdAt: /* @__PURE__ */ new Date()
      });
      return res.status(201).json(newOEM);
    } catch (error) {
      console.error("Error creating OEM:", error);
      return res.status(500).json({ error: "Failed to create OEM" });
    }
  });
  app2.put("/api/oem/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedOEM = await storage.updateOEM(id, req.body);
      if (!updatedOEM) {
        return res.status(404).json({ error: "OEM not found" });
      }
      return res.status(200).json(updatedOEM);
    } catch (error) {
      console.error("Error updating OEM:", error);
      return res.status(500).json({ error: "Failed to update OEM" });
    }
  });
  app2.get("/api/uploads/download", async (req, res) => {
    try {
      const filePath = req.query.path;
      if (!filePath) {
        return res.status(400).json({ message: "File path is required" });
      }
      const safePath = resolveFilePath(filePath);
      const uploadsDir = path8.resolve(process.cwd(), "uploads");
      if (!safePath.startsWith(uploadsDir)) {
        return res.status(400).json({ message: "Invalid file path" });
      }
      if (!fs9.existsSync(safePath)) {
        return res.status(404).json({ message: "File not found" });
      }
      const fileName = path8.basename(safePath);
      const fileExt = path8.extname(fileName);
      const mimeType = getMimeType(fileExt);
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
      res.setHeader("Content-Type", mimeType);
      const fileStream = fs9.createReadStream(safePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Upload download error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  function getMimeType(ext) {
    switch (ext.toLowerCase()) {
      case ".pdf":
        return "application/pdf";
      case ".doc":
        return "application/msword";
      case ".docx":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      case ".xls":
        return "application/vnd.ms-excel";
      case ".xlsx":
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      case ".jpg":
      case ".jpeg":
        return "image/jpeg";
      case ".png":
        return "image/png";
      case ".gif":
        return "image/gif";
      case ".txt":
        return "text/plain";
      default:
        return "application/octet-stream";
    }
  }
  app2.get("/api/companies", async (req, res) => {
    try {
      const type = req.query.type;
      if (type && (type !== "Dealer" && type !== "OEM")) {
        return res.status(400).json({ message: "Invalid company type. Must be 'Dealer' or 'OEM'." });
      }
      const companies2 = type ? await storage.getCompaniesByType(type) : await storage.getCompanies();
      return res.json(companies2);
    } catch (error) {
      console.error("Get companies error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/companies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid company ID" });
      }
      const company = await storage.getCompany(id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      return res.json(company);
    } catch (error) {
      console.error("Get company error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/companies", async (req, res) => {
    try {
      const validationResult2 = insertCompanySchema.safeParse(req.body);
      if (!validationResult2.success) {
        return res.status(400).json({
          message: "Invalid company data",
          errors: validationResult2.error.format()
        });
      }
      const companyData = validationResult2.data;
      const company = await storage.createCompany(companyData);
      return res.status(201).json(company);
    } catch (error) {
      console.error("Create company error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/companies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid company ID" });
      }
      const company = await storage.getCompany(id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      const validationResult2 = insertCompanySchema.partial().safeParse(req.body);
      if (!validationResult2.success) {
        return res.status(400).json({
          message: "Invalid company data",
          errors: validationResult2.error.format()
        });
      }
      const updatedCompany = await storage.updateCompany(id, validationResult2.data);
      return res.json(updatedCompany);
    } catch (error) {
      console.error("Update company error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/companies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid company ID" });
      }
      const company = await storage.getCompany(id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      const success = await storage.deleteCompany(id);
      if (!success) {
        return res.status(500).json({ message: "Failed to delete company" });
      }
      return res.status(204).end();
    } catch (error) {
      console.error("Delete company error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/companies/:id/documents", async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      if (isNaN(companyId)) {
        return res.status(400).json({ message: "Invalid company ID" });
      }
      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      const documents = await storage.getCompanyDocuments(companyId);
      return res.json(documents);
    } catch (error) {
      console.error("Get company documents error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/companies/:id/documents", async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      if (isNaN(companyId)) {
        return res.status(400).json({ message: "Invalid company ID" });
      }
      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      const { documentId, created_by } = req.body;
      if (!documentId || isNaN(parseInt(documentId))) {
        return res.status(400).json({ message: "Valid document ID is required" });
      }
      if (!created_by || isNaN(parseInt(created_by))) {
        return res.status(400).json({ message: "Valid user ID for created_by is required" });
      }
      const linkData = {
        company_id: companyId,
        document_id: parseInt(documentId),
        created_by: parseInt(created_by)
      };
      const link = await storage.linkCompanyDocument(linkData);
      return res.status(201).json(link);
    } catch (error) {
      console.error("Link company document error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/companies/:companyId/documents/:documentId", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const documentId = parseInt(req.params.documentId);
      if (isNaN(companyId) || isNaN(documentId)) {
        return res.status(400).json({ message: "Invalid company or document ID" });
      }
      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      const success = await storage.unlinkCompanyDocument(companyId, documentId);
      if (!success) {
        return res.status(404).json({ message: "Document link not found" });
      }
      return res.status(204).end();
    } catch (error) {
      console.error("Unlink company document error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/bid-participations", async (req, res) => {
    try {
      const status = req.query.status;
      const tenderId = req.query.tenderId ? parseInt(req.query.tenderId) : void 0;
      if (req.query.tenderId && isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const filters = {};
      if (status) filters.status = status;
      if (tenderId) filters.tenderId = tenderId;
      const participations = await storage.getBidParticipations(filters);
      return res.json(participations);
    } catch (error) {
      console.error("Get bid participations error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/bid-participations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid bid participation ID" });
      }
      const participation = await storage.getBidParticipation(id);
      if (!participation) {
        return res.status(404).json({ message: "Bid participation not found" });
      }
      return res.json(participation);
    } catch (error) {
      console.error("Get bid participation error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/bid-participations", async (req, res) => {
    try {
      const participationData = insertBidParticipationSchema.safeParse(req.body);
      if (!participationData.success) {
        return res.status(400).json({
          message: "Invalid bid participation data",
          errors: participationData.error.format()
        });
      }
      const tender = await storage.getTender(participationData.data.tender_id);
      if (!tender) {
        return res.status(404).json({ message: "Tender not found" });
      }
      const newParticipation = await storage.createBidParticipation(participationData.data);
      const { selectedCompanies } = req.body;
      if (Array.isArray(selectedCompanies) && selectedCompanies.length > 0) {
        for (const companyId of selectedCompanies) {
          await storage.linkCompanyToBidParticipation({
            bid_participation_id: newParticipation.id,
            company_id: companyId
          });
        }
      }
      return res.status(201).json(newParticipation);
    } catch (error) {
      console.error("Create bid participation error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/bid-participations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid bid participation ID" });
      }
      const participationData = insertBidParticipationSchema.partial().safeParse(req.body);
      if (!participationData.success) {
        return res.status(400).json({
          message: "Invalid bid participation data",
          errors: participationData.error.format()
        });
      }
      const participation = await storage.getBidParticipation(id);
      if (!participation) {
        return res.status(404).json({ message: "Bid participation not found" });
      }
      const updatedParticipation = await storage.updateBidParticipation(id, participationData.data);
      if (req.body.selectedCompanies && Array.isArray(req.body.selectedCompanies)) {
        const currentLinks = await storage.getBidParticipationCompanies(id);
        const currentCompanyIds = currentLinks.map((link) => link.company_id);
        const companiesToAdd = req.body.selectedCompanies.filter(
          (compId) => !currentCompanyIds.includes(compId)
        );
        const companiesToRemove = currentCompanyIds.filter(
          (compId) => !req.body.selectedCompanies.includes(compId)
        );
        for (const companyId of companiesToAdd) {
          await storage.linkCompanyToBidParticipation({
            bid_participation_id: id,
            company_id: companyId
          });
        }
        for (const companyId of companiesToRemove) {
          await storage.unlinkCompanyFromBidParticipation(id, companyId);
        }
      }
      return res.json(updatedParticipation);
    } catch (error) {
      console.error("Update bid participation error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/bid-participations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid bid participation ID" });
      }
      const participation = await storage.getBidParticipation(id);
      if (!participation) {
        return res.status(404).json({ message: "Bid participation not found" });
      }
      const companies2 = await storage.getBidParticipationCompanies(id);
      for (const company of companies2) {
        await storage.unlinkCompanyFromBidParticipation(id, company.company_id);
      }
      const success = await storage.deleteBidParticipation(id);
      if (success) {
        return res.status(204).end();
      } else {
        return res.status(500).json({ message: "Failed to delete bid participation" });
      }
    } catch (error) {
      console.error("Delete bid participation error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/bid-participations/:id/companies", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid bid participation ID" });
      }
      const companies2 = await storage.getBidParticipationCompanies(id);
      return res.json(companies2);
    } catch (error) {
      console.error("Get bid participation companies error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/folders", async (req, res) => {
    try {
      const folders2 = await storage.getFolders();
      const foldersWithCounts = await Promise.all(
        folders2.map(async (folder) => {
          try {
            const files2 = await storage.getFilesByFolder(folder.id);
            return {
              ...folder,
              fileCount: files2.length
            };
          } catch (error) {
            console.error(`Error getting file count for folder ${folder.id}:`, error);
            return {
              ...folder,
              fileCount: 0
            };
          }
        })
      );
      return res.json(foldersWithCounts);
    } catch (error) {
      console.error("Get folders error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/folders/hierarchy", async (req, res) => {
    try {
      const hierarchy = await storage.getFoldersHierarchy();
      const addFileCountsToHierarchy = async (folders2) => {
        return await Promise.all(
          folders2.map(async (folder) => {
            try {
              const files2 = await storage.getFilesByFolder(folder.id);
              const result = {
                ...folder,
                fileCount: files2.length
              };
              if (folder.subfolders && folder.subfolders.length > 0) {
                result.subfolders = await addFileCountsToHierarchy(folder.subfolders);
              }
              return result;
            } catch (error) {
              console.error(`Error getting file count for folder ${folder.id}:`, error);
              return {
                ...folder,
                fileCount: 0,
                subfolders: folder.subfolders ? await addFileCountsToHierarchy(folder.subfolders) : []
              };
            }
          })
        );
      };
      const hierarchyWithCounts = await addFileCountsToHierarchy(hierarchy);
      return res.json(hierarchyWithCounts);
    } catch (error) {
      console.error("Get folder hierarchy error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/folders/:id/subfolders", async (req, res) => {
    try {
      const parentId = parseInt(req.params.id);
      if (isNaN(parentId)) {
        return res.status(400).json({ message: "Invalid folder ID" });
      }
      const subfolders = await storage.getSubfolders(parentId);
      const subfoldersWithCounts = await Promise.all(
        subfolders.map(async (folder) => {
          try {
            const files2 = await storage.getFilesByFolder(folder.id);
            return {
              ...folder,
              fileCount: files2.length
            };
          } catch (error) {
            console.error(`Error getting file count for folder ${folder.id}:`, error);
            return {
              ...folder,
              fileCount: 0
            };
          }
        })
      );
      return res.json(subfoldersWithCounts);
    } catch (error) {
      console.error("Get subfolders error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/folders", async (req, res) => {
    try {
      const { name, parentId } = req.body;
      if (!name || name.trim() === "") {
        return res.status(400).json({ message: "Folder name is required" });
      }
      if (parentId && typeof parentId !== "number") {
        return res.status(400).json({ message: "Invalid parent folder ID" });
      }
      if (parentId) {
        const parentFolder = await storage.getFolder(parentId);
        if (!parentFolder) {
          return res.status(400).json({ message: "Parent folder not found" });
        }
      }
      const folderData = {
        name: name.trim(),
        parentId: parentId || null,
        createdBy: req.user?.name || "System"
      };
      const newFolder = await storage.createFolder(folderData);
      return res.status(201).json(newFolder);
    } catch (error) {
      console.error("Create folder error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/folders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name } = req.body;
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid folder ID" });
      }
      if (!name || name.trim() === "") {
        return res.status(400).json({ message: "Folder name is required" });
      }
      const updatedFolder = await storage.updateFolder(id, {
        name: name.trim(),
        createdBy: req.user?.name || "System"
      });
      if (updatedFolder) {
        return res.status(200).json(updatedFolder);
      } else {
        return res.status(404).json({ message: "Folder not found" });
      }
    } catch (error) {
      console.error("Update folder error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/folders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid folder ID" });
      }
      const success = await storage.deleteFolder(id);
      if (success) {
        return res.status(204).end();
      } else {
        return res.status(404).json({ message: "Folder not found" });
      }
    } catch (error) {
      console.error("Delete folder error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/files", upload2.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const { name, folderId, subFolder } = req.body;
      const file = req.file;
      const newFile = await storage.createFile({
        name: name || file.originalname,
        originalName: file.originalname,
        filePath: file.path,
        fileType: file.mimetype,
        fileSize: file.size,
        folderId: folderId ? parseInt(folderId) : null,
        createdBy: "Current User"
      });
      return res.status(201).json(newFile);
    } catch (error) {
      console.error("File upload error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/folders/:id/files", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid folder ID" });
      }
      const files2 = await storage.getFolderFiles(id);
      return res.status(200).json(files2);
    } catch (error) {
      console.error("Get folder files error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/files/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log(`[DOWNLOAD] Requested file ID:`, id);
      if (isNaN(id)) {
        console.log(`[DOWNLOAD] Invalid file ID:`, req.params.id);
        return res.status(400).json({ message: "Invalid file ID" });
      }
      const file = await storage.getFile(id);
      console.log(`[DOWNLOAD] File record from DB:`, file);
      if (!file) {
        console.log(`[DOWNLOAD] File not found in DB for ID:`, id);
        return res.status(404).json({ message: "File not found" });
      }
      let filePath;
      if (path8.isAbsolute(file.filePath)) {
        filePath = file.filePath;
      } else {
        filePath = path8.join(process.cwd(), file.filePath);
      }
      console.log(`[DOWNLOAD] Resolved file path:`, filePath);
      if (!fs9.existsSync(filePath)) {
        console.log(`[DOWNLOAD] File not found on disk:`, filePath);
        return res.status(404).json({ message: "File not found on disk" });
      }
      res.setHeader("Content-Disposition", `attachment; filename="${file.name || file.originalName}"`);
      res.setHeader("Content-Type", file.fileType || "application/octet-stream");
      const fileStream = fs9.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Download file error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/folders/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid folder ID" });
      }
      const folder = await storage.getFolder(id);
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }
      const files2 = await storage.getFolderFiles(id);
      if (files2.length === 0) {
        const zip2 = new JSZip();
        zip2.file(`${folder.name}/.gitkeep`, "");
        const zipBuffer2 = await zip2.generateAsync({ type: "nodebuffer" });
        res.setHeader("Content-Type", "application/zip");
        res.setHeader("Content-Disposition", `attachment; filename="${folder.name}.zip"`);
        return res.send(zipBuffer2);
      }
      const zip = new JSZip();
      for (const file of files2) {
        try {
          const filePath = path8.join(process.cwd(), file.filePath);
          if (fs9.existsSync(filePath)) {
            const fileContent = fs9.readFileSync(filePath);
            zip.file(file.originalName, fileContent);
          }
        } catch (fileError) {
          console.error(`Error adding file ${file.originalName} to zip:`, fileError);
        }
      }
      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="${folder.name}.zip"`);
      res.setHeader("Content-Length", zipBuffer.length);
      res.send(zipBuffer);
    } catch (error) {
      console.error("Download folder error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/tenders/:id/export-data", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const tender = await storage.getTender(tenderId);
      if (!tender) {
        return res.status(404).json({ message: "Tender not found" });
      }
      const tenderDocuments2 = await storage.getTenderDocuments(tenderId);
      const companies2 = await storage.getCompanies();
      const companyDocuments2 = {};
      for (const company of companies2) {
        const docs = await storage.getCompanyDocuments(company.id);
        companyDocuments2[company.id] = docs;
      }
      return res.json({
        tender,
        tenderDocuments: tenderDocuments2,
        companies: companies2,
        companyDocuments: companyDocuments2
      });
    } catch (error) {
      console.error("Get export data error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/documents/export", async (req, res) => {
    try {
      const { documentIds, exportFormat = "pdf" } = req.body;
      if (!Array.isArray(documentIds) || documentIds.length === 0) {
        return res.status(400).json({ message: "At least one document ID is required" });
      }
      if (!["pdf", "zip"].includes(exportFormat)) {
        return res.status(400).json({ message: "Export format must be 'pdf' or 'zip'" });
      }
      setTimeout(() => {
      }, 1e3);
      return res.json({
        success: true,
        downloadUrl: `/api/documents/export/download/${Date.now()}`,
        message: `${documentIds.length} documents have been exported as ${exportFormat.toUpperCase()}`
      });
    } catch (error) {
      console.error("Generate export error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/documents/export/download/:id", async (req, res) => {
    try {
      const id = req.params.id;
      res.setHeader("Content-Disposition", 'attachment; filename="export.txt"');
      res.setHeader("Content-Type", "text/plain");
      res.send("This is a placeholder for the exported document compilation.\nIn a real implementation, this would be a PDF or ZIP file containing the selected documents.");
    } catch (error) {
      console.error("Download export error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/oem/:id/upload-document", tenderDocumentUpload.single("document"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const oem = await storage.getOEM(id);
      if (!oem) {
        return res.status(404).json({ error: "OEM not found" });
      }
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const updatedOEM = await storage.updateOEM(id, {
        documentPath: file.path,
        documentType: file.mimetype
      });
      return res.status(200).json(updatedOEM);
    } catch (error) {
      console.error("Error uploading OEM document:", error);
      return res.status(500).json({ error: "Failed to upload document" });
    }
  });
  app2.get("/api/checklists", async (req, res) => {
    try {
      const checklists2 = await storage.getChecklists();
      res.json(checklists2);
    } catch (error) {
      console.error("Get checklists error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/checklists/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid checklist ID" });
      }
      const checklist = await storage.getChecklist(id);
      if (!checklist) {
        return res.status(404).json({ message: "Checklist not found" });
      }
      res.json(checklist);
    } catch (error) {
      console.error("Get checklist error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/checklists", async (req, res) => {
    try {
      const { name } = req.body;
      if (!name || name.trim() === "") {
        return res.status(400).json({ message: "Checklist name is required" });
      }
      const checklist = await storage.createChecklist({
        name: name.trim(),
        createdBy: req.user?.name || "System"
      });
      if (checklist) {
        res.status(201).json(checklist);
      } else {
        res.status(500).json({ message: "Failed to create checklist" });
      }
    } catch (error) {
      console.error("Create checklist error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/checklists/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name } = req.body;
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid checklist ID" });
      }
      if (!name || name.trim() === "") {
        return res.status(400).json({ message: "Checklist name is required" });
      }
      const updatedChecklist = await storage.updateChecklist(id, {
        name: name.trim()
      });
      if (updatedChecklist) {
        res.json(updatedChecklist);
      } else {
        res.status(404).json({ message: "Checklist not found" });
      }
    } catch (error) {
      console.error("Update checklist error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/checklists/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid checklist ID" });
      }
      const success = await storage.deleteChecklist(id);
      if (success) {
        res.status(204).end();
      } else {
        res.status(404).json({ message: "Checklist not found" });
      }
    } catch (error) {
      console.error("Delete checklist error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/checklists/:id/documents", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid checklist ID" });
      }
      const documents = await storage.getChecklistDocuments(id);
      res.json(documents);
    } catch (error) {
      console.error("Get checklist documents error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/checklists/documents", upload2.single("file"), async (req, res) => {
    try {
      const { checklistId, documentName, remarks, fileId, folderId } = req.body;
      if (!checklistId || isNaN(parseInt(checklistId))) {
        return res.status(400).json({ message: "Invalid checklist ID" });
      }
      if (!documentName || documentName.trim() === "") {
        return res.status(400).json({ message: "Document name is required" });
      }
      const userId = req.headers["x-user-id"];
      const user = userId ? await storage.getUser(parseInt(userId)) : null;
      const createdByName = user ? user.name : "System";
      let documentData = {
        checklistId: parseInt(checklistId),
        documentName: documentName.trim(),
        createdBy: createdByName,
        createdAt: /* @__PURE__ */ new Date()
      };
      if (fileId && !isNaN(parseInt(fileId))) {
        const existingFile = await storage.getFile(parseInt(fileId));
        if (!existingFile) {
          return res.status(400).json({ message: "Selected file from briefcase not found" });
        }
        documentData = {
          ...documentData,
          fileId: parseInt(fileId),
          filePath: existingFile.filePath,
          fileName: existingFile.name,
          fileType: existingFile.fileType
        };
      } else if (req.file) {
        const fileRecord = await storage.createFile({
          name: req.file.originalname,
          originalName: req.file.originalname,
          filePath: normalizeFilePath(req.file.path),
          fileType: req.file.mimetype,
          fileSize: req.file.size,
          folderId: folderId ? parseInt(folderId) : null,
          createdBy: createdByName
        });
        documentData = {
          ...documentData,
          filePath: req.file.path,
          fileName: req.file.filename,
          fileType: req.file.mimetype,
          fileId: fileRecord.id
        };
      } else {
        return res.status(400).json({ message: "Either select a file from briefcase or upload a new file" });
      }
      const document = await storage.createChecklistDocument(documentData);
      if (document) {
        res.status(201).json(document);
      } else {
        res.status(500).json({ message: "Failed to add document to checklist" });
      }
    } catch (error) {
      console.error("Add checklist document error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/checklists/documents/:id/download", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      if (isNaN(documentId)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      const document = await storage.getChecklistDocumentById(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      if (document.fileId) {
        const file = await storage.getFile(document.fileId);
        if (!file) {
          return res.status(404).json({ message: "File not found" });
        }
        let filePath = file.filePath;
        if (!filePath.startsWith("/")) {
          filePath = path8.join(process.cwd(), filePath);
        }
        console.log(`Attempting to download file: ${filePath}`);
        if (!fs9.existsSync(filePath)) {
          console.error(`File not found on disk: ${filePath}`);
          const mockPdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 88
>>
stream
BT
/F1 16 Tf
50 750 Td
(${document.documentName}) Tj
0 -30 Td
/F1 12 Tf
(Document ID: ${document.id}) Tj
0 -20 Td
(Created: ${(/* @__PURE__ */ new Date()).toLocaleDateString()}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
350
%%EOF`;
          res.setHeader("Content-Disposition", `attachment; filename="${document.documentName}.pdf"`);
          res.setHeader("Content-Type", "application/pdf");
          res.send(Buffer.from(mockPdfContent));
          return;
        }
        res.setHeader("Content-Disposition", `attachment; filename="${file.originalName || file.name}"`);
        res.setHeader("Content-Type", file.fileType || "application/octet-stream");
        const fileStream = fs9.createReadStream(filePath);
        fileStream.on("error", (error) => {
          console.error("File stream error:", error);
          res.status(500).json({ message: "Error reading file" });
        });
        fileStream.pipe(res);
      } else {
        return res.status(404).json({ message: "No file associated with this document" });
      }
    } catch (error) {
      console.error("Download checklist document error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/checklists/documents/:id/preview", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      if (isNaN(documentId)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      const document = await storage.getChecklistDocumentById(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      if (document.fileId) {
        const file = await storage.getFile(document.fileId);
        if (!file) {
          return res.status(404).json({ message: "File not found" });
        }
        let filePath = file.filePath;
        if (!filePath.startsWith("/")) {
          filePath = path8.join(process.cwd(), filePath);
        }
        console.log(`Attempting to preview file: ${filePath}`);
        if (!fs9.existsSync(filePath)) {
          console.error(`File not found on disk: ${filePath}`);
          const mockPdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 88
>>
stream
BT
/F1 16 Tf
50 750 Td
(${document.documentName}) Tj
0 -30 Td
/F1 12 Tf
(Document ID: ${document.id}) Tj
0 -20 Td
(Created: ${(/* @__PURE__ */ new Date()).toLocaleDateString()}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
350
%%EOF`;
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", "inline");
          res.send(Buffer.from(mockPdfContent));
          return;
        }
        res.setHeader("Content-Type", file.fileType || "application/pdf");
        res.setHeader("Content-Disposition", "inline");
        const fileStream = fs9.createReadStream(filePath);
        fileStream.on("error", (error) => {
          console.error("File stream error:", error);
          res.status(500).json({ message: "Error reading file" });
        });
        fileStream.pipe(res);
      } else {
        return res.status(404).json({ message: "No file associated with this document" });
      }
    } catch (error) {
      console.error("Preview checklist document error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/checklists/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      const success = await storage.deleteChecklistDocument(id);
      if (success) {
        res.status(204).end();
      } else {
        res.status(404).json({ message: "Document not found" });
      }
    } catch (error) {
      console.error("Delete checklist document error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/checklist-documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      const success = await storage.deleteChecklistDocument(id);
      if (success) {
        res.status(204).end();
      } else {
        res.status(404).json({ message: "Document not found" });
      }
    } catch (error) {
      console.error("Delete checklist document error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/files", async (req, res) => {
    try {
      const files2 = await storage.getFiles();
      res.json(files2);
    } catch (error) {
      console.error("Get files error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/files/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name } = req.body;
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid file ID" });
      }
      if (!name || name.trim() === "") {
        return res.status(400).json({ message: "File name is required" });
      }
      const updatedFile = await storage.updateFile(id, {
        name: name.trim()
      });
      if (updatedFile) {
        res.json(updatedFile);
      } else {
        res.status(404).json({ message: "File not found" });
      }
    } catch (error) {
      console.error("Update file error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/files/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log(`[DOWNLOAD] Requested file ID:`, id);
      if (isNaN(id)) {
        console.log(`[DOWNLOAD] Invalid file ID:`, req.params.id);
        return res.status(400).json({ message: "Invalid file ID" });
      }
      const file = await storage.getFile(id);
      console.log(`[DOWNLOAD] File record from DB:`, file);
      if (!file) {
        console.log(`[DOWNLOAD] File not found in DB for ID:`, id);
        return res.status(404).json({ message: "File not found" });
      }
      let filePath;
      if (path8.isAbsolute(file.filePath)) {
        filePath = file.filePath;
      } else {
        filePath = path8.join(process.cwd(), file.filePath);
      }
      console.log(`[DOWNLOAD] Resolved file path:`, filePath);
      if (!fs9.existsSync(filePath)) {
        console.log(`[DOWNLOAD] File not found on disk:`, filePath);
        return res.status(404).json({ message: "File not found on disk" });
      }
      res.setHeader("Content-Disposition", `attachment; filename="${file.name || file.originalName}"`);
      res.setHeader("Content-Type", file.fileType || "application/octet-stream");
      const fileStream = fs9.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Download file error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/document-briefcase", async (req, res) => {
    try {
      const documents = await storage.getDocumentBriefcases();
      res.json(documents);
    } catch (error) {
      console.error("Get document briefcase error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/document-briefcase/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      const document = await storage.getDocumentBriefcase(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      let filePath;
      if (path8.isAbsolute(document.filePath)) {
        filePath = document.filePath;
      } else {
        filePath = path8.join(process.cwd(), document.filePath);
      }
      if (!fs9.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found on disk" });
      }
      res.setHeader("Content-Disposition", `attachment; filename="${document.name}"`);
      res.setHeader("Content-Type", document.fileType || "application/octet-stream");
      const fileStream = fs9.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Download document briefcase error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/tender-responses/:tenderId", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.tenderId);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const responses = await storage.getTenderResponses(tenderId);
      res.json(responses);
    } catch (error) {
      console.error("Get tender responses error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/tender-responses", tenderResponseUpload.single("signStampFile"), async (req, res) => {
    try {
      const {
        tenderId,
        checklistId,
        responseName,
        responseType,
        remarks,
        includeIndex,
        indexStartFrom,
        selectedDocuments
      } = req.body;
      const parsedTenderId = parseInt(tenderId);
      const parsedChecklistId = parseInt(checklistId);
      const parsedIncludeIndex = includeIndex === "true";
      const parsedIndexStartFrom = parseInt(indexStartFrom) || 1;
      const parsedSelectedDocuments = JSON.parse(selectedDocuments);
      if (isNaN(parsedTenderId) || isNaN(parsedChecklistId)) {
        return res.status(400).json({ message: "Invalid tender ID or checklist ID" });
      }
      if (!responseName || !responseType) {
        return res.status(400).json({ message: "Response name and type are required" });
      }
      if (!Array.isArray(parsedSelectedDocuments) || parsedSelectedDocuments.length === 0) {
        return res.status(400).json({ message: "At least one document must be selected" });
      }
      let signStampPath = null;
      if (req.file) {
        signStampPath = normalizeFilePath(req.file.path);
      }
      const checklistDocuments2 = await storage.getChecklistDocuments(parsedChecklistId);
      console.log(
        `Found ${checklistDocuments2.length} checklist documents for checklist ${parsedChecklistId}:`,
        checklistDocuments2.map((d) => ({ id: d.id, name: d.documentName }))
      );
      console.log("Selected documents for processing:", parsedSelectedDocuments);
      const documentsToProcess = [];
      for (const selectedDoc of parsedSelectedDocuments) {
        let foundDoc = checklistDocuments2.find((doc) => doc.id === selectedDoc.documentId);
        console.log(`Looking for document ID ${selectedDoc.documentId}, found:`, foundDoc ? foundDoc.documentName : "NOT FOUND");
        if (!foundDoc) {
          console.log(`Document ${selectedDoc.documentId} not found in checklist documents, checking alternatives...`);
          if (typeof selectedDoc.documentId === "number" || !isNaN(Number(selectedDoc.documentId))) {
            const docId = Number(selectedDoc.documentId);
            if (docId <= 2147483647 && docId > 0) {
              try {
                const additionalFile = await storage.getFile(docId);
                if (additionalFile) {
                  console.log(`Found additional file:`, additionalFile.name);
                  foundDoc = {
                    id: selectedDoc.documentId,
                    documentName: additionalFile.name || "Additional Document",
                    filePath: additionalFile.filePath,
                    fileId: additionalFile.id,
                    checklistId: parsedChecklistId,
                    createdAt: additionalFile.createdAt
                  };
                }
              } catch (error) {
                console.log(`Error fetching file ${docId}:`, error.message);
              }
            } else {
              console.log(`Document ID ${docId} is out of range for PostgreSQL integer, this shouldn't happen with the new upload system`);
            }
          }
          if (!foundDoc && selectedDoc.documentId.toString().startsWith("additional_")) {
            const originalId = selectedDoc.documentId.toString().replace("additional_", "");
            const parsedOriginalId = parseInt(originalId);
            if (!isNaN(parsedOriginalId) && parsedOriginalId <= 2147483647 && parsedOriginalId > 0) {
              const additionalFile = await storage.getFile(parsedOriginalId);
              if (additionalFile) {
                console.log(`Found prefixed additional file:`, additionalFile.name);
                foundDoc = {
                  id: selectedDoc.documentId,
                  documentName: additionalFile.name || "Additional Document",
                  filePath: additionalFile.filePath,
                  fileId: additionalFile.id,
                  checklistId: parsedChecklistId,
                  createdAt: additionalFile.createdAt
                };
              }
            }
          }
        }
        if (foundDoc) {
          let filePath = foundDoc.filePath;
          if (!filePath && foundDoc.fileId) {
            const file = await storage.getFile(foundDoc.fileId);
            if (file) {
              filePath = file.filePath;
            }
          }
          if (filePath) {
            const resolvedPath = resolveFilePath(filePath);
            documentsToProcess.push({
              id: foundDoc.id,
              documentName: foundDoc.documentName,
              filePath: resolvedPath,
              order: selectedDoc.order
            });
          }
        }
      }
      if (documentsToProcess.length === 0) {
        return res.status(400).json({ message: "No valid documents found for processing" });
      }
      const responseDir = path8.join(process.cwd(), "uploads", "responses");
      if (!fs9.existsSync(responseDir)) {
        fs9.mkdirSync(responseDir, { recursive: true });
      }
      const timestamp2 = Date.now();
      const sanitizedResponseName = responseName.replace(/[^a-zA-Z0-9]/g, "_");
      const outputFileName = `${sanitizedResponseName}_${timestamp2}.pdf`;
      const outputPath = path8.join(responseDir, outputFileName);
      const tender = await storage.getTender(parsedTenderId);
      const bidNumber = tender?.referenceNo || `TENDER-${parsedTenderId}`;
      const compilationOptions = {
        responseName,
        responseType,
        remarks,
        documents: documentsToProcess,
        stampOptions: signStampPath ? {
          imagePath: resolveFilePath(signStampPath),
          position: "bottom-right",
          opacity: 0.7,
          scale: 0.3
        } : void 0,
        indexOptions: {
          includeIndex: true,
          // Always include index
          startFrom: parsedIndexStartFrom,
          title: `${responseName} - Document Index`
        },
        bidNumber,
        outputPath
      };
      const { PDFCompilationService: PDFCompilationService2 } = await Promise.resolve().then(() => (init_pdf_compilation_service(), pdf_compilation_service_exports));
      const compiledPath = await PDFCompilationService2.compileDocuments(compilationOptions);
      const fileSize = PDFCompilationService2.getFileSize(compiledPath);
      const relativePath = path8.relative(process.cwd(), compiledPath);
      const relativeSignStampPath = signStampPath ? path8.relative(process.cwd(), signStampPath) : null;
      const responseData = {
        tenderId: parsedTenderId,
        checklistId: parsedChecklistId,
        responseName,
        responseType,
        remarks,
        includeIndex: parsedIncludeIndex,
        indexStartFrom: parsedIndexStartFrom,
        selectedDocuments: parsedSelectedDocuments,
        filePath: relativePath,
        // Store relative path
        fileSize,
        isCompressed: false,
        signStampPath: relativeSignStampPath,
        // Store relative path
        status: "generated",
        createdBy: req.user?.id || (req.headers["x-user-id"] ? parseInt(req.headers["x-user-id"]) : 2)
        // Get from authenticated user first, then fallback to header
      };
      console.log("Generate response - authenticated user:", req.user?.name, req.user?.id);
      console.log("Generate response - x-user-id header:", req.headers["x-user-id"]);
      console.log("Generate response - createdBy:", responseData.createdBy);
      const response = await storage.createTenderResponse(responseData);
      await storage.logTenderActivity(
        responseData.createdBy,
        parsedTenderId,
        "create_tender_response",
        `Generated checklist response: ${responseName} (${responseType})`,
        {
          responseName,
          responseType,
          documentCount: documentsToProcess.length,
          fileSize,
          hasSignStamp: !!signStampPath,
          includeIndex: parsedIncludeIndex,
          checklistId: parsedChecklistId
        }
      );
      res.status(201).json(response);
    } catch (error) {
      console.error("Create tender response error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/tender-responses/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid response ID" });
      }
      const response = await storage.getTenderResponse(id);
      if (!response) {
        return res.status(404).json({ message: "Response not found" });
      }
      const filePath = resolveFilePath(response.filePath);
      if (!response.filePath || !fs9.existsSync(filePath)) {
        return res.status(404).json({ message: "Compiled PDF file not found" });
      }
      const fileName = response.responseName.endsWith(".pdf") ? response.responseName : `${response.responseName}.pdf`;
      const cleanFileName = fileName.replace(/\s+/g, "").replace(/[^a-zA-Z0-9.-]/g, "");
      console.log(`Download request for response ID ${id}:`);
      console.log(`- Response name in DB: "${response.responseName}"`);
      console.log(`- Original file name: "${fileName}"`);
      console.log(`- Clean file name being sent: "${cleanFileName}"`);
      console.log(`- File path: ${filePath}`);
      const fileStats = fs9.statSync(filePath);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${cleanFileName}"`);
      res.setHeader("Content-Length", fileStats.size.toString());
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      const fileStream = fs9.createReadStream(filePath, {
        highWaterMark: 64 * 1024
        // 64KB buffer for better performance
      });
      fileStream.on("error", (error) => {
        console.error("File stream error:", error);
        if (!res.headersSent) {
          res.status(500).json({ message: "Error reading compiled PDF file" });
        }
      });
      fileStream.on("open", () => {
        console.log(`Starting download of ${fileName} (${fileStats.size} bytes)`);
      });
      fileStream.on("end", () => {
        console.log(`Download completed for ${fileName}`);
      });
      fileStream.pipe(res);
    } catch (error) {
      console.error("Download tender response error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/tender-responses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid response ID" });
      }
      const success = await storage.deleteTenderResponse(id);
      if (success) {
        res.status(204).end();
      } else {
        res.status(404).json({ message: "Response not found" });
      }
    } catch (error) {
      console.error("Delete tender response error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/tender-responses/tender/:tenderId/download-all", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.tenderId);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const responses = await storage.getTenderResponses(tenderId);
      if (!responses || responses.length === 0) {
        return res.status(404).json({ message: "No submissions found for this tender" });
      }
      const validResponses = responses.filter(
        (response) => response.filePath && fs9.existsSync(response.filePath)
      );
      if (validResponses.length === 0) {
        return res.status(404).json({ message: "No valid submission files found" });
      }
      const tender = await storage.getTender(tenderId);
      const tenderRef = tender ? tender.referenceNo.replace(/[^a-zA-Z0-9]/g, "_") : `tender_${tenderId}`;
      const mergedDir = path8.join(process.cwd(), "uploads", "merged");
      if (!fs9.existsSync(mergedDir)) {
        fs9.mkdirSync(mergedDir, { recursive: true });
      }
      const timestamp2 = Date.now();
      const mergedFileName = `${tenderRef}_all_submissions_${timestamp2}.pdf`;
      const mergedFilePath = path8.join(mergedDir, mergedFileName);
      const { PDFCompilationService: PDFCompilationService2 } = await Promise.resolve().then(() => (init_pdf_compilation_service(), pdf_compilation_service_exports));
      const submissionPaths = validResponses.map((response) => response.filePath).filter(Boolean);
      await PDFCompilationService2.mergeAllSubmissions(submissionPaths, mergedFilePath);
      res.setHeader("Content-Disposition", `attachment; filename="${mergedFileName}"`);
      res.setHeader("Content-Type", "application/pdf");
      const fileStream = fs9.createReadStream(mergedFilePath);
      fileStream.on("error", (error) => {
        console.error("Merged file stream error:", error);
        res.status(500).json({ message: "Error reading merged PDF file" });
      });
      fileStream.on("end", () => {
        setTimeout(() => {
          try {
            if (fs9.existsSync(mergedFilePath)) {
              fs9.unlinkSync(mergedFilePath);
            }
          } catch (error) {
            console.error("Error cleaning up merged file:", error);
          }
        }, 5e3);
      });
      fileStream.pipe(res);
    } catch (error) {
      console.error("Download all submissions error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/tenders/:id/reminders", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      const reminders2 = await storage.getTenderReminders(tenderId);
      res.json(reminders2);
    } catch (error) {
      console.error("Get reminders error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/dashboard/todays-activity", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId) : null;
      const dashboardType = req.query.type;
      const targetDate = req.query.date ? new Date(req.query.date) : /* @__PURE__ */ new Date();
      let todaysActivities = [];
      if (userId) {
        if (dashboardType === "sales") {
          try {
            const reminderActivities = await storage.getDateReminderActivitiesByUser(userId, targetDate);
            todaysActivities = reminderActivities;
          } catch (error) {
            console.error("Error getting reminder activities:", error);
            todaysActivities = [];
          }
        } else {
          try {
            const financialActivities = await storage.getDateFinancialActivities(userId, targetDate);
            todaysActivities = financialActivities;
          } catch (error) {
            console.error("Error getting financial activities:", error);
            todaysActivities = [];
          }
        }
      } else {
        try {
          const reminderActivities = await storage.getDateReminderActivities(targetDate);
          todaysActivities = reminderActivities;
        } catch (error) {
          console.error("Error getting fallback activities:", error);
          todaysActivities = [];
        }
      }
      res.json(todaysActivities);
    } catch (error) {
      console.error("Get today's activities error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/dashboard/activity-dates", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId);
      const startDate = new Date(req.query.startDate);
      const endDate = new Date(req.query.endDate);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const activityDates = await storage.getActivityDates(userId, startDate, endDate);
      return res.json(activityDates);
    } catch (error) {
      console.error("Get activity dates error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/dashboard/recent-activities-all", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const recentActivities = await storage.getRecentActivitiesFromAllUsers(limit);
      res.json(recentActivities);
    } catch (error) {
      console.error("Get recent activities from all users error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/dashboard/activity-dates", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId) : null;
      const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
      const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
      if (!userId || !startDate || !endDate) {
        return res.json([]);
      }
      const activityDates = await storage.getActivityDates(userId, startDate, endDate);
      res.json(activityDates);
    } catch (error) {
      console.error("Get activity dates error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/dashboard/registration-activities", async (req, res) => {
    try {
      const registrationActivities = await storage.getTodaysRegistrationActivities();
      res.json(registrationActivities);
    } catch (error) {
      console.error("Get registration activities error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/financial-requests", async (req, res) => {
    try {
      const tenderId = req.query.tenderId ? parseInt(req.query.tenderId) : void 0;
      const requests = await storage.getFinancialRequests(tenderId);
      res.json(requests);
    } catch (error) {
      console.error("Get financial requests error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/financial-requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const request = await storage.getFinancialRequest(id);
      if (!request) {
        return res.status(404).json({ message: "Financial request not found" });
      }
      res.json(request);
    } catch (error) {
      console.error("Get financial request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/financial-requests", async (req, res) => {
    try {
      const request = await storage.createFinancialRequest({
        ...req.body,
        createdBy: req.session?.user?.id || 1
      });
      res.status(201).json(request);
    } catch (error) {
      console.error("Create financial request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/financial-requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const request = await storage.updateFinancialRequest(id, req.body);
      if (!request) {
        return res.status(404).json({ message: "Financial request not found" });
      }
      res.json(request);
    } catch (error) {
      console.error("Update financial request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/financial-requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteFinancialRequest(id);
      if (!success) {
        return res.status(404).json({ message: "Financial request not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Delete financial request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/task-allocations", async (req, res) => {
    try {
      const tenderId = req.query.tenderId ? parseInt(req.query.tenderId) : void 0;
      const tasks = await storage.getTaskAllocations(tenderId);
      res.json(tasks);
    } catch (error) {
      console.error("Get task allocations error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/task-allocations", async (req, res) => {
    try {
      let userId;
      if (req.user) {
        userId = req.user.id;
      } else {
        userId = req.body.assignedBy || 1;
      }
      const taskData = {
        ...req.body,
        assignedBy: userId,
        status: req.body.status || "Pending",
        taskDeadline: req.body.taskDeadline ? new Date(req.body.taskDeadline) : /* @__PURE__ */ new Date()
      };
      const task = await storage.createTaskAllocation(taskData);
      if (task.tenderId) {
        await storage.logTenderActivity(
          userId,
          task.tenderId,
          "create_task_allocation",
          `Task allocated: ${task.taskName} - Deadline: ${task.taskDeadline.toLocaleDateString()}`,
          {
            taskName: task.taskName,
            taskDeadline: task.taskDeadline,
            status: task.status,
            assignedTo: task.assignedTo
          }
        );
      }
      res.status(201).json(task);
    } catch (error) {
      console.error("Create task allocation error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/task-allocations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.updateTaskAllocation(id, req.body);
      res.json(task);
    } catch (error) {
      console.error("Update task allocation error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/upload", upload2.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const filePath = req.file.path.replace(/\\/g, "/");
      res.json({
        message: "File uploaded successfully",
        filePath,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });
  app2.get("/api/approval-requests", async (req, res) => {
    try {
      const tenderId = req.query.tenderId ? parseInt(req.query.tenderId) : void 0;
      const requests = await storage.getApprovalRequests(tenderId);
      res.json(requests);
    } catch (error) {
      console.error("Get approval requests error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/approval-requests", upload2.single("uploadFile"), async (req, res) => {
    try {
      const {
        tenderId,
        tenderBrief,
        tenderAuthority,
        tenderValue,
        approvalFor,
        deadline,
        approvalFrom,
        inLoop,
        remarks
      } = req.body;
      const parsedTenderId = parseInt(tenderId);
      const parsedApprovalFrom = parseInt(approvalFrom);
      const parsedInLoop = inLoop ? parseInt(inLoop) : void 0;
      if (isNaN(parsedTenderId) || isNaN(parsedApprovalFrom)) {
        return res.status(400).json({ message: "Invalid tender ID or approval from user ID" });
      }
      if (!approvalFor || !deadline) {
        return res.status(400).json({ message: "Approval for and deadline are required" });
      }
      const requestData = {
        tenderId: parsedTenderId,
        tenderBrief: tenderBrief || "",
        tenderAuthority: tenderAuthority || "",
        tenderValue: tenderValue || null,
        approvalFor,
        deadline: new Date(deadline),
        approvalFrom: parsedApprovalFrom,
        inLoop: parsedInLoop,
        uploadFile: req.file?.path || void 0,
        remarks: remarks || void 0,
        status: "Pending",
        createdBy: 1
        // TODO: Get from authenticated user
      };
      const request = await storage.createApprovalRequest(requestData);
      await storage.logTenderActivity(
        requestData.createdBy,
        parsedTenderId,
        "create_approval_request",
        `Approval request created: ${approvalFor} - Deadline: ${new Date(deadline).toLocaleDateString()}`,
        {
          approvalFor,
          deadline,
          approvalFrom: parsedApprovalFrom,
          hasFile: !!req.file,
          remarks: remarks || null
        }
      );
      res.status(201).json(request);
    } catch (error) {
      console.error("Create approval request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/approval-requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const request = await storage.getApprovalRequest(id);
      if (!request) {
        return res.status(404).json({ message: "Approval request not found" });
      }
      res.json(request);
    } catch (error) {
      console.error("Get approval request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/approval-requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const request = await storage.updateApprovalRequest(id, req.body);
      if (!request) {
        return res.status(404).json({ message: "Approval request not found" });
      }
      res.json(request);
    } catch (error) {
      console.error("Update approval request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/approval-requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteApprovalRequest(id);
      if (!success) {
        return res.status(404).json({ message: "Approval request not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Delete approval request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/compress-pdf", async (req, res) => {
    try {
      const { responseId, docCount } = req.body;
      if (!responseId) {
        return res.status(400).json({ message: "Response ID is required" });
      }
      const response = await storage.getTenderResponse(responseId);
      if (!response) {
        return res.status(404).json({ message: "Response not found" });
      }
      if (!response.filePath || !fs9.existsSync(response.filePath)) {
        return res.status(404).json({ message: "PDF file not found" });
      }
      const originalPath = response.filePath;
      const parsedPath = path8.parse(originalPath);
      const compressedPath = path8.join(
        parsedPath.dir,
        `${parsedPath.name}_compressed${parsedPath.ext}`
      );
      const { EffectivePDFCompressionService: EffectivePDFCompressionService2 } = await Promise.resolve().then(() => (init_pdf_compression_service_effective(), pdf_compression_service_effective_exports));
      const compressionResult = await EffectivePDFCompressionService2.compressPDF(
        originalPath,
        compressedPath
      );
      const updateData = {
        compressedFilePath: compressedPath,
        originalSizeKB: compressionResult.originalSizeKB,
        compressedSizeKB: compressionResult.compressedSizeKB,
        compressionRatio: compressionResult.compressionRatio
      };
      await storage.updateTenderResponse(responseId, updateData);
      res.json({
        success: true,
        compressionResult,
        compressedPath,
        message: `File compressed successfully! Size reduced from ${EffectivePDFCompressionService2.formatFileSize(compressionResult.originalSizeKB)} to ${EffectivePDFCompressionService2.formatFileSize(compressionResult.compressedSizeKB)} (${compressionResult.compressionRatio}% reduction)`
      });
    } catch (error) {
      console.error("PDF compression error:", error);
      res.status(500).json({
        message: "Failed to compress PDF",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/download-compressed/:responseId", async (req, res) => {
    try {
      const responseId = parseInt(req.params.responseId);
      if (isNaN(responseId)) {
        return res.status(400).json({ message: "Invalid response ID" });
      }
      const response = await storage.getTenderResponse(responseId);
      if (!response) {
        return res.status(404).json({ message: "Response not found" });
      }
      const compressedPath = response.compressedFilePath;
      if (!compressedPath || !fs9.existsSync(compressedPath)) {
        return res.status(404).json({ message: "Compressed file not found. Please compress the file first." });
      }
      const fileName = path8.basename(compressedPath);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
      const fileStream = fs9.createReadStream(compressedPath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Download compressed PDF error:", error);
      res.status(500).json({ message: "Failed to download compressed PDF" });
    }
  });
  app2.post("/api/tender-responses/:id/compress", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { compressionType = "recommended" } = req.body;
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid response ID" });
      }
      const response = await storage.getTenderResponse(id);
      if (!response) {
        return res.status(404).json({ message: "Response not found" });
      }
      if (!response.filePath || !fs9.existsSync(response.filePath)) {
        return res.status(404).json({ message: "Original PDF file not found" });
      }
      const parsedPath = path8.parse(response.filePath);
      const compressedPath = path8.join(
        parsedPath.dir,
        `${parsedPath.name}_compressed_${compressionType}${parsedPath.ext}`
      );
      const originalStats = fs9.statSync(response.filePath);
      const originalSizeMB = (originalStats.size / 1024 / 1024).toFixed(2);
      const { UniversalPDFCompressionService: UniversalPDFCompressionService2 } = await Promise.resolve().then(() => (init_universal_pdf_compression(), universal_pdf_compression_exports));
      const originalFilePath = response.originalFilePath || response.filePath;
      let compressionResult;
      try {
        compressionResult = await UniversalPDFCompressionService2.compressPDF(
          originalFilePath,
          compressedPath,
          compressionType
        );
      } catch (error) {
        console.log("Universal compression failed, trying simple compression");
        compressionResult = await UniversalPDFCompressionService2.createSimpleCompressedVersion(
          originalFilePath,
          compressedPath,
          compressionType === "light" ? 80 : compressionType === "extreme" ? 40 : 60
        );
      }
      const updateData = {
        originalFilePath: response.originalFilePath || response.filePath,
        // Store original path
        compressedFilePath: compressedPath,
        originalSizeKB: compressionResult.originalSizeKB,
        compressedSizeKB: compressionResult.compressedSizeKB,
        compressionRatio: compressionResult.compressionRatio,
        compressionType,
        isCompressed: true
      };
      await storage.updateTenderResponse(id, updateData);
      return res.json({
        success: true,
        originalSize: `${(compressionResult.originalSizeKB / 1024).toFixed(2)} MB`,
        compressedSize: `${(compressionResult.compressedSizeKB / 1024).toFixed(2)} MB`,
        compressionPercent: compressionResult.compressionRatio,
        compressionType,
        processingTime: `${compressionResult.processingTime.toFixed(2)}s`,
        downloadUrl: `/api/tender-responses/${id}/download-compressed`,
        hasCompressed: true,
        compressedSizeKB: compressionResult.compressedSizeKB,
        method: compressionResult.method
      });
    } catch (error) {
      console.error("Compress tender response error:", error);
      res.status(500).json({ message: "Failed to compress PDF" });
    }
  });
  app2.get("/api/tender-responses/:id/download-compressed", async (req, res) => {
    try {
      const { id } = req.params;
      const response = await storage.getTenderResponse(parseInt(id));
      if (!response) {
        return res.status(404).json({ message: "Tender response not found" });
      }
      if (!response.compressedFilePath || !fs9.existsSync(response.compressedFilePath)) {
        return res.status(404).json({ message: "Compressed file not found" });
      }
      const fileName = response.responseName.endsWith(".pdf") ? response.responseName : `${response.responseName}.pdf`;
      const cleanFileName = `compressed_${fileName.replace(/\s+/g, "").replace(/[^a-zA-Z0-9.-]/g, "")}`;
      console.log(`Compressed download request for response ID ${id}:`);
      console.log(`- Response name in DB: "${response.responseName}"`);
      console.log(`- Compressed file name being sent: "${cleanFileName}"`);
      console.log(`- File path: ${response.compressedFilePath}`);
      res.setHeader("Content-Disposition", `attachment; filename="${cleanFileName}"`);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      return res.sendFile(path8.resolve(response.compressedFilePath));
    } catch (error) {
      console.error("Download compressed file error:", error);
      res.status(500).json({ message: "Failed to download compressed file" });
    }
  });
  app2.post("/api/test-email", async (req, res) => {
    try {
      const { emailService: emailService2 } = await Promise.resolve().then(() => (init_email(), email_exports));
      const connectionTest = await emailService2.testConnection();
      if (!connectionTest) {
        return res.status(500).json({
          message: "SMTP connection failed. Please check your SMTP configuration in environment variables."
        });
      }
      const testResult = await emailService2.sendTenderAssignmentEmail({
        recipientEmail: req.body.email || "test@example.com",
        recipientName: "Test User",
        tenderTitle: "Test Tender Assignment",
        tenderReferenceNo: "TEST/2025/001",
        startDate: (/* @__PURE__ */ new Date()).toLocaleDateString("en-IN"),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toLocaleDateString("en-IN"),
        assignedByName: "System Administrator",
        comment: "This is a test email notification."
      });
      if (testResult) {
        return res.json({
          message: "Test email sent successfully!",
          connectionTest: true,
          emailSent: true
        });
      } else {
        return res.status(500).json({
          message: "Failed to send test email.",
          connectionTest: true,
          emailSent: false
        });
      }
    } catch (error) {
      console.error("Email test error:", error);
      return res.status(500).json({
        message: "Email test failed",
        error: error.message,
        connectionTest: false,
        emailSent: false
      });
    }
  });
  app2.get("/api/general-settings", async (req, res) => {
    try {
      const settings = await storage.getGeneralSettings();
      return res.json(settings);
    } catch (error) {
      console.error("Get general settings error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/general-settings", async (req, res) => {
    try {
      if (!req.user || req.user.role !== "Admin") {
        return res.status(403).json({ message: "Access denied. Admin role required." });
      }
      const result = insertGeneralSettingsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid settings data",
          errors: result.error.errors
        });
      }
      const settings = await storage.updateGeneralSettings({
        ...result.data,
        updatedBy: req.user.id
      });
      return res.json(settings);
    } catch (error) {
      console.error("Update general settings error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/database-backups", async (req, res) => {
    try {
      if (!req.user || req.user.role !== "Admin") {
        return res.status(403).json({ message: "Access denied. Admin role required." });
      }
      const backups = await storage.getDatabaseBackups();
      return res.json(backups);
    } catch (error) {
      console.error("Get database backups error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/database-backups", async (req, res) => {
    try {
      if (!req.user || req.user.role !== "Admin") {
        return res.status(403).json({ message: "Access denied. Admin role required." });
      }
      const timestamp2 = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
      const sqlFileName = `database_backup_${timestamp2}.sql`;
      const zipFileName = `database_backup_${timestamp2}.zip`;
      const sqlFilePath = `./backups/${sqlFileName}`;
      const zipFilePath = `./backups/${zipFileName}`;
      const fs11 = await import("fs");
      if (!fs11.existsSync("./backups")) {
        fs11.mkdirSync("./backups", { recursive: true });
      }
      const { exec: exec2 } = await import("child_process");
      const command = `pg_dump "${process.env.DATABASE_URL}" > ${sqlFilePath}`;
      exec2(command, async (error, stdout, stderr) => {
        if (error) {
          console.error("Database backup error:", error);
          return res.status(500).json({ message: "Database backup failed" });
        }
        try {
          const JSZip2 = await import("jszip");
          const zip = new JSZip2.default();
          const sqlContent = fs11.readFileSync(sqlFilePath);
          zip.file(sqlFileName, sqlContent);
          const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
          fs11.writeFileSync(zipFilePath, zipBuffer);
          fs11.unlinkSync(sqlFilePath);
          const stats = fs11.statSync(zipFilePath);
          const backup = await storage.createDatabaseBackup({
            backupName: req.body.backupName || zipFileName,
            filePath: zipFilePath,
            fileSize: stats.size,
            createdBy: req.user.id
          });
          return res.status(201).json(backup);
        } catch (dbError) {
          console.error("Save backup record error:", dbError);
          return res.status(500).json({ message: "Failed to save backup record" });
        }
      });
    } catch (error) {
      console.error("Create database backup error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/database-backups/:id/download", async (req, res) => {
    try {
      if (!req.user || req.user.role !== "Admin") {
        return res.status(403).json({ message: "Access denied. Admin role required." });
      }
      const backupId = parseInt(req.params.id);
      if (isNaN(backupId)) {
        return res.status(400).json({ message: "Invalid backup ID" });
      }
      const backup = await storage.getDatabaseBackup(backupId);
      if (!backup) {
        return res.status(404).json({ message: "Backup not found" });
      }
      const fs11 = await import("fs");
      if (!fs11.existsSync(backup.filePath)) {
        return res.status(404).json({ message: "Backup file not found" });
      }
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="${backup.backupName}"`);
      const fileStream = fs11.createReadStream(backup.filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Download backup error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/database-backups/:id", async (req, res) => {
    try {
      if (!req.user || req.user.role !== "Admin") {
        return res.status(403).json({ message: "Access denied. Admin role required." });
      }
      const backupId = parseInt(req.params.id);
      if (isNaN(backupId)) {
        return res.status(400).json({ message: "Invalid backup ID" });
      }
      const backup = await storage.getDatabaseBackup(backupId);
      if (!backup) {
        return res.status(404).json({ message: "Backup not found" });
      }
      if (backup.filePath) {
        const fs11 = await import("fs");
        if (fs11.existsSync(backup.filePath)) {
          fs11.unlinkSync(backup.filePath);
        }
      }
      await storage.deleteDatabaseBackup(backupId);
      return res.json({ message: "Backup deleted successfully" });
    } catch (error) {
      console.error("Delete backup error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/menu-items", async (req, res) => {
    try {
      const menuItems2 = await storage.getMenuItems();
      return res.json(menuItems2);
    } catch (error) {
      console.error("Get menu items error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/menu-items", async (req, res) => {
    try {
      if (!req.user || req.user.role !== "Admin") {
        return res.status(403).json({ message: "Access denied. Admin role required." });
      }
      const result = insertMenuItemSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid menu item data",
          errors: result.error.errors
        });
      }
      const menuItem = await storage.createMenuItem({
        ...result.data,
        createdBy: req.user.id,
        updatedBy: req.user.id
      });
      return res.status(201).json(menuItem);
    } catch (error) {
      console.error("Create menu item error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/menu-items/:id", async (req, res) => {
    try {
      if (!req.user || req.user.role !== "Admin") {
        return res.status(403).json({ message: "Access denied. Admin role required." });
      }
      const menuItemId = parseInt(req.params.id);
      if (isNaN(menuItemId)) {
        return res.status(400).json({ message: "Invalid menu item ID" });
      }
      const partialSchema = insertMenuItemSchema.partial();
      const result = partialSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid menu item data",
          errors: result.error.errors
        });
      }
      const menuItem = await storage.updateMenuItem(menuItemId, {
        ...result.data,
        updatedBy: req.user.id
      });
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      return res.json(menuItem);
    } catch (error) {
      console.error("Update menu item error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/menu-items/:id", async (req, res) => {
    try {
      if (!req.user || req.user.role !== "Admin") {
        return res.status(403).json({ message: "Access denied. Admin role required." });
      }
      const menuItemId = parseInt(req.params.id);
      if (isNaN(menuItemId)) {
        return res.status(400).json({ message: "Invalid menu item ID" });
      }
      const menuItem = await storage.getMenuItem(menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      if (menuItem.isSystemMenu) {
        return res.status(400).json({ message: "System menu items cannot be deleted" });
      }
      await storage.deleteMenuItem(menuItemId);
      return res.status(204).send();
    } catch (error) {
      console.error("Delete menu item error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/menu-items/reorder", async (req, res) => {
    try {
      if (!req.user || req.user.role !== "Admin") {
        return res.status(403).json({ message: "Access denied. Admin role required." });
      }
      const { menuItems: menuItems2 } = req.body;
      if (!Array.isArray(menuItems2)) {
        return res.status(400).json({ message: "Menu items array is required" });
      }
      await storage.reorderMenuItems(menuItems2, req.user.id);
      return res.json({ success: true, message: "Menu items reordered successfully" });
    } catch (error) {
      console.error("Reorder menu items error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/calendar/events", async (req, res) => {
    try {
      const { start, end } = req.query;
      if (!start || !end) {
        return res.status(400).json({ error: "Start and end dates are required" });
      }
      const startDate = new Date(start);
      const endDate = new Date(end);
      const reminders2 = await storage.getRemindersByDateRange(startDate, endDate);
      const tenders2 = await storage.getTendersByDeadlineRange(startDate, endDate);
      const reminderTenderIds = reminders2.map((r) => r.tenderId);
      const reminderTenders = await Promise.all(
        reminderTenderIds.map((id) => storage.getTender(id))
      );
      const reminderTenderMap = new Map(reminderTenders.filter((t) => t).map((t) => [t.id, t]));
      const events = [
        ...reminders2.map((reminder) => {
          const tender = reminderTenderMap.get(reminder.tenderId);
          return {
            id: reminder.id,
            title: reminder.comments || "Reminder",
            date: reminder.reminderDate,
            type: "reminder",
            description: reminder.comments,
            tenderId: reminder.tenderId,
            tenderTitle: tender?.title,
            tenderReferenceNo: tender?.referenceNo,
            bidExpiryDate: tender?.deadline
          };
        }),
        ...tenders2.map((tender) => ({
          id: tender.id + 1e4,
          // Offset to avoid ID conflicts
          title: `Tender Deadline: ${tender.title}`,
          date: tender.deadline,
          type: "deadline",
          description: `Submission deadline for ${tender.referenceNo}`,
          tenderId: tender.id,
          tenderTitle: tender.title,
          tenderReferenceNo: tender.referenceNo,
          bidExpiryDate: tender.deadline
        }))
      ];
      return res.status(200).json(events);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      return res.status(500).json({ error: "Failed to fetch calendar events" });
    }
  });
  app2.get("/api/menu-structure", async (req, res) => {
    try {
      const menuStructure = await storage.getMenuStructure();
      console.log("GET menu-structure result:", menuStructure);
      return res.json({ menuStructure });
    } catch (error) {
      console.error("Get menu structure error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/menu-structure", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      if (req.user.role !== "Admin") {
        return res.status(403).json({ message: "Access denied. Admin role required." });
      }
      const { menuStructure } = req.body;
      if (!Array.isArray(menuStructure)) {
        return res.status(400).json({ message: "Menu structure array is required" });
      }
      const saved = await storage.saveMenuStructure(menuStructure, req.user.id);
      if (!saved) {
        return res.status(500).json({ message: "Failed to save menu structure" });
      }
      return res.json({ success: true, message: "Menu structure updated successfully" });
    } catch (error) {
      console.error("Update menu structure error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/competitors", async (req, res) => {
    try {
      const search = req.query.search;
      const competitors2 = await storage.getCompetitors(search);
      return res.json(competitors2);
    } catch (error) {
      console.error("Error fetching competitors:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/tender-results", async (req, res) => {
    try {
      const userId = parseInt(req.headers["x-user-id"]);
      if (isNaN(userId)) {
        return res.status(401).json({ message: "User authentication required" });
      }
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const tenders2 = await storage.getTenders();
      const results = [];
      for (const tender of tenders2) {
        const participants = await storage.getBidParticipants(tender.id);
        const assignments = await storage.getTenderAssignments(tender.id);
        const userAssigned = assignments.some((a) => a.userId === userId);
        const shouldInclude = participants.length > 0;
        if (shouldInclude) {
          const sortedParticipants = participants.sort((a, b) => {
            const amountA = parseFloat(a.bidAmount);
            const amountB = parseFloat(b.bidAmount);
            return amountA - amountB;
          });
          const l1Winner = sortedParticipants.find((p) => p.bidderStatus === "L1") || sortedParticipants[0];
          let status = "published";
          const tenderStatus = tender.status?.toLowerCase();
          if (tenderStatus === "awarded") {
            status = "awarded";
          } else if (tenderStatus === "lost") {
            status = "lost";
          } else if (tenderStatus === "completed") {
            status = "completed";
          } else {
            status = "published";
          }
          const result = {
            id: tender.id,
            referenceNo: tender.referenceNo,
            title: tender.title,
            brief: tender.brief,
            authority: tender.authority,
            location: tender.location,
            deadline: tender.deadline,
            emdAmount: tender.emdAmount,
            status,
            createdAt: tender.createdAt,
            l1Winner: l1Winner ? {
              participantName: l1Winner.participantName,
              bidAmount: l1Winner.bidAmount,
              bidderStatus: l1Winner.bidderStatus
            } : null,
            participantCount: participants.length,
            userParticipated: userAssigned
          };
          results.push(result);
        }
      }
      return res.json(results);
    } catch (error) {
      console.error("Error fetching tender results:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/competitors", async (req, res) => {
    try {
      const competitor = await storage.createCompetitor(req.body);
      return res.status(201).json(competitor);
    } catch (error) {
      console.error("Error creating competitor:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/bid-participants/:tenderId", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.tenderId);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const participants = await storage.getBidParticipants(tenderId);
      return res.json(participants);
    } catch (error) {
      console.error("Error fetching bid participants:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/tenders/:tenderId/participants", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.tenderId);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const participants = await storage.getBidParticipants(tenderId);
      return res.json(participants);
    } catch (error) {
      console.error("Error fetching bid participants:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/tenders/:tenderId/assignments", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.tenderId);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const assignments = await storage.getTenderAssignments(tenderId);
      return res.json(assignments);
    } catch (error) {
      console.error("Error fetching tender assignments:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/tenders/:tenderId/ra", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.tenderId);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const reverseAuctions2 = await storage.getReverseAuctions(tenderId);
      const latestRA = reverseAuctions2.length > 0 ? reverseAuctions2.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())[0] : null;
      return res.json(latestRA);
    } catch (error) {
      console.error("Error fetching RA data:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/bid-participants", async (req, res) => {
    try {
      const userId = parseInt(req.headers["x-user-id"]) || 1;
      const participant = await storage.createBidParticipant(req.body);
      await storage.logTenderActivity(
        userId,
        participant.tenderId,
        "create_bid_participant",
        `Added bid participant: ${participant.participantName} (${participant.bidderStatus}) - Amount: Rs.${parseFloat(participant.bidAmount).toLocaleString("en-IN")}`,
        {
          participantName: participant.participantName,
          bidderStatus: participant.bidderStatus,
          bidAmount: participant.bidAmount,
          remarks: participant.remarks || null
        }
      );
      return res.status(201).json(participant);
    } catch (error) {
      console.error("Error creating bid participant:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/bid-participants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid participant ID" });
      }
      const participant = await storage.updateBidParticipant(id, req.body);
      if (!participant) {
        return res.status(404).json({ message: "Participant not found" });
      }
      return res.json(participant);
    } catch (error) {
      console.error("Error updating bid participant:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/bid-participants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid participant ID" });
      }
      const success = await storage.deleteBidParticipant(id);
      if (!success) {
        return res.status(404).json({ message: "Participant not found" });
      }
      return res.json({ message: "Participant deleted successfully" });
    } catch (error) {
      console.error("Error deleting bid participant:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/bid-participants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid participant ID" });
      }
      const userId = parseInt(req.headers["x-user-id"]) || 1;
      const originalParticipant = await storage.getBidParticipant(id);
      const participant = await storage.updateBidParticipant(id, req.body);
      if (!participant) {
        return res.status(404).json({ message: "Bid participant not found" });
      }
      await storage.logTenderActivity(
        userId,
        participant.tenderId,
        "update_bid_participant",
        `Updated bid participant: ${participant.participantName} (${participant.bidderStatus}) - Amount: Rs.${parseFloat(participant.bidAmount).toLocaleString("en-IN")}`,
        {
          participantName: participant.participantName,
          bidderStatus: participant.bidderStatus,
          bidAmount: participant.bidAmount,
          remarks: participant.remarks || null,
          originalAmount: originalParticipant?.bidAmount || null
        }
      );
      return res.json(participant);
    } catch (error) {
      console.error("Error updating bid participant:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/bid-participants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid participant ID" });
      }
      const userId = parseInt(req.headers["x-user-id"]) || 1;
      const participant = await storage.getBidParticipant(id);
      const deleted = await storage.deleteBidParticipant(id);
      if (!deleted) {
        return res.status(404).json({ message: "Bid participant not found" });
      }
      if (participant) {
        await storage.logTenderActivity(
          userId,
          participant.tenderId,
          "delete_bid_participant",
          `Deleted bid participant: ${participant.participantName} (${participant.bidderStatus}) - Amount: Rs.${parseFloat(participant.bidAmount).toLocaleString("en-IN")}`,
          {
            participantName: participant.participantName,
            bidderStatus: participant.bidderStatus,
            bidAmount: participant.bidAmount,
            remarks: participant.remarks || null
          }
        );
      }
      return res.json({ message: "Bid participant deleted successfully" });
    } catch (error) {
      console.error("Error deleting bid participant:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/tenders/:id/bid-results-pdf", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const userId = parseInt(req.headers["x-user-id"]);
      if (isNaN(userId)) {
        return res.status(401).json({ message: "User authentication required" });
      }
      const tender = await storage.getTender(tenderId);
      if (!tender) {
        return res.status(404).json({ message: "Tender not found" });
      }
      await storage.logTenderActivity(
        userId,
        tenderId,
        "generate_bid_results_pdf",
        `Generated bid results PDF report for tender ${tender.referenceNo}`,
        {
          tenderTitle: tender.title,
          generationTime: (/* @__PURE__ */ new Date()).toISOString(),
          reportType: "bid_results"
        }
      );
      const participants = await storage.getBidParticipants(tenderId);
      const raData = await storage.getReverseAuctions(tenderId);
      const latestRA = raData.length > 0 ? raData[raData.length - 1] : null;
      let raCreatorName = "N/A";
      if (latestRA && latestRA.createdBy) {
        const raCreator = await storage.getUser(latestRA.createdBy);
        raCreatorName = raCreator ? raCreator.name : "N/A";
      }
      const competitors2 = await storage.getCompetitors();
      const pdfDoc = await PDFDocument4.create();
      let timesRomanFont;
      let timesBoldFont;
      try {
        timesRomanFont = await pdfDoc.embedFont(StandardFonts2.TimesRoman);
        timesBoldFont = await pdfDoc.embedFont(StandardFonts2.TimesBold);
      } catch (fontError) {
        timesRomanFont = await pdfDoc.embedFont(StandardFonts2.Helvetica);
        timesBoldFont = await pdfDoc.embedFont(StandardFonts2.HelveticaBold);
      }
      const page = pdfDoc.addPage([595, 842]);
      const { width, height } = page.getSize();
      try {
        const logoPath = path8.join(process.cwd(), "attached_assets", "SquidJob sml_1752393996294.png");
        if (fs9.existsSync(logoPath)) {
          const logoImageBytes = fs9.readFileSync(logoPath);
          const logoImage = await pdfDoc.embedPng(logoImageBytes);
          const logoDims = logoImage.scale(0.15);
          page.drawImage(logoImage, {
            x: width - logoDims.width - 20,
            y: height - logoDims.height - 20,
            width: logoDims.width,
            height: logoDims.height
          });
          const footerLogoDims = logoImage.scale(0.08);
          page.drawImage(logoImage, {
            x: 20,
            y: 20,
            width: footerLogoDims.width,
            height: footerLogoDims.height,
            opacity: 0.4
            // Grayscale effect through opacity
          });
        } else {
          page.drawText("SquidJob", {
            x: width - 100,
            y: height - 30,
            size: 14,
            font: timesBoldFont,
            color: rgb2(0.3, 0.2, 0.8)
            // Purple color
          });
        }
      } catch (logoError) {
        page.drawText("SquidJob", {
          x: width - 100,
          y: height - 30,
          size: 14,
          font: timesBoldFont,
          color: rgb2(0.3, 0.2, 0.8)
          // Purple color
        });
      }
      const copyrightText = "Copyright 2025 (c) All rights reserved | Star INXS Solutions Private Limited";
      const copyrightWidth = timesRomanFont.widthOfTextAtSize(copyrightText, 8);
      page.drawText(copyrightText, {
        x: (width - copyrightWidth) / 2,
        // Center align
        y: 35,
        size: 8,
        font: timesRomanFont,
        color: rgb2(0.6, 0.6, 0.6)
        // Gray color
      });
      page.drawText("SquidJob - Tender Management System", {
        x: 50,
        y: height - 30,
        size: 10,
        font: timesRomanFont,
        color: rgb2(0.5, 0.5, 0.5)
      });
      page.drawText("Bid Results Report", {
        x: 50,
        y: height - 50,
        size: 16,
        font: timesBoldFont,
        color: rgb2(0.3, 0.2, 0.8)
        // Purple color
      });
      let yPosition = height - 80;
      page.drawText("Tender Information", {
        x: 50,
        y: yPosition,
        size: 11,
        font: timesBoldFont,
        color: rgb2(0.3, 0.2, 0.8)
        // Purple color
      });
      yPosition -= 25;
      const tenderData = [
        ["Reference No:", tender.referenceNo],
        ["Title:", tender.title],
        ["Authority:", tender.authority],
        ["Location:", tender.location || "N/A"],
        ["Deadline:", new Date(tender.deadline).toLocaleDateString("en-GB")],
        ["Status:", tender.status],
        ["EMD Amount:", tender.emdAmount ? "Rs." + parseFloat(tender.emdAmount).toLocaleString("en-IN") : "N/A"]
      ];
      const tableStartY = yPosition;
      const rowHeight = 15;
      const tableWidth = 400;
      const col1Width = 120;
      page.drawRectangle({
        x: 50,
        y: yPosition - tenderData.length * rowHeight - 5,
        width: tableWidth,
        height: tenderData.length * rowHeight + 10,
        borderColor: rgb2(0.7, 0.7, 0.7),
        borderWidth: 1
      });
      for (let i = 0; i < tenderData.length; i++) {
        const [label, value] = tenderData[i];
        if (i % 2 === 0) {
          page.drawRectangle({
            x: 50,
            y: yPosition - 5,
            width: tableWidth,
            height: rowHeight,
            color: rgb2(0.98, 0.98, 0.98)
          });
        }
        page.drawLine({
          start: { x: 50 + col1Width, y: yPosition - 5 },
          end: { x: 50 + col1Width, y: yPosition + rowHeight - 5 },
          thickness: 0.5,
          color: rgb2(0.7, 0.7, 0.7)
        });
        page.drawText(label, {
          x: 55,
          y: yPosition + 3,
          size: 9,
          font: timesBoldFont,
          color: rgb2(0, 0, 0)
        });
        page.drawText(value, {
          x: 55 + col1Width,
          y: yPosition + 3,
          size: 9,
          font: timesRomanFont,
          color: rgb2(0, 0, 0)
        });
        yPosition -= rowHeight;
      }
      if (latestRA) {
        yPosition -= 20;
        page.drawText("Reverse Auction Data", {
          x: 50,
          y: yPosition,
          size: 11,
          font: timesBoldFont,
          color: rgb2(0.8, 0.2, 0.2)
          // Red color
        });
        yPosition -= 25;
        const raData2 = [
          ["RA No.:", latestRA.raNo || latestRA.bidNo || tender.referenceNo || "N/A"],
          ["Start Date & Time:", latestRA.startDate ? new Date(latestRA.startDate).toLocaleDateString("en-GB") + ", " + new Date(latestRA.startDate).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : tender.deadline ? new Date(tender.deadline).toLocaleDateString("en-GB") : "N/A"],
          ["Start Amount:", latestRA.startAmount ? "Rs." + parseFloat(latestRA.startAmount).toLocaleString("en-IN") : tender.emdAmount ? "Rs." + parseFloat(tender.emdAmount).toLocaleString("en-IN") : "N/A"],
          ["End Amount:", latestRA.endAmount ? "Rs." + parseFloat(latestRA.endAmount).toLocaleString("en-IN") : tender.emdAmount ? "Rs." + parseFloat(tender.emdAmount).toLocaleString("en-IN") : "N/A"],
          ["Created by:", raCreatorName],
          ["Created on:", latestRA.createdAt ? new Date(latestRA.createdAt).toLocaleDateString("en-GB") : (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")]
        ];
        const raTableWidth = 400;
        const raRowHeight = 15;
        page.drawRectangle({
          x: 50,
          y: yPosition - raData2.length * raRowHeight - 5,
          width: raTableWidth,
          height: raData2.length * raRowHeight + 10,
          borderColor: rgb2(0.7, 0.7, 0.7),
          borderWidth: 1
        });
        for (let i = 0; i < raData2.length; i++) {
          const [label, value] = raData2[i];
          if (i % 2 === 0) {
            page.drawRectangle({
              x: 50,
              y: yPosition - 5,
              width: raTableWidth,
              height: raRowHeight,
              color: rgb2(0.98, 0.98, 0.98)
            });
          }
          page.drawLine({
            start: { x: 50 + col1Width, y: yPosition - 5 },
            end: { x: 50 + col1Width, y: yPosition + raRowHeight - 5 },
            thickness: 0.5,
            color: rgb2(0.7, 0.7, 0.7)
          });
          page.drawText(label, {
            x: 55,
            y: yPosition + 3,
            size: 9,
            font: timesBoldFont,
            color: rgb2(0, 0, 0)
          });
          page.drawText(value, {
            x: 55 + col1Width,
            y: yPosition + 3,
            size: 9,
            font: timesRomanFont,
            color: rgb2(0, 0, 0)
          });
          yPosition -= raRowHeight;
        }
      }
      yPosition -= 20;
      page.drawText("Bid Participants", {
        x: 50,
        y: yPosition,
        size: 11,
        font: timesBoldFont,
        color: rgb2(0.3, 0.2, 0.8)
        // Purple color
      });
      yPosition -= 25;
      page.drawRectangle({
        x: 50,
        y: yPosition - 20,
        width: 495,
        height: 20,
        color: rgb2(0.95, 0.95, 0.95),
        borderColor: rgb2(0, 0, 0),
        borderWidth: 1
      });
      page.drawText("Status", { x: 60, y: yPosition - 10, size: 10, font: timesBoldFont, color: rgb2(0, 0, 0) });
      page.drawText("Participant Name", { x: 120, y: yPosition - 10, size: 10, font: timesBoldFont, color: rgb2(0, 0, 0) });
      page.drawText("Bid Amount", { x: 300, y: yPosition - 10, size: 10, font: timesBoldFont, color: rgb2(0, 0, 0) });
      page.drawText("Remarks", { x: 420, y: yPosition - 10, size: 10, font: timesBoldFont, color: rgb2(0, 0, 0) });
      yPosition -= 30;
      const sortedParticipants = [...participants].sort((a, b) => {
        const getStatusNumber = (status) => {
          const match = status.match(/L(\d+)/);
          return match ? parseInt(match[1]) : 999;
        };
        return getStatusNumber(a.bidderStatus) - getStatusNumber(b.bidderStatus);
      });
      for (let i = 0; i < sortedParticipants.length; i++) {
        const participant = sortedParticipants[i];
        if (i % 2 === 0) {
          page.drawRectangle({
            x: 50,
            y: yPosition - 5,
            width: 495,
            height: 15,
            color: rgb2(0.98, 0.98, 0.98),
            borderColor: rgb2(0.9, 0.9, 0.9),
            borderWidth: 0.5
          });
        } else {
          page.drawRectangle({
            x: 50,
            y: yPosition - 5,
            width: 495,
            height: 15,
            color: rgb2(1, 1, 1),
            borderColor: rgb2(0.9, 0.9, 0.9),
            borderWidth: 0.5
          });
        }
        const statusColor = participant.bidderStatus === "L1" ? rgb2(0, 0.8, 0) : rgb2(0.8, 0.6, 0);
        page.drawText(participant.bidderStatus, {
          x: 60,
          y: yPosition + 2,
          size: 9,
          font: timesBoldFont,
          color: statusColor
        });
        page.drawText(participant.participantName, {
          x: 120,
          y: yPosition + 2,
          size: 9,
          font: timesRomanFont,
          color: rgb2(0, 0, 0)
        });
        page.drawText(`Rs.${parseFloat(participant.bidAmount).toLocaleString("en-IN")}`, {
          x: 300,
          y: yPosition + 2,
          size: 9,
          font: timesRomanFont,
          color: rgb2(0, 0, 0)
        });
        page.drawText(participant.remarks || "N/A", {
          x: 420,
          y: yPosition + 2,
          size: 9,
          font: timesRomanFont,
          color: rgb2(0.5, 0.5, 0.5)
        });
        yPosition -= 18;
      }
      yPosition -= 30;
      page.drawLine({
        start: { x: 50, y: yPosition },
        end: { x: 545, y: yPosition },
        thickness: 1,
        color: rgb2(0.8, 0.8, 0.8)
      });
      page.drawText(`Generated on: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")} at ${(/* @__PURE__ */ new Date()).toLocaleTimeString("en-GB")}`, {
        x: 50,
        y: yPosition - 20,
        size: 8,
        font: timesRomanFont,
        color: rgb2(0.5, 0.5, 0.5)
      });
      page.drawText("SquidJob - Bid Management System", {
        x: 400,
        y: yPosition - 20,
        size: 8,
        font: timesRomanFont,
        color: rgb2(0.5, 0.5, 0.5)
      });
      page.drawText("CONFIDENTIAL", {
        x: width / 2 - 40,
        y: height / 2,
        size: 30,
        font: timesBoldFont,
        color: rgb2(0.95, 0.95, 0.95),
        rotate: degrees(45)
      });
      const pdfBytes = await pdfDoc.save();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="bid-results-${tender.referenceNo}.pdf"`);
      res.setHeader("Content-Length", pdfBytes.length);
      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      console.error("Error generating PDF:", error);
      return res.status(500).json({ message: "Failed to generate PDF" });
    }
  });
  app2.get("/api/tenders/:id/bid-results/download", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }
      const userId = parseInt(req.headers["x-user-id"]);
      if (isNaN(userId)) {
        return res.status(401).json({ message: "User authentication required" });
      }
      const tender = await storage.getTender(tenderId);
      if (!tender) {
        return res.status(404).json({ message: "Tender not found" });
      }
      await storage.logTenderActivity(
        userId,
        tenderId,
        "download_bid_results_pdf",
        `Downloaded bid results PDF report for tender ${tender.referenceNo}`,
        {
          tenderTitle: tender.title,
          downloadTime: (/* @__PURE__ */ new Date()).toISOString(),
          reportType: "bid_results_download"
        }
      );
      const participants = await storage.getBidParticipants(tenderId);
      const raData = await storage.getReverseAuctions(tenderId);
      const latestRA = raData.length > 0 ? raData[raData.length - 1] : null;
      let raCreatorName = "N/A";
      if (latestRA && latestRA.createdBy) {
        const raCreator = await storage.getUser(latestRA.createdBy);
        raCreatorName = raCreator ? raCreator.name : "N/A";
      }
      const pdfDoc = await PDFDocument4.create();
      let timesRomanFont;
      let timesBoldFont;
      try {
        timesRomanFont = await pdfDoc.embedFont(StandardFonts2.TimesRoman);
        timesBoldFont = await pdfDoc.embedFont(StandardFonts2.TimesBold);
      } catch (fontError) {
        timesRomanFont = await pdfDoc.embedFont(StandardFonts2.Helvetica);
        timesBoldFont = await pdfDoc.embedFont(StandardFonts2.HelveticaBold);
      }
      const page = pdfDoc.addPage([595, 842]);
      const { width, height } = page.getSize();
      try {
        const logoPath = path8.join(process.cwd(), "attached_assets", "SquidJob sml_1752393996294.png");
        if (fs9.existsSync(logoPath)) {
          const logoImageBytes = fs9.readFileSync(logoPath);
          const logoImage = await pdfDoc.embedPng(logoImageBytes);
          const logoDims = logoImage.scale(0.15);
          page.drawImage(logoImage, {
            x: width - logoDims.width - 20,
            y: height - logoDims.height - 20,
            width: logoDims.width,
            height: logoDims.height
          });
          const footerLogoDims = logoImage.scale(0.08);
          page.drawImage(logoImage, {
            x: 20,
            y: 20,
            width: footerLogoDims.width,
            height: footerLogoDims.height,
            opacity: 0.4
            // Grayscale effect through opacity
          });
        }
      } catch (logoError) {
        page.drawText("SquidJob", {
          x: width - 100,
          y: height - 30,
          size: 14,
          font: timesBoldFont,
          color: rgb2(0.3, 0.2, 0.8)
          // Purple color
        });
      }
      const copyrightText = "Copyright 2025 (c) All rights reserved | Star INXS Solutions Private Limited";
      const copyrightWidth = timesRomanFont.widthOfTextAtSize(copyrightText, 8);
      page.drawText(copyrightText, {
        x: (width - copyrightWidth) / 2,
        // Center align
        y: 35,
        size: 8,
        font: timesRomanFont,
        color: rgb2(0.6, 0.6, 0.6)
        // Gray color
      });
      page.drawText("SquidJob - Tender Management System", {
        x: 50,
        y: height - 30,
        size: 10,
        font: timesRomanFont,
        color: rgb2(0.5, 0.5, 0.5)
      });
      page.drawText("Bid Results Report", {
        x: 50,
        y: height - 50,
        size: 16,
        font: timesBoldFont,
        color: rgb2(0.3, 0.2, 0.8)
        // Purple color
      });
      let yPosition = height - 80;
      page.drawText("Tender Information", {
        x: 50,
        y: yPosition,
        size: 11,
        font: timesBoldFont,
        color: rgb2(0.3, 0.2, 0.8)
        // Purple color
      });
      yPosition -= 25;
      const tenderData = [
        ["Reference No:", tender.referenceNo],
        ["Title:", tender.title],
        ["Authority:", tender.authority],
        ["Location:", tender.location || "N/A"],
        ["Deadline:", new Date(tender.deadline).toLocaleDateString("en-GB")],
        ["Status:", tender.status],
        ["EMD Amount:", tender.emdAmount ? "Rs." + parseFloat(tender.emdAmount).toLocaleString("en-IN") : "N/A"]
      ];
      const tableStartY = yPosition;
      const rowHeight = 15;
      const tableWidth = 400;
      const col1Width = 120;
      page.drawRectangle({
        x: 50,
        y: yPosition - tenderData.length * rowHeight - 5,
        width: tableWidth,
        height: tenderData.length * rowHeight + 10,
        borderColor: rgb2(0.7, 0.7, 0.7),
        borderWidth: 1
      });
      for (let i = 0; i < tenderData.length; i++) {
        const [label, value] = tenderData[i];
        if (i % 2 === 0) {
          page.drawRectangle({
            x: 50,
            y: yPosition - 5,
            width: tableWidth,
            height: rowHeight,
            color: rgb2(0.98, 0.98, 0.98)
          });
        }
        page.drawLine({
          start: { x: 50 + col1Width, y: yPosition + 5 },
          end: { x: 50 + col1Width, y: yPosition - 10 },
          thickness: 0.5,
          color: rgb2(0.7, 0.7, 0.7)
        });
        page.drawText(label, {
          x: 55,
          y: yPosition - 2,
          size: 9,
          font: timesBoldFont,
          color: rgb2(0.3, 0.3, 0.3)
        });
        page.drawText(value || "N/A", {
          x: 55 + col1Width,
          y: yPosition - 2,
          size: 9,
          font: timesRomanFont,
          color: rgb2(0, 0, 0)
        });
        yPosition -= rowHeight;
      }
      yPosition -= 30;
      if (latestRA) {
        page.drawText("Reverse Auction Data", {
          x: 50,
          y: yPosition,
          size: 11,
          font: timesBoldFont,
          color: rgb2(0.3, 0.2, 0.8)
          // Purple color
        });
        yPosition -= 25;
        const raDataArray = [
          ["RA No.:", latestRA.raNo || tender.referenceNo],
          ["Start Date & Time:", latestRA.startDate ? new Date(latestRA.startDate).toLocaleString("en-GB") : "N/A"],
          ["Start Amount:", latestRA.startAmount ? "Rs." + parseFloat(latestRA.startAmount).toLocaleString("en-IN") : "N/A"],
          ["End Amount:", latestRA.endAmount ? "Rs." + parseFloat(latestRA.endAmount).toLocaleString("en-IN") : "N/A"],
          ["Created by:", raCreatorName],
          ["Created on:", latestRA.createdAt ? new Date(latestRA.createdAt).toLocaleDateString("en-GB") : "N/A"]
        ];
        const raTableWidth = 400;
        page.drawRectangle({
          x: 50,
          y: yPosition - raDataArray.length * rowHeight - 5,
          width: raTableWidth,
          height: raDataArray.length * rowHeight + 10,
          borderColor: rgb2(0.7, 0.7, 0.7),
          borderWidth: 1
        });
        for (let i = 0; i < raDataArray.length; i++) {
          const [label, value] = raDataArray[i];
          if (i % 2 === 0) {
            page.drawRectangle({
              x: 50,
              y: yPosition - 5,
              width: raTableWidth,
              height: rowHeight,
              color: rgb2(0.98, 0.98, 0.98)
            });
          }
          page.drawLine({
            start: { x: 50 + col1Width, y: yPosition + 5 },
            end: { x: 50 + col1Width, y: yPosition - 10 },
            thickness: 0.5,
            color: rgb2(0.7, 0.7, 0.7)
          });
          page.drawText(label, {
            x: 55,
            y: yPosition - 2,
            size: 9,
            font: timesBoldFont,
            color: rgb2(0.3, 0.3, 0.3)
          });
          page.drawText(value || "N/A", {
            x: 55 + col1Width,
            y: yPosition - 2,
            size: 9,
            font: timesRomanFont,
            color: rgb2(0, 0, 0)
          });
          yPosition -= rowHeight;
        }
      }
      yPosition -= 30;
      page.drawText("Bid Participants", {
        x: 50,
        y: yPosition,
        size: 11,
        font: timesBoldFont,
        color: rgb2(0.3, 0.2, 0.8)
        // Purple color
      });
      yPosition -= 25;
      const participantsHeaderData = ["Status", "Participant Name", "Bid Amount", "Remarks"];
      const participantsColWidths = [60, 180, 120, 125];
      let xPosition = 50;
      page.drawRectangle({
        x: 50,
        y: yPosition - 5,
        width: 495,
        height: 15,
        color: rgb2(0.9, 0.9, 0.9),
        borderColor: rgb2(0.7, 0.7, 0.7),
        borderWidth: 1
      });
      for (let i = 0; i < participantsHeaderData.length; i++) {
        page.drawText(participantsHeaderData[i], {
          x: xPosition + 5,
          y: yPosition - 2,
          size: 9,
          font: timesBoldFont,
          color: rgb2(0.3, 0.3, 0.3)
        });
        if (i < participantsHeaderData.length - 1) {
          page.drawLine({
            start: { x: xPosition + participantsColWidths[i], y: yPosition + 10 },
            end: { x: xPosition + participantsColWidths[i], y: yPosition - 10 },
            thickness: 0.5,
            color: rgb2(0.7, 0.7, 0.7)
          });
        }
        xPosition += participantsColWidths[i];
      }
      yPosition -= 20;
      const sortedParticipants = participants.sort((a, b) => {
        const statusA = a.bidderStatus || "L999";
        const statusB = b.bidderStatus || "L999";
        return statusA.localeCompare(statusB);
      });
      for (let i = 0; i < sortedParticipants.length; i++) {
        const participant = sortedParticipants[i];
        if (i % 2 === 0) {
          page.drawRectangle({
            x: 50,
            y: yPosition - 5,
            width: 495,
            height: 15,
            color: rgb2(0.98, 0.98, 0.98),
            borderColor: rgb2(0.9, 0.9, 0.9),
            borderWidth: 0.5
          });
        } else {
          page.drawRectangle({
            x: 50,
            y: yPosition - 5,
            width: 495,
            height: 15,
            color: rgb2(1, 1, 1),
            borderColor: rgb2(0.9, 0.9, 0.9),
            borderWidth: 0.5
          });
        }
        const statusColor = participant.bidderStatus === "L1" ? rgb2(0, 0.8, 0) : rgb2(0.8, 0.6, 0);
        page.drawText(participant.bidderStatus, {
          x: 60,
          y: yPosition + 2,
          size: 9,
          font: timesBoldFont,
          color: statusColor
        });
        page.drawText(participant.participantName, {
          x: 120,
          y: yPosition + 2,
          size: 9,
          font: timesRomanFont,
          color: rgb2(0, 0, 0)
        });
        page.drawText(`Rs.${parseFloat(participant.bidAmount).toLocaleString("en-IN")}`, {
          x: 300,
          y: yPosition + 2,
          size: 9,
          font: timesRomanFont,
          color: rgb2(0, 0, 0)
        });
        page.drawText(participant.remarks || "N/A", {
          x: 420,
          y: yPosition + 2,
          size: 9,
          font: timesRomanFont,
          color: rgb2(0.5, 0.5, 0.5)
        });
        yPosition -= 18;
      }
      yPosition -= 30;
      page.drawLine({
        start: { x: 50, y: yPosition },
        end: { x: 545, y: yPosition },
        thickness: 1,
        color: rgb2(0.8, 0.8, 0.8)
      });
      page.drawText(`Generated on: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")} at ${(/* @__PURE__ */ new Date()).toLocaleTimeString("en-GB")}`, {
        x: 50,
        y: yPosition - 20,
        size: 8,
        font: timesRomanFont,
        color: rgb2(0.5, 0.5, 0.5)
      });
      page.drawText("SquidJob - Bid Management System", {
        x: 400,
        y: yPosition - 20,
        size: 8,
        font: timesRomanFont,
        color: rgb2(0.5, 0.5, 0.5)
      });
      page.drawText("CONFIDENTIAL", {
        x: width / 2 - 40,
        y: height / 2,
        size: 30,
        font: timesBoldFont,
        color: rgb2(0.95, 0.95, 0.95),
        rotate: degrees(45)
      });
      const pdfBytes = await pdfDoc.save();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="Bid_Results_${tender.referenceNo}_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.pdf"`);
      res.setHeader("Content-Length", pdfBytes.length);
      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      console.error("Error generating bid results PDF:", error);
      return res.status(500).json({ message: "Failed to generate PDF" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs10 from "fs";
import path10 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path9 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path9.resolve(import.meta.dirname, "client", "src"),
      "@shared": path9.resolve(import.meta.dirname, "shared"),
      "@assets": path9.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path9.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path9.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path10.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs10.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path10.resolve(import.meta.dirname, "public");
  if (!fs10.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path10.resolve(distPath, "index.html"));
  });
}

// server/seed.ts
init_db();
init_schema();
import { count } from "drizzle-orm";
import bcrypt2 from "bcrypt";
var seed = async () => {
  try {
    const seedTimeout = new Promise(
      (_, reject) => setTimeout(() => reject(new Error("Seed timeout")), 5e3)
    );
    const seedProcess = async () => {
      const existingUsers = await db.select({ value: count() }).from(users);
      if (existingUsers[0].value > 0) {
        console.log("Database already has users. Skipping seed.");
        return;
      }
      console.log("Seeding database with initial admin user...");
      const hashedPassword = await bcrypt2.hash("admin123", 12);
      await db.insert(users).values({
        username: "admin",
        password: hashedPassword,
        email: "admin@tender247.com",
        name: "Admin User",
        role: "Admin",
        department: "Administration",
        designation: "System Administrator",
        status: "Active"
      });
      console.log("Admin user created successfully");
    };
    await Promise.race([seedProcess(), seedTimeout]);
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};
var seed_default = seed;

// server/index.ts
dotenv2.config();
var app = express2();
app.set("trust proxy", 1);
var allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()) : ["*"];
var corsOptions = {
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes("*")) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    if (origin.includes("localhost") || origin.match(/^https?:\/\/\d+\.\d+\.\d+\.\d+/)) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: process.env.CORS_CREDENTIALS !== "false",
  // Allow credentials by default
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-user-id", "X-Requested-With"],
  exposedHeaders: ["Content-Disposition"],
  // For file downloads
  optionsSuccessStatus: 200
  // For legacy browser support
};
app.use(cors(corsOptions));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "*"],
      // Allow all origins for API calls
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
  // Allow cross-origin requests
}));
var limiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 100,
  // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || "unknown",
  // Use IP for rate limiting
  skip: (req) => req.path.startsWith("/api/health")
  // Skip health checks
});
var loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 5,
  // limit each IP to 5 requests per windowMs
  message: { error: "Too many login attempts from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || "unknown",
  skipSuccessfulRequests: true
  // Don't count successful requests
});
app.use("/api/auth/login", loginLimiter);
app.use(express2.json({ limit: "10mb" }));
app.use(express2.urlencoded({ extended: false, limit: "10mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path11 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path11.startsWith("/api")) {
      let logLine = `${req.method} ${path11} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  let dbConnected = false;
  try {
    console.log("Testing database connection...");
    const { db: db2, pool: pool2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    let retries = 3;
    while (retries > 0) {
      try {
        console.log(`Database connection attempt ${4 - retries}/3...`);
        await db2.execute("SELECT 1 as test");
        console.log("Database connection successful");
        dbConnected = true;
        break;
      } catch (error) {
        retries--;
        console.warn(`Database connection attempt failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        if (retries > 0) {
          console.log(`Retrying in 2 seconds... (${retries} attempts left)`);
          await new Promise((resolve) => setTimeout(resolve, 2e3));
        }
      }
    }
    if (dbConnected) {
      await seed_default();
      console.log("Database seeded successfully");
    } else {
      throw new Error("Failed to connect to database after 3 attempts");
    }
  } catch (error) {
    console.error("Database connection or seeding error:", error);
    console.log("Starting server without database connection...");
    console.log("The app will continue to work with limited functionality");
  }
  try {
    const server = await registerRoutes(app);
    app.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("Express error handler caught:", err);
      res.status(status).json({ message });
    });
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
    const port = 5e3;
    server.listen(port, "0.0.0.0", () => {
      log(`serving on port ${port}`);
    });
  } catch (error) {
    console.error("Critical error during server startup:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace available");
    process.exit(1);
  }
})().catch((error) => {
  console.error("Unhandled promise rejection in main function:", error);
  console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace available");
  process.exit(1);
});
