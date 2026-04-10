import type {NextAction} from '../../types/commerce.js';
import './NextActionsBar.css';

interface NextActionsBarProps {
  actions: NextAction[];
  isLoading?: boolean;
  onActionClick?: (prompt: string) => void;
}

export function NextActionsBar({
  actions,
  isLoading = false,
  onActionClick,
}: NextActionsBarProps) {
  if (actions.length === 0 && !isLoading) return null;

  return (
    <div className="next-actions" aria-busy={isLoading ? true : undefined}>
      <p className="next-actions__label">Next actions</p>
      <div className="next-actions__list">
        {isLoading && actions.length === 0
          ? Array.from({length: 3}, (_, i) => (
              <div
                key={`next-actions-skeleton-${i}`}
                className="next-action-btn next-action-btn--skeleton"
                aria-hidden="true"
              >
                <div className="commerce-loading commerce-loading--line commerce-loading--line-wide" />
              </div>
            ))
          : actions.map((action, i) => (
              <button
                key={`${action.type}-${action.text}-${i}`}
                className="next-action-btn"
                type="button"
                onClick={() => onActionClick?.(action.text)}
              >
                {action.text}
                <span className="next-action-btn__badge">{action.type}</span>
              </button>
            ))}
      </div>
    </div>
  );
}
