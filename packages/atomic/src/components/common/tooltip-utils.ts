let tooltipIdCounter = 0;

const setAriaDescribedBy = (trigger: HTMLElement, tooltipId: string) => {
  const describedBy = trigger.getAttribute('aria-describedby');
  if (!describedBy) {
    trigger.setAttribute('aria-describedby', tooltipId);
    return;
  }

  const tokens = new Set(describedBy.split(/\s+/).filter(Boolean));
  tokens.add(tooltipId);
  trigger.setAttribute('aria-describedby', Array.from(tokens).join(' '));
};

const removeAriaDescribedBy = (trigger: HTMLElement, tooltipId: string) => {
  const describedBy = trigger.getAttribute('aria-describedby');
  if (!describedBy) {
    return;
  }

  const tokens = describedBy.split(/\s+/).filter((id) => id !== tooltipId);
  if (!tokens.length) {
    trigger.removeAttribute('aria-describedby');
    return;
  }

  trigger.setAttribute('aria-describedby', tokens.join(' '));
};

const getTooltip = (trigger: HTMLElement, tooltipId: string) => {
  const root = trigger.getRootNode() as Document | ShadowRoot;
  return (
    root.getElementById?.(tooltipId) ??
    trigger.ownerDocument?.getElementById(tooltipId) ??
    null
  );
};

export const createTooltipId = (prefix = 'atomic-tooltip') =>
  `${prefix}-${++tooltipIdCounter}`;

export const showTooltip = (
  event: FocusEvent | MouseEvent,
  tooltipId: string
) => {
  const trigger = event.currentTarget as HTMLElement | null;
  if (!trigger || trigger.dataset.tooltipDismissed === 'true') {
    return;
  }

  const tooltip = getTooltip(trigger, tooltipId);
  if (!tooltip) {
    return;
  }

  setAriaDescribedBy(trigger, tooltipId);
  tooltip.hidden = false;
};

export const hideTooltip = (
  event: FocusEvent | MouseEvent,
  tooltipId: string
) => {
  const trigger = event.currentTarget as HTMLElement | null;
  if (!trigger) {
    return;
  }

  const tooltip = getTooltip(trigger, tooltipId);
  if (!tooltip) {
    return;
  }

  trigger.dataset.tooltipDismissed = 'false';
  removeAriaDescribedBy(trigger, tooltipId);
  tooltip.hidden = true;
};

export const dismissTooltipOnEscape = (
  event: KeyboardEvent,
  tooltipId: string
) => {
  if (event.key !== 'Escape') {
    return;
  }

  const trigger = event.currentTarget as HTMLElement | null;
  if (!trigger) {
    return;
  }

  const tooltip = getTooltip(trigger, tooltipId);
  if (!tooltip) {
    return;
  }

  trigger.dataset.tooltipDismissed = 'true';
  removeAriaDescribedBy(trigger, tooltipId);
  tooltip.hidden = true;
};
