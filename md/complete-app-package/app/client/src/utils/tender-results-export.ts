import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import squidJobLogo from '@assets/SquidJob sml_1752393996294.png';

export interface TenderResultExport {
  id: number;
  referenceNo: string;
  title: string;
  authority: string;
  location: string;
  deadline: string;
  emdAmount: string;
  status: string;
  createdAt: string;
  publishedDate?: string;
  bidStartDate?: string;
  dueDate?: string;
  estimatedValue?: string;
  assignedUsers?: Array<{ name: string }>;
  raNo?: string;
  l1Winner?: {
    participantName: string;
    bidAmount: string;
    bidderStatus: string;
  };
  participants?: Array<{
    participantName: string;
    bidAmount: string;
    bidderStatus: string;
    status: string;
    startAmount?: string;
    endAmount?: string;
    location?: string;
    representative?: string;
    contact?: string;
  }>;
  tabName: string;
}

// Helper function to format date
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'NA';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return 'NA';
  }
};

// Helper function to calculate days left
const getDaysLeft = (deadline: string): string => {
  if (!deadline) return 'NA';
  try {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays.toString();
  } catch (error) {
    return 'NA';
  }
};

// Export tender results to Excel
export const exportTenderResultsToExcel = (tenders: TenderResultExport[], filename: string = 'tender-results.xlsx') => {
  const exportData = tenders.map((tender, index) => ({
    'S.No.': index + 1,
    'Tab Name': tender.tabName,
    'Days Left': getDaysLeft(tender.deadline),
    'Tender ID': tender.referenceNo?.substring(tender.referenceNo.length - 7) || 'NA',
    'Tender Status': tender.status || 'NA',
    'Assigned To': tender.assignedUsers && tender.assignedUsers.length > 0 
      ? tender.assignedUsers.map(user => user.name.split(' ')[0]).join(', ')
      : 'NA',
    'Tender Authority': tender.authority || 'NA',
    'Estimate Value': tender.estimatedValue ? tender.estimatedValue.toLocaleString() : '0',
    'EMD Amount': tender.emdAmount ? tender.emdAmount.toLocaleString() : '0',
    'Published Date': formatDate(tender.publishedDate || tender.createdAt),
    'Bid Start Date': formatDate(tender.bidStartDate),
    'Due Date': formatDate(tender.dueDate || tender.deadline),
    'Location': tender.location || 'NA',
    'RA No': tender.raNo || 'NA',
    'L1 Bidder': tender.l1Winner?.participantName || 'NA',
    'L1 Amount': tender.l1Winner?.bidAmount ? tender.l1Winner.bidAmount.toLocaleString() : '0'
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tender Results');

  // Auto-width columns
  const colWidths = Object.keys(exportData[0] || {}).map(key => ({
    wch: Math.max(key.length, 15)
  }));
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, filename);
};

// Export tender results to PDF with horizontal layout
export const exportTenderResultsToPDF = (tenders: TenderResultExport[], filename: string = 'tender-results.pdf') => {
  const doc = new jsPDF('p', 'mm', 'a4'); // Portrait orientation
  
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const marginLeft = 14;
  const marginRight = 14;
  const marginTop = 25;
  const marginBottom = 25;
  
  // Add title, logo, and pagination to each page
  const addPageElements = (pageNumber: number, totalPages: number) => {
    // Add title on top left in bold grey
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(128, 128, 128); // Light grey color
    doc.text('Tender Results', marginLeft, 15);
    
    // Add copyright message at bottom center
    doc.setFontSize(6);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    const copyrightText = 'Copyright squidjob.com. All rights reserved 2025.';
    const copyrightWidth = doc.getTextWidth(copyrightText);
    const copyrightX = (pageWidth - copyrightWidth) / 2;
    doc.text(copyrightText, copyrightX, pageHeight - 5);
    
    // Add page numbers at bottom left
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Page ${pageNumber} of ${totalPages}`, marginLeft, pageHeight - 10);
  };
  
  // Process each tender with horizontal layout
  let currentY = marginTop;
  let currentPage = 1;
  
  tenders.forEach((tender, index) => {
    const assignedNames = tender.assignedUsers && tender.assignedUsers.length > 0 
      ? tender.assignedUsers.map(user => user.name.split(' ')[0]).join(', ')
      : 'NA';
    
    // Calculate space needed for this tender
    const headerHeight = 8;
    const detailsTableHeight = 30; // 5 rows × 6mm each (table format)
    const participantsTableHeight = tender.participants && tender.participants.length > 0 
      ? (tender.participants.length * 5) + 15 : 15; // Header + rows
    const separatorHeight = 5;
    const totalTenderHeight = headerHeight + detailsTableHeight + participantsTableHeight + separatorHeight;
    
    // Check if tender fits on current page
    if (currentY + totalTenderHeight > pageHeight - marginBottom) {
      doc.addPage();
      currentPage++;
      currentY = marginTop;
    }
    
    // Add tender header with complete tender ID and RA No if available
    doc.setFontSize(10);
    doc.setTextColor(124, 58, 237); // Purple color
    doc.setFont('helvetica', 'bold');
    
    const tenderHeaderText = `Tender ${index + 1}: ${tender.referenceNo || 'NA'}`;
    doc.text(tenderHeaderText, marginLeft, currentY);
    
    // Add RA No in red color if available
    if (tender.raNo && tender.raNo !== 'NA') {
      const tenderHeaderWidth = doc.getTextWidth(tenderHeaderText);
      doc.setTextColor(255, 0, 0); // Red color
      doc.text(` | RA No: ${tender.raNo}`, marginLeft + tenderHeaderWidth, currentY);
    }
    
    currentY += headerHeight;
    
    // Add tender details table with borders
    const tenderDetailsData = [
      [`S.No: ${index + 1}`, `Tab Name: ${tender.tabName || 'Fresh Results'}`, `Days Left: ${getDaysLeft(tender.deadline)}`, `Status: ${tender.status || 'NA'}`],
      [`Assigned To: ${assignedNames}`, `Authority: ${tender.authority || 'NA'}`, '', ''],
      [`Estimate Value: ${tender.estimatedValue ? tender.estimatedValue.toString() : '0'}`, `EMD Amount: ${tender.emdAmount ? tender.emdAmount.toString() : '0'}`, '', ''],
      [`Published Date: ${formatDate(tender.publishedDate || tender.createdAt)}`, `Bid Start Date: ${formatDate(tender.bidStartDate)}`, `Due Date: ${formatDate(tender.dueDate || tender.deadline)}`, ''],
      [`Location: ${tender.location || 'NA'}`, `L1 Bidder: ${tender.l1Winner?.participantName || 'NA'}`, `L1 Amount: ${tender.l1Winner?.bidAmount ? tender.l1Winner.bidAmount.toString() : '0'}`, '']
    ];
    
    autoTable(doc, {
      body: tenderDetailsData,
      startY: currentY,
      styles: {
        fontSize: 7,
        cellPadding: 2,
        overflow: 'linebreak',
        halign: 'left',
        valign: 'middle',
        lineColor: [200, 200, 200],
        lineWidth: 0.3
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 50 },
        2: { cellWidth: 50 },
        3: { cellWidth: 30 }
      },
      margin: { 
        left: marginLeft,
        right: marginRight
      },
      tableWidth: 180,
      theme: 'grid',
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 5;
    
    // Add participants table if available
    if (tender.participants && tender.participants.length > 0) {
      const participantsData = tender.participants.map(p => [
        p.participantName || 'NA',
        p.bidderStatus || p.status || 'NA',
        p.startAmount?.toString() || '0',
        p.endAmount?.toString() || '0'
      ]);
      
      autoTable(doc, {
        head: [['Participant Name', 'Status', 'Start Amount', 'End Amount']],
        body: participantsData,
        startY: currentY,
        styles: {
          fontSize: 7,
          cellPadding: 1,
          overflow: 'linebreak',
          halign: 'left',
          valign: 'middle',
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [124, 58, 237],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 7,
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 40, halign: 'right', overflow: 'visible' },
          3: { cellWidth: 40, halign: 'right', overflow: 'visible' }
        },
        margin: { 
          left: marginLeft,
          right: marginRight
        },
        tableWidth: 170,
        theme: 'grid',
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        }
      });
      
      currentY = (doc as any).lastAutoTable.finalY + 5;
    } else {
      // Add "No participants" message
      doc.setFontSize(7);
      doc.setTextColor(128, 128, 128);
      doc.text('No participants available', marginLeft, currentY);
      currentY += 10;
    }
    
    // Add separator line
    doc.setLineWidth(0.2);
    doc.setDrawColor(200, 200, 200);
    doc.line(marginLeft, currentY, pageWidth - marginRight, currentY);
    currentY += separatorHeight;
  });
  
  // Add page elements to all pages after content is complete
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addPageElements(i, totalPages);
  }

  // Save the PDF
  doc.save(filename);
};