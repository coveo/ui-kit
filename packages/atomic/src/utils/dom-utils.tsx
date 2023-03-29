export function rectEquals(r1: DOMRect, r2: DOMRect) {
  return (
    r1.x === r2.x &&
    r1.y === r2.y &&
    r1.width === r2.width &&
    r1.height === r2.height
  );
}

/**
 * Returns the padding values of an element.
 */
export function getElementPadding(element: HTMLElement) {
  const styles = window.getComputedStyle(element);

  return {
    top: parseFloat(styles.paddingTop.length ? styles.paddingTop : '0'),
    right: parseFloat(styles.paddingRight.length ? styles.paddingRight : '0'),
    bottom: parseFloat(
      styles.paddingBottom.length ? styles.paddingBottom : '0'
    ),
    left: parseFloat(styles.paddingLeft.length ? styles.paddingLeft : '0'),
  };
}

/**
 * Returns the absolute width of an element.
 */
export function getAbsoluteHeight(element: HTMLElement) {
  if (!element) {
    return 0;
  }
  const paddings = getElementPadding(element);
  const padding = paddings.top + paddings.bottom;

  return Math.ceil(element.offsetHeight + padding);
}

/**
 * Returns the absolute width of an element.
 */
export function getAbsoluteWidth(element: HTMLElement) {
  if (!element) {
    return 0;
  }
  const paddings = getElementPadding(element);
  const padding = paddings.left + paddings.right;

  return Math.ceil(element.offsetWidth + padding);
}
