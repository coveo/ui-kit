import {useEffect, useRef} from 'react';

import './ActivityRenderer.css';

interface ActivityMessage {
  id: string;
  activityType: string;
  content: unknown;
}

interface ProductRecord {
  [key: string]: unknown;
}

interface CatalogViewElement extends HTMLElement {
  content: unknown;
  isLoading: boolean;
  bundleProducts: Map<string, ProductRecord[]>;
  allowNextActionsFallback: boolean;
}

interface ActivityRendererProps {
  activity: ActivityMessage;
  isLoading: boolean;
  bundleProducts: Map<string, ProductRecord[]>;
  allowNextActionsFallback: boolean;
}

function CatalogViewBridge({
  content,
  isLoading,
  bundleProducts,
  allowNextActionsFallback,
}: {
  content: unknown;
  isLoading: boolean;
  bundleProducts: Map<string, ProductRecord[]>;
  allowNextActionsFallback: boolean;
}): React.JSX.Element {
  const elementRef = useRef<CatalogViewElement | null>(null);

  useEffect(() => {
    if (!elementRef.current) {
      return;
    }

    elementRef.current.content = content;
    elementRef.current.isLoading = isLoading;
    elementRef.current.bundleProducts = bundleProducts;
    elementRef.current.allowNextActionsFallback = allowNextActionsFallback;
  }, [content, isLoading, bundleProducts, allowNextActionsFallback]);

  return <cac-commerce-catalog-view ref={elementRef} />;
}

export function ActivityRenderer({
  activity,
  isLoading,
  bundleProducts,
  allowNextActionsFallback,
}: ActivityRendererProps): React.JSX.Element {
  const isA2UIActivity = activity.activityType === 'a2ui-surface';

  return (
    <article className="rh-activity-renderer" aria-label="Agent activity">
      {isA2UIActivity ? (
        <CatalogViewBridge
          content={activity.content}
          isLoading={isLoading}
          bundleProducts={bundleProducts}
          allowNextActionsFallback={allowNextActionsFallback}
        />
      ) : (
        <>
          <p className="rh-activity-type">{activity.activityType}</p>
          <pre className="rh-activity-content">
            {JSON.stringify(activity.content, null, 2)}
          </pre>
        </>
      )}
    </article>
  );
}
