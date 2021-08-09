interface RippleOptions {
  color: string;
  /**
   * When the ripple's parent is not the event's origin
   */
  parent?: Element;
}

const RIPPLE = 'ripple';

function setPositionRelativeIfStatic(element: Element) {
  if (getComputedStyle(element).position === 'static') {
    element.classList.add('ripple-relative');
  }
}

export function createRipple(event: MouseEvent, options: RippleOptions) {
  const button = options.parent ?? (event.currentTarget as Element);
  const existingRipple = button.getElementsByClassName(RIPPLE)[0];
  existingRipple && existingRipple.remove();

  button.classList.add('ripple-parent');
  setPositionRelativeIfStatic(button);
  Array.from(button.children).forEach(setPositionRelativeIfStatic);

  const ripple = document.createElement('span');
  ripple.classList.add(RIPPLE);
  ripple.style.backgroundColor = `var(--atomic-${options.color})`;
  ripple.setAttribute('part', RIPPLE);

  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;
  const {top, left} = button.getBoundingClientRect();
  ripple.style.width = ripple.style.height = `${diameter}px`;
  ripple.style.left = `${event.clientX - (left + radius)}px`;
  ripple.style.top = `${event.clientY - (top + radius)}px`;
  button.prepend(ripple);
}
