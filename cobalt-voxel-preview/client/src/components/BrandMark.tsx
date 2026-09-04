/**
 * Mineral Signal reminder: this mark is the compact cobalt voxel knot—three offset planes with a cream aperture.
 * Keep it geometric, tactile, and legible at small sizes; it is the brand’s clearest active signal.
 */
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  withWordmark?: boolean;
  light?: boolean;
}

export default function BrandMark({ className, withWordmark = true, light = false }: BrandMarkProps) {
  return (
    <span className={cn("brand-lockup", light && "brand-lockup--light", className)}>
      <span className="brand-symbol" aria-hidden="true">
        <svg viewBox="0 0 48 48" role="presentation">
          <path d="M24 4 42 14.5v19L24 44 6 33.5v-19L24 4Z" className="mark-plane mark-plane--outer" />
          <path d="m24 12 10.5 6.1v11.8L24 36l-10.5-6.1V18.1L24 12Z" className="mark-plane mark-plane--inner" />
          <path d="m24 17.5 5.7 3.3v6.4L24 30.5l-5.7-3.3v-6.4l5.7-3.3Z" className="mark-aperture" />
        </svg>
      </span>
      {withWordmark && (
        <span className="brand-wordmark">
          <span className="brand-wordmark__main">cobalt</span>
          <span className="brand-wordmark__sub">voxel / 001</span>
        </span>
      )}
    </span>
  );
}
