'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = React.useState(children);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const childrenRef = React.useRef(children);

  // Update ref when children changes
  React.useEffect(() => {
    childrenRef.current = children;
  }, [children]);

  // Only transition when pathname changes
  React.useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setDisplayChildren(childrenRef.current);
      setIsTransitioning(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [pathname]); // Only depend on pathname, not children

  return (
    <div
      className={cn(
        'page-enter',
        isTransitioning && 'opacity-0',
        className
      )}
    >
      {displayChildren}
    </div>
  );
}


