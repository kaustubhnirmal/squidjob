import fs from 'fs';
import path from 'path';
import { extractTextFromPdf, extractInfoFromText } from './pdf-parser';
import { ExcelImportService } from './excel-import-service';
import { TenderData } from '@shared/types';

/**
 * Service for handling various import methods for tender data
 */
export class ImportService {
  /**
   * Process uploaded PDF files and extract tender data
   * @param filePaths Array of file paths to process
   * @returns Array of extracted tender data objects
   */
  static async processPdfFiles(filePaths: string[]): Promise<TenderData[]> {
    try {
      const tenderDataArray: TenderData[] = [];
      
      for (const filePath of filePaths) {
        console.log(`Processing PDF: ${path.basename(filePath)}`);
        
        // Extract text from PDF
        const extractedText = await extractTextFromPdf(filePath);
        
        // Process extracted text to get structured data
        if (extractedText.trim()) {
          const tenderData = extractInfoFromText(extractedText);
          tenderDataArray.push(tenderData);
        }
      }
      
      return tenderDataArray;
    } catch (error) {
      console.error('Error processing PDF files:', error);
      throw new Error('Failed to process PDF files');
    }
  }
  
  /**
   * Process uploaded Excel/CSV files and extract tender data
   * @param filePaths Array of file paths to process
   * @returns Array of extracted tender data objects
   */
  static async processExcelFiles(filePaths: string[]): Promise<TenderData[]> {
    try {
      const tenderDataArray: TenderData[] = [];
      
      for (const filePath of filePaths) {
        console.log(`Processing Excel/CSV: ${path.basename(filePath)}`);
        
        // Use ExcelImportService to process the file
        const extractedData = await ExcelImportService.processTenderFile(filePath);
        tenderDataArray.push(...extractedData);
      }
      
      return tenderDataArray;
    } catch (error) {
      console.error('Error processing Excel/CSV files:', error);
      throw new Error('Failed to process Excel/CSV files');
    }
  }
  
  /**
   * Clean up temporary uploaded files
   * @param filePaths Array of file paths to clean up
   */
  static cleanupFiles(filePaths: string[]): void {
    for (const filePath of filePaths) {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error(`Error cleaning up file ${filePath}:`, error);
      }
    }
  }
}