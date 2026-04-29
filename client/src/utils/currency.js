/**
 * Format price with NPR currency prefix
 * @param {number|string} amount - The amount to format
 * @returns {string} Formatted price with NPR prefix (e.g., "NPR 1,000")
 */
export const formatPrice = (amount) => {
  if (amount === null || amount === undefined || amount === '') {
    return 'NPR 0';
  }
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return 'NPR 0';
  }
  
  // Format number with comma separators
  const formattedNumber = numAmount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  
  return `NPR ${formattedNumber}`;
};

