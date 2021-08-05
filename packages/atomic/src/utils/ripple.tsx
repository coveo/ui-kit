interface RippleOptions {
  color: string;
  /**
   * When the ripple's parent is not the event's origin
   */
  parent?: Element;
}

const RIPPLE_CLASS = 'ripple';

function setPositionRelativeIfStatic(element: Element) {
  if (getComputedStyle(element).position === 'static') {
    element.classList.add('relative');
  }
}

export function createRipple(event: MouseEvent, options: RippleOptions) {
  const button = options.parent ?? (event.currentTarget as Element);
  const existingRipple = button.getElementsByClassName(RIPPLE_CLASS)[0];
  existingRipple && existingRipple.remove();

  button.classList.add('overflow-hidden');
  setPositionRelativeIfStatic(button);
  Array.from(button.children).forEach(setPositionRelativeIfStatic);

  const ripple = document.createElement('span');
  ripple.classList.add(RIPPLE_CLASS, `bg-${options.color}`);
  ripple.setAttribute('part', 'ripple');

  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;
  const {top, left} = button.getBoundingClientRect();
  ripple.style.width = ripple.style.height = `${diameter}px`;
  ripple.style.left = `${event.clientX - (left + radius)}px`;
  ripple.style.top = `${event.clientY - (top + radius)}px`;
  button.prepend(ripple);
}
