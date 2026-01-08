/**
 * Comprehensive Documentation System
 * 
 * This file contains structured documentation for all features, use cases, and business flows.
 * Each feature includes: overview, business value, step-by-step guide, use cases, best practices, and FAQs.
 */

export type DocumentationCategory = 
  | 'getting-started'
  | 'parties'
  | 'inventory'
  | 'invoices'
  | 'payments'
  | 'reports'
  | 'business'
  | 'troubleshooting';

export type DocumentationLevel = 'beginner' | 'intermediate' | 'advanced';

export interface DocumentationStep {
  title: string;
  description: string;
  details?: string[];
  visualHint?: string;
}

export interface UseCase {
  title: string;
  description: string;
  scenario: string;
  steps: DocumentationStep[];
  tips?: string[];
}

export interface BestPractice {
  title: string;
  description: string;
  why: string;
  example?: string;
}

export interface FAQ {
  question: string;
  answer: string;
  category?: string;
  relatedTopics?: string[];
}

export interface FeatureDocumentation {
  id: string;
  title: string;
  category: DocumentationCategory;
  level: DocumentationLevel;
  overview: {
    what: string;
    why: string;
    when: string;
  };
  quickStart: {
    summary: string;
    steps: DocumentationStep[];
  };
  detailedGuide: {
    introduction: string;
    steps: DocumentationStep[];
    examples?: string[];
  };
  useCases: UseCase[];
  bestPractices: BestPractice[];
  faqs: FAQ[];
  relatedFeatures?: string[];
  videoTutorial?: {
    title: string;
    duration: string;
    url?: string;
  };
}

// Comprehensive Documentation Data
export const documentation: Record<string, FeatureDocumentation> = {
  // GETTING STARTED
  'getting-started-overview': {
    id: 'getting-started-overview',
    title: 'Getting Started with Business App',
    category: 'getting-started',
    level: 'beginner',
    overview: {
      what: 'Learn the basics of using the Business App to manage your business operations.',
      why: 'Understanding the fundamentals helps you get the most out of the application and ensures accurate business record-keeping.',
      when: 'Start here if you\'re new to the application or need a refresher on core concepts.',
    },
    quickStart: {
      summary: 'Set up your business profile, add your first party, create inventory items, and generate your first invoice.',
      steps: [
        {
          title: 'Set Up Business Profile',
          description: 'Go to Business → Select Business and enter your business details including GSTIN.',
        },
        {
          title: 'Add Your First Party',
          description: 'Navigate to Parties → Add Party to create a customer or supplier.',
        },
        {
          title: 'Add Inventory Items',
          description: 'Go to Inventory → Add Item to create products you sell or purchase.',
        },
        {
          title: 'Create Your First Invoice',
          description: 'Navigate to Invoices → Create Invoice and select party and items.',
        },
      ],
    },
    detailedGuide: {
      introduction: 'The Business App helps you manage all aspects of your business including customers, inventory, invoicing, payments, and GST compliance.',
      steps: [
        {
          title: 'Business Setup',
          description: 'Configure your business profile with accurate details.',
          details: [
            'Enter business name, address, and contact information',
            'Add GSTIN if applicable (validated automatically)',
            'Set up financial year and tax preferences',
          ],
        },
        {
          title: 'Add Parties',
          description: 'Create records for customers and suppliers.',
          details: [
            'Go to Parties section',
            'Click "Add Party" button',
            'Fill in party details (name, type, contact info)',
            'Add GSTIN for GST-compliant parties',
            'Set credit limits and payment terms if needed',
          ],
        },
        {
          title: 'Manage Inventory',
          description: 'Add and track your products and stock levels.',
          details: [
            'Navigate to Inventory section',
            'Click "Add Item" to create new products',
            'Enter item name, prices, GST rate, and initial stock',
            'Set low stock alerts for important items',
          ],
        },
        {
          title: 'Create Invoices',
          description: 'Generate professional invoices for sales and purchases.',
          details: [
            'Go to Invoices → Create Invoice',
            'Select invoice type (Sale, Purchase, Quotation, Proforma)',
            'Choose party and add items',
            'Review GST calculations and totals',
            'Save and download PDF',
          ],
        },
      ],
    },
    useCases: [
      {
        title: 'First-Time Business Setup',
        description: 'Complete setup for a new business using the app.',
        scenario: 'You\'re starting a new business and need to set up everything from scratch.',
        steps: [
          { title: 'Create business profile', description: 'Enter all business details' },
          { title: 'Add initial inventory', description: 'List all products you sell' },
          { title: 'Add key customers/suppliers', description: 'Create party records' },
          { title: 'Configure GST settings', description: 'Set up tax preferences' },
        ],
      },
    ],
    bestPractices: [
      {
        title: 'Complete Business Profile First',
        description: 'Always set up your business profile completely before creating transactions.',
        why: 'This ensures all invoices and reports show correct business information.',
      },
      {
        title: 'Use Consistent Naming',
        description: 'Use clear, consistent names for parties and items.',
        why: 'Makes searching and reporting easier later.',
      },
    ],
    faqs: [
      {
        question: 'Do I need a GSTIN to use the app?',
        answer: 'No, you can use the app without GSTIN. However, GSTIN is required for GST-compliant invoicing and tax reporting.',
      },
      {
        question: 'Can I use the app offline?',
        answer: 'Yes, the app supports offline mode. All data syncs automatically when you\'re back online.',
      },
    ],
  },

  // PARTIES
  'parties-overview': {
    id: 'parties-overview',
    title: 'Managing Parties (Customers & Suppliers)',
    category: 'parties',
    level: 'beginner',
    overview: {
      what: 'Parties are your customers and suppliers. Manage all their information, transactions, and payment history in one place.',
      why: 'Proper party management helps you track relationships, payment terms, and outstanding balances efficiently.',
      when: 'Use this when adding new customers/suppliers, viewing transaction history, or managing credit limits.',
    },
    quickStart: {
      summary: 'Add parties with their contact details, set credit limits, and track all transactions and payments.',
      steps: [
        {
          title: 'Add a New Party',
          description: 'Go to Parties → Add Party, fill in details, and save.',
        },
        {
          title: 'View Party Details',
          description: 'Click on any party to see transactions, invoices, and payment history.',
        },
        {
          title: 'Set Credit Limits',
          description: 'When adding/editing a party, set credit limit and payment terms.',
        },
      ],
    },
    detailedGuide: {
      introduction: 'Parties are the foundation of your business relationships. Each party can be a customer, supplier, or both.',
      steps: [
        {
          title: 'Creating a Party',
          description: 'Add a new customer or supplier.',
          details: [
            'Navigate to Parties section',
            'Click "Add Party" button',
            'Enter party name (required)',
            'Select type: Customer, Supplier, or Both',
            'Add contact information (phone, email)',
            'Enter GSTIN if party is GST-registered',
            'Add billing and shipping addresses',
            'Set credit limit and payment terms (optional)',
            'Click Save',
          ],
        },
        {
          title: 'Party Types Explained',
          description: 'Understanding when to use each party type.',
          details: [
            'Customer: Only receives invoices from you (sales)',
            'Supplier: Only sends invoices to you (purchases)',
            'Both: Can be both customer and supplier',
          ],
        },
        {
          title: 'Managing Party Information',
          description: 'Update party details and view transaction history.',
          details: [
            'Click on any party to view details',
            'See all invoices and payments linked to the party',
            'View outstanding balance and credit limit',
            'Edit party information anytime',
            'Export party list to Excel',
          ],
        },
        {
          title: 'Credit Management',
          description: 'Set and monitor credit limits for parties.',
          details: [
            'Set credit limit when creating/editing party',
            'Set credit period (number of days)',
            'App shows warning when credit limit is exceeded',
            'Monitor outstanding balances in party detail view',
          ],
        },
      ],
    },
    useCases: [
      {
        title: 'Adding a New Customer',
        description: 'Onboard a new customer with complete information.',
        scenario: 'A new customer wants to start purchasing from you.',
        steps: [
          { title: 'Go to Parties → Add Party', description: 'Open the party creation form' },
          { title: 'Enter customer name', description: 'Use full business name' },
          { title: 'Select "Customer" type', description: 'Choose appropriate type' },
          { title: 'Add GSTIN', description: 'If customer is GST-registered' },
          { title: 'Set credit limit', description: 'Based on your credit policy' },
          { title: 'Save party', description: 'Party is now ready for invoicing' },
        ],
        tips: [
          'Always verify GSTIN format before saving',
          'Set realistic credit limits based on your risk assessment',
          'Keep contact information updated for communication',
        ],
      },
      {
        title: 'Tracking Supplier Payments',
        description: 'Monitor what you owe to suppliers.',
        scenario: 'You need to know outstanding amounts to suppliers.',
        steps: [
          { title: 'Go to Parties section', description: 'View all parties' },
          { title: 'Click on supplier name', description: 'Open supplier detail page' },
          { title: 'View outstanding balance', description: 'See total amount due' },
          { title: 'Check invoice list', description: 'See all purchase invoices' },
          { title: 'Record payments', description: 'Mark invoices as paid' },
        ],
      },
    ],
    bestPractices: [
      {
        title: 'Use Complete Information',
        description: 'Fill in all available fields when creating parties.',
        why: 'Complete information helps with invoicing, GST compliance, and communication.',
        example: 'Include GSTIN, PAN, and complete addresses for GST-compliant invoicing.',
      },
      {
        title: 'Regular Credit Review',
        description: 'Periodically review and update credit limits.',
        why: 'Helps manage cash flow and reduce bad debt risk.',
      },
      {
        title: 'Consistent Naming',
        description: 'Use standardized naming conventions for parties.',
        why: 'Makes searching and reporting easier.',
        example: 'Use full business names: "ABC Trading Company" instead of "ABC".',
      },
    ],
    faqs: [
      {
        question: 'Can I change a party type after creating it?',
        answer: 'Yes, you can edit a party and change its type from Customer to Supplier or Both at any time.',
      },
      {
        question: 'What happens if I exceed a party\'s credit limit?',
        answer: 'The app will show a warning, but you can still create invoices. It\'s recommended to review credit limits regularly.',
      },
      {
        question: 'Is GSTIN mandatory for parties?',
        answer: 'No, GSTIN is optional. However, it\'s required for GST-compliant invoicing and tax reporting.',
      },
      {
        question: 'Can I delete a party?',
        answer: 'Yes, but only if there are no transactions linked to it. If transactions exist, you can mark the party as inactive instead.',
      },
    ],
    relatedFeatures: ['invoices', 'payments', 'reports'],
  },

  'parties-adding': {
    id: 'parties-adding',
    title: 'Adding a New Party',
    category: 'parties',
    level: 'beginner',
    overview: {
      what: 'Create a new customer or supplier record in the system.',
      why: 'Parties are required before you can create invoices or record payments.',
      when: 'When onboarding a new customer or supplier.',
    },
    quickStart: {
      summary: 'Click "Add Party", fill in name and type, add optional details, and save.',
      steps: [
        {
          title: 'Open Add Party Form',
          description: 'Click "Add Party" button on Parties page.',
        },
        {
          title: 'Enter Required Fields',
          description: 'Name and type are required; all other fields are optional.',
        },
        {
          title: 'Add Optional Details',
          description: 'Include contact info, GSTIN, addresses, and credit terms.',
        },
        {
          title: 'Save Party',
          description: 'Click Save to create the party record.',
        },
      ],
    },
    detailedGuide: {
      introduction: 'Adding parties is straightforward. Only name and type are required; all other information is optional but recommended.',
      steps: [
        {
          title: 'Required Information',
          description: 'Minimum information needed to create a party.',
          details: [
            'Party Name: Full business or person name (2-200 characters)',
            'Type: Customer, Supplier, or Both',
          ],
        },
        {
          title: 'Contact Information',
          description: 'Add phone and email for communication.',
          details: [
            'Phone: 10-digit mobile number (starts with 6-9)',
            'Email: Valid email address',
          ],
        },
        {
          title: 'Tax Information',
          description: 'GST and PAN details for tax compliance.',
          details: [
            'GSTIN: 15-character GST identification number (format validated)',
            'PAN: 10-character Permanent Account Number',
          ],
        },
        {
          title: 'Addresses',
          description: 'Billing and shipping addresses.',
          details: [
            'Billing Address: Used for invoicing and tax purposes',
            'Shipping Address: Delivery address (can be same as billing)',
            'Include city, state, and 6-digit pincode',
          ],
        },
        {
          title: 'Credit Terms',
          description: 'Set credit limits and payment terms.',
          details: [
            'Credit Limit: Maximum amount you\'ll allow on credit',
            'Credit Period: Number of days for payment (e.g., 30 days)',
          ],
        },
      ],
    },
    useCases: [
      {
        title: 'Quick Party Creation',
        description: 'Add a party with minimal information for immediate use.',
        scenario: 'You need to create an invoice quickly and only know the party name.',
        steps: [
          { title: 'Enter party name', description: 'Minimum required field' },
          { title: 'Select type', description: 'Customer or Supplier' },
          { title: 'Save', description: 'Party is ready to use' },
        ],
        tips: [
          'You can add more details later by editing the party',
          'Name should be unique and identifiable',
        ],
      },
    ],
    bestPractices: [
      {
        title: 'Verify GSTIN Format',
        description: 'Always double-check GSTIN before saving.',
        why: 'Invalid GSTIN causes issues with GST-compliant invoicing.',
      },
    ],
    faqs: [
      {
        question: 'What if I make a mistake in party details?',
        answer: 'You can edit the party anytime by clicking on it and selecting Edit.',
      },
      {
        question: 'Can I add a party without GSTIN?',
        answer: 'Yes, GSTIN is optional. You can add it later if needed.',
      },
    ],
  },

  // INVENTORY
  'inventory-overview': {
    id: 'inventory-overview',
    title: 'Inventory Management',
    category: 'inventory',
    level: 'beginner',
    overview: {
      what: 'Manage your products, track stock levels, and get alerts when items are running low.',
      why: 'Proper inventory management ensures you never run out of stock and helps maintain accurate financial records.',
      when: 'Use this to add products, update stock levels, check low stock alerts, and manage item details.',
    },
    quickStart: {
      summary: 'Add items with prices and GST rates, track stock levels, and receive low stock alerts.',
      steps: [
        {
          title: 'Add Inventory Item',
          description: 'Go to Inventory → Add Item and enter product details.',
        },
        {
          title: 'Set Stock Levels',
          description: 'Enter initial stock quantity and set low stock threshold.',
        },
        {
          title: 'Update Stock',
          description: 'Go to Inventory → Stock to adjust quantities.',
        },
        {
          title: 'Monitor Low Stock',
          description: 'Dashboard shows items running low on stock.',
        },
      ],
    },
    detailedGuide: {
      introduction: 'Inventory management helps you track products, prices, and stock levels. Stock is automatically updated when you create invoices.',
      steps: [
        {
          title: 'Adding Items',
          description: 'Create product records with all necessary details.',
          details: [
            'Go to Inventory section',
            'Click "Add Item" button',
            'Enter item name (required)',
            'Set selling price and purchase price',
            'Add GST rate (e.g., 18%, 5%, 0%)',
            'Set unit of measurement (pieces, kg, liters, etc.)',
            'Enter initial stock quantity',
            'Set low stock alert threshold',
            'Save item',
          ],
        },
        {
          title: 'Stock Management',
          description: 'Track and adjust stock levels.',
          details: [
            'Stock automatically decreases when you create sale invoices',
            'Stock automatically increases when you create purchase invoices',
            'Manually adjust stock from Inventory → Stock page',
            'View stock history and adjustments',
          ],
        },
        {
          title: 'Low Stock Alerts',
          description: 'Get notified when items are running low.',
          details: [
            'Set low stock threshold for each item',
            'Dashboard shows low stock items',
            'Notifications appear when stock falls below threshold',
            'Filter inventory by stock status',
          ],
        },
        {
          title: 'Item Pricing',
          description: 'Manage selling and purchase prices.',
          details: [
            'Selling Price: Price you charge customers',
            'Purchase Price: Price you pay suppliers',
            'Prices can be updated anytime',
            'Price history can be viewed in item details',
          ],
        },
      ],
    },
    useCases: [
      {
        title: 'Adding New Product',
        description: 'Add a new product to your inventory.',
        scenario: 'You\'ve started selling a new product and need to add it to the system.',
        steps: [
          { title: 'Go to Inventory → Add Item', description: 'Open item creation form' },
          { title: 'Enter product name', description: 'Use clear, descriptive name' },
          { title: 'Set prices', description: 'Enter selling and purchase prices' },
          { title: 'Add GST rate', description: 'Select appropriate tax rate' },
          { title: 'Set initial stock', description: 'Enter current stock quantity' },
          { title: 'Set low stock alert', description: 'Define minimum stock level' },
          { title: 'Save item', description: 'Item is ready for invoicing' },
        ],
      },
      {
        title: 'Stock Adjustment',
        description: 'Correct stock discrepancies.',
        scenario: 'Physical stock count shows different quantity than system.',
        steps: [
          { title: 'Go to Inventory → Stock', description: 'View stock management page' },
          { title: 'Find the item', description: 'Search or filter items' },
          { title: 'Click Adjust Stock', description: 'Open adjustment dialog' },
          { title: 'Enter new quantity', description: 'Set correct stock level' },
          { title: 'Add reason', description: 'Note why adjustment was made' },
          { title: 'Save adjustment', description: 'Stock is updated' },
        ],
      },
    ],
    bestPractices: [
      {
        title: 'Regular Stock Audits',
        description: 'Periodically verify physical stock matches system records.',
        why: 'Ensures accuracy and helps identify theft or errors.',
      },
      {
        title: 'Set Realistic Low Stock Alerts',
        description: 'Set alerts based on your reorder time and sales velocity.',
        why: 'Prevents stockouts while avoiding overstocking.',
      },
      {
        title: 'Use Consistent Item Names',
        description: 'Standardize naming conventions for items.',
        why: 'Makes searching and reporting easier.',
      },
    ],
    faqs: [
      {
        question: 'How is stock updated automatically?',
        answer: 'When you create a sale invoice, stock decreases. When you create a purchase invoice, stock increases.',
      },
      {
        question: 'Can I delete an item?',
        answer: 'You can only delete items with no transaction history. For items with transactions, mark them as inactive.',
      },
      {
        question: 'What if I sell items not in inventory?',
        answer: 'You can create invoices with items not in inventory. However, it\'s recommended to add all items for better tracking.',
      },
      {
        question: 'How do I handle items with different units?',
        answer: 'Set the unit when creating the item (pieces, kg, liters, etc.). The unit is displayed on invoices.',
      },
    ],
    relatedFeatures: ['invoices', 'reports'],
  },

  // INVOICES
  'invoices-overview': {
    id: 'invoices-overview',
    title: 'Creating and Managing Invoices',
    category: 'invoices',
    level: 'beginner',
    overview: {
      what: 'Create professional invoices for sales and purchases with automatic GST calculations.',
      why: 'Invoices are legal documents for transactions and required for GST compliance and accounting.',
      when: 'Use this whenever you make a sale or purchase that needs to be documented.',
    },
    quickStart: {
      summary: 'Select party, add items, review totals, and save. Download PDF to share with customers.',
      steps: [
        {
          title: 'Create Invoice',
          description: 'Go to Invoices → Create Invoice.',
        },
        {
          title: 'Select Party',
          description: 'Choose customer or supplier from the list.',
        },
        {
          title: 'Add Items',
          description: 'Select items from inventory or add custom items.',
        },
        {
          title: 'Review and Save',
          description: 'Check totals and GST, then save invoice.',
        },
        {
          title: 'Download PDF',
          description: 'Share professional invoice with party.',
        },
      ],
    },
    detailedGuide: {
      introduction: 'Invoices document your sales and purchases. The app automatically calculates GST, totals, and updates inventory.',
      steps: [
        {
          title: 'Invoice Types',
          description: 'Choose the right invoice type for your transaction.',
          details: [
            'Sale: Invoice for goods/services you sell',
            'Purchase: Invoice for goods/services you buy',
            'Quotation: Price quote for potential sale',
            'Proforma: Proforma invoice before actual sale',
          ],
        },
        {
          title: 'Creating an Invoice',
          description: 'Step-by-step invoice creation process.',
          details: [
            'Go to Invoices → Create Invoice',
            'Select invoice type (Sale, Purchase, etc.)',
            'Choose party (customer or supplier)',
            'Set invoice date and due date',
            'Add items: select from inventory or enter manually',
            'For each item: enter quantity, price, discount, and tax rate',
            'Review subtotal, tax, and grand total',
            'Add notes or terms if needed',
            'Save invoice',
          ],
        },
        {
          title: 'GST Calculations',
          description: 'Understanding how GST is calculated.',
          details: [
            'GST is calculated automatically based on item tax rates',
            'Intra-state transactions: CGST + SGST',
            'Inter-state transactions: IGST',
            'Tax amounts are shown separately on invoice',
            'Total includes all taxes',
          ],
        },
        {
          title: 'Invoice Management',
          description: 'View, edit, and manage invoices.',
          details: [
            'View all invoices in list view',
            'Filter by type, party, date range',
            'Click invoice to view details',
            'Edit invoice if no payments are recorded',
            'Download PDF for sharing',
            'Mark invoice as paid when payment received',
          ],
        },
      ],
    },
    useCases: [
      {
        title: 'Creating a Sale Invoice',
        description: 'Invoice a customer for goods sold.',
        scenario: 'You\'ve sold products to a customer and need to create an invoice.',
        steps: [
          { title: 'Go to Invoices → Create Invoice', description: 'Open invoice creation form' },
          { title: 'Select "Sale" type', description: 'Choose invoice type' },
          { title: 'Select customer', description: 'Choose from party list' },
          { title: 'Set invoice date', description: 'Today\'s date or backdate if needed' },
          { title: 'Add items sold', description: 'Select from inventory or add manually' },
          { title: 'Enter quantities and prices', description: 'Verify amounts are correct' },
          { title: 'Review GST calculations', description: 'Check tax amounts' },
          { title: 'Set due date', description: 'When payment is expected' },
          { title: 'Save invoice', description: 'Invoice is created and numbered' },
          { title: 'Download PDF', description: 'Share with customer' },
        ],
        tips: [
          'Double-check party GSTIN for correct GST calculation',
          'Verify item prices before saving',
          'Set realistic due dates based on credit terms',
        ],
      },
      {
        title: 'Creating a Purchase Invoice',
        description: 'Record an invoice from a supplier.',
        scenario: 'You\'ve received goods from a supplier with an invoice.',
        steps: [
          { title: 'Go to Invoices → Create Invoice', description: 'Open invoice creation form' },
          { title: 'Select "Purchase" type', description: 'Choose invoice type' },
          { title: 'Select supplier', description: 'Choose from party list' },
          { title: 'Enter supplier invoice number', description: 'Reference number from supplier' },
          { title: 'Add items purchased', description: 'Match items from supplier invoice' },
          { title: 'Enter quantities and prices', description: 'As per supplier invoice' },
          { title: 'Review totals', description: 'Verify against supplier invoice' },
          { title: 'Save invoice', description: 'Purchase is recorded' },
        ],
      },
    ],
    bestPractices: [
      {
        title: 'Verify Party GSTIN',
        description: 'Ensure party GSTIN is correct before creating invoice.',
        why: 'Incorrect GSTIN leads to wrong GST calculations and compliance issues.',
      },
      {
        title: 'Use Inventory Items',
        description: 'Select items from inventory when possible.',
        why: 'Automatically updates stock and uses correct prices and tax rates.',
      },
      {
        title: 'Set Realistic Due Dates',
        description: 'Set due dates based on actual payment terms.',
        why: 'Helps with cash flow planning and payment tracking.',
      },
      {
        title: 'Review Before Saving',
        description: 'Always review totals and calculations before saving.',
        why: 'Prevents errors that are difficult to correct later.',
      },
    ],
    faqs: [
      {
        question: 'Can I edit an invoice after saving?',
        answer: 'Yes, you can edit invoices that don\'t have payments recorded. Once payment is recorded, editing is restricted.',
      },
      {
        question: 'How are invoice numbers generated?',
        answer: 'Invoice numbers are automatically generated sequentially. You can customize the format in settings.',
      },
      {
        question: 'What if I need to cancel an invoice?',
        answer: 'You can create a credit note to reverse an invoice. This maintains proper accounting records.',
      },
      {
        question: 'Can I create invoices without GST?',
        answer: 'Yes, you can set tax rate to 0% for non-GST items or parties.',
      },
      {
        question: 'How do I handle partial payments?',
        answer: 'Record partial payments against invoices. The system tracks remaining balance automatically.',
      },
    ],
    relatedFeatures: ['parties', 'inventory', 'payments', 'reports'],
  },

  // PAYMENTS
  'payments-overview': {
    id: 'payments-overview',
    title: 'Recording and Tracking Payments',
    category: 'payments',
    level: 'beginner',
    overview: {
      what: 'Record payments received from customers and payments made to suppliers, and track outstanding balances.',
      why: 'Payment tracking helps manage cash flow, follow up on overdue invoices, and maintain accurate financial records.',
      when: 'Use this whenever you receive or make a payment, or need to check what\'s owed to/from parties.',
    },
    quickStart: {
      summary: 'Record payments, link to invoices, track outstanding balances, and view payment history.',
      steps: [
        {
          title: 'Record Payment',
          description: 'Go to Payments → Record Payment.',
        },
        {
          title: 'Select Party',
          description: 'Choose customer or supplier.',
        },
        {
          title: 'Enter Amount',
          description: 'Enter payment amount and mode.',
        },
        {
          title: 'Link to Invoice',
          description: 'Optionally link payment to specific invoice(s).',
        },
        {
          title: 'Save Payment',
          description: 'Payment is recorded and balances updated.',
        },
      ],
    },
    detailedGuide: {
      introduction: 'Payment management helps you track all money coming in and going out, and maintain accurate account balances.',
      steps: [
        {
          title: 'Recording Payments',
          description: 'Record payments received or made.',
          details: [
            'Go to Payments → Record Payment',
            'Select party (customer or supplier)',
            'Choose payment type: Received (from customer) or Paid (to supplier)',
            'Enter payment amount',
            'Select payment mode: Cash, Bank Transfer, UPI, Cheque, etc.',
            'Enter payment date',
            'Optionally link to specific invoice(s)',
            'Add reference number (cheque number, UPI transaction ID, etc.)',
            'Add notes if needed',
            'Save payment',
          ],
        },
        {
          title: 'Linking Payments to Invoices',
          description: 'Connect payments to specific invoices.',
          details: [
            'When recording payment, you can link it to one or more invoices',
            'Select invoices from the outstanding invoices list',
            'Allocate payment amount across invoices',
            'System automatically updates invoice status',
            'Invoices are marked as paid when fully paid',
          ],
        },
        {
          title: 'Viewing Payment History',
          description: 'Track all payments for a party.',
          details: [
            'Go to party detail page',
            'View all payments made/received',
            'See payment dates, amounts, and modes',
            'Check which invoices were paid',
            'View outstanding balance',
          ],
        },
        {
          title: 'Outstanding Balances',
          description: 'Monitor what\'s owed to and from parties.',
          details: [
            'Dashboard shows total receivables and payables',
            'Party detail page shows party-specific balance',
            'Invoice list shows payment status',
            'Filter invoices by payment status',
          ],
        },
      ],
    },
    useCases: [
      {
        title: 'Recording Customer Payment',
        description: 'Record payment received from a customer.',
        scenario: 'A customer has paid you for an invoice.',
        steps: [
          { title: 'Go to Payments → Record Payment', description: 'Open payment form' },
          { title: 'Select customer', description: 'Choose from party list' },
          { title: 'Select "Received" type', description: 'Payment received from customer' },
          { title: 'Enter payment amount', description: 'Amount received' },
          { title: 'Select payment mode', description: 'Cash, UPI, Bank Transfer, etc.' },
          { title: 'Link to invoice', description: 'Select invoice(s) being paid' },
          { title: 'Add reference number', description: 'Transaction ID or cheque number' },
          { title: 'Save payment', description: 'Payment recorded and balance updated' },
        ],
      },
      {
        title: 'Tracking Overdue Payments',
        description: 'Identify and follow up on overdue invoices.',
        scenario: 'You need to know which customers haven\'t paid on time.',
        steps: [
          { title: 'Go to Invoices section', description: 'View all invoices' },
          { title: 'Filter by status', description: 'Select "Overdue" or "Pending"' },
          { title: 'View overdue invoices', description: 'See which invoices are past due date' },
          { title: 'Check party details', description: 'See total outstanding for each party' },
          { title: 'Send reminders', description: 'Contact parties for payment' },
        ],
      },
    ],
    bestPractices: [
      {
        title: 'Link Payments to Invoices',
        description: 'Always link payments to specific invoices when possible.',
        why: 'Provides clear audit trail and accurate invoice status.',
      },
      {
        title: 'Record Payments Promptly',
        description: 'Record payments as soon as they\'re received or made.',
        why: 'Keeps balances accurate and helps with cash flow management.',
      },
      {
        title: 'Use Reference Numbers',
        description: 'Always add reference numbers for bank transfers, UPI, cheques.',
        why: 'Helps with reconciliation and dispute resolution.',
      },
    ],
    faqs: [
      {
        question: 'Can I record partial payments?',
        answer: 'Yes, you can record partial payments and link them to invoices. The system tracks remaining balance.',
      },
      {
        question: 'What if I receive payment for multiple invoices?',
        answer: 'You can link one payment to multiple invoices. Allocate the payment amount across invoices.',
      },
      {
        question: 'Can I edit or delete a payment?',
        answer: 'You can edit payments, but deletion is restricted once invoices are linked. Contact support if you need to correct a payment.',
      },
      {
        question: 'How do I handle advance payments?',
        answer: 'Record advance payments without linking to invoices. Link them later when invoices are created.',
      },
    ],
    relatedFeatures: ['invoices', 'parties', 'reports'],
  },

  // REPORTS
  'reports-overview': {
    id: 'reports-overview',
    title: 'Reports and Analytics',
    category: 'reports',
    level: 'intermediate',
    overview: {
      what: 'View comprehensive business reports including sales, purchases, profit & loss, GST reports, and party statements.',
      why: 'Reports help you understand business performance, make informed decisions, and ensure GST compliance.',
      when: 'Use reports for monthly reviews, GST filing, financial analysis, and business planning.',
    },
    quickStart: {
      summary: 'Access various reports from the Reports section, filter by date range, and export data.',
      steps: [
        {
          title: 'Open Reports',
          description: 'Go to Reports section from dashboard.',
        },
        {
          title: 'Select Report Type',
          description: 'Choose from Overview, Sales, Purchases, Parties, Stock, or GST.',
        },
        {
          title: 'Set Date Range',
          description: 'Filter reports by date range.',
        },
        {
          title: 'View Data',
          description: 'Review charts, tables, and summaries.',
        },
        {
          title: 'Export if Needed',
          description: 'Export report data to Excel.',
        },
      ],
    },
    detailedGuide: {
      introduction: 'Reports provide insights into your business performance, financial health, and compliance status.',
      steps: [
        {
          title: 'Overview Report',
          description: 'High-level business metrics and KPIs.',
          details: [
            'Total sales and purchases',
            'Outstanding receivables and payables',
            'Profit & Loss summary',
            'Top customers and suppliers',
            'Low stock alerts',
          ],
        },
        {
          title: 'Sales Report',
          description: 'Detailed sales analysis.',
          details: [
            'Sales by period (daily, weekly, monthly)',
            'Sales by customer',
            'Sales by item',
            'Growth trends',
            'Top selling items',
          ],
        },
        {
          title: 'Purchase Report',
          description: 'Purchase and expense analysis.',
          details: [
            'Purchases by period',
            'Purchases by supplier',
            'Expense categories',
            'Cost analysis',
          ],
        },
        {
          title: 'Party Statements',
          description: 'Detailed statements for customers and suppliers.',
          details: [
            'Outstanding balances',
            'Transaction history',
            'Aging analysis',
            'Payment history',
          ],
        },
        {
          title: 'GST Reports',
          description: 'GST compliance and filing reports.',
          details: [
            'GSTR-1 format data',
            'Tax summary',
            'Input and output tax',
            'GST liability',
          ],
        },
        {
          title: 'Stock Report',
          description: 'Inventory status and valuation.',
          details: [
            'Current stock levels',
            'Stock valuation',
            'Low stock items',
            'Stock movement history',
          ],
        },
      ],
    },
    useCases: [
      {
        title: 'Monthly Business Review',
        description: 'Review business performance for the month.',
        scenario: 'End of month - you need to review business performance.',
        steps: [
          { title: 'Go to Reports → Overview', description: 'View high-level metrics' },
          { title: 'Check sales and purchases', description: 'Compare with previous month' },
          { title: 'Review profit & loss', description: 'Understand profitability' },
          { title: 'Check outstanding balances', description: 'Monitor receivables and payables' },
          { title: 'Export data if needed', description: 'Save for records' },
        ],
      },
      {
        title: 'GST Filing Preparation',
        description: 'Prepare data for GST return filing.',
        scenario: 'Time to file monthly GST return.',
        steps: [
          { title: 'Go to Reports → GST', description: 'Open GST reports' },
          { title: 'Select date range', description: 'Month for filing' },
          { title: 'Review GSTR-1 data', description: 'Verify invoice details' },
          { title: 'Check tax summary', description: 'Verify tax calculations' },
          { title: 'Export data', description: 'Use for GST portal filing' },
        ],
      },
    ],
    bestPractices: [
      {
        title: 'Regular Review',
        description: 'Review reports regularly (weekly or monthly).',
        why: 'Helps identify trends and issues early.',
      },
      {
        title: 'Compare Periods',
        description: 'Compare current period with previous periods.',
        why: 'Shows growth trends and seasonality.',
      },
      {
        title: 'Export Important Reports',
        description: 'Export and save important reports.',
        why: 'Maintains records and allows offline analysis.',
      },
    ],
    faqs: [
      {
        question: 'How far back can I view reports?',
        answer: 'You can view reports for any date range. There\'s no limit on historical data.',
      },
      {
        question: 'Can I customize reports?',
        answer: 'Basic customization is available (date range, filters). Advanced customization may be available in future updates.',
      },
      {
        question: 'Are reports real-time?',
        answer: 'Yes, reports reflect all transactions up to the current moment.',
      },
      {
        question: 'Can I export reports?',
        answer: 'Yes, most reports can be exported to Excel format.',
      },
    ],
    relatedFeatures: ['invoices', 'payments', 'parties', 'inventory'],
  },

  // BUSINESS SETTINGS
  'business-overview': {
    id: 'business-overview',
    title: 'Business Setup and Management',
    category: 'business',
    level: 'beginner',
    overview: {
      what: 'Configure your business profile, GST settings, and business preferences.',
      why: 'Proper business setup ensures all invoices, reports, and compliance documents show correct information.',
      when: 'Set up when first using the app, and update when business details change.',
    },
    quickStart: {
      summary: 'Create or select business, enter details including GSTIN, and configure settings.',
      steps: [
        {
          title: 'Select or Create Business',
          description: 'Go to Business → Select Business.',
        },
        {
          title: 'Enter Business Details',
          description: 'Add name, address, contact information.',
        },
        {
          title: 'Add GSTIN',
          description: 'Enter and validate GSTIN if applicable.',
        },
        {
          title: 'Configure Settings',
          description: 'Set financial year, tax preferences, etc.',
        },
        {
          title: 'Save Business',
          description: 'Business is ready to use.',
        },
      ],
    },
    detailedGuide: {
      introduction: 'Business setup is the foundation of your account. All transactions and reports use this information.',
      steps: [
        {
          title: 'Business Profile',
          description: 'Enter complete business information.',
          details: [
            'Business Name: Legal or trading name',
            'Address: Complete business address',
            'Contact: Phone and email',
            'PAN: Permanent Account Number',
            'GSTIN: GST Identification Number (if registered)',
          ],
        },
        {
          title: 'GST Configuration',
          description: 'Set up GST-related settings.',
          details: [
            'GSTIN is validated automatically',
            'Set GST registration date',
            'Choose composition scheme if applicable',
            'Configure tax preferences',
          ],
        },
        {
          title: 'Financial Settings',
          description: 'Configure financial year and accounting preferences.',
          details: [
            'Set financial year start date',
            'Choose accounting method (cash/accrual)',
            'Set currency and number format',
          ],
        },
        {
          title: 'Multi-Business Support',
          description: 'Manage multiple businesses from one account.',
          details: [
            'Create multiple business profiles',
            'Switch between businesses',
            'Each business has separate data',
            'Useful for managing multiple ventures',
          ],
        },
      ],
    },
    useCases: [
      {
        title: 'Initial Business Setup',
        description: 'Set up your business for the first time.',
        scenario: 'You\'re new to the app and need to configure everything.',
        steps: [
          { title: 'Go to Business → Select Business', description: 'Open business management' },
          { title: 'Click "Create New Business"', description: 'Start business creation' },
          { title: 'Enter business name and address', description: 'Complete profile' },
          { title: 'Add GSTIN if registered', description: 'For GST compliance' },
          { title: 'Set financial year', description: 'Configure accounting period' },
          { title: 'Save business', description: 'Business is configured' },
        ],
      },
    ],
    bestPractices: [
      {
        title: 'Use Legal Business Name',
        description: 'Enter the exact legal or registered business name.',
        why: 'Appears on all invoices and legal documents.',
      },
      {
        title: 'Verify GSTIN',
        description: 'Double-check GSTIN before saving.',
        why: 'Incorrect GSTIN causes compliance issues.',
      },
      {
        title: 'Keep Information Updated',
        description: 'Update business details when they change.',
        why: 'Ensures all documents show current information.',
      },
    ],
    faqs: [
      {
        question: 'Can I change my business GSTIN later?',
        answer: 'Yes, you can edit business details including GSTIN. However, this may affect historical GST reports.',
      },
      {
        question: 'Do I need GSTIN to use the app?',
        answer: 'No, you can use the app without GSTIN. However, GSTIN is required for GST-compliant invoicing.',
      },
      {
        question: 'Can I have multiple businesses?',
        answer: 'Yes, you can create and manage multiple businesses from one account.',
      },
    ],
    relatedFeatures: ['invoices', 'reports'],
  },
};

// Helper function to get documentation by ID
export function getDocumentation(id: string): FeatureDocumentation | undefined {
  return documentation[id];
}

// Helper function to get all documentation for a category
export function getDocumentationByCategory(category: DocumentationCategory): FeatureDocumentation[] {
  return Object.values(documentation).filter(doc => doc.category === category);
}

// Helper function to search documentation
export function searchDocumentation(query: string): FeatureDocumentation[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(documentation).filter(doc => {
    return (
      doc.title.toLowerCase().includes(lowerQuery) ||
      doc.overview.what.toLowerCase().includes(lowerQuery) ||
      doc.overview.why.toLowerCase().includes(lowerQuery) ||
      doc.detailedGuide.introduction.toLowerCase().includes(lowerQuery) ||
      doc.useCases.some(uc => uc.title.toLowerCase().includes(lowerQuery) || uc.description.toLowerCase().includes(lowerQuery)) ||
      doc.faqs.some(faq => faq.question.toLowerCase().includes(lowerQuery) || faq.answer.toLowerCase().includes(lowerQuery))
    );
  });
}

// Helper function to get related documentation
export function getRelatedDocumentation(id: string): FeatureDocumentation[] {
  const doc = documentation[id];
  if (!doc || !doc.relatedFeatures) return [];
  
  return doc.relatedFeatures
    .map(featureId => Object.values(documentation).find(d => d.id.includes(featureId)))
    .filter((d): d is FeatureDocumentation => d !== undefined);
}

// Helper function to get all FAQs
export function getAllFAQs(): FAQ[] {
  return Object.values(documentation).flatMap(doc => doc.faqs);
}

// Helper function to get FAQs by category
export function getFAQsByCategory(category: DocumentationCategory): FAQ[] {
  return Object.values(documentation)
    .filter(doc => doc.category === category)
    .flatMap(doc => doc.faqs);
}


