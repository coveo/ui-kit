import type {ActivityMessage} from '../types/agent.js';
import type {A2UISurfaceContent} from '../types/commerce.js';
import {CommerceCatalogView} from './commerce/CommerceCatalogView.js';
import './ActivityRenderer.css';

interface ActivityRendererProps {
  activity: ActivityMessage;
  isLoading?: boolean;
  onActionSelected?: (prompt: string) => void;
}

export function ActivityRenderer({
  activity,
  isLoading = false,
  onActionSelected,
}: ActivityRendererProps): React.JSX.Element {
  if (activity.activityType === 'a2ui-surface') {
    return (
      <article className="activity-renderer" aria-label="Agent activity">
        <CommerceCatalogView
          content={activity.content as unknown as A2UISurfaceContent}
          isLoading={isLoading}
          onActionSelected={onActionSelected}
        />
      </article>
    );
  }

  return (
    <article className="activity-renderer" aria-label="Agent activity">
      <p className="activity-type">{activity.activityType}</p>
      <pre className="activity-content">
        {JSON.stringify(activity.content, null, 2)}
      </pre>
    </article>
  );
}
