import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {fixtureCleanup} from '@/vitest-utils/testing-helpers/fixture-wrapper';
import {html, nothing, TemplateResult} from 'lit';
import {beforeEach, describe, expect, test, vi} from 'vitest';
import {GridLayoutProps, renderGridLayout} from './grid-layout';

describe('renderGridLayout', () => {
  const setupElement = async (
    props: Partial<GridLayoutProps>,
    children?: TemplateResult
  ) => {
    return await renderFunctionFixture(
      html`${renderGridLayout({
        props: {
          item: props.item || {clickUri: 'uri', title: 'title'},
          selectorForItem: props.selectorForItem || '#test-child',
          setRef: props.setRef || (() => {}),
        },
      })(children || nothing)}`
    );
  };

  beforeEach(() => {
    fixtureCleanup();
  });

  test('should render 1 element', async () => {
    const element = await setupElement({});

    const renderedElements = element.querySelectorAll('*');

    expect(renderedElements.length).toBe(1);
  });

  test('should render with correct part', async () => {
    const element = await setupElement({});

    const renderedElement = element.querySelector('*');

    expect(
      renderedElement?.part.contains('result-list-grid-clickable-container')
    ).toBe(true);

    expect(renderedElement?.part.contains('outline')).toBe(true);
  });

  test('should render children', async () => {
    const children = html`<div id="test-child"></div>`;
    const element = await setupElement({}, children);

    const renderedElement = element.querySelector('*');

    const renderedChildren = renderedElement?.querySelectorAll('*');

    expect(renderedChildren?.length).toBe(1);
    expect(renderedChildren?.[0]?.id).toBe('test-child');
  });

  test('should call #setRef with rendered element', async () => {
    const setRef = vi.fn();
    const element = await setupElement({setRef});

    const renderedElement = element.querySelector('*');

    expect(setRef).toHaveBeenCalledWith(renderedElement);
  });

  test('when clicked, should click child element matching #selectorForItem', async () => {
    const childClickHandler = vi.fn();
    const children = html`<button
      @click=${childClickHandler as Function}
      id="test-child"
    ></button>`;
    const element = await setupElement(
      {
        selectorForItem: '#test-child',
      },
      children
    );

    const renderedElement = element.querySelector('*');

    (renderedElement as HTMLElement).click();
    expect(childClickHandler).toHaveBeenCalled();
  });
});
