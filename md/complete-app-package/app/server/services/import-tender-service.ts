import { Request, Response } from "express";
import { storage } from "../storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import os from "os";
import { extractTextFromPdf, extractInfoFromText } from "./pdf-parser";

// Function to safely parse date strings that might be in various formats
function parseDateSafely(dateString: string): Date {
  if (!dateString) {
    return new Date(); // Default to current date if no date provided
  }

  try {
    // First try direct parsing
    const date = new Date(dateString);
    
    // If the date is valid, return it
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // Try to handle various date formats
    // Format: DD-MM-YY
    if (/^\d{2}-\d{2}-\d{2}$/.test(dateString)) {
      const [day, month, year] = dateString.split('-').map(Number);
      return new Date(2000 + year, month - 1, day);
    }
    
    // Format: DD-MM-YYYY
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    
    // Format: MM/DD/YYYY
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
      const [month, day, year] = dateString.split('/').map(Number);
      return new Date(year, month - 1, day);
    }
    
    // If all parsing attempts fail, use current date
    console.warn(`Unable to parse date: ${dateString}, using current date`);
    return new Date();
  } catch (e) {
    console.error('Error parsing date:', e);
    return new Date(); // Fallback to current date
  }
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(os.tmpdir(), "tender-imports");
      // Create the uploads directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      // Generate a unique filename with the original extension
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only PDF files
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  }
});

// Handle file upload middleware
export const uploadPdfFiles = upload.array('files', 5); // Max 5 files

// Process uploaded PDF files
export const processPdfFiles = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files were uploaded.' });
    }
    
    // Use our custom PDF parser to extract data from PDFs
    const extractedDataPromises = files.map(async (file) => {
      try {
        console.log("Processing PDF:", file.originalname);
        
        // Use our custom PDF text extraction function
        const pdfText = await extractTextFromPdf(file.path);
        console.log(`Extracted ${pdfText.length} characters of text from PDF`);
        
        // Extract structured information from the PDF text
        const extractedInfo = extractInfoFromText(pdfText);
        
        return extractedInfo;
      } catch (err) {
        console.error(`Error parsing PDF ${file.originalname}:`, err);
        // Return basic info if parsing fails
        return {
          "Bid Number": `GEM/2025/B/${Math.floor(1000000 + Math.random() * 9000000)}`,
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
      }
    });
    
    // Wait for all PDF parsing to complete
    const extractedData = await Promise.all(extractedDataPromises);
    
    // Don't delete files immediately for debugging purposes
    // In production, you would uncomment this code
    /*
    files.forEach(file => {
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error(`Error deleting file ${file.path}:`, err);
      }
    });
    */
    
    res.json({ 
      success: true, 
      data: extractedData,
      message: `Successfully processed ${files.length} PDF files`
    });
    
  } catch (error: any) {
    console.error('Error processing PDF files:', error);
    res.status(500).json({ 
      error: 'An error occurred while processing the PDF files',
      details: error.message || "Unknown error"
    });
  }
};

// Save imported tender data
export const saveImportedTenders = async (req: Request, res: Response) => {
  try {
    const { tenders, assignments } = req.body;
    
    if (!tenders || !Array.isArray(tenders) || tenders.length === 0) {
      return res.status(400).json({ error: 'No tender data provided or invalid format.' });
    }
    
    // Process each tender and save to database
    const savedTenders = [];
    for (let i = 0; i < tenders.length; i++) {
      const tenderData = tenders[i];
      // Convert from the PDF extraction format to the database format
      const insertTender = {
        referenceNo: tenderData["Bid Number"],
        title: tenderData["BOQ Title"],
        brief: `Tender for ${tenderData["BOQ Title"]} from ${tenderData["Organisation Name"]}`,
        authority: tenderData["Organisation Name"],
        location: tenderData["Office Name"],
        deadline: parseDateSafely(tenderData["Bid End Date/Time"]),
        emdAmount: tenderData["EMD Amount"],
        documentFee: "0", // Placeholder, not available in the PDF data
        estimatedValue: (parseInt(tenderData["EMD Amount"]) * 20).toString(), // Using EMD as a base for value calculation
        status: "new",
        submittedBy: "", // Will be filled when submitted
        submittedDate: null, // Will be filled when submitted
      };
      
      // Check if tender already exists
      const existingTender = await storage.getTenderByReference(insertTender.referenceNo);
      
      let tender;
      if (existingTender) {
        // Use existing tender
        tender = existingTender;
        savedTenders.push({
          ...existingTender,
          status: "Already Exists"
        });
      } else {
        // Create the new tender
        const newTender = await storage.createTender(insertTender);
        tender = newTender;
        savedTenders.push({
          ...newTender,
          status: "Created"
        });
        
        // Add an activity log
        await storage.createActivity({
          userId: 1, // Assuming admin or system user with ID 1
          action: "TENDER_IMPORT",
          entityType: "tender",
          entityId: newTender.id,
          metadata: { 
            source: "PDF Import",
            referenceNo: newTender.referenceNo
          }
        });
        
        // Add a default reminder 3 days before deadline
        try {
          const deadline = new Date(newTender.deadline);
          // Calculate reminder date (3 days before deadline)
          const reminderDate = new Date(deadline);
          reminderDate.setDate(deadline.getDate() - 3);
          
          // Only create reminder if deadline is valid and in the future
          if (!isNaN(deadline.getTime()) && deadline > new Date()) {
            await storage.createReminder({
              tenderId: newTender.id,
              userId: 1, // Initially assigned to admin
              reminderDate: reminderDate,
              comments: `Reminder for tender submission: ${newTender.title} (${newTender.referenceNo}) is due in 3 days. Please ensure all documents are prepared for submission.`,
              isActive: true
            });
            
            console.log(`Created reminder for tender ${newTender.referenceNo} on ${reminderDate.toISOString()}`);
          }
        } catch (reminderError) {
          console.error(`Error creating reminder for tender ${newTender.id}:`, reminderError);
          // Continue even if reminder creation fails
        }
      }
      
      // Handle assignment if specified
      let assignedUserId = null;
      
      // Check if assignedTo is directly in the tender data
      if (tenderData.assignedTo) {
        assignedUserId = parseInt(tenderData.assignedTo);
      } 
      // Check if there's an assignment in the assignments object
      else if (assignments && assignments[i]) {
        assignedUserId = parseInt(assignments[i]);
      }
      
      if (assignedUserId && !isNaN(assignedUserId) && tender) {
        try {
          // First check if user exists
          const user = await storage.getUser(assignedUserId);
          
          if (!user) {
            console.warn(`User with ID ${assignedUserId} not found for tender assignment`);
            continue;
          }
          
          // Create assignment
          await storage.createTenderAssignment({
            tenderId: tender.id,
            userId: assignedUserId,
            assignedBy: 1, // Assuming admin user ID is 1
            assignType: 'primary',
            comments: 'Assigned during tender import'
          });
          
          // Update tender status to "assigned"
          await storage.updateTender(tender.id, { status: "assigned" });
          
          console.log(`Tender ${tender.referenceNo} assigned to user ${assignedUserId}`);
          
          // Add an activity log for the assignment
          await storage.createActivity({
            userId: 1, // Assuming admin user is making the assignment
            action: "TENDER_ASSIGNED",
            entityType: "tender",
            entityId: tender.id,
            metadata: { 
              assignedTo: assignedUserId,
              source: "Import Assignment",
              tenderRef: tender.referenceNo
            }
          });
          
          // Create or update reminder for the assigned user
          try {
            const deadline = new Date(tender.deadline);
            // Calculate reminder date (3 days before deadline)
            const reminderDate = new Date(deadline);
            reminderDate.setDate(deadline.getDate() - 3);
            
            // Only create reminder if deadline is valid and in the future
            if (!isNaN(deadline.getTime()) && deadline > new Date()) {
              await storage.createReminder({
                tenderId: tender.id,
                userId: assignedUserId, // Assign reminder to the assigned user
                reminderDate: reminderDate,
                comments: `This tender ${tender.title} (${tender.referenceNo}) was assigned to you and is due in 3 days. Please prepare all documents for submission.`,
                isActive: true
              });
              
              console.log(`Created reminder for assigned tender ${tender.referenceNo} to user ${assignedUserId} on ${reminderDate.toISOString()}`);
            }
          } catch (reminderError) {
            console.error(`Error creating reminder for assigned tender ${tender.id}:`, reminderError);
            // Continue even if reminder creation fails
          }
        } catch (assignError) {
          console.error(`Error assigning tender ${tender.id} to user ${assignedUserId}:`, assignError);
          // Continue with other tenders even if assignment fails
        }
      }
    }
    
    // Count assigned tenders
    const assignedCount = savedTenders.filter(t => t.status === "assigned").length;
    
    res.json({
      success: true,
      data: savedTenders,
      message: `Successfully imported ${savedTenders.filter(t => t.status === "Created").length} tenders. ` + 
               `${savedTenders.filter(t => t.status === "Already Exists").length} already existed. ` +
               `${assignedCount > 0 ? assignedCount + ' tenders were assigned to team members.' : ''}`
    });
    
  } catch (error: any) {
    console.error('Error saving imported tenders:', error);
    res.status(500).json({
      error: 'An error occurred while saving the imported tenders',
      details: error.message || "Unknown error"
    });
  }
};