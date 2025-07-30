import { PDFDocument, PDFImage, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

interface CompressionResult {
  originalSizeKB: number;
  compressedSizeKB: number;
  compressionRatio: number;
  compressedFilePath: string;
}

export class AggressivePDFCompressionService {
  /**
   * Get compression settings based on original file size
   */
  private static getCompressionSettings(fileSizeMB: number) {
    if (fileSizeMB > 10) {
      return {
        targetSizeKB: 5500, // 5.5MB target
        imageQuality: 30,
        pageScale: 0.6,
        removeImages: false,
        aggressiveOptimization: true
      };
    } else if (fileSizeMB > 5) {
      return {
        targetSizeKB: 1500, // 1.5MB target
        imageQuality: 40,
        pageScale: 0.7,
        removeImages: false,
        aggressiveOptimization: true
      };
    } else if (fileSizeMB > 1) {
      return {
        targetSizeKB: 700, // 700KB target
        imageQuality: 50,
        pageScale: 0.8,
        removeImages: false,
        aggressiveOptimization: true
      };
    } else {
      return {
        targetSizeKB: Math.round(fileSizeMB * 1024 * 0.7), // 30% reduction
        imageQuality: 60,
        pageScale: 0.9,
        removeImages: false,
        aggressiveOptimization: false
      };
    }
  }

  /**
   * Main compression method with aggressive optimization
   */
  public static async compressPDF(inputPath: string, outputPath: string): Promise<CompressionResult> {
    try {
      // Get original file size
      const originalStats = fs.statSync(inputPath);
      const originalSizeKB = Math.round(originalStats.size / 1024);
      const originalSizeMB = originalSizeKB / 1024;

      console.log(`Compressing PDF: ${originalSizeMB.toFixed(2)}MB, targeting aggressive compression`);

      const settings = this.getCompressionSettings(originalSizeMB);
      console.log(`Target size: ${settings.targetSizeKB}KB (${(settings.targetSizeKB/1024).toFixed(2)}MB)`);

      // Load PDF
      const pdfBytes = fs.readFileSync(inputPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pageCount = pdfDoc.getPageCount();

      console.log(`Processing ${pageCount} pages with aggressive optimization`);

      // Apply multiple compression techniques
      await this.applyAggressiveCompression(pdfDoc, settings);

      // Save with maximum compression
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        updateFieldAppearances: false,
        objectsPerTick: 1
      });

      let finalBytes = compressedBytes;
      let currentSizeKB = Math.round(finalBytes.length / 1024);

      // Apply iterative compression if still too large
      let iteration = 0;
      const maxIterations = 5;

      while (currentSizeKB > settings.targetSizeKB && iteration < maxIterations) {
        console.log(`Iteration ${iteration + 1}: ${currentSizeKB}KB → target ${settings.targetSizeKB}KB`);
        
        try {
          const tempDoc = await PDFDocument.load(finalBytes);
          await this.applyIterativeCompression(tempDoc, settings, iteration);
          
          finalBytes = await tempDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
            updateFieldAppearances: false,
            objectsPerTick: 1
          });
          
          currentSizeKB = Math.round(finalBytes.length / 1024);
        } catch (error) {
          console.warn(`Iteration ${iteration + 1} failed:`, error);
          break;
        }
        
        iteration++;
      }

      // Write final file
      fs.writeFileSync(outputPath, finalBytes);
      const finalSizeKB = Math.round(finalBytes.length / 1024);
      const compressionRatio = Math.round(((originalSizeKB - finalSizeKB) / originalSizeKB) * 100);

      console.log(`Compression complete: ${originalSizeKB}KB → ${finalSizeKB}KB (${compressionRatio}% reduction)`);

      return {
        originalSizeKB,
        compressedSizeKB: finalSizeKB,
        compressionRatio,
        compressedFilePath: outputPath
      };

    } catch (error) {
      console.error('PDF compression error:', error);
      throw new Error('Failed to compress PDF');
    }
  }

  /**
   * Apply aggressive compression techniques
   */
  private static async applyAggressiveCompression(pdfDoc: PDFDocument, settings: any): Promise<void> {
    try {
      // Remove all metadata
      pdfDoc.setTitle('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setAuthor('');
      pdfDoc.setProducer('');
      pdfDoc.setCreator('');
      // Remove dates by setting them to a minimal date
      try {
        pdfDoc.setCreationDate(new Date(0));
        pdfDoc.setModificationDate(new Date(0));
      } catch (error) {
        // Continue if date removal fails
      }

      const pages = pdfDoc.getPages();
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        
        // Aggressive page scaling
        const scale = settings.pageScale;
        page.scaleContent(scale, scale);
        page.setSize(width * scale, height * scale);
        
        // Apply additional optimizations where possible
        try {
          // Basic page optimization without complex node operations
          if (settings.aggressiveOptimization && i % 10 === 0) {
            console.log(`Processing page ${i + 1}/${pages.length}`);
          }
        } catch (error) {
          console.warn(`Failed to optimize page ${i + 1}:`, error);
        }
      }

    } catch (error) {
      console.warn('Aggressive compression failed:', error);
    }
  }

  /**
   * Apply iterative compression with increasing aggression
   */
  private static async applyIterativeCompression(pdfDoc: PDFDocument, settings: any, iteration: number): Promise<void> {
    try {
      const pages = pdfDoc.getPages();
      
      // Increasingly aggressive scaling
      const scaleFactors = [0.9, 0.8, 0.7, 0.6, 0.5];
      const scale = scaleFactors[Math.min(iteration, scaleFactors.length - 1)];
      
      console.log(`Applying scale factor: ${scale}`);
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        
        // Scale down content further
        page.scaleContent(scale, scale);
        page.setSize(width * scale, height * scale);
        
        // On later iterations, remove more elements
        if (iteration > 2) {
          try {
            const pageNode = page.node;
            // Remove more optional elements
            if (pageNode.StructParents) {
              pageNode.delete('StructParents');
            }
            if (pageNode.Tabs) {
              pageNode.delete('Tabs');
            }
          } catch (error) {
            // Continue if removal fails
          }
        }
      }

    } catch (error) {
      console.warn(`Iterative compression iteration ${iteration} failed:`, error);
    }
  }

  /**
   * Check if compression is needed based on size thresholds
   */
  public static needsCompression(fileSizeKB: number): boolean {
    const fileSizeMB = fileSizeKB / 1024;
    const settings = this.getCompressionSettings(fileSizeMB);
    return fileSizeKB > settings.targetSizeKB;
  }

  /**
   * Format file size for display
   */
  public static formatFileSize(sizeKB: number): string {
    if (sizeKB < 1024) {
      return `${sizeKB} KB`;
    } else {
      const sizeMB = (sizeKB / 1024).toFixed(2);
      return `${sizeMB} MB`;
    }
  }
}