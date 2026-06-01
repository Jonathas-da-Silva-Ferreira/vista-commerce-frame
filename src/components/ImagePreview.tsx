import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

// Reusable preview that gracefully handles broken URLs. We isolate this here
// because product image previews are used in many places (uploader, listings,
// admin tooling) and a centralized error fallback prevents UI from breaking
// when a remote URL 404s or a data URL becomes invalid.
interface ImagePreviewProps {
  src: string;
  alt?: string;
  className?: string;
}

export function ImagePreview({ src, alt = 'Preview', className }: ImagePreviewProps) {
  // Local error state lets us swap the <img> for a visible placeholder
  // instead of relying on the browser's broken-image glyph, which looks
  // unprofessional in a marketplace context.
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div className={cn('flex items-center justify-center bg-muted text-muted-foreground rounded-lg border border-border', className)}>
        <ImageOff className="w-6 h-6" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn('object-cover rounded-lg border border-border', className)}
      onError={() => setErrored(true)}
    />
  );
}

export default ImagePreview;
