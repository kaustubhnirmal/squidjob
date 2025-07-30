import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument, PDFImage, PDFPage, rgb } from 'pdf-lib';
import sharp from 'sharp';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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
  imageQuality: number;
  maxImageSize: number;
}

export class EnhancedPDFCompressionService {
  
  /**
   * Compress PDF with aggressive compression techniques
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
      
      let compressedBytes: Uint8Array;
      
      if (compressionType === 'extreme') {
        // Use aggressive compression for extreme mode
        compressedBytes = await this.extremeCompression(inputPath, options);
      } else {
        // Use standard compression for light/recommended
        compressedBytes = await this.standardCompression(inputPath, options);
      }
      
      // Write to output
      fs.writeFileSync(outputPath, compressedBytes);
      
      // Calculate results
      const compressedSizeKB = Math.round(compressedBytes.length / 1024);
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
          quality: 80,
          maxWidth: 1400,
          maxHeight: 1800,
          removeMetadata: false,
          optimizeImages: true,
          scaleContent: 0.95,
          imageQuality: 80,
          maxImageSize: 1200
        };
      
      case 'extreme':
        return {
          quality: 25,
          maxWidth: 600,
          maxHeight: 800,
          removeMetadata: true,
          optimizeImages: true,
          scaleContent: 0.7,
          imageQuality: 30,
          maxImageSize: 400
        };
      
      default: // recommended
        return {
          quality: 55,
          maxWidth: 1000,
          maxHeight: 1400,
          removeMetadata: true,
          optimizeImages: true,
          scaleContent: 0.85,
          imageQuality: 55,
          maxImageSize: 800
        };
    }
  }
  
  /**
   * Standard compression using pdf-lib with Ghostscript fallback
   */
  private static async standardCompression(inputPath: string, options: CompressionOptions): Promise<Uint8Array> {
    try {
      // Try Ghostscript first for better compression
      const tempCompressedPath = inputPath.replace('.pdf', '_temp_standard.pdf');
      
      try {
        let gsSettings = '/default';
        if (options.quality <= 30) {
          gsSettings = '/screen';
        } else if (options.quality <= 60) {
          gsSettings = '/ebook';
        } else {
          gsSettings = '/printer';
        }
        
        const gsCommand = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=${gsSettings} -dNOPAUSE -dQUIET -dBATCH -dDetectDuplicateImages -dCompressFonts=true -r150 -sOutputFile="${tempCompressedPath}" "${inputPath}"`;
        
        await execAsync(gsCommand);
        
        if (fs.existsSync(tempCompressedPath)) {
          const compressedBytes = fs.readFileSync(tempCompressedPath);
          fs.unlinkSync(tempCompressedPath);
          return compressedBytes;
        }
      } catch (gsError) {
        console.log('Ghostscript not available for standard compression, using pdf-lib');
      }
      
      // Fallback to pdf-lib
      const pdfBytes = fs.readFileSync(inputPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
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
      for (const page of pages) {
        await this.compressPage(page, options);
      }
      
      return await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        updateFieldAppearances: false,
        objectsPerTick: 50
      });
    } catch (error) {
      console.error('Standard compression failed:', error);
      throw error;
    }
  }
  
  /**
   * Extreme compression using multiple techniques
   */
  private static async extremeCompression(inputPath: string, options: CompressionOptions): Promise<Uint8Array> {
    try {
      // Try using Ghostscript for aggressive compression first
      const tempCompressedPath = inputPath.replace('.pdf', '_temp_compressed.pdf');
      
      try {
        // Use Ghostscript for aggressive PDF compression
        const gsCommand = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen -dNOPAUSE -dQUIET -dBATCH -dDetectDuplicateImages -dCompressFonts=true -r72 -sOutputFile="${tempCompressedPath}" "${inputPath}"`;
        
        await execAsync(gsCommand);
        
        // If Ghostscript succeeds, return the compressed file
        if (fs.existsSync(tempCompressedPath)) {
          const compressedBytes = fs.readFileSync(tempCompressedPath);
          fs.unlinkSync(tempCompressedPath); // Clean up temp file
          return compressedBytes;
        }
      } catch (gsError) {
        console.log('Ghostscript not available, using pdf-lib compression');
      }
      
      // Fallback to pdf-lib compression
      const pdfBytes = fs.readFileSync(inputPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      // Remove all metadata
      pdfDoc.setTitle('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setAuthor('');
      pdfDoc.setProducer('');
      pdfDoc.setCreator('');
      
      // Process pages with aggressive compression
      const pages = pdfDoc.getPages();
      for (const page of pages) {
        await this.extremeCompressPage(page, options);
      }
      
      // Save with maximum compression settings
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        updateFieldAppearances: false,
        objectsPerTick: 10
      });
      
      return compressedBytes;
    } catch (error) {
      console.error('Extreme compression failed:', error);
      throw error;
    }
  }
  
  /**
   * Compress individual page
   */
  private static async compressPage(page: PDFPage, options: CompressionOptions): Promise<void> {
    try {
      const { width, height } = page.getSize();
      
      // Scale content
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
   * Extreme compression for individual page
   */
  private static async extremeCompressPage(page: PDFPage, options: CompressionOptions): Promise<void> {
    try {
      const { width, height } = page.getSize();
      
      // Aggressive scaling
      page.scaleContent(options.scaleContent, options.scaleContent);
      
      // Aggressive page resizing
      const targetWidth = Math.min(width, options.maxWidth);
      const targetHeight = Math.min(height, options.maxHeight);
      
      if (width > targetWidth || height > targetHeight) {
        const scaleX = targetWidth / width;
        const scaleY = targetHeight / height;
        const scale = Math.min(scaleX, scaleY);
        
        page.scale(scale, scale);
      }
      
      // Set smaller page size
      page.setSize(targetWidth, targetHeight);
      
    } catch (error) {
      console.warn('Extreme page compression failed:', error);
    }
  }
  
  /**
   * Format file size for display
   */
  public static formatFileSize(sizeInKB: number): string {
    if (sizeInKB < 1024) {
      return `${sizeInKB.toFixed(0)} KB`;
    } else {
      const sizeInMB = sizeInKB / 1024;
      return `${sizeInMB.toFixed(2)} MB`;
    }
  }
  
  /**
   * Estimate compression ratio based on file size and type
   */
  public static estimateCompressionRatio(originalSizeKB: number, compressionType: string): number {
    const sizeMB = originalSizeKB / 1024;
    
    switch (compressionType) {
      case 'light':
        return sizeMB > 10 ? 15 : (sizeMB > 5 ? 10 : 5);
      case 'recommended':
        return sizeMB > 10 ? 35 : (sizeMB > 5 ? 25 : 15);
      case 'extreme':
        return sizeMB > 10 ? 60 : (sizeMB > 5 ? 45 : 30);
      default:
        return 20;
    }
  }
}