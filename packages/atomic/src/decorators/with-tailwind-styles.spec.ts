import {
  type CSSResult,
  type CSSResultGroup,
  html,
  LitElement,
  unsafeCSS,
} from 'lit';
import {customElement} from 'lit/decorators.js';
import {beforeAll, beforeEach, describe, expect, it} from 'vitest';
import theme from '@/src/utils/coveo.tw.css';
import globalStyles from '@/src/utils/tailwind.global.tw.css';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {withTailwindStyles} from './with-tailwind-styles';

// Remove any global CSS injected in setup before running this suite
beforeAll(() => {
  document.head
    .querySelectorAll('style, link[rel="stylesheet"]')
    .forEach((el) => el.remove());
});

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
    return html`<div class="rounded-3xl border">Test Element</div>`;
  }
}

@customElement('test-tailwind-element-without-array')
@withTailwindStyles
class TestTailwindElementWithoutArray extends LitElement {
  static styles: CSSResultGroup | CSSStyleSheet | undefined =
    unsafeCSS(componentStyles);

  render() {
    return html`<div class="rounded-3xl border">
      Test Element Without Array
    </div>`;
  }
}

@customElement('test-tailwind-element-no-styles')
@withTailwindStyles
class TestTailwindElementNoStyles extends LitElement {
  render() {
    return html`<div class="rounded-3xl border">Test Element No Styles</div>`;
  }
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
      description: 'preserve existing styles of the component',
      index: 2,
      expected: componentStyles,
    },
  ];

  describe('when styles is an array', () => {
    let styles: CSSResultGroup | CSSStyleSheet | undefined;

    beforeEach(async () => {
      await fixture<TestTailwindElement>(
        html`<test-tailwind-element></test-tailwind-element>`
      );
    });

    testCases.forEach(({description, index, expected}) => {
      it(`should ${description}`, () => {
        if (Array.isArray(styles)) {
          const stylesheet = styles[index] as CSSResult;
          expect(styles.length).toBe(4);
          expect(stylesheet.cssText).toContain(expected);
        }
      });
    });
  });

  describe('when styles is not an array', () => {
    let styles: CSSResultGroup | CSSStyleSheet | undefined;

    beforeEach(async () => {
      await fixture<TestTailwindElementWithoutArray>(
        html`<test-tailwind-element-without-array></test-tailwind-element-without-array>`
      );
    });

    testCases.forEach(({description, index, expected}) => {
      it(`should ${description}`, () => {
        if (Array.isArray(styles)) {
          const stylesheet = styles[index] as CSSResult;
          expect(styles.length).toBe(4);
          expect(stylesheet.cssText).toContain(expected);
        }
      });
    });
  });

  describe('when styles is undefined', () => {
    let styles: CSSResultGroup | CSSStyleSheet | undefined;

    beforeEach(async () => {
      await fixture<TestTailwindElementNoStyles>(
        html`<test-tailwind-element-no-styles></test-tailwind-element-no-styles>`
      );
    });

    testCases.slice(0, 3).forEach(({description, index, expected}) => {
      it(`should ${description}`, () => {
        if (Array.isArray(styles)) {
          const stylesheet = styles[index] as CSSResult;
          expect(styles.length).toBe(3);
          expect(stylesheet.cssText).toContain(expected);
        }
      });
    });
  });

  it('should adopt Tailwind properties stylesheet on document', async () => {
    await fixture(html`<test-tailwind-element></test-tailwind-element>`);

    expect(document.adoptedStyleSheets.length).toBe(1);
  });

  it('should not adopt properties more than once', async () => {
    await fixture(html`
      <test-tailwind-element></test-tailwind-element>
      <test-tailwind-element-without-array></test-tailwind-element-without-array>
      <test-tailwind-element-no-styles></test-tailwind-element-no-styles>
    `);

    expect(document.adoptedStyleSheets.length).toBe(1);
  });

  it('should style all element types with the injected Tailwind properties', async () => {
    const templates = [
      html`<test-tailwind-element></test-tailwind-element>`,
      html`<test-tailwind-element-without-array></test-tailwind-element-without-array>`,
      html`<test-tailwind-element-no-styles></test-tailwind-element-no-styles>`,
    ];
    for (const template of templates) {
      const element = await fixture(template);
      const div = element.shadowRoot?.querySelector('div');
      expect(div).toBeDefined();
      expect(getComputedStyle(div!).borderRadius).toBe('24px');
      expect(getComputedStyle(div!).borderWidth).toBe('1px');
    }
  });
});
