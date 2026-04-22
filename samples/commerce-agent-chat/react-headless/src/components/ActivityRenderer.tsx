import type {
  AgentChatCatalogActivityState,
  AgentChatProduct,
} from '@coveo/headless/commerce';
import {CommerceCatalogView} from './CommerceCatalogView.js';

import './ActivityRenderer.css';

interface ActivityMessage {
  id: string;
  activityType: string;
  content: unknown;
}

interface ActivityRendererProps {
  activity: ActivityMessage;
  catalog: AgentChatCatalogActivityState | null;
  isLoading: boolean;
  bundleProducts: Record<string, AgentChatProduct[]>;
  allowNextActionsFallback: boolean;
}

export function ActivityRenderer({
  activity,
  catalog,
  isLoading,
  bundleProducts,
  allowNextActionsFallback,
}: ActivityRendererProps): React.JSX.Element {
  const isA2UIActivity = activity.activityType === 'a2ui-surface';

  return (
    <article className="rh-activity-renderer" aria-label="Agent activity">
      {isA2UIActivity ? (
        <CommerceCatalogView
          catalog={catalog}
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
