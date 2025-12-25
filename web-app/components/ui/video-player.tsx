/**
 * Video Player Component
 * 
 * Embeds and displays video tutorials from YouTube, Vimeo, or other sources
 */

'use client';

import { useState } from 'react';
import { Play, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  thumbnail?: string;
  videoUrl: string; // YouTube/Vimeo embed URL or direct URL
  category: 'getting-started' | 'invoicing' | 'inventory' | 'reports' | 'payments';
  order: number;
  tags?: string[];
}

interface VideoPlayerProps {
  video: VideoTutorial;
  className?: string;
  autoplay?: boolean;
  showDescription?: boolean;
}

/**
 * Extract YouTube video ID from URL
 */
function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

/**
 * Extract Vimeo video ID from URL
 */
function getVimeoVideoId(url: string): string | null {
  const regExp = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

/**
 * Get embed URL for video platform
 */
function getEmbedUrl(videoUrl: string): string {
  const youtubeId = getYouTubeVideoId(videoUrl);
  if (youtubeId) {
    return `https://www.youtube.com/embed/${youtubeId}`;
  }

  const vimeoId = getVimeoVideoId(videoUrl);
  if (vimeoId) {
    return `https://player.vimeo.com/video/${vimeoId}`;
  }

  // Assume it's already an embed URL or direct video URL
  return videoUrl;
}

export function VideoPlayer({ 
  video, 
  className,
  autoplay = false,
  showDescription = true 
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const embedUrl = getEmbedUrl(video.videoUrl);
  const isYouTube = getYouTubeVideoId(video.videoUrl) !== null;
  const isVimeo = getVimeoVideoId(video.videoUrl) !== null;

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-0">
        <div className="relative aspect-video bg-muted">
          {!isPlaying ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {video.thumbnail ? (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Play className="h-16 w-16 text-primary opacity-50" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  size="lg"
                  className="rounded-full h-16 w-16 bg-primary/90 hover:bg-primary"
                  onClick={handlePlay}
                >
                  <Play className="h-8 w-8 ml-1 text-primary-foreground" />
                </Button>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/70 text-white p-3 rounded-lg">
                  <h3 className="font-semibold text-sm">{video.title}</h3>
                  {showDescription && video.description && (
                    <p className="text-xs text-white/80 mt-1 line-clamp-2">
                      {video.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-white/60">
                      {formatDuration(video.duration)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 h-6 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(video.videoUrl, '_blank');
                      }}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Open
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <iframe
              src={`${embedUrl}${autoplay ? '?autoplay=1' : ''}${isYouTube ? '&rel=0' : ''}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={video.title}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Video List Component - Displays multiple videos in a grid
 */
interface VideoListProps {
  videos: VideoTutorial[];
  className?: string;
}

export function VideoList({ videos, className }: VideoListProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}>
      {videos.map((video) => (
        <VideoPlayer key={video.id} video={video} />
      ))}
    </div>
  );
}

