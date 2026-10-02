import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {describe, expect, it} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {PagerFitController} from './pager-fit-controller';

@customElement('test-pager-fit')
class TestPagerFitElement extends LitElement {
  static styles = css`
    [part='buttons'] {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    button {
      width: 40px;
      height: 40px;
      padding: 0;
      border: 0;
    }
  `;

  @property({type: Number}) numberOfPages = 5;

  pagerFit = new PagerFitController(this);

  render() {
    const numberOfPagesToDisplay = this.pagerFit.getNumberOfPagesToDisplay(this.numberOfPages);
    return html`<nav>
      <div part="buttons">
        <button part="previous-button">‹</button>
        ${Array.from(
          {length: numberOfPagesToDisplay},
          (_, index) => html`<button part="page-button">${index + 1}</button>`
        )}
        <button part="next-button">›</button>
      </div>
    </nav>`;
  }
}

describe('PagerFitController', () => {
  const renderPager = async ({
    width,
    numberOfPages = 5,
  }: {
    width: number;
    numberOfPages?: number;
  }) => {
    const container = document.createElement('div');
    container.style.width = `${width}px`;
    const element = await fixture<TestPagerFitElement>(
      html`<test-pager-fit .numberOfPages=${numberOfPages}></test-pager-fit>`,
      container
    );
    return {element, container};
  };

  const getPageButtonCount = (element: TestPagerFitElement) =>
    element.shadowRoot!.querySelectorAll('[part="page-button"]').length;

  const isOnSingleRow = (element: TestPagerFitElement) => {
    const tops = Array.from(element.shadowRoot!.querySelectorAll('button')).map(
      (button) => button.getBoundingClientRect().top
    );
    return new Set(tops).size === 1;
  };

  it('should display all page buttons when they fit', async () => {
    const {element} = await renderPager({width: 400});

    expect(getPageButtonCount(element)).toBe(5);
    expect(isOnSingleRow(element)).toBe(true);
  });

  it('should display fewer page buttons when they do not fit', async () => {
    const {element} = await renderPager({width: 272});

    expect(getPageButtonCount(element)).toBe(3);
    expect(isOnSingleRow(element)).toBe(true);
  });

  it('should keep a page button when it fits exactly', async () => {
    const {element} = await renderPager({width: 280});

    expect(getPageButtonCount(element)).toBe(4);
    expect(isOnSingleRow(element)).toBe(true);
  });

  it('should always display at least one page button', async () => {
    const {element} = await renderPager({width: 100});

    expect(getPageButtonCount(element)).toBe(1);
  });

  it('should not display page buttons when numberOfPages is 0', async () => {
    const {element} = await renderPager({width: 100, numberOfPages: 0});

    expect(getPageButtonCount(element)).toBe(0);
  });

  it('should display fewer page buttons when the parent shrinks', async () => {
    const {element, container} = await renderPager({width: 400});

    container.style.width = '272px';

    await expect.poll(() => getPageButtonCount(element)).toBe(3);
    expect(isOnSingleRow(element)).toBe(true);
  });

  it('should display all page buttons again when the parent grows', async () => {
    const {element, container} = await renderPager({width: 272});

    container.style.width = '400px';

    await expect.poll(() => getPageButtonCount(element)).toBe(5);
  });

  it('should start from the full number of page buttons on every update', async () => {
    const {element, container} = await renderPager({width: 272});

    container.style.width = '400px';
    element.requestUpdate();
    await element.updateComplete;

    expect(getPageButtonCount(element)).toBe(5);
  });
});
