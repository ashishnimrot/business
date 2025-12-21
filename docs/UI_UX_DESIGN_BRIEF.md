# UI/UX Design Brief & Guidelines

**Version:** 1.0  
**Created:** 2025-12-21  
**Last Updated:** 2025-12-21  
**Status:** Ready for Designer

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Target Users](#target-users)
3. [Design Objectives](#design-objectives)
4. [Core User Flows](#core-user-flows)
5. [Screen Requirements](#screen-requirements)
6. [Design System Specifications](#design-system-specifications)
7. [Mobile-First Guidelines](#mobile-first-guidelines)
8. [Accessibility Requirements](#accessibility-requirements)
9. [Deliverables](#deliverables)
10. [Timeline](#timeline)

---

## Project Overview

### Product Description

Business App is a mobile-first accounting and GST compliance application designed for Indian SMEs (Small and Medium Enterprises). The app enables business owners to manage invoicing, inventory, accounting, and GST compliance from their smartphones.

### Key Value Propositions

1. **Simplicity** - Easy to use without accounting knowledge
2. **Offline-First** - Works without internet connectivity
3. **GST Compliant** - Automatic GST calculation and filing
4. **Mobile-First** - Designed for on-the-go business owners
5. **Affordable** - Accessible pricing for small businesses

### Competitive Reference

- Vyapar (Primary competitor)
- Khatabook
- Tally (Desktop reference)
- Zoho Invoice

---

## Target Users

### Primary Persona: Rajesh - Small Business Owner

**Demographics:**
- Age: 35-50 years
- Education: Graduate/High School
- Location: Tier 2/3 cities in India
- Business: Retail shop, small manufacturer, service provider
- Annual Revenue: ₹20 Lakhs - ₹2 Crores

**Characteristics:**
- Limited technical expertise
- Busy managing multiple aspects of business
- Uses smartphone as primary device
- Prefers Hindi/regional languages
- Cost-conscious
- Relies on word-of-mouth for decisions

**Pain Points:**
- Complex accounting software
- Manual GST calculation errors
- Poor internet connectivity
- Expensive software licenses
- Difficulty tracking receivables

**Goals:**
- Easy invoice creation
- Accurate GST compliance
- Track who owes money
- Generate reports for CA

### Secondary Persona: Priya - Shop Manager/Accountant

**Demographics:**
- Age: 25-35 years
- Education: Commerce graduate
- Role: Manages accounts for small business

**Characteristics:**
- More tech-savvy than business owner
- Uses app daily for all transactions
- Needs speed and efficiency
- Values keyboard shortcuts

**Goals:**
- Quick data entry
- Accurate reports
- Bulk operations
- Export capabilities

---

## Design Objectives

### Primary Objectives

1. **Reduce Time to Invoice**
   - Target: Create invoice in <60 seconds
   - Current competitor average: 2-3 minutes

2. **Minimize Learning Curve**
   - Target: New user can create first invoice within 5 minutes
   - No training required for basic features

3. **Enable Offline Usage**
   - Clear indication of offline/online status
   - Seamless sync experience

4. **Support GST Compliance**
   - Automatic tax calculation
   - Error prevention for GST rules
   - Clear compliance status

### Design Principles

1. **Progressive Disclosure** - Show only what's needed, reveal complexity gradually
2. **Forgiveness** - Allow easy undo/edit for mistakes
3. **Consistency** - Same patterns across all modules
4. **Feedback** - Clear response for all actions
5. **Accessibility** - Support for various abilities and contexts

---

## Core User Flows

### Flow 1: User Onboarding

```
Welcome Screen
    │
    ▼
Phone Number Input
    │
    ▼
OTP Verification
    │
    ▼
Business Setup (Name, Type, GSTIN)
    │
    ▼
Dashboard (First Time)
    │
    ▼
Quick Tour (Optional)
```

**Key Considerations:**
- Minimize steps to first value
- Allow skip for optional fields
- Progress indicator
- Celebrate completion

### Flow 2: Create Invoice

```
Dashboard
    │
    ▼
Tap "Create Invoice" FAB
    │
    ▼
Select/Add Party
    │
    ▼
Add Items (Search/Scan/Manual)
    │
    ▼
Review Invoice (Auto GST calculation)
    │
    ▼
Save/Share (PDF, WhatsApp, Email)
    │
    ▼
Success Confirmation
```

**Key Considerations:**
- One-tap party selection for repeat customers
- Quick item search with barcode scanning
- Real-time tax calculation
- Preview before save
- Multiple share options

### Flow 3: Record Payment

```
Invoice Detail / Party Ledger
    │
    ▼
Tap "Record Payment"
    │
    ▼
Enter Amount (with full/partial options)
    │
    ▼
Select Payment Mode
    │
    ▼
Add Reference (Optional)
    │
    ▼
Confirm Payment
    │
    ▼
Updated Balance Display
```

### Flow 4: GST Report Generation

```
Reports Tab
    │
    ▼
Select Report Type (GSTR-1, GSTR-3B)
    │
    ▼
Select Period (Month/Quarter)
    │
    ▼
Generate Report
    │
    ▼
Review Summary
    │
    ▼
Export (JSON, Excel, PDF)
```

---

## Screen Requirements

### Priority 1 (Sprint 1-2): Core Screens

#### 1.1 Splash Screen
- App logo animation
- Loading indicator
- Version number

#### 1.2 Welcome/Onboarding
- 3-4 value proposition slides
- Skip option
- Get Started CTA

#### 1.3 Phone Login
- Country code selector (default +91)
- Phone number input
- Send OTP button
- Privacy policy link

#### 1.4 OTP Verification
- 6-digit OTP input (auto-advancing)
- Resend timer (60 seconds)
- Auto-submit on complete
- Error states

#### 1.5 Business Setup
- Business name input
- Business type selector
- GSTIN input (with validation)
- Skip/Continue options

#### 1.6 Dashboard (Home)
- Business selector (top)
- Quick stats cards:
  - Today's sales
  - Receivables
  - Payables
  - Stock alerts
- Quick actions (FAB menu):
  - Create Invoice
  - Add Payment
  - Add Party
- Recent transactions list
- Bottom navigation

### Priority 2 (Sprint 3-4): Party & Inventory

#### 2.1 Party List
- Search bar
- Filter tabs (All, Customers, Suppliers)
- Party cards with:
  - Name
  - Balance (color-coded)
  - Last transaction
- FAB: Add Party
- Empty state

#### 2.2 Add/Edit Party
- Name (required)
- Phone
- GSTIN (with validation)
- Address
- Opening balance
- Credit limit
- Save/Cancel

#### 2.3 Party Detail
- Header: Name, Balance
- Quick actions: Call, WhatsApp, Invoice
- Tabs: Ledger, Invoices, Info
- Ledger with date range filter

#### 2.4 Item List
- Search bar
- Category filter
- Item cards with:
  - Name
  - Stock quantity
  - Price
- Low stock indicator
- FAB: Add Item

#### 2.5 Add/Edit Item
- Name (required)
- HSN/SAC code
- Category
- Unit
- Selling price
- Purchase price
- Tax rate
- Stock quantity
- Low stock alert threshold

### Priority 3 (Sprint 5-6): Invoicing

#### 3.1 Invoice List
- Search bar
- Filter: Status, Date range
- Sort: Date, Amount
- Invoice cards:
  - Invoice number
  - Party name
  - Amount
  - Status badge
  - Date

#### 3.2 Create Invoice
**Step 1: Party Selection**
- Recent parties
- Search bar
- Add new option

**Step 2: Add Items**
- Search items
- Barcode scanner button
- Item list with quantities
- Line item actions (edit, delete)
- Subtotal display

**Step 3: Review**
- Invoice summary
- GST breakdown
- Additional charges
- Notes/Terms
- Edit options

**Step 4: Save Options**
- Save as Draft
- Save & Share
- Print options

#### 3.3 Invoice Detail
- Header: Number, Date, Status
- Party info
- Item list
- Tax summary
- Payment history
- Actions: Share, Edit, Record Payment, Cancel

#### 3.4 Invoice PDF Preview
- Professional template
- Zoom/pan
- Share button
- Print button

### Priority 4 (Sprint 7-8): Reports & Settings

#### 4.1 Reports Dashboard
- Report categories:
  - Sales Reports
  - Purchase Reports
  - GST Reports
  - Financial Reports
- Date range selector
- Quick filters

#### 4.2 GST Report (GSTR-1)
- Period selector
- Summary cards:
  - B2B invoices
  - B2C invoices
  - Total tax
- Detailed breakdown
- Export options

#### 4.3 Settings
- Profile settings
- Business settings
- Invoice settings
- Tax configuration
- Notification preferences
- Data backup
- Help & Support
- About

---

## Design System Specifications

### Color Palette

#### Primary Colors
```
Primary Blue: #4F46E5 (Indigo 600)
Primary Dark: #3730A3 (Indigo 800)
Primary Light: #818CF8 (Indigo 400)
```

#### Secondary Colors
```
Success Green: #10B981 (Emerald 500)
Warning Amber: #F59E0B (Amber 500)
Error Red: #EF4444 (Red 500)
Info Blue: #3B82F6 (Blue 500)
```

#### Neutral Colors
```
Gray 900: #111827 (Text primary)
Gray 700: #374151 (Text secondary)
Gray 500: #6B7280 (Text tertiary)
Gray 300: #D1D5DB (Borders)
Gray 100: #F3F4F6 (Backgrounds)
White: #FFFFFF (Cards, inputs)
```

#### Financial Colors
```
Receivable (Positive): #10B981 (Green)
Payable (Negative): #EF4444 (Red)
```

### Typography

#### Font Family
- **Primary:** Inter (Google Fonts)
- **Fallback:** -apple-system, BlinkMacSystemFont, sans-serif
- **Hindi:** Noto Sans Devanagari

#### Type Scale
```
Heading 1: 28px / Bold / Line height 36px
Heading 2: 24px / SemiBold / Line height 32px
Heading 3: 20px / SemiBold / Line height 28px
Heading 4: 18px / Medium / Line height 24px
Body Large: 16px / Regular / Line height 24px
Body: 14px / Regular / Line height 20px
Body Small: 12px / Regular / Line height 16px
Caption: 11px / Regular / Line height 14px
```

### Spacing

```
4px  - xs (tight spacing)
8px  - sm (compact elements)
12px - md (default spacing)
16px - lg (section spacing)
24px - xl (large gaps)
32px - 2xl (major sections)
48px - 3xl (screen padding)
```

### Border Radius

```
Buttons: 8px
Cards: 12px
Inputs: 8px
Modals: 16px
Avatars: 50% (circular)
```

### Shadows

```
sm: 0 1px 2px rgba(0,0,0,0.05)
md: 0 4px 6px -1px rgba(0,0,0,0.1)
lg: 0 10px 15px -3px rgba(0,0,0,0.1)
xl: 0 20px 25px -5px rgba(0,0,0,0.1)
```

### Icons

- **Library:** Heroicons (or Phosphor Icons)
- **Size:** 24px (default), 20px (small), 28px (large)
- **Style:** Outline for navigation, Solid for actions

### Components

#### Buttons

**Primary Button:**
- Background: Primary Blue
- Text: White
- Height: 48px
- Padding: 12px 24px
- Border Radius: 8px

**Secondary Button:**
- Background: White
- Border: 1px Gray 300
- Text: Gray 700
- Height: 48px

**Text Button:**
- No background
- Text: Primary Blue
- Underline on hover

**Icon Button:**
- Size: 40px × 40px
- Background: Transparent / Gray 100
- Border Radius: 8px

#### Input Fields

- Height: 48px
- Border: 1px Gray 300
- Border Radius: 8px
- Focus: Primary Blue border
- Error: Red border + error text below
- Label above input (not placeholder)

#### Cards

- Background: White
- Border Radius: 12px
- Shadow: md
- Padding: 16px

#### Bottom Navigation

- Height: 64px + safe area
- 4-5 items max
- Icons + Labels
- Active state: Primary Blue

---

## Mobile-First Guidelines

### Screen Sizes

| Device | Width | Target |
|--------|-------|--------|
| Small Phone | 320px | Minimum |
| Standard Phone | 375px | Primary |
| Large Phone | 414px | Common |
| Tablet | 768px | Optional |

### Touch Targets

- Minimum: 44px × 44px
- Recommended: 48px × 48px
- Spacing between targets: 8px minimum

### Navigation Patterns

1. **Bottom Navigation** - Primary navigation (max 5 items)
2. **FAB** - Primary action (Create Invoice)
3. **Stack Navigation** - Detail screens
4. **Modal** - Forms and confirmations

### Gestures

- Swipe left/right: Action shortcuts
- Pull to refresh: List screens
- Long press: Context menu
- Pinch to zoom: PDF preview

### Performance Guidelines

- Lazy load images
- Skeleton loading states
- Optimistic UI updates
- 60fps animations

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance

1. **Color Contrast**
   - Normal text: 4.5:1 ratio
   - Large text: 3:1 ratio
   - Interactive elements: 3:1 ratio

2. **Text Size**
   - Support dynamic type scaling
   - Minimum body text: 14px

3. **Touch Targets**
   - Minimum 44×44px
   - Adequate spacing

4. **Screen Reader Support**
   - All images have alt text
   - Buttons have accessible labels
   - Form fields have labels

5. **Focus Management**
   - Visible focus indicators
   - Logical focus order

### Additional Considerations

- Color-blind friendly palette
- Motion reduction support
- High contrast mode support
- Voice control compatibility

---

## Deliverables

### Phase 1 (Week 1-2)

1. **User Flow Diagrams**
   - Onboarding flow
   - Invoice creation flow
   - Payment recording flow
   - Report generation flow

2. **Wireframes (Lo-Fi)**
   - All Priority 1 screens
   - Key interactions annotated

### Phase 2 (Week 3-4)

3. **High-Fidelity Mockups**
   - All Priority 1 & 2 screens
   - Light mode (dark mode optional)
   - All states (empty, loading, error)

4. **Interactive Prototype**
   - Clickable prototype in Figma
   - Core flows functional
   - Share with stakeholders

### Phase 3 (Week 5-6)

5. **Design System**
   - Component library in Figma
   - Color palette
   - Typography scale
   - Icon set
   - Documentation

6. **Developer Handoff**
   - Specs and measurements
   - Asset exports (2x, 3x)
   - Animation specifications
   - Design tokens (JSON)

### Ongoing

7. **Design Support**
   - Clarifications during development
   - Edge case designs
   - Iteration based on feedback

---

## Timeline

| Week | Deliverables | Review |
|------|--------------|--------|
| Week 1 | User flows + Lo-fi wireframes | Stakeholder review |
| Week 2 | Priority 1 Hi-fi mockups | Dev team review |
| Week 3 | Priority 2 Hi-fi mockups | Stakeholder review |
| Week 4 | Interactive prototype | Usability testing |
| Week 5 | Design system + Components | Dev handoff |
| Week 6 | Developer support + Iterations | Sprint 1 start |

---

## Design Tools

### Primary Tool: Figma

**File Structure:**
```
Business App Design
├── 🎨 Design System
│   ├── Colors
│   ├── Typography
│   ├── Components
│   └── Icons
├── 📱 Screens
│   ├── Onboarding
│   ├── Dashboard
│   ├── Parties
│   ├── Inventory
│   ├── Invoicing
│   ├── Reports
│   └── Settings
├── 🔄 Prototypes
│   ├── Onboarding Flow
│   └── Invoice Flow
└── 📋 Specs
    └── Developer Handoff
```

### Additional Tools
- **Prototyping:** Figma Prototype
- **User Testing:** Maze or UserTesting
- **Asset Export:** Figma export or Zeplin
- **Animation:** Lottie (for micro-interactions)

---

## Contact & Review

**Design Review Meetings:**
- Weekly design review with Tech Lead
- Bi-weekly stakeholder review

**Feedback Process:**
1. Share Figma link with comment access
2. Collect feedback via comments
3. Address in next iteration
4. Document decisions

**Questions & Clarifications:**
- Slack: #design channel
- Email: [design contact]

---

**Document Status:** ✅ Complete  
**Last Updated:** 2025-12-21  
**Next Review:** After designer assignment
