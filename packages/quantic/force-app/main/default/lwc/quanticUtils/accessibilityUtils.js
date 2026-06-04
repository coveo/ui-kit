/**
 * AriaLiveUtils
 * @typedef {Object} AriaLiveUtils
 * @property {Function} dispatchMessage
 * @property {Function} registerRegion
 */

/**
 * AriaLiveRegion Create an AriaLiveRegion to be able to send events to dispatch messages for assistive technologies.
 * @param {string} regionName
 * @param {Object} elem
 * @param {boolean} assertive
 * @returns {AriaLiveUtils} Object with methods to dispatch messages and register the region.
 */
export function AriaLiveRegion(regionName, elem, assertive = false) {
  function dispatchMessage(message) {
    const ariaLiveMessageEvent = new CustomEvent('quantic__arialivemessage', {
      bubbles: true,
      composed: true,
      detail: {
        regionName,
        assertive,
        message,
      },
    });
    elem.dispatchEvent(ariaLiveMessageEvent);
  }

  function registerRegion() {
    const registerRegionEvent = new CustomEvent('quantic__registerregion', {
      bubbles: true,
      composed: true,
      detail: {
        regionName,
        assertive,
      },
    });
    elem.dispatchEvent(registerRegionEvent);
  }

  registerRegion();

  return {
    dispatchMessage,
    registerRegion,
  };
}

/**
 * Checks whether an element is focusable.
 * @param {HTMLElement | Element}  element
 * @returns {boolean}
 */
export function isFocusable(element) {
  // Source: https://stackoverflow.com/a/30753870
  if (element.getAttribute('tabindex') === '-1') {
    return false;
  }
  if (
    element.hasAttribute('tabindex') ||
    element.getAttribute('contentEditable') === 'true'
  ) {
    return true;
  }
  switch (element.tagName) {
    case 'A':
    case 'AREA':
      return element.hasAttribute('href');
    case 'INPUT':
    case 'SELECT':
    case 'TEXTAREA':
    case 'BUTTON':
      return !element.hasAttribute('disabled');
    case 'IFRAME':
      return true;
    default:
      return false;
  }
}

/**
 * Returns the last focusable element of for an HTML element.
 * This function would NOT work with shadow root.
 * @param {HTMLElement & {assignedElements?: () => Array<HTMLElement>} | null} element
 * @returns {HTMLElement | null}
 */
export function getLastFocusableElement(element) {
  if (!element || element.nodeType === Node.TEXT_NODE) return null;

  if (isCustomElement(element)) {
    if (element.dataset?.focusable?.toString() === 'true') {
      return element;
    }
    return null;
  }

  if (element.tagName === 'SLOT' && element.assignedElements().length) {
    return getLastFocusableElementFromSlot(element);
  }

  /** @type {Array} */
  const childNodes = Array.from(element.childNodes);
  const focusableElements = childNodes
    .map((item) => getLastFocusableElement(item))
    .filter((item) => !!item);

  if (focusableElements.length) {
    return focusableElements[focusableElements.length - 1];
  } else if (isFocusable(element)) {
    return element;
  }
  return null;
}

/**
 * Returns the First focusable element of for an HTML element.
 * This function would NOT work with shadow root.
 * @param {HTMLElement & {assignedElements?: () => Array<HTMLElement>} | null} element
 * @returns {HTMLElement | null}
 */
export function getFirstFocusableElement(element) {
  if (!element || element.nodeType === Node.TEXT_NODE) return null;

  if (isCustomElement(element)) {
    if (element.dataset?.focusable?.toString() === 'true') {
      return element;
    }
    return null;
  }

  if (element.tagName === 'SLOT' && element.assignedElements().length) {
    return getFirstFocusableElementFromSlot(element);
  }

  /** @type {Array} */
  const childNodes = Array.from(element.childNodes);
  const focusableElements = childNodes
    .map((item) => getFirstFocusableElement(item))
    .filter((item) => !!item);

  if (focusableElements.length) {
    return focusableElements[0];
  } else if (isFocusable(element)) {
    return element;
  }
  return null;
}

/**
 * Checks whether an element is a custom element.
 * @param {HTMLElement | null} element
 * @returns {boolean}
 */
export function isCustomElement(element) {
  if (element && element.tagName.includes('-')) {
    return true;
  }
  return false;
}

/**
 * Returns the last focusable element in an HTML slot.
 * @param {HTMLElement & {assignedElements?: () => Array<HTMLElement> | null}} slotElement
 * @returns {HTMLElement | null}
 */
function getLastFocusableElementFromSlot(slotElement) {
  if (!slotElement && slotElement.assignedElements) {
    return null;
  }
  const assignedElements = Array.from(slotElement.assignedElements());
  const focusableElements = assignedElements
    .map((item) => getLastFocusableElement(item))
    .filter((item) => !!item);

  if (focusableElements.length) {
    return focusableElements[focusableElements.length - 1];
  }
  return null;
}

/**
 * Returns the first focusable element in an HTML slot.
 * @param {HTMLElement & {assignedElements?: () => Array<HTMLElement> | null}} slotElement
 * @return {HTMLElement | null}
 */
function getFirstFocusableElementFromSlot(slotElement) {
  if (!slotElement && slotElement.assignedElements) {
    return null;
  }
  const assignedElements = Array.from(slotElement.assignedElements());
  const focusableElements = assignedElements
    .map((item) => getFirstFocusableElement(item))
    .filter((item) => !!item);

  if (focusableElements.length) {
    return focusableElements[0];
  }
  return null;
}

/**
 * Checks whether an element is indeed the targetElement or one of its parents.
 * @param {HTMLElement} element
 * @param {string} targetElement
 * @returns {boolean}
 */
export function isParentOf(element, targetElement) {
  if (!element || element.nodeType === Node.TEXT_NODE) {
    return false;
  }

  if (isCustomElement(element)) {
    if (element.tagName === targetElement) {
      return true;
    }
    return false;
  }
  /** @type {Array} */
  const childNodes = Array.from(element.childNodes);
  if (childNodes.length === 0) return false;
  return childNodes.reduce(
    (acc, val) => acc || isParentOf(val, targetElement),
    false
  );
}
