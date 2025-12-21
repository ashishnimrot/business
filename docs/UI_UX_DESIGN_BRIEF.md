# UI/UX Design Brief & Guidelines - Complete Developer Specification

**Version:** 2.0  
**Created:** 2025-12-21  
**Last Updated:** 2025-12-21  
**Status:** Ready for Designer & Developer  
**Purpose:** Complete specification for UI/UX designer and frontend developers with 200% clarity

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

## Screen Requirements - Detailed Specifications

> **For Developers:** Each screen includes exact measurements, states, interactions, and edge cases. Use these specs to implement pixel-perfect designs.

---

### Priority 1 (Sprint 1-2): Core Screens

#### 1.1 Splash Screen

**Layout:**
- Full screen (375px × 812px for iPhone X)
- Centered vertically and horizontally
- Background: White (#FFFFFF)

**Elements:**
1. **App Logo**
   - Size: 120px × 120px (square)
   - Position: Center, 200px from top
   - Animation: Fade in (0.3s) + Scale (0.8 → 1.0, 0.5s ease-out)
   - Format: SVG or PNG @2x, @3x

2. **Loading Indicator**
   - Type: Circular progress (iOS) or Material Design spinner (Android)
   - Size: 40px × 40px
   - Color: Primary Blue (#4F46E5)
   - Position: 24px below logo
   - Animation: Continuous rotation (1s linear infinite)

3. **Version Number**
   - Text: "Version 1.0.0" or "v1.0.0"
   - Font: Body Small (12px, Regular, #6B7280)
   - Position: Bottom, 32px from bottom edge
   - Alignment: Center

**States:**
- **Initial:** Logo fades in, spinner appears
- **Loading:** Spinner rotates, logo static
- **Error:** Show error message, retry button (if network fails)
- **Timeout:** After 10s, show "Taking longer than usual" message

**Technical Notes:**
- Show for minimum 1.5 seconds (even if app loads faster)
- Check authentication status during splash
- Navigate to Login if not authenticated, Dashboard if authenticated

---

#### 1.2 Welcome/Onboarding

**Layout:**
- Full screen with safe area insets
- Swipeable carousel (horizontal scroll)
- Page indicator dots at bottom

**Structure:**
- **Container:** Full width, scrollable horizontally
- **Pages:** 3-4 slides, each 375px wide
- **Padding:** 48px horizontal, 32px vertical

**Slide 1: Value Proposition 1**
- **Illustration/Icon:** 200px × 200px, centered, 80px from top
- **Title:** Heading 2 (24px, SemiBold, #111827)
  - Text: "Manage Your Business on the Go"
  - Position: 32px below illustration
- **Description:** Body (14px, Regular, #6B7280)
  - Text: "Create invoices, track inventory, and manage GST - all from your smartphone"
  - Position: 16px below title
  - Max width: 280px, centered
- **Skip Button:** Text button, top-right
  - Text: "Skip" (12px, Medium, #6B7280)
  - Position: 16px from top, 16px from right
  - Touch target: 44px × 44px

**Slide 2: Value Proposition 2**
- Same structure, different content
- "GST Compliant Invoicing"
- "Automatic GST calculation and filing. Stay compliant effortlessly."

**Slide 3: Value Proposition 3**
- "Works Offline"
- "Create invoices even without internet. Auto-sync when online."

**Slide 4: Get Started**
- **CTA Button:** Primary button
  - Text: "Get Started"
  - Size: Full width minus 48px padding (279px)
  - Height: 48px
  - Position: 32px from bottom
  - Background: #4F46E5
  - Text: White, 16px, SemiBold

**Page Indicator:**
- Dots: 8px diameter, 8px spacing
- Active: #4F46E5, Inactive: #D1D5DB
- Position: 24px above CTA button
- Animation: Smooth transition (0.3s)

**Interactions:**
- Swipe left/right to navigate
- Tap dots to jump to slide
- Skip button: Navigate to Login
- Get Started: Navigate to Phone Login

**Edge Cases:**
- First launch only (store flag in AsyncStorage)
- Allow skip at any time
- Remember if user skipped (don't show again)

---

#### 1.3 Phone Login

**Layout:**
- Full screen with safe area
- Centered content
- Keyboard-aware scrolling

**Header:**
- **Title:** Heading 1 (28px, Bold, #111827)
  - Text: "Welcome Back"
  - Position: 80px from top, centered
- **Subtitle:** Body (14px, Regular, #6B7280)
  - Text: "Enter your phone number to continue"
  - Position: 16px below title, centered

**Form Container:**
- Position: 120px from top
- Padding: 24px horizontal

**Phone Input Section:**
1. **Country Code Selector**
   - Type: Dropdown/Picker
   - Default: +91 (India)
   - Size: 80px wide × 48px height
   - Border: 1px #D1D5DB, Radius: 8px
   - Icon: Chevron down (20px, #6B7280) on right
   - Padding: 12px left, 8px right
   - Font: Body (14px, Regular, #111827)
   - Position: Left side of container

2. **Phone Number Input**
   - Type: Text input (numeric keyboard)
   - Size: Remaining width (271px) × 48px height
   - Border: 1px #D1D5DB, Radius: 8px
   - Placeholder: "9876543210"
   - Font: Body (14px, Regular, #111827)
   - Max length: 10 digits
   - Position: Right side, 8px from country code
   - Validation: Real-time (show error if invalid)

3. **Input Label** (if using floating label)
   - Text: "Phone Number"
   - Font: Body Small (12px, Regular, #6B7280)
   - Position: Above input, 8px spacing

**Send OTP Button:**
- Type: Primary button
- Text: "Send OTP"
- Size: Full width (327px) × 48px height
- Position: 24px below phone input
- State: Disabled until valid phone number (10 digits)
- Disabled state: Background #F3F4F6, Text #9CA3AF

**Privacy Policy Link:**
- Text: "By continuing, you agree to our Privacy Policy"
- Font: Caption (11px, Regular, #6B7280)
- Link color: #4F46E5
- Position: 16px below button, centered
- Touch target: Full line (44px height)

**Validation:**
- **Invalid format:** Show error below input
  - Text: "Please enter a valid 10-digit phone number"
  - Color: #EF4444
  - Font: Body Small (12px)
  - Position: 8px below input
- **Empty:** No error until user tries to submit
- **Valid:** Green checkmark icon (optional, 20px, #10B981)

**Loading State:**
- Button shows spinner (20px) + "Sending..." text
- Disable input during API call
- Show toast/alert on error

**Error States:**
- **Network error:** Toast message "Please check your internet connection"
- **Rate limit:** "Too many requests. Please try again in 60 seconds"
- **Invalid number:** Inline error below input

**Keyboard:**
- Auto-focus phone input on screen load
- Show numeric keyboard (type="tel")
- Dismiss keyboard on button tap
- Handle keyboard overlap (scroll view)

---

#### 1.4 OTP Verification

**Layout:**
- Full screen, centered content
- Keyboard-aware

**Header:**
- **Title:** Heading 1 (28px, Bold, #111827)
  - Text: "Enter OTP"
  - Position: 80px from top, centered
- **Subtitle:** Body (14px, Regular, #6B7280)
  - Text: "We've sent a 6-digit code to +91 {phone}"
  - Position: 16px below title, centered
  - Dynamic: Replace {phone} with masked number (e.g., "98765*****")

**OTP Input Container:**
- Position: 120px from top
- Layout: 6 individual input boxes in a row
- Spacing: 8px between boxes
- Container width: 327px (full width minus 48px padding)
- Each box: 45px × 56px
  - Border: 2px #D1D5DB (default), #4F46E5 (focused), #EF4444 (error)
  - Border radius: 8px
  - Background: White
  - Text: Heading 3 (20px, SemiBold, #111827)
  - Text alignment: Center
  - Max length: 1 digit per box

**OTP Input Behavior:**
- Auto-focus first box on load
- Auto-advance to next box on input
- Auto-focus previous box on backspace (if current is empty)
- Paste 6-digit code: Auto-fill all boxes
- Auto-submit when 6th digit entered (after 300ms delay)

**Resend Section:**
- Position: 24px below OTP input
- **Resend Button:**
  - Text: "Resend OTP" (when timer expired)
  - Text: "Resend OTP in {seconds}s" (during countdown)
  - Font: Body (14px, Medium, #4F46E5)
  - Position: Centered
  - Disabled during countdown (60 seconds)
  - Touch target: 44px height

**Change Number Link:**
- Text: "Change phone number"
- Font: Body Small (12px, Regular, #6B7280)
- Position: 16px below resend, centered
- Action: Navigate back to Phone Login

**Validation States:**
- **Empty:** Default border color
- **Focused:** Blue border (#4F46E5), subtle glow
- **Filled:** Green border (#10B981) - optional
- **Error:** Red border (#EF4444) + shake animation
  - Error message: "Invalid OTP. Please try again."
  - Position: 8px below OTP input
  - Font: Body Small (12px, #EF4444)

**Loading State:**
- Show spinner overlay during verification
- Disable all inputs
- Show "Verifying..." text

**Success State:**
- Checkmark animation (Lottie or icon)
- Auto-navigate to Business Setup (new user) or Dashboard (existing user)
- Delay: 500ms after success

**Error Handling:**
- **Invalid OTP:** Shake animation, show error, clear inputs
- **Expired OTP:** Show message "OTP expired. Please request a new one."
- **Too many attempts:** Disable inputs, show "Too many attempts. Please request a new OTP."
- **Network error:** Toast "Connection error. Please try again."

**Accessibility:**
- Screen reader: "Enter the 6-digit code"
- Announce each digit as entered
- Announce errors clearly

---

#### 1.5 Business Setup

**Layout:**
- Scrollable form
- Safe area insets
- Keyboard-aware

**Header:**
- **Title:** Heading 1 (28px, Bold, #111827)
  - Text: "Setup Your Business"
  - Position: 24px from top, 24px from left
- **Subtitle:** Body (14px, Regular, #6B7280)
  - Text: "This information will appear on your invoices"
  - Position: 8px below title, 24px from left

**Form Fields (24px padding horizontal):**

1. **Business Name**
   - Label: "Business Name" (12px, Medium, #374151)
   - Input: 48px height, full width
   - Placeholder: "Enter business name"
   - Required: Yes (red asterisk *)
   - Validation: Min 2 characters, max 200
   - Error: "Business name is required"

2. **Business Type**
   - Label: "Business Type" (12px, Medium, #374151)
   - Type: Dropdown/Picker
   - Options: Retailer, Wholesaler, Manufacturer, Service Provider, Other
   - Default: "Select business type"
   - Height: 48px
   - Icon: Chevron down (20px, #6B7280)
   - Required: No (optional field)

3. **GSTIN**
   - Label: "GSTIN (Optional)" (12px, Medium, #374151)
   - Input: 48px height, full width
   - Placeholder: "15AAACB1234A1Z5"
   - Format: 15 characters, alphanumeric
   - Validation: Real-time format check
   - Error: "Invalid GSTIN format"
   - Helper text: "15-character GST identification number"
   - Icon: Info icon (optional, 16px, #6B7280)

4. **PAN** (Optional, collapsible)
   - Label: "PAN (Optional)"
   - Input: 48px height, full width
   - Placeholder: "ABCDE1234F"
   - Format: 10 characters, alphanumeric
   - Validation: Format check
   - Show/hide toggle: "Add PAN" button

**Action Buttons:**
- **Skip Button:** Secondary button
  - Text: "Skip for Now"
  - Position: Bottom, 16px from bottom
  - Width: Full width minus 48px padding
- **Continue Button:** Primary button
  - Text: "Continue"
  - Position: 16px above Skip button
  - Width: Full width minus 48px padding
  - Disabled if Business Name is empty

**Validation:**
- Real-time for GSTIN format
- Show errors below each field
- Prevent submission if required fields invalid
- Allow skip (creates business with minimal info)

**Keyboard:**
- Auto-focus Business Name on load
- Next button on keyboard moves to next field
- Done button submits form
- Handle keyboard overlap

---

#### 1.6 Dashboard (Home)

**Layout:**
- Scrollable content
- Safe area insets
- Pull-to-refresh enabled

**Header Section (Sticky):**
- **Business Selector:**
  - Position: Top, 16px from top
  - Left: Business name/icon
    - Text: Business name (16px, SemiBold, #111827)
    - Icon: Chevron down (16px, #6B7280)
    - Touch target: Full row, 56px height
  - Right: Sync status icon
    - Online: Green dot (8px, #10B981)
    - Offline: Gray dot (8px, #6B7280)
    - Syncing: Spinner (16px, #4F46E5)
    - Pending: Orange badge with count (e.g., "3")
  - Background: White
  - Padding: 16px horizontal
  - Border bottom: 1px #F3F4F6

**Quick Stats Cards (Grid 2×2):**
- Container: 24px padding horizontal, 16px spacing vertical
- Card size: 163.5px × 120px (2 cards per row, 8px gap)
- Card design:
  - Background: White
  - Border radius: 12px
  - Shadow: md (0 4px 6px -1px rgba(0,0,0,0.1))
  - Padding: 16px

**Card 1: Today's Sales**
- Icon: Currency/Rupee icon (24px, #4F46E5), top-left
- Value: "₹12,450" (20px, Bold, #111827), center
- Label: "Today's Sales" (12px, Regular, #6B7280), bottom
- Color accent: Blue (#4F46E5)

**Card 2: Receivables**
- Icon: Arrow up (24px, #10B981), top-left
- Value: "₹45,230" (20px, Bold, #111827), center
- Label: "Receivables" (12px, Regular, #6B7280), bottom
- Color accent: Green (#10B981)
- Badge: "12" (unpaid invoices count, red badge, top-right)

**Card 3: Payables**
- Icon: Arrow down (24px, #EF4444), top-left
- Value: "₹8,500" (20px, Bold, #111827), center
- Label: "Payables" (12px, Regular, #6B7280), bottom
- Color accent: Red (#EF4444)

**Card 4: Stock Alerts**
- Icon: Alert/Box icon (24px, #F59E0B), top-left
- Value: "5" (20px, Bold, #111827), center
- Label: "Low Stock Items" (12px, Regular, #6B7280), bottom
- Color accent: Amber (#F59E0B)
- Badge: Red dot if any low stock

**Quick Actions (FAB Menu):**
- **Primary FAB:**
  - Position: Bottom-right, 24px from edges
  - Size: 56px × 56px
  - Background: #4F46E5
  - Icon: Plus (24px, White)
  - Shadow: lg
  - Animation: Rotate 45° when expanded

- **Expanded Menu:**
  - Create Invoice: 48px × 48px, 16px above FAB
  - Add Payment: 48px × 48px, 16px above previous
  - Add Party: 48px × 48px, 16px above previous
  - Each with label (12px, White, #111827 background)
  - Animation: Scale + fade in (0.2s)
  - Backdrop: Semi-transparent overlay (rgba(0,0,0,0.5))

**Recent Transactions List:**
- Section header: "Recent Transactions" (18px, SemiBold, #111827)
- Position: 24px below stats cards
- Padding: 24px horizontal

**Transaction Item:**
- Height: 72px
- Background: White
- Border radius: 12px
- Padding: 16px
- Margin: 8px vertical
- Shadow: sm

**Item Layout:**
- Left: Icon (40px × 40px, circular)
  - Invoice: Document icon, #4F46E5
  - Payment: Checkmark icon, #10B981
  - Expense: Minus icon, #EF4444
- Center: Details
  - Title: "Invoice #INV-001" (14px, SemiBold, #111827)
  - Subtitle: "Rajesh Traders • 2 hours ago" (12px, Regular, #6B7280)
- Right: Amount
  - Value: "₹5,000" (16px, SemiBold, #111827)
  - Status: Badge (Paid/Unpaid, 8px padding)

**Empty State:**
- Icon: 80px × 80px, #D1D5DB
- Text: "No transactions yet" (16px, Medium, #6B7280)
- CTA: "Create Your First Invoice" (Primary button)
- Position: Centered, 120px from top

**Bottom Navigation:**
- Height: 64px + safe area bottom
- Background: White
- Border top: 1px #F3F4F6
- Items: 5 (Home, Invoices, Parties, Inventory, More)
- Active: #4F46E5, Inactive: #6B7280
- Icon size: 24px
- Label: 11px, Regular
- Spacing: Equal distribution

**Loading States:**
- Stats cards: Skeleton loaders (shimmer effect)
- Transactions: Skeleton list items
- Duration: 300-500ms

**Pull-to-Refresh:**
- Trigger: Pull down 80px
- Indicator: Native spinner
- Refresh: Reload stats and transactions

**Offline Indicator:**
- Banner: Top of screen, below header
- Background: #F59E0B
- Text: "You're offline. Changes will sync when online."
- Height: 40px
- Auto-dismiss: After 5 seconds
- Manual dismiss: X button

### Priority 2 (Sprint 3-4): Party & Inventory

#### 2.1 Party List

**Layout:**
- Full screen, scrollable list
- Sticky search and filters
- Bottom navigation visible

**Search Bar:**
- Position: Top, below header
- Height: 48px
- Padding: 16px horizontal
- Background: White
- Border: 1px #F3F4F6 (bottom)
- Input: Full width, 40px height
  - Background: #F3F4F6
  - Border radius: 8px
  - Padding: 12px left, 40px right (for search icon)
  - Placeholder: "Search parties..." (14px, Regular, #9CA3AF)
  - Icon: Search (20px, #6B7280), left, 12px from edge
  - Clear button: X icon (20px, #6B7280), right, appears when text entered
- Real-time search: Filter as user types (debounce 300ms)

**Filter Tabs:**
- Position: Below search bar
- Height: 48px
- Background: White
- Tabs: "All", "Customers", "Suppliers"
- Active tab: Underline (2px, #4F46E5), Text (#4F46E5, SemiBold)
- Inactive tab: Text (#6B7280, Regular)
- Spacing: Equal distribution
- Touch target: Full height

**Party Cards:**
- Container: Padding 16px horizontal, 8px vertical between cards
- Card: White background, 12px radius, md shadow
- Height: 88px
- Padding: 16px

**Card Layout:**
- Left: Avatar/Initials (48px × 48px, circular)
  - Background: #4F46E5 (or color based on name hash)
  - Text: First letter of name (20px, SemiBold, White)
  - Border: 2px White (if image)
- Center: Details (flex: 1)
  - Name: 16px, SemiBold, #111827
  - Phone: 14px, Regular, #6B7280 (if available)
  - Last transaction: 12px, Regular, #9CA3AF
    - Format: "Last: Invoice #INV-001 • 2 days ago"
- Right: Balance
  - Amount: 16px, SemiBold
  - Color: Green (#10B981) if receivable, Red (#EF4444) if payable
  - Format: "₹12,450" or "₹0"
  - Badge: "Overdue" (if applicable, red, 8px padding)

**Empty State:**
- Icon: 80px × 80px, #D1D5DB
- Text: "No parties found" (16px, Medium, #6B7280)
- Subtext: "Add your first customer or supplier" (14px, Regular, #9CA3AF)
- CTA: "Add Party" (Primary button)

**FAB: Add Party**
- Position: Bottom-right, 80px from bottom (above nav)
- Size: 56px × 56px
- Icon: Plus (24px, White)
- Action: Navigate to Add Party screen

**Loading State:**
- Skeleton cards: 3-5 items
- Shimmer effect
- Height: 88px each

**Infinite Scroll:**
- Load more when 3 items from bottom
- Show loading indicator at bottom
- Pagination: 20 items per page

---

#### 2.2 Add/Edit Party

**Layout:**
- Scrollable form
- Keyboard-aware
- Safe area insets

**Header:**
- Title: "Add Party" or "Edit Party" (28px, Bold)
- Back button: Left, 24px from left
- Save button: Right, 24px from right (Primary, disabled until valid)

**Form Sections:**

**Section 1: Basic Information**
- Section header: "Basic Information" (16px, SemiBold, #111827)
- Padding: 24px horizontal, 16px vertical

1. **Party Name** (Required)
   - Label: "Party Name" + red asterisk
   - Input: 48px height
   - Placeholder: "Enter party name"
   - Validation: Min 2 chars, max 200
   - Error: "Party name is required"

2. **Party Type**
   - Label: "Party Type"
   - Type: Radio buttons or Segmented control
   - Options: Customer, Supplier, Both
   - Default: Customer
   - Layout: Horizontal, equal width
   - Height: 40px
   - Selected: #4F46E5 background, White text
   - Unselected: #F3F4F6 background, #6B7280 text

3. **Phone Number**
   - Label: "Phone Number" (Optional)
   - Input: 48px height
   - Type: Tel (numeric keyboard)
   - Placeholder: "9876543210"
   - Format: 10 digits
   - Validation: Format check
   - Icon: Call button (optional, right side)

4. **Email**
   - Label: "Email" (Optional)
   - Input: 48px height
   - Type: Email
   - Placeholder: "email@example.com"
   - Validation: Email format
   - Keyboard: Email keyboard

5. **GSTIN**
   - Label: "GSTIN" (Optional)
   - Input: 48px height
   - Placeholder: "15AAACB1234A1Z5"
   - Validation: 15 chars, format check
   - Helper: "15-character GST identification number"
   - Error: "Invalid GSTIN format"

**Section 2: Address**
- Section header: "Billing Address"
- Toggle: "Same as billing" checkbox (for shipping)

1. **Address Line 1**
   - Label: "Address Line 1"
   - Input: 48px height
   - Placeholder: "Street address"

2. **Address Line 2**
   - Label: "Address Line 2" (Optional)
   - Input: 48px height
   - Placeholder: "Apartment, suite, etc."

3. **City**
   - Label: "City"
   - Input: 48px height
   - Placeholder: "Enter city"

4. **State**
   - Label: "State"
   - Type: Dropdown/Picker
   - Options: All Indian states
   - Height: 48px

5. **Pincode**
   - Label: "Pincode"
   - Input: 48px height
   - Type: Numeric
   - Placeholder: "110001"
   - Validation: 6 digits
   - Auto-fill state from pincode (if API available)

**Section 3: Financial Details**
- Section header: "Financial Details"

1. **Opening Balance**
   - Label: "Opening Balance" (Optional)
   - Input: 48px height
   - Type: Numeric (decimal)
   - Placeholder: "0.00"
   - Prefix: "₹" (left side)
   - Helper: "Enter if party has existing balance"

2. **Balance Type**
   - Type: Radio buttons
   - Options: "They owe you" (Debit), "You owe them" (Credit)
   - Default: "They owe you"
   - Show only if Opening Balance > 0

3. **Credit Limit**
   - Label: "Credit Limit" (Optional)
   - Input: 48px height
   - Type: Numeric
   - Placeholder: "0.00"
   - Prefix: "₹"
   - Helper: "Maximum credit allowed"

4. **Credit Period**
   - Label: "Credit Period (Days)" (Optional)
   - Input: 48px height
   - Type: Numeric
   - Placeholder: "30"
   - Suffix: "days"
   - Helper: "Payment due days"

**Section 4: Additional**
- Section header: "Additional Information"

1. **Notes**
   - Label: "Notes" (Optional)
   - Type: Textarea
   - Height: 120px (min), expandable
   - Placeholder: "Add any additional notes..."
   - Max length: 500 characters
   - Character counter: Bottom-right (12px, #9CA3AF)

**Action Buttons (Sticky Bottom):**
- Container: White background, border top 1px #F3F4F6
- Padding: 16px, safe area bottom
- **Cancel Button:** Secondary, left side
- **Save Button:** Primary, right side (or full width if Cancel hidden)
- Disabled state: Gray, until required fields valid

**Validation:**
- Real-time for GSTIN, Email, Phone
- Show errors below each field
- Prevent save if Party Name empty
- Highlight invalid fields with red border

**Edit Mode:**
- Pre-fill all fields
- Show "Delete Party" button (red, bottom, with confirmation)

---

#### 2.3 Party Detail

**Layout:**
- Scrollable content
- Sticky header
- Tab navigation

**Header (Sticky):**
- Background: White
- Height: 120px
- Padding: 24px horizontal, 16px vertical

**Header Content:**
- Back button: Left, 24px from left
- More menu: Right, 24px from right (3 dots icon)

**Party Info:**
- Avatar: 64px × 64px, circular, top-center
- Name: 20px, SemiBold, #111827, centered, 8px below avatar
- Phone/Email: 14px, Regular, #6B7280, centered, 4px below name
- Balance: Large, centered, 16px below contact
  - Amount: 28px, Bold
  - Color: Green if receivable, Red if payable
  - Label: "Balance" (12px, Regular, #6B7280)

**Quick Actions:**
- Container: 24px horizontal padding, 16px vertical
- Buttons: 3 in a row, equal width
  1. **Call:** Icon + "Call" (if phone available)
  2. **WhatsApp:** Icon + "WhatsApp" (if phone available)
  3. **Create Invoice:** Icon + "Invoice"
- Button style: Secondary (outline)
- Height: 44px
- Spacing: 8px between buttons

**Tabs:**
- Type: Segmented control or tabs
- Options: "Ledger", "Invoices", "Info"
- Active: #4F46E5 underline (2px) + SemiBold text
- Inactive: #6B7280, Regular
- Height: 48px
- Border bottom: 1px #F3F4F6

**Tab Content:**

**Ledger Tab:**
- Date range filter: Top, 16px padding
  - Button: "Last 30 days" (default)
  - Dropdown: Custom range picker
- List: Transaction entries
  - Each entry: 72px height
  - Date: Left, 14px, Regular, #6B7280
  - Description: Center, 14px, SemiBold, #111827
  - Amount: Right, 16px, SemiBold
    - Debit: Red (#EF4444)
    - Credit: Green (#10B981)
  - Running balance: 12px, Regular, #9CA3AF, below amount
- Empty state: "No transactions"

**Invoices Tab:**
- Filter: Status (All, Paid, Unpaid, Overdue)
- List: Invoice cards (similar to Invoice List)
- Empty state: "No invoices"

**Info Tab:**
- Form layout (read-only or editable)
- All party details
- Edit button: Top-right (if editable)

**Loading States:**
- Header: Skeleton for avatar and name
- Tabs: Skeleton list items

---

#### 2.4 Item List

**Layout:**
- Similar to Party List
- Search + Category filter

**Search Bar:**
- Same as Party List

**Category Filter:**
- Type: Horizontal scrollable chips
- Position: Below search
- Chip: 32px height, 12px horizontal padding
- Background: #F3F4F6 (inactive), #4F46E5 (active)
- Text: 12px, Medium
- Spacing: 8px between chips
- First chip: "All Categories"

**Item Cards:**
- Similar structure to Party Cards
- Left: Item image/placeholder (48px × 48px, square, 8px radius)
- Center:
  - Name: 16px, SemiBold
  - Category: 12px, Regular, #6B7280
  - HSN: 12px, Regular, #9CA3AF
- Right:
  - Price: 16px, SemiBold, #111827
  - Stock: 12px, Regular
    - Format: "Stock: 50 Pcs"
    - Color: Red if low stock
  - Low stock badge: Red dot (8px) if stock <= threshold

**Empty State:**
- Icon + "No items found"
- CTA: "Add Item"

**FAB: Add Item**
- Same as Add Party FAB

---

#### 2.5 Add/Edit Item

**Layout:**
- Scrollable form
- Similar structure to Add Party

**Form Sections:**

**Section 1: Basic Information**
1. **Item Name** (Required)
2. **SKU** (Optional, auto-generated if empty)
3. **Barcode** (Optional, with scanner button)
4. **Category** (Dropdown + "Create New" option)
5. **Description** (Textarea, optional)

**Section 2: Pricing & Tax**
1. **HSN/SAC Code**
   - Input with search/autocomplete
   - Helper: "8-digit HSN for goods, 6-digit SAC for services"
2. **Unit**
   - Dropdown: Pcs, Kg, Ltr, Box, etc.
   - Option: "Add New Unit"
3. **Selling Price** (Required)
   - Numeric input, ₹ prefix
4. **Purchase Price** (Optional)
5. **MRP** (Optional)
6. **Tax Rate**
   - Dropdown: 0%, 5%, 12%, 18%, 28%
   - Default: 18%

**Section 3: Inventory**
1. **Opening Stock** (Optional)
   - Numeric input
   - Unit shown (e.g., "Pcs")
2. **Low Stock Threshold** (Optional)
   - Numeric input
   - Helper: "Alert when stock falls below this"
3. **Track Stock** (Toggle)
   - Enable/disable stock tracking

**Section 4: Additional**
1. **Item Image**
   - Upload area: 120px × 120px
   - Placeholder: Camera icon
   - Preview: Show uploaded image
   - Options: Camera, Gallery, Remove

**Action Buttons:**
- Same as Add Party (Cancel, Save)

**Validation:**
- Item Name: Required
- Selling Price: Required, > 0
- HSN: Format validation if provided
- Stock: Numeric, >= 0

---

### Priority 3 (Sprint 5-6): Invoicing

#### 3.1 Invoice List

**Layout:**
- Similar to Party List
- Enhanced filters

**Search Bar:**
- Same as Party List

**Filters:**
- Status: Chips (All, Paid, Unpaid, Overdue, Draft)
- Date Range: Button with calendar picker
- Sort: Dropdown (Date, Amount, Party)

**Invoice Cards:**
- Height: 96px
- Left: Status indicator (4px wide bar, full height)
  - Paid: Green (#10B981)
  - Unpaid: Amber (#F59E0B)
  - Overdue: Red (#EF4444)
  - Draft: Gray (#9CA3AF)
- Center:
  - Invoice #: 16px, SemiBold, #111827
  - Party name: 14px, Regular, #6B7280
  - Date: 12px, Regular, #9CA3AF
- Right:
  - Amount: 18px, SemiBold, #111827
  - Status badge: 8px padding, 12px font
    - Paid: Green background
    - Unpaid: Amber background
    - Overdue: Red background

**Empty State:**
- Icon + "No invoices"
- CTA: "Create Invoice"

---

#### 3.2 Create Invoice (Multi-Step)

**Layout:**
- Full screen modal or full screen
- Step indicator at top
- Progress: 4 steps (25%, 50%, 75%, 100%)

**Step Indicator:**
- Height: 56px
- Background: White
- Progress bar: Top, 2px height, #4F46E5
- Steps: 4 dots/circles
  - Completed: Filled, #4F46E5
  - Current: Filled with border, #4F46E5
  - Pending: Empty, #D1D5DB
- Labels below: "Party", "Items", "Review", "Save"
- Font: 11px, Regular

**Step 1: Party Selection**
- Title: "Select Party" (20px, SemiBold)
- Recent parties: Top section
  - Header: "Recent" (14px, Medium, #6B7280)
  - List: Party cards (compact, 64px height)
- Search: Full-width search bar
- Results: Filtered party list
- "Add New Party" button: Secondary, full width, bottom
- Next button: Primary, bottom-right

**Step 2: Add Items**
- Title: "Add Items" (20px, SemiBold)
- Search bar: With barcode scanner icon
- Scanner button: Right side of search
- Item list: Selected items
  - Each item: 72px height
  - Left: Item image/icon (40px)
  - Center: Name, HSN, Price
  - Right: Quantity input (40px × 40px)
    - Minus button, Input (24px wide), Plus button
  - Actions: Edit, Delete (swipe left)
- Subtotal: Sticky bottom
  - Container: White, border top
  - Row: "Subtotal" + Amount (16px, SemiBold)
  - Row: "Tax" + Amount (14px, Regular)
  - Row: "Total" + Amount (20px, Bold, #4F46E5)
- Add more button: Secondary, full width
- Next button: Primary, bottom

**Step 3: Review**
- Title: "Review Invoice" (20px, SemiBold)
- Party info card: Compact
- Items table:
  - Header row: Item, Qty, Price, Total (12px, Medium, #6B7280)
  - Data rows: Item details
- Tax breakdown:
  - CGST: X%
  - SGST: X%
  - IGST: X% (if inter-state)
- Additional charges: Expandable section
- Notes: Textarea
- Terms: Textarea
- Edit buttons: For each section
- Save button: Primary, full width

**Step 4: Save Options**
- Title: "Save Invoice" (20px, SemiBold)
- Options:
  - Save as Draft: Secondary button
  - Save & Generate PDF: Primary button
  - Save & Share: Primary button with icon
- Share options modal:
  - WhatsApp
  - Email
  - SMS
  - Print
  - Download PDF

**Navigation:**
- Back button: Each step
- Cancel: Top-right (with confirmation if data entered)

---

#### 3.3 Invoice Detail

**Layout:**
- Scrollable
- Sticky header with actions

**Header:**
- Invoice number: 20px, SemiBold
- Status badge: Top-right
- Date: 14px, Regular, #6B7280
- Actions menu: 3 dots, top-right

**Party Card:**
- Compact card with party details
- Quick actions: Call, WhatsApp

**Items Table:**
- Similar to Review step
- Read-only

**Summary Card:**
- Subtotal
- Tax breakdown (CGST/SGST/IGST)
- Additional charges
- Discount
- Total (large, bold)

**Payment Section:**
- Header: "Payments" (18px, SemiBold)
- Paid amount: Green, large
- Outstanding: Red, large
- Payment history: List of payments
- Record Payment button: Primary

**Actions:**
- Share: Icon button
- Edit: Icon button (if not paid)
- Cancel: Text button, red (if allowed)
- Print: Icon button
- Download PDF: Icon button

---

#### 3.4 Invoice PDF Preview

**Layout:**
- Full screen
- PDF viewer (react-native-pdf or webview)

**Toolbar:**
- Back button: Left
- Share button: Right
- Print button: Right
- Download button: Right

**PDF Content:**
- Professional invoice template
- Business logo and details
- Party details
- Items table
- Tax summary
- Total in words
- QR code for payment
- Terms and conditions

**Interactions:**
- Pinch to zoom
- Pan to move
- Double tap to zoom
- Share: Native share sheet

---

### Priority 4 (Sprint 7-8): Reports & Settings

#### 4.1 Reports Dashboard

**Layout:**
- Grid layout
- Category cards

**Categories:**
- Sales Reports: Card with icon
- Purchase Reports: Card with icon
- GST Reports: Card with icon
- Financial Reports: Card with icon

**Each Card:**
- 163.5px × 120px
- Icon: 48px, top
- Title: 16px, SemiBold
- Description: 12px, Regular
- Arrow: Right, bottom

**Date Range Selector:**
- Top section
- Options: Today, This Week, This Month, Custom
- Button style: Segmented control

---

#### 4.2 GST Report (GSTR-1)

**Layout:**
- Scrollable
- Period selector at top

**Period Selector:**
- Month/Quarter picker
- Format: "April 2024" or "Q1 2024"

**Summary Cards:**
- 3 cards in a row (scrollable if needed)
- B2B Invoices: Count + Amount
- B2C Invoices: Count + Amount
- Total Tax: Amount

**Detailed Breakdown:**
- Expandable sections
- B2B: Grouped by GSTIN
- B2C: Grouped by state and tax rate
- HSN Summary: Table

**Export Options:**
- JSON: Button
- Excel: Button
- PDF: Button
- Upload to GSTN: Button (future)

---

#### 4.3 Settings

**Layout:**
- List view
- Sections with headers

**Sections:**

1. **Profile**
   - Avatar + Name
   - Email
   - Phone (read-only)
   - Edit button

2. **Business**
   - Business name
   - Business type
   - GSTIN
   - Address
   - Edit button

3. **Invoice Settings**
   - Invoice prefix
   - Starting number
   - Terms & conditions
   - Logo upload

4. **Tax Configuration**
   - Default tax rate
   - Tax calculation method
   - Round off method

5. **Notifications**
   - Toggles for each type
   - Email notifications
   - SMS notifications
   - Push notifications

6. **Data & Backup**
   - Export data
   - Import data
   - Backup frequency
   - Cloud sync settings

7. **Help & Support**
   - Help center
   - Contact support
   - FAQs
   - Video tutorials

8. **About**
   - App version
   - Terms of Service
   - Privacy Policy
   - Logout button

**List Item Style:**
- Height: 56px
- Left: Icon (24px, #6B7280)
- Center: Title (16px, Regular, #111827)
- Right: Value or Chevron (20px, #9CA3AF)
- Toggle: Right side (if applicable)

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

## Developer Thinking & Best Practices

> **For AI Agent/Developer:** This section helps you think like an experienced UI/UX developer while building each screen. Consider these points during implementation to create the best possible user experience.

### 🧠 Developer Mindset - How to Think While Building

**As you build each screen, constantly ask yourself:**

1. **"Is this the fastest way for the user to complete their task?"**
   - If no → Simplify, remove steps, optimize flow
   - Example: Auto-advance OTP input saves 5 taps

2. **"What happens if this fails?"**
   - Network error → Show helpful message, allow retry
   - Validation error → Show clear error, suggest fix
   - Permission denied → Explain why, link to settings

3. **"Can the user do this offline?"**
   - If yes → Implement offline support
   - If no → Show clear message why not
   - Example: Create invoice works offline, syncs later

4. **"Is this clear to someone who's never used the app?"**
   - Labels clear? → Yes/No
   - Error messages helpful? → Yes/No
   - Next step obvious? → Yes/No

5. **"Will this work on a slow device with poor internet?"**
   - Loading states? → Yes
   - Cached data? → Yes
   - Optimized rendering? → Yes

6. **"Does this feel responsive?"**
   - Immediate feedback on tap? → Yes
   - Smooth animations? → Yes
   - No freezing? → Yes

### Decision-Making Framework

**When you encounter a design decision, use this framework:**

```
1. What's the user trying to accomplish?
   → Understand the goal

2. What's the fastest way to help them?
   → Optimize for speed

3. What could go wrong?
   → Plan for errors

4. How do we recover?
   → Provide solutions

5. Is this consistent with the rest of the app?
   → Maintain patterns

6. Can we make this better?
   → Iterate and improve
```

**Example: OTP Input Design Decision**

1. **User Goal:** Enter 6-digit code quickly
2. **Fastest Way:** Auto-advance boxes, auto-submit when complete
3. **What Could Go Wrong:** User makes typo, OTP expires, network fails
4. **Recovery:** Clear on error, resend option, retry mechanism
5. **Consistency:** Matches other input patterns in app
6. **Better:** Support paste, auto-read from SMS (Android)

### Core Development Principles

**1. User-First Thinking**
- Every decision should answer: "Does this make the user's life easier?"
- If a feature is confusing, simplify it
- If a process takes too long, optimize it
- If an error is unclear, make it helpful

**2. Performance is UX**
- Slow app = bad UX, no matter how pretty
- Optimize images, lazy load, use virtual lists
- Show loading states, don't freeze the UI
- Cache intelligently, sync efficiently

**3. Offline-First Mindset**
- Assume users will be offline 30% of the time
- Every action should work offline
- Show clear sync status
- Queue actions, sync when online
- Don't lose user data

**4. Error Prevention > Error Handling**
- Validate early, show errors clearly
- Prevent invalid states
- Auto-save drafts
- Confirm destructive actions
- Provide undo when possible

**5. Consistency Creates Trust**
- Same patterns = users learn faster
- Same colors = users understand meaning
- Same spacing = visual harmony
- Same interactions = muscle memory

---

### Screen-by-Screen Developer Thinking

#### Splash Screen - Developer Thoughts

**Why This Design:**
- First impression matters - smooth, professional
- Logo animation builds brand recognition
- Loading indicator shows app is working (not frozen)
- Version number helps with support/debugging

**What to Think About:**
- **Performance:** Don't show splash longer than needed, but minimum 1.5s for brand impression
- **State Management:** Check auth status during splash - don't make user wait twice
- **Error Handling:** What if app fails to load? Show error, allow retry
- **Network:** Check connectivity, show appropriate message
- **Caching:** Load cached data first, update in background

**Implementation Considerations:**
```typescript
// Think about:
- Should we preload critical data during splash?
- Should we check for app updates?
- How do we handle first launch vs returning user?
- What if authentication check fails?
- Should we show different splash for different states?
```

**Best Practices:**
- Use native splash screen for instant display
- Transition smoothly to next screen
- Don't block on network calls
- Show progress if loading takes > 2 seconds
- Handle all error cases gracefully

---

#### Welcome/Onboarding - Developer Thoughts

**Why This Design:**
- Users need to understand value before committing
- Skip option respects user's time
- Carousel shows multiple benefits without overwhelming
- Get Started CTA is clear next step

**What to Think About:**
- **First Impression:** This is where users decide if they'll continue
- **Skip Logic:** Store flag - don't show again if skipped
- **Engagement:** Track which slides users spend time on
- **Accessibility:** Support swipe gestures + button navigation
- **Performance:** Preload next slide images

**Implementation Considerations:**
```typescript
// Think about:
- Should we A/B test different value propositions?
- How do we handle users who skip vs complete?
- Should we track completion rate?
- What if user swipes too fast? (they might miss info)
- Should we show different slides based on user type?
```

**Best Practices:**
- Smooth swipe animations (60fps)
- Clear page indicators
- Easy skip option (but not too prominent)
- Celebrate completion (subtle animation)
- Don't force users through if they skip

**Edge Cases:**
- User swipes back and forth - handle smoothly
- User closes app mid-onboarding - resume or restart?
- Very slow device - optimize animations
- Screen rotation - maintain state

---

#### Phone Login - Developer Thoughts

**Why This Design:**
- Phone is universal in India (everyone has one)
- OTP is more secure than passwords (no password to forget)
- Country code default to +91 (India) saves time
- Real-time validation prevents errors

**What to Think About:**
- **User Experience:** Make it as fast as possible - this is a barrier
- **Validation:** Validate format immediately, not on submit
- **Error Messages:** Be helpful - "Please enter 10 digits" not "Invalid"
- **Keyboard:** Show numeric keyboard, auto-focus input
- **Rate Limiting:** Handle gracefully - don't frustrate user

**Implementation Considerations:**
```typescript
// Think about:
- Should we auto-format phone number as user types? (98765 43210)
- Should we remember last used country code?
- How do we handle international numbers?
- What if SMS fails? (show alternative: email OTP?)
- Should we pre-fill if user has used app before?
```

**Best Practices:**
- Auto-focus phone input on load
- Show numeric keyboard
- Validate in real-time (but don't be annoying)
- Clear error messages
- Handle keyboard overlap (scroll view)
- Remember country code preference

**Performance:**
- Debounce validation (don't validate on every keystroke)
- Optimize API call (only send when valid)
- Cache country codes locally
- Pre-validate before API call

**Accessibility:**
- Screen reader: "Enter your 10-digit phone number"
- Keyboard navigation: Tab to input, Enter to submit
- Error announcements: Clear, actionable

---

#### OTP Verification - Developer Thoughts

**Why This Design:**
- 6 separate boxes = clear, easy to understand
- Auto-advance = faster entry, less errors
- Auto-submit = one less tap, smoother flow
- Resend timer = prevents spam, shows when available

**What to Think About:**
- **User Experience:** This is a critical moment - if it fails, user might abandon
- **Auto-Advance:** Makes entry faster, but what if user wants to edit?
- **Paste Support:** Many users copy-paste OTP from SMS
- **Error Handling:** Invalid OTP is frustrating - make it easy to retry
- **Timer:** 60 seconds feels long - show progress or countdown

**Implementation Considerations:**
```typescript
// Think about:
- Should we auto-read OTP from SMS? (Android)
- How do we handle OTP from multiple sources? (SMS, email)
- What if user closes app? (OTP expires, need to resend)
- Should we show "Verifying..." state?
- How do we handle network errors during verification?
```

**Best Practices:**
- Support paste (common use case)
- Auto-focus first box on load
- Clear all boxes on error (let user start fresh)
- Show clear error messages
- Make resend easy (but not too easy - prevent spam)
- Handle backspace intelligently (go to previous if current empty)

**Performance:**
- Verify immediately when 6 digits entered
- Show loading state (don't freeze UI)
- Handle timeout gracefully
- Retry logic for network errors

**Security:**
- Don't log OTP in console
- Clear OTP from memory after verification
- Rate limit verification attempts
- Lock after too many failures

**Edge Cases:**
- User pastes 5 digits - handle gracefully
- User pastes 7 digits - take first 6
- User receives OTP while on different screen - handle
- OTP expires during entry - show message, allow resend
- Multiple OTPs received - use most recent

---

#### Business Setup - Developer Thoughts

**Why This Design:**
- First business setup is critical - sets up everything else
- Optional fields reduce friction (user can add later)
- GSTIN validation prevents errors early
- Skip option for users who want to start quickly

**What to Think About:**
- **User Experience:** This feels like "work" - make it as easy as possible
- **Validation:** Real-time for GSTIN (complex format), on-blur for others
- **Auto-fill:** Can we auto-fill state from pincode? (great UX)
- **Skip Logic:** What happens if user skips? (they can add later)
- **Data Quality:** Better to have partial data than no data

**Implementation Considerations:**
```typescript
// Think about:
- Should we validate GSTIN against GSTN API? (slow, but accurate)
- Can we auto-detect business type from GSTIN?
- Should we save as draft if user navigates away?
- How do we handle multiple businesses? (user might add more later)
- Should we pre-fill from phone number location? (privacy concern)
```

**Best Practices:**
- Auto-save as user types (draft)
- Validate GSTIN format in real-time (don't wait for submit)
- Auto-fill state from pincode (if API available)
- Show helpful hints (what is GSTIN? why do we need it?)
- Allow skip, but encourage completion
- Remember user's choices (business type, etc.)

**Performance:**
- Don't block on GSTIN validation (async)
- Cache state/pincode mapping locally
- Optimize form rendering (don't re-render on every keystroke)
- Lazy load dropdown options

**Data Quality:**
- Validate format before allowing submit
- Show clear error messages
- Suggest corrections if possible
- Don't allow invalid data to be saved

**Edge Cases:**
- User enters invalid GSTIN format - show example
- User skips everything - create minimal business
- User enters GSTIN that already exists - check and warn
- Network fails during save - queue for retry
- User closes app - save draft, resume later

---

#### Dashboard - Developer Thoughts

**Why This Design:**
- Dashboard is the "home" - users see this most
- Quick stats = instant value, no digging needed
- Recent transactions = context, what happened recently
- FAB = quick access to most common action (create invoice)

**What to Think About:**
- **Performance:** This loads first - must be fast
- **Data Freshness:** How often to refresh? (balance freshness vs battery)
- **Personalization:** Should stats be customizable?
- **Empty State:** First-time user experience is critical
- **Offline:** Show cached data, indicate if stale

**Implementation Considerations:**
```typescript
// Think about:
- Should we cache dashboard data? (yes, for offline)
- How do we handle multiple businesses? (switch context)
- Should stats update in real-time? (expensive, but nice)
- What if user has no transactions? (empty state is important)
- Should we show different stats based on business type?
```

**Best Practices:**
- Load cached data first (instant display)
- Update in background (show fresh data when ready)
- Show loading skeletons (not blank screen)
- Pull-to-refresh (user control)
- Optimize queries (dashboard needs multiple data sources)
- Cache aggressively (this screen is viewed often)

**Performance:**
- Lazy load images (item images in transactions)
- Virtual list for transactions (if many)
- Debounce refresh (don't refresh on every focus)
- Optimize stat calculations (cache if possible)
- Paginate transactions (load more on scroll)

**Data Strategy:**
- Prefetch data user might need next
- Cache recent transactions locally
- Calculate stats efficiently (don't recalculate on every render)
- Handle stale data gracefully (show timestamp)

**User Experience:**
- Celebrate milestones (first invoice, first payment)
- Show trends (up/down arrows, percentages)
- Make stats actionable (tap to see details)
- Show sync status clearly (don't hide offline state)

**Edge Cases:**
- User has no data yet - empty state with CTA
- Very slow network - show cached data, update when ready
- Sync fails - show pending count, allow manual sync
- Multiple businesses - switch smoothly, maintain state
- Large transaction list - paginate, don't load all at once

---

#### Party List - Developer Thoughts

**Why This Design:**
- Search is critical (users have many parties)
- Filters help narrow down (customers vs suppliers)
- Cards show key info at a glance (balance, last transaction)
- Empty state guides first-time users

**What to Think About:**
- **Search Performance:** Must be instant (debounce, local search first)
- **List Performance:** Many parties = need virtualization
- **Balance Display:** Color coding helps quick scanning
- **Empty State:** First party is important - make it easy
- **Offline:** Search and filter should work offline

**Implementation Considerations:**
```typescript
// Think about:
- Should we search across all fields? (name, phone, GSTIN)
- How do we handle fuzzy search? (typos, partial matches)
- Should we cache search results?
- How do we handle very long lists? (pagination vs infinite scroll)
- Should we show recent parties first? (smart sorting)
```

**Best Practices:**
- Local search first (instant), then server search (if needed)
- Debounce search input (300ms - don't search on every keystroke)
- Highlight search matches (visual feedback)
- Remember last search/filter (convenience)
- Show search result count ("Found 12 parties")
- Virtual list for performance (FlashList or FlatList with getItemLayout)

**Performance:**
- Index party data for fast search
- Lazy load party images
- Virtualize list (only render visible items)
- Cache filtered results
- Optimize balance calculations (don't recalculate on every render)

**User Experience:**
- Show loading state during search
- Clear search easily (X button)
- Remember filter selection
- Show "No results" clearly (not just empty list)
- Make adding party easy (prominent FAB)

**Accessibility:**
- Screen reader: Announce search results count
- Keyboard: Navigate list with arrow keys
- Focus: Manage focus when filtering/searching

**Edge Cases:**
- Very long party name - truncate with ellipsis
- No phone number - show alternative (email or "No contact")
- Negative balance - show clearly (red, maybe with warning)
- Many parties with same name - show distinguishing info
- Search returns nothing - helpful message, suggest adding

---

#### Add/Edit Party - Developer Thoughts

**Why This Design:**
- Forms are tedious - make them as easy as possible
- Real-time validation prevents errors
- Auto-fill state from pincode (great UX win)
- Optional fields reduce friction

**What to Think About:**
- **Form UX:** Long forms are intimidating - group logically
- **Validation:** Real-time is better than on-submit
- **Auto-save:** Save draft as user types (don't lose data)
- **Smart Defaults:** Pre-fill what we can (country, state from location)
- **Error Prevention:** Validate format, suggest corrections

**Implementation Considerations:**
```typescript
// Think about:
- Should we auto-save as draft? (yes, prevent data loss)
- Can we auto-fill address from phone number location? (privacy)
- Should we validate GSTIN against API? (slow but accurate)
- How do we handle duplicate parties? (check by phone/name)
- Should we allow bulk import? (future feature)
```

**Best Practices:**
- Auto-save draft every 10 seconds (or on blur)
- Validate in real-time (but don't be annoying)
- Show helpful hints (what is GSTIN? why do we need it?)
- Auto-format inputs (phone, GSTIN with spaces)
- Remember user preferences (default credit period, etc.)
- Handle keyboard overlap (scroll to field)

**Performance:**
- Debounce validation (don't validate on every keystroke)
- Cache state/pincode mapping
- Optimize form re-renders (use controlled components efficiently)
- Lazy load dropdown options

**Data Quality:**
- Validate format before submit
- Check for duplicates (by phone or GSTIN)
- Normalize data (uppercase GSTIN, format phone)
- Sanitize inputs (prevent XSS, etc.)

**User Experience:**
- Show progress indicator (which section, how many left)
- Allow save even if optional fields empty
- Clear error messages
- Auto-advance to next field when appropriate
- Show character counts for limited fields

**Edge Cases:**
- User enters duplicate phone - warn, suggest existing party
- Invalid GSTIN format - show example format
- Network fails during save - queue for retry, show status
- User closes app - save draft, resume later
- Very long business name - allow but warn about display

---

#### Create Invoice (Multi-Step) - Developer Thoughts

**Why This Design:**
- Multi-step reduces cognitive load (one thing at a time)
- Progress indicator shows where user is
- Review step prevents errors (user can catch mistakes)
- Save as draft allows completion later

**What to Think About:**
- **User Experience:** This is the core feature - must be perfect
- **Performance:** Many items = need optimization
- **Data Integrity:** Validate at each step, don't allow invalid state
- **Offline:** Must work offline (queue for sync)
- **Draft Management:** Save drafts, allow resume

**Implementation Considerations:**
```typescript
// Think about:
- Should we auto-save after each step? (yes, prevent data loss)
- How do we handle very long item lists? (pagination, search)
- Should we remember last used items? (yes, speed up entry)
- How do we calculate tax in real-time? (optimize calculation)
- Should we validate stock availability? (prevent overselling)
```

**Best Practices:**
- Auto-save after each step (don't lose progress)
- Remember last used party/items (smart defaults)
- Real-time tax calculation (show as user adds items)
- Validate stock availability (prevent overselling)
- Show running total (user sees impact of each item)
- Allow edit at any step (don't force linear flow)

**Performance:**
- Optimize tax calculation (cache rates, batch calculate)
- Virtual list for items (if many)
- Lazy load item images
- Debounce search (don't search on every keystroke)
- Optimize invoice number generation (don't block UI)

**User Experience:**
- Show progress clearly (steps, percentage)
- Allow going back to edit (don't lock steps)
- Preview before final save (review step is critical)
- Show helpful hints (what is HSN? why tax rate matters?)
- Celebrate completion (subtle animation, success message)

**Data Integrity:**
- Validate party selection (required)
- Validate at least one item (required)
- Validate quantities (must be > 0)
- Validate stock (if tracking enabled)
- Calculate totals correctly (rounding, tax, etc.)

**Edge Cases:**
- User adds item with no stock - warn, allow override?
- User changes party mid-flow - recalculate tax (intra/inter-state)
- User closes app - save draft, resume later
- Network fails during save - queue for sync
- User adds 100 items - optimize rendering, allow bulk operations

**Offline Considerations:**
- Generate invoice number locally (UUID, sync later)
- Save to local DB immediately
- Queue for sync when online
- Show sync status
- Handle conflicts (if invoice number taken)

---

#### Invoice Detail - Developer Thoughts

**Why This Design:**
- Users need to see full invoice details
- Payment tracking is critical (who paid, who didn't)
- Actions should be easily accessible
- Share functionality is important (WhatsApp, Email)

**What to Think About:**
- **Information Hierarchy:** Most important info first (amount, status)
- **Actions:** Make common actions easy (share, record payment)
- **Performance:** PDF generation can be slow - optimize
- **Offline:** Show cached PDF if available
- **Permissions:** Some actions require permissions (share, print)

**Implementation Considerations:**
```typescript
// Think about:
- Should we cache PDF? (yes, for offline viewing)
- How do we handle very long item lists? (scrollable section)
- Should we show payment timeline? (visual, helpful)
- How do we handle invoice edits? (create new version or update?)
- Should we track invoice views? (analytics)
```

**Best Practices:**
- Load PDF in background (don't block UI)
- Cache PDF locally (for offline viewing)
- Show payment progress (visual indicator)
- Make share easy (native share sheet)
- Allow quick actions (record payment without leaving screen)
- Show related invoices (from same party)

**Performance:**
- Lazy load PDF (don't generate until needed)
- Cache generated PDFs
- Optimize image loading in items
- Virtual list if many payment entries

**User Experience:**
- Show status prominently (paid/unpaid/overdue)
- Make payment recording easy (one tap)
- Show payment history clearly (who, when, how much)
- Allow easy sharing (multiple channels)
- Show related actions (view party, view other invoices)

**Edge Cases:**
- Very long invoice (many items) - make scrollable, show summary
- PDF generation fails - show error, allow retry
- Payment recorded twice - prevent duplicate, show warning
- Invoice cancelled - disable edit, show clearly
- Offline viewing - show cached PDF, indicate if stale

---

### Component-Level Thinking

#### Buttons - Developer Thoughts

**Why These Specifications:**
- 48px height = comfortable touch target (accessibility)
- Primary color = draws attention (most important action)
- Disabled state = prevents errors (can't click when invalid)
- Loading state = shows progress (user knows something is happening)

**What to Think About:**
- **Touch Targets:** Must be at least 44px (accessibility requirement)
- **Visual Feedback:** Press state shows action was registered
- **Loading State:** Prevents double-submission
- **Disabled State:** Should be visually distinct (not just grayed out)

**Best Practices:**
- Always show loading state during async operations
- Disable button during submission (prevent double-click)
- Show clear disabled state (not just gray - explain why)
- Use primary button sparingly (only for main action)
- Group related actions (Cancel + Save together)

**Performance:**
- Don't block UI during button action
- Show immediate feedback (optimistic update if safe)
- Handle errors gracefully (don't leave button in loading state)

---

#### Input Fields - Developer Thoughts

**Why These Specifications:**
- Label above = always visible (not hidden by keyboard)
- Real-time validation = prevents errors early
- Error below = clear, actionable
- Helper text = educates user

**What to Think About:**
- **Keyboard:** Show appropriate keyboard (numeric for numbers, email for email)
- **Validation:** Real-time is better, but don't be annoying
- **Auto-format:** Format as user types (phone, GSTIN) - better UX
- **Focus Management:** Move to next field when appropriate

**Best Practices:**
- Validate format in real-time (but debounce)
- Show errors immediately (but clear when fixed)
- Auto-format inputs (phone: 98765 43210)
- Remember user input (if they navigate away and come back)
- Handle keyboard overlap (scroll to field)

**Performance:**
- Debounce validation (don't validate on every keystroke)
- Optimize re-renders (use controlled components efficiently)
- Cache validation results if possible

**Accessibility:**
- Associate label with input (for screen readers)
- Announce errors to screen readers
- Keyboard navigation (Tab to move, Enter to submit)

---

#### Lists - Developer Thoughts

**Why These Specifications:**
- Cards = easy to scan, show more info
- Virtual lists = performance with many items
- Empty states = guide users
- Infinite scroll = load more without pagination

**What to Think About:**
- **Performance:** Virtual lists are critical for 100+ items
- **Loading:** Show skeletons, not blank screen
- **Empty State:** First item is important - make it easy
- **Search/Filter:** Must be fast (local first, then server)

**Best Practices:**
- Use virtual lists (FlashList or FlatList with getItemLayout)
- Show loading skeletons (better than spinner)
- Paginate or infinite scroll (don't load all at once)
- Cache list data locally
- Optimize item rendering (memoize if needed)

**Performance:**
- Only render visible items
- Lazy load images
- Debounce search
- Cache filtered results
- Optimize list item components

**User Experience:**
- Pull-to-refresh (user control)
- Show loading at bottom (infinite scroll)
- Remember scroll position (if user navigates away)
- Smooth scrolling (60fps)

---

### Performance Thinking

**Why Performance Matters:**
- Slow app = users abandon
- Laggy animations = feels broken
- Long load times = users think app crashed
- Battery drain = users uninstall

**What to Optimize:**
1. **Images:**
   - Compress before upload
   - Lazy load (only load when visible)
   - Use appropriate sizes (@2x, @3x)
   - Cache aggressively

2. **Lists:**
   - Virtual lists (only render visible)
   - Pagination (don't load all)
   - Memoize item components
   - Optimize item height calculations

3. **Network:**
   - Cache API responses
   - Batch requests when possible
   - Show cached data first
   - Update in background

4. **Animations:**
   - Use native driver (React Native)
   - Keep at 60fps
   - Reduce motion if user prefers
   - Optimize complex animations

5. **State Management:**
   - Don't re-render unnecessarily
   - Use memoization
   - Optimize selectors
   - Batch state updates

---

### Offline-First Thinking

**Why Offline-First:**
- Indian users often have poor connectivity
- Users expect app to work always
- Offline capability = competitive advantage
- Better UX = users trust the app

**What to Consider:**
- **Data Storage:** Local DB (WatermelonDB) for all data
- **Sync Strategy:** Queue actions, sync when online
- **Conflict Resolution:** Last-write-wins or manual resolution
- **Status Indicators:** Show sync status clearly
- **Data Freshness:** Indicate if data is stale

**Implementation:**
- Store all data locally first
- Queue write operations
- Sync in background when online
- Handle conflicts gracefully
- Show clear sync status

**Best Practices:**
- Never lose user data (save locally first)
- Show sync status (online/offline/syncing/pending)
- Allow full functionality offline
- Sync intelligently (batch, prioritize)
- Handle conflicts (show to user if needed)

---

### Error Handling Thinking

**Why Good Error Handling:**
- Errors happen - handle them gracefully
- Good error messages = users understand and can fix
- Bad error messages = users frustrated, abandon

**What to Consider:**
- **Error Types:** Network, validation, server, permission
- **Error Messages:** User-friendly, actionable
- **Error Recovery:** Allow retry, provide alternatives
- **Error Logging:** Log for debugging, but don't show to user

**Best Practices:**
- Show user-friendly messages (not technical errors)
- Provide actionable solutions ("Check internet" not "Network error")
- Allow retry for transient errors
- Log errors for debugging
- Don't lose user data on error

**Error Message Guidelines:**
- ❌ Bad: "Error 500"
- ✅ Good: "Something went wrong. Please try again."
- ❌ Bad: "Invalid input"
- ✅ Good: "Please enter a valid 10-digit phone number"
- ❌ Bad: "Network error"
- ✅ Good: "No internet connection. Working offline. Changes will sync when online."

---

### Accessibility Thinking

**Why Accessibility:**
- Legal requirement (WCAG 2.1 AA)
- Better for all users (not just disabled)
- Larger market (more users)
- Right thing to do

**What to Consider:**
- **Screen Readers:** All content must be readable
- **Color Contrast:** Must meet WCAG standards
- **Touch Targets:** Minimum 44px
- **Keyboard Navigation:** Full functionality via keyboard
- **Dynamic Type:** Support system font scaling

**Best Practices:**
- Test with screen reader
- Test color contrast (use tools)
- Test with keyboard only
- Test with large fonts
- Test with reduced motion

**Implementation:**
- Use semantic HTML/React Native components
- Add accessibility labels
- Ensure color contrast
- Support keyboard navigation
- Test with accessibility tools

---

### Testing Thinking

**Why Testing:**
- Catch bugs before users do
- Ensure quality
- Prevent regressions
- Build confidence

**What to Test:**
- **Visual:** Matches design (pixel-perfect)
- **Functional:** Everything works
- **Performance:** Smooth, fast
- **Accessibility:** Screen reader, keyboard, contrast
- **Edge Cases:** Empty states, errors, offline

**Best Practices:**
- Test on real devices (not just simulator)
- Test on slow devices
- Test with poor network
- Test offline mode
- Test edge cases

**Testing Checklist:**
- [ ] All screens render correctly
- [ ] All interactions work
- [ ] Loading states show
- [ ] Error states display
- [ ] Empty states show
- [ ] Offline mode works
- [ ] Performance is good
- [ ] Accessibility passes

---

### Common Developer Questions & Answers

**Q: "Should I validate on every keystroke or on blur?"**
**A:** 
- Format validation: On every keystroke (phone formatting, GSTIN formatting)
- Business logic validation: On blur (required fields, format checks)
- Server validation: On submit (duplicate check, API validation)
- **Why:** Real-time formatting feels responsive, but don't annoy with errors while typing

**Q: "How do I handle loading states?"**
**A:**
- Show skeleton loaders for content (better than spinner)
- Show spinner for actions (button loading state)
- Show progress for long operations (file upload, sync)
- **Why:** Users need to know something is happening, but skeletons show structure

**Q: "When should I show errors vs warnings?"**
**A:**
- **Errors:** Block user action, must fix (invalid phone, required field empty)
- **Warnings:** Allow action but inform (low stock, duplicate party)
- **Info:** Just inform (auto-saved, syncing)
- **Why:** Errors stop flow, warnings inform, info reassures

**Q: "Should I auto-save or require explicit save?"**
**A:**
- **Auto-save:** Forms, drafts, long data entry (invoice creation)
- **Explicit save:** Critical actions (delete, payment, final submit)
- **Why:** Auto-save prevents data loss, explicit save gives control for important actions

**Q: "How do I handle offline vs online states?"**
**A:**
- Show clear indicator (banner, icon, status)
- Queue actions when offline
- Sync when online (background, don't block)
- Show pending count
- **Why:** Users need to know state, and offline shouldn't block them

**Q: "Should I use modals or full screens?"**
**A:**
- **Modals:** Quick actions, confirmations, simple forms (1-2 fields)
- **Full screens:** Complex forms, multi-step flows, detail views
- **Why:** Modals are less intrusive, full screens give more space for complexity

**Q: "How do I optimize long lists?"**
**A:**
- Use virtual lists (FlashList, FlatList with getItemLayout)
- Paginate or infinite scroll (don't load all)
- Lazy load images
- Memoize list items
- **Why:** Performance degrades with many items, virtualization is essential

**Q: "When should I show empty states vs loading?"**
**A:**
- **Loading:** Data is being fetched (show skeleton/spinner)
- **Empty:** Data fetched but no results (show empty state with CTA)
- **Error:** Fetch failed (show error with retry)
- **Why:** Different states need different UI - don't confuse users

**Q: "How do I handle form validation?"**
**A:**
- Client-side: Real-time format validation
- Server-side: Business logic validation (duplicates, permissions)
- Show errors immediately (but clear when fixed)
- Prevent submit if errors exist
- **Why:** Catch errors early, but don't annoy while typing

**Q: "Should I cache data locally?"**
**A:**
- **Yes for:** Frequently accessed (dashboard, recent items, user profile)
- **No for:** Real-time critical (payments, stock levels - show stale indicator)
- **Strategy:** Cache first, update in background
- **Why:** Instant display feels fast, background update keeps data fresh

**Q: "How do I handle errors gracefully?"**
**A:**
- Show user-friendly message (not technical error)
- Provide actionable solution ("Check internet" not "Network error")
- Allow retry for transient errors
- Log technical details for debugging
- **Why:** Users don't care about technical details, they want to know how to fix it

**Q: "Should I use optimistic updates?"**
**A:**
- **Yes for:** Non-critical actions (like, favorite, UI state)
- **No for:** Critical actions (payment, delete, money transfers)
- **Why:** Optimistic updates feel fast, but can cause issues if they fail

**Q: "How do I handle keyboard overlap?"**
**A:**
- Use KeyboardAvoidingView (React Native)
- Scroll to focused input
- Adjust padding when keyboard shows
- Dismiss keyboard on outside tap
- **Why:** Keyboard shouldn't hide input - users need to see what they're typing

**Q: "When should I show confirmations?"**
**A:**
- **Always:** Destructive actions (delete, cancel invoice, logout)
- **Sometimes:** Important actions (save draft, send email)
- **Never:** Normal actions (save, next, back)
- **Why:** Confirmations prevent mistakes, but too many slow down users

**Q: "How do I make the app feel fast?"**
**A:**
- Show cached data immediately
- Use skeleton loaders (not blank screens)
- Optimize images (compress, lazy load)
- Virtualize lists
- Batch API calls
- **Why:** Perception of speed matters more than actual speed

**Q: "Should I preload data?"**
**A:**
- **Yes for:** Data user will likely need next (dashboard stats, recent items)
- **No for:** Data user might not need (all invoices, all parties)
- **Strategy:** Prefetch on WiFi, not on cellular
- **Why:** Preloading improves UX, but wastes bandwidth if not used

---

### Implementation Priorities

**When building, prioritize in this order:**

1. **Functionality First**
   - Make it work (even if ugly)
   - Core features must work perfectly
   - Don't polish before it works

2. **Performance Second**
   - Optimize for speed
   - Handle large datasets
   - Smooth animations

3. **Polish Third**
   - Perfect the design
   - Add micro-interactions
   - Refine animations

4. **Edge Cases Fourth**
   - Handle errors
   - Empty states
   - Offline mode

**Why This Order:**
- Working app > Pretty app
- Fast app > Slow app
- Polished app > Rough app
- Complete app > Incomplete app

---

### Code Quality Thinking

**While writing code, think about:**

1. **Maintainability:**
   - Is this code easy to understand?
   - Will another developer know what this does?
   - Can this be reused?

2. **Performance:**
   - Is this optimized?
   - Will this scale?
   - Are there unnecessary re-renders?

3. **Reliability:**
   - What if this fails?
   - Are errors handled?
   - Is data validated?

4. **Accessibility:**
   - Can screen readers use this?
   - Is keyboard navigation supported?
   - Is color contrast adequate?

5. **User Experience:**
   - Is this the best way?
   - Can we make it faster?
   - Is it clear what to do?

---

### Debugging Mindset

**When something doesn't work, think:**

1. **Is it a data issue?**
   - Check API response
   - Check local state
   - Check data format

2. **Is it a state issue?**
   - Check component state
   - Check global state
   - Check state updates

3. **Is it a rendering issue?**
   - Check styles
   - Check layout
   - Check conditional rendering

4. **Is it a performance issue?**
   - Check re-renders
   - Check expensive operations
   - Check network calls

5. **Is it a user issue?**
   - Check user input
   - Check permissions
   - Check device capabilities

**Debugging Checklist:**
- [ ] Check console for errors
- [ ] Check network tab for API calls
- [ ] Check React DevTools for state
- [ ] Check device logs
- [ ] Test on different devices
- [ ] Test with different data

---

### User Feedback Thinking

**While building, imagine user reactions:**

**Good Reactions:**
- "Wow, that was fast!"
- "This is so easy to use"
- "I didn't even need to think"
- "It just works"

**Bad Reactions:**
- "Why is this so slow?"
- "I don't understand what to do"
- "This is confusing"
- "It keeps crashing"

**How to Achieve Good Reactions:**
- Optimize for speed
- Make flows intuitive
- Provide clear feedback
- Handle errors gracefully
- Test thoroughly

---

### Iteration Thinking

**After building, always ask:**

1. **"Can we make this faster?"**
   - Optimize API calls
   - Cache more aggressively
   - Reduce re-renders

2. **"Can we make this simpler?"**
   - Remove unnecessary steps
   - Simplify UI
   - Reduce cognitive load

3. **"Can we make this clearer?"**
   - Better labels
   - Better error messages
   - Better empty states

4. **"Can we make this more reliable?"**
   - Better error handling
   - Better offline support
   - Better validation

**Remember:** First version doesn't have to be perfect, but it should work well. Iterate based on user feedback.

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

### Components - Complete Specifications

> **For Developers:** Every component includes all states, interactions, and edge cases. Implement these exactly as specified.

---

#### Buttons

**Primary Button:**
- **Default State:**
  - Background: #4F46E5 (Primary Blue)
  - Text: White (#FFFFFF)
  - Font: 16px, SemiBold
  - Height: 48px (minimum touch target)
  - Padding: 12px 24px (horizontal)
- Border Radius: 8px
  - Shadow: md (0 4px 6px -1px rgba(0,0,0,0.1))
  - Width: Full width (minus container padding) or auto (min 120px)

- **Pressed State:**
  - Background: #3730A3 (Primary Dark)
  - Scale: 0.98 (subtle press effect)
  - Duration: 100ms

- **Disabled State:**
  - Background: #F3F4F6
  - Text: #9CA3AF
  - Cursor: not-allowed
  - No shadow
  - Opacity: 0.6

- **Loading State:**
  - Show spinner (20px, White) + "Loading..." text
  - Disable interaction
  - Spinner animation: 1s linear infinite

- **Accessibility:**
  - aria-label: Button purpose
  - role: "button"
  - Keyboard: Enter/Space to activate
  - Focus: 2px outline, #4F46E5, 2px offset

**Secondary Button:**
- **Default:**
  - Background: White (#FFFFFF)
  - Border: 1px solid #D1D5DB
  - Text: #374151 (Gray 700)
  - Font: 16px, Medium
- Height: 48px
  - Padding: 12px 24px
  - Border Radius: 8px
  - No shadow

- **Pressed:**
  - Background: #F3F4F6
  - Border: 1px solid #9CA3AF
  - Scale: 0.98

- **Disabled:**
  - Background: #F9FAFB
  - Border: 1px solid #E5E7EB
  - Text: #9CA3AF
  - Opacity: 0.6

**Text Button:**
- **Default:**
  - Background: Transparent
  - Text: #4F46E5 (Primary Blue)
  - Font: 14px, Medium
  - Height: 40px (touch target: 44px)
  - Padding: 8px 12px
  - No border, no background

- **Pressed:**
  - Background: #EEF2FF (very light blue)
  - Text: #3730A3

- **Hover (web):**
  - Underline: 1px solid #4F46E5
  - Text-decoration: underline

**Icon Button:**
- **Default:**
  - Size: 40px × 40px (minimum 44px touch target)
  - Background: Transparent or #F3F4F6
  - Icon: 20px or 24px, #6B7280
- Border Radius: 8px
  - Padding: 8px

- **Pressed:**
  - Background: #E5E7EB
  - Scale: 0.95

- **Active:**
  - Background: #EEF2FF
  - Icon: #4F46E5

**FAB (Floating Action Button):**
- **Default:**
  - Size: 56px × 56px
  - Background: #4F46E5
  - Icon: 24px, White
  - Border Radius: 50% (circular)
  - Shadow: xl (0 20px 25px -5px rgba(0,0,0,0.1))
  - Position: Fixed, bottom-right, 24px from edges

- **Pressed:**
  - Scale: 0.9
  - Shadow: lg

- **Expanded Menu:**
  - Backdrop: rgba(0,0,0,0.5), full screen
  - Menu items: 48px × 48px, 16px spacing
  - Animation: Scale (0.8 → 1.0) + Fade (0 → 1)
  - Duration: 200ms, ease-out
  - Label: White text, dark background, 12px font

---

#### Input Fields

**Text Input:**
- **Container:**
  - Height: 48px (minimum)
  - Width: Full width (minus padding)
  - Background: White
  - Border: 1px solid #D1D5DB
- Border Radius: 8px
  - Padding: 12px 16px

- **Label:**
  - Position: Above input, 8px spacing
  - Font: 12px, Medium, #374151
  - Required indicator: Red asterisk (*) if required

- **Input:**
  - Font: 14px, Regular, #111827
  - Placeholder: 14px, Regular, #9CA3AF
  - Text color: #111827
  - Background: Transparent
  - Border: None (handled by container)

- **Focus State:**
  - Border: 2px solid #4F46E5
  - Outline: None (use border instead)
  - Background: White
  - Label color: #4F46E5 (optional)

- **Error State:**
  - Border: 2px solid #EF4444
  - Background: #FEF2F2 (very light red)
  - Error message: Below input, 8px spacing
    - Text: 12px, Regular, #EF4444
    - Icon: Alert circle (16px, #EF4444), left of text

- **Success State (optional):**
  - Border: 2px solid #10B981
  - Checkmark icon: Right side, 16px, #10B981

- **Disabled State:**
  - Background: #F9FAFB
  - Border: 1px solid #E5E7EB
  - Text: #9CA3AF
  - Cursor: not-allowed

- **Helper Text:**
  - Position: Below input, 4px spacing
  - Font: 12px, Regular, #6B7280
  - Max width: Container width

**Textarea:**
- **Container:**
  - Min height: 120px
  - Max height: 300px (scrollable after)
  - Same styling as Text Input
  - Padding: 12px 16px

- **Character Counter:**
  - Position: Bottom-right, 8px from edges
  - Font: 12px, Regular, #9CA3AF
  - Format: "245/500"
  - Warning: Red (#EF4444) if > 90% of max

**Numeric Input:**
- Same as Text Input
- Keyboard: Numeric (type="numeric" or keyboardType="numeric")
- Prefix/Suffix:
  - Prefix: Left side, 12px from left edge, 14px font, #6B7280
  - Suffix: Right side, 12px from right edge
  - Input padding adjusted accordingly

**Dropdown/Select:**
- Same container as Text Input
- Right side: Chevron down icon (20px, #6B7280)
- Selected value: 14px, Regular, #111827
- Placeholder: 14px, Regular, #9CA3AF
- Options modal:
  - Background: White
  - Max height: 300px
  - Scrollable
  - Each option: 48px height
  - Selected: #EEF2FF background, #4F46E5 text
  - Hover: #F3F4F6 background

**Search Input:**
- Same as Text Input
- Left icon: Search (20px, #6B7280), 12px from left
- Right: Clear button (X icon, 20px, #6B7280)
  - Show only when text entered
  - Touch target: 44px × 44px
- Padding: 12px 40px (left), 12px 40px (right)

---

#### Cards

**Basic Card:**
- **Container:**
  - Background: White (#FFFFFF)
  - Border Radius: 12px
  - Shadow: md (0 4px 6px -1px rgba(0,0,0,0.1))
  - Padding: 16px
  - Border: None (use shadow for elevation)

- **Pressable Card:**
  - Pressed: Scale 0.98, Shadow: sm
  - Duration: 100ms
  - Ripple effect (Android) or highlight (iOS)

- **Card with Image:**
  - Image: Top, full width, 16px radius (top only)
  - Content: Below image, 16px padding

**Stats Card:**
- Background: White
- Border Radius: 12px
- Shadow: md
- Padding: 16px
- Layout: Vertical
- Icon: Top-left, 24px, colored
- Value: Center, large (20-28px), Bold
- Label: Bottom, 12px, Regular, #6B7280
- Accent color: Left border (4px wide) or icon color

**List Card:**
- Background: White
- Border Radius: 12px
- Shadow: sm
- Padding: 16px
- Height: Variable (min 72px)
- Layout: Horizontal (icon left, content center, action right)

---

#### Bottom Navigation

**Container:**
- Height: 64px + safe area bottom
- Background: White (#FFFFFF)
- Border top: 1px solid #F3F4F6
- Position: Fixed, bottom
- Z-index: 100

**Items:**
- Max: 5 items
- Layout: Equal distribution
- Spacing: Auto (flex: 1 each)

**Item:**
- Height: 64px
- Padding: 4px vertical
- Icon: 24px × 24px
  - Active: #4F46E5
  - Inactive: #6B7280
- Label: 11px, Regular
  - Active: #4F46E5, SemiBold
  - Inactive: #6B7280
- Touch target: Full item area

**Active Indicator:**
- Option 1: Colored icon + label
- Option 2: Top border (2px, #4F46E5) + colored icon
- Animation: Smooth color transition (200ms)

**Badge (optional):**
- Position: Top-right of icon
- Size: 16px × 16px (min)
- Background: #EF4444 (red)
- Text: White, 10px, Bold
- Border: 2px White (if on icon)
- Show: If count > 0

---

#### Modals & Dialogs

**Modal Container:**
- Background: rgba(0,0,0,0.5) - backdrop
- Position: Fixed, full screen
- Z-index: 1000
- Animation: Fade in (200ms)

**Modal Content:**
- Background: White
- Border Radius: 16px (top corners)
- Position: Bottom (slide up) or Center
- Max height: 90% of screen
- Padding: 24px
- Animation:
  - Slide up: translateY(100%) → translateY(0)
  - Duration: 300ms, ease-out

**Modal Header:**
- Title: 20px, SemiBold, #111827
- Close button: Right, 24px × 24px, X icon
- Border bottom: 1px #F3F4F6 (optional)
- Padding: 16px vertical

**Modal Body:**
- Scrollable if content exceeds height
- Padding: 16px vertical

**Modal Footer:**
- Border top: 1px #F3F4F6
- Padding: 16px
- Buttons: Right-aligned, 8px spacing
- Primary button: Rightmost

**Confirmation Dialog:**
- Size: 320px width (max)
- Centered on screen
- Icon: Top, 48px, colored (warning/error/info)
- Title: 18px, SemiBold
- Message: 14px, Regular, #6B7280
- Buttons: 2 (Cancel, Confirm)
  - Cancel: Left, Secondary
  - Confirm: Right, Primary (or Destructive if delete)

---

#### Loading States

**Spinner:**
- Type: Circular (iOS) or Material (Android)
- Size: 40px × 40px (default)
- Color: #4F46E5
- Animation: 1s linear infinite rotation

**Skeleton Loader:**
- Background: #F3F4F6
- Shimmer: Linear gradient animation
  - Colors: #F3F4F6 → #E5E7EB → #F3F4F6
  - Duration: 1.5s
  - Direction: Left to right
  - Repeat: Infinite

**Skeleton Card:**
- Height: Match actual card
- Border Radius: 12px
- Shimmer effect applied

**Progress Bar:**
- Height: 4px
- Background: #F3F4F6
- Fill: #4F46E5
- Animation: Smooth width transition
- Indeterminate: Animated gradient

**Pull-to-Refresh:**
- Native component (RefreshControl)
- Color: #4F46E5
- Trigger: 80px pull distance

---

#### Empty States

**Container:**
- Centered vertically and horizontally
- Padding: 48px horizontal

**Icon:**
- Size: 80px × 80px
- Color: #D1D5DB
- Opacity: 0.6

**Title:**
- Text: Contextual (e.g., "No invoices")
- Font: 16px, Medium, #6B7280
- Position: 24px below icon

**Description (optional):**
- Text: Helpful message
- Font: 14px, Regular, #9CA3AF
- Position: 8px below title
- Max width: 280px, centered

**CTA Button:**
- Type: Primary
- Text: Action (e.g., "Create Invoice")
- Position: 24px below description
- Width: Auto (min 200px)

---

#### Error States

**Inline Error:**
- Position: Below input/field, 8px spacing
- Icon: Alert circle (16px, #EF4444), left
- Text: 12px, Regular, #EF4444
- Background: #FEF2F2 (very light red, optional)
- Padding: 8px
- Border Radius: 4px

**Toast/Alert:**
- Position: Top of screen (below status bar)
- Background: #EF4444 (error) or #F59E0B (warning)
- Text: White, 14px, Medium
- Padding: 16px horizontal, 12px vertical
- Border Radius: 8px (top corners)
- Shadow: md
- Animation: Slide down + fade in (300ms)
- Auto-dismiss: 3-5 seconds
- Manual dismiss: Swipe up or tap

**Error Screen:**
- Full screen, centered
- Icon: 80px, #EF4444
- Title: "Something went wrong"
- Message: Error description
- Retry button: Primary
- Support link: Text button

---

#### Badges & Tags

**Status Badge:**
- Height: 20px (min)
- Padding: 4px 8px (horizontal)
- Border Radius: 10px (pill shape)
- Font: 11px, Medium
- Colors:
  - Success: Background #D1FAE5, Text #065F46
  - Warning: Background #FEF3C7, Text #92400E
  - Error: Background #FEE2E2, Text #991B1B
  - Info: Background #DBEAFE, Text #1E40AF

**Count Badge:**
- Size: 16px × 16px (min, circular)
- Background: #EF4444 (red)
- Text: White, 10px, Bold
- Position: Top-right of parent
- Border: 2px White (if on colored background)
- Show: Only if count > 0
- Max: "99+" if count > 99

---

#### Lists

**List Container:**
- Background: Transparent or White
- Padding: 16px horizontal (or 0 if full-width items)

**List Item:**
- Height: 56px (default) or 72px (with subtitle)
- Background: White
- Padding: 16px horizontal
- Border bottom: 1px #F3F4F6 (last item: none)
- Touch target: Full height

**List Item with Icon:**
- Left: Icon (24px, #6B7280), 40px width
- Center: Content (flex: 1)
  - Title: 16px, Regular, #111827
  - Subtitle: 14px, Regular, #6B7280 (optional)
- Right: Chevron or value (20px, #9CA3AF)

**Swipeable Item:**
- Swipe left: Reveal actions (Delete, Edit)
- Action buttons: 80px width each
- Delete: Red background (#EF4444)
- Edit: Blue background (#4F46E5)
- Animation: Smooth slide (300ms)

---

#### Forms

**Form Container:**
- Scrollable
- Padding: 24px horizontal
- Keyboard-aware (adjusts when keyboard appears)

**Form Section:**
- Header: 16px, SemiBold, #111827
- Padding: 16px vertical between sections
- Border bottom: 1px #F3F4F6 (optional)

**Form Field:**
- Margin: 16px vertical between fields
- Label: Above input, 8px spacing
- Input: Full width
- Error: Below input, 8px spacing
- Helper: Below error (if no error) or below input, 4px spacing

**Form Actions:**
- Sticky bottom (if needed)
- Background: White
- Border top: 1px #F3F4F6
- Padding: 16px, safe area bottom
- Buttons: Full width or side-by-side (8px spacing)

---

#### Tabs

**Tab Container:**
- Height: 48px
- Background: White
- Border bottom: 1px #F3F4F6

**Tab Options:**
- Layout: Equal width or auto (scrollable if many)
- Active: Underline (2px, #4F46E5) + SemiBold text (#4F46E5)
- Inactive: Regular text (#6B7280)
- Font: 14px
- Padding: 12px horizontal
- Touch target: Full height

**Tab Content:**
- Scrollable (if needed)
- Padding: 16px
- Animation: Smooth transition (200ms) when switching

---

#### Date Pickers

**Date Input:**
- Same as Text Input
- Right icon: Calendar (20px, #6B7280)
- Format: "DD MMM YYYY" (e.g., "21 Dec 2024")
- Placeholder: "Select date"

**Date Picker Modal:**
- Native date picker (iOS/Android)
- Or custom calendar component
- Header: Month/Year selector
- Grid: 7 columns (days), multiple rows (dates)
- Selected: #4F46E5 background, White text
- Today: Border (2px, #4F46E5)
- Disabled: #E5E7EB background, #9CA3AF text

**Date Range Picker:**
- Two date inputs
- "From" and "To" labels
- Calendar shows range selection
- Selected range: Highlighted (#EEF2FF)

---

#### Search & Filters

**Search Bar:**
- Height: 48px
- Background: #F3F4F6
- Border Radius: 8px
- Padding: 12px 40px (left icon), 12px 40px (right clear)
- Placeholder: "Search..."
- Real-time: Debounce 300ms

**Filter Chips:**
- Height: 32px
- Padding: 8px 12px
- Border Radius: 16px (pill)
- Background: #F3F4F6 (inactive), #4F46E5 (active)
- Text: 12px, Medium
- Active text: White
- Inactive text: #6B7280
- Spacing: 8px between chips
- Scrollable: Horizontal if many

**Filter Modal:**
- Full screen or bottom sheet
- Header: "Filters" + "Reset" + "Apply"
- Sections: Each filter type
- Apply button: Primary, sticky bottom

---

#### Animations & Transitions

**Page Transitions:**
- Push: Slide left (new) / Slide right (back)
- Duration: 300ms
- Easing: ease-in-out

**Modal Animations:**
- Open: Fade in (backdrop) + Slide up (content)
- Close: Fade out + Slide down
- Duration: 300ms
- Easing: ease-out

**Button Press:**
- Scale: 0.98
- Duration: 100ms
- Easing: ease-in

**List Item Press:**
- Background: #F3F4F6
- Duration: 150ms
- Ripple effect (Android)

**Loading Spinner:**
- Rotation: 360deg
- Duration: 1s
- Easing: linear
- Repeat: infinite

**Fade In:**
- Opacity: 0 → 1
- Duration: 200ms
- Easing: ease-out

**Slide In:**
- Transform: translateX(-20px) → translateX(0)
- Opacity: 0 → 1
- Duration: 300ms
- Easing: ease-out

**Shake (Error):**
- Transform: translateX(-10px) → translateX(10px) → translateX(-10px) → translateX(0)
- Duration: 400ms
- Easing: ease-in-out

---

#### Offline Indicators

**Status Bar:**
- Position: Top, below header
- Height: 40px
- Background: #F59E0B (amber)
- Text: White, 14px, Medium
- Message: "You're offline. Changes will sync when online."
- Icon: Wifi off (16px, left)
- Dismiss: X button (right) or auto-dismiss after 5s
- Animation: Slide down (200ms)

**Sync Status Icon:**
- Size: 16px × 16px
- Online: Green dot (#10B981)
- Offline: Gray dot (#6B7280)
- Syncing: Spinner (#4F46E5)
- Pending: Orange badge with count

**Pending Changes Badge:**
- Position: Top-right of sync icon
- Size: 20px × 20px (min)
- Background: #F59E0B
- Text: White, 12px, Bold
- Show: Count of pending items
- Animation: Pulse when new items added

---

#### Accessibility Specifications

**Color Contrast:**
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- Interactive elements: 3:1 minimum
- All colors tested against WCAG AA

**Touch Targets:**
- Minimum: 44px × 44px
- Recommended: 48px × 48px
- Spacing: 8px minimum between targets

**Screen Reader:**
- All images: alt text
- Buttons: aria-label
- Form fields: Label association
- Status messages: aria-live
- Headings: Proper hierarchy (h1 → h2 → h3)

**Focus Indicators:**
- Visible: 2px outline, #4F46E5
- Offset: 2px from element
- Keyboard navigation: Tab order logical

**Dynamic Type:**
- Support system font scaling
- Minimum: 14px body text
- Maximum: No upper limit (respect user preference)

**Motion:**
- Respect prefers-reduced-motion
- Disable animations if user preference set
- Essential animations only (loading, transitions)

---

#### Technical Implementation Notes

**React Native Components:**
- Use React Native core components
- StyleSheet for styles (not inline)
- Platform-specific code: Platform.OS checks
- Safe area: react-native-safe-area-context

**State Management:**
- Loading: Boolean state per screen/component
- Error: Error object or string
- Form data: Controlled components
- Validation: Real-time + on submit

**API Integration:**
- Loading states during API calls
- Error handling with user-friendly messages
- Optimistic updates where appropriate
- Retry mechanism for failed requests

**Performance:**
- Lazy load images
- Virtual lists for long lists (FlashList)
- Memoization for expensive computations
- Debounce search inputs (300ms)

**Offline Support:**
- Store data locally (WatermelonDB)
- Queue actions when offline
- Show sync status
- Auto-sync when online

**Form Validation:**
- Client-side: Real-time + on submit
- Server-side: Display errors from API
- Field-level errors: Show below field
- Form-level errors: Show at top

**Keyboard Handling:**
- KeyboardAvoidingView for forms
- Dismiss on outside tap
- Next button moves to next field
- Done button submits

**Navigation:**
- React Navigation (Stack, Tab, Drawer)
- Deep linking support
- Back button handling (Android)
- Gesture navigation (iOS)

**Testing:**
- Visual regression testing
- Accessibility testing
- Device testing (various sizes)
- Performance testing

---

## Design Tokens (JSON Format)

> **For Developers:** Use these design tokens in your code. They should be exported as constants or from a theme file.

```json
{
  "colors": {
    "primary": {
      "50": "#EEF2FF",
      "100": "#E0E7FF",
      "400": "#818CF8",
      "500": "#6366F1",
      "600": "#4F46E5",
      "700": "#4338CA",
      "800": "#3730A3",
      "900": "#312E81"
    },
    "success": {
      "500": "#10B981",
      "50": "#ECFDF5",
      "700": "#047857"
    },
    "error": {
      "500": "#EF4444",
      "50": "#FEF2F2",
      "700": "#B91C1C"
    },
    "warning": {
      "500": "#F59E0B",
      "50": "#FFFBEB",
      "700": "#B45309"
    },
    "gray": {
      "50": "#F9FAFB",
      "100": "#F3F4F6",
      "300": "#D1D5DB",
      "500": "#6B7280",
      "700": "#374151",
      "900": "#111827"
    },
    "white": "#FFFFFF",
    "black": "#000000"
  },
  "typography": {
    "fontFamily": {
      "primary": "Inter",
      "hindi": "Noto Sans Devanagari",
      "fallback": "-apple-system, BlinkMacSystemFont, sans-serif"
    },
    "fontSize": {
      "xs": "11px",
      "sm": "12px",
      "base": "14px",
      "lg": "16px",
      "xl": "18px",
      "2xl": "20px",
      "3xl": "24px",
      "4xl": "28px"
    },
    "fontWeight": {
      "regular": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    },
    "lineHeight": {
      "tight": "1.25",
      "normal": "1.5",
      "relaxed": "1.75"
    }
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "12px",
    "lg": "16px",
    "xl": "24px",
    "2xl": "32px",
    "3xl": "48px"
  },
  "borderRadius": {
    "sm": "4px",
    "md": "8px",
    "lg": "12px",
    "xl": "16px",
    "full": "9999px"
  },
  "shadows": {
    "sm": "0 1px 2px rgba(0,0,0,0.05)",
    "md": "0 4px 6px -1px rgba(0,0,0,0.1)",
    "lg": "0 10px 15px -3px rgba(0,0,0,0.1)",
    "xl": "0 20px 25px -5px rgba(0,0,0,0.1)"
  },
  "breakpoints": {
    "sm": "320px",
    "md": "375px",
    "lg": "414px",
    "xl": "768px"
  },
  "zIndex": {
    "base": 0,
    "dropdown": 100,
    "sticky": 200,
    "fixed": 300,
    "modalBackdrop": 400,
    "modal": 500,
    "popover": 600,
    "tooltip": 700
  },
  "animation": {
    "duration": {
      "fast": "100ms",
      "normal": "200ms",
      "slow": "300ms"
    },
    "easing": {
      "easeIn": "cubic-bezier(0.4, 0, 1, 1)",
      "easeOut": "cubic-bezier(0, 0, 0.2, 1)",
      "easeInOut": "cubic-bezier(0.4, 0, 0.2, 1)"
    }
  }
}
```

**Usage Example (React Native):**
```typescript
// theme.ts
export const theme = {
  colors: {
    primary: '#4F46E5',
    success: '#10B981',
    error: '#EF4444',
    // ... etc
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    // ... etc
  },
  // ... etc
};

// Usage
<View style={{ padding: theme.spacing.lg, backgroundColor: theme.colors.primary }}>
  <Text style={{ color: theme.colors.white, fontSize: theme.typography.fontSize.base }}>
    Hello
  </Text>
</View>
```

---

## Data Formats & Display Rules

### Currency Formatting
- **Symbol:** ₹ (Indian Rupee)
- **Format:** ₹12,34,567.89
- **Grouping:** Indian numbering (lakhs, crores)
- **Decimal:** 2 places (always show .00 for whole numbers)
- **Negative:** (₹12,345) or -₹12,345
- **Zero:** ₹0.00

**Examples:**
- 1234 → ₹1,234.00
- 123456 → ₹1,23,456.00
- 12345678 → ₹1,23,45,678.00

### Date Formatting
- **Format:** DD MMM YYYY (e.g., "21 Dec 2024")
- **Short:** DD/MM/YYYY (e.g., "21/12/2024")
- **Time:** HH:MM (24-hour) or HH:MM AM/PM (12-hour)
- **Relative:** "2 hours ago", "Yesterday", "3 days ago"
- **Locale:** en-IN (Indian English)

### Phone Number Formatting
- **Display:** +91 98765 43210 (with spaces)
- **Input:** 9876543210 (10 digits, no spaces)
- **Validation:** 10 digits, starts with 6-9

### GSTIN Formatting
- **Format:** 15 characters, alphanumeric
- **Display:** 15AAACB1234A1Z5 (with spaces: 15 AAA CB 1234 A 1 Z 5)
- **Validation:** 
  - Length: 15
  - Pattern: 2 digits (state) + 10 alphanumeric (PAN) + 1 digit (entity) + 1 alphanumeric (check) + 1 letter (Z)

### Invoice Number Formatting
- **Format:** INV-YYYY-XXXXX
- **Example:** INV-2024-00001
- **Display:** Full format
- **Search:** Allow partial match

### Percentage Formatting
- **Display:** 18% (no decimal for tax rates)
- **Calculation:** Show 2 decimals in breakdowns (18.00%)

### Quantity Formatting
- **Display:** Number + Unit (e.g., "50 Pcs", "12.5 Kg")
- **Decimal:** Show decimals only if needed
- **Large numbers:** Use abbreviations (1K, 1L, 1Cr)

---

## Edge Cases & Error Handling

### Network Errors
- **No Internet:**
  - Show offline banner
  - Disable online-only features
  - Queue actions for sync
  - Message: "No internet connection. Working offline."

- **Slow Connection:**
  - Show loading indicator
  - Timeout: 30 seconds
  - Retry button after timeout
  - Message: "Taking longer than usual. Check your connection."

- **API Error:**
  - Show error toast
  - Log error for debugging
  - User-friendly message
  - Retry option if applicable

### Data Validation Errors
- **Invalid Input:**
  - Show inline error immediately
  - Highlight field with red border
  - Prevent submission
  - Clear error on correction

- **Server Validation:**
  - Display server errors below fields
  - Map server field names to UI labels
  - Show general error at top if field-specific not available

### Empty States
- **No Data:**
  - Show empty state component
  - Provide helpful message
  - Include CTA to create first item
  - Don't show error styling

- **Search No Results:**
  - Show "No results found"
  - Suggest: "Try different keywords"
  - Show "Clear filters" option

### Permission Errors
- **Camera:**
  - Request permission
  - Show explanation if denied
  - Link to settings if permanently denied

- **Storage:**
  - Request permission
  - Show error if denied
  - Provide alternative (manual entry)

### Payment Errors
- **Payment Failed:**
  - Show error message
  - Retry option
  - Contact support link
  - Don't lose form data

### Sync Conflicts
- **Data Conflict:**
  - Show conflict resolution UI
  - Display both versions
  - Let user choose
  - Option to merge if possible

### Large Data Sets
- **Many Items:**
  - Pagination or infinite scroll
  - Virtual list for performance
  - Loading indicator
  - "Showing 20 of 1,234 items"

### Long Text
- **Truncation:**
  - Max 2 lines with ellipsis
  - Show "Read more" if needed
  - Expand on tap

### Image Loading
- **Loading:**
  - Show placeholder/skeleton
  - Progressive loading
  - Error: Show placeholder icon

---

## Platform-Specific Guidelines

### iOS Specific
- **Navigation:**
  - Use native iOS navigation patterns
  - Back button: Left side, "< Back" text
  - Large titles in navigation bar
  - Swipe back gesture

- **Design:**
  - SF Pro font (system default)
  - iOS-style modals (slide up from bottom)
  - Native iOS pickers
  - Haptic feedback on interactions

- **Safe Areas:**
  - Respect notch and home indicator
  - Use safe area insets
  - Bottom navigation: Above home indicator

### Android Specific
- **Navigation:**
  - Use Material Design patterns
  - Back button: System back button
  - Material Design components

- **Design:**
  - Roboto font (system default)
  - Material Design modals
  - Material Design pickers
  - Ripple effects on press

- **Safe Areas:**
  - Respect status bar
  - Navigation bar handling
  - Edge-to-edge support

### Common (Both Platforms)
- **Consistent:**
  - Same functionality
  - Same data structure
  - Same API calls
  - Platform-specific UI where needed

---

## Performance Requirements

### Load Times
- **Initial Load:** < 2 seconds
- **Screen Transition:** < 300ms
- **API Response:** Show loading after 500ms
- **Image Load:** Progressive, placeholder first

### Animations
- **Frame Rate:** 60fps
- **Duration:** 200-300ms for transitions
- **Easing:** Smooth, natural feel
- **Reduce Motion:** Respect user preference

### Memory
- **Image Optimization:**
  - Compress images
  - Lazy load
  - Cache appropriately
  - Clear cache when needed

### Battery
- **Efficient:**
  - Minimize background tasks
  - Optimize animations
  - Reduce network calls
  - Cache data locally

---

## Testing Checklist

### Visual Testing
- [ ] All screens match designs (pixel-perfect)
- [ ] Colors match design tokens
- [ ] Typography matches specifications
- [ ] Spacing matches design system
- [ ] Icons are correct size and color
- [ ] Shadows and borders match

### Functional Testing
- [ ] All buttons work
- [ ] Forms validate correctly
- [ ] Navigation works
- [ ] Loading states show
- [ ] Error states display
- [ ] Empty states show
- [ ] Offline mode works

### Device Testing
- [ ] iPhone SE (small screen)
- [ ] iPhone 14 Pro (standard)
- [ ] iPhone 14 Pro Max (large)
- [ ] Android small (320px)
- [ ] Android standard (375px)
- [ ] Android large (414px)

### Accessibility Testing
- [ ] Screen reader works
- [ ] Color contrast passes
- [ ] Touch targets adequate
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Dynamic type supported

### Performance Testing
- [ ] Smooth scrolling (60fps)
- [ ] Fast screen transitions
- [ ] Quick API responses
- [ ] Efficient memory usage
- [ ] No memory leaks

---

## Developer Handoff Checklist

### Design Files
- [ ] Figma file shared with dev team
- [ ] All screens designed
- [ ] All states designed (empty, loading, error)
- [ ] Component library complete
- [ ] Design system documented

### Assets
- [ ] Icons exported (SVG + PNG @2x, @3x)
- [ ] Images exported (optimized)
- [ ] Logo exported (all sizes)
- [ ] Illustrations exported

### Specifications
- [ ] Measurements documented
- [ ] Spacing documented
- [ ] Colors documented (hex codes)
- [ ] Typography documented
- [ ] Animations specified

### Code
- [ ] Design tokens exported (JSON)
- [ ] Component specs clear
- [ ] Interaction details documented
- [ ] Edge cases documented

### Communication
- [ ] Designer available for questions
- [ ] Review meetings scheduled
- [ ] Feedback process defined
- [ ] Updates communicated

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

## Implementation Examples

> **For Developers:** Code examples showing how to implement common patterns.

### Primary Button Example

```typescript
// Button.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from './theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'text';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        isDisabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#4F46E5'} />
      ) : (
        <Text
          style={[
            styles.text,
            variant === 'primary' && styles.primaryText,
            variant === 'secondary' && styles.secondaryText,
            isDisabled && styles.disabledText,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 120,
  },
  primary: {
    backgroundColor: theme.colors.primary[600],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  secondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
  },
  disabled: {
    backgroundColor: theme.colors.gray[100],
    opacity: 0.6,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: theme.colors.gray[700],
  },
  disabledText: {
    color: theme.colors.gray[500],
  },
});
```

### Input Field Example

```typescript
// Input.tsx
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { theme } from './theme';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email' | 'phone-pad';
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helperText,
  required = false,
  keyboardType = 'default',
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.gray[500]}
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      {!error && helperText && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.gray[700],
    marginBottom: 8,
  },
  required: {
    color: theme.colors.error[500],
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    color: theme.colors.gray[900],
    backgroundColor: '#FFFFFF',
  },
  inputFocused: {
    borderWidth: 2,
    borderColor: theme.colors.primary[600],
  },
  inputError: {
    borderWidth: 2,
    borderColor: theme.colors.error[500],
    backgroundColor: theme.colors.error[50],
  },
  errorContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error[500],
    marginLeft: 4,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.gray[500],
    marginTop: 4,
  },
});
```

### Card Example

```typescript
// Card.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from './theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: object;
}

export const Card: React.FC<CardProps> = ({ children, onPress, style }) => {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {children}
    </Component>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
});
```

### OTP Input Example

```typescript
// OTPInput.tsx
import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { theme } from './theme';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  error?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onComplete,
  error = false,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<TextInput[]>([]);

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) {
      // Handle paste
      const pastedOtp = text.slice(0, length).split('');
      const newOtp = [...otp];
      pastedOtp.forEach((char, i) => {
        if (index + i < length) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      
      // Focus last filled input
      const lastIndex = Math.min(index + pastedOtp.length - 1, length - 1);
      inputRefs.current[lastIndex]?.focus();
      
      // Auto-submit if all filled
      if (newOtp.every(char => char !== '')) {
        onComplete(newOtp.join(''));
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-advance
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit
    if (newOtp.every(char => char !== '')) {
      setTimeout(() => onComplete(newOtp.join('')), 300);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            if (ref) inputRefs.current[index] = ref;
          }}
          style={[
            styles.input,
            error && styles.inputError,
            otp[index] && styles.inputFilled,
          ]}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
          keyboardType="numeric"
          maxLength={1}
          selectTextOnFocus
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 24,
  },
  input: {
    width: 45,
    height: 56,
    borderWidth: 2,
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: theme.colors.gray[900],
    backgroundColor: '#FFFFFF',
  },
  inputFocused: {
    borderColor: theme.colors.primary[600],
  },
  inputFilled: {
    borderColor: theme.colors.success[500],
  },
  inputError: {
    borderColor: theme.colors.error[500],
  },
});
```

### Currency Formatter Example

```typescript
// formatters.ts
export const formatCurrency = (amount: number): string => {
  // Indian numbering system (lakhs, crores)
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
};

// Usage
formatCurrency(1234567.89); // "₹12,34,567.89"
formatCurrency(1234); // "₹1,234.00"
```

### Date Formatter Example

```typescript
// formatters.ts
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
};

export const formatRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(d);
};

// Usage
formatDate(new Date()); // "21 Dec 2024"
formatRelativeTime(new Date(Date.now() - 3600000)); // "1 hour ago"
```

---

## Quick Reference for Developers

### Color Usage
- **Primary Actions:** `#4F46E5` (Primary Blue)
- **Success/Positive:** `#10B981` (Green)
- **Error/Negative:** `#EF4444` (Red)
- **Warning:** `#F59E0B` (Amber)
- **Text Primary:** `#111827` (Gray 900)
- **Text Secondary:** `#6B7280` (Gray 500)
- **Borders:** `#D1D5DB` (Gray 300)
- **Backgrounds:** `#F3F4F6` (Gray 100)

### Spacing Scale
- **Tight:** 4px (xs)
- **Compact:** 8px (sm)
- **Default:** 12px (md)
- **Section:** 16px (lg)
- **Large:** 24px (xl)
- **Major:** 32px (2xl)
- **Screen:** 48px (3xl)

### Typography Scale
- **H1:** 28px, Bold
- **H2:** 24px, SemiBold
- **H3:** 20px, SemiBold
- **Body:** 14px, Regular
- **Small:** 12px, Regular
- **Caption:** 11px, Regular

### Common Measurements
- **Button Height:** 48px
- **Input Height:** 48px
- **Card Padding:** 16px
- **Card Radius:** 12px
- **Button Radius:** 8px
- **Input Radius:** 8px
- **Touch Target:** 44px minimum
- **Icon Size:** 24px (default), 20px (small), 28px (large)

### Animation Durations
- **Fast:** 100ms (button press)
- **Normal:** 200ms (fade, slide)
- **Slow:** 300ms (page transition, modal)

### Z-Index Layers
- **Base:** 0
- **Dropdown:** 100
- **Sticky:** 200
- **Fixed:** 300
- **Modal Backdrop:** 400
- **Modal:** 500

---

## Common Patterns

### Form Pattern
1. Label above input
2. Input with border
3. Helper text below (if provided)
4. Error message below (if error)
5. Validation on blur + submit

### List Pattern
1. Search bar (if searchable)
2. Filters (if filterable)
3. List items (cards or rows)
4. Empty state (if no data)
5. Load more / Infinite scroll

### Detail Pattern
1. Header with title and actions
2. Main content (scrollable)
3. Action buttons (sticky bottom if needed)
4. Related items (tabs or sections)

### Modal Pattern
1. Backdrop (semi-transparent)
2. Content (slide up from bottom)
3. Header with title and close
4. Body (scrollable if needed)
5. Footer with actions

---

## File Naming Conventions

### Components
- PascalCase: `Button.tsx`, `Input.tsx`, `Card.tsx`
- One component per file
- Export default component

### Screens
- PascalCase: `LoginScreen.tsx`, `DashboardScreen.tsx`
- Suffix: `Screen` or `Page`

### Styles
- Same name as component: `Button.tsx` → `Button.styles.ts`
- Or inline with StyleSheet.create

### Assets
- kebab-case: `app-logo.png`, `icon-search.svg`
- Include size: `logo@2x.png`, `logo@3x.png`

---

## Questions & Support

**If you're unsure about anything:**
1. Check this document first
2. Check Figma designs
3. Ask in #design Slack channel
4. Schedule a design review meeting

**Common Questions:**
- **"What color should I use?"** → Check Design Tokens section
- **"What spacing?"** → Check Spacing Scale
- **"How to handle this state?"** → Check Component Specifications
- **"What about this edge case?"** → Check Edge Cases section

---

## Quick Developer Checklist - Before You Ship

### For Every Screen:

**Functionality:**
- [ ] All features work as expected
- [ ] All states handled (loading, error, empty, success)
- [ ] All edge cases covered
- [ ] Offline mode works (if applicable)
- [ ] Data persists correctly

**Performance:**
- [ ] Screen loads in < 2 seconds
- [ ] Animations are smooth (60fps)
- [ ] No unnecessary re-renders
- [ ] Images are optimized
- [ ] Lists are virtualized (if many items)

**User Experience:**
- [ ] Flow is intuitive
- [ ] Error messages are helpful
- [ ] Loading states show progress
- [ ] Empty states guide users
- [ ] Success feedback is clear

**Accessibility:**
- [ ] Screen reader works
- [ ] Color contrast passes
- [ ] Touch targets are adequate (44px min)
- [ ] Keyboard navigation works
- [ ] Focus indicators visible

**Polish:**
- [ ] Matches design (pixel-perfect)
- [ ] Animations feel natural
- [ ] Transitions are smooth
- [ ] No visual glitches
- [ ] Works on all device sizes

### For Every Component:

**Code Quality:**
- [ ] Code is readable and maintainable
- [ ] Component is reusable
- [ ] Props are well-typed
- [ ] Error handling is comprehensive
- [ ] Performance is optimized

**User Experience:**
- [ ] Component is intuitive
- [ ] States are clear (default, hover, active, disabled)
- [ ] Feedback is immediate
- [ ] Accessibility is considered
- [ ] Works on all platforms

### Before Every Commit:

**Ask Yourself:**
1. Does this work?
2. Is this fast?
3. Is this clear?
4. Is this accessible?
5. Is this tested?

**If all yes → Commit!**
**If any no → Fix it first!**

---

## Developer Workflow - Step by Step

### When Starting a New Screen:

1. **Understand the Goal**
   - What is the user trying to accomplish?
   - What's the fastest way to help them?
   - What could go wrong?

2. **Review the Design**
   - Check Figma for exact specifications
   - Note all states (empty, loading, error)
   - Note all interactions
   - Note edge cases

3. **Plan the Implementation**
   - What components do I need?
   - What data do I need?
   - What API calls are required?
   - What state management?
   - What offline support?

4. **Build the Structure**
   - Create screen component
   - Add layout structure
   - Add basic components
   - Wire up navigation

5. **Add Functionality**
   - Implement core features
   - Add API integration
   - Add state management
   - Add error handling

6. **Add States**
   - Loading state
   - Error state
   - Empty state
   - Success state

7. **Optimize Performance**
   - Check re-renders
   - Optimize images
   - Virtualize lists
   - Cache data

8. **Test Thoroughly**
   - Test happy path
   - Test error cases
   - Test edge cases
   - Test offline
   - Test on devices

9. **Polish**
   - Match design exactly
   - Smooth animations
   - Perfect transitions
   - Fix any glitches

10. **Review**
    - Self-review code
    - Check accessibility
    - Check performance
    - Get peer review

---

## Key Reminders While Coding

### 🎯 Always Remember:

1. **User First**
   - Every decision should benefit the user
   - If it's confusing, simplify it
   - If it's slow, optimize it

2. **Offline Works**
   - Save locally first
   - Queue for sync
   - Show sync status

3. **Errors are Opportunities**
   - Show helpful messages
   - Provide solutions
   - Allow recovery

4. **Performance is UX**
   - Fast feels good
   - Slow feels broken
   - Optimize everything

5. **Consistency Builds Trust**
   - Same patterns
   - Same colors
   - Same interactions

6. **Accessibility is Required**
   - Not optional
   - Test with tools
   - Test with users

7. **Test Before Shipping**
   - Happy path
   - Error cases
   - Edge cases
   - Real devices

### 🚫 Common Mistakes to Avoid:

1. **Don't block the UI**
   - Use loading states
   - Use async/await properly
   - Don't freeze on API calls

2. **Don't lose user data**
   - Auto-save drafts
   - Queue offline actions
   - Handle errors gracefully

3. **Don't ignore errors**
   - Handle all error cases
   - Show helpful messages
   - Allow retry

4. **Don't skip empty states**
   - Guide first-time users
   - Provide CTAs
   - Make it easy to start

5. **Don't forget offline**
   - Test offline mode
   - Show sync status
   - Queue actions

6. **Don't ignore performance**
   - Optimize images
   - Virtualize lists
   - Cache data

7. **Don't skip accessibility**
   - Test with screen reader
   - Check contrast
   - Support keyboard

---

## Success Metrics - How to Know You Did Well

### User Experience Metrics:
- ✅ User can complete task in < 60 seconds
- ✅ User doesn't need help/instructions
- ✅ User doesn't encounter errors
- ✅ User feels confident using the app

### Technical Metrics:
- ✅ Screen loads in < 2 seconds
- ✅ Animations run at 60fps
- ✅ No crashes or freezes
- ✅ Works offline
- ✅ Accessible (WCAG AA)

### Code Quality Metrics:
- ✅ Code is readable
- ✅ Component is reusable
- ✅ Error handling is comprehensive
- ✅ Performance is optimized
- ✅ Tests are written

**If all metrics pass → You've built a great screen! 🎉**

---

## Version History

- **v2.1** (2025-12-21): Added Developer Thinking & Best Practices section
- **v2.0** (2025-12-21): Complete developer specification added
- **v1.0** (2025-12-21): Initial design brief

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
