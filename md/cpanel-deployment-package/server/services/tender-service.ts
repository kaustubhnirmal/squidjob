import { storage } from "../storage";
import {
  type InsertTender,
  type InsertTenderAssignment,
  type InsertReminder,
  type InsertUserTender,
  type InsertEligibilityCriteria,
  type InsertAiInsight,
  type InsertActivity
} from "@shared/schema";
import { AiService } from "./ai-service";

// Helper functions for insights processing

/**
 * Extract potential competitor names from AI insight text
 */
function extractCompetitorsFromInsights(analysisText: string | undefined): string[] {
  if (!analysisText) return [];
  
  // Default competitors if we can't extract any
  const defaultCompetitors = [
    "Ncc Limited",
    "Rcc Developers Limited", 
    "M/S Globe Civil Projects Private Limited"
  ];
  
  try {
    // Look for company names in the text (this is a simple implementation)
    // A more sophisticated version would use NLP to extract entity names
    const companyRegex = /([A-Z][A-Za-z\s]+(?:Limited|Ltd|Inc|LLC|Corporation|Pvt|Private Limited))/g;
    const matches = analysisText.match(companyRegex) || [];
    
    // Deduplicate
    const uniqueCompanies = Array.from(new Set(matches));
    
    return uniqueCompanies.length > 0 ? uniqueCompanies : defaultCompetitors;
  } catch (error) {
    console.error("Error extracting competitors from insights:", error);
    return defaultCompetitors;
  }
}

/**
 * Estimate winning probability based on AI insights
 */
function estimateWinningProbability(insights: any): number {
  try {
    const { riskAssessment, strategicAdvantages } = insights;
    
    // Default value
    let probability = 50;
    
    // Adjust based on content of insights (this is a simple heuristic)
    if (riskAssessment) {
      // Count negative indicators
      const negativeTerms = ['high risk', 'difficult', 'challenging', 'competitive', 
                            'complex', 'problem', 'issue', 'concern', 'difficult'];
      
      const negativeCount = negativeTerms.filter(term => 
        riskAssessment.toLowerCase().includes(term.toLowerCase())
      ).length;
      
      // Reduce probability based on negative terms (max -15)
      probability -= Math.min(negativeCount * 5, 15);
    }
    
    if (strategicAdvantages) {
      // Count positive indicators
      const positiveTerms = ['advantage', 'opportunity', 'strength', 'experience', 
                            'expertise', 'unique', 'specialized', 'cost-effective'];
      
      const positiveCount = positiveTerms.filter(term => 
        strategicAdvantages.toLowerCase().includes(term.toLowerCase())
      ).length;
      
      // Increase probability based on positive terms (max +25)
      probability += Math.min(positiveCount * 5, 25);
    }
    
    // Ensure within range
    return Math.max(10, Math.min(90, probability));
  } catch (error) {
    console.error("Error estimating winning probability:", error);
    return 50; // Default value on error
  }
}

/**
 * Extract potential issues from risk assessment
 */
function extractIssuesFromInsights(riskText: string | undefined): string[] {
  if (!riskText) return [];
  
  // Default issues if we can't extract any
  const defaultIssues = [
    "High competition in this sector",
    "Tight deadline for preparation",
    "Complex technical requirements"
  ];
  
  try {
    // Split by common sentence delimiters and bullet points
    const sentences = riskText.split(/[.;:]\s+|\n\s*[-•*]\s*/);
    
    // Filter out very short sentences and trim each one
    const potentialIssues = sentences
      .map(s => s.trim())
      .filter(s => s.length > 15 && s.length < 100);
      
    return potentialIssues.length > 0 ? potentialIssues.slice(0, 4) : defaultIssues;
  } catch (error) {
    console.error("Error extracting issues from insights:", error);
    return defaultIssues;
  }
}

/**
 * Extract recommendations from various insight fields
 */
function extractRecommendationsFromInsights(insights: any): string[] {
  // Default recommendations if we can't extract any
  const defaultRecommendations = [
    "Form consortium with technical experts",
    "Start preparation immediately", 
    "Focus on showcasing similar past experience"
  ];
  
  try {
    const { pricingStrategy, strategicAdvantages } = insights;
    const allText = [pricingStrategy, strategicAdvantages]
      .filter(Boolean)
      .join('. ');
    
    if (!allText) return defaultRecommendations;
    
    // Split by common sentence delimiters and bullet points
    const sentences = allText.split(/[.;:]\s+|\n\s*[-•*]\s*/);
    
    // Filter for sentences that sound like recommendations
    const recommendationStarters = ['should', 'consider', 'focus', 'highlight', 'ensure', 'leverage', 'emphasize'];
    
    const potentialRecommendations = sentences
      .map(s => s.trim())
      .filter(s => 
        s.length > 15 && 
        s.length < 100 &&
        recommendationStarters.some(starter => s.toLowerCase().includes(starter))
      );
      
    return potentialRecommendations.length > 0 
      ? potentialRecommendations.slice(0, 4) 
      : defaultRecommendations;
  } catch (error) {
    console.error("Error extracting recommendations from insights:", error);
    return defaultRecommendations;
  }
}

export const TenderService = {
  // Get all tenders with optional filtering
  async getTenders() {
    const tenders = await storage.getTenders();
    return tenders;
  },

  // Get tender by ID
  async getTenderById(id: number) {
    const tender = await storage.getTender(id);
    if (!tender) {
      throw new Error(`Tender with ID ${id} not found`);
    }
    return tender;
  },

  // Create a new tender
  async createTender(tenderData: InsertTender) {
    const tender = await storage.createTender(tenderData);
    
    // Log activity
    await storage.createActivity({
      userId: 1, // Default admin user for now
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
  async updateTender(id: number, tenderData: Partial<InsertTender>) {
    const tender = await storage.updateTender(id, tenderData);
    if (!tender) {
      throw new Error(`Tender with ID ${id} not found`);
    }
    
    // Special handling for tender submission
    if (tenderData.status === 'submitted') {
      // Log submission activity
      await storage.createActivity({
        userId: 1, // Default admin user for now
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
      // Log regular update activity
      await storage.createActivity({
        userId: 1, // Default admin user for now
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
  async assignTender(assignment: InsertTenderAssignment) {
    const tender = await storage.getTender(assignment.tenderId);
    if (!tender) {
      throw new Error(`Tender with ID ${assignment.tenderId} not found`);
    }
    
    const assignedUser = await storage.getUser(assignment.userId);
    if (!assignedUser) {
      throw new Error(`User with ID ${assignment.userId} not found`);
    }
    
    // Validate assignedBy user exists
    const assigningUser = await storage.getUser(assignment.assignedBy);
    if (!assigningUser) {
      throw new Error(`Assigning user with ID ${assignment.assignedBy} not found`);
    }
    
    const tenderAssignment = await storage.createTenderAssignment(assignment);
    
    // Log single assignment activity for the assigned user
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
        assignedAt: new Date().toISOString(),
        submissionDate: tender.deadline ? tender.deadline.toISOString() : null,
        comments: assignment.comments
      }
    });
    
    // Send email notification to the assigned user
    try {
      const { emailService } = await import('./email');
      
      // Format dates for email
      const startDate = tender.createdAt 
        ? new Date(tender.createdAt).toLocaleDateString('en-IN', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'Not specified';
      
      const endDate = tender.deadline 
        ? new Date(tender.deadline).toLocaleDateString('en-IN', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'Not specified';
      
      await emailService.sendTenderAssignmentEmail({
        recipientEmail: assignedUser.email,
        recipientName: assignedUser.name,
        tenderTitle: tender.title || `Tender ${tender.referenceNo}`,
        tenderReferenceNo: tender.referenceNo,
        startDate: startDate,
        endDate: endDate,
        assignedByName: assigningUser.name,
        comment: assignment.comments || undefined
      });
      
      console.log(`Email notification sent to ${assignedUser.email} for tender assignment`);
    } catch (error) {
      console.error('Error sending assignment email notification:', error);
      // Continue with assignment even if email notification fails
    }
    
    return tenderAssignment;
  },

  // Set a reminder for a tender
  async setReminder(reminderData: InsertReminder) {
    const tender = await storage.getTender(reminderData.tenderId);
    if (!tender) {
      throw new Error(`Tender with ID ${reminderData.tenderId} not found`);
    }
    
    const user = await storage.getUser(reminderData.userId);
    if (!user) {
      throw new Error(`User with ID ${reminderData.userId} not found`);
    }
    
    // Get assigned users for this tender
    const assignments = await storage.getTenderAssignments(reminderData.tenderId);
    const assignedUserIds = assignments.map(a => a.userId);
    
    // Create reminders for all assigned users if any assignments exist
    // Otherwise, create reminder for the requesting user only
    const userIdsForReminders = assignedUserIds.length > 0 ? assignedUserIds : [reminderData.userId];
    
    const reminders = [];
    for (const userId of userIdsForReminders) {
      const reminder = await storage.createReminder({
        ...reminderData,
        userId: userId, // User who will receive the reminder
        createdBy: reminderData.createdBy || reminderData.userId // User who created the reminder
      });
      reminders.push(reminder);
      
      // Log activity for each user
      await storage.createActivity({
        userId: userId,
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
    
    return reminders[0]; // Return the first reminder for backward compatibility
  },

  // Mark a tender as starred or interested
  async markTenderInterest(interestData: InsertUserTender) {
    const tender = await storage.getTender(interestData.tenderId);
    if (!tender) {
      throw new Error(`Tender with ID ${interestData.tenderId} not found`);
    }
    
    const user = await storage.getUser(interestData.userId);
    if (!user) {
      throw new Error(`User with ID ${interestData.userId} not found`);
    }
    
    let userTender;
    if (interestData.isStarred !== undefined) {
      userTender = await storage.toggleTenderStar(
        interestData.userId,
        interestData.tenderId,
        !!interestData.isStarred
      );
      
      // Log activity for starring
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
    
    if (interestData.isInterested !== undefined) {
      userTender = await storage.toggleTenderInterest(
        interestData.userId,
        interestData.tenderId,
        !!interestData.isInterested
      );
      
      // Log activity for interest
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
  async getEligibilityCriteria(tenderId: number) {
    const tender = await storage.getTender(tenderId);
    if (!tender) {
      throw new Error(`Tender with ID ${tenderId} not found`);
    }
    
    return storage.getEligibilityCriteria(tenderId);
  },

  // Generate AI eligibility criteria
  async generateEligibilityCriteria(tenderId: number) {
    const tender = await storage.getTender(tenderId);
    if (!tender) {
      throw new Error(`Tender with ID ${tenderId} not found`);
    }
    
    try {
      // Generate criteria using AI service
      const aiGeneratedCriteria = await AiService.generateEligibilityCriteria(tender);
      
      const results = [];
      // Save each criterion to the database
      for (const criterion of aiGeneratedCriteria) {
        const criteriaEntry: InsertEligibilityCriteria = {
          tenderId,
          criteria: `${criterion.description}: ${criterion.requirement}`,
          category: criterion.category || "General",
          isAiGenerated: true
        };
        
        const result = await storage.createEligibilityCriteria(criteriaEntry);
        results.push(result);
      }
      
      // If AI failed or returned empty, provide fallback criteria
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
          const criteriaEntry: InsertEligibilityCriteria = {
            tenderId,
            criteria,
            category,
            isAiGenerated: true
          };
          
          const result = await storage.createEligibilityCriteria(criteriaEntry);
          results.push(result);
        }
      }
      
      // Log activity
      await storage.createActivity({
        userId: 1, // Default admin user
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
      
      // Use fallback criteria on error
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
        const criteriaEntry: InsertEligibilityCriteria = {
          tenderId,
          criteria,
          category,
          isAiGenerated: true
        };
        
        const result = await storage.createEligibilityCriteria(criteriaEntry);
        results.push(result);
      }
      
      // Log activity
      await storage.createActivity({
        userId: 1, // Default admin user
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
    return storage.getAiInsights(0); // 0 for general insights not tied to a specific tender
  },

  // Generate AI insights for a tender
  async generateTenderInsights(tenderId: number) {
    const tender = await storage.getTender(tenderId);
    if (!tender) {
      throw new Error(`Tender with ID ${tenderId} not found`);
    }
    
    try {
      // Generate insights using AI service
      const aiGeneratedInsights = await AiService.generateTenderInsights(tender);
      
      // Transform AI insights into the expected format
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
      
      const insight: InsertAiInsight = {
        tenderId,
        category: "tender_insights",
        insightData
      };
      
      const result = await storage.createAiInsight(insight);
      
      // Log activity
      await storage.createActivity({
        userId: 1, // Default admin user
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
      
      // Fallback insights
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
      
      const insight: InsertAiInsight = {
        tenderId,
        category: "tender_insights",
        insightData
      };
      
      const result = await storage.createAiInsight(insight);
      
      // Log activity
      await storage.createActivity({
        userId: 1, // Default admin user
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
  async getRecentActivities(limit: number = 5) {
    return storage.getActivities(undefined, limit);
  },

  // Get competitors
  async getCompetitors() {
    return storage.getCompetitors();
  }
};
