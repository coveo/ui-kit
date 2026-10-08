import {css, html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
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

  pagerFit = new PagerFitController(this);

  render() {
    const numberOfPages = this.pagerFit.getNumberOfPagesToDisplay(5);
    return html`<div part="buttons">
      <button part="previous-button"></button>
      ${Array.from({length: numberOfPages}, () => html`<button part="page-button"></button>`)}
      <button part="next-button"></button>
    </div>`;
  }
}

describe('PagerFitController', () => {
  const renderPager = async (width: number) => {
    const container = document.createElement('div');
    container.style.width = `${width}px`;
    const element = await fixture<TestPagerFitElement>(
      html`<test-pager-fit></test-pager-fit>`,
      container
    );
    return {element, container};
  };

  const getPageButtonCount = (element: TestPagerFitElement) =>
    element.shadowRoot!.querySelectorAll('[part="page-button"]').length;

  const isOnSingleRow = (element: TestPagerFitElement) => {
    const buttons = Array.from(element.shadowRoot!.querySelectorAll('button'));
    return new Set(buttons.map((button) => button.offsetTop)).size === 1;
  };

  it('should display all page buttons when they fit', async () => {
    const {element} = await renderPager(400);

    await expect.poll(() => getPageButtonCount(element)).toBe(5);
    expect(isOnSingleRow(element)).toBe(true);
  });

  it('should drop page buttons until they fit on a single row', async () => {
    const {element} = await renderPager(272);

    await expect.poll(() => getPageButtonCount(element)).toBe(3);
    expect(isOnSingleRow(element)).toBe(true);
  });

  it('should always display at least one page button', async () => {
    const {element} = await renderPager(100);

    await expect.poll(() => getPageButtonCount(element)).toBe(1);
  });

  it('should drop page buttons when the parent shrinks', async () => {
    const {element, container} = await renderPager(400);
    await expect.poll(() => getPageButtonCount(element)).toBe(5);

    container.style.width = '272px';

    await expect.poll(() => getPageButtonCount(element)).toBe(3);
    expect(isOnSingleRow(element)).toBe(true);
  });

  it('should display all page buttons again when the parent grows', async () => {
    const {element, container} = await renderPager(272);
    await expect.poll(() => getPageButtonCount(element)).toBe(3);

    container.style.width = '400px';

    await expect.poll(() => getPageButtonCount(element)).toBe(5);
  });
});
