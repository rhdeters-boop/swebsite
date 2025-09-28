import React, { useEffect } from 'react';
import BreadcrumbNav, { type BreadcrumbNavProps } from './BreadcrumbNav';

export interface MediaPaginatorProps {
  currentPage: number;
  totalPages: number;
  makeHref: (page: number) => string;
  onNavigate?: (page: number) => void;
  onPrefetch?: (pages: number[]) => void; // provide to prefetch adjacent pages via caller's data layer
  windowSize?: number;
  ariaLabel?: string;
  className?: string;
}

/**
 * MediaPaginator
 * Thin wrapper over BreadcrumbNav that can trigger prefetching of adjacent pages.
 * Pass onPrefetch to integrate with TanStack Query or your data layer.
 */
const MediaPaginator: React.FC<MediaPaginatorProps> = ({
  currentPage,
  totalPages,
  makeHref,
  onNavigate,
  onPrefetch,
  windowSize,
  ariaLabel = 'Media pagination',
  className = '',
}) => {
  const safeTotal = Math.max(1, totalPages);
  const safeCurrent = Math.min(Math.max(currentPage, 1), safeTotal);

  useEffect(() => {
    if (!onPrefetch) return;
    const prev = safeCurrent > 1 ? safeCurrent - 1 : null;
    const next = safeCurrent < safeTotal ? safeCurrent + 1 : null;
    const pagesToPrefetch = [prev, next].filter(Boolean) as number[];
    if (pagesToPrefetch.length) {
      onPrefetch(pagesToPrefetch);
    }
  }, [safeCurrent, safeTotal, onPrefetch]);

  return (
    <BreadcrumbNav
      currentPage={safeCurrent}
      totalPages={safeTotal}
      makeHref={makeHref}
      onNavigate={onNavigate}
      windowSize={windowSize}
      ariaLabel={ariaLabel}
      className={className}
    />
  );
};

export default MediaPaginator;