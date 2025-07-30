import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Setup secure storage for PDF uploads
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename to prevent path traversal attacks
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(sanitizedName);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Setup storage for Excel/CSV uploads
const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Secure PDF file filter
const pdfFileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check MIME type
  if (file.mimetype !== 'application/pdf') {
    return cb(new Error('Only PDF files are allowed'));
  }
  
  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.pdf') {
    return cb(new Error('File must have .pdf extension'));
  }
  
  // Check for malicious filenames
  if (file.originalname.includes('../') || file.originalname.includes('..\\')) {
    return cb(new Error('Invalid filename'));
  }
  
  // Check filename length
  if (file.originalname.length > 255) {
    return cb(new Error('Filename too long'));
  }
  
  cb(null, true);
};

// Excel/CSV file filter
const excelFileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/csv',
    'text/plain'
  ];
  
  // Check MIME type
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } 
  // Fallback to extension check
  else {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.xls', '.xlsx', '.csv'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel or CSV files are allowed'));
    }
  }
};

// Setup storage for tender document uploads
const tenderDocumentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create a specific directory for tender documents
    const tenderDocsDir = path.join(uploadDir, 'tender_documents');
    if (!fs.existsSync(tenderDocsDir)) {
      fs.mkdirSync(tenderDocsDir, { recursive: true });
    }
    cb(null, tenderDocsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const safeFieldName = file.fieldname.replace(/[^a-z0-9]/gi, '_');
    cb(null, safeFieldName + '-' + uniqueSuffix + ext);
  }
});

// Document file filter
const documentFileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow only PDF files for all document types
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed for document uploads'));
  }
};

// Create secure multer upload instances
export const pdfUpload = multer({
  storage: pdfStorage,
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max size
    files: 5, // Max 5 files
    fields: 10, // Max 10 fields
    fieldNameSize: 100, // Max field name size
    fieldSize: 1024 * 1024 // Max field value size (1MB)
  }
});

export const excelUpload = multer({
  storage: excelStorage,
  fileFilter: excelFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max size
    files: 1 // Max 1 file
  }
});

// Create tender document upload instance
export const tenderDocumentUpload = multer({
  storage: tenderDocumentStorage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max size
    files: 3 // Max 3 files (bid document, ATC, tech specs)
  }
});

// Setup storage for purchase order uploads
const purchaseOrderStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create a specific directory for purchase orders
    const purchaseOrdersDir = path.join(uploadDir, 'purchase_orders');
    if (!fs.existsSync(purchaseOrdersDir)) {
      fs.mkdirSync(purchaseOrdersDir, { recursive: true });
    }
    cb(null, purchaseOrdersDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'po-' + uniqueSuffix + ext);
  }
});

// Purchase order file filter
const purchaseOrderFileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow PDF, Excel, Word and CSV files
  const allowedMimes = [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  // Check MIME type
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } 
  // Fallback to extension check
  else {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.pdf', '.xls', '.xlsx', '.csv', '.doc', '.docx'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, Excel, Word, or CSV files are allowed'));
    }
  }
};

// Create purchase order upload instance
export const purchaseOrderUpload = multer({
  storage: purchaseOrderStorage,
  fileFilter: purchaseOrderFileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max size
    files: 1 // Max 1 file
  }
});