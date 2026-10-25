// Indian Localization & Formatting Utilities for Ownly

// Format currency as Indian Rupees (INR - ₹) using en-IN locale
export const formatINR = (amount, options = {}) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: options.decimals !== undefined ? options.decimals : 0,
    minimumFractionDigits: 0,
  }).format(num);
};

// Format date to Indian standard format (DD/MM/YYYY)
export const formatIndianDate = (dateString, options = {}) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';

  if (options.verbose) {
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    });
  }

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Format timestamp with 12-hour AM/PM format (Asia/Kolkata)
export const formatIndianDateTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';

  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
};

// Indian States & Union Territories
export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi NCR',
  'Chandigarh',
  'Jammu and Kashmir',
  'Ladakh',
  'Puducherry',
];

// Major Indian Cities
export const INDIAN_CITIES = [
  'Bengaluru',
  'Mumbai',
  'Delhi',
  'Hyderabad',
  'Chennai',
  'Pune',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Kochi',
  'Gurugram',
  'Noida',
  'Chandigarh',
  'Lucknow',
  'Indore',
  'Coimbatore',
  'Surat',
];

// Popular Indian Retail Platforms & Stores
export const INDIAN_PURCHASE_STORES = [
  'Amazon India',
  'Flipkart',
  'Croma',
  'Reliance Digital',
  'Vijay Sales',
  'Apple Store (Official India)',
  'Samsung SmartCafe',
  'Tata CLiQ Luxury',
  'Brand Official Website',
  'Local Authorized Retailer',
];

// LifeTrace Evidence Badge Helper
export const getEvidenceBadge = (evidenceType) => {
  switch (evidenceType) {
    case 'DOCUMENT_SUPPORTED':
      return {
        label: 'Document-Supported',
        color: '#15803D',
        bg: '#DCFCE7',
        title: 'Supported by an attached receipt, warranty card, or service invoice.',
      };
    case 'VERIFIED':
      return {
        label: 'Verified Transfer / Authorized',
        color: '#4338CA',
        bg: '#E0E7FF',
        title: 'Formally recorded by Ownly transfer or verified authorized center.',
      };
    case 'SELF_REPORTED':
    default:
      return {
        label: 'Self-Reported',
        color: '#854D0E',
        bg: '#FEF9C3',
        title: 'Entered by product owner without an attached invoice.',
      };
  }
};
