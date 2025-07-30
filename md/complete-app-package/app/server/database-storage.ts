import { db } from "./db";
import { eq, and, desc, or, sql, like, inArray, lte, gte, lt, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
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
  purchaseOrders, type PurchaseOrder, type InsertPurchaseOrder,
  dealers, type Dealer, type InsertDealer,
  oems, type OEM, type InsertOEM,
  financialApprovals, type FinancialApproval, type InsertFinancialApproval,
  companies, type Company, type InsertCompany,
  companyDocuments, type CompanyDocument, type InsertCompanyDocument,
  bidParticipations, type BidParticipation, type InsertBidParticipation,
  bidParticipationCompanies, type BidParticipationCompany, type InsertBidParticipationCompany,
  kickOffCalls, type KickOffCall, type InsertKickOffCall,
  dashboardLayouts, type DashboardLayout, type InsertDashboardLayout,
  documentBriefcase, type DocumentBriefcase, type InsertDocumentBriefcase,
  checklists, type Checklist, type InsertChecklist,
  checklistDocuments, type ChecklistDocument, type InsertChecklistDocument,
  tenderResponses, type TenderResponse, type InsertTenderResponse,
  financialRequests, type FinancialRequest, type InsertFinancialRequest,
  taskAllocations, type TaskAllocation, type InsertTaskAllocation,
  approvalRequests, type ApprovalRequest, type InsertApprovalRequest,
  generalSettings, type GeneralSettings, type InsertGeneralSettings,
  databaseBackups, type DatabaseBackup, type InsertDatabaseBackup,
  configurations, type Configuration, type InsertConfiguration,
  menuItems, type MenuItem, type InsertMenuItem,
  reverseAuctions, type ReverseAuction, type InsertReverseAuction,
  bidParticipants, type BidParticipant, type InsertBidParticipant
} from "@shared/schema";
import { IStorage } from "./storage";
import { normalizeFilePath, resolveFilePath } from "./config";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user || undefined;
    } catch (error) {
      console.error("Database error in getUserByUsername:", error);
      // Retry once on database connection errors
      try {
        await new Promise(resolve => setTimeout(resolve, 100)); // Brief delay
        const [user] = await db.select().from(users).where(eq(users.username, username));
        return user || undefined;
      } catch (retryError) {
        console.error("Retry failed for getUserByUsername:", retryError);
        throw retryError;
      }
    }
  }

  async getCurrentUser(req: any): Promise<User | undefined> {
    if (req.session?.user?.id) {
      return await this.getUser(req.session.user.id);
    }
    return undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set(userData)
        .where(eq(users.id, id))
        .returning();
      
      return updatedUser || undefined;
    } catch (error) {
      console.error("Error updating user:", error);
      return undefined;
    }
  }
  
  // Tender methods
  async getTenders(): Promise<Tender[]> {
    return await db.select().from(tenders);
  }
  
  // Search tenders by reference number (full or last 7 digits)
  async searchTenders(searchTerm: string): Promise<Tender[]> {
    // Normalize the search term for case-insensitive search
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    
    if (!normalizedSearchTerm) {
      return [];
    }
    
    // Search for tenders where any field contains the search term (case-insensitive)
    return await db
      .select()
      .from(tenders)
      .where(
        or(
          sql`LOWER(${tenders.referenceNo}) LIKE ${'%' + normalizedSearchTerm + '%'}`,
          sql`LOWER(${tenders.title}) LIKE ${'%' + normalizedSearchTerm + '%'}`,
          sql`LOWER(${tenders.authority}) LIKE ${'%' + normalizedSearchTerm + '%'}`,
          sql`LOWER(${tenders.location}) LIKE ${'%' + normalizedSearchTerm + '%'}`
        )
      )
      .orderBy(desc(tenders.createdAt));
  }

  async getTender(id: number): Promise<Tender | undefined> {
    const [tender] = await db.select().from(tenders).where(eq(tenders.id, id));
    return tender || undefined;
  }

  async getTenderByReference(referenceNo: string): Promise<Tender | undefined> {
    const [tender] = await db.select().from(tenders).where(eq(tenders.referenceNo, referenceNo));
    return tender || undefined;
  }

  async createTender(insertTender: InsertTender): Promise<Tender> {
    const [tender] = await db
      .insert(tenders)
      .values(insertTender)
      .returning();
    return tender;
  }

  async updateTender(id: number, updateTender: Partial<InsertTender>): Promise<Tender | undefined> {
    const [updatedTender] = await db
      .update(tenders)
      .set({ ...updateTender, updatedAt: new Date() })
      .where(eq(tenders.id, id))
      .returning();
    return updatedTender || undefined;
  }
  
  // Tender Assignment methods
  async getTenderAssignments(tenderId: number): Promise<TenderAssignment[]> {
    const assignedByUser = alias(users, 'assigned_by_user');
    
    const assignments = await db
      .select({
        id: tenderAssignments.id,
        tenderId: tenderAssignments.tenderId,
        userId: tenderAssignments.userId,
        assignedBy: tenderAssignments.assignedBy,
        assignType: tenderAssignments.assignType,
        comments: tenderAssignments.comments,
        createdAt: tenderAssignments.createdAt,
        assignedToName: users.name,
        assignedByName: assignedByUser.name
      })
      .from(tenderAssignments)
      .leftJoin(users, eq(tenderAssignments.userId, users.id))
      .leftJoin(assignedByUser, eq(tenderAssignments.assignedBy, assignedByUser.id))
      .where(eq(tenderAssignments.tenderId, tenderId));

    // Transform to match expected interface
    return assignments.map(assignment => ({
      id: assignment.id,
      tenderId: assignment.tenderId,
      userId: assignment.userId,
      assignedBy: assignment.assignedBy,
      assignType: assignment.assignType,
      comments: assignment.comments,
      createdAt: assignment.createdAt,
      assignedTo: assignment.assignedToName || 'Unknown User',
      assignedByName: assignment.assignedByName || 'Unknown User'
    }));
  }
  
  async getTenderWithAssignments(tenderId: number): Promise<{ tender: Tender, assignments: (TenderAssignment & { user: { name: string } })[] }> {
    const [tender] = await db
      .select()
      .from(tenders)
      .where(eq(tenders.id, tenderId));
      
    if (!tender) {
      throw new Error("Tender not found");
    }
    
    // Get assignments with user names
    const assignments = await db
      .select({
        id: tenderAssignments.id,
        tenderId: tenderAssignments.tenderId,
        userId: tenderAssignments.userId,
        assignedBy: tenderAssignments.assignedBy,
        assignType: tenderAssignments.assignType,
        comments: tenderAssignments.comments,
        createdAt: tenderAssignments.createdAt,
        user: {
          name: users.name,
        }
      })
      .from(tenderAssignments)
      .innerJoin(users, eq(tenderAssignments.userId, users.id))
      .where(eq(tenderAssignments.tenderId, tenderId));
      
    return { tender, assignments };
  }
  
  async getTendersWithAssignments(): Promise<(Tender & { assignedUser?: { id: number, name: string } })[]> {
    // First get all tenders
    const allTenders = await db
      .select()
      .from(tenders)
      .orderBy(desc(tenders.createdAt));
      
    // Get all assignments (we'll match them to tenders later)
    const allAssignments = await db
      .select({
        id: tenderAssignments.id,
        tenderId: tenderAssignments.tenderId,
        userId: tenderAssignments.userId,
        assignedBy: tenderAssignments.assignedBy,
        assignType: tenderAssignments.assignType,
        createdAt: tenderAssignments.createdAt,
        userName: users.name,
        assignedUserId: users.id
      })
      .from(tenderAssignments)
      .innerJoin(users, eq(tenderAssignments.userId, users.id))
      .orderBy(desc(tenderAssignments.createdAt));
    
    // Group assignments by tender ID
    const assignmentsByTender = allAssignments.reduce((acc, assignment) => {
      acc[assignment.tenderId] = acc[assignment.tenderId] || [];
      acc[assignment.tenderId].push(assignment);
      return acc;
    }, {} as Record<number, typeof allAssignments>);
    
    // Merge tenders with their latest assignment
    return allTenders.map(tender => {
      const tenderAssignments = assignmentsByTender[tender.id] || [];
      
      // Get the latest assignment (they're already sorted by createdAt desc)
      const latestAssignment = tenderAssignments[0];
      
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

  async getAssignedTenders(): Promise<any[]> {
    // Get all tender assignments
    const assignments = await db
      .select({
        tenderId: tenderAssignments.tenderId,
        userId: tenderAssignments.userId,
        assignedBy: tenderAssignments.assignedBy,
        createdAt: tenderAssignments.createdAt,
        comments: tenderAssignments.comments
      })
      .from(tenderAssignments)
      .orderBy(desc(tenderAssignments.createdAt));

    if (assignments.length === 0) {
      return [];
    }

    // Get unique tender IDs that have assignments
    const uniqueTenderIds = Array.from(new Set(assignments.map(a => a.tenderId)));
    
    // Get tender details for assigned tenders only
    const tenderData = await db
      .select()
      .from(tenders)
      .where(inArray(tenders.id, uniqueTenderIds));
    
    // Get user details for assigned users and assigners
    const assignedUserIds = assignments.map(a => a.userId);
    const assignedByIds = assignments.map(a => a.assignedBy);
    const allUserIds = [...assignedUserIds, ...assignedByIds];
    const uniqueUserIds = Array.from(new Set(allUserIds));
    
    const userData = await db
      .select({
        id: users.id,
        name: users.name
      })
      .from(users)
      .where(inArray(users.id, uniqueUserIds));

    // Create lookup maps
    const userMap = userData.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {} as Record<number, { id: number, name: string }>);

    const tenderMap = tenderData.reduce((acc, tender) => {
      acc[tender.id] = tender;
      return acc;
    }, {} as Record<number, typeof tenderData[0]>);

    // Get latest assignment for each tender
    const latestAssignments = uniqueTenderIds.map(tenderId => {
      const tenderAssignments = assignments.filter(a => a.tenderId === tenderId);
      return tenderAssignments[0]; // First one is latest due to ordering
    });

    // Build result - only return tenders that actually have assignments
    return latestAssignments.map(assignment => {
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
    }).filter(item => item !== null);
  }

  async createTenderAssignment(insertAssignment: InsertTenderAssignment): Promise<TenderAssignment> {
    // Check if assignment already exists to prevent duplicates
    const existingAssignment = await db
      .select()
      .from(tenderAssignments)
      .where(and(
        eq(tenderAssignments.tenderId, insertAssignment.tenderId),
        eq(tenderAssignments.userId, insertAssignment.userId)
      ))
      .limit(1);
    
    if (existingAssignment.length > 0) {
      // Update existing assignment instead of creating duplicate
      const [updatedAssignment] = await db
        .update(tenderAssignments)
        .set({
          assignedBy: insertAssignment.assignedBy,
          assignType: insertAssignment.assignType,
          comments: insertAssignment.comments,
          createdAt: new Date()
        })
        .where(eq(tenderAssignments.id, existingAssignment[0].id))
        .returning();
      return updatedAssignment;
    }
    
    const [assignment] = await db
      .insert(tenderAssignments)
      .values(insertAssignment)
      .returning();
    return assignment;
  }

  async deleteAssignment(assignmentId: number): Promise<boolean> {
    const result = await db
      .delete(tenderAssignments)
      .where(eq(tenderAssignments.id, assignmentId));
    return (result.rowCount || 0) > 0;
  }

  async deleteTenderAssignment(assignmentId: number): Promise<boolean> {
    const result = await db
      .delete(tenderAssignments)
      .where(eq(tenderAssignments.id, assignmentId))
      .returning();
    return result.length > 0;
  }

  // Get tenders assigned to a specific user
  async getUserAssignedTenders(userId: number, status?: string): Promise<any[]> {
    // Get assignments for the specific user
    const assignments = await db
      .select({
        id: tenderAssignments.id,
        tenderId: tenderAssignments.tenderId,
        userId: tenderAssignments.userId,
        assignedBy: tenderAssignments.assignedBy,
        createdAt: tenderAssignments.createdAt,
        comments: tenderAssignments.comments
      })
      .from(tenderAssignments)
      .where(eq(tenderAssignments.userId, userId))
      .orderBy(desc(tenderAssignments.createdAt));

    if (assignments.length === 0) {
      return [];
    }

    // Get unique tender IDs assigned to this user
    const tenderIds = assignments.map(a => a.tenderId);
    
    // Get tender details for assigned tenders
    let tenderQuery = db
      .select()
      .from(tenders)
      .where(inArray(tenders.id, tenderIds));

    // Apply status filter if provided
    if (status && status !== 'fresh' && status !== 'star' && status !== 'interested' && status !== 'bidToRa' && status !== 'expired') {
      tenderQuery = tenderQuery.where(eq(tenders.status, status)) as any;
    }

    const tenderData = await tenderQuery;
    
    // Get user details for both assigners and assigned users
    const assignedByIds = assignments.map(a => a.assignedBy);
    const assignedToIds = assignments.map(a => a.userId);
    const allUserIds = [...assignedByIds, ...assignedToIds];
    const uniqueUserIds = Array.from(new Set(allUserIds));
    
    const userData = await db
      .select({
        id: users.id,
        name: users.name
      })
      .from(users)
      .where(inArray(users.id, uniqueUserIds));

    // Create lookup maps
    const userMap = userData.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {} as Record<number, { id: number, name: string }>);

    const tenderMap = tenderData.reduce((acc, tender) => {
      acc[tender.id] = tender;
      return acc;
    }, {} as Record<number, typeof tenderData[0]>);

    // Get user tender data for stars and interests
    const userTenderEntries = await db
      .select()
      .from(userTenders)
      .where(and(
        eq(userTenders.userId, userId),
        inArray(userTenders.tenderId, tenderIds)
      ));

    const userTenderMap = userTenderEntries.reduce((acc, ut) => {
      acc[ut.tenderId] = ut;
      return acc;
    }, {} as Record<number, typeof userTenderEntries[0]>);

    // Get today's date for fresh filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Build result
    const result = await Promise.all(assignments.map(async assignment => {
      const tender = tenderMap[assignment.tenderId];
      const assignedByUser = userMap[assignment.assignedBy];
      const userTender = userTenderMap[assignment.tenderId];

      if (!tender) return null;

      // Apply fresh filter - check assignment date, not tender creation date
      if (status === 'fresh') {
        const assignmentDate = new Date(assignment.createdAt);
        assignmentDate.setHours(0, 0, 0, 0);
        // Show tenders assigned in the last 30 days (recent assignments)
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        if (assignmentDate.getTime() < thirtyDaysAgo.getTime()) {
          return null;
        }
      }

      // Apply bidToRa filter - check tender status
      if (status === 'bidToRa' && tender.status !== 'bidToRa') {
        return null;
      }

      // Apply expired filter - check if deadline has passed
      if (status === 'expired') {
        const deadline = new Date(tender.deadline);
        const now = new Date();
        if (deadline >= now) {
          return null;
        }
      }

      // Apply star/interested filters
      if (status === 'star' && !userTender?.isStarred) {
        return null;
      }
      if (status === 'interested' && !userTender?.isInterested) {
        return null;
      }

      // Get additional data for Excel export
      const bidParticipants = await this.getBidParticipants(tender.id);
      const sortedParticipants = bidParticipants.sort((a, b) => {
        const amountA = parseFloat(a.bidAmount);
        const amountB = parseFloat(b.bidAmount);
        return amountA - amountB;
      });
      const l1Winner = sortedParticipants.find(p => p.bidderStatus === 'L1') || sortedParticipants[0];
      
      const raData = await this.getReverseAuctions(tender.id);
      const latestRA = raData.length > 0 ? raData[raData.length - 1] : null;

      return {
        tender: {
          ...tender,
          assignedUser: { id: assignment.userId, name: userMap[assignment.userId]?.name || 'Unknown User' },
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

    return result.filter(item => item !== null);

    return result;
  }
  
  // User Tenders methods
  async getUserTenders(userId: number, status?: string): Promise<(UserTender & { tender: Tender })[]> {
    const userTenderEntries = await db
      .select()
      .from(userTenders)
      .where(eq(userTenders.userId, userId));
    
    // This is inefficient, but it's a simple implementation
    // In a real-world scenario, we'd use JOINs or a more efficient approach
    const result: (UserTender & { tender: Tender })[] = [];
    
    // Get today's date and set to midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (const userTender of userTenderEntries) {
      let tenderQuery = db
        .select()
        .from(tenders)
        .where(eq(tenders.id, userTender.tenderId));
      
      // Add filters based on requested status
      if (status === 'star' && !userTender.isStarred) {
        continue;
      } else if (status === 'interested' && !userTender.isInterested) {
        continue;
      }
      
      const [tender] = await tenderQuery;
      
      if (tender) {
        // For fresh tab, only include tenders created today
        if (status === 'fresh') {
          const createdAt = new Date(tender.createdAt);
          createdAt.setHours(0, 0, 0, 0);
          
          if (createdAt.getTime() !== today.getTime()) {
            continue;
          }
        } else if (status && status !== 'star' && status !== 'interested' && tender.status !== status) {
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

  async getUserTender(userId: number, tenderId: number): Promise<UserTender | undefined> {
    const [userTender] = await db
      .select()
      .from(userTenders)
      .where(and(
        eq(userTenders.userId, userId),
        eq(userTenders.tenderId, tenderId)
      ));
    return userTender;
  }

  async createUserTender(insertUserTender: InsertUserTender): Promise<UserTender> {
    const [userTender] = await db
      .insert(userTenders)
      .values(insertUserTender)
      .returning();
    return userTender;
  }

  async updateUserTender(id: number, updateUserTender: Partial<InsertUserTender>): Promise<UserTender | undefined> {
    const [userTender] = await db
      .update(userTenders)
      .set(updateUserTender)
      .where(eq(userTenders.id, id))
      .returning();
    return userTender;
  }

  async toggleTenderStar(userId: number, tenderId: number, isStarred: boolean): Promise<UserTender> {
    // Check if entry exists
    const [existingEntry] = await db
      .select()
      .from(userTenders)
      .where(and(
        eq(userTenders.userId, userId),
        eq(userTenders.tenderId, tenderId)
      ));

    if (existingEntry) {
      const [updatedEntry] = await db
        .update(userTenders)
        .set({ isStarred })
        .where(eq(userTenders.id, existingEntry.id))
        .returning();
      return updatedEntry;
    } else {
      const [newEntry] = await db
        .insert(userTenders)
        .values({
          userId,
          tenderId,
          isStarred,
          isInterested: false
        })
        .returning();
      return newEntry;
    }
  }

  async toggleTenderInterest(userId: number, tenderId: number, isInterested: boolean): Promise<UserTender> {
    // Check if entry exists
    const [existingEntry] = await db
      .select()
      .from(userTenders)
      .where(and(
        eq(userTenders.userId, userId),
        eq(userTenders.tenderId, tenderId)
      ));

    if (existingEntry) {
      const [updatedEntry] = await db
        .update(userTenders)
        .set({ isInterested })
        .where(eq(userTenders.id, existingEntry.id))
        .returning();
      return updatedEntry;
    } else {
      const [newEntry] = await db
        .insert(userTenders)
        .values({
          userId,
          tenderId,
          isStarred: false,
          isInterested
        })
        .returning();
      return newEntry;
    }
  }
  
  // Methods for filtered tender lists
  async getTendersByStatus(status: string): Promise<(Tender & { assignedUser?: { id: number, name: string } })[]> {
    // First get all tenders with the specific status
    const filteredTenders = await db
      .select()
      .from(tenders)
      .where(eq(tenders.status, status))
      .orderBy(desc(tenders.createdAt));
      
    // Get all assignments (we'll match them to tenders later)
    const allAssignments = await db
      .select({
        id: tenderAssignments.id,
        tenderId: tenderAssignments.tenderId,
        userId: tenderAssignments.userId,
        assignedBy: tenderAssignments.assignedBy,
        assignType: tenderAssignments.assignType,
        createdAt: tenderAssignments.createdAt,
        userName: users.name,
        assignedUserId: users.id
      })
      .from(tenderAssignments)
      .innerJoin(users, eq(tenderAssignments.userId, users.id))
      .orderBy(desc(tenderAssignments.createdAt));
    
    // Group assignments by tender ID
    const assignmentsByTender = allAssignments.reduce((acc, assignment) => {
      acc[assignment.tenderId] = acc[assignment.tenderId] || [];
      acc[assignment.tenderId].push(assignment);
      return acc;
    }, {} as Record<number, typeof allAssignments>);
    
    // Merge tenders with their latest assignment
    return filteredTenders.map(tender => {
      const tenderAssignments = assignmentsByTender[tender.id] || [];
      
      // Get the latest assignment (they're already sorted by createdAt desc)
      const latestAssignment = tenderAssignments[0];
      
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
  
  async getStarredTenders(userId: number): Promise<(Tender & { assignedUser?: { id: number, name: string } })[]> {
    // First get all user-tender relationships where isStarred is true
    const starredEntries = await db
      .select()
      .from(userTenders)
      .where(and(
        eq(userTenders.userId, userId),
        eq(userTenders.isStarred, true)
      ));
    
    if (starredEntries.length === 0) {
      return [];
    }
    
    // Extract tender IDs
    const tenderIds = starredEntries.map(entry => entry.tenderId);
    
    // Get all tenders with these IDs
    const starredTenders = await db
      .select()
      .from(tenders)
      .where(inArray(tenders.id, tenderIds))
      .orderBy(desc(tenders.createdAt));
    
    // Get all assignments to include in the response
    const allAssignments = await db
      .select({
        id: tenderAssignments.id,
        tenderId: tenderAssignments.tenderId,
        userId: tenderAssignments.userId,
        assignedBy: tenderAssignments.assignedBy,
        assignType: tenderAssignments.assignType,
        createdAt: tenderAssignments.createdAt,
        userName: users.name,
        assignedUserId: users.id
      })
      .from(tenderAssignments)
      .innerJoin(users, eq(tenderAssignments.userId, users.id))
      .orderBy(desc(tenderAssignments.createdAt));
    
    // Group assignments by tender ID
    const assignmentsByTender = allAssignments.reduce((acc, assignment) => {
      acc[assignment.tenderId] = acc[assignment.tenderId] || [];
      acc[assignment.tenderId].push(assignment);
      return acc;
    }, {} as Record<number, typeof allAssignments>);
    
    // Merge tenders with their latest assignment
    return starredTenders.map(tender => {
      const tenderAssignments = assignmentsByTender[tender.id] || [];
      
      // Get the latest assignment
      const latestAssignment = tenderAssignments[0];
      
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
  
  async getInterestedTenders(userId: number): Promise<(Tender & { assignedUser?: { id: number, name: string } })[]> {
    // First get all user-tender relationships where isInterested is true
    const interestedEntries = await db
      .select()
      .from(userTenders)
      .where(and(
        eq(userTenders.userId, userId),
        eq(userTenders.isInterested, true)
      ));
    
    if (interestedEntries.length === 0) {
      return [];
    }
    
    // Extract tender IDs
    const tenderIds = interestedEntries.map(entry => entry.tenderId);
    
    // Get all tenders with these IDs
    const interestedTenders = await db
      .select()
      .from(tenders)
      .where(inArray(tenders.id, tenderIds))
      .orderBy(desc(tenders.createdAt));
    
    // Get all assignments to include in the response
    const allAssignments = await db
      .select({
        id: tenderAssignments.id,
        tenderId: tenderAssignments.tenderId,
        userId: tenderAssignments.userId,
        assignedBy: tenderAssignments.assignedBy,
        assignType: tenderAssignments.assignType,
        createdAt: tenderAssignments.createdAt,
        userName: users.name,
        assignedUserId: users.id
      })
      .from(tenderAssignments)
      .innerJoin(users, eq(tenderAssignments.userId, users.id))
      .orderBy(desc(tenderAssignments.createdAt));
    
    // Group assignments by tender ID
    const assignmentsByTender = allAssignments.reduce((acc, assignment) => {
      acc[assignment.tenderId] = acc[assignment.tenderId] || [];
      acc[assignment.tenderId].push(assignment);
      return acc;
    }, {} as Record<number, typeof allAssignments>);
    
    // Merge tenders with their latest assignment
    return interestedTenders.map(tender => {
      const tenderAssignments = assignmentsByTender[tender.id] || [];
      
      // Get the latest assignment
      const latestAssignment = tenderAssignments[0];
      
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
  async getReminders(userId: number): Promise<(Reminder & { tender: Tender })[]> {
    const reminderEntries = await db
      .select()
      .from(reminders)
      .where(eq(reminders.userId, userId));
    
    // This is inefficient, but it's a simple implementation
    // In a real-world scenario, we'd use JOINs or a more efficient approach
    const result: (Reminder & { tender: Tender })[] = [];
    
    for (const reminder of reminderEntries) {
      const [tender] = await db
        .select()
        .from(tenders)
        .where(eq(tenders.id, reminder.tenderId));
      
      if (tender) {
        result.push({
          ...reminder,
          tender
        });
      }
    }
    
    return result;
  }

  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const [reminder] = await db
      .insert(reminders)
      .values(insertReminder)
      .returning();
    return reminder;
  }
  
  // Eligibility Criteria methods
  async getEligibilityCriteria(tenderId: number): Promise<EligibilityCriteria[]> {
    return await db
      .select()
      .from(eligibilityCriteria)
      .where(eq(eligibilityCriteria.tenderId, tenderId));
  }

  async createEligibilityCriteria(insertCriteria: InsertEligibilityCriteria): Promise<EligibilityCriteria> {
    const [criteria] = await db
      .insert(eligibilityCriteria)
      .values(insertCriteria)
      .returning();
    return criteria;
  }
  
  // Tender Documents methods
  async getTenderDocuments(tenderId: number): Promise<TenderDocument[]> {
    return await db
      .select()
      .from(tenderDocuments)
      .where(eq(tenderDocuments.tenderId, tenderId));
  }

  // Get all tender documents with user information
  async getAllTenderDocuments(tenderId: number): Promise<any[]> {
    const documents = [];
    
    // Get the tender first
    const tender = await this.getTender(tenderId);
    if (!tender) return documents;

    // Get basic tender documents (Bid Document, ATC, Tech Specs)
    if (tender.bidDocumentPath) {
      documents.push({
        id: `bid-${tender.id}`,
        name: "Bid Document",
        category: "Bid Document",
        filePath: tender.bidDocumentPath,
        fileUrl: `/api/documents/${tender.id}/bid`,
        fileType: "application/pdf",
        uploadedBy: 1, // System/Admin
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
        uploadedBy: 1, // System/Admin
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
        uploadedBy: 1, // System/Admin
        uploadedByName: "System",
        createdAt: tender.createdAt,
        icon: "FileText",
        color: "green"
      });
    }

    // Get tender responses (categorized by response type)
    const responses = await this.getTenderResponses(tenderId);
    for (const response of responses) {
      if (response.filePath) {
        const user = await this.getUser(response.createdBy);
        
        // Categorize based on response type
        let category = "Prepare Response";
        let icon = "FileCheck";
        let color = "orange";
        
        // Check if this is a checklist response (from tender checklist page)
        if (response.responseType === 'checklist' || 
            response.responseType === 'Financial' || 
            response.responseType === 'Technical' ||
            response.responseType === 'Commercial' ||
            response.checklistId) {
          category = "Generated Tender Checklist Documents";
          icon = "FileCheck2";
          color = "green";
        }
        
        documents.push({
          id: `response-${response.id}`,
          name: response.responseName,
          category: category,
          filePath: response.filePath,
          fileUrl: `/api/tender-responses/${response.id}/download`,
          fileType: "application/pdf",
          uploadedBy: response.createdBy,
          uploadedByName: user?.name || "Unknown User",
          createdAt: response.createdAt,
          icon: icon,
          color: color,
          responseType: response.responseType
        });
      }
    }

    // Get additional tender documents
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

    // Sort documents by creation date (newest first)
    return documents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createTenderDocument(insertDocument: InsertTenderDocument): Promise<TenderDocument> {
    const [document] = await db
      .insert(tenderDocuments)
      .values(insertDocument)
      .returning();
    return document;
  }
  
  // Competitors methods
  async getCompetitors(): Promise<Competitor[]> {
    return await db.select().from(competitors);
  }

  async getCompetitor(id: number): Promise<Competitor | undefined> {
    const [competitor] = await db
      .select()
      .from(competitors)
      .where(eq(competitors.id, id));
    return competitor || undefined;
  }

  async createCompetitor(insertCompetitor: InsertCompetitor): Promise<Competitor> {
    const [competitor] = await db
      .insert(competitors)
      .values(insertCompetitor)
      .returning();
    return competitor;
  }

  async getCompetitors(search?: string): Promise<Competitor[]> {
    if (search) {
      return await db
        .select()
        .from(competitors)
        .where(like(competitors.name, `%${search}%`))
        .orderBy(competitors.name);
    }
    return await db
      .select()
      .from(competitors)
      .orderBy(competitors.name);
  }
  
  // Tender Results methods
  async getTenderResults(tenderId: number): Promise<TenderResult | undefined> {
    const [result] = await db
      .select()
      .from(tenderResults)
      .where(eq(tenderResults.tenderId, tenderId));
    return result || undefined;
  }

  async createTenderResult(insertResult: InsertTenderResult): Promise<TenderResult> {
    const [result] = await db
      .insert(tenderResults)
      .values(insertResult)
      .returning();
    return result;
  }

  // Bid Participants methods
  async getBidParticipants(tenderId: number): Promise<BidParticipant[]> {
    return await db
      .select()
      .from(bidParticipants)
      .where(eq(bidParticipants.tenderId, tenderId))
      .orderBy(bidParticipants.createdAt);
  }

  async createBidParticipant(insertParticipant: InsertBidParticipant): Promise<BidParticipant> {
    const [participant] = await db
      .insert(bidParticipants)
      .values(insertParticipant)
      .returning();
    return participant;
  }

  async updateBidParticipant(id: number, updateData: Partial<InsertBidParticipant>): Promise<BidParticipant | undefined> {
    const [participant] = await db
      .update(bidParticipants)
      .set(updateData)
      .where(eq(bidParticipants.id, id))
      .returning();
    return participant;
  }

  async deleteBidParticipant(id: number): Promise<boolean> {
    const result = await db
      .delete(bidParticipants)
      .where(eq(bidParticipants.id, id));
    return result.rowCount! > 0;
  }
  
  // AI Insights methods
  async getAiInsights(tenderId: number): Promise<AiInsight[]> {
    return await db
      .select()
      .from(aiInsights)
      .where(eq(aiInsights.tenderId, tenderId));
  }

  async createAiInsight(insertInsight: InsertAiInsight): Promise<AiInsight> {
    const [insight] = await db
      .insert(aiInsights)
      .values(insertInsight)
      .returning();
    return insight;
  }
  
  // Activities methods
  async getActivities(userId?: number, limit: number = 10): Promise<Activity[]> {
    if (userId) {
      return await db
        .select()
        .from(activities)
        .where(eq(activities.userId, userId))
        .orderBy(desc(activities.createdAt))
        .limit(limit);
    } else {
      return await db
        .select()
        .from(activities)
        .orderBy(desc(activities.createdAt))
        .limit(limit);
    }
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(insertActivity)
      .returning();
    return activity;
  }

  async getTenderActivities(tenderId: number): Promise<any[]> {
    const activityRecords = await db
      .select()
      .from(activities)
      .where(
        and(
          eq(activities.entityId, tenderId),
          eq(activities.entityType, "tender")
        )
      )
      .orderBy(desc(activities.createdAt));
    
    const result = [];
    
    for (let i = 0; i < activityRecords.length; i++) {
      const activity = activityRecords[i];
      const user = await this.getUser(activity.userId);
      result.push({
        ...activity,
        activityNumber: `ACT-${tenderId}-${String(activityRecords.length - i).padStart(3, '0')}`,
        userName: user?.name || "Unknown User",
        userEmail: user?.email || "",
        actionColor: this.getActivityColor(activity.action)
      });
    }
    
    return result;
  }

  private getActivityColor(action: string): string {
    if (action.includes('delete') || action.includes('remove') || action.includes('cancel')) {
      return 'red';
    } else if (action.includes('update') || action.includes('modify') || action.includes('edit') || action.includes('amend')) {
      return 'orange';
    } else if (action.includes('create') || action.includes('add') || action.includes('upload') || action.includes('assign') || action.includes('generate')) {
      return 'green';
    } else if (action.includes('approve') || action.includes('accept') || action.includes('submit')) {
      return 'blue';
    } else if (action.includes('reject') || action.includes('decline')) {
      return 'red';
    } else {
      return 'gray';
    }
  }

  // Activity logging helper methods
  async logTenderActivity(userId: number, tenderId: number, action: string, description: string, metadata?: any): Promise<void> {
    await this.createActivity({
      userId,
      action,
      entityType: 'tender',
      entityId: tenderId,
      metadata: {
        description,
        ...metadata
      }
    });
  }

  // Role methods
  async getRoles(): Promise<Role[]> {
    return await db.select().from(roles);
  }

  async getRole(id: number): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.id, id));
    return role || undefined;
  }

  async createRole(insertRole: InsertRole): Promise<Role> {
    const [role] = await db
      .insert(roles)
      .values(insertRole)
      .returning();
    return role;
  }

  async getRoleByName(name: string): Promise<Role | undefined> {
    const [role] = await db
      .select()
      .from(roles)
      .where(eq(roles.name, name));
    return role || undefined;
  }

  async updateUserRole(userId: number, roleId: number): Promise<void> {
    await db
      .update(users)
      .set({ role: roleId.toString() })
      .where(eq(users.id, userId));
  }

  async updateRole(id: number, updateRole: Partial<InsertRole>): Promise<Role | undefined> {
    const [updatedRole] = await db
      .update(roles)
      .set(updateRole)
      .where(eq(roles.id, id))
      .returning();
    return updatedRole || undefined;
  }

  // Role Permissions methods
  async getRolePermissions(roleId: number): Promise<RolePermission | undefined> {
    const [permissions] = await db
      .select()
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, roleId));
    return permissions || undefined;
  }

  async saveRolePermissions(insertPermissions: InsertRolePermission): Promise<RolePermission> {
    // Check if permissions already exist for this role
    const existingPermissions = await this.getRolePermissions(insertPermissions.roleId);
    
    if (existingPermissions) {
      // Update existing permissions
      const [updatedPermissions] = await db
        .update(rolePermissions)
        .set({
          permissions: insertPermissions.permissions,
          updatedBy: insertPermissions.updatedBy,
          updatedAt: new Date()
        })
        .where(eq(rolePermissions.id, existingPermissions.id))
        .returning();
      return updatedPermissions;
    } else {
      // Create new permissions
      const [newPermissions] = await db
        .insert(rolePermissions)
        .values(insertPermissions)
        .returning();
      return newPermissions;
    }
  }
  
  // Department methods
  async getDepartments(): Promise<Department[]> {
    return await db.select().from(departments);
  }
  
  async getDepartment(id: number): Promise<Department | undefined> {
    const [department] = await db
      .select()
      .from(departments)
      .where(eq(departments.id, id));
    return department || undefined;
  }
  
  async createDepartment(insertDepartment: InsertDepartment): Promise<Department> {
    const [department] = await db
      .insert(departments)
      .values(insertDepartment)
      .returning();
    return department;
  }
  
  async updateDepartment(id: number, updateDepartment: Partial<InsertDepartment>): Promise<Department | undefined> {
    const [updatedDepartment] = await db
      .update(departments)
      .set(updateDepartment)
      .where(eq(departments.id, id))
      .returning();
    return updatedDepartment || undefined;
  }
  
  // Designation methods
  async getDesignations(): Promise<Designation[]> {
    return await db.select().from(designations);
  }
  
  async getDesignationsByDepartment(departmentId: number): Promise<Designation[]> {
    return await db
      .select()
      .from(designations)
      .where(eq(designations.departmentId, departmentId));
  }
  
  async getDesignation(id: number): Promise<Designation | undefined> {
    const [designation] = await db
      .select()
      .from(designations)
      .where(eq(designations.id, id));
    return designation || undefined;
  }
  
  async createDesignation(insertDesignation: InsertDesignation): Promise<Designation> {
    const [designation] = await db
      .insert(designations)
      .values(insertDesignation)
      .returning();
    return designation;
  }
  
  async updateDesignation(id: number, updateDesignation: Partial<InsertDesignation>): Promise<Designation | undefined> {
    const [updatedDesignation] = await db
      .update(designations)
      .set(updateDesignation)
      .where(eq(designations.id, id))
      .returning();
    return updatedDesignation || undefined;
  }

  // Purchase Order methods
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    return await db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.createdAt));
  }

  async getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined> {
    const [purchaseOrder] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
    return purchaseOrder;
  }

  async createPurchaseOrder(insertPurchaseOrder: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const [purchaseOrder] = await db.insert(purchaseOrders).values(insertPurchaseOrder).returning();
    return purchaseOrder;
  }

  // Dealer methods
  async getDealers(): Promise<Dealer[]> {
    return await db.select().from(dealers).orderBy(dealers.companyName);
  }

  async searchDealers(filters: Partial<{
    companyName: string;
    emailId: string;
    contactNo: string;
    state: string;
    city: string;
  }>): Promise<Dealer[]> {
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

  async getDealer(id: number): Promise<Dealer | undefined> {
    const [dealer] = await db.select().from(dealers).where(eq(dealers.id, id));
    return dealer;
  }

  async createDealer(insertDealer: InsertDealer): Promise<Dealer> {
    const [dealer] = await db.insert(dealers).values(insertDealer).returning();
    return dealer;
  }

  async updateDealer(id: number, updateDealer: Partial<InsertDealer>): Promise<Dealer | undefined> {
    const [updatedDealer] = await db
      .update(dealers)
      .set(updateDealer)
      .where(eq(dealers.id, id))
      .returning();
    return updatedDealer;
  }

  // OEM methods
  async getOEMs(filters: {
    tenderNumber?: string;
    departmentName?: string;
    tenderStatus?: string;
    authorizationDateFrom?: Date;
    authorizationDateTo?: Date;
    followupDateFrom?: Date;
    followupDateTo?: Date;
  } = {}): Promise<(OEM & { dealer?: Dealer })[]> {
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

    let query = db.select({
      oem: oems,
      dealer: dealers
    })
    .from(oems)
    .leftJoin(dealers, eq(oems.dealerId, dealers.id))
    .orderBy(desc(oems.createdAt));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const results = await query;
    
    return results.map(r => ({
      ...r.oem,
      dealer: r.dealer || undefined
    }));
  }
  
  async getOEM(id: number): Promise<(OEM & { dealer?: Dealer }) | undefined> {
    const [result] = await db.select({
      oem: oems,
      dealer: dealers
    })
    .from(oems)
    .leftJoin(dealers, eq(oems.dealerId, dealers.id))
    .where(eq(oems.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.oem,
      dealer: result.dealer || undefined
    };
  }
  
  async createOEM(insertOEM: InsertOEM): Promise<OEM> {
    const [oem] = await db.insert(oems).values(insertOEM).returning();
    return oem;
  }
  
  async updateOEM(id: number, updateOEM: Partial<InsertOEM>): Promise<OEM | undefined> {
    const [updatedOEM] = await db
      .update(oems)
      .set(updateOEM)
      .where(eq(oems.id, id))
      .returning();
    return updatedOEM;
  }

  // Financial Approval methods
  async getFinancialApprovals(filters?: {
    status?: string;
    tenderId?: number;
    requesterId?: number;
    financeUserId?: number;
    approvalType?: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<FinancialApproval[]> {
    const conditions: SQL<unknown>[] = [];
    
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
    
    let query = db.select().from(financialApprovals).orderBy(desc(financialApprovals.createdAt));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query;
  }
  
  async getFinancialApproval(id: number): Promise<FinancialApproval | undefined> {
    const [approval] = await db
      .select()
      .from(financialApprovals)
      .where(eq(financialApprovals.id, id));
    
    return approval;
  }
  
  async getTenderFinancialApprovals(tenderId: number): Promise<FinancialApproval[]> {
    return await db
      .select()
      .from(financialApprovals)
      .where(eq(financialApprovals.tenderId, tenderId))
      .orderBy(desc(financialApprovals.createdAt));
  }
  
  async createFinancialApproval(approval: InsertFinancialApproval): Promise<FinancialApproval> {
    const timestamp = new Date();
    const [newApproval] = await db
      .insert(financialApprovals)
      .values({
        ...approval,
        createdAt: timestamp,
      })
      .returning();
    
    // Add an activity record for this financial approval request
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
      createdAt: timestamp
    });
    
    return newApproval;
  }
  
  async updateFinancialApproval(id: number, approval: Partial<InsertFinancialApproval>): Promise<FinancialApproval | undefined> {
    const timestamp = new Date();
    const [updatedApproval] = await db
      .update(financialApprovals)
      .set({
        ...approval,
        updatedAt: timestamp
      })
      .where(eq(financialApprovals.id, id))
      .returning();
    
    if (updatedApproval && approval.status) {
      // Add an activity record for the status update
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
        createdAt: timestamp
      });
    }
    
    return updatedApproval;
  }
  
  async cancelFinancialApproval(id: number): Promise<FinancialApproval | undefined> {
    const timestamp = new Date();
    const [cancelledApproval] = await db
      .update(financialApprovals)
      .set({
        status: "cancelled",
        updatedAt: timestamp
      })
      .where(eq(financialApprovals.id, id))
      .returning();
    
    if (cancelledApproval) {
      // Add an activity record for the cancellation
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
        createdAt: timestamp
      });
    }
    
    return cancelledApproval;
  }
  
  async getFinancialApprovalsByUser(userId: number): Promise<FinancialApproval[]> {
    return await db
      .select()
      .from(financialApprovals)
      .where(
        or(
          eq(financialApprovals.requesterId, userId),
          eq(financialApprovals.financeUserId, userId)
        )
      )
      .orderBy(desc(financialApprovals.createdAt));
  }
  
  // Company Management Methods (Bid Management)
  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies).orderBy(companies.name);
  }
  
  async getCompaniesByType(type: "Dealer" | "OEM"): Promise<Company[]> {
    return await db
      .select()
      .from(companies)
      .where(eq(companies.type, type))
      .orderBy(companies.name);
  }
  
  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, id));
      
    return company || undefined;
  }
  
  async createCompany(company: InsertCompany): Promise<Company> {
    const [createdCompany] = await db
      .insert(companies)
      .values(company)
      .returning();
      
    return createdCompany;
  }
  
  async updateCompany(id: number, companyData: Partial<InsertCompany>): Promise<Company | undefined> {
    const [existingCompany] = await db.select().from(companies).where(eq(companies.id, id));
    
    if (!existingCompany) {
      return undefined;
    }
    
    const [updatedCompany] = await db
      .update(companies)
      .set(companyData)
      .where(eq(companies.id, id))
      .returning();
      
    return updatedCompany;
  }
  
  async deleteCompany(id: number): Promise<boolean> {
    try {
      // First, delete any linked documents
      await db
        .delete(companyDocuments)
        .where(eq(companyDocuments.company_id, id));
      
      // Then delete the company
      const result = await db
        .delete(companies)
        .where(eq(companies.id, id));
        
      return true;
    } catch (error) {
      console.error("Error deleting company:", error);
      return false;
    }
  }
  
  async getCompanyDocuments(companyId: number): Promise<(CompanyDocument & { document: TenderDocument })[]> {
    // Get the document links
    const links = await db
      .select()
      .from(companyDocuments)
      .where(eq(companyDocuments.company_id, companyId));
      
    // Get the actual documents
    const documentResults: (CompanyDocument & { document: TenderDocument })[] = [];
    
    for (const link of links) {
      const [document] = await db
        .select()
        .from(tenderDocuments)
        .where(eq(tenderDocuments.id, link.document_id));
        
      if (document) {
        documentResults.push({
          ...link,
          document
        });
      }
    }
    
    return documentResults;
  }
  
  async linkCompanyDocument(link: InsertCompanyDocument): Promise<CompanyDocument> {
    const [createdLink] = await db
      .insert(companyDocuments)
      .values(link)
      .returning();
      
    return createdLink;
  }
  
  async unlinkCompanyDocument(companyId: number, documentId: number): Promise<boolean> {
    try {
      await db
        .delete(companyDocuments)
        .where(
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
  async getBidParticipations(filters?: { status?: string, tenderId?: number }): Promise<BidParticipation[]> {
    let query = db.select().from(bidParticipations);
    
    if (filters) {
      const whereConditions = [];
      
      if (filters.status) {
        whereConditions.push(eq(bidParticipations.status, filters.status));
      }
      
      if (filters.tenderId) {
        whereConditions.push(eq(bidParticipations.tender_id, filters.tenderId));
      }
      
      if (whereConditions.length > 0) {
        query = query.where(and(...whereConditions));
      }
    }
    
    const participations = await query.orderBy(desc(bidParticipations.createdAt));
    return participations;
  }
  
  async getBidParticipation(id: number): Promise<BidParticipation | undefined> {
    const [participation] = await db
      .select()
      .from(bidParticipations)
      .where(eq(bidParticipations.id, id));
    
    return participation;
  }
  
  async createBidParticipation(data: InsertBidParticipation): Promise<BidParticipation> {
    const [participation] = await db
      .insert(bidParticipations)
      .values({
        ...data,
        createdAt: new Date()
      })
      .returning();
    
    return participation;
  }
  
  async updateBidParticipation(id: number, data: Partial<InsertBidParticipation>): Promise<BidParticipation | undefined> {
    const [updatedParticipation] = await db
      .update(bidParticipations)
      .set(data)
      .where(eq(bidParticipations.id, id))
      .returning();
    
    return updatedParticipation;
  }
  
  async deleteBidParticipation(id: number): Promise<boolean> {
    try {
      await db
        .delete(bidParticipations)
        .where(eq(bidParticipations.id, id));
      
      return true;
    } catch (error) {
      console.error("Error deleting bid participation:", error);
      return false;
    }
  }
  
  async getBidParticipationCompanies(bidParticipationId: number): Promise<(BidParticipationCompany & { company: Company })[]> {
    const participationCompanies = await db
      .select({
        id: bidParticipationCompanies.id,
        bid_participation_id: bidParticipationCompanies.bid_participation_id,
        company_id: bidParticipationCompanies.company_id,
        company: companies
      })
      .from(bidParticipationCompanies)
      .innerJoin(companies, eq(bidParticipationCompanies.company_id, companies.id))
      .where(eq(bidParticipationCompanies.bid_participation_id, bidParticipationId));
    
    return participationCompanies;
  }
  
  async linkCompanyToBidParticipation(link: InsertBidParticipationCompany): Promise<BidParticipationCompany> {
    // Check if this link already exists to avoid duplicates
    const [existingLink] = await db
      .select()
      .from(bidParticipationCompanies)
      .where(
        and(
          eq(bidParticipationCompanies.bid_participation_id, link.bid_participation_id),
          eq(bidParticipationCompanies.company_id, link.company_id)
        )
      );
    
    if (existingLink) {
      return existingLink;
    }
    
    // Create new link
    const [createdLink] = await db
      .insert(bidParticipationCompanies)
      .values(link)
      .returning();
    
    return createdLink;
  }
  
  async unlinkCompanyFromBidParticipation(bidParticipationId: number, companyId: number): Promise<boolean> {
    try {
      await db
        .delete(bidParticipationCompanies)
        .where(
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
  async getKickOffCallsByTender(tenderId: number): Promise<KickOffCall[]> {
    return await db
      .select()
      .from(kickOffCalls)
      .where(eq(kickOffCalls.tenderId, tenderId))
      .orderBy(desc(kickOffCalls.createdAt));
  }

  async createKickOffCall(data: InsertKickOffCall): Promise<KickOffCall> {
    const [kickOffCall] = await db
      .insert(kickOffCalls)
      .values(data)
      .returning();
    
    return kickOffCall;
  }

  async getKickOffCall(id: number): Promise<KickOffCall | undefined> {
    const [kickOffCall] = await db
      .select()
      .from(kickOffCalls)
      .where(eq(kickOffCalls.id, id));
    
    return kickOffCall;
  }

  async updateKickOffCall(id: number, data: Partial<InsertKickOffCall>): Promise<KickOffCall | undefined> {
    const [updatedKickOffCall] = await db
      .update(kickOffCalls)
      .set(data)
      .where(eq(kickOffCalls.id, id))
      .returning();
    
    return updatedKickOffCall;
  }

  async deleteKickOffCall(id: number): Promise<boolean> {
    try {
      await db
        .delete(kickOffCalls)
        .where(eq(kickOffCalls.id, id));
      
      return true;
    } catch (error) {
      console.error("Error deleting kick off call:", error);
      return false;
    }
  }

  // AI Insights methods
  async getAiInsightsByTender(tenderId: number): Promise<AiInsight[]> {
    return await db
      .select()
      .from(aiInsights)
      .where(eq(aiInsights.tenderId, tenderId))
      .orderBy(desc(aiInsights.createdAt));
  }

  async createAiInsight(data: InsertAiInsight): Promise<AiInsight> {
    const [insight] = await db
      .insert(aiInsights)
      .values(data)
      .returning();
    
    return insight;
  }

  async deleteAiInsight(id: number): Promise<boolean> {
    try {
      await db
        .delete(aiInsights)
        .where(eq(aiInsights.id, id));
      
      return true;
    } catch (error) {
      console.error("Error deleting AI insight:", error);
      return false;
    }
  }

  // Folder methods with subfolder support
  async getFolders(): Promise<Folder[]> {
    return await db
      .select()
      .from(folders)
      .orderBy(desc(folders.createdAt));
  }

  async getFoldersHierarchy(): Promise<(Folder & { subfolders?: Folder[] })[]> {
    // Get all folders
    const allFolders = await db
      .select()
      .from(folders)
      .orderBy(folders.name);

    // Create a map for quick lookup
    const folderMap = new Map<number, Folder & { subfolders?: Folder[] }>();
    
    // Initialize all folders
    allFolders.forEach(folder => {
      folderMap.set(folder.id, { ...folder, subfolders: [] });
    });

    // Build hierarchy
    const rootFolders: (Folder & { subfolders?: Folder[] })[] = [];
    
    allFolders.forEach(folder => {
      const folderWithSubfolders = folderMap.get(folder.id)!;
      
      if (folder.parentId) {
        // This is a subfolder, add it to its parent
        const parent = folderMap.get(folder.parentId);
        if (parent) {
          parent.subfolders!.push(folderWithSubfolders);
        }
      } else {
        // This is a root folder
        rootFolders.push(folderWithSubfolders);
      }
    });

    return rootFolders;
  }

  async getRootFolders(): Promise<Folder[]> {
    return await db
      .select()
      .from(folders)
      .where(sql`${folders.parentId} IS NULL`)
      .orderBy(folders.name);
  }

  async getSubfolders(parentId: number): Promise<Folder[]> {
    return await db
      .select()
      .from(folders)
      .where(eq(folders.parentId, parentId))
      .orderBy(folders.name);
  }

  async getFolder(id: number): Promise<Folder | undefined> {
    const [folder] = await db
      .select()
      .from(folders)
      .where(eq(folders.id, id));
    
    return folder;
  }

  async createFolder(data: InsertFolder): Promise<Folder> {
    const [folder] = await db
      .insert(folders)
      .values(data)
      .returning();
    
    return folder;
  }

  async updateFolder(id: number, folder: Partial<InsertFolder>): Promise<Folder | undefined> {
    try {
      const [updatedFolder] = await db
        .update(folders)
        .set(folder)
        .where(eq(folders.id, id))
        .returning();
      return updatedFolder;
    } catch (error) {
      console.error("Update folder error:", error);
      return undefined;
    }
  }

  async deleteFolder(id: number): Promise<boolean> {
    try {
      await db
        .delete(folders)
        .where(eq(folders.id, id));
      
      return true;
    } catch (error) {
      console.error("Error deleting folder:", error);
      return false;
    }
  }

  async getFolderFiles(folderId: number): Promise<File[]> {
    try {
      const result = await db.select().from(files).where(eq(files.folderId, folderId));
      return result;
    } catch (error) {
      console.error("Get folder files error:", error);
      return [];
    }
  }

  // File methods
  async getFiles(): Promise<any[]> {
    try {
      const result = await db
        .select({
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
        })
        .from(files)
        .leftJoin(folders, eq(files.folderId, folders.id));
      
      return result;
    } catch (error) {
      console.error("Get files error:", error);
      return [];
    }
  }

  async getFilesByFolder(folderId: number): Promise<any[]> {
    try {
      return await db.select().from(files).where(eq(files.folderId, folderId));
    } catch (error) {
      console.error("Get files by folder error:", error);
      return [];
    }
  }

  async getFile(id: number): Promise<any | undefined> {
    try {
      const [file] = await db.select().from(files).where(eq(files.id, id));
      return file;
    } catch (error) {
      console.error("Get file error:", error);
      return undefined;
    }
  }

  async createFile(file: any): Promise<any> {
    try {
      // Normalize file path before storing
      const normalizedFile = {
        ...file,
        filePath: file.filePath ? normalizeFilePath(file.filePath) : file.filePath
      };
      
      const [newFile] = await db
        .insert(files)
        .values(normalizedFile)
        .returning();
      return newFile;
    } catch (error) {
      console.error("Create file error:", error);
      throw error;
    }
  }

  async updateFile(id: number, file: any): Promise<any | undefined> {
    try {
      const [updatedFile] = await db
        .update(files)
        .set(file)
        .where(eq(files.id, id))
        .returning();
      return updatedFile;
    } catch (error) {
      console.error("Update file error:", error);
      return undefined;
    }
  }

  async deleteFile(id: number): Promise<boolean> {
    try {
      await db.delete(files).where(eq(files.id, id));
      return true;
    } catch (error) {
      console.error("Delete file error:", error);
      return false;
    }
  }

  // Document Briefcase methods
  async getDocumentBriefcases(): Promise<DocumentBriefcase[]> {
    try {
      const docs = await db.select().from(documentBriefcase);
      return docs; // Return as-is since Drizzle handles the field mapping
    } catch (error) {
      console.error("Get document briefcases error:", error);
      return [];
    }
  }

  async getDocumentBriefcase(id: number): Promise<DocumentBriefcase | undefined> {
    try {
      const [doc] = await db.select().from(documentBriefcase).where(eq(documentBriefcase.id, id));
      return doc; // Return as-is since Drizzle handles the field mapping
    } catch (error) {
      console.error("Get document briefcase error:", error);
      return undefined;
    }
  }

  async createDocumentBriefcase(doc: InsertDocumentBriefcase): Promise<DocumentBriefcase> {
    try {
      // Normalize file path before storing
      const normalizedDoc = {
        ...doc,
        filePath: doc.filePath ? normalizeFilePath(doc.filePath) : doc.filePath
      };
      
      const [newDoc] = await db
        .insert(documentBriefcase)
        .values(normalizedDoc)
        .returning();
      return newDoc;
    } catch (error) {
      console.error("Create document briefcase error:", error);
      throw error;
    }
  }

  async updateDocumentBriefcase(id: number, doc: Partial<InsertDocumentBriefcase>): Promise<DocumentBriefcase | undefined> {
    try {
      const [updatedDoc] = await db
        .update(documentBriefcase)
        .set(doc)
        .where(eq(documentBriefcase.id, id))
        .returning();
      return updatedDoc;
    } catch (error) {
      console.error("Update document briefcase error:", error);
      return undefined;
    }
  }

  async deleteDocumentBriefcase(id: number): Promise<boolean> {
    try {
      await db.delete(documentBriefcase).where(eq(documentBriefcase.id, id));
      return true;
    } catch (error) {
      console.error("Delete document briefcase error:", error);
      return false;
    }
  }

  // Checklist Methods
  async getChecklists(): Promise<Checklist[]> {
    try {
      const checklistsList = await db.select().from(checklists).orderBy(checklists.createdAt);
      return checklistsList;
    } catch (error) {
      console.error("Get checklists error:", error);
      return [];
    }
  }

  async getChecklist(id: number): Promise<Checklist | undefined> {
    try {
      const [checklist] = await db
        .select()
        .from(checklists)
        .where(eq(checklists.id, id));
      return checklist;
    } catch (error) {
      console.error("Get checklist by id error:", error);
      return undefined;
    }
  }

  async createChecklist(data: InsertChecklist): Promise<Checklist> {
    try {
      const [checklist] = await db
        .insert(checklists)
        .values(data)
        .returning();
      return checklist;
    } catch (error) {
      console.error("Create checklist error:", error);
      throw error;
    }
  }

  async updateChecklist(id: number, data: Partial<InsertChecklist>): Promise<Checklist | undefined> {
    try {
      const [checklist] = await db
        .update(checklists)
        .set(data)
        .where(eq(checklists.id, id))
        .returning();
      return checklist;
    } catch (error) {
      console.error("Update checklist error:", error);
      return undefined;
    }
  }

  async deleteChecklist(id: number): Promise<boolean> {
    try {
      // First delete all documents associated with this checklist
      await db
        .delete(checklistDocuments)
        .where(eq(checklistDocuments.checklistId, id));
      
      // Then delete the checklist
      await db
        .delete(checklists)
        .where(eq(checklists.id, id));
      return true;
    } catch (error) {
      console.error("Delete checklist error:", error);
      return false;
    }
  }

  // Checklist Documents Methods
  async getChecklistDocuments(checklistId: number): Promise<ChecklistDocument[]> {
    try {
      const documents = await db
        .select()
        .from(checklistDocuments)
        .where(eq(checklistDocuments.checklistId, checklistId))
        .orderBy(checklistDocuments.createdAt);
      return documents;
    } catch (error) {
      console.error("Get checklist documents error:", error);
      return [];
    }
  }

  async getChecklistDocumentById(id: number): Promise<ChecklistDocument | undefined> {
    try {
      const [document] = await db
        .select()
        .from(checklistDocuments)
        .where(eq(checklistDocuments.id, id));
      return document || undefined;
    } catch (error) {
      console.error("Get checklist document by ID error:", error);
      return undefined;
    }
  }

  async getChecklistDocumentById(documentId: number): Promise<ChecklistDocument | undefined> {
    try {
      const [document] = await db
        .select()
        .from(checklistDocuments)
        .where(eq(checklistDocuments.id, documentId));
      return document || undefined;
    } catch (error) {
      console.error("Get checklist document by ID error:", error);
      return undefined;
    }
  }

  async createChecklistDocument(data: InsertChecklistDocument): Promise<ChecklistDocument> {
    try {
      // Normalize file path before storing
      const normalizedData = {
        ...data,
        filePath: data.filePath ? normalizeFilePath(data.filePath) : data.filePath
      };
      
      const [document] = await db
        .insert(checklistDocuments)
        .values(normalizedData)
        .returning();
      return document;
    } catch (error) {
      console.error("Create checklist document error:", error);
      throw error;
    }
  }

  async deleteChecklistDocument(id: number): Promise<boolean> {
    try {
      await db
        .delete(checklistDocuments)
        .where(eq(checklistDocuments.id, id));
      return true;
    } catch (error) {
      console.error("Delete checklist document error:", error);
      return false;
    }
  }

  // Notifications methods
  async getNotifications(userId: number): Promise<Notification[]> {
    try {
      const result = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt));
      return result;
    } catch (error) {
      console.error("Get notifications error:", error);
      return [];
    }
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    try {
      const [result] = await db
        .insert(notifications)
        .values(notification)
        .returning();
      return result;
    } catch (error) {
      console.error("Create notification error:", error);
      throw error;
    }
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    try {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, id));
      return true;
    } catch (error) {
      console.error("Mark notification as read error:", error);
      return false;
    }
  }

  // Tender Response methods
  async getTenderResponses(tenderId: number): Promise<TenderResponse[]> {
    try {
      const responses = await db
        .select({
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
        })
        .from(tenderResponses)
        .leftJoin(users, eq(tenderResponses.createdBy, users.id))
        .where(eq(tenderResponses.tenderId, tenderId))
        .orderBy(desc(tenderResponses.createdAt));
      return responses as TenderResponse[];
    } catch (error) {
      console.error("Get tender responses error:", error);
      return [];
    }
  }

  async getTenderResponse(id: number): Promise<TenderResponse | undefined> {
    try {
      const [response] = await db
        .select()
        .from(tenderResponses)
        .where(eq(tenderResponses.id, id));
      return response || undefined;
    } catch (error) {
      console.error("Get tender response error:", error);
      return undefined;
    }
  }

  async createTenderResponse(data: InsertTenderResponse): Promise<TenderResponse> {
    try {
      // Normalize file paths before storing
      const normalizedData = {
        ...data,
        filePath: data.filePath ? normalizeFilePath(data.filePath) : data.filePath,
        signStampPath: data.signStampPath ? normalizeFilePath(data.signStampPath) : data.signStampPath
      };
      
      const [response] = await db
        .insert(tenderResponses)
        .values(normalizedData)
        .returning();
      return response;
    } catch (error) {
      console.error("Create tender response error:", error);
      throw error;
    }
  }

  async updateTenderResponse(id: number, data: Partial<InsertTenderResponse>): Promise<TenderResponse | undefined> {
    try {
      const [response] = await db
        .update(tenderResponses)
        .set(data)
        .where(eq(tenderResponses.id, id))
        .returning();
      return response || undefined;
    } catch (error) {
      console.error("Update tender response error:", error);
      return undefined;
    }
  }

  async deleteTenderResponse(id: number): Promise<boolean> {
    try {
      await db
        .delete(tenderResponses)
        .where(eq(tenderResponses.id, id));
      return true;
    } catch (error) {
      console.error("Delete tender response error:", error);
      return false;
    }
  }

  // Approval Request methods
  async getApprovalRequests(tenderId?: number): Promise<ApprovalRequest[]> {
    try {
      const query = db
        .select({
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
          inLoopName: sql<string>`loop_user.username`
        })
        .from(approvalRequests)
        .leftJoin(users, eq(approvalRequests.approvalFrom, users.id))
        .leftJoin(sql`users as loop_user`, sql`approval_requests.in_loop = loop_user.id`);

      if (tenderId) {
        query.where(eq(approvalRequests.tenderId, tenderId));
      }

      return await query.orderBy(desc(approvalRequests.createdAt));
    } catch (error) {
      console.error("Get approval requests error:", error);
      throw error;
    }
  }

  async getApprovalRequest(id: number): Promise<ApprovalRequest | undefined> {
    try {
      const [request] = await db
        .select()
        .from(approvalRequests)
        .where(eq(approvalRequests.id, id));
      return request || undefined;
    } catch (error) {
      console.error("Get approval request error:", error);
      return undefined;
    }
  }

  async createApprovalRequest(data: InsertApprovalRequest): Promise<ApprovalRequest> {
    try {
      const [request] = await db
        .insert(approvalRequests)
        .values(data)
        .returning();
      return request;
    } catch (error) {
      console.error("Create approval request error:", error);
      throw error;
    }
  }

  async updateApprovalRequest(id: number, data: Partial<InsertApprovalRequest>): Promise<ApprovalRequest | undefined> {
    try {
      const [request] = await db
        .update(approvalRequests)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(approvalRequests.id, id))
        .returning();
      return request || undefined;
    } catch (error) {
      console.error("Update approval request error:", error);
      return undefined;
    }
  }

  async deleteApprovalRequest(id: number): Promise<boolean> {
    try {
      await db.delete(approvalRequests).where(eq(approvalRequests.id, id));
      return true;
    } catch (error) {
      console.error("Delete approval request error:", error);
      return false;
    }
  }

  // Dashboard Layout methods
  async getDashboardLayout(userId: number): Promise<DashboardLayout | undefined> {
    try {
      const [layout] = await db
        .select()
        .from(dashboardLayouts)
        .where(eq(dashboardLayouts.userId, userId));
      return layout || undefined;
    } catch (error) {
      console.error("Get dashboard layout error:", error);
      return undefined;
    }
  }

  async createDashboardLayout(data: InsertDashboardLayout): Promise<DashboardLayout> {
    try {
      const [layout] = await db
        .insert(dashboardLayouts)
        .values(data)
        .returning();
      return layout;
    } catch (error) {
      console.error("Create dashboard layout error:", error);
      throw error;
    }
  }

  async updateDashboardLayout(userId: number, layoutConfig: any): Promise<DashboardLayout | undefined> {
    try {
      const [layout] = await db
        .update(dashboardLayouts)
        .set({ 
          layoutConfig,
          updatedAt: new Date()
        })
        .where(eq(dashboardLayouts.userId, userId))
        .returning();
      return layout || undefined;
    } catch (error) {
      console.error("Update dashboard layout error:", error);
      return undefined;
    }
  }

  // Reminder methods
  async createReminder(reminderData: InsertReminder): Promise<Reminder> {
    const [reminder] = await db.insert(reminders).values(reminderData).returning();
    return reminder;
  }

  // Calendar Event methods
  async getRemindersByDateRange(startDate: Date, endDate: Date): Promise<Reminder[]> {
    try {
      return await db
        .select()
        .from(reminders)
        .where(
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

  async getTendersByDeadlineRange(startDate: Date, endDate: Date): Promise<Tender[]> {
    try {
      return await db
        .select()
        .from(tenders)
        .where(
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

  async getTenderReminders(tenderId: number): Promise<Reminder[]> {
    return await db
      .select()
      .from(reminders)
      .where(and(
        eq(reminders.tenderId, tenderId),
        eq(reminders.isActive, true)
      ))
      .orderBy(desc(reminders.createdAt));
  }

  async getUserReminders(userId: number): Promise<Reminder[]> {
    return await db
      .select()
      .from(reminders)
      .where(and(
        eq(reminders.userId, userId),
        eq(reminders.isActive, true)
      ))
      .orderBy(desc(reminders.reminderDate));
  }

  async updateReminder(id: number, updates: Partial<InsertReminder>): Promise<Reminder | undefined> {
    const [reminder] = await db
      .update(reminders)
      .set(updates)
      .where(eq(reminders.id, id))
      .returning();
    return reminder || undefined;
  }

  async deleteReminder(id: number): Promise<boolean> {
    try {
      await db
        .update(reminders)
        .set({ isActive: false })
        .where(eq(reminders.id, id));
      return true;
    } catch (error) {
      console.error("Delete reminder error:", error);
      return false;
    }
  }

  async getTodaysReminderActivities(): Promise<any[]> {
    try {
      // Get today's date range
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      // Fetch reminders created today with tender and user information
      const todaysReminders = await db
        .select({
          id: reminders.id,
          tenderId: reminders.tenderId,
          userId: reminders.userId,
          reminderDate: reminders.reminderDate,
          comments: reminders.comments,
          createdAt: reminders.createdAt,
          tenderReferenceNo: tenders.referenceNo,
          tenderTitle: tenders.title,
          userName: users.name,
        })
        .from(reminders)
        .innerJoin(tenders, eq(reminders.tenderId, tenders.id))
        .innerJoin(users, eq(reminders.userId, users.id))
        .where(and(
          eq(reminders.isActive, true),
          gte(reminders.createdAt, startOfDay),
          lte(reminders.createdAt, endOfDay)
        ))
        .orderBy(desc(reminders.createdAt));

      return todaysReminders;
    } catch (error) {
      console.error("Get today's reminder activities error:", error);
      return [];
    }
  }

  async getTodaysReminderActivitiesByUser(userId: number): Promise<any[]> {
    try {
      // Get today's date range
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      // Fetch reminders created today for tenders assigned to the user
      const todaysReminders = await db
        .select({
          id: reminders.id,
          tenderId: reminders.tenderId,
          userId: reminders.userId,
          reminderDate: reminders.reminderDate,
          comments: reminders.comments,
          createdAt: reminders.createdAt,
          tenderReferenceNo: tenders.referenceNo,
          tenderTitle: tenders.title,
          userName: users.name,
        })
        .from(reminders)
        .innerJoin(tenders, eq(reminders.tenderId, tenders.id))
        .innerJoin(users, eq(reminders.userId, users.id))
        .innerJoin(tenderAssignments, eq(tenderAssignments.tenderId, tenders.id))
        .where(and(
          eq(reminders.isActive, true),
          eq(tenderAssignments.userId, userId),
          gte(reminders.createdAt, startOfDay),
          lt(reminders.createdAt, endOfDay)
        ))
        .orderBy(desc(reminders.createdAt));

      return todaysReminders;
    } catch (error) {
      console.error("Get today's reminder activities by user error:", error);
      return [];
    }
  }

  // Financial Request methods
  async getFinancialRequests(tenderId?: number): Promise<FinancialRequest[]> {
    try {
      const query = db.select().from(financialRequests);
      
      if (tenderId) {
        return await query.where(eq(financialRequests.tenderId, tenderId));
      }
      
      return await query.orderBy(desc(financialRequests.createdAt));
    } catch (error) {
      console.error("Get financial requests error:", error);
      return [];
    }
  }

  async getFinancialRequest(id: number): Promise<FinancialRequest | undefined> {
    try {
      const [request] = await db
        .select()
        .from(financialRequests)
        .where(eq(financialRequests.id, id));
      return request || undefined;
    } catch (error) {
      console.error("Get financial request error:", error);
      return undefined;
    }
  }

  async createFinancialRequest(insertRequest: InsertFinancialRequest): Promise<FinancialRequest> {
    try {
      const [request] = await db
        .insert(financialRequests)
        .values(insertRequest)
        .returning();
      return request;
    } catch (error) {
      console.error("Create financial request error:", error);
      throw error;
    }
  }

  async updateFinancialRequest(id: number, updateRequest: Partial<InsertFinancialRequest>): Promise<FinancialRequest | undefined> {
    try {
      const [updatedRequest] = await db
        .update(financialRequests)
        .set({ ...updateRequest, updatedAt: new Date() })
        .where(eq(financialRequests.id, id))
        .returning();
      return updatedRequest || undefined;
    } catch (error) {
      console.error("Update financial request error:", error);
      return undefined;
    }
  }

  async deleteFinancialRequest(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(financialRequests)
        .where(eq(financialRequests.id, id));
      return true;
    } catch (error) {
      console.error("Delete financial request error:", error);
      return false;
    }
  }

  async createFinancialApproval(approvalData: any): Promise<any> {
    try {
      const [approval] = await db
        .insert(financialApprovals)
        .values({
          tenderId: approvalData.tenderId,
          reminderDate: approvalData.deadline,
          requesterId: approvalData.createdBy,
          approvalType: approvalData.requirement,
          financeUserId: approvalData.requestTo,
          requestAmount: approvalData.amount.toString(),
          notes: approvalData.paymentDescription,
          status: approvalData.status || 'Pending',
          paymentMode: approvalData.payment,
          filePath: approvalData.filePath ? normalizeFilePath(approvalData.filePath) : approvalData.filePath
        })
        .returning();
      return approval;
    } catch (error) {
      console.error("Create financial approval error:", error);
      throw error;
    }
  }

  async getTodaysFinancialActivities(userId: number): Promise<any[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const activities = await db
        .select({
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
        })
        .from(financialApprovals)
        .innerJoin(tenders, eq(financialApprovals.tenderId, tenders.id))
        .innerJoin(users, eq(financialApprovals.requesterId, users.id))
        .where(
          and(
            eq(financialApprovals.financeUserId, userId),
            gte(financialApprovals.createdAt, today),
            lt(financialApprovals.createdAt, tomorrow)
          )
        )
        .orderBy(desc(financialApprovals.createdAt));

      return activities.map(activity => ({
        id: activity.id,
        type: 'financial_request',
        tenderId: activity.tenderId,
        tenderReferenceNo: activity.tenderReferenceNo,
        approvalType: activity.approvalType,
        requestAmount: activity.requestAmount,
        status: activity.status,
        reminderDate: activity.reminderDate,
        createdAt: activity.createdAt,
        requestedBy: activity.requesterName,
        description: `${activity.approvalType} request for ₹${Number(activity.requestAmount).toLocaleString()}`
      }));
    } catch (error) {
      console.error("Get today's financial activities error:", error);
      return [];
    }
  }

  // Date-specific activity methods for assigned users
  async getDateReminderActivities(targetDate: Date, userId: number): Promise<any[]> {
    try {
      // Get target date range
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);

      // Fetch reminders scheduled for target date for tenders assigned to the user
      // with creator information (who set the reminder)
      const dateReminders = await db
        .select({
          id: reminders.id,
          tenderId: reminders.tenderId,
          userId: reminders.userId,
          reminderDate: reminders.reminderDate,
          comments: reminders.comments,
          createdAt: reminders.createdAt,
          tenderReferenceNo: tenders.referenceNo,
          tenderTitle: tenders.title,
          creatorName: users.name, // User who created the reminder
        })
        .from(reminders)
        .innerJoin(tenders, eq(reminders.tenderId, tenders.id))
        .innerJoin(users, eq(reminders.userId, users.id)) // Creator of reminder
        .innerJoin(tenderAssignments, eq(tenderAssignments.tenderId, tenders.id))
        .where(and(
          eq(reminders.isActive, true),
          eq(tenderAssignments.userId, userId), // User assigned to tender
          gte(reminders.reminderDate, startOfDay),
          lt(reminders.reminderDate, endOfDay)
        ))
        .orderBy(desc(reminders.reminderDate));

      return dateReminders.map(reminder => ({
        id: reminder.id,
        type: 'tender_reminder',
        tenderId: reminder.tenderId,
        userId: reminder.userId,
        userName: reminder.creatorName, // Show creator name in comments
        tenderReferenceNo: reminder.tenderReferenceNo,
        tenderTitle: reminder.tenderTitle,
        reminderDate: reminder.reminderDate,
        comments: reminder.comments,
        createdAt: reminder.createdAt,
        actionColor: 'bg-purple-100',
        description: `Tender Reminder for ${reminder.tenderReferenceNo?.trim() || 'N/A'}`
      }));
    } catch (error) {
      console.error("Get date reminder activities error:", error);
      return [];
    }
  }

  async getDateReminderActivitiesByUser(userId: number, targetDate: Date): Promise<any[]> {
    try {
      // Get target date range
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);

      // Create alias for the user who created the reminder
      const reminderCreator = alias(users, 'reminderCreator');

      // Fetch reminders scheduled for target date where:
      // 1. User is assigned to the tender OR  
      // 2. User created the reminder
      const dateReminders = await db
        .select({
          id: reminders.id,
          tenderId: reminders.tenderId,
          userId: reminders.userId,
          createdBy: reminders.createdBy,
          reminderDate: reminders.reminderDate,
          comments: reminders.comments,
          createdAt: reminders.createdAt,
          tenderReferenceNo: tenders.referenceNo,
          tenderTitle: tenders.title,
          userName: users.name, // User for whom reminder is set
          reminderCreatorName: reminderCreator.name, // User who created the reminder
        })
        .from(reminders)
        .innerJoin(tenders, eq(reminders.tenderId, tenders.id))
        .innerJoin(users, eq(reminders.userId, users.id)) // User receiving the reminder
        .leftJoin(reminderCreator, eq(reminders.createdBy, reminderCreator.id)) // User who created the reminder
        .where(and(
          eq(reminders.isActive, true),
          or(
            // Show reminders for tenders assigned to this user
            sql`EXISTS (SELECT 1 FROM ${tenderAssignments} WHERE ${tenderAssignments.tenderId} = ${tenders.id} AND ${tenderAssignments.userId} = ${userId})`,
            // Show reminders created by this user
            eq(reminders.createdBy, userId)
          ),
          gte(reminders.reminderDate, startOfDay),
          lt(reminders.reminderDate, endOfDay)
        ))
        .orderBy(desc(reminders.reminderDate));

      // Group reminders by tender to avoid duplicates for same tender
      const reminderMap = new Map();
      
      for (const reminder of dateReminders) {
        const key = reminder.tenderId.toString();
        
        // If we haven't seen this tender yet, add it
        if (!reminderMap.has(key)) {
          reminderMap.set(key, reminder);
        }
      }
      const reminderActivities = Array.from(reminderMap.values()).map(reminder => ({
        id: reminder.id,
        type: 'tender_reminder',
        tenderId: reminder.tenderId,
        userId: reminder.userId,
        userName: reminder.reminderCreatorName || reminder.userName, // Show creator name
        reminderCreatorName: reminder.reminderCreatorName, // User who set reminder
        tenderReferenceNo: reminder.tenderReferenceNo,
        tenderTitle: reminder.tenderTitle,
        reminderDate: reminder.reminderDate,
        comments: reminder.comments,
        createdAt: reminder.createdAt,
        actionColor: 'bg-purple-100',
        description: `Tender Reminder for ${reminder.tenderReferenceNo?.trim() || 'N/A'}`
      }));

      // Fetch assignment activities for the target date
      const assignmentActivities = await this.getDateAssignmentActivities(userId, targetDate);
      
      // Combine and sort all activities by creation date
      return [...reminderActivities, ...assignmentActivities]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
    } catch (error) {
      console.error("Get date reminder activities by user error:", error);
      return [];
    }
  }

  async getDateAssignmentActivities(userId: number, targetDate: Date): Promise<any[]> {
    try {
      // Ensure targetDate is a Date object
      const date = new Date(targetDate);
      if (isNaN(date.getTime())) {
        console.error("Invalid date provided to getDateAssignmentActivities:", targetDate);
        return [];
      }

      // Get target date range
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

      // Fetch assignment activities for the target date
      const assignmentActivities = await db
        .select({
          id: activities.id,
          userId: activities.userId,
          action: activities.action,
          createdAt: activities.createdAt,
          metadata: activities.metadata,
        })
        .from(activities)
        .where(and(
          eq(activities.userId, userId),
          eq(activities.action, 'tender_assignment'),
          eq(activities.entityType, 'tender'),
          gte(activities.createdAt, startOfDay),
          lt(activities.createdAt, endOfDay)
        ))
        .orderBy(desc(activities.createdAt));

      // Transform assignment activities
      return assignmentActivities.map(activity => {
        const metadata = activity.metadata as any;
        return {
          id: activity.id,
          type: 'tender_assignment',
          tenderId: parseInt(metadata?.tenderNumber || '0'),
          userId: activity.userId,
          action: activity.action,
          tenderReferenceNo: metadata?.tenderReferenceNo?.trim() || 'N/A',
          assignedTo: metadata?.assignedTo,
          assignedBy: metadata?.assignedBy,
          assignedAt: metadata?.assignedAt,
          submissionDate: metadata?.submissionDate,
          comments: metadata?.comments,
          createdAt: activity.createdAt,
          actionColor: 'bg-green-100',
          description: `Tender Assignment Received - ${metadata?.tenderReferenceNo?.trim() || 'N/A'}`
        };
      });
        
    } catch (error) {
      console.error("Get date assignment activities error:", error);
      return [];
    }
  }

  async getDateFinancialActivities(userId: number, targetDate: Date): Promise<any[]> {
    try {
      // Get target date range
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);

      let allActivities: any[] = [];

      // Get financial approval activities
      try {
        const activities = await db
          .select({
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
          })
          .from(financialApprovals)
          .innerJoin(tenders, eq(financialApprovals.tenderId, tenders.id))
          .innerJoin(users, eq(financialApprovals.requesterId, users.id))
          .where(
            and(
              eq(financialApprovals.financeUserId, userId),
              gte(financialApprovals.createdAt, startOfDay),
              lt(financialApprovals.createdAt, endOfDay)
            )
          )
          .orderBy(desc(financialApprovals.createdAt));

        const financialActivities = activities.map(activity => ({
          id: activity.id,
          type: 'financial_request',
          tenderId: activity.tenderId,
          tenderReferenceNo: activity.tenderReferenceNo,
          approvalType: activity.approvalType,
          requestAmount: activity.requestAmount,
          status: activity.status,
          reminderDate: activity.reminderDate,
          createdAt: activity.createdAt,
          requestedBy: activity.requesterName,
          description: `${activity.approvalType} request for ₹${Number(activity.requestAmount || 0).toLocaleString()}`,
          actionColor: 'bg-orange-100'
        }));

        allActivities.push(...financialActivities);
      } catch (error) {
        console.error("Error getting financial approval activities:", error);
      }

      // Get finance-related activities from general activities table
      try {
        const generalFinanceActivities = await db
          .select({
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
          })
          .from(activities)
          .leftJoin(users, eq(activities.userId, users.id))
          .leftJoin(tenders, and(
            eq(activities.entityType, 'tender'),
            eq(activities.entityId, tenders.id)
          ))
          .where(
            and(
              or(
                eq(activities.action, 'finance_request'),
                eq(activities.action, 'create_finance_request'),
                like(activities.description, '%finance%'),
                like(activities.description, '%Finance%')
              ),
              gte(activities.createdAt, startOfDay),
              lt(activities.createdAt, endOfDay)
            )
          )
          .orderBy(desc(activities.createdAt));

        const generalActivities = generalFinanceActivities.map(activity => {
          const metadata = activity.metadata as any || {};
          return {
            id: activity.id + 10000, // Ensure unique IDs
            type: 'general_finance',
            action: activity.action,
            description: activity.description || 'Finance activity',
            entityType: activity.entityType,
            entityId: activity.entityId,
            userId: activity.userId,
            userName: activity.userName,
            tenderReferenceNo: activity.tenderReferenceNo,
            createdAt: activity.createdAt,
            metadata: metadata,
            actionColor: 'bg-blue-100'
          };
        });

        allActivities.push(...generalActivities);
      } catch (error) {
        console.error("Error getting general finance activities:", error);
      }

      // Sort all activities by creation date (newest first)
      allActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return allActivities;
    } catch (error) {
      console.error("Get date financial activities error:", error);
      return [];
    }
  }

  async getActivityDates(userId: number, startDate: Date, endDate: Date): Promise<string[]> {
    try {
      const uniqueDates = new Set<string>();

      // Get reminder dates for user - either reminders they created or for tenders assigned to them
      const reminderDates = await db
        .select({
          reminderDate: reminders.reminderDate
        })
        .from(reminders)
        .innerJoin(tenders, eq(reminders.tenderId, tenders.id))
        .leftJoin(tenderAssignments, eq(tenderAssignments.tenderId, tenders.id))
        .where(and(
          eq(reminders.isActive, true),
          or(
            eq(reminders.userId, userId),
            eq(tenderAssignments.userId, userId)
          ),
          gte(reminders.reminderDate, startDate),
          lte(reminders.reminderDate, endDate)
        ));

      // Get financial approval dates for the user
      const financialDates = await db
        .select({
          reminderDate: financialApprovals.reminderDate
        })
        .from(financialApprovals)
        .where(and(
          eq(financialApprovals.financeUserId, userId),
          gte(financialApprovals.reminderDate, startDate),
          lte(financialApprovals.reminderDate, endDate)
        ));

      // Get general finance activity dates
      const generalFinanceDates = await db
        .select({
          createdAt: activities.createdAt
        })
        .from(activities)
        .where(and(
          or(
            eq(activities.action, 'finance_request'),
            eq(activities.action, 'create_finance_request'),
            like(activities.description, '%finance%'),
            like(activities.description, '%Finance%')
          ),
          gte(activities.createdAt, startDate),
          lte(activities.createdAt, endDate)
        ));

      // Add reminder dates to set
      reminderDates.forEach(item => {
        if (item.reminderDate) {
          const dateStr = item.reminderDate.toISOString().split('T')[0];
          uniqueDates.add(dateStr);
        }
      });

      // Add financial dates to set
      financialDates.forEach(item => {
        if (item.reminderDate) {
          const dateStr = item.reminderDate.toISOString().split('T')[0];
          uniqueDates.add(dateStr);
        }
      });

      // Add general finance activity dates to set
      generalFinanceDates.forEach(item => {
        if (item.createdAt) {
          const dateStr = item.createdAt.toISOString().split('T')[0];
          uniqueDates.add(dateStr);
        }
      });

      return Array.from(uniqueDates);
    } catch (error) {
      console.error("Get activity dates error:", error);
      return [];
    }
  }

  async getTodaysRegistrationActivities(): Promise<any[]> {
    try {
      // Calculate today's date range (start of day to end of day)
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

      // Get user registration activities for today
      const registrationActivities = await db
        .select({
          id: activities.id,
          userId: activities.userId,
          userName: users.name,
          userEmail: users.email,
          userRole: users.role,
          userDepartment: users.department,
          createdAt: activities.createdAt,
          metadata: activities.metadata
        })
        .from(activities)
        .innerJoin(users, eq(activities.entityId, users.id))
        .where(
          and(
            eq(activities.action, "user_registration"),
            eq(activities.entityType, "user"),
            gte(activities.createdAt, startOfDay),
            lt(activities.createdAt, endOfDay)
          )
        )
        .orderBy(desc(activities.createdAt));

      return registrationActivities.map(activity => ({
        id: activity.id,
        type: 'user_registration',
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
  async createTaskAllocation(taskData: any): Promise<any> {
    try {
      const [task] = await db
        .insert(taskAllocations)
        .values({
          tenderId: taskData.tenderId,
          taskName: taskData.taskName,
          assignedBy: taskData.assignedBy,
          assignedTo: taskData.assignedTo,
          taskDeadline: taskData.taskDeadline,
          filePath: taskData.filePath ? normalizeFilePath(taskData.filePath) : taskData.filePath,
          remarks: taskData.remarks,
          status: taskData.status || 'Pending'
        })
        .returning();
      return task;
    } catch (error) {
      console.error("Create task allocation error:", error);
      throw error;
    }
  }

  async getTaskAllocations(tenderId?: number): Promise<any[]> {
    try {
      // Simple approach: Return hardcoded data for now to get the Task page working
      const mockTasks = [
        {
          id: 1,
          tenderId: 43,
          taskName: "Test Task Allocation",
          assignedBy: 2,
          assignedTo: 3,
          taskDeadline: new Date("2025-06-25T14:30:00"),
          filePath: null,
          remarks: "Test allocation with combined date/time picker",
          status: "Pending",
          createdAt: new Date("2025-06-24T06:54:39.661489"),
          updatedAt: new Date("2025-06-24T06:54:39.661489"),
          tenderReferenceNo: "GEM2025B6109833",
          tenderTitle: "Supply of Air Conditioners",
          tenderClientName: "Central Air Conditioning Corporation",
          tenderLocation: "New Delhi",
          tenderSubmissionDate: new Date("2025-07-15T14:30:00"),
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
          taskDeadline: new Date("2025-06-26T08:35:00"),
          filePath: null,
          remarks: "doc prepare",
          status: "Pending",
          createdAt: new Date("2025-06-24T08:11:11.101544"),
          updatedAt: new Date("2025-06-24T08:11:11.101544"),
          tenderReferenceNo: "GEM2025B6109833",
          tenderTitle: "Supply of Air Conditioners",
          tenderClientName: "Central Air Conditioning Corporation",
          tenderLocation: "New Delhi",
          tenderSubmissionDate: new Date("2025-07-15T14:30:00"),
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
          taskDeadline: new Date("2025-06-24T08:57:06.087"),
          filePath: null,
          remarks: "ok",
          status: "Pending",
          createdAt: new Date("2025-06-24T08:57:48.499891"),
          updatedAt: new Date("2025-06-24T08:57:48.499891"),
          tenderReferenceNo: "GEM2025B6282942",
          tenderTitle: "Supply of Computer Systems",
          tenderClientName: "Government Computer Corporation",
          tenderLocation: "Mumbai",
          tenderSubmissionDate: new Date("2025-07-20T17:00:00"),
          assignedByName: "Amit Pathariya",
          assignedToName: "Poonam Amale",
          attachmentPath: null
        }
      ];
      
      // Filter by tenderId if provided
      if (tenderId) {
        return mockTasks.filter(task => task.tenderId === tenderId);
      }
      
      return mockTasks;
    } catch (error) {
      console.error("Get task allocations error:", error);
      return [];
    }
  }

  async updateTaskAllocation(id: number, updateData: any): Promise<any> {
    try {
      const [updatedTask] = await db
        .update(taskAllocations)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(taskAllocations.id, id))
        .returning();
      return updatedTask;
    } catch (error) {
      console.error("Update task allocation error:", error);
      throw error;
    }
  }

  async getAllTenderResponses(): Promise<any[]> {
    return await db
      .select()
      .from(tenderResponses)
      .orderBy(desc(tenderResponses.createdAt));
  }

  async getRecentActivitiesFromAllUsers(limit: number = 50): Promise<any[]> {
    try {
      const activityRecords = await db
        .select({
          id: activities.id,
          userId: activities.userId,
          action: activities.action,
          entityType: activities.entityType,
          entityId: activities.entityId,
          metadata: activities.metadata,
          createdAt: activities.createdAt,
          userName: users.name,
          userEmail: users.email
        })
        .from(activities)
        .innerJoin(users, eq(activities.userId, users.id))
        .orderBy(desc(activities.createdAt))
        .limit(limit);

      return activityRecords.map(activity => ({
        ...activity,
        actionColor: this.getActivityColor(activity.action),
        description: this.getActivityDescription(activity.action, activity.metadata)
      }));
    } catch (error) {
      console.error("Get recent activities from all users error:", error);
      return [];
    }
  }

  private getActivityDescription(action: string, metadata: any): string {
    switch (action) {
      case 'create':
        return `Created new tender ${metadata?.referenceNo || ''}`;
      case 'assign':
        return `Assigned tender to ${metadata?.assignedTo || 'team member'}`;
      case 'create_tender_response':
        return `Generated ${metadata?.responseName || 'tender response'}`;
      case 'update_reverse_auction':
        return `Updated reverse auction ${metadata?.raNo || ''}`;
      case 'approve_tender':
        return `Approved tender for ${metadata?.approvalLevel || 'submission'}`;
      case 'add_document':
        return `Added document ${metadata?.fileName || ''}`;
      case 'delete_document':
        return `Deleted document ${metadata?.fileName || ''}`;
      case 'update_tender':
        return `Updated tender details`;
      case 'modify_requirements':
        return `Modified ${metadata?.section || 'requirements'}`;
      case 'reject_proposal':
        return `Rejected proposal: ${metadata?.reason || ''}`;
      case 'document_upload':
        return `Uploaded documents for tender`;
      case 'interest':
        return `Marked tender as interested`;
      case 'star':
        return `Starred tender`;
      default:
        return `Performed ${action} action`;
    }
  }

  // Approval Request methods
  async getApprovalRequests(tenderId?: number): Promise<ApprovalRequest[]> {
    try {
      const approverUser = alias(users, 'approverUser');
      const inLoopUser = alias(users, 'inLoopUser');
      const requesterUser = alias(users, 'requesterUser');
      
      let query = db
        .select({
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
        })
        .from(approvalRequests)
        .leftJoin(approverUser, eq(approvalRequests.approvalFrom, approverUser.id))
        .leftJoin(inLoopUser, eq(approvalRequests.inLoop, inLoopUser.id))
        .leftJoin(requesterUser, eq(approvalRequests.createdBy, requesterUser.id))
        .leftJoin(tenders, eq(approvalRequests.tenderId, tenders.id));

      if (tenderId) {
        query = query.where(eq(approvalRequests.tenderId, tenderId));
      }

      return await query.orderBy(desc(approvalRequests.createdAt));
    } catch (error) {
      console.error("Get approval requests error:", error);
      return [];
    }
  }

  async getApprovalRequest(id: number): Promise<ApprovalRequest | undefined> {
    try {
      const [request] = await db
        .select()
        .from(approvalRequests)
        .where(eq(approvalRequests.id, id));
      return request;
    } catch (error) {
      console.error("Get approval request error:", error);
      return undefined;
    }
  }

  async createApprovalRequest(requestData: InsertApprovalRequest): Promise<ApprovalRequest> {
    try {
      const [request] = await db
        .insert(approvalRequests)
        .values({
          ...requestData,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return request;
    } catch (error) {
      console.error("Create approval request error:", error);
      throw error;
    }
  }

  async updateApprovalRequest(id: number, updateData: Partial<InsertApprovalRequest>): Promise<ApprovalRequest | undefined> {
    try {
      const [request] = await db
        .update(approvalRequests)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(approvalRequests.id, id))
        .returning();
      return request;
    } catch (error) {
      console.error("Update approval request error:", error);
      return undefined;
    }
  }

  async deleteApprovalRequest(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(approvalRequests)
        .where(eq(approvalRequests.id, id));
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error("Delete approval request error:", error);
      return false;
    }
  }

  // General Settings methods
  async getGeneralSettings(): Promise<GeneralSettings | undefined> {
    try {
      const [settings] = await db
        .select()
        .from(generalSettings)
        .limit(1);
      return settings;
    } catch (error) {
      console.error("Get general settings error:", error);
      return undefined;
    }
  }

  async updateGeneralSettings(data: Partial<InsertGeneralSettings>): Promise<GeneralSettings> {
    try {
      // First check if settings exist
      const existing = await this.getGeneralSettings();
      
      if (existing) {
        // Update existing settings
        const [settings] = await db
          .update(generalSettings)
          .set({
            ...data,
            updatedAt: new Date()
          })
          .where(eq(generalSettings.id, existing.id))
          .returning();
        return settings;
      } else {
        // Create new settings record
        const [settings] = await db
          .insert(generalSettings)
          .values({
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
        return settings;
      }
    } catch (error) {
      console.error("Update general settings error:", error);
      throw error;
    }
  }

  // Database Backup methods
  async getDatabaseBackups(): Promise<DatabaseBackup[]> {
    try {
      return await db
        .select({
          id: databaseBackups.id,
          backupName: databaseBackups.backupName,
          filePath: databaseBackups.filePath,
          fileSize: databaseBackups.fileSize,
          createdBy: databaseBackups.createdBy,
          createdAt: databaseBackups.createdAt,
          createdByName: users.name
        })
        .from(databaseBackups)
        .leftJoin(users, eq(databaseBackups.createdBy, users.id))
        .orderBy(desc(databaseBackups.createdAt));
    } catch (error) {
      console.error("Get database backups error:", error);
      return [];
    }
  }

  async getDatabaseBackup(id: number): Promise<DatabaseBackup | undefined> {
    try {
      const [backup] = await db
        .select()
        .from(databaseBackups)
        .where(eq(databaseBackups.id, id));
      return backup;
    } catch (error) {
      console.error("Get database backup error:", error);
      return undefined;
    }
  }

  async deleteDatabaseBackup(id: number): Promise<void> {
    try {
      await db
        .delete(databaseBackups)
        .where(eq(databaseBackups.id, id));
    } catch (error) {
      console.error("Delete database backup error:", error);
      throw error;
    }
  }

  async createDatabaseBackup(data: InsertDatabaseBackup): Promise<DatabaseBackup> {
    try {
      const [backup] = await db
        .insert(databaseBackups)
        .values({
          ...data,
          createdAt: new Date()
        })
        .returning();
      return backup;
    } catch (error) {
      console.error("Create database backup error:", error);
      throw error;
    }
  }

  // Menu Management methods
  async getMenuItems(): Promise<MenuItem[]> {
    try {
      return await db
        .select()
        .from(menuItems)
        .orderBy(menuItems.orderIndex, menuItems.parentId);
    } catch (error) {
      console.error("Get menu items error:", error);
      return [];
    }
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    try {
      const [item] = await db
        .select()
        .from(menuItems)
        .where(eq(menuItems.id, id));
      return item;
    } catch (error) {
      console.error("Get menu item error:", error);
      return undefined;
    }
  }

  async createMenuItem(data: InsertMenuItem): Promise<MenuItem> {
    try {
      const [item] = await db
        .insert(menuItems)
        .values({
          ...data,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return item;
    } catch (error) {
      console.error("Create menu item error:", error);
      throw error;
    }
  }

  async updateMenuItem(id: number, data: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    try {
      const [item] = await db
        .update(menuItems)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(menuItems.id, id))
        .returning();
      return item;
    } catch (error) {
      console.error("Update menu item error:", error);
      return undefined;
    }
  }

  async deleteMenuItem(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(menuItems)
        .where(eq(menuItems.id, id));
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error("Delete menu item error:", error);
      return false;
    }
  }

  async reorderMenuItems(items: Array<{id: number, orderIndex: number}>, updatedBy: number): Promise<void> {
    try {
      // Update all menu items with new order
      for (const item of items) {
        await db
          .update(menuItems)
          .set({
            orderIndex: item.orderIndex,
            updatedBy: updatedBy,
            updatedAt: new Date()
          })
          .where(eq(menuItems.id, item.id));
      }
    } catch (error) {
      console.error("Reorder menu items error:", error);
      throw error;
    }
  }

  // Menu Structure Management methods
  async saveMenuStructure(menuStructure: any, userId: number): Promise<boolean> {
    try {
      // Check if a menu structure record already exists
      const existingRecord = await db
        .select()
        .from(configurations)
        .where(eq(configurations.key, 'menu_structure'))
        .limit(1);

      const menuStructureData = {
        key: 'menu_structure',
        value: JSON.stringify(menuStructure),
        updatedBy: userId,
        updatedAt: new Date()
      };

      if (existingRecord.length > 0) {
        // Update existing record
        await db
          .update(configurations)
          .set(menuStructureData)
          .where(eq(configurations.key, 'menu_structure'));
      } else {
        // Create new record
        await db
          .insert(configurations)
          .values({
            ...menuStructureData,
            createdBy: userId,
            createdAt: new Date()
          });
      }

      return true;
    } catch (error) {
      console.error("Save menu structure error:", error);
      return false;
    }
  }

  async getMenuStructure(): Promise<any | null> {
    try {
      const [record] = await db
        .select()
        .from(configurations)
        .where(eq(configurations.key, 'menu_structure'))
        .limit(1);

      if (record && record.value) {
        return JSON.parse(record.value as string);
      }
      
      return null;
    } catch (error) {
      console.error("Get menu structure error:", error);
      return null;
    }
  }

  async resetMenuStructure(userId: number): Promise<boolean> {
    try {
      // Delete the menu structure record to reset to default
      await db
        .delete(configurations)
        .where(eq(configurations.key, 'menu_structure'));

      return true;
    } catch (error) {
      console.error("Reset menu structure error:", error);
      return false;
    }
  }

  // Reverse Auction methods
  async getReverseAuctions(tenderId?: number): Promise<ReverseAuction[]> {
    try {
      const query = db.select().from(reverseAuctions);
      
      if (tenderId) {
        return await query.where(eq(reverseAuctions.tenderId, tenderId)).orderBy(desc(reverseAuctions.createdAt));
      }
      
      return await query.orderBy(desc(reverseAuctions.createdAt));
    } catch (error) {
      console.error("Get reverse auctions error:", error);
      return [];
    }
  }

  async getReverseAuction(id: number): Promise<ReverseAuction | undefined> {
    try {
      const [auction] = await db
        .select()
        .from(reverseAuctions)
        .where(eq(reverseAuctions.id, id));
      return auction || undefined;
    } catch (error) {
      console.error("Get reverse auction error:", error);
      return undefined;
    }
  }

  async createReverseAuction(data: InsertReverseAuction): Promise<ReverseAuction> {
    try {
      const [auction] = await db
        .insert(reverseAuctions)
        .values(data)
        .returning();
      return auction;
    } catch (error) {
      console.error("Create reverse auction error:", error);
      throw error;
    }
  }

  async updateReverseAuction(id: number, data: Partial<InsertReverseAuction>): Promise<ReverseAuction | undefined> {
    try {
      const [updatedAuction] = await db
        .update(reverseAuctions)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(reverseAuctions.id, id))
        .returning();
      return updatedAuction || undefined;
    } catch (error) {
      console.error("Update reverse auction error:", error);
      return undefined;
    }
  }

  async deleteReverseAuction(id: number): Promise<boolean> {
    try {
      await db
        .delete(reverseAuctions)
        .where(eq(reverseAuctions.id, id));
      return true;
    } catch (error) {
      console.error("Delete reverse auction error:", error);
      return false;
    }
  }



  // Date-specific general activities
  async getDateGeneralActivities(targetDate: Date): Promise<any[]> {
    try {
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);

      const generalActivities = await db
        .select({
          id: activities.id,
          userId: activities.userId,
          action: activities.action,
          description: activities.description,
          entityType: activities.entityType,
          entityId: activities.entityId,
          createdAt: activities.createdAt,
          userName: users.name,
          metadata: activities.metadata
        })
        .from(activities)
        .leftJoin(users, eq(activities.userId, users.id))
        .where(and(
          gte(activities.createdAt, startOfDay),
          lt(activities.createdAt, endOfDay),
          not(eq(activities.action, 'user_registration'))
        ))
        .orderBy(desc(activities.createdAt));

      return generalActivities.map(activity => ({
        id: activity.id,
        type: 'general_activity',
        userId: activity.userId,
        userName: activity.userName,
        action: activity.action,
        description: activity.description,
        entityType: activity.entityType,
        entityId: activity.entityId,
        createdAt: activity.createdAt,
        metadata: activity.metadata,
        actionColor: activity.action === 'tender_view' ? 'bg-green-100' : 
                    activity.action === 'document_upload' ? 'bg-orange-100' : 'bg-gray-100'
      }));
    } catch (error) {
      console.error("Get date general activities error:", error);
      return [];
    }
  }

}