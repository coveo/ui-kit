import {useEffect, useRef} from 'react';
import type {A2UISurfaceContent} from '@core/types/commerce.js';
import {resetBundleProductCache} from '@core/lib/bundleProductCache.js';

interface CommerceActionClickEvent extends CustomEvent<{prompt: string}> {}

interface CommerceCatalogViewElement extends HTMLElement {
  content: A2UISurfaceContent;
  isLoading: boolean;
}

export function resetCommerceCatalogCache(): void {
  resetBundleProductCache();
}

export function CommerceCatalogView({
  content,
  isLoading = false,
  onActionSelected,
}: {
  content: A2UISurfaceContent;
  isLoading?: boolean;
  onActionSelected?: (prompt: string) => void;
}) {
  const elementRef = useRef<CommerceCatalogViewElement | null>(null);

  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.content = content;
      elementRef.current.isLoading = isLoading;
    }
  }, [content, isLoading]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !onActionSelected) {
      return;
    }

    const handleActionClick = (event: Event) => {
      onActionSelected((event as CommerceActionClickEvent).detail.prompt);
    };

    element.addEventListener('commerce-action-click', handleActionClick);
    return () =>
      element.removeEventListener('commerce-action-click', handleActionClick);
  }, [onActionSelected]);

  return <cac-commerce-catalog-view ref={elementRef} />;
}
