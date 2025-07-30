import * as XLSX from 'xlsx';

export interface TenderExportData {
  id: number;
  referenceNo?: string;
  title?: string;
  authority?: string;
  location?: string;
  deadline: string;
  emdAmount?: number;
  estimatedValue?: number;
  status: string;
  publishedDate?: string;
  bidStartDate?: string;
  dueDate?: string;
  tabName?: string;
  assignedUsers?: Array<{
    id: number;
    name: string;
  }>;
  raNo?: string;
  l1Bidder?: string;
  l1Amount?: number;
}

export function calculateDaysLeft(deadline: string): string {
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const timeDiff = deadlineDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  if (daysLeft < 0) {
    return `${Math.abs(daysLeft)} days ago`;
  }
  return `${daysLeft} days`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'NA';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'NA';
  
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function exportTendersToExcel(tenders: TenderExportData[], filename: string = 'tenders-export.xlsx') {
  // Remove duplicates based on tender ID
  const uniqueTenders = tenders.filter((tender, index, self) => 
    index === self.findIndex(t => t.id === tender.id)
  );

  // Prepare data for Excel
  const excelData = uniqueTenders.map((tender, index) => ({
    'S.No.': index + 1,
    'Tab Name': tender.tabName || 'NA',
    'Days Left': calculateDaysLeft(tender.deadline),
    'Tender ID': tender.referenceNo || 'NA',
    'Tender Status': tender.status || 'NA',
    'Assigned To': tender.assignedUsers && tender.assignedUsers.length > 0 
      ? tender.assignedUsers.map(user => user.name.split(' ')[0]).join(', ')
      : 'NA',
    'Tender Authority': tender.authority || 'NA',
    'Estimate Value': tender.estimatedValue ? `₹${tender.estimatedValue.toLocaleString()}` : '0',
    'EMD Amount': tender.emdAmount ? `₹${tender.emdAmount.toLocaleString()}` : '0',
    'Published Date': formatDate(tender.publishedDate),
    'Bid Start Date': formatDate(tender.bidStartDate),
    'Due Date': formatDate(tender.deadline),
    'Location': tender.location || 'NA',
    'RA No': tender.raNo || 'NA',
    'L1 Bidder': tender.l1Bidder || 'NA',
    'L1 Amount': tender.l1Amount ? `₹${tender.l1Amount.toLocaleString()}` : '0'
  }));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const colWidths = [
    { wch: 8 },   // S.No.
    { wch: 12 },  // Tab Name
    { wch: 12 },  // Days Left
    { wch: 20 },  // Tender ID
    { wch: 15 },  // Tender Status
    { wch: 20 },  // Assigned To
    { wch: 25 },  // Tender Authority
    { wch: 15 },  // Estimate Value
    { wch: 15 },  // EMD Amount
    { wch: 15 },  // Published Date
    { wch: 15 },  // Bid Start Date
    { wch: 15 },  // Due Date
    { wch: 20 },  // Location
    { wch: 12 },  // RA No
    { wch: 20 },  // L1 Bidder
    { wch: 15 }   // L1 Amount
  ];

  worksheet['!cols'] = colWidths;

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tenders');

  // Save the file
  XLSX.writeFile(workbook, filename);
}