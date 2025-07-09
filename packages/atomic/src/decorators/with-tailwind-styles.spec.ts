import {
  type CSSResult,
  type CSSResultGroup,
  html,
  LitElement,
  unsafeCSS,
} from 'lit';
import {customElement} from 'lit/decorators.js';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import theme from '@/src/utils/coveo.tw.css';
import globalStyles from '@/src/utils/tailwind.global.tw.css';
import utilities from '@/src/utils/tailwind-utilities/utilities.tw.css';
import {withTailwindStyles} from './with-tailwind-styles';

const componentStyles = `
  div {
    color: red;
  }
`;

@customElement('test-tailwind-element')
@withTailwindStyles
class TestTailwindElement extends LitElement {
  static styles: CSSResultGroup | CSSStyleSheet | undefined = [
    unsafeCSS(componentStyles),
  ];

  render() {
    return html`<div>Test Element</div>`;
  }
}

@customElement('test-tailwind-element-without-array')
@withTailwindStyles
class TestTailwindElementWithoutArray extends LitElement {
  static styles: CSSResultGroup | CSSStyleSheet | undefined =
    unsafeCSS(componentStyles);

  render() {
    return html`<div>Test Element Without Array</div>`;
  }
}

@customElement('test-tailwind-element-no-styles')
@withTailwindStyles
class TestTailwindElementNoStyles extends LitElement {
  render() {
    return html`<div>Test Element No Styles</div>`;
  }
}

function setupElement(elementTag: string) {
  const element = document.createElement(elementTag) as TestTailwindElement;
  document.body.appendChild(element);
  return element;
}

describe('withTailwindStyles decorator', () => {
  const testCases = [
    {description: 'include Tailwind theme styles', index: 0, expected: theme},
    {
      description: 'include Tailwind global styles',
      index: 1,
      expected: globalStyles,
    },
    {
      description: 'include Tailwind utilities styles',
      index: 2,
      expected: utilities,
    },
    {
      description: 'preserve existing styles of the component',
      index: 3,
      expected: componentStyles,
    },
  ];

  describe('when styles is an array', () => {
    let element: TestTailwindElement;
    let styles: CSSResultGroup | CSSStyleSheet | undefined;

    beforeEach(() => {
      element = setupElement('test-tailwind-element');
      styles = (element.constructor as typeof TestTailwindElement).styles;
    });

    afterEach(() => {
      document.body.removeChild(element);
    });

    testCases.forEach(({description, index, expected}) => {
      it(`should ${description}`, () => {
        if (Array.isArray(styles)) {
          const stylesheet = styles[index] as CSSResult;
          expect(styles.length).toBe(4);
          expect(stylesheet.cssText).toContain(expected);
        } else {
          fail('Styles is not an array');
        }
      });
    });
  });

  describe('when styles is not an array', () => {
    let element: TestTailwindElementWithoutArray;
    let styles: CSSResultGroup | CSSStyleSheet | undefined;

    beforeEach(() => {
      element = setupElement('test-tailwind-element-without-array');
      styles = (element.constructor as typeof TestTailwindElementWithoutArray)
        .styles;
    });

    afterEach(() => {
      document.body.removeChild(element);
    });

    testCases.forEach(({description, index, expected}) => {
      it(`should ${description}`, () => {
        if (Array.isArray(styles)) {
          const stylesheet = styles[index] as CSSResult;
          expect(styles.length).toBe(4);
          expect(stylesheet.cssText).toContain(expected);
        } else {
          fail('Styles is not an array');
        }
      });
    });
  });

  describe('when styles is undefined', () => {
    let element: TestTailwindElementNoStyles;
    let styles: CSSResultGroup | CSSStyleSheet | undefined;

    beforeEach(() => {
      element = setupElement('test-tailwind-element-no-styles');
      styles = (element.constructor as typeof TestTailwindElementNoStyles)
        .styles;
    });

    afterEach(() => {
      document.body.removeChild(element);
    });

    testCases.slice(0, 3).forEach(({description, index, expected}) => {
      it(`should ${description}`, () => {
        if (Array.isArray(styles)) {
          const stylesheet = styles[index] as CSSResult;
          expect(styles.length).toBe(3);
          expect(stylesheet.cssText).toContain(expected);
        } else {
          fail('Styles is not an array');
        }
      });
    });
  });
});
