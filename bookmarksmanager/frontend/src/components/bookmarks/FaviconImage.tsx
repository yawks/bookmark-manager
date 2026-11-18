import type { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// A stable light surface plus a dark halo keeps both black and white artwork
// legible without inverting brand colours or inspecting cross-origin images.
export function FaviconImage({ className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <span className={cn('bookmark-favicon inline-flex shrink-0 items-center justify-center rounded-md', className)}>
      <img {...props} className="h-full w-full object-contain" />
    </span>
  );
}
