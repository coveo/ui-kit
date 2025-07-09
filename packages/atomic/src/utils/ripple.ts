import {listenOnce} from './event-utils';

interface RippleOptions {
  color: string;
  /**
   * When the ripple's parent is not the event's origin
   */
  parent?: Element;
}

const RIPPLE = 'ripple';

function getAnimationDurationInMilliseconds(radiusPixels: number) {
  // A 318px wide button has a duration of 700ms.
  return Math.cbrt(radiusPixels) * 129.21;
}

function setPositionRelativeIfStatic(element: Element) {
  if (getComputedStyle(element).position === 'static') {
    element.classList.add('ripple-relative');
  }
}

export async function createRipple(event: MouseEvent, options: RippleOptions) {
  const button = options.parent ?? (event.currentTarget as Element);
  const existingRipple = button.getElementsByClassName(RIPPLE)[0];
  existingRipple?.remove();

  button.classList.add('ripple-parent');
  setPositionRelativeIfStatic(button);
  Array.from(button.children).forEach(setPositionRelativeIfStatic);

  const ripple = document.createElement('span');
  ripple.classList.add(RIPPLE);
  ripple.style.backgroundColor = `var(--atomic-${options.color})`;
  ripple.setAttribute('part', RIPPLE);

  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;
  const animationDuration = getAnimationDurationInMilliseconds(radius);
  const {top, left} = button.getBoundingClientRect();
  ripple.style.width = ripple.style.height = `${diameter}px`;
  ripple.style.left = `${event.clientX - (left + radius)}px`;
  ripple.style.top = `${event.clientY - (top + radius)}px`;
  ripple.style.setProperty('--animation-duration', `${animationDuration}ms`);
  button.prepend(ripple);
  await cleanupAnimationOnFinish(ripple, animationDuration);
}

async function cleanupAnimationOnFinish(
  ripple: HTMLSpanElement,
  animationDuration: number
) {
  listenOnce(ripple, 'animationend', () => {
    ripple?.remove();
  });
  // Backup in case the button gets hidden or unmounted and the ripple hasn't been cleaned up.
  setTimeout(
    () => ripple?.remove(),
    animationDuration + animationDuration * 0.1
  );
}
