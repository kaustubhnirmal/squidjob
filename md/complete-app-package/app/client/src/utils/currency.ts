/**
 * Format number as Indian Rupees with proper symbols and formatting
 */
export function formatIndianCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return '₹0';
  
  // Format in Indian number system (Lakhs and Crores)
  if (numAmount >= 10000000) { // 1 Crore
    return `₹${(numAmount / 10000000).toFixed(2)}Cr`;
  } else if (numAmount >= 100000) { // 1 Lakh
    return `₹${(numAmount / 100000).toFixed(2)}L`;
  } else if (numAmount >= 1000) { // 1 Thousand
    return `₹${(numAmount / 1000).toFixed(2)}K`;
  } else {
    return `₹${numAmount.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })}`;
  }
}

/**
 * Format number as detailed Indian Rupees with full amount
 */
export function formatDetailedIndianCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return '₹0.00';
  
  return `₹${numAmount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}