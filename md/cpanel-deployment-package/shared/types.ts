/**
 * Interface for tender data extracted from PDF, Excel, or CSV files
 */
export interface TenderData {
  "Bid Number": string;
  "Dated": string;
  "Bid End Date/Time": string;
  "Bid Opening Date/Time": string;
  "Bid Offer Validity (From End Date)": string;
  "Ministry/State Name": string;
  "Department Name": string;
  "Organisation Name": string;
  "Office Name": string;
  "Buyer Email": string;
  "Total Quantity": string;
  "BOQ Title": string;
  "MSE Exemption for Years of Experience and Turnover": string;
  "EMD Amount": string;
  "ePBG Detail: Required": string;
  [key: string]: string; // Allow any additional string keys
}