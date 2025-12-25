import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

// Types
interface InvoiceItem {
  id?: string;
  item_name?: string;
  name?: string;
  hsn_code?: string;
  quantity?: number;
  unit?: string;
  rate?: number;
  unit_price?: number;
  amount?: number;
  gst_rate?: number;
  gst_amount?: number;
  tax_amount?: number;
  total?: number;
}

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
  items?: InvoiceItem[];
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
}

interface Business {
  name?: string;
  gstin?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
}

// Helper to format currency
const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Generate Invoice PDF
export const generateInvoicePDF = (
  invoice: Invoice,
  party: Party | null,
  business: Business = {}
): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const isSale = invoice.invoice_type === 'sale';

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(isSale ? 'TAX INVOICE' : 'PURCHASE INVOICE', pageWidth / 2, 20, { align: 'center' });

  // Invoice Number & Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice No: ${invoice.invoice_number}`, 14, 35);
  doc.text(`Date: ${format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}`, 14, 41);
  if (invoice.due_date) {
    doc.text(`Due Date: ${format(new Date(invoice.due_date), 'dd/MM/yyyy')}`, 14, 47);
  }

  // Business Details (Seller for Sale, Buyer for Purchase)
  const fromY = 55;
  doc.setFont('helvetica', 'bold');
  doc.text(isSale ? 'FROM:' : 'TO:', 14, fromY);
  doc.setFont('helvetica', 'normal');
  if (business.name) {
    doc.text(business.name, 14, fromY + 6);
    if (business.gstin) doc.text(`GSTIN: ${business.gstin}`, 14, fromY + 12);
    if (business.address) {
      const address = [business.address, business.city, business.state, business.pincode].filter(Boolean).join(', ');
      const lines = doc.splitTextToSize(address, 80);
      doc.text(lines, 14, fromY + 18);
    }
  } else {
    doc.text('Your Business', 14, fromY + 6);
  }

  // Party Details
  doc.setFont('helvetica', 'bold');
  doc.text(isSale ? 'TO:' : 'FROM:', 110, fromY);
  doc.setFont('helvetica', 'normal');
  if (party) {
    doc.text(party.name || party.party_name || 'Unknown', 110, fromY + 6);
    if (party.gstin) doc.text(`GSTIN: ${party.gstin}`, 110, fromY + 12);
    if (party.address) {
      const address = [party.address, party.city, party.state, party.pincode].filter(Boolean).join(', ');
      const lines = doc.splitTextToSize(address, 80);
      doc.text(lines, 110, fromY + 18);
    }
    if (party.phone || party.mobile) {
      doc.text(`Phone: ${party.phone || party.mobile}`, 110, fromY + 30);
    }
  }

  // Items Table
  const items = invoice.items || [];
  const tableData = items.map((item, index) => [
    index + 1,
    item.item_name || item.name || '',
    item.hsn_code || '-',
    item.quantity || 0,
    item.unit || 'Pcs',
    formatCurrency(item.rate || item.unit_price || 0),
    `${item.gst_rate || 0}%`,
    formatCurrency(item.amount || (item.quantity || 0) * (item.rate || item.unit_price || 0))
  ]);

  autoTable(doc, {
    startY: 95,
    head: [['#', 'Item', 'HSN', 'Qty', 'Unit', 'Rate', 'GST', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 50 },
      2: { cellWidth: 20 },
      3: { cellWidth: 15 },
      4: { cellWidth: 15 },
      5: { cellWidth: 25 },
      6: { cellWidth: 15 },
      7: { cellWidth: 30 }
    }
  });

  // Get the Y position after the table
  const finalY = (doc as any).lastAutoTable?.finalY || 150;

  // Summary
  const summaryX = 130;
  let summaryY = finalY + 10;
  
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', summaryX, summaryY);
  doc.text(formatCurrency(invoice.subtotal_amount || 0), pageWidth - 14, summaryY, { align: 'right' });
  
  summaryY += 6;
  doc.text('GST:', summaryX, summaryY);
  doc.text(formatCurrency(invoice.tax_amount || 0), pageWidth - 14, summaryY, { align: 'right' });
  
  summaryY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', summaryX, summaryY);
  doc.text(formatCurrency(invoice.total_amount || 0), pageWidth - 14, summaryY, { align: 'right' });

  // Status
  summaryY += 12;
  doc.setFontSize(11);
  const statusText = `Status: ${invoice.status?.toUpperCase() || 'PENDING'}`;
  doc.text(statusText, summaryX, summaryY);

  // Notes
  if (invoice.notes) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Notes:', 14, summaryY);
    const noteLines = doc.splitTextToSize(invoice.notes, 100);
    doc.text(noteLines, 14, summaryY + 6);
  }

  // Footer
  const footerY = doc.internal.pageSize.height - 20;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('This is a computer-generated invoice.', pageWidth / 2, footerY, { align: 'center' });

  // Download
  doc.save(`${invoice.invoice_number}.pdf`);
};

// Export Invoices List to Excel
export const exportInvoicesToExcel = (
  invoices: Invoice[],
  filename: string = 'invoices'
): void => {
  const data = invoices.map((inv) => ({
    'Invoice Number': inv.invoice_number,
    'Type': inv.invoice_type === 'sale' ? 'Sales' : 'Purchase',
    'Date': format(new Date(inv.invoice_date), 'dd/MM/yyyy'),
    'Due Date': inv.due_date ? format(new Date(inv.due_date), 'dd/MM/yyyy') : '',
    'Status': inv.status?.toUpperCase() || '',
    'Subtotal': inv.subtotal_amount || 0,
    'Tax': inv.tax_amount || 0,
    'Total': inv.total_amount || 0,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 15 }, // Invoice Number
    { wch: 10 }, // Type
    { wch: 12 }, // Date
    { wch: 12 }, // Due Date
    { wch: 10 }, // Status
    { wch: 12 }, // Subtotal
    { wch: 12 }, // Tax
    { wch: 12 }, // Total
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');
  XLSX.writeFile(workbook, `${filename}_${format(new Date(), 'yyyyMMdd')}.xlsx`);
};

// Export Parties to Excel
export const exportPartiesToExcel = (
  parties: Party[],
  filename: string = 'parties'
): void => {
  const data = parties.map((p) => ({
    'Name': p.name || p.party_name || '',
    'Type': (p.type || p.party_type || '').toUpperCase(),
    'GSTIN': p.gstin || '',
    'Phone': p.phone || p.mobile || '',
    'Email': p.email || '',
    'Address': p.address || '',
    'City': p.city || '',
    'State': p.state || '',
    'Pincode': p.pincode || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  
  worksheet['!cols'] = [
    { wch: 25 }, // Name
    { wch: 12 }, // Type
    { wch: 18 }, // GSTIN
    { wch: 14 }, // Phone
    { wch: 25 }, // Email
    { wch: 30 }, // Address
    { wch: 15 }, // City
    { wch: 15 }, // State
    { wch: 10 }, // Pincode
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Parties');
  XLSX.writeFile(workbook, `${filename}_${format(new Date(), 'yyyyMMdd')}.xlsx`);
};

// Export Inventory to Excel
export const exportInventoryToExcel = (
  items: any[],
  filename: string = 'inventory'
): void => {
  const data = items.map((item) => ({
    'Item Name': item.item_name || item.name || '',
    'Category': item.category || '',
    'HSN Code': item.hsn_code || '',
    'Unit': item.unit || '',
    'Purchase Price': item.purchase_price || item.cost_price || 0,
    'Selling Price': item.selling_price || item.sale_price || 0,
    'Stock Quantity': item.stock_quantity || item.quantity || 0,
    'Min Stock Level': item.min_stock_level || item.reorder_level || 0,
    'GST Rate': item.gst_rate || 0,
    'Status': item.status || 'active',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  
  worksheet['!cols'] = [
    { wch: 30 }, // Item Name
    { wch: 15 }, // Category
    { wch: 12 }, // HSN Code
    { wch: 8 },  // Unit
    { wch: 14 }, // Purchase Price
    { wch: 14 }, // Selling Price
    { wch: 14 }, // Stock Quantity
    { wch: 14 }, // Min Stock Level
    { wch: 10 }, // GST Rate
    { wch: 10 }, // Status
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
  XLSX.writeFile(workbook, `${filename}_${format(new Date(), 'yyyyMMdd')}.xlsx`);
};

// Export Payments to Excel
export const exportPaymentsToExcel = (
  payments: any[],
  filename: string = 'payments'
): void => {
  const data = payments.map((p) => ({
    'Payment ID': p.id || '',
    'Invoice Number': p.invoice_number || '',
    'Party Name': p.party_name || '',
    'Amount': p.amount || 0,
    'Payment Date': p.payment_date ? format(new Date(p.payment_date), 'dd/MM/yyyy') : '',
    'Payment Mode': p.payment_mode || p.mode || '',
    'Reference No': p.reference_number || p.reference || '',
    'Notes': p.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  
  worksheet['!cols'] = [
    { wch: 20 }, // Payment ID
    { wch: 15 }, // Invoice Number
    { wch: 25 }, // Party Name
    { wch: 12 }, // Amount
    { wch: 12 }, // Payment Date
    { wch: 15 }, // Payment Mode
    { wch: 20 }, // Reference No
    { wch: 30 }, // Notes
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments');
  XLSX.writeFile(workbook, `${filename}_${format(new Date(), 'yyyyMMdd')}.xlsx`);
};

// Generate PDF Report for Dashboard Summary
export const generateDashboardReportPDF = (
  stats: {
    totalSales?: number;
    totalPurchases?: number;
    totalReceived?: number;
    totalPaid?: number;
    receivableAmount?: number;
    payableAmount?: number;
    totalParties?: number;
    totalInvoices?: number;
  },
  recentInvoices: Invoice[] = [],
  business: Business = {}
): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Title
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('BUSINESS SUMMARY REPORT', pageWidth / 2, 20, { align: 'center' });

  // Business Name & Date
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  if (business.name) {
    doc.text(business.name, pageWidth / 2, 30, { align: 'center' });
  }
  doc.setFontSize(10);
  doc.text(`Generated on: ${format(new Date(), 'dd MMMM yyyy, hh:mm a')}`, pageWidth / 2, 38, { align: 'center' });

  // Summary Statistics
  let y = 55;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Financial Summary', 14, y);
  
  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const summaryData = [
    ['Total Sales', formatCurrency(stats.totalSales || 0)],
    ['Total Purchases', formatCurrency(stats.totalPurchases || 0)],
    ['Amount Received', formatCurrency(stats.totalReceived || 0)],
    ['Amount Paid', formatCurrency(stats.totalPaid || 0)],
    ['Receivable (Outstanding)', formatCurrency(stats.receivableAmount || 0)],
    ['Payable (Outstanding)', formatCurrency(stats.payableAmount || 0)],
  ];

  autoTable(doc, {
    startY: y,
    body: summaryData,
    theme: 'striped',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold' },
      1: { cellWidth: 50, halign: 'right' }
    }
  });

  // Recent Invoices
  y = (doc as any).lastAutoTable?.finalY + 15 || 130;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Recent Invoices', 14, y);

  if (recentInvoices.length > 0) {
    const invoiceData = recentInvoices.slice(0, 10).map((inv) => [
      inv.invoice_number,
      inv.invoice_type === 'sale' ? 'Sale' : 'Purchase',
      format(new Date(inv.invoice_date), 'dd/MM/yyyy'),
      inv.status?.toUpperCase() || '',
      formatCurrency(inv.total_amount || 0)
    ]);

    autoTable(doc, {
      startY: y + 5,
      head: [['Invoice #', 'Type', 'Date', 'Status', 'Amount']],
      body: invoiceData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 9 }
    });
  }

  // Footer
  const footerY = doc.internal.pageSize.height - 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Confidential - For internal use only', pageWidth / 2, footerY, { align: 'center' });

  // Download
  doc.save(`business_summary_${format(new Date(), 'yyyyMMdd')}.pdf`);
};
