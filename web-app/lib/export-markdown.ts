/**
 * Markdown Export Utilities
 * 
 * Provides functions to export data in Markdown format (.md files)
 * Professional, readable format suitable for documentation and sharing
 */

import { format } from 'date-fns';

// Types
interface Invoice {
  id: string;
  invoice_number: string;
  invoice_type: 'sale' | 'purchase';
  invoice_date: string;
  due_date?: string;
  status: string;
  subtotal_amount?: number;
  tax_amount?: number;
  total_amount: number;
  notes?: string;
  items?: Array<{
    item_name?: string;
    name?: string;
    quantity?: number;
    unit?: string;
    rate?: number;
    unit_price?: number;
    amount?: number;
    hsn_code?: string;
    gst_rate?: number;
  }>;
  party?: {
    name?: string;
    gstin?: string;
    phone?: string;
    email?: string;
  };
}

interface Party {
  id?: string;
  name?: string;
  party_name?: string;
  type?: string;
  party_type?: string;
  gstin?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  opening_balance?: number;
  credit_limit?: number;
}

interface InventoryItem {
  id?: string;
  name?: string;
  item_name?: string;
  category?: string;
  hsn_code?: string;
  unit?: string;
  purchase_price?: number;
  selling_price?: number;
  current_stock?: number;
  stock_quantity?: number;
  min_stock_level?: number;
  low_stock_threshold?: number;
  gst_rate?: number;
  status?: string;
}

interface Payment {
  id?: string;
  invoice_number?: string;
  party_name?: string;
  amount?: number;
  payment_date?: string;
  payment_mode?: string;
  mode?: string;
  reference_number?: string;
  reference?: string;
  transaction_type?: string;
  notes?: string;
}

// Helper to format currency
const formatCurrency = (amount: number | undefined): string => {
  if (amount === undefined || amount === null) return '₹0.00';
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Helper to format date
const formatDate = (date: string | Date | undefined): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'MMMM dd, yyyy');
  } catch {
    return 'Invalid Date';
  }
};

// Download markdown file
const downloadMarkdown = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${format(new Date(), 'yyyyMMdd')}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Export Invoices to Markdown
 */
export const exportInvoicesToMarkdown = (
  invoices: Invoice[],
  filename: string = 'invoices'
): void => {
  const content = generateInvoiceMarkdown(invoices);
  downloadMarkdown(content, filename);
};

const generateInvoiceMarkdown = (invoices: Invoice[]): string => {
  const header = `# Invoices Report

**Generated:** ${format(new Date(), 'MMMM dd, yyyy')}  
**Total Invoices:** ${invoices.length}

---

`;

  // Summary table
  const summaryTable = `## Summary

| Invoice # | Type | Party | Date | Status | Total Amount |
|-----------|------|-------|------|--------|--------------|
${invoices.map(inv => {
  const partyName = inv.party?.name || 'N/A';
  const invType = inv.invoice_type === 'sale' ? 'Sale' : 'Purchase';
  const invDate = formatDate(inv.invoice_date);
  const total = formatCurrency(inv.total_amount);
  return `| ${inv.invoice_number} | ${invType} | ${partyName} | ${invDate} | ${inv.status.toUpperCase()} | ${total} |`;
}).join('\n')}

---

`;

  // Detailed invoice information
  const details = invoices.map(inv => {
    const isSale = inv.invoice_type === 'sale';
    const invType = isSale ? 'Sale Invoice' : 'Purchase Invoice';
    
    return `
## ${inv.invoice_number}

### Invoice Information

- **Type:** ${invType}
- **Date:** ${formatDate(inv.invoice_date)}
${inv.due_date ? `- **Due Date:** ${formatDate(inv.due_date)}` : ''}
- **Status:** ${inv.status.toUpperCase()}

### Party Details

${inv.party ? `
- **Name:** ${inv.party.name || 'N/A'}
${inv.party.gstin ? `- **GSTIN:** ${inv.party.gstin}` : ''}
${inv.party.phone ? `- **Phone:** ${inv.party.phone}` : ''}
${inv.party.email ? `- **Email:** ${inv.party.email}` : ''}
` : '- **Party:** N/A'}

### Items

${inv.items && inv.items.length > 0 ? `
| # | Item Name | HSN Code | Quantity | Unit | Rate | GST Rate | Amount |
|---|-----------|----------|----------|------|------|----------|--------|
${inv.items.map((item, idx) => {
  const itemName = item.item_name || item.name || 'N/A';
  const qty = item.quantity || 0;
  const unit = item.unit || 'pcs';
  const rate = formatCurrency(item.rate || item.unit_price || 0);
  const gstRate = `${item.gst_rate || 0}%`;
  const amount = formatCurrency(item.amount || (qty * (item.rate || item.unit_price || 0)));
  return `| ${idx + 1} | ${itemName} | ${item.hsn_code || '-'} | ${qty} | ${unit} | ${rate} | ${gstRate} | ${amount} |`;
}).join('\n')}
` : 'No items'}

### Financial Summary

- **Subtotal:** ${formatCurrency(inv.subtotal_amount)}
- **Tax (GST):** ${formatCurrency(inv.tax_amount)}
- **Total Amount:** **${formatCurrency(inv.total_amount)}**

${inv.notes ? `### Notes

${inv.notes}
` : ''}

---

`;
  }).join('\n');

  return header + summaryTable + details;
};

/**
 * Export Parties to Markdown
 */
export const exportPartiesToMarkdown = (
  parties: Party[],
  filename: string = 'parties'
): void => {
  const content = generatePartyMarkdown(parties);
  downloadMarkdown(content, filename);
};

const generatePartyMarkdown = (parties: Party[]): string => {
  const header = `# Parties Directory

**Generated:** ${format(new Date(), 'MMMM dd, yyyy')}  
**Total Parties:** ${parties.length}

---

`;

  // Group by type
  const customers = parties.filter(p => (p.type || p.party_type) === 'customer');
  const suppliers = parties.filter(p => (p.type || p.party_type) === 'supplier');

  let content = header;

  if (customers.length > 0) {
    content += `## Customers (${customers.length})

`;
    content += customers.map(party => generatePartyDetails(party)).join('\n---\n\n');
    content += '\n\n';
  }

  if (suppliers.length > 0) {
    content += `## Suppliers (${suppliers.length})

`;
    content += suppliers.map(party => generatePartyDetails(party)).join('\n---\n\n');
    content += '\n\n';
  }

  // Summary table
  content += `## Summary Table

| Name | Type | Phone | Email | GSTIN | City | State |
|------|------|-------|-------|-------|------|-------|
${parties.map(p => {
  const name = p.name || p.party_name || 'N/A';
  const type = (p.type || p.party_type || 'N/A').toUpperCase();
  const phone = p.phone || p.mobile || 'N/A';
  const email = p.email || 'N/A';
  const gstin = p.gstin || 'N/A';
  const city = p.city || 'N/A';
  const state = p.state || 'N/A';
  return `| ${name} | ${type} | ${phone} | ${email} | ${gstin} | ${city} | ${state} |`;
}).join('\n')}

`;

  return content;
};

const generatePartyDetails = (party: Party): string => {
  const name = party.name || party.party_name || 'N/A';
  const type = (party.type || party.party_type || 'N/A').toUpperCase();
  
  return `### ${name}

- **Type:** ${type}
${party.phone || party.mobile ? `- **Phone:** ${party.phone || party.mobile}` : ''}
${party.email ? `- **Email:** ${party.email}` : ''}
${party.gstin ? `- **GSTIN:** ${party.gstin}` : ''}
${party.address || party.city || party.state || party.pincode ? `- **Address:** ${[party.address, party.city, party.state, party.pincode].filter(Boolean).join(', ')}` : ''}
${party.opening_balance !== undefined ? `- **Opening Balance:** ${formatCurrency(party.opening_balance)}` : ''}
${party.credit_limit !== undefined ? `- **Credit Limit:** ${formatCurrency(party.credit_limit)}` : ''}`;
};

/**
 * Export Inventory to Markdown
 */
export const exportInventoryToMarkdown = (
  items: InventoryItem[],
  filename: string = 'inventory'
): void => {
  const content = generateInventoryMarkdown(items);
  downloadMarkdown(content, filename);
};

const generateInventoryMarkdown = (items: InventoryItem[]): string => {
  const header = `# Inventory Report

**Generated:** ${format(new Date(), 'MMMM dd, yyyy')}  
**Total Items:** ${items.length}

---

`;

  // Summary by category
  const categories = [...new Set(items.map(item => item.category || 'Uncategorized'))];
  const categorySummary = `## Summary by Category

${categories.map(cat => {
  const categoryItems = items.filter(item => (item.category || 'Uncategorized') === cat);
  const totalValue = categoryItems.reduce((sum, item) => {
    const stock = item.current_stock || item.stock_quantity || 0;
    const price = item.purchase_price || 0;
    return sum + (stock * price);
  }, 0);
  return `- **${cat}:** ${categoryItems.length} items (Total Value: ${formatCurrency(totalValue)})`;
}).join('\n')}

---

`;

  // Low stock items
  const lowStockItems = items.filter(item => {
    const stock = item.current_stock || item.stock_quantity || 0;
    const minStock = item.min_stock_level || item.low_stock_threshold || 0;
    return minStock > 0 && stock <= minStock;
  });

  const lowStockSection = lowStockItems.length > 0 ? `
## ⚠️ Low Stock Alert

The following ${lowStockItems.length} item(s) are running low on stock:

${lowStockItems.map(item => {
  const name = item.name || item.item_name || 'N/A';
  const stock = item.current_stock || item.stock_quantity || 0;
  const minStock = item.min_stock_level || item.low_stock_threshold || 0;
  return `- **${name}:** Current: ${stock}, Minimum: ${minStock}`;
}).join('\n')}

---

` : '';

  // Detailed table
  const table = `## Item Details

| Item Name | Category | HSN Code | Unit | Purchase Price | Selling Price | Stock | Min Stock | GST Rate | Status |
|-----------|----------|----------|------|---------------|---------------|-------|-----------|----------|--------|
${items.map(item => {
  const name = item.name || item.item_name || 'N/A';
  const category = item.category || 'Uncategorized';
  const hsn = item.hsn_code || '-';
  const unit = item.unit || 'pcs';
  const purchasePrice = formatCurrency(item.purchase_price);
  const sellingPrice = formatCurrency(item.selling_price);
  const stock = item.current_stock || item.stock_quantity || 0;
  const minStock = item.min_stock_level || item.low_stock_threshold || 0;
  const gstRate = `${item.gst_rate || 0}%`;
  const status = item.status || 'active';
  const stockStatus = minStock > 0 && stock <= minStock ? '⚠️ LOW' : '✓ OK';
  return `| ${name} | ${category} | ${hsn} | ${unit} | ${purchasePrice} | ${sellingPrice} | ${stock} ${stockStatus} | ${minStock} | ${gstRate} | ${status.toUpperCase()} |`;
}).join('\n')}

`;

  return header + categorySummary + lowStockSection + table;
};

/**
 * Export Payments to Markdown
 */
export const exportPaymentsToMarkdown = (
  payments: Payment[],
  filename: string = 'payments'
): void => {
  const content = generatePaymentMarkdown(payments);
  downloadMarkdown(content, filename);
};

const generatePaymentMarkdown = (payments: Payment[]): string => {
  const header = `# Payments Register

**Generated:** ${format(new Date(), 'MMMM dd, yyyy')}  
**Total Payments:** ${payments.length}

---

`;

  // Summary by payment mode
  const paymentModes = [...new Set(payments.map(p => p.payment_mode || p.mode || 'N/A'))];
  const modeSummary = `## Summary by Payment Mode

${paymentModes.map(mode => {
  const modePayments = payments.filter(p => (p.payment_mode || p.mode || 'N/A') === mode);
  const totalAmount = modePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  return `- **${mode}:** ${modePayments.length} payment(s) - Total: ${formatCurrency(totalAmount)}`;
}).join('\n')}

---

`;

  // Detailed table
  const table = `## Payment Details

| Payment ID | Invoice # | Party | Amount | Date | Mode | Reference | Type |
|------------|-----------|-------|--------|------|------|-----------|------|
${payments.map(p => {
  const id = p.id || 'N/A';
  const invNum = p.invoice_number || '-';
  const party = p.party_name || 'N/A';
  const amount = formatCurrency(p.amount);
  const date = formatDate(p.payment_date);
  const mode = p.payment_mode || p.mode || 'N/A';
  const ref = p.reference_number || p.reference || '-';
  const type = p.transaction_type || 'N/A';
  return `| ${id} | ${invNum} | ${party} | ${amount} | ${date} | ${mode} | ${ref} | ${type} |`;
}).join('\n')}

`;

  return header + modeSummary + table;
};

/**
 * Export Dashboard Summary to Markdown
 */
export const exportDashboardToMarkdown = (
  stats: {
    totalSales?: number;
    totalPurchases?: number;
    totalPaymentsReceived?: number;
    totalPaymentsMade?: number;
    receivableAmount?: number;
    payableAmount?: number;
    totalParties?: number;
    totalInvoices?: number;
    totalItems?: number;
  },
  filename: string = 'dashboard_summary'
): void => {
  const content = generateDashboardMarkdown(stats);
  downloadMarkdown(content, filename);
};

const generateDashboardMarkdown = (stats: {
  totalSales?: number;
  totalPurchases?: number;
  totalPaymentsReceived?: number;
  totalPaymentsMade?: number;
  receivableAmount?: number;
  payableAmount?: number;
  totalParties?: number;
  totalInvoices?: number;
  totalItems?: number;
}): string => {
  return `# Business Dashboard Summary

**Generated:** ${format(new Date(), 'MMMM dd, yyyy, hh:mm a')}

---

## Financial Overview

### Revenue & Expenses

| Metric | Amount |
|--------|--------|
| **Total Sales** | ${formatCurrency(stats.totalSales)} |
| **Total Purchases** | ${formatCurrency(stats.totalPurchases)} |
| **Net Revenue** | ${formatCurrency((stats.totalSales || 0) - (stats.totalPurchases || 0))} |

### Payments

| Metric | Amount |
|--------|--------|
| **Payments Received** | ${formatCurrency(stats.totalPaymentsReceived)} |
| **Payments Made** | ${formatCurrency(stats.totalPaymentsMade)} |
| **Net Cash Flow** | ${formatCurrency((stats.totalPaymentsReceived || 0) - (stats.totalPaymentsMade || 0))} |

### Outstanding Amounts

| Metric | Amount |
|--------|--------|
| **Receivables (To Receive)** | ${formatCurrency(stats.receivableAmount)} |
| **Payables (To Pay)** | ${formatCurrency(stats.payableAmount)} |

---

## Business Metrics

| Metric | Count |
|--------|-------|
| **Total Parties** | ${stats.totalParties || 0} |
| **Total Invoices** | ${stats.totalInvoices || 0} |
| **Total Inventory Items** | ${stats.totalItems || 0} |

---

## Summary

This report provides a comprehensive overview of your business performance. Use this information to make informed decisions about your operations, cash flow, and growth strategies.

**Report Generated:** ${format(new Date(), 'MMMM dd, yyyy, hh:mm a')}

`;
};

