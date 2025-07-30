import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument, PDFPage, rgb } from 'pdf-lib';
import sharp from 'sharp';

export interface CompressionResult {
  originalSizeKB: number;
  compressedSizeKB: number;
  compressionRatio: number;
  compressedFilePath: string;
  processingTime: number;
}

export interface CompressionOptions {
  quality: number;
  maxWidth: number;
  maxHeight: number;
  removeMetadata: boolean;
  optimizeImages: boolean;
  scaleContent: number;
}

export class AdvancedPDFCompressionService {
  
  /**
   * Compress PDF with different compression levels
   */
  public static async compressPDF(
    inputPath: string,
    outputPath: string,
    compressionType: 'light' | 'recommended' | 'extreme' = 'recommended'
  ): Promise<CompressionResult> {
    const startTime = Date.now();
    
    try {
      // Get original file size
      const originalStats = fs.statSync(inputPath);
      const originalSizeKB = Math.round(originalStats.size / 1024);
      const originalSizeMB = originalSizeKB / 1024;
      
      console.log(`Starting ${compressionType} compression: ${originalSizeMB.toFixed(2)}MB`);
      
      // Get compression options based on type
      const options = this.getCompressionOptions(compressionType);
      
      // Load PDF
      const pdfBytes = fs.readFileSync(inputPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      // Apply compression techniques
      await this.applyCompression(pdfDoc, options);
      
      // Save compressed PDF
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        updateFieldAppearances: false
      });
      
      // For extreme compression, apply additional processing
      let finalBytes = compressedBytes;
      if (compressionType === 'extreme') {
        finalBytes = await this.applyExtremeCompression(compressedBytes, options);
      }
      
      // Write to output
      fs.writeFileSync(outputPath, finalBytes);
      
      // Calculate results
      const compressedSizeKB = Math.round(finalBytes.length / 1024);
      const compressionRatio = Math.round(((originalSizeKB - compressedSizeKB) / originalSizeKB) * 100);
      const processingTime = (Date.now() - startTime) / 1000;
      
      console.log(`Compression complete: ${originalSizeKB}KB → ${compressedSizeKB}KB (${compressionRatio}% reduction) in ${processingTime.toFixed(2)}s`);
      
      return {
        originalSizeKB,
        compressedSizeKB,
        compressionRatio,
        compressedFilePath: outputPath,
        processingTime
      };
      
    } catch (error) {
      console.error('PDF compression error:', error);
      throw new Error(`Failed to compress PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get compression options based on compression type
   */
  private static getCompressionOptions(compressionType: string): CompressionOptions {
    switch (compressionType) {
      case 'light':
        return {
          quality: 0.85,
          maxWidth: 1400,
          maxHeight: 1800,
          removeMetadata: false,
          optimizeImages: true,
          scaleContent: 0.98
        };
      
      case 'extreme':
        return {
          quality: 0.4,
          maxWidth: 800,
          maxHeight: 1000,
          removeMetadata: true,
          optimizeImages: true,
          scaleContent: 0.85
        };
      
      default: // recommended
        return {
          quality: 0.65,
          maxWidth: 1000,
          maxHeight: 1400,
          removeMetadata: true,
          optimizeImages: true,
          scaleContent: 0.92
        };
    }
  }
  
  /**
   * Apply compression techniques to PDF
   */
  private static async applyCompression(pdfDoc: PDFDocument, options: CompressionOptions): Promise<void> {
    try {
      // Remove metadata if requested
      if (options.removeMetadata) {
        pdfDoc.setTitle('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setAuthor('');
        pdfDoc.setProducer('');
        pdfDoc.setCreator('');
      }
      
      // Process pages
      const pages = pdfDoc.getPages();
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        await this.compressPage(page, options);
      }
      
    } catch (error) {
      console.warn('Some compression techniques failed:', error);
    }
  }
  
  /**
   * Compress individual page
   */
  private static async compressPage(page: PDFPage, options: CompressionOptions): Promise<void> {
    try {
      const { width, height } = page.getSize();
      
      // Scale content if needed
      if (options.scaleContent < 1) {
        page.scaleContent(options.scaleContent, options.scaleContent);
      }
      
      // Resize page if too large
      if (width > options.maxWidth || height > options.maxHeight) {
        const scaleX = Math.min(1, options.maxWidth / width);
        const scaleY = Math.min(1, options.maxHeight / height);
        const scale = Math.min(scaleX, scaleY);
        
        page.scale(scale, scale);
      }
      
    } catch (error) {
      console.warn('Page compression failed:', error);
    }
  }
  
  /**
   * Apply extreme compression by reprocessing the PDF
   */
  private static async applyExtremeCompression(pdfBytes: Uint8Array, options: CompressionOptions): Promise<Uint8Array> {
    try {
      // Reload and reprocess for extreme compression
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      
      // Apply more aggressive scaling for extreme compression
      for (const page of pages) {
        const { width, height } = page.getSize();
        
        // More aggressive scaling
        page.scaleContent(0.75, 0.75);
        
        // Reduce page size more aggressively
        const newWidth = Math.min(width * 0.8, 600);
        const newHeight = Math.min(height * 0.8, 800);
        page.setSize(newWidth, newHeight);
      }
      
      // Save with maximum compression
      return await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        updateFieldAppearances: false,
        objectsPerTick: 1
      });
      
    } catch (error) {
      console.warn('Extreme compression failed:', error);
      return pdfBytes;
    }
  }
  
  /**
   * Format file size for display
   */
  public static formatFileSize(sizeKB: number): string {
    if (sizeKB < 1024) {
      return `${sizeKB} KB`;
    } else {
      return `${(sizeKB / 1024).toFixed(2)} MB`;
    }
  }
}