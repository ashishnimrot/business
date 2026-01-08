/**
 * Video Tutorials Data
 * 
 * Contains metadata for all video tutorials.
 * Update videoUrl with actual YouTube/Vimeo links when videos are ready.
 */

import { VideoTutorial } from '@/components/ui/video-player';

export const videoTutorials: VideoTutorial[] = [
  {
    id: 'intro-business-manager',
    title: 'Introduction to Business Manager',
    description: 'Get started with Business Manager. Learn about the dashboard, navigation, and key features.',
    duration: 5,
    videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER', // Replace with actual video URL
    category: 'getting-started',
    order: 1,
    tags: ['getting-started', 'dashboard', 'navigation'],
  },
  {
    id: 'create-first-invoice',
    title: 'Creating Your First Invoice',
    description: 'Step-by-step guide to creating invoices, adding items, calculating GST, and printing.',
    duration: 3,
    videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER', // Replace with actual video URL
    category: 'invoicing',
    order: 2,
    tags: ['invoicing', 'invoice-creation', 'gst'],
  },
  {
    id: 'manage-inventory-stock',
    title: 'Managing Inventory Stock',
    description: 'Learn how to add items, adjust stock levels, set low stock alerts, and manage categories.',
    duration: 4,
    videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER', // Replace with actual video URL
    category: 'inventory',
    order: 3,
    tags: ['inventory', 'stock-management', 'items'],
  },
  {
    id: 'gst-reports-overview',
    title: 'GST Reports Overview',
    description: 'Understanding GSTR-1 and GSTR-3B reports, export functionality, and GST calculations.',
    duration: 6,
    videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER', // Replace with actual video URL
    category: 'reports',
    order: 4,
    tags: ['reports', 'gst', 'gstr-1', 'gstr-3b'],
  },
];

/**
 * Get videos by category
 */
export function getVideosByCategory(category: VideoTutorial['category']): VideoTutorial[] {
  return videoTutorials
    .filter(video => video.category === category)
    .sort((a, b) => a.order - b.order);
}

/**
 * Get all videos sorted by order
 */
export function getAllVideos(): VideoTutorial[] {
  return [...videoTutorials].sort((a, b) => a.order - b.order);
}

/**
 * Get video by ID
 */
export function getVideoById(id: string): VideoTutorial | undefined {
  return videoTutorials.find(video => video.id === id);
}

/**
 * Check if videos are ready (not placeholders)
 */
export function areVideosReady(): boolean {
  return videoTutorials.every(video => 
    !video.videoUrl.includes('PLACEHOLDER') && 
    video.videoUrl.startsWith('http')
  );
}


