import { BankConfig } from './types';

export const BANK_CONFIGS: Record<string, BankConfig> = {
  'chase-bank-statement-to-excel': {
    slug: 'chase-bank-statement-to-excel',
    name: 'Chase Bank (JPMorgan Chase)',
    shortName: 'Chase',
    country: 'US',
    currency: 'USD ($)',
    logo: 'chase',
    h1Title: 'Convert Chase Bank Statements to Excel & QuickBooks (100% In-Browser)',
    metaTitle: 'Chase Bank Statement to Excel & CSV Converter | Private & Free Preview',
    metaDescription: 'Extract Chase PDF bank statements into structured Excel (.xlsx) and QuickBooks CSV files instantly. 100% local browser processing with zero server uploads.',
    primaryColor: '#1170cf',
    sampleFormat: [
      { date: '01/12/2026', description: 'AMAZON.COM MKTPLACE SEATTLE WA', debit: '$49.99', credit: '', balance: '$4,520.10' },
      { date: '01/14/2026', description: 'PAYROLL DIRECT DEPOSIT ACME CORP', debit: '', credit: '$2,500.00', balance: '$7,020.10' },
      { date: '01/18/2026', description: 'CHASE AUTOMATIC TRANSFER TO SAVINGS', debit: '$500.00', credit: '', balance: '$6,520.10' },
    ],
    faqs: [
      {
        question: 'Does my Chase PDF statement get uploaded to any server?',
        answer: 'No. LedgerClean uses client-side WebAssembly to parse Chase statements 100% locally on your computer. Your financial data never leaves your browser window.'
      },
      {
        question: 'Can I export Chase statements directly to QuickBooks Online or Xero?',
        answer: 'Yes. LedgerClean automatically generates 3-column CSV files formatted for instant upload into QuickBooks Online, Xero, Wave, or FreshBooks.'
      },
      {
        question: 'Does LedgerClean handle multi-column Chase checking & credit card statements?',
        answer: 'Yes. Our reconciliation engine automatically groups transaction dates, description narrative, withdrawals, deposits, and running balances across all pages.'
      }
    ],
    reviews: [
      {
        name: 'Sarah M.',
        role: 'Senior Bookkeeper',
        company: 'Apex Accounting Solutions',
        rating: 5,
        text: 'Converting client Chase PDF statements used to take hours of manual data entry. LedgerClean converted a 40-page Chase statement in seconds with 100% math reconciliation!'
      },
      {
        name: 'David K.',
        role: 'CPA & Tax Advisor',
        company: 'Krueger & Associates CPAs',
        rating: 5,
        text: 'Client privacy is our #1 priority under GLBA regulations. Knowing LedgerClean works 100% client-side without cloud servers gives us absolute peace of mind.'
      }
    ]
  },
  'bank-of-america-statement-to-excel': {
    slug: 'bank-of-america-statement-to-excel',
    name: 'Bank of America',
    shortName: 'BofA',
    country: 'US',
    currency: 'USD ($)',
    logo: 'bofa',
    h1Title: 'Convert Bank of America Statements to Excel (.xlsx) & CSV',
    metaTitle: 'Bank of America PDF Statement Converter to Excel & QuickBooks',
    metaDescription: 'Extract transactions from Bank of America PDF checking, savings, and credit card statements into Excel. Zero server uploads, 100% private.',
    primaryColor: '#e31837',
    sampleFormat: [
      { date: '02/03/2026', description: 'DEPOSIT - MOBILE CHECK DEPOSIT', debit: '', credit: '$1,200.00', balance: '$8,940.50' },
      { date: '02/05/2026', description: 'CHECK #1429 PAYEE CLEANING SERVICES', debit: '$350.00', credit: '', balance: '$8,590.50' },
      { date: '02/08/2026', description: 'COMCAST CABLE UTILITY PMT', debit: '$120.45', credit: '', balance: '$8,470.05' },
    ],
    faqs: [
      {
        question: 'Does this work on scanned Bank of America paper statements?',
        answer: 'Yes! LedgerClean includes an in-browser Tesseract.js OCR engine that automatically processes scanned images or flattened PDFs.'
      },
      {
        question: 'How does Bank of America credit card statement conversion work?',
        answer: 'LedgerClean automatically parses transaction dates, posting dates, payee names, and amounts into clean tabular format.'
      }
    ],
    reviews: [
      {
        name: 'Marcus Vance',
        role: 'Property Manager',
        company: 'Vance Residential Group',
        rating: 5,
        text: 'The math reconciliation engine caught a missing check entry immediately. Saved me hours during monthly reconciliation.'
      }
    ]
  },
  'wells-fargo-statement-to-csv': {
    slug: 'wells-fargo-statement-to-csv',
    name: 'Wells Fargo Bank',
    shortName: 'Wells Fargo',
    country: 'US',
    currency: 'USD ($)',
    logo: 'wellsfargo',
    h1Title: 'Convert Wells Fargo PDF Bank Statements to CSV & Excel',
    metaTitle: 'Wells Fargo Statement to CSV & Excel Converter | Zero Uploads',
    metaDescription: 'Fast, secure in-browser parser for Wells Fargo business checking and personal bank statements. Export clean Excel spreadsheets or QBO CSVs.',
    primaryColor: '#cd1409',
    sampleFormat: [
      { date: '01/05/2026', description: 'PURCHASE AUTHORIZATION TARGET STORE', debit: '$84.20', credit: '', balance: '$3,410.00' },
      { date: '01/09/2026', description: 'WIRE INCOMING REF: CLIENT INVOICE 804', debit: '', credit: '$4,000.00', balance: '$7,410.00' },
    ],
    faqs: [
      {
        question: 'Is Wells Fargo 2-column or 4-column layout supported?',
        answer: 'LedgerClean supports both single-amount column with signed values and multi-column debit/credit layouts from Wells Fargo.'
      }
    ],
    reviews: [
      {
        name: 'Elena Rostova',
        role: 'Solo Tax Preparer',
        company: 'Rostova Tax Services',
        rating: 5,
        text: 'Effortless conversion for Wells Fargo statements. The live inline spreadsheet editor lets me make adjustments before exporting.'
      }
    ]
  },
  'citibank-statement-to-excel': {
    slug: 'citibank-statement-to-excel',
    name: 'Citibank (Citi)',
    shortName: 'Citibank',
    country: 'US',
    currency: 'USD ($)',
    logo: 'citi',
    h1Title: 'Convert Citibank Statements to Excel (.xlsx) & QuickBooks CSV',
    metaTitle: 'Citibank PDF Bank Statement Converter to Excel & QBO',
    metaDescription: 'Convert Citibank checking, savings, and credit card statements into Excel (.xlsx) and QuickBooks CSV. 100% in-browser WebAssembly processing.',
    primaryColor: '#003b70',
    sampleFormat: [
      { date: '01/10/2026', description: 'CITIBANK ONLINE DIRECT DEPOSIT', debit: '', credit: '$3,400.00', balance: '$9,120.00' },
      { date: '01/14/2026', description: 'UBER RIDE SAN FRANCISCO CA', debit: '$34.50', credit: '', balance: '$9,085.50' },
    ],
    faqs: [
      {
        question: 'Does LedgerClean parse Citibank credit card statements?',
        answer: 'Yes! Citibank double-column credit card statements are pre-calibrated for exact transaction and payment separation.'
      }
    ],
    reviews: [
      {
        name: 'Robert Miller',
        role: 'CPA Advisor',
        company: 'Miller Financial Management',
        rating: 5,
        text: 'Citibank multi-page PDFs convert flawlessly into clean Excel files. The 100% browser processing guarantees client privacy.'
      }
    ]
  },
  'capital-one-statement-to-csv': {
    slug: 'capital-one-statement-to-csv',
    name: 'Capital One Bank',
    shortName: 'Capital One',
    country: 'US',
    currency: 'USD ($)',
    logo: 'capitalone',
    h1Title: 'Convert Capital One Statements to CSV, Excel & QuickBooks',
    metaTitle: 'Capital One PDF Statement to CSV & Excel Converter',
    metaDescription: 'Extract transactions from Capital One Spark business and Venture credit card PDF statements. Zero server uploads.',
    primaryColor: '#004977',
    sampleFormat: [
      { date: '02/11/2026', description: 'GOOGLE ADS ADVERTISING PMT', debit: '$500.00', credit: '', balance: '$3,200.00' },
      { date: '02/15/2026', description: 'AUTOPAY PAYMENT THANK YOU', debit: '', credit: '$1,500.00', balance: '$1,700.00' },
    ],
    faqs: [
      {
        question: 'Can I convert Capital One Spark Business credit card PDFs?',
        answer: 'Yes. Capital One Spark business cards and Spark checking PDFs are fully supported.'
      }
    ],
    reviews: [
      {
        name: 'Jessica Thorne',
        role: 'Freelance Bookkeeper',
        company: 'Thorne Bookkeeping Co.',
        rating: 5,
        text: 'Capital One credit card statements converted cleanly in less than 5 seconds. Huge time saver for monthly tax prep!'
      }
    ]
  },
  'td-bank-statement-to-excel': {
    slug: 'td-bank-statement-to-excel',
    name: 'TD Bank (US & Canada)',
    shortName: 'TD Bank',
    country: 'US/CA',
    currency: 'USD/CAD ($)',
    logo: 'td',
    h1Title: 'Convert TD Bank Statements to Excel (.xlsx) & CSV',
    metaTitle: 'TD Bank PDF Statement to Excel & QuickBooks Converter',
    metaDescription: 'Extract TD Bank business and personal statements into formatted Excel spreadsheets and QBO CSV files directly in your browser.',
    primaryColor: '#008a00',
    sampleFormat: [
      { date: '01/04/2026', description: 'TD MERCHANT DIRECT INBOUND DEPOSIT', debit: '', credit: '$2,150.00', balance: '$6,400.00' },
      { date: '01/08/2026', description: 'OFFICE DEPOT SUPPLIES BOSTON MA', debit: '$112.30', credit: '', balance: '$6,287.70' },
    ],
    faqs: [
      {
        question: 'Are both US TD Bank and Canadian TD Canada Trust supported?',
        answer: 'Yes! Both US and Canadian TD Bank statement formats are pre-calibrated in LedgerClean.'
      }
    ],
    reviews: [
      {
        name: 'Andrew Scott',
        role: 'Small Business CPA',
        company: 'Scott Tax Group',
        rating: 5,
        text: 'The math reconciliation engine verified the opening and closing balances automatically on 30 pages of TD Bank statements!'
      }
    ]
  },
  'pnc-bank-statement-to-excel': {
    slug: 'pnc-bank-statement-to-excel',
    name: 'PNC Bank',
    shortName: 'PNC',
    country: 'US',
    currency: 'USD ($)',
    logo: 'pnc',
    h1Title: 'Convert PNC Bank Statements to Excel & QuickBooks Online',
    metaTitle: 'PNC Bank PDF Statement to Excel & CSV Converter',
    metaDescription: 'Convert PNC Bank checking, savings, and treasury statements into Excel and QBO CSV files. 100% local WebAssembly parser.',
    primaryColor: '#f47321',
    sampleFormat: [
      { date: '03/01/2026', description: 'PNC ACH PAYROLL DIRECT DEPOSIT', debit: '', credit: '$4,100.00', balance: '$12,450.00' },
      { date: '03/05/2026', description: 'DUKE ENERGY UTILITY BILL', debit: '$210.00', credit: '', balance: '$12,240.00' },
    ],
    faqs: [
      {
        question: 'Does LedgerClean parse PNC Treasury Management PDF statements?',
        answer: 'Yes. PNC Treasury and Business Checking PDF layouts are fully supported.'
      }
    ],
    reviews: [
      {
        name: 'Samantha Lee',
        role: 'Financial Analyst',
        company: 'Lee Accounting Services',
        rating: 5,
        text: 'PNC statements convert accurately with 0% server upload security risks. Very impressive tool!'
      }
    ]
  },
  'barclays-bank-statement-to-excel': {
    slug: 'barclays-bank-statement-to-excel',
    name: 'Barclays Bank',
    shortName: 'Barclays',
    country: 'UK',
    currency: 'GBP (£)',
    logo: 'barclays',
    h1Title: 'Convert Barclays UK Statements to Excel & CSV (GBP £)',
    metaTitle: 'Barclays PDF Bank Statement to Excel & Xero CSV Converter',
    metaDescription: 'Convert Barclays UK bank statements into Excel and Xero-ready CSV files. GDPR compliant zero-server client-side parser.',
    primaryColor: '#00aeef',
    sampleFormat: [
      { date: '10/01/2026', description: 'DIRECT DEBIT BRITISH GAS UTILITIES', debit: '£145.50', credit: '', balance: '£5,210.80' },
      { date: '12/01/2026', description: 'FASTER PAYMENTS INCOMING CONSULTING', debit: '', credit: '£1,850.00', balance: '£7,060.80' },
    ],
    faqs: [
      {
        question: 'Is UK date format (DD/MM/YYYY) supported?',
        answer: 'Yes! LedgerClean automatically detects UK date formats (DD/MM/YYYY) and GBP (£) currency formatting for Barclays and other UK banks.'
      }
    ],
    reviews: [
      {
        name: 'James H.',
        role: 'Chartered Accountant',
        company: 'Heritage Accounting Bristol',
        rating: 5,
        text: 'Crucial for GDPR compliance. We cannot send UK client statements to random web APIs. LedgerClean running in local WebAssembly is perfect.'
      }
    ]
  },
  'hsbc-bank-statement-to-excel': {
    slug: 'hsbc-bank-statement-to-excel',
    name: 'HSBC UK & Global',
    shortName: 'HSBC',
    country: 'UK/Global',
    currency: 'GBP/USD (£/$)',
    logo: 'hsbc',
    h1Title: 'Convert HSBC Bank Statements to Excel & Xero CSV',
    metaTitle: 'HSBC PDF Bank Statement to Excel & CSV Converter',
    metaDescription: 'Extract transactions from HSBC business and personal PDF bank statements. GDPR compliant client-side WebAssembly parser.',
    primaryColor: '#db0011',
    sampleFormat: [
      { date: '15/01/2026', description: 'BACS TRANSFER CLIENT INVOICE PAYMENT', debit: '', credit: '£2,400.00', balance: '£11,200.00' },
      { date: '18/01/2026', description: 'STANDING ORDER OFFICE RENT', debit: '£1,200.00', credit: '', balance: '£10,000.00' },
    ],
    faqs: [
      {
        question: 'Are HSBC UK and HSBC International statements supported?',
        answer: 'Yes. HSBC single and multi-currency statements are pre-calibrated for exact transaction extraction.'
      }
    ],
    reviews: [
      {
        name: 'Oliver Wright',
        role: 'UK Chartered Accountant',
        company: 'Wright & Co London',
        rating: 5,
        text: 'HSBC UK statements converted smoothly into Xero CSV format. The math verification banner gives complete assurance.'
      }
    ]
  },
  'lloyds-bank-statement-to-excel': {
    slug: 'lloyds-bank-statement-to-excel',
    name: 'Lloyds Bank',
    shortName: 'Lloyds',
    country: 'UK',
    currency: 'GBP (£)',
    logo: 'lloyds',
    h1Title: 'Convert Lloyds Bank Statements to Excel & Xero CSV',
    metaTitle: 'Lloyds Bank PDF Statement Converter to Excel & CSV',
    metaDescription: 'Convert Lloyds Bank UK commercial and personal PDF statements into Excel spreadsheets and Xero CSV files directly in your browser.',
    primaryColor: '#006a4e',
    sampleFormat: [
      { date: '05/02/2026', description: 'FASTER PAYMENT OUTGOING SUPPLIER', debit: '£320.00', credit: '', balance: '£4,800.00' },
      { date: '09/02/2026', description: 'CARD PAYMENT VODAFONE MOBILE', debit: '£45.00', credit: '', balance: '£4,755.00' },
    ],
    faqs: [
      {
        question: 'Does LedgerClean parse Lloyds Business Banking PDF statements?',
        answer: 'Yes! Lloyds commercial and small business PDF statements are fully supported.'
      }
    ],
    reviews: [
      {
        name: 'Gemma Davies',
        role: 'Sole Bookkeeper',
        company: 'Davies Financial Services',
        rating: 5,
        text: 'Saved me hours when processing a backlog of Lloyds statements for client self-assessment tax returns.'
      }
    ]
  },
  'royal-bank-of-canada-statement-to-excel': {
    slug: 'royal-bank-of-canada-statement-to-excel',
    name: 'RBC Royal Bank of Canada',
    shortName: 'RBC',
    country: 'CA',
    currency: 'CAD ($)',
    logo: 'rbc',
    h1Title: 'Convert RBC Bank Statements to Excel & QuickBooks Canada',
    metaTitle: 'RBC Royal Bank Statement to Excel & CSV Converter',
    metaDescription: 'Extract transactions from RBC Royal Bank of Canada PDF statements directly in your browser. Fast, private, accurate.',
    primaryColor: '#0051a5',
    sampleFormat: [
      { date: '03/02/2026', description: 'INTERAC E-TRANSFER RECEIVED CLIENT PAYMENT', debit: '', credit: '$750.00', balance: '$6,100.25' },
      { date: '03/06/2026', description: 'MISC PAYMENT ROGERS COMMUNICATIONS', debit: '$95.00', credit: '', balance: '$6,005.25' },
    ],
    faqs: [
      {
        question: 'Does LedgerClean format Canadian CAD bank statements correctly?',
        answer: 'Yes! Canadian date standards (YYYY-MM-DD or DD/MM/YYYY) and CAD dollar amounts are fully supported and pre-calibrated.'
      }
    ],
    reviews: [
      {
        name: 'Claire Bouchard',
        role: 'Bookkeeper',
        company: 'Montreal Business Services',
        rating: 5,
        text: 'Worked seamlessly on RBC Royal Bank e-statements! Exported clean XLSX with dates and amounts auto-formatted.'
      }
    ]
  },
  'scotiabank-statement-to-excel': {
    slug: 'scotiabank-statement-to-excel',
    name: 'Scotiabank (Bank of Nova Scotia)',
    shortName: 'Scotiabank',
    country: 'CA',
    currency: 'CAD ($)',
    logo: 'scotiabank',
    h1Title: 'Convert Scotiabank Statements to Excel (.xlsx) & CSV',
    metaTitle: 'Scotiabank PDF Statement to Excel & QuickBooks Converter',
    metaDescription: 'Extract checking, savings, and Visa credit card transactions from Scotiabank PDF statements directly in your browser.',
    primaryColor: '#ec1c24',
    sampleFormat: [
      { date: '01/12/2026', description: 'INTERAC E-TRANSFER PAYROLL PAYMENT', debit: '', credit: '$2,800.00', balance: '$8,200.00' },
      { date: '01/16/2026', description: 'BELL CANADA UTILITY PAYMENT', debit: '$88.50', credit: '', balance: '$8,111.50' },
    ],
    faqs: [
      {
        question: 'Does LedgerClean parse Scotiabank Momentum Visa credit card statements?',
        answer: 'Yes! Scotiabank credit card statements and small business checking PDFs are fully supported.'
      }
    ],
    reviews: [
      {
        name: 'Etienne Tremblay',
        role: 'CPA Partner',
        company: 'Tremblay & Associates',
        rating: 5,
        text: 'Scotiabank PDFs converted in seconds without needing to upload sensitive Canadian client files to third-party servers.'
      }
    ]
  },
  'commonwealth-bank-statement-to-excel': {
    slug: 'commonwealth-bank-statement-to-excel',
    name: 'Commonwealth Bank of Australia (CBA)',
    shortName: 'CBA Australia',
    country: 'AU',
    currency: 'AUD ($)',
    logo: 'cba',
    h1Title: 'Convert Commonwealth Bank Statements to Excel & Xero (AUD $)',
    metaTitle: 'Commonwealth Bank PDF Statement to Excel & Xero CSV Converter',
    metaDescription: 'Convert Commonwealth Bank of Australia (CBA) PDF statements into Excel spreadsheets and Xero CSV files. 100% in-browser parser.',
    primaryColor: '#ffcc00',
    sampleFormat: [
      { date: '10/01/2026', description: 'DIRECT CREDIT CLIENT INVOICE PAYMENT', debit: '', credit: '$1,950.00', balance: '$7,800.00' },
      { date: '14/01/2026', description: 'TELSTRA RECURRING BILL PMT', debit: '$79.00', credit: '', balance: '$7,721.00' },
    ],
    faqs: [
      {
        question: 'Is Australian date format (DD/MM/YYYY) and AUD supported?',
        answer: 'Yes! Australian date standards (DD/MM/YYYY) and AUD currency formats are fully pre-calibrated for CBA, ANZ, and NAB.'
      }
    ],
    reviews: [
      {
        name: 'Liam Hemsworth',
        role: 'BAS Agent & Bookkeeper',
        company: 'Sydney Business Solutions',
        rating: 5,
        text: 'Essential tool for Australian BAS agents. CBA statements converted directly into Xero-ready CSV format!'
      }
    ]
  },
  'wise-revolut-statement-to-excel': {
    slug: 'wise-revolut-statement-to-excel',
    name: 'Wise & Revolut (Neobanks)',
    shortName: 'Wise / Revolut',
    country: 'Global',
    currency: 'Multi-Currency',
    logo: 'wise',
    h1Title: 'Convert Wise & Revolut Multi-Currency Statements to Excel',
    metaTitle: 'Wise & Revolut PDF Statement to Excel & CSV Converter',
    metaDescription: 'Extract transactions from Wise (TransferWise) and Revolut multi-currency business statements directly into Excel and QuickBooks CSV.',
    primaryColor: '#2e0696',
    sampleFormat: [
      { date: '04/02/2026', description: 'STRIPE PAYOUT INBOUND USD BALANCE', debit: '', credit: '$3,500.00', balance: '$12,100.00' },
      { date: '07/02/2026', description: 'TRANSFER TO VENDOR EURO ACCOUNT', debit: '$1,200.00', credit: '', balance: '$10,900.00' },
    ],
    faqs: [
      {
        question: 'Are multi-currency Wise and Revolut business statements supported?',
        answer: 'Yes! Multi-currency account statements in USD, EUR, GBP, AUD, and CAD are automatically parsed into tabular Excel format.'
      }
    ],
    reviews: [
      {
        name: 'Nina Patel',
        role: 'Global Freelancer Accountant',
        company: 'Remote Nomad Accounting',
        rating: 5,
        text: 'Handling multi-currency Revolut & Wise PDF statements for global remote clients used to be a pain. LedgerClean makes it instantaneous!'
      }
    ]
  }
};
