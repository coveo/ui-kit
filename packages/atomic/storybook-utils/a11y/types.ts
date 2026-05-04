/** Options for interactive keyboard tests that axe-core cannot cover (WCAG 2.1.1). */
export interface InteractiveA11yOptions {
  /** Test that a button with `aria-expanded` toggles on Enter. */
  expandCollapse?: {
    role?: string;
    expanded?: boolean;
    name?: string | RegExp;
  };

  /** Test that named buttons are keyboard-activatable via Enter. */
  activatableButtons?: Array<{name: string | RegExp}>;

  /** Test that a text input accepts typed characters. */
  textInput?: {
    role?: string;
  };

  /** Test arrow-key navigation within a grouped widget (e.g. radiogroup). */
  arrowNavigation?: {
    groupRole: string;
  };

  /** Test selection control activation (Enter on button[aria-pressed] or checkbox). Defaults to `true`. */
  selectionControl?: boolean;
}
