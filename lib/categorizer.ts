export const STANDARD_CATEGORIES = [
  'Software & SaaS',
  'Travel & Transportation',
  'Meals & Entertainment',
  'Utilities & Telecom',
  'Office Supplies & Equipment',
  'Rent & Lease',
  'Payroll & Compensation',
  'Fuel & Gas',
  'Bank & Legal Fees',
  'Sales & Revenue',
  'Advertising & Marketing',
  'Professional Services',
  'Uncategorized / Review',
] as const;

export type TransactionCategory = (typeof STANDARD_CATEGORIES)[number];

export interface CategorizationResult {
  category: TransactionCategory;
  confidence: number; // 0.0 to 1.0
  needsReview: boolean;
  reviewReason?: string;
}

// Rules-based keyword matcher dictionary
const CATEGORY_RULES: { category: TransactionCategory; keywords: string[]; minConfidence: number }[] = [
  {
    category: 'Software & SaaS',
    keywords: [
      'AWS',
      'AMAZON WEB SERVICES',
      'VERCEL',
      'GOOGLE CLOUD',
      'MICROSOFT',
      'ADOBE',
      'ZOOM',
      'GITHUB',
      'SLACK',
      'ATLASSIAN',
      'JIRA',
      'CONFLUENCE',
      'INTUIT',
      'QUICKBOOKS',
      'NOTION',
      'OPENAI',
      'CHATGPT',
      'CANVA',
      'GODADDY',
      'NAMECHEAP',
      'DROPBOX',
      'HUBSPOT',
      'SALESFORCE',
      'MAILCHIMP',
      'FIGMA',
      'HEROKU',
      'CLOUDFLARE',
      'DIGITALOCEAN',
    ],
    minConfidence: 0.95,
  },
  {
    category: 'Travel & Transportation',
    keywords: [
      'UBER',
      'LYFT',
      'DELTA',
      'UNITED AIR',
      'AMERICAN AIR',
      'SOUTHWEST',
      'JETBLUE',
      'HERTZ',
      'ENTERPRISE',
      'AVIS',
      'BUDGET RENT',
      'AMTRAK',
      'TAXI',
      'PARKING',
      'TOLL',
      'AIRBNB',
      'HOTEL',
      'MARRIOTT',
      'HILTON',
      'EXPEDIA',
      'BOOKING.COM',
    ],
    minConfidence: 0.95,
  },
  {
    category: 'Meals & Entertainment',
    keywords: [
      'STARBUCKS',
      'MCDONALDS',
      'SUBWAY',
      'DOMINOS',
      'DOORDASH',
      'GRUBHUB',
      'UBER EATS',
      'CHIPOTLE',
      'RESTAURANT',
      'CAFE',
      'COFFEE',
      'DINER',
      'PANERA',
      'DUNKIN',
      'BURGER KING',
      'PIZZA',
      'BAKERY',
      'BAR & GRILL',
    ],
    minConfidence: 0.9,
  },
  {
    category: 'Utilities & Telecom',
    keywords: [
      'COMCAST',
      'VERIZON',
      'AT&T',
      'T-MOBILE',
      'DUKE ENERGY',
      'BRITISH GAS',
      'SPECTRUM',
      'VODAFONE',
      'ELECTRIC',
      'WATER UTILITY',
      'GAS UTILITY',
      'WASTE MGMT',
      'POWER & LIGHT',
      'CON EDISON',
    ],
    minConfidence: 0.95,
  },
  {
    category: 'Office Supplies & Equipment',
    keywords: [
      'STAPLES',
      'OFFICE DEPOT',
      'OFFICEMAX',
      'AMAZON',
      'TARGET',
      'WALMART',
      'BEST BUY',
      'APPLE STORE',
      'PAPER',
      'PRINTING',
      'FEDEX',
      'UPS STORE',
      'USPS',
    ],
    minConfidence: 0.85,
  },
  {
    category: 'Rent & Lease',
    keywords: [
      'RENT',
      'LEASE',
      'REALTY',
      'PROPERTY MANAGEMENT',
      'APARTMENTS',
      'STORAGE',
      'WEWORK',
      'REGUS',
      'MORTGAGE',
    ],
    minConfidence: 0.9,
  },
  {
    category: 'Payroll & Compensation',
    keywords: [
      'PAYROLL',
      'ADP',
      'GUSTO',
      'PAYCHEK',
      'PAYCHEX',
      'DIRECT DEPOSIT SALARY',
      'WAGES',
      'SALARY',
      'BONUS',
      'RIPLING',
      'ZENEFITS',
    ],
    minConfidence: 0.95,
  },
  {
    category: 'Fuel & Gas',
    keywords: [
      'SHELL',
      'CHEVRON',
      'EXXON',
      'BP',
      'MOBIL',
      '7-ELEVEN GAS',
      'SPEEDWAY',
      'TEXACO',
      'MARATHON',
      'SUNOCO',
      'PETROL',
      'FUEL',
    ],
    minConfidence: 0.95,
  },
  {
    category: 'Bank & Legal Fees',
    keywords: [
      'BANK FEE',
      'MONTHLY MAINTENANCE',
      'WIRE FEE',
      'OVERDRAFT',
      'SERVICE CHARGE',
      'ATM FEE',
      'INTEREST CHARGE',
      'LEGAL',
      'ATTORNEY',
      'LAW FIRM',
    ],
    minConfidence: 0.95,
  },
  {
    category: 'Advertising & Marketing',
    keywords: [
      'GOOGLE ADS',
      'FACEBOOK ADS',
      'META ADS',
      'LINKEDIN ADS',
      'TIKTOK ADS',
      'TWITTER ADS',
      'X ADS',
      'MARKETING',
      'ADVERTISING',
      'BILLBOARD',
    ],
    minConfidence: 0.95,
  },
  {
    category: 'Sales & Revenue',
    keywords: [
      'STRIPE',
      'PAYPAL',
      'SQUARE',
      'SHOPIFY',
      'INCOMING WIRE',
      'DEPOSIT',
      'CLIENT INVOICE',
      'MERCHANT SETTLEMENT',
      'CUSTOMER PAYMENT',
    ],
    minConfidence: 0.9,
  },
];

/**
 * High-speed 100% client-side transaction categorizer
 */
export function categorizeTransaction(description: string, amount: number): CategorizationResult {
  const upperDesc = description.toUpperCase().trim();

  // 1. Positive amount heuristics (Income / Sales) if description matches merchant payouts
  if (amount > 0) {
    if (
      upperDesc.includes('STRIPE') ||
      upperDesc.includes('PAYPAL') ||
      upperDesc.includes('SQUARE') ||
      upperDesc.includes('SHOPIFY') ||
      upperDesc.includes('INVOICE') ||
      upperDesc.includes('DEPOSIT') ||
      upperDesc.includes('PAYOUT')
    ) {
      return {
        category: 'Sales & Revenue',
        confidence: 0.95,
        needsReview: false,
      };
    }
  }

  // 2. Keyword & Merchant matching pass
  for (const rule of CATEGORY_RULES) {
    for (const kw of rule.keywords) {
      if (upperDesc.includes(kw)) {
        return {
          category: rule.category,
          confidence: rule.minConfidence,
          needsReview: false,
        };
      }
    }
  }

  // 3. Fallback: Uncategorized / Review Needed
  return {
    category: 'Uncategorized / Review',
    confidence: 0.4,
    needsReview: true,
    reviewReason: 'Unrecognized merchant name — review category before export',
  };
}
