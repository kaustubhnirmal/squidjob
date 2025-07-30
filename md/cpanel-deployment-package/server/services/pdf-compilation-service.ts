import { PDFDocument, rgb, StandardFonts, PageSizes } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

interface DocumentInfo {
  id: number;
  documentName: string;
  filePath?: string;
  fileId?: number;
  order: number;
}

interface StampOptions {
  imagePath: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  opacity?: number;
  scale?: number;
}

interface IndexOptions {
  includeIndex: boolean;
  startFrom: number;
  title?: string;
}

interface CompilationOptions {
  responseName: string;
  responseType: string;
  remarks: string;
  documents: DocumentInfo[];
  stampOptions?: StampOptions;
  indexOptions: IndexOptions;
  bidNumber?: string;
  outputPath: string;
}

export class PDFCompilationService {
  private static async loadPDFFromFile(filePath: string): Promise<PDFDocument> {
    try {
      const pdfBytes = fs.readFileSync(filePath);
      return await PDFDocument.load(pdfBytes);
    } catch (error) {
      console.error(`Error loading PDF from ${filePath}:`, error);
      throw new Error(`Failed to load PDF: ${path.basename(filePath)}`);
    }
  }

  private static async createIndexPage(
    documents: DocumentInfo[],
    options: IndexOptions,
    actualPageCounts: { [key: number]: number } = {},
    bidNumber?: string
  ): Promise<PDFDocument> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage(PageSizes.A4);
    const { width, height } = page.getSize();
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let currentY = height - 80;
    
    // Add bid number as title if provided
    if (bidNumber) {
      const bidTitle = `Bid No: ${bidNumber}`;
      const bidTitleWidth = boldFont.widthOfTextAtSize(bidTitle, 20);
      page.drawText(bidTitle, {
        x: (width - bidTitleWidth) / 2,
        y: currentY,
        size: 20,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      currentY -= 50;
    }
    
    // Center the table of contents title
    const title = 'INDEX';
    const titleWidth = boldFont.widthOfTextAtSize(title, 18);
    page.drawText(title, {
      x: (width - titleWidth) / 2,
      y: currentY,
      size: 18,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    currentY -= 40;
    
    // Add introduction section
    let yPosition = currentY;
    page.drawText('Introduction....................................................', {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 40;
    
    // Document entries with actual page numbers
    let currentPageNumber = options.startFrom + 1; // Start after index page
    
    documents.forEach((doc, index) => {
      if (yPosition < 100) {
        // Add new page if running out of space
        const newPage = pdfDoc.addPage(PageSizes.A4);
        yPosition = newPage.getSize().height - 80;
      }
      
      // Format document name with dots leading to page number
      const maxNameLength = 50;
      let docName = doc.documentName;
      if (docName.length > maxNameLength) {
        docName = docName.substring(0, maxNameLength - 3) + '...';
      }
      
      // Calculate dots needed
      const nameWidth = font.widthOfTextAtSize(docName, 12);
      const pageNumText = currentPageNumber.toString();
      const pageNumWidth = font.widthOfTextAtSize(pageNumText, 12);
      const availableSpace = width - 100 - nameWidth - pageNumWidth;
      const dotCount = Math.floor(availableSpace / font.widthOfTextAtSize('.', 12));
      const dots = '.'.repeat(Math.max(dotCount, 3));
      
      // Draw document name
      page.drawText(docName, {
        x: 50,
        y: yPosition,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
      
      // Draw dots
      page.drawText(dots, {
        x: 50 + nameWidth,
        y: yPosition,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
      
      // Draw page number
      page.drawText(pageNumText, {
        x: width - 50 - pageNumWidth,
        y: yPosition,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
      
      yPosition -= 20;
      
      // Calculate next page number based on actual document page count
      const docPageCount = actualPageCounts[doc.id] || 1;
      currentPageNumber += docPageCount;
    });
    
    return pdfDoc;
  }

  private static async applyStampToDocument(
    pdfDoc: PDFDocument,
    stampOptions: StampOptions
  ): Promise<void> {
    try {
      const stampImageBytes = fs.readFileSync(stampOptions.imagePath);
      
      // Detect image type and embed accordingly
      let stampImage;
      const imageExtension = stampOptions.imagePath.toLowerCase();
      
      if (imageExtension.includes('.png')) {
        stampImage = await pdfDoc.embedPng(stampImageBytes);
      } else if (imageExtension.includes('.jpg') || imageExtension.includes('.jpeg')) {
        stampImage = await pdfDoc.embedJpg(stampImageBytes);
      } else {
        // Try PNG first, fallback to JPG
        try {
          stampImage = await pdfDoc.embedPng(stampImageBytes);
        } catch {
          stampImage = await pdfDoc.embedJpg(stampImageBytes);
        }
      }
      
      const pages = pdfDoc.getPages();
      const opacity = stampOptions.opacity || 0.8;
      
      // Calculate scale to achieve 100px x 100px stamp
      const targetSize = 100; // 100px in points (PDF uses points)
      const stampWidth = stampImage.width;
      const stampHeight = stampImage.height;
      const scale = Math.min(targetSize / stampWidth, targetSize / stampHeight);
      
      pages.forEach(page => {
        const { width, height } = page.getSize();
        const stampDims = stampImage.scale(scale);
        
        let x: number, y: number;
        
        switch (stampOptions.position) {
          case 'bottom-left':
            x = 20;
            y = 20;
            break;
          case 'top-right':
            x = width - stampDims.width - 20;
            y = height - stampDims.height - 20;
            break;
          case 'top-left':
            x = 20;
            y = height - stampDims.height - 20;
            break;
          case 'center':
            x = (width - stampDims.width) / 2;
            y = (height - stampDims.height) / 2;
            break;
          default: // bottom-right (as requested)
            x = width - stampDims.width - 20;
            y = 20;
            break;
        }
        
        page.drawImage(stampImage, {
          x,
          y,
          width: stampDims.width,
          height: stampDims.height,
          opacity,
        });
      });
    } catch (error) {
      console.error('Error applying stamp:', error);
      throw new Error('Failed to apply stamp to document');
    }
  }

  public static async compileDocuments(options: CompilationOptions): Promise<string> {
    try {
      console.log('Starting PDF compilation with options:', {
        responseName: options.responseName,
        documentsCount: options.documents.length,
        includeIndex: options.indexOptions.includeIndex,
        hasStamp: !!options.stampOptions
      });

      const finalPdf = await PDFDocument.create();
      const documentPageCounts: { [key: number]: number } = {};
      
      // First pass: Collect page counts for accurate index generation
      const sortedDocuments = options.documents.sort((a, b) => a.order - b.order);
      for (const doc of sortedDocuments) {
        try {
          if (!doc.filePath) {
            continue;
          }
          
          let fullPath = doc.filePath;
          if (!path.isAbsolute(fullPath)) {
            fullPath = path.join(process.cwd(), fullPath);
          }
          
          if (!fs.existsSync(fullPath)) {
            continue;
          }
          
          const docPdf = await this.loadPDFFromFile(fullPath);
          documentPageCounts[doc.id] = docPdf.getPageCount();
        } catch (error) {
          console.error(`Error counting pages for ${doc.documentName}:`, error);
          documentPageCounts[doc.id] = 1; // Default fallback
        }
      }
      
      // Add index page if requested (with accurate page counts)
      if (options.indexOptions.includeIndex) {
        const indexPdf = await this.createIndexPage(options.documents, options.indexOptions, documentPageCounts, options.bidNumber);
        const indexPages = await finalPdf.copyPages(indexPdf, indexPdf.getPageIndices());
        const font = await finalPdf.embedFont(StandardFonts.Helvetica);
        
        indexPages.forEach(page => {
          finalPdf.addPage(page);
          
          // Add page numbering to index page
          const pageNumber = `Page no : ${options.indexOptions.startFrom}`;
          page.drawText(pageNumber, {
            x: (page.getSize().width - 80) / 2, // Center horizontally
            y: 20, // Bottom margin
            size: 10,
            font: font,
            color: rgb(0, 0, 0),
          });
        });
      }
      
      // Second pass: Process and merge documents
      // Calculate starting page number based on whether index is included
      let currentPageNumber = options.indexOptions.startFrom;
      if (options.indexOptions.includeIndex) {
        currentPageNumber = options.indexOptions.startFrom + 1; // Index page takes the startFrom number
      }
      
      for (const doc of sortedDocuments) {
        try {
          if (!doc.filePath) {
            console.warn(`No file path for document: ${doc.documentName}`);
            continue;
          }
          
          let fullPath = doc.filePath;
          if (!path.isAbsolute(fullPath)) {
            fullPath = path.join(process.cwd(), fullPath);
          }
          
          if (!fs.existsSync(fullPath)) {
            console.warn(`File not found: ${fullPath}`);
            continue;
          }
          
          console.log(`Processing document: ${doc.documentName} at ${fullPath}`);
          
          const docPdf = await this.loadPDFFromFile(fullPath);
          
          // Apply stamp if provided
          if (options.stampOptions) {
            await this.applyStampToDocument(docPdf, options.stampOptions);
          }
          
          // Copy pages to final document
          const pages = await finalPdf.copyPages(docPdf, docPdf.getPageIndices());
          const font = await finalPdf.embedFont(StandardFonts.Helvetica);
          
          pages.forEach((page, pageIndex) => {
            finalPdf.addPage(page);
            
            // Add page numbering in bottom center with proper sequence
            const pageNumber = `Page no : ${currentPageNumber}`;
            
            page.drawText(pageNumber, {
              x: (page.getSize().width - 80) / 2, // Center horizontally
              y: 20, // Bottom margin
              size: 10,
              font: font,
              color: rgb(0, 0, 0),
            });
            
            currentPageNumber++; // Increment for next page
          });
          
        } catch (error) {
          console.error(`Error processing document ${doc.documentName}:`, error);
          // Continue with other documents even if one fails
        }
      }
      
      // Ensure output directory exists
      const outputDir = path.dirname(options.outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Save the compiled PDF as binary data
      const pdfBytes = await finalPdf.save();
      fs.writeFileSync(options.outputPath, Buffer.from(pdfBytes));
      
      console.log(`PDF compilation completed: ${options.outputPath}`);
      console.log(`Final PDF page count: ${finalPdf.getPageCount()}`);
      
      return options.outputPath;
      
    } catch (error) {
      console.error('PDF compilation error:', error);
      throw new Error(`Failed to compile PDF: ${error.message}`);
    }
  }

  public static async mergeAllSubmissions(submissionPaths: string[], outputPath: string): Promise<string> {
    try {
      console.log(`Merging ${submissionPaths.length} submissions into: ${outputPath}`);
      
      const finalPdf = await PDFDocument.create();
      
      for (const submissionPath of submissionPaths) {
        try {
          if (!fs.existsSync(submissionPath)) {
            console.warn(`Submission file not found: ${submissionPath}`);
            continue;
          }
          
          const submissionPdf = await this.loadPDFFromFile(submissionPath);
          const pages = await finalPdf.copyPages(submissionPdf, submissionPdf.getPageIndices());
          pages.forEach(page => finalPdf.addPage(page));
          
        } catch (error) {
          console.error(`Error processing submission ${submissionPath}:`, error);
          // Continue with other submissions
        }
      }
      
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Save the merged PDF as binary data
      const pdfBytes = await finalPdf.save();
      fs.writeFileSync(outputPath, Buffer.from(pdfBytes));
      
      console.log(`All submissions merged successfully: ${outputPath}`);
      console.log(`Final merged PDF page count: ${finalPdf.getPageCount()}`);
      
      return outputPath;
      
    } catch (error) {
      console.error('Error merging submissions:', error);
      throw new Error(`Failed to merge submissions: ${error.message}`);
    }
  }

  public static getFileSize(filePath: string): string {
    try {
      if (!fs.existsSync(filePath)) {
        return '0 MB';
      }
      
      const stats = fs.statSync(filePath);
      const fileSizeInBytes = stats.size;
      const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
      
      return `${fileSizeInMB.toFixed(2)} MB`;
    } catch (error) {
      console.error('Error getting file size:', error);
      return '0 MB';
    }
  }
}