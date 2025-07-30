export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  createdAt: string;
}

export interface Tender {
  id: number;
  referenceNo: string;
  title: string;
  brief: string;
  authority: string;
  location?: string;
  deadline: string;
  emdAmount?: number;
  documentFee?: number;
  estimatedValue?: number;
  bidValue?: number;
  status: string;
  bidDocumentPath?: string;
  atcDocumentPath?: string;
  techSpecsDocumentPath?: string;
  createdAt: string;
  updatedAt?: string;
  assignedUser?: {
    id: number;
    name: string;
  };
}

export interface TenderAssignment {
  id: number;
  tenderId: number;
  userId: number;
  assignedBy: number;
  assignType: string;
  comments?: string;
  createdAt: string;
}

export interface UserTender {
  id: number;
  userId: number;
  tenderId: number;
  isStarred: boolean;
  isInterested: boolean;
  createdAt: string;
  tender: Tender;
}

export interface Reminder {
  id: number;
  tenderId: number;
  userId: number;
  reminderDate: string;
  comments?: string;
  isActive: boolean;
  createdAt: string;
  tender: Tender;
}

export interface EligibilityCriteria {
  id: number;
  tenderId: number;
  criteria: string;
  category?: string;
  isAiGenerated: boolean;
  createdAt: string;
}

export interface TenderDocument {
  id: number;
  tenderId: number;
  name: string;
  fileUrl: string;
  fileType?: string;
  category?: string;
  isPublic: boolean;
  uploadedBy: number;
  createdAt: string;
}

export interface Competitor {
  id: number;
  name: string;
  state?: string;
  category?: string;
  participatedTenders: number;
  awardedTenders: number;
  lostTenders: number;
  createdAt: string;
}

export interface TenderResult {
  id: number;
  tenderId: number;
  status: string;
  winnerId?: number;
  bidAmount?: number;
  remarks?: string;
  createdAt: string;
}

export interface AiInsight {
  id: number;
  tenderId?: number;
  category: string;
  insightData: any;
  createdAt: string;
}

export interface Activity {
  id: number;
  userId: number;
  action: string;
  entityType: string;
  entityId: number;
  metadata?: any;
  createdAt: string;
}

export interface DashboardStats {
  totalTenders: number;
  activeTenders: number;
  wonTenders: number;
  pendingEMDs: number;
}

export interface FormattedActivity {
  id: number;
  icon: string;
  iconColor: string;
  iconBgColor: string;
  message: string;
  timestamp: string;
}

export interface TenderFormValues {
  referenceNo: string;
  title: string;
  brief: string;
  authority: string;
  location?: string;
  deadline: Date;
  emdAmount?: number;
  documentFee?: number;
  estimatedValue?: number;
  status: string;
}

export interface ReminderFormValues {
  tenderId: number;
  userId: number;
  reminderDate: Date;
  comments?: string;
  isActive: boolean;
}

export interface AssignFormValues {
  tenderId: number;
  userId: number;
  assignedBy: number;
  assignType: string;
  comments?: string;
}
