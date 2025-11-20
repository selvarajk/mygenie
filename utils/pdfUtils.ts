
import * as pdfjsLib from 'pdfjs-dist';

// Initialize worker using the specific version from importmap
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';

/**
 * Extracts text content from a PDF file client-side.
 * This replaces the "PyPDF server-side" component for the immediate prototype feedback loop.
 */
export const extractTextFromPdf = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Limit to first 10 pages to prevent browser freezing on massive docs
    const maxPages = Math.min(pdf.numPages, 10);
    
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }

    return fullText;
  } catch (error) {
    console.error("PDF Extraction failed:", error);
    throw new Error("Failed to parse PDF");
  }
};
