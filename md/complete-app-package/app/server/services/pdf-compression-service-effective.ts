import { PDFDocument, PDFName, PDFNumber, PDFDict, PDFArray, PDFRef } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

interface CompressionResult {
  originalSizeKB: number;
  compressedSizeKB: number;
  compressionRatio: number;
  compressedFilePath: string;
}

interface CompressionSettings {
  targetSizeKB: number;
  imageQuality: number;
  pageScale: number;
  removeMetadata: boolean;
  removeAnnotations: boolean;
  compressStreams: boolean;
}

export class EffectivePDFCompressionService {
  /**
   * Main compression method with intelligent size-based targeting
   */
  public static async compressPDF(inputPath: string, outputPath: string): Promise<CompressionResult> {
    try {
      // Get original file size
      const originalStats = fs.statSync(inputPath);
      const originalSizeKB = Math.round(originalStats.size / 1024);
      const originalSizeMB = originalSizeKB / 1024;

      console.log(`Starting PDF compression: ${originalSizeMB.toFixed(2)}MB`);

      // Get compression settings based on file size
      const settings = this.getCompressionSettings(originalSizeMB);
      console.log(`Target size: ${settings.targetSizeKB}KB (${(settings.targetSizeKB/1024).toFixed(2)}MB)`);

      // Load PDF
      const pdfBytes = fs.readFileSync(inputPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pageCount = pdfDoc.getPageCount();

      console.log(`Processing ${pageCount} pages with intelligent compression`);

      // Apply comprehensive compression
      await this.applyComprehensiveCompression(pdfDoc, settings);

      // Save with maximum compression settings
      let compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        updateFieldAppearances: false,
        objectsPerTick: 1
      });

      let currentSizeKB = Math.round(compressedBytes.length / 1024);
      let iteration = 0;
      const maxIterations = 8;

      // Iterative compression to reach target
      while (currentSizeKB > settings.targetSizeKB && iteration < maxIterations) {
        console.log(`Iteration ${iteration + 1}: ${currentSizeKB}KB → target ${settings.targetSizeKB}KB`);
        
        try {
          const tempDoc = await PDFDocument.load(compressedBytes);
          await this.applyProgressiveCompression(tempDoc, settings, iteration);
          
          compressedBytes = await tempDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
            updateFieldAppearances: false,
            objectsPerTick: 1
          });
          
          const newSizeKB = Math.round(compressedBytes.length / 1024);
          
          // If no improvement, try more aggressive scaling
          if (newSizeKB >= currentSizeKB) {
            const aggressiveDoc = await PDFDocument.load(compressedBytes);
            await this.applyAggressiveScaling(aggressiveDoc, 0.7 - (iteration * 0.05));
            compressedBytes = await aggressiveDoc.save({
              useObjectStreams: true,
              addDefaultPage: false,
              updateFieldAppearances: false,
              objectsPerTick: 1
            });
          }
          
          currentSizeKB = Math.round(compressedBytes.length / 1024);
        } catch (error) {
          console.warn(`Iteration ${iteration + 1} failed:`, error);
          break;
        }
        
        iteration++;
      }

      // Write final compressed file
      fs.writeFileSync(outputPath, compressedBytes);
      const finalSizeKB = Math.round(compressedBytes.length / 1024);
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
      throw new Error('Failed to compress PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Get compression settings based on original file size
   */
  private static getCompressionSettings(fileSizeMB: number): CompressionSettings {
    if (fileSizeMB > 10) {
      // Files > 10MB → target 5-6MB
      return {
        targetSizeKB: 5500, // 5.5MB
        imageQuality: 25,
        pageScale: 0.55,
        removeMetadata: true,
        removeAnnotations: true,
        compressStreams: true
      };
    } else if (fileSizeMB > 5) {
      // Files 5-10MB → target 1-2MB
      return {
        targetSizeKB: 1500, // 1.5MB
        imageQuality: 35,
        pageScale: 0.65,
        removeMetadata: true,
        removeAnnotations: true,
        compressStreams: true
      };
    } else if (fileSizeMB > 1) {
      // Files 1-5MB → target KB range
      return {
        targetSizeKB: 800, // 800KB
        imageQuality: 45,
        pageScale: 0.75,
        removeMetadata: true,
        removeAnnotations: true,
        compressStreams: true
      };
    } else {
      // Files < 1MB → 30% reduction
      return {
        targetSizeKB: Math.round(fileSizeMB * 1024 * 0.7),
        imageQuality: 60,
        pageScale: 0.85,
        removeMetadata: true,
        removeAnnotations: false,
        compressStreams: true
      };
    }
  }

  /**
   * Apply comprehensive compression techniques
   */
  private static async applyComprehensiveCompression(pdfDoc: PDFDocument, settings: CompressionSettings): Promise<void> {
    try {
      // Remove metadata
      if (settings.removeMetadata) {
        pdfDoc.setTitle('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setAuthor('');
        pdfDoc.setProducer('');
        pdfDoc.setCreator('');
        
        try {
          pdfDoc.setCreationDate(new Date(0));
          pdfDoc.setModificationDate(new Date(0));
        } catch (error) {
          // Continue if date removal fails
        }
      }

      const pages = pdfDoc.getPages();
      
      // Process each page
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        
        // Scale page content and size
        const scale = settings.pageScale;
        page.scaleContent(scale, scale);
        page.setSize(width * scale, height * scale);
        
        // Remove annotations if requested
        if (settings.removeAnnotations) {
          try {
            const pageNode = page.node;
            if (pageNode.has(PDFName.of('Annots'))) {
              pageNode.delete(PDFName.of('Annots'));
            }
          } catch (error) {
            // Continue if annotation removal fails
          }
        }
        
        // Remove optional content if present
        try {
          const pageNode = page.node;
          if (pageNode.has(PDFName.of('Group'))) {
            pageNode.delete(PDFName.of('Group'));
          }
          if (pageNode.has(PDFName.of('Tabs'))) {
            pageNode.delete(PDFName.of('Tabs'));
          }
        } catch (error) {
          // Continue if optional content removal fails
        }
      }

      // Clean up document-level optional content
      try {
        const docNode = pdfDoc.catalog;
        if (docNode.has(PDFName.of('OCProperties'))) {
          docNode.delete(PDFName.of('OCProperties'));
        }
        if (docNode.has(PDFName.of('Metadata'))) {
          docNode.delete(PDFName.of('Metadata'));
        }
      } catch (error) {
        // Continue if document cleanup fails
      }

    } catch (error) {
      console.warn('Comprehensive compression failed:', error);
    }
  }

  /**
   * Apply progressive compression based on iteration
   */
  private static async applyProgressiveCompression(pdfDoc: PDFDocument, settings: CompressionSettings, iteration: number): Promise<void> {
    try {
      const pages = pdfDoc.getPages();
      
      // Progressive scaling factors: each iteration gets more aggressive
      const scaleFactors = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.35, 0.3];
      const scaleFactor = scaleFactors[Math.min(iteration, scaleFactors.length - 1)];
      
      console.log(`Applying scale factor: ${scaleFactor}`);
      
      for (const page of pages) {
        const { width, height } = page.getSize();
        
        // Apply progressive scaling
        page.scaleContent(scaleFactor, scaleFactor);
        page.setSize(width * scaleFactor, height * scaleFactor);
        
        // Remove additional elements on later iterations
        if (iteration > 2) {
          try {
            const pageNode = page.node;
            
            // Remove structural elements
            if (pageNode.has(PDFName.of('StructParents'))) {
              pageNode.delete(PDFName.of('StructParents'));
            }
            if (pageNode.has(PDFName.of('Tabs'))) {
              pageNode.delete(PDFName.of('Tabs'));
            }
            if (pageNode.has(PDFName.of('B'))) {
              pageNode.delete(PDFName.of('B'));
            }
          } catch (error) {
            // Continue if element removal fails
          }
        }
      }
      
    } catch (error) {
      console.warn('Progressive compression failed:', error);
    }
  }

  /**
   * Apply aggressive scaling as a last resort
   */
  private static async applyAggressiveScaling(pdfDoc: PDFDocument, scaleFactor: number): Promise<void> {
    try {
      const pages = pdfDoc.getPages();
      
      for (const page of pages) {
        const { width, height } = page.getSize();
        page.scaleContent(scaleFactor, scaleFactor);
        page.setSize(width * scaleFactor, height * scaleFactor);
      }
      
    } catch (error) {
      console.warn('Aggressive scaling failed:', error);
    }
  }

  /**
   * Format file size for display
   */
  public static formatFileSize(sizeKB: number): string {
    if (sizeKB >= 1024) {
      return `${(sizeKB / 1024).toFixed(2)}MB`;
    } else {
      return `${sizeKB}KB`;
    }
  }
}