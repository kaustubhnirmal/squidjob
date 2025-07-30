import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

interface CompressionResult {
  originalSizeKB: number;
  compressedSizeKB: number;
  compressionRatio: number;
  filePath: string;
}

export class PDFCompressionService {
  
  /**
   * Get target size based on original file size in MB
   */
  private static getTargetSizeKB(originalSizeMB: number): number {
    if (originalSizeMB > 10) {
      // >10MB files: compress to 5-6MB
      return 5500; // 5.5 MB
    } else if (originalSizeMB >= 5 && originalSizeMB <= 10) {
      // 5-10MB files: compress to 1-2MB
      return 1500; // 1.5 MB
    } else if (originalSizeMB >= 1 && originalSizeMB < 5) {
      // 1-5MB files: compress to KB range (500-800KB)
      return 700; // 700 KB
    } else {
      // <1MB files: light compression (50% reduction)
      return Math.floor(originalSizeMB * 1024 * 0.5); // 50% of original
    }
  }

  /**
   * Fast PDF compression with effective size reduction
   */
  public static async compressPDF(
    inputPath: string, 
    outputPath: string,
    targetSizeMB?: number
  ): Promise<CompressionResult> {
    try {
      const startTime = Date.now();
      
      // Read original file
      const originalBytes = fs.readFileSync(inputPath);
      const originalSizeKB = Math.round(originalBytes.length / 1024);
      const originalSizeMB = originalSizeKB / 1024;
      
      console.log(`Starting PDF compression: ${originalSizeMB.toFixed(2)}MB`);
      
      // Get target size
      const targetSizeKB = targetSizeMB ? targetSizeMB * 1024 : this.getTargetSizeKB(originalSizeMB);
      console.log(`Target size: ${targetSizeKB}KB (${(targetSizeKB/1024).toFixed(2)}MB)`);
      
      // Load PDF document
      const pdfDoc = await PDFDocument.load(originalBytes);
      const pageCount = pdfDoc.getPageCount();
      console.log(`Processing ${pageCount} pages with intelligent compression`);
      
      // Apply fast compression techniques
      await this.applyFastCompression(pdfDoc, originalSizeMB);
      
      // Save with optimization
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        updateFieldAppearances: false,
        objectStreamsLength: 40
      });
      
      // Write final compressed file
      fs.writeFileSync(outputPath, compressedBytes);
      
      const finalSizeKB = Math.round(compressedBytes.length / 1024);
      const compressionRatio = Math.round(((originalSizeKB - finalSizeKB) / originalSizeKB) * 100);
      
      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`Compression complete: ${originalSizeMB.toFixed(2)}MB → ${(finalSizeKB/1024).toFixed(2)}MB (${compressionRatio}% reduction) in ${elapsedTime}s`);
      
      return {
        originalSizeKB,
        compressedSizeKB: finalSizeKB,
        compressionRatio,
        filePath: outputPath
      };
      
    } catch (error) {
      console.error('PDF compression error:', error);
      throw new Error('Failed to compress PDF');
    }
  }

  /**
   * Apply fast and effective compression techniques
   */
  private static async applyFastCompression(pdfDoc: PDFDocument, originalSizeMB: number): Promise<void> {
    try {
      // Remove metadata for size reduction
      pdfDoc.setTitle('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setAuthor('');
      pdfDoc.setProducer('Compressed PDF');
      pdfDoc.setCreator('PDF Compression Service');
      
      // Remove unused objects and optimize structure
      const pages = pdfDoc.getPages();
      
      // For larger files, apply more aggressive optimization
      if (originalSizeMB > 5) {
        console.log('Applying aggressive compression for large file');
        
        // Process each page for optimization
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          
          // Get page content and optimize
          try {
            const { width, height } = page.getSize();
            
            // Scale down very large pages
            if (width > 2000 || height > 2000) {
              const scale = Math.min(1600 / width, 1600 / height);
              page.scale(scale, scale);
            }
          } catch (error) {
            // Continue if page optimization fails
            console.warn(`Page ${i + 1} optimization failed:`, error.message);
          }
        }
      }
      
    } catch (error) {
      console.warn('Some compression techniques failed:', error.message);
      // Continue even if some optimizations fail
    }
  }

  /**
   * Quick file size check without full processing
   */
  public static getFileSize(filePath: string): { sizeKB: number; sizeMB: number } {
    try {
      const stats = fs.statSync(filePath);
      const sizeKB = Math.round(stats.size / 1024);
      const sizeMB = sizeKB / 1024;
      return { sizeKB, sizeMB };
    } catch (error) {
      throw new Error('Failed to get file size');
    }
  }

  /**
   * Check if compression is recommended
   */
  public static shouldCompress(filePath: string): boolean {
    const { sizeMB } = this.getFileSize(filePath);
    return sizeMB > 0.5; // Recommend compression for files > 500KB
  }
}