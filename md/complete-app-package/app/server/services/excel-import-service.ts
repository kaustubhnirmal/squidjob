import fs from 'fs';
import { promisify } from 'util';
import path from 'path';
import { parse as parseCsv } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
import { TenderData } from '@shared/types';

const readFile = promisify(fs.readFile);

export class ExcelImportService {
  /**
   * Process Excel or CSV file and extract tender data
   * @param filePath Path to the uploaded file
   * @returns Extracted tender data array
   */
  static async processTenderFile(filePath: string): Promise<TenderData[]> {
    try {
      const fileExt = path.extname(filePath).toLowerCase();
      
      if (fileExt === '.csv') {
        return await this.processCsvFile(filePath);
      } else if (fileExt === '.xlsx' || fileExt === '.xls') {
        return await this.processExcelFile(filePath);
      } else {
        throw new Error(`Unsupported file format: ${fileExt}`);
      }
    } catch (error: any) {
      console.error(`Error processing tender file: ${filePath}`, error);
      throw new Error(`Failed to process file: ${error.message}`);
    }
  }

  /**
   * Process a CSV file and extract tender data
   * @param filePath Path to the CSV file
   * @returns Extracted tender data array
   */
  private static async processCsvFile(filePath: string): Promise<TenderData[]> {
    try {
      const fileContent = await readFile(filePath, 'utf8');
      const records = parseCsv(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
      
      return this.validateAndTransformData(records);
    } catch (error: any) {
      console.error(`Error processing CSV file: ${filePath}`, error);
      throw new Error(`Failed to process CSV file: ${error.message}`);
    }
  }

  /**
   * Process an Excel file and extract tender data
   * @param filePath Path to the Excel file
   * @returns Extracted tender data array
   */
  private static async processExcelFile(filePath: string): Promise<TenderData[]> {
    try {
      const fileBuffer = await readFile(filePath);
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      
      // Get the first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert sheet to JSON
      const records = XLSX.utils.sheet_to_json(worksheet);
      
      return this.validateAndTransformData(records);
    } catch (error: any) {
      console.error(`Error processing Excel file: ${filePath}`, error);
      throw new Error(`Failed to process Excel file: ${error.message}`);
    }
  }

  /**
   * Validate and transform extracted data to match TenderData format
   * @param records Raw data from Excel/CSV file
   * @returns Validated tender data array
   */
  private static validateAndTransformData(records: any[]): TenderData[] {
    if (!records || records.length === 0) {
      throw new Error('No data found in the file or file is empty');
    }

    // Define required fields for a valid tender
    const requiredFields = [
      'Bid Number',
      'Dated',
      'Bid End Date/Time',
      'Bid Opening Date/Time'
    ];

    return records.map((record, index) => {
      // Check for required fields
      for (const field of requiredFields) {
        if (!record[field]) {
          throw new Error(`Row ${index + 1}: Missing required field "${field}"`);
        }
      }

      // Format the data according to TenderData interface
      const tenderData: TenderData = {
        "Bid Number": String(record['Bid Number'] || ''),
        "Dated": String(record['Dated'] || ''),
        "Bid End Date/Time": String(record['Bid End Date/Time'] || ''),
        "Bid Opening Date/Time": String(record['Bid Opening Date/Time'] || ''),
        "Bid Offer Validity (From End Date)": String(record['Bid Offer Validity (From End Date)'] || ''),
        "Ministry/State Name": String(record['Ministry/State Name'] || ''),
        "Department Name": String(record['Department Name'] || ''),
        "Organisation Name": String(record['Organisation Name'] || ''),
        "Office Name": String(record['Office Name'] || ''),
        "Buyer Email": String(record['Buyer Email'] || ''),
        "Total Quantity": String(record['Total Quantity'] || ''),
        "BOQ Title": String(record['BOQ Title'] || ''),
        "MSE Exemption for Years of Experience and Turnover": String(record['MSE Exemption for Years of Experience and Turnover'] || 'No'),
        "EMD Amount": String(record['EMD Amount'] || '0'),
        "ePBG Detail: Required": String(record['ePBG Detail: Required'] || 'No')
      };

      return tenderData;
    });
  }
}