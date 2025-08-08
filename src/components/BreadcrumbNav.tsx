import React, { useEffect } from 'react';

type MakeHref = (page: number) => string;

export interface BreadcrumbNavProps {
  currentPage: number;
  totalPages: number;
  makeHref: MakeHref;
  onNavigate?: (page: number) => void;
  windowSize?: number; // how many numbers on each side of current
  ariaLabel?: string;
  className?: string;
  disableWrap?: boolean; // default true: do not wrap on prev/next
}

/**
 * Accessible pagination breadcrumbs with progressive enhancement.
 * - Renders anchor links that work without JS.
 * - Client enhances with keyboard navigation and optional onNavigate.
 * - Shows first/prev, sliding window with ellipses, next/last.
 *
 * Example:
 * <BreadcrumbNav
 *   currentPage={page}
 *   totalPages={totalPages}
 *   makeHref={(p) => `/creator/123?page=${p}`}
 *   onNavigate={(p) => { /* optional SPA navigation */ }}
 * />
 */
const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({
  currentPage,
  totalPages,
  makeHref,
  onNavigate,
  windowSize = 2,
  ariaLabel = 'Pagination',
  className = '',
  disableWrap = true,
}) => {
  const clamp = (p: number) => Math.min(Math.max(p, 1), Math.max(1, totalPages));
  const safeCurrent = clamp(currentPage);
  const safeTotal = Math.max(1, totalPages);

  const goTo = (p: number) => {
    const target = clamp(p);
    if (onNavigate) {
      onNavigate(target);
    } else {
      // Progressive enhancement fallback
      window.location.assign(makeHref(target));
    }
  };

  // Keyboard navigation: Left/Right/Home/End
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Skip when typing or with modifier keys
      const target = e.target as HTMLElement | null;
      const isEditable =
        !target ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
        target.isContentEditable;

      if (isEditable) return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

      if (e.key === 'ArrowLeft') {
        if (disableWrap && safeCurrent <= 1) return;
        e.preventDefault();
        goTo(safeCurrent > 1 ? safeCurrent - 1 : (disableWrap ? 1 : safeTotal));
      } else if (e.key === 'ArrowRight') {
        if (disableWrap && safeCurrent >= safeTotal) return;
        e.preventDefault();
        goTo(safeCurrent < safeTotal ? safeCurrent + 1 : (disableWrap ? safeTotal : 1));
      } else if (e.key === 'Home') {
        e.preventDefault();
        goTo(1);
      } else if (e.key === 'End') {
        e.preventDefault();
        goTo(safeTotal);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [safeCurrent, safeTotal, disableWrap]); // eslint-disable-line react-hooks/exhaustive-deps

  const buildWindow = () => {
    const pages: (number | 'ellipsis')[] = [];
    const start = Math.max(1, safeCurrent - windowSize);
    const end = Math.min(safeTotal, safeCurrent + windowSize);

    // Always show first
    if (start > 1) {
      pages.push(1);
    }
    if (start > 2) {
      pages.push('ellipsis');
    }
    for (let p = start; p <= end; p++) {
      pages.push(p);
    }
    if (end < safeTotal - 1) {
      pages.push('ellipsis');
    }
    if (end < safeTotal) {
      pages.push(safeTotal);
    }
    return pages;
  };

  const items = buildWindow();

  const baseBtn =
    'inline-flex items-center justify-center min-w-9 h-9 px-3 rounded-md text-sm ' +
    'transition-colors focus-ring';
  const numBtn =
    'border border-border-secondary text-text-secondary hover:text-text-primary hover:bg-void-accent/10';
  const activeBtn =
    'border border-void-accent text-void-accent bg-void-accent/10 cursor-default';
  const navBtn =
    'border border-border-secondary text-text-secondary hover:text-text-primary hover:bg-void-accent/10';

  const disabledBtn =
    'border border-border-secondary text-text-muted cursor-not-allowed opacity-60';

  const NavLink = ({
    page,
    label,
    disabled,
    ariaLabel: aLabel,
    isCurrent,
  }: {
    page: number;
    label: React.ReactNode;
    disabled?: boolean;
    ariaLabel?: string;
    isCurrent?: boolean;
  }) => {
    const href = makeHref(page);
    const commonProps = {
      'aria-label': aLabel,
      className:
        baseBtn +
        ' ' +
        (isCurrent ? activeBtn : disabled ? disabledBtn : navBtn),
    };

    if (disabled || isCurrent) {
      return (
        <span aria-disabled="true" {...(commonProps as any)}>
          {label}
        </span>
      );
    }

    return (
      <a href={href} {...(commonProps as any)} onClick={(e) => {
        // Allow default anchor navigation; also enhance SPA if provided
        if (onNavigate) {
          e.preventDefault();
          onNavigate(page);
        }
      }}>
        {label}
      </a>
    );
  };

  return (
    <nav aria-label={ariaLabel} role="navigation" className={`flex items-center justify-center ${className}`}>
      <ol className="flex items-center gap-2" role="list">
        {/* First */}
        <li role="listitem">
          <NavLink
            page={1}
            label="« First"
            ariaLabel="Go to first page"
            disabled={safeCurrent === 1}
          />
        </li>

        {/* Prev */}
        <li role="listitem">
          <NavLink
            page={Math.max(1, safeCurrent - 1)}
            label="‹ Prev"
            ariaLabel="Go to previous page"
            disabled={safeCurrent === 1}
          />
        </li>

        {/* Numbered */}
        {items.map((it, idx) => (
          <li key={`${it}-${idx}`} role="listitem">
            {it === 'ellipsis' ? (
              <span className="px-2 text-text-tertiary select-none" aria-hidden="true">…</span>
            ) : (
              <a
                href={makeHref(it as number)}
                aria-current={it === safeCurrent ? 'page' : undefined}
                className={
                  baseBtn +
                  ' ' +
                  (it === safeCurrent ? activeBtn : numBtn)
                }
                onClick={(e) => {
                  if (onNavigate) {
                    e.preventDefault();
                    onNavigate(it as number);
                  }
                }}
              >
                {it}
              </a>
            )}
          </li>
        ))}

        {/* Next */}
        <li role="listitem">
          <NavLink
            page={Math.min(safeTotal, safeCurrent + 1)}
            label="Next ›"
            ariaLabel="Go to next page"
            disabled={safeCurrent === safeTotal}
          />
        </li>

        {/* Last */}
        <li role="listitem">
          <NavLink
            page={safeTotal}
            label="Last »"
            ariaLabel="Go to last page"
            disabled={safeCurrent === safeTotal}
          />
        </li>
      </ol>
    </nav>
  );
};

export default BreadcrumbNav;