# Reporting Plan - Comprehensive Implementation Guide

## Executive Summary

This document outlines a comprehensive plan for implementing a robust reporting system for the business management application. The plan covers backend service architecture, API endpoints, report types, export functionality, and implementation phases.

**Status:** 📋 Planning Phase  
**Priority:** 🔴 High (Required for MVP completion)  
**Estimated Implementation Time:** 4-6 weeks

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Report Service Architecture](#report-service-architecture)
3. [Report Types & Specifications](#report-types--specifications)
4. [API Endpoints](#api-endpoints)
5. [Export Functionality](#export-functionality)
6. [Implementation Phases](#implementation-phases)
7. [Database Schema](#database-schema)
8. [Testing Strategy](#testing-strategy)
9. [Performance Considerations](#performance-considerations)

---

## Current State Analysis

### ✅ What Exists

1. **Frontend Reports Page** (`web-app/app/reports/page.tsx`)
   - Basic UI with tabs: Overview, Sales, Purchases, Parties, Stock, GST
   - Client-side calculations from fetched data
   - Basic PDF export for dashboard
   - GSTR-1 and GSTR-3B JSON export (client-side)

2. **Data Sources Available**
   - Invoice Service (Port 3006)
   - Payment Service (Port 3007)
   - Party Service (Port 3004)
   - Inventory Service (Port 3005)
   - Business Service (Port 3003)

### ❌ What's Missing

1. **Dedicated Report Service**
   - No backend service for report generation
   - No centralized report logic
   - No report caching or optimization

2. **Backend Report APIs**
   - No `/api/reports/*` endpoints
   - Reports calculated on frontend (inefficient)
   - No server-side filtering/aggregation

3. **Advanced Reports**
   - Profit & Loss (P&L)
   - Balance Sheet
   - Cash Book
   - Bank Book
   - Day Book
   - Trial Balance
   - Ledger Reports
   - Aging Reports
   - Tax Summary Reports

4. **Export Features**
   - Limited PDF export
   - No Excel export
   - No scheduled reports
   - No email delivery

---

## Report Service Architecture

### Service Structure

```
report-service/
├── src/
│   ├── controllers/
│   │   ├── report.controller.ts
│   │   └── health.controller.ts
│   ├── services/
│   │   ├── report.service.ts
│   │   ├── sales-report.service.ts
│   │   ├── purchase-report.service.ts
│   │   ├── financial-report.service.ts
│   │   ├── gst-report.service.ts
│   │   ├── inventory-report.service.ts
│   │   └── export.service.ts
│   ├── repositories/
│   │   ├── report-cache.repository.ts
│   │   └── scheduled-report.repository.ts
│   ├── entities/
│   │   ├── report-cache.entity.ts
│   │   └── scheduled-report.entity.ts
│   ├── dto/
│   │   └── report.dto.ts
│   └── utils/
│       ├── excel-generator.ts
│       └── pdf-generator.ts
```

### Service Dependencies

The report service will need to:
- **Read from:** Invoice, Payment, Party, Inventory, Business services
- **Use:** Shared DTOs and entities
- **Provide:** RESTful APIs for report generation

### Technology Stack

- **Framework:** NestJS (consistent with other services)
- **Database:** PostgreSQL (for report caching and scheduled reports)
- **Export Libraries:**
  - PDF: `pdfkit` or `puppeteer`
  - Excel: `exceljs`
  - JSON: Native Node.js

---

## Report Types & Specifications

### 1. Financial Reports

#### 1.1 Profit & Loss (P&L) Report
**Purpose:** Show business profitability over a period

**Data Required:**
- Revenue (Sales invoices)
- Cost of Goods Sold (Purchase invoices)
- Operating Expenses
- Other Income/Expenses
- Net Profit/Loss

**Filters:**
- Date range (from_date, to_date)
- Group by: Day, Week, Month, Quarter, Year
- Business ID (required)

**Output Format:**
```json
{
  "period": "2024-12-01 to 2024-12-31",
  "income": {
    "sales": 1000000,
    "other_income": 50000,
    "total": 1050000
  },
  "expenses": {
    "purchases": 500000,
    "operating_expenses": 200000,
    "other_expenses": 50000,
    "total": 750000
  },
  "gross_profit": 500000,
  "net_profit": 300000,
  "breakdown": {
    "by_month": [...],
    "by_category": [...]
  }
}
```

#### 1.2 Balance Sheet
**Purpose:** Show assets, liabilities, and equity at a point in time

**Data Required:**
- Assets (Current & Fixed)
- Liabilities (Current & Long-term)
- Equity (Capital, Retained Earnings)
- Opening balances

**Filters:**
- As on date (required)
- Business ID (required)

**Output Format:**
```json
{
  "as_on_date": "2024-12-31",
  "assets": {
    "current": {
      "cash": 500000,
      "receivables": 300000,
      "inventory": 200000,
      "total": 1000000
    },
    "fixed": {
      "property": 2000000,
      "equipment": 500000,
      "total": 2500000
    },
    "total": 3500000
  },
  "liabilities": {
    "current": {
      "payables": 200000,
      "short_term_loans": 100000,
      "total": 300000
    },
    "long_term": {
      "loans": 500000,
      "total": 500000
    },
    "total": 800000
  },
  "equity": {
    "capital": 2000000,
    "retained_earnings": 700000,
    "total": 2700000
  }
}
```

#### 1.3 Cash Book
**Purpose:** Track all cash transactions

**Data Required:**
- Opening balance
- Cash receipts (sales, payments received)
- Cash payments (purchases, expenses)
- Closing balance

**Filters:**
- Date range
- Business ID

#### 1.4 Bank Book
**Purpose:** Track all bank transactions

**Data Required:**
- Opening balance
- Bank receipts
- Bank payments
- Closing balance
- Bank reconciliation data

**Filters:**
- Date range
- Bank account (optional)
- Business ID

#### 1.5 Day Book
**Purpose:** All transactions for a specific day

**Data Required:**
- Sales invoices
- Purchase invoices
- Payments (received & made)
- Expenses
- Journal entries

**Filters:**
- Date (required)
- Business ID

#### 1.6 Trial Balance
**Purpose:** List all ledger accounts with debit/credit balances

**Data Required:**
- All ledger accounts
- Opening balances
- Transaction totals
- Closing balances

**Filters:**
- As on date
- Business ID

### 2. Sales Reports

#### 2.1 Sales Report
**Purpose:** Detailed sales analysis

**Data Required:**
- Sales invoices
- Customer details
- Item-wise sales
- Tax breakdown

**Filters:**
- Date range
- Customer (party_id)
- Item (item_id)
- Group by: Day, Week, Month, Customer, Item

**Output Format:**
```json
{
  "period": "2024-12-01 to 2024-12-31",
  "summary": {
    "total_sales": 1000000,
    "total_invoices": 50,
    "average_invoice_value": 20000,
    "total_tax": 180000
  },
  "by_customer": [...],
  "by_item": [...],
  "by_period": [...],
  "top_customers": [...],
  "top_items": [...]
}
```

#### 2.2 Sales Trend Report
**Purpose:** Show sales trends over time

**Data Required:**
- Sales by period (daily/weekly/monthly)
- Growth percentage
- Comparison with previous period

**Filters:**
- Date range
- Group by period
- Business ID

### 3. Purchase Reports

#### 3.1 Purchase Report
**Purpose:** Detailed purchase analysis

**Data Required:**
- Purchase invoices
- Supplier details
- Item-wise purchases
- Tax breakdown

**Filters:**
- Date range
- Supplier (party_id)
- Item (item_id)
- Group by: Day, Week, Month, Supplier, Item

#### 3.2 Purchase Trend Report
**Purpose:** Show purchase trends over time

**Data Required:**
- Purchases by period
- Growth percentage
- Comparison with previous period

### 4. Party Reports

#### 4.1 Outstanding Report (Receivables & Payables)
**Purpose:** Track outstanding amounts

**Data Required:**
- Party-wise outstanding
- Aging buckets (0-30, 30-60, 60-90, 90+ days)
- Overdue amounts
- Payment history

**Filters:**
- As on date
- Party ID (optional)
- Business ID

**Output Format:**
```json
{
  "as_on_date": "2024-12-31",
  "receivables": {
    "total": 500000,
    "aging": {
      "0_30_days": 200000,
      "30_60_days": 150000,
      "60_90_days": 100000,
      "90_plus_days": 50000
    },
    "overdue": 150000,
    "party_wise": [...]
  },
  "payables": {
    "total": 200000,
    "aging": {...},
    "party_wise": [...]
  },
  "net_outstanding": 300000
}
```

#### 4.2 Party Ledger
**Purpose:** Complete transaction history for a party

**Data Required:**
- All invoices (sales/purchase)
- All payments
- Running balance
- Credit limit utilization

**Filters:**
- Party ID (required)
- Date range
- Business ID

#### 4.3 Customer Statement
**Purpose:** Statement for customer (for sharing)

**Data Required:**
- Opening balance
- All invoices
- All payments
- Closing balance
- Aging summary

**Filters:**
- Party ID (required)
- Date range
- Business ID

### 5. Inventory Reports

#### 5.1 Stock Report
**Purpose:** Current inventory status

**Data Required:**
- Item-wise stock
- Stock value
- Low stock items
- Stock movement history

**Filters:**
- Item ID (optional)
- Category (optional)
- Business ID

**Output Format:**
```json
{
  "as_on_date": "2024-12-31",
  "summary": {
    "total_items": 100,
    "total_stock_value": 500000,
    "low_stock_items": 10
  },
  "items": [
    {
      "item_id": 1,
      "item_name": "Product A",
      "current_stock": 50,
      "unit": "pcs",
      "stock_value": 50000,
      "min_stock_level": 20,
      "status": "in_stock"
    }
  ],
  "low_stock": [...],
  "out_of_stock": [...]
}
```

#### 5.2 Stock Movement Report
**Purpose:** Track stock changes over time

**Data Required:**
- Opening stock
- Purchases
- Sales
- Adjustments
- Closing stock

**Filters:**
- Date range
- Item ID (optional)
- Business ID

#### 5.3 Stock Valuation Report
**Purpose:** Calculate inventory value

**Data Required:**
- Item-wise stock
- Cost prices
- Valuation method (FIFO/LIFO/Weighted Average)
- Total value

**Filters:**
- As on date
- Valuation method
- Business ID

### 6. GST Reports

#### 6.1 GSTR-1 Report
**Purpose:** Outward supplies for GST filing

**Data Required:**
- B2B invoices (with GSTIN)
- B2C invoices (summary)
- HSN-wise summary
- Place of supply
- Tax rates

**Filters:**
- Period (MMYYYY format)
- Business ID

**Output Format:** GSTN JSON schema

#### 6.2 GSTR-3B Report
**Purpose:** Monthly GST return summary

**Data Required:**
- Output tax (sales)
- Input tax credit (purchases)
- Net tax payable
- Tax by rate

**Filters:**
- Period (MMYYYY format)
- Business ID

#### 6.3 Tax Summary Report
**Purpose:** Overall tax summary

**Data Required:**
- Sales tax (CGST/SGST/IGST)
- Purchase tax (CGST/SGST/IGST)
- Net tax payable
- Tax by rate

**Filters:**
- Date range
- Business ID

### 7. Accounting Reports

#### 7.1 Ledger Report
**Purpose:** Account-wise transaction details

**Data Required:**
- Account opening balance
- All transactions
- Running balance
- Closing balance

**Filters:**
- Account ID (required)
- Date range
- Business ID

#### 7.2 Group Summary Report
**Purpose:** Summary by account group

**Data Required:**
- Account groups (Assets, Liabilities, Income, Expenses)
- Group totals
- Sub-group breakdown

**Filters:**
- As on date
- Business ID

---

## API Endpoints

### Base URL
`http://localhost:3008/api/v1/reports`

### Authentication
All endpoints require:
- `Authorization: Bearer <token>`
- `X-Business-Id: <business_uuid>`

### Endpoints

#### 1. Financial Reports

##### GET `/reports/profit-loss`
Generate Profit & Loss report

**Query Parameters:**
- `from_date` (required): YYYY-MM-DD
- `to_date` (required): YYYY-MM-DD
- `group_by` (optional): day | week | month | quarter | year

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "2024-12-01 to 2024-12-31",
    "income": {...},
    "expenses": {...},
    "net_profit": 300000
  }
}
```

##### GET `/reports/balance-sheet`
Generate Balance Sheet

**Query Parameters:**
- `as_on_date` (required): YYYY-MM-DD

**Response:**
```json
{
  "success": true,
  "data": {
    "as_on_date": "2024-12-31",
    "assets": {...},
    "liabilities": {...},
    "equity": {...}
  }
}
```

##### GET `/reports/cash-book`
Generate Cash Book

**Query Parameters:**
- `from_date` (required): YYYY-MM-DD
- `to_date` (required): YYYY-MM-DD

##### GET `/reports/bank-book`
Generate Bank Book

**Query Parameters:**
- `from_date` (required): YYYY-MM-DD
- `to_date` (required): YYYY-MM-DD
- `bank_account_id` (optional): UUID

##### GET `/reports/daybook`
Generate Day Book

**Query Parameters:**
- `date` (required): YYYY-MM-DD

##### GET `/reports/trial-balance`
Generate Trial Balance

**Query Parameters:**
- `as_on_date` (required): YYYY-MM-DD

#### 2. Sales Reports

##### GET `/reports/sales`
Generate Sales Report

**Query Parameters:**
- `from_date` (required): YYYY-MM-DD
- `to_date` (required): YYYY-MM-DD
- `party_id` (optional): UUID
- `item_id` (optional): UUID
- `group_by` (optional): day | week | month | party | item

##### GET `/reports/sales/trend`
Generate Sales Trend Report

**Query Parameters:**
- `from_date` (required): YYYY-MM-DD
- `to_date` (required): YYYY-MM-DD
- `group_by` (required): day | week | month

#### 3. Purchase Reports

##### GET `/reports/purchase`
Generate Purchase Report

**Query Parameters:**
- `from_date` (required): YYYY-MM-DD
- `to_date` (required): YYYY-MM-DD
- `party_id` (optional): UUID
- `item_id` (optional): UUID
- `group_by` (optional): day | week | month | party | item

##### GET `/reports/purchase/trend`
Generate Purchase Trend Report

**Query Parameters:**
- `from_date` (required): YYYY-MM-DD
- `to_date` (required): YYYY-MM-DD
- `group_by` (required): day | week | month

#### 4. Party Reports

##### GET `/reports/outstanding`
Generate Outstanding Report

**Query Parameters:**
- `as_on_date` (optional): YYYY-MM-DD (default: today)
- `party_id` (optional): UUID

##### GET `/reports/party/:partyId/ledger`
Generate Party Ledger

**Query Parameters:**
- `from_date` (optional): YYYY-MM-DD
- `to_date` (optional): YYYY-MM-DD

##### GET `/reports/party/:partyId/statement`
Generate Customer Statement

**Query Parameters:**
- `from_date` (optional): YYYY-MM-DD
- `to_date` (optional): YYYY-MM-DD

#### 5. Inventory Reports

##### GET `/reports/stock`
Generate Stock Report

**Query Parameters:**
- `as_on_date` (optional): YYYY-MM-DD (default: today)
- `item_id` (optional): UUID
- `category_id` (optional): UUID

##### GET `/reports/stock/movement`
Generate Stock Movement Report

**Query Parameters:**
- `from_date` (required): YYYY-MM-DD
- `to_date` (required): YYYY-MM-DD
- `item_id` (optional): UUID

##### GET `/reports/stock/valuation`
Generate Stock Valuation Report

**Query Parameters:**
- `as_on_date` (required): YYYY-MM-DD
- `valuation_method` (optional): fifo | lifo | weighted_average

#### 6. GST Reports

##### GET `/reports/gst/gstr1`
Generate GSTR-1 Report

**Query Parameters:**
- `period` (required): MMYYYY (e.g., 122024)
- `format` (optional): json | excel (default: json)

##### GET `/reports/gst/gstr3b`
Generate GSTR-3B Report

**Query Parameters:**
- `period` (required): MMYYYY
- `format` (optional): json | excel

##### GET `/reports/gst/tax-summary`
Generate Tax Summary Report

**Query Parameters:**
- `from_date` (required): YYYY-MM-DD
- `to_date` (required): YYYY-MM-DD

#### 7. Accounting Reports

##### GET `/reports/ledger/:accountId`
Generate Ledger Report

**Query Parameters:**
- `from_date` (optional): YYYY-MM-DD
- `to_date` (optional): YYYY-MM-DD

##### GET `/reports/group-summary`
Generate Group Summary Report

**Query Parameters:**
- `as_on_date` (required): YYYY-MM-DD

#### 8. Export Endpoints

##### POST `/reports/export`
Export report in specified format

**Request Body:**
```json
{
  "report_type": "sales",
  "format": "pdf",
  "parameters": {
    "from_date": "2024-12-01",
    "to_date": "2024-12-31"
  },
  "options": {
    "include_charts": true,
    "include_summary": true
  }
}
```

**Response:**
- PDF: Binary file with `Content-Type: application/pdf`
- Excel: Binary file with `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- JSON: JSON response

#### 9. Scheduled Reports

##### POST `/reports/schedule`
Schedule a report

**Request Body:**
```json
{
  "report_type": "profit_loss",
  "schedule": {
    "frequency": "monthly",
    "day": 1,
    "time": "09:00"
  },
  "parameters": {
    "from_date": "auto",
    "to_date": "auto"
  },
  "export_format": "pdf",
  "recipients": ["user@example.com"]
}
```

##### GET `/reports/schedule`
List scheduled reports

##### DELETE `/reports/schedule/:id`
Delete scheduled report

---

## Export Functionality

### Export Formats

#### 1. PDF Export
**Library:** `pdfkit` or `puppeteer`

**Features:**
- Professional formatting
- Charts and graphs (using image generation)
- Multi-page support
- Custom branding
- Watermarks (for drafts)

**Use Cases:**
- Financial statements
- Customer statements
- GST reports
- Invoice reports

#### 2. Excel Export
**Library:** `exceljs`

**Features:**
- Multiple sheets
- Formulas
- Formatting (colors, fonts, borders)
- Charts
- Filters and sorting

**Use Cases:**
- Detailed transaction reports
- Data analysis
- Bulk data export
- GST filing data

#### 3. JSON Export
**Library:** Native Node.js

**Features:**
- Structured data
- Easy to parse
- API integration

**Use Cases:**
- GST portal upload
- Third-party integrations
- Data backup

### Export Service Structure

```typescript
export class ExportService {
  async exportToPDF(reportData: any, template: string): Promise<Buffer>
  async exportToExcel(reportData: any, options: ExcelOptions): Promise<Buffer>
  async exportToJSON(reportData: any): Promise<string>
  async generateChart(data: any, type: string): Promise<Buffer>
}
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal:** Set up report service infrastructure

**Tasks:**
1. Create report-service NestJS project
2. Set up database connection
3. Create base entities and repositories
4. Implement health check endpoint
5. Set up service communication (HTTP clients for other services)
6. Create base report service structure

**Deliverables:**
- Report service running on port 3008
- Health check working
- Database connection established
- Basic service structure

### Phase 2: Basic Reports (Week 2)
**Goal:** Implement essential reports

**Tasks:**
1. Sales Report
2. Purchase Report
3. Outstanding Report
4. Stock Report
5. Tax Summary Report

**Deliverables:**
- 5 working report endpoints
- Basic export (JSON)
- Frontend integration

### Phase 3: Financial Reports (Week 3)
**Goal:** Implement financial statements

**Tasks:**
1. Profit & Loss Report
2. Balance Sheet
3. Cash Book
4. Bank Book
5. Day Book
6. Trial Balance

**Deliverables:**
- 6 financial report endpoints
- PDF export for financial reports
- Frontend integration

### Phase 4: Advanced Reports (Week 4)
**Goal:** Implement advanced and GST reports

**Tasks:**
1. Party Ledger
2. Customer Statement
3. Stock Movement Report
4. Stock Valuation Report
5. GSTR-1 Report
6. GSTR-3B Report
7. Ledger Report
8. Group Summary Report

**Deliverables:**
- 8 advanced report endpoints
- GST report generation
- Excel export

### Phase 5: Export & Optimization (Week 5)
**Goal:** Complete export functionality and optimize

**Tasks:**
1. PDF export for all reports
2. Excel export for all reports
3. Report caching
4. Performance optimization
5. Error handling improvements

**Deliverables:**
- Full export functionality
- Cached reports
- Optimized performance

### Phase 6: Scheduled Reports (Week 6)
**Goal:** Implement scheduled reports

**Tasks:**
1. Scheduled report entity
2. Cron job for scheduled reports
3. Email delivery
4. Report history
5. UI for managing scheduled reports

**Deliverables:**
- Scheduled report functionality
- Email delivery
- Management UI

---

## Database Schema

### Report Cache Entity

```typescript
@Entity('report_cache')
export class ReportCache {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  business_id: string;

  @Column()
  report_type: string;

  @Column('jsonb')
  parameters: Record<string, any>;

  @Column('jsonb')
  report_data: any;

  @Column()
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
```

### Scheduled Report Entity

```typescript
@Entity('scheduled_reports')
export class ScheduledReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  business_id: string;

  @Column()
  user_id: string;

  @Column()
  report_type: string;

  @Column('jsonb')
  parameters: Record<string, any>;

  @Column()
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

  @Column({ nullable: true })
  day: number; // Day of month/week

  @Column()
  time: string; // HH:mm format

  @Column('text', { array: true })
  recipients: string[];

  @Column()
  export_format: 'pdf' | 'excel' | 'json';

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

---

## Testing Strategy

### Unit Tests
- Test each report service method
- Test data aggregation logic
- Test export generation
- Test error handling

### Integration Tests
- Test API endpoints
- Test service communication
- Test database operations
- Test export file generation

### E2E Tests
- Test complete report generation flow
- Test export downloads
- Test scheduled reports
- Test frontend integration

### Performance Tests
- Test with large datasets
- Test report generation time
- Test cache effectiveness
- Test concurrent requests

---

## Performance Considerations

### 1. Report Caching
- Cache frequently accessed reports
- Cache key: `business_id:report_type:parameters_hash`
- TTL: 1 hour for dynamic reports, 24 hours for static reports
- Invalidate cache on data updates

### 2. Database Optimization
- Use indexes on date columns
- Use materialized views for complex aggregations
- Partition large tables by date
- Use query optimization techniques

### 3. Async Processing
- For large reports, use background jobs
- Return job ID immediately
- Poll for completion status
- Store generated reports temporarily

### 4. Pagination
- For large datasets, implement pagination
- Default page size: 100 records
- Maximum page size: 1000 records

### 5. Rate Limiting
- Limit report generation requests
- Prevent abuse
- Implement request queuing for heavy reports

---

## Frontend Integration

### API Client Updates

Add report API client to `web-app/lib/api-client.ts`:

```typescript
export const reportApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_REPORT_API_URL || 'http://localhost:3008/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Report Service Hook

Create `web-app/lib/hooks/use-report.ts`:

```typescript
export function useReport(reportType: string, params: ReportParams) {
  return useQuery({
    queryKey: ['report', reportType, params],
    queryFn: async () => {
      const response = await reportApi.get(`/reports/${reportType}`, { params });
      return response.data;
    },
  });
}
```

### Update Reports Page

Update `web-app/app/reports/page.tsx` to:
- Use backend APIs instead of client-side calculations
- Add loading states
- Add error handling
- Improve export functionality

---

## Success Metrics

1. **Performance**
   - Report generation time < 5 seconds for standard reports
   - Report generation time < 30 seconds for complex reports
   - Cache hit rate > 70%

2. **Reliability**
   - 99.9% uptime
   - Error rate < 1%
   - All reports generate correctly

3. **User Experience**
   - Reports load within 3 seconds
   - Export downloads work seamlessly
   - Scheduled reports delivered on time

---

## Dependencies

### External Services
- Invoice Service (Port 3006)
- Payment Service (Port 3007)
- Party Service (Port 3004)
- Inventory Service (Port 3005)
- Business Service (Port 3003)

### Libraries
- `@nestjs/common`
- `@nestjs/typeorm`
- `typeorm`
- `axios` (for service communication)
- `pdfkit` or `puppeteer` (for PDF)
- `exceljs` (for Excel)
- `node-cron` (for scheduled reports)
- `nodemailer` (for email delivery)

---

## Risk Mitigation

### Risk 1: Performance Issues with Large Datasets
**Mitigation:**
- Implement pagination
- Use database indexes
- Cache frequently accessed reports
- Use background jobs for heavy reports

### Risk 2: Service Communication Failures
**Mitigation:**
- Implement retry logic
- Use circuit breakers
- Cache service responses
- Graceful degradation

### Risk 3: Export File Size Issues
**Mitigation:**
- Implement file size limits
- Use streaming for large files
- Compress exports
- Provide download links instead of direct download

---

## Next Steps

1. **Review & Approval**
   - Review this plan with team
   - Get stakeholder approval
   - Prioritize features

2. **Setup**
   - Create report-service project
   - Set up development environment
   - Configure database

3. **Implementation**
   - Start with Phase 1
   - Follow TDD approach
   - Regular code reviews

4. **Testing**
   - Write tests alongside development
   - Perform integration testing
   - User acceptance testing

5. **Deployment**
   - Deploy to staging
   - Performance testing
   - Deploy to production

---

## Appendix

### A. Report Type Codes

| Code | Report Name |
|------|-------------|
| `profit_loss` | Profit & Loss |
| `balance_sheet` | Balance Sheet |
| `cash_book` | Cash Book |
| `bank_book` | Bank Book |
| `daybook` | Day Book |
| `trial_balance` | Trial Balance |
| `sales` | Sales Report |
| `purchase` | Purchase Report |
| `outstanding` | Outstanding Report |
| `party_ledger` | Party Ledger |
| `customer_statement` | Customer Statement |
| `stock` | Stock Report |
| `stock_movement` | Stock Movement |
| `stock_valuation` | Stock Valuation |
| `gstr1` | GSTR-1 |
| `gstr3b` | GSTR-3B |
| `tax_summary` | Tax Summary |
| `ledger` | Ledger Report |
| `group_summary` | Group Summary |

### B. Export Format Codes

| Code | Format |
|------|--------|
| `pdf` | PDF Document |
| `excel` | Excel Spreadsheet |
| `json` | JSON Data |
| `csv` | CSV File |

### C. Group By Options

| Option | Description |
|--------|-------------|
| `day` | Group by day |
| `week` | Group by week |
| `month` | Group by month |
| `quarter` | Group by quarter |
| `year` | Group by year |
| `party` | Group by party |
| `item` | Group by item |
| `category` | Group by category |

---

**Document Version:** 1.0  
**Last Updated:** 2024-12-20  
**Author:** Development Team  
**Status:** 📋 Ready for Implementation


