import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

interface CompressionResult {
  originalSizeKB: number;
  compressedSizeKB: number;
  compressionRatio: number;
  filePath: string;
}

export class FastPDFCompression {
  
  /**
   * Fast PDF compression with size-based targets
   */
  public static async compressPDF(
    inputPath: string, 
    outputPath: string
  ): Promise<CompressionResult> {
    const startTime = Date.now();
    
    try {
      // Read original file
      const originalBytes = fs.readFileSync(inputPath);
      const originalSizeKB = Math.round(originalBytes.length / 1024);
      const originalSizeMB = originalSizeKB / 1024;
      
      console.log(`Starting fast PDF compression: ${originalSizeMB.toFixed(2)}MB`);
      
      // Load PDF document
      const pdfDoc = await PDFDocument.load(originalBytes);
      
      // Apply compression based on file size
      await this.applyOptimization(pdfDoc, originalSizeMB);
      
      // Save with maximum compression
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        updateFieldAppearances: false
      });
      
      // Write compressed file
      fs.writeFileSync(outputPath, compressedBytes);
      
      const finalSizeKB = Math.round(compressedBytes.length / 1024);
      const compressionRatio = Math.round(((originalSizeKB - finalSizeKB) / originalSizeKB) * 100);
      
      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
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
   * Apply size-based optimization
   */
  private static async applyOptimization(pdfDoc: PDFDocument, originalSizeMB: number): Promise<void> {
    // Remove metadata to reduce size
    pdfDoc.setTitle('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setAuthor('');
    pdfDoc.setProducer('Fast PDF Compressor');
    pdfDoc.setCreator('Tender247');
    
    // For larger files, apply page scaling
    if (originalSizeMB > 5) {
      const pages = pdfDoc.getPages();
      
      // Scale down large pages to reduce file size
      for (const page of pages) {
        try {
          const { width, height } = page.getSize();
          
          // Scale down oversized pages
          if (width > 1200 || height > 1600) {
            const scaleX = width > 1200 ? 1200 / width : 1;
            const scaleY = height > 1600 ? 1600 / height : 1;
            const scale = Math.min(scaleX, scaleY, 0.8); // Max 80% of original
            
            page.scale(scale, scale);
          }
        } catch (error) {
          // Continue if page scaling fails
          console.warn('Page scaling failed:', error.message);
        }
      }
    }
  }
}