import OpenAI from "openai";
import { Tender, Competitor } from "../../shared/schema";

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

/**
 * AI Service that provides AI-powered features for the StarTender system
 */
export const AiService = {
  /**
   * Generate eligibility criteria for a tender based on its details
   * @param tender The tender details
   * @returns List of eligibility criteria
   */
  async generateEligibilityCriteria(tender: Tender) {
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
  async generateTenderInsights(tender: Tender) {
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
  async analyzeTenderDocument(documentText: string) {
    try {
      // Ensure documentText is not null and truncate if too long
      const safeText = documentText ? documentText.substring(0, 3000) : "No document text provided";
      
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
  async compareCompetitors(competitor1: Competitor, competitor2: Competitor) {
    try {
      const comp1Name = competitor1.name;
      const comp1Participated = competitor1.participatedTenders || 0;
      const comp1Awarded = competitor1.awardedTenders || 0;
      const comp1WinRate = (comp1Participated > 0) 
        ? ((comp1Awarded / comp1Participated) * 100).toFixed(1) 
        : "0.0";
      const comp1Category = competitor1.category || "Various";
      const comp1State = competitor1.state || "Various";
      
      const comp2Name = competitor2.name;
      const comp2Participated = competitor2.participatedTenders || 0;
      const comp2Awarded = competitor2.awardedTenders || 0;
      const comp2WinRate = (comp2Participated > 0) 
        ? ((comp2Awarded / comp2Participated) * 100).toFixed(1) 
        : "0.0";
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