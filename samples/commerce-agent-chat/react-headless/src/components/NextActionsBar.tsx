import type {NextAction} from '../../../core/src/types/commerce.js';

import './NextActionsBar.css';

interface NextActionsBarProps {
  actions: NextAction[];
  isLoading: boolean;
}

function shouldRender(actions: NextAction[], isLoading: boolean) {
  return actions.length > 0 || isLoading;
}

function shouldRenderLoading(actions: NextAction[], isLoading: boolean) {
  return isLoading && actions.length === 0;
}

function emitCommerceActionClick(target: EventTarget | null, prompt: string) {
  if (!(target instanceof HTMLElement)) {
    return;
  }

  target.dispatchEvent(
    new CustomEvent<{prompt: string}>('commerce-action-click', {
      detail: {prompt},
      bubbles: true,
      composed: true,
    })
  );
}

export function NextActionsBar({
  actions,
  isLoading,
}: NextActionsBarProps): React.JSX.Element | null {
  if (!shouldRender(actions, isLoading)) {
    return null;
  }

  const isLoadingOnly = shouldRenderLoading(actions, isLoading);

  return (
    <div className="rh-next-actions" aria-busy={isLoading ? 'true' : 'false'}>
      <p className="rh-next-actions__label">Next actions</p>
      <div
        className={`rh-next-actions__list${
          isLoadingOnly ? ' rh-next-actions__list--loading' : ''
        }`}
      >
        {isLoadingOnly
          ? Array.from({length: 4}, (_, index) => (
              <div
                key={`next-actions-skeleton-${index}`}
                className="rh-next-action-btn rh-next-action-btn--skeleton"
                aria-hidden="true"
              >
                <div className="commerce-loading commerce-loading--line commerce-loading--line-wide" />
              </div>
            ))
          : actions.map((action) => (
              <button
                key={`${action.type}-${action.text}`}
                className="rh-next-action-btn"
                type="button"
                aria-label={`Select action: ${action.text}`}
                onClick={(event) =>
                  emitCommerceActionClick(event.currentTarget, action.text)
                }
              >
                {action.text}
                <span className="rh-next-action-btn__badge">{action.type}</span>
              </button>
            ))}
      </div>
    </div>
  );
}
