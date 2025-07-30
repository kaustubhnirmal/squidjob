import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument } from 'pdf-lib';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface CompressionResult {
  originalSizeKB: number;
  compressedSizeKB: number;
  compressionRatio: number;
  compressedFilePath: string;
  processingTime: number;
  method: 'ghostscript' | 'pdf-lib' | 'hybrid';
}

export interface CompressionOptions {
  quality: number;
  scaleContent: number;
  removeMetadata: boolean;
  maxWidth: number;
  maxHeight: number;
}

export class UniversalPDFCompressionService {
  
  /**
   * Check if Ghostscript is available on the system
   */
  private static async isGhostscriptAvailable(): Promise<boolean> {
    try {
      await execAsync('gs --version');
      return true;
    } catch (error) {
      console.log('Ghostscript not available on this system');
      return false;
    }
  }
  
  /**
   * Compress PDF using the best available method
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
      
      let compressedBytes: Uint8Array;
      let method: 'ghostscript' | 'pdf-lib' | 'hybrid' = 'pdf-lib';
      
      // Check if Ghostscript is available
      const hasGhostscript = await this.isGhostscriptAvailable();
      
      if (hasGhostscript) {
        try {
          // Use Ghostscript for better compression
          compressedBytes = await this.ghostscriptCompression(inputPath, outputPath, compressionType);
          method = 'ghostscript';
        } catch (gsError) {
          console.log('Ghostscript compression failed, falling back to pdf-lib');
          compressedBytes = await this.pdfLibCompression(inputPath, compressionType);
          method = 'pdf-lib';
        }
      } else {
        // Use enhanced pdf-lib compression
        compressedBytes = await this.pdfLibCompression(inputPath, compressionType);
        method = 'pdf-lib';
      }
      
      // Write compressed file
      fs.writeFileSync(outputPath, compressedBytes);
      
      // Calculate results
      const compressedSizeKB = Math.round(compressedBytes.length / 1024);
      const compressionRatio = Math.round(((originalSizeKB - compressedSizeKB) / originalSizeKB) * 100);
      const processingTime = (Date.now() - startTime) / 1000;
      
      console.log(`Compression complete (${method}): ${originalSizeKB}KB → ${compressedSizeKB}KB (${compressionRatio}% reduction) in ${processingTime.toFixed(2)}s`);
      
      return {
        originalSizeKB,
        compressedSizeKB,
        compressionRatio,
        compressedFilePath: outputPath,
        processingTime,
        method
      };
      
    } catch (error) {
      console.error('PDF compression error:', error);
      throw new Error(`Failed to compress PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Ghostscript compression (when available)
   */
  private static async ghostscriptCompression(
    inputPath: string,
    outputPath: string,
    compressionType: string
  ): Promise<Uint8Array> {
    let gsSettings = '/default';
    let dpi = '150';
    
    switch (compressionType) {
      case 'light':
        gsSettings = '/printer';
        dpi = '200';
        break;
      case 'recommended':
        gsSettings = '/ebook';
        dpi = '150';
        break;
      case 'extreme':
        gsSettings = '/screen';
        dpi = '72';
        break;
    }
    
    const gsCommand = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=${gsSettings} -dNOPAUSE -dQUIET -dBATCH -dDetectDuplicateImages -dCompressFonts=true -r${dpi} -sOutputFile="${outputPath}" "${inputPath}"`;
    
    await execAsync(gsCommand);
    
    if (fs.existsSync(outputPath)) {
      return fs.readFileSync(outputPath);
    } else {
      throw new Error('Ghostscript compression failed');
    }
  }
  
  /**
   * Enhanced pdf-lib compression (fallback method)
   */
  private static async pdfLibCompression(
    inputPath: string,
    compressionType: string
  ): Promise<Uint8Array> {
    const pdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    const options = this.getCompressionOptions(compressionType);
    
    // Remove metadata for better compression
    if (options.removeMetadata) {
      pdfDoc.setTitle('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setAuthor('');
      pdfDoc.setProducer('');
      pdfDoc.setCreator('');
    }
    
    // Process all pages
    const pages = pdfDoc.getPages();
    for (const page of pages) {
      await this.compressPage(page, options);
    }
    
    // Save with compression settings
    return await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      updateFieldAppearances: false,
      objectsPerTick: compressionType === 'extreme' ? 10 : 50
    });
  }
  
  /**
   * Get compression options based on type
   */
  private static getCompressionOptions(compressionType: string): CompressionOptions {
    switch (compressionType) {
      case 'light':
        return {
          quality: 80,
          scaleContent: 0.95,
          removeMetadata: false,
          maxWidth: 1400,
          maxHeight: 1800
        };
      case 'extreme':
        return {
          quality: 25,
          scaleContent: 0.7,
          removeMetadata: true,
          maxWidth: 600,
          maxHeight: 800
        };
      default: // recommended
        return {
          quality: 55,
          scaleContent: 0.85,
          removeMetadata: true,
          maxWidth: 1000,
          maxHeight: 1400
        };
    }
  }
  
  /**
   * Compress individual page
   */
  private static async compressPage(page: any, options: CompressionOptions): Promise<void> {
    try {
      const { width, height } = page.getSize();
      
      // Scale content down
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
   * Create a simple compressed version using basic techniques
   * This method provides consistent compression across environments
   */
  public static async createSimpleCompressedVersion(
    inputPath: string,
    outputPath: string,
    compressionLevel: number = 60
  ): Promise<CompressionResult> {
    const startTime = Date.now();
    
    try {
      const originalStats = fs.statSync(inputPath);
      const originalSizeKB = Math.round(originalStats.size / 1024);
      
      const pdfBytes = fs.readFileSync(inputPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      // Basic compression techniques
      pdfDoc.setTitle('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setAuthor('');
      pdfDoc.setProducer('');
      pdfDoc.setCreator('');
      
      // Scale content and pages
      const pages = pdfDoc.getPages();
      const scaleFactor = compressionLevel / 100;
      
      for (const page of pages) {
        try {
          page.scaleContent(scaleFactor, scaleFactor);
          
          const { width, height } = page.getSize();
          const maxDimension = 1200;
          
          if (width > maxDimension || height > maxDimension) {
            const scale = Math.min(maxDimension / width, maxDimension / height);
            page.scale(scale, scale);
          }
        } catch (pageError) {
          console.warn('Page processing error:', pageError);
        }
      }
      
      // Save with compression
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        updateFieldAppearances: false,
        objectsPerTick: 25
      });
      
      fs.writeFileSync(outputPath, compressedBytes);
      
      const compressedSizeKB = Math.round(compressedBytes.length / 1024);
      const compressionRatio = Math.round(((originalSizeKB - compressedSizeKB) / originalSizeKB) * 100);
      const processingTime = (Date.now() - startTime) / 1000;
      
      return {
        originalSizeKB,
        compressedSizeKB,
        compressionRatio,
        compressedFilePath: outputPath,
        processingTime,
        method: 'pdf-lib'
      };
      
    } catch (error) {
      console.error('Simple compression error:', error);
      throw error;
    }
  }
}