import type {A2UISurfaceContent, Product} from '../types/commerce.js';
import {CommerceCatalogView} from './CommerceCatalogView.js';

import './ActivityRenderer.css';

interface ActivityMessage {
  id: string;
  activityType: string;
  content: unknown;
}

interface ActivityRendererProps {
  activity: ActivityMessage;
  isLoading: boolean;
  bundleProducts: Map<string, Product[]>;
  allowNextActionsFallback: boolean;
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
        <CommerceCatalogView
          content={activity.content as A2UISurfaceContent}
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
