# Future Enhancements Plan

**Last Updated:** December 24, 2025  
**Status:** Planning & Implementation Phase

## Overview

This document outlines planned enhancements that are currently using placeholder/static data and need to be implemented with real functionality.

---

## 🚨 Priority 1: Real-Time Notifications Integration

### Current State
- **Location:** `components/layout/header.tsx` (lines 78-114)
- **Status:** ⚠️ Static demo data
- **Issue:** Shows hardcoded notifications (3 static items)

### Enhancement Requirements

#### 1.1 Notification Types to Implement
1. **Invoice Overdue Alerts**
   - Trigger: Invoice due date passed, payment status = unpaid
   - Data Source: Invoice Service API
   - Query: `GET /api/v1/invoices?paymentStatus=unpaid&status=draft&dueDate<today`

2. **Low Stock Alerts**
   - Trigger: Item stock below `low_stock_threshold`
   - Data Source: Inventory Service API
   - Query: `GET /api/v1/items/low-stock`

3. **Payment Received Notifications**
   - Trigger: New payment recorded
   - Data Source: Payment Service API
   - Query: `GET /api/v1/payments?limit=5&sortBy=created_at&order=desc`

4. **Invoice Created Notifications** (Optional)
   - Trigger: New invoice created
   - Data Source: Invoice Service API

#### 1.2 Implementation Plan

**Phase 1: Data Fetching (Current)**
- [x] Create notifications hook/service
- [x] Fetch real data from APIs
- [x] Aggregate notifications from multiple sources
- [x] Display in dropdown

**Phase 2: Real-Time Updates (Future)**
- [ ] WebSocket integration for live updates
- [ ] Server-Sent Events (SSE) as alternative
- [ ] Polling mechanism (fallback)
- [ ] Notification badge count updates

**Phase 3: Notification Management (Future)**
- [ ] Mark as read/unread
- [ ] Notification history page
- [ ] Notification preferences
- [ ] Email/SMS notifications

### Technical Implementation

#### Files to Create/Modify:
1. `web-app/lib/hooks/use-notifications.ts` - Notification data fetching hook
2. `web-app/lib/services/notification.service.ts` - Notification aggregation service
3. `web-app/components/layout/header.tsx` - Update to use real data
4. `web-app/app/notifications/page.tsx` - Notification history page (new)

#### API Integration:
```typescript
// Fetch overdue invoices
const overdueInvoices = await invoiceApi.get('/invoices', {
  params: {
    paymentStatus: 'unpaid',
    status: 'draft',
    dueDate: { $lt: new Date() }
  }
});

// Fetch low stock items
const lowStockItems = await inventoryApi.get('/items/low-stock');

// Fetch recent payments
const recentPayments = await paymentApi.get('/payments', {
  params: {
    limit: 5,
    sortBy: 'created_at',
    order: 'desc'
  }
});
```

### Estimated Effort
- **Phase 1:** 2-3 hours (data fetching)
- **Phase 2:** 4-6 hours (real-time updates)
- **Phase 3:** 6-8 hours (full notification system)

---

## 🎥 Priority 2: Video Tutorial Content

### Current State
- **Location:** `app/help/page.tsx` (lines 162-173)
- **Status:** ⚠️ Placeholder content
- **Issue:** Shows "Coming soon..." message

### Enhancement Requirements

#### 2.1 Video Tutorial Structure
1. **Introduction to Business Manager** (5 min)
   - Dashboard overview
   - Navigation basics
   - Key features overview

2. **Creating Your First Invoice** (3 min)
   - Step-by-step invoice creation
   - Adding items
   - GST calculation
   - Saving and printing

3. **Managing Inventory Stock** (4 min)
   - Adding items
   - Stock adjustments
   - Low stock alerts
   - Category management

4. **GST Reports Overview** (6 min)
   - GSTR-1 report
   - GSTR-3B report
   - Export functionality
   - Understanding GST calculations

#### 2.2 Implementation Plan

**Phase 1: Video Embedding (Current)**
- [x] Create video component structure
- [x] Support YouTube/Vimeo embeds
- [x] Video player UI
- [x] Playlist functionality

**Phase 2: Content Creation (Future)**
- [ ] Record video tutorials
- [ ] Edit and optimize videos
- [ ] Upload to hosting platform (YouTube/Vimeo)
- [ ] Add video metadata (duration, thumbnails)

**Phase 3: Enhanced Features (Future)**
- [ ] Video progress tracking
- [ ] User completion tracking
- [ ] Video transcripts
- [ ] Searchable video library
- [ ] Video recommendations

### Technical Implementation

#### Files to Create/Modify:
1. `web-app/components/ui/video-player.tsx` - Reusable video player component
2. `web-app/lib/data/video-tutorials.ts` - Video metadata and configuration
3. `web-app/app/help/page.tsx` - Update to use video component
4. `web-app/app/tutorials/page.tsx` - Dedicated tutorials page (new)

#### Video Data Structure:
```typescript
interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  thumbnail: string;
  videoUrl: string; // YouTube/Vimeo embed URL
  category: 'getting-started' | 'invoicing' | 'inventory' | 'reports';
  order: number;
  tags: string[];
}
```

### Video Hosting Options
1. **YouTube** (Recommended)
   - Free hosting
   - Good SEO
   - Easy embedding
   - Analytics available

2. **Vimeo**
   - Professional quality
   - Better privacy controls
   - Paid plans available

3. **Self-hosted**
   - Full control
   - Requires CDN
   - Higher costs

### Estimated Effort
- **Phase 1:** 2-3 hours (video embedding)
- **Phase 2:** 8-12 hours (content creation)
- **Phase 3:** 4-6 hours (enhanced features)

---

## 📋 Implementation Checklist

### Real-Time Notifications
- [x] Create notification hook (`use-notifications.ts`)
- [x] Create notification service (`notification.service.ts`)
- [x] Update header component to use real data
- [ ] Add notification polling mechanism
- [ ] Create notifications history page
- [ ] Add mark as read functionality
- [ ] Add notification preferences
- [ ] Implement WebSocket/SSE for real-time updates

### Video Tutorials
- [x] Create video player component
- [x] Create video tutorials data structure
- [x] Update help page with video embeds
- [ ] Record video content
- [ ] Upload videos to hosting platform
- [ ] Add video metadata
- [ ] Create dedicated tutorials page
- [ ] Add video progress tracking

---

## 🎯 Success Criteria

### Notifications
- ✅ Real data from APIs displayed
- ✅ Notification count badge shows accurate count
- ✅ Notifications update automatically
- ✅ Users can view notification history
- ✅ Users can mark notifications as read

### Video Tutorials
- ✅ Videos embedded and playable
- ✅ Video library organized by category
- ✅ All 4 core tutorials available
- ✅ Video player has good UX
- ✅ Videos are accessible and searchable

---

## 📝 Notes

### Notifications
- Start with polling (every 30 seconds) for MVP
- WebSocket can be added later for better UX
- Consider rate limiting to avoid API overload
- Cache notifications to reduce API calls

### Video Tutorials
- Start with YouTube embeds (easiest)
- Can migrate to self-hosted later if needed
- Consider adding video transcripts for accessibility
- Track video views for analytics

---

## 🔗 Related Files

### Notifications
- `web-app/components/layout/header.tsx`
- `web-app/lib/hooks/use-notifications.ts` (to be created)
- `web-app/lib/services/notification.service.ts` (to be created)
- `web-app/app/notifications/page.tsx` (to be created)

### Video Tutorials
- `web-app/app/help/page.tsx`
- `web-app/components/ui/video-player.tsx` (to be created)
- `web-app/lib/data/video-tutorials.ts` (to be created)
- `web-app/app/tutorials/page.tsx` (to be created)

---

## 📅 Timeline

### Week 1: Notifications Phase 1
- Implement data fetching
- Update header component
- Test with real APIs

### Week 2: Video Tutorials Phase 1
- Create video player component
- Set up video data structure
- Update help page

### Week 3-4: Content Creation
- Record video tutorials
- Upload to hosting platform
- Add metadata

### Week 5+: Advanced Features
- Real-time notification updates
- Video progress tracking
- Enhanced features

---

**Status:** Ready for implementation  
**Next Steps:** Start with Notifications Phase 1

