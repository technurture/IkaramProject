import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  X, 
  Play, 
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
  name?: string;
}

interface MediaGalleryProps {
  items: string[];
  className?: string;
}

export function MediaGallery({ items, className }: MediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Parse media items and determine type
  const mediaItems: MediaItem[] = items.map(url => {
    const isVideo = /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(url);
    return {
      url,
      type: isVideo ? 'video' : 'image',
      name: url.split('/').pop() || 'media'
    };
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        case 'Escape':
          e.preventDefault();
          closeGallery();
          break;
      }
    };

    if (selectedIndex !== null) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedIndex]);

  const openGallery = (index: number) => {
    setSelectedIndex(index);
    setIsPlaying(false);
  };

  const closeGallery = () => {
    setSelectedIndex(null);
    setIsPlaying(false);
  };

  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : mediaItems.length - 1);
      setIsPlaying(false);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex < mediaItems.length - 1 ? selectedIndex + 1 : 0);
      setIsPlaying(false);
    }
  };

  const downloadMedia = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const togglePlayPause = () => {
    const video = document.querySelector('.gallery-video') as HTMLVideoElement;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    const video = document.querySelector('.gallery-video') as HTMLVideoElement;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (mediaItems.length === 0) return null;

  return (
    <>
      {/* Thumbnail Grid */}
      <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", className)}>
        {mediaItems.map((item, index) => (
          <div
            key={index}
            className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity group"
            onClick={() => openGallery(index)}
          >
            {item.type === 'image' ? (
              <img
                src={item.url}
                alt={`Media ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="relative w-full h-full">
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  muted
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-40 transition-colors">
                  <Play className="h-8 w-8 text-white" fill="white" />
                </div>
              </div>
            )}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadMedia(item.url, item.name || `media-${index + 1}`);
                }}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Gallery Modal */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => closeGallery()}>
        <DialogContent className="max-w-7xl max-h-[90vh] p-0 bg-black border-0">
          {selectedIndex !== null && (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                onClick={closeGallery}
              >
                <X className="h-6 w-6" />
              </Button>

              {/* Download Button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-16 z-10 text-white hover:bg-white/20"
                onClick={() => {
                  const currentItem = mediaItems[selectedIndex];
                  downloadMedia(currentItem.url, currentItem.name || `media-${selectedIndex + 1}`);
                }}
              >
                <Download className="h-6 w-6" />
              </Button>

              {/* Previous Button */}
              {mediaItems.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
              )}

              {/* Next Button */}
              {mediaItems.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              )}

              {/* Media Content */}
              <div className="w-full h-full flex items-center justify-center p-8">
                {mediaItems[selectedIndex].type === 'image' ? (
                  <img
                    src={mediaItems[selectedIndex].url}
                    alt={`Media ${selectedIndex + 1}`}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="relative max-w-full max-h-full">
                    <video
                      src={mediaItems[selectedIndex].url}
                      className="gallery-video max-w-full max-h-full object-contain"
                      controls={false}
                      muted={isMuted}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />
                    
                    {/* Video Controls */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                        onClick={togglePlayPause}
                      >
                        {isPlaying ? (
                          <Pause className="h-6 w-6" />
                        ) : (
                          <Play className="h-6 w-6" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                        onClick={toggleMute}
                      >
                        {isMuted ? (
                          <VolumeX className="h-6 w-6" />
                        ) : (
                          <Volume2 className="h-6 w-6" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Media Counter */}
              {mediaItems.length > 1 && (
                <div className="absolute bottom-4 left-4 z-10 text-white bg-black/50 px-3 py-1 rounded">
                  {selectedIndex + 1} / {mediaItems.length}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}