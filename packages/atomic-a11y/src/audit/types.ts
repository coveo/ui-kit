/**
 * Shared types for accessibility auditing.
 *
 * AccessibilityNode is a structural type matching Playwright's accessibility
 * snapshot format, defined here to avoid tight coupling to Playwright's types.
 */

/** Node in an accessibility tree snapshot. */
export interface AccessibilityNode {
  /** ARIA role of the element. */
  role?: string;
  /** Accessible name of the element. */
  name?: string;
  /** Current value (for form controls). */
  value?: string | number;
  /** Accessible description. */
  description?: string;
  /** Child nodes in the tree. */
  children?: AccessibilityNode[];
}
