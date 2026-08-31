# 🚀 BankStatementConverter (LedgerClean)

> **100% In-Browser Bank Statement to Excel & QuickBooks Converter**
> Zero Server Uploads. Process confidential PDF bank statements locally on your device with complete privacy.

Live Web Application: [https://bankstatementconverter.web.app](https://bankstatementconverter.web.app)

---

## 🌟 Key Features

- 🛡️ **Zero Server Uploads**: PDF text extraction, layout parsing, and OCR run 100% locally in WebAssembly.
- 🏷️ **Automatic Transaction Categorization**: Automatically categorizes transactions (*Software, Travel, Meals, Utilities, Office Supplies, Rent, Payroll, Fuel, Bank Fees, Sales Revenue*).
- ⚠️ **Pre-Export Low-Confidence Review**: Visual review workflow with 1-click approval for unclassified merchants or OCR scans.
- 🧮 **Math Reconciliation Engine**: Verifies $\text{Opening Balance} + \text{Credits} - \text{Debits} = \text{Ending Balance}$.
- 📊 **Multi-Format Exports**: One-click download for Microsoft Excel (`.xlsx`), QuickBooks Online CSV, Xero CSV, and Google Sheets clipboard TSV.
- 🏦 **14+ Global Banks Supported**: Pre-calibrated for Chase, Bank of America, Wells Fargo, Citi, Capital One, TD Bank, PNC, Barclays UK, HSBC, Lloyds, RBC, Scotiabank, CBA Australia, Wise, and Revolut.

---

## 🛠️ Getting Started Locally

```bash
# 1. Clone repository
git clone https://github.com/motiram944/bank-statement-to-excel.git
cd bank-statement-to-excel

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

---

## 🚀 Building & Deploying to Firebase

```bash
# Build production static export
npm run build

# Deploy static site to Firebase Hosting
npx firebase-tools deploy --only hosting --project ledgerclean-2c9ee
```

---

## 📜 License

MIT License. Built for freelance bookkeepers, CPAs, and small business owners worldwide.
