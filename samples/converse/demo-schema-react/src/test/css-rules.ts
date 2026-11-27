/**
 * The style rules of a CSS module, for tests that check which of them reach an element: jsdom
 * applies no CSS-module styles, but it matches their selectors. Each `.className` the test names
 * is replaced with a selector the rendered DOM carries, since the module's class names are not.
 */
export interface CssRule {
  selector: string;
  declarations: Record<string, string>;
}

export function cssRules(css: string, classSelectors: Record<string, string>): CssRule[] {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  return Array.from(withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g), ([, selector, body]) => ({
    selector: Object.entries(classSelectors).reduce(
      (current, [className, replacement]) =>
        current.replace(new RegExp(`\\.${className}(?![\\w-])`, 'g'), replacement),
      selector.trim().replace(/\s+/g, ' ')
    ),
    declarations: Object.fromEntries(
      body
        .split(';')
        .map((declaration) => declaration.split(':').map((part) => part.trim()))
        .filter(([property, value]) => property && value)
        .map(([property, value]) => [property, value])
    ),
  }));
}

/** The declarations of every rule whose selector matches `element`, later rules winning. */
export function declarationsFor(element: Element, rules: CssRule[]): Record<string, string> {
  return Object.assign(
    {},
    ...rules.filter(({selector}) => element.matches(selector)).map(({declarations}) => declarations)
  );
}
