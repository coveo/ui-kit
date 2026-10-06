import type {InteractiveSpotlightContent, SpotlightContent} from '@coveo/headless/commerce';
import type {AtomicProductLink} from '@/src/components/commerce/atomic-product-link/atomic-product-link';
import type {AtomicProductText} from '@/src/components/commerce/atomic-product-text/atomic-product-text';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import type {ItemDisplayLayout} from '@/src/components/common/layout/item-layout-utils';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFakeInteractiveSpotlightContent} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/interactive-spotlight-content';
import {buildFakeSpotlightContent} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/spotlight-content';
import {AtomicSpotlightContent} from './atomic-spotlight-content';
import './atomic-spotlight-content';

describe('atomic-spotlight-content', () => {
  const toFragment = (markup: string) => {
    const template = document.createElement('template');
    template.innerHTML = markup;
    return template.content;
  };

  const renderSpotlightContent = async ({
    spotlightContent = buildFakeSpotlightContent({name: 'Summer sale'}),
    content = toFragment('<atomic-product-text field="name"></atomic-product-text>'),
    linkContent = toFragment('<atomic-product-link></atomic-product-link>'),
    display = 'grid',
    renderingFunction,
    loadingFlag,
    interactiveSpotlightContent = buildFakeInteractiveSpotlightContent(),
  }: {
    spotlightContent?: SpotlightContent;
    content?: ParentNode;
    linkContent?: ParentNode;
    display?: ItemDisplayLayout;
    renderingFunction?: AtomicSpotlightContent['renderingFunction'];
    loadingFlag?: string;
    interactiveSpotlightContent?: InteractiveSpotlightContent;
  } = {}) => {
    const unsetLoadingFlag = vi.fn();
    const {element} = await renderInAtomicCommerceInterface<AtomicSpotlightContent>({
      template: html`<atomic-spotlight-content
        .spotlightContent=${spotlightContent}
        .interactiveSpotlightContent=${interactiveSpotlightContent}
        .content=${content}
        .linkContent=${linkContent}
        .display=${display}
        .renderingFunction=${renderingFunction}
        .loadingFlag=${loadingFlag}
      ></atomic-spotlight-content>`,
      selector: 'atomic-spotlight-content',
      bindings: (bindings) => {
        bindings.store.unsetLoadingFlag = unsetLoadingFlag;
        return bindings;
      },
    });
    element.store = {unsetLoadingFlag} as never;
    await element.updateComplete;
    return {element, unsetLoadingFlag};
  };

  it('should be defined', async () => {
    const {element} = await renderSpotlightContent();

    expect(element).toBeInstanceOf(AtomicSpotlightContent);
  });

  it('should render the template content', async () => {
    const {element} = await renderSpotlightContent();

    expect(element.shadowRoot!.querySelector('.result-root atomic-product-text')).not.toBeNull();
  });

  it('should render the link content in the link container', async () => {
    const {element} = await renderSpotlightContent();

    expect(
      element.shadowRoot!.querySelector('.link-container > atomic-product-link')
    ).not.toBeNull();
  });

  it('should provide the spotlight content to the template components', async () => {
    const {element} = await renderSpotlightContent();
    const text = element.shadowRoot!.querySelector<AtomicProductText>(
      '.result-root atomic-product-text'
    )!;
    await text.updateComplete;

    await expect
      .poll(() => text.querySelector('atomic-commerce-text')?.getAttribute('value'))
      .toBe('Summer sale');
  });

  it('should provide the interactive spotlight content to atomic-product-link', async () => {
    const interactiveSpotlightContent = buildFakeInteractiveSpotlightContent();
    const {element} = await renderSpotlightContent({
      content: toFragment('<atomic-product-link></atomic-product-link>'),
      interactiveSpotlightContent,
    });
    const link = element.shadowRoot!.querySelector<AtomicProductLink>(
      '.result-root atomic-product-link'
    )!;
    await link.updateComplete;
    const anchor = link.querySelector('a')!;
    anchor.addEventListener('click', (event) => event.preventDefault());

    anchor.click();

    expect(anchor).toHaveAttribute('href', 'https://example.com/spotlight');
    expect(interactiveSpotlightContent.select).toHaveBeenCalled();
  });

  it('should click the link container when the display is "grid"', async () => {
    const {element} = await renderSpotlightContent({display: 'grid'});
    const clickLinkContainer = vi.fn();
    element.clickLinkContainer = clickLinkContainer;

    element.dispatchEvent(new MouseEvent('click'));

    expect(clickLinkContainer).toHaveBeenCalled();
  });

  it('should not click the link container when the display is "list"', async () => {
    const {element} = await renderSpotlightContent({display: 'list'});
    const clickLinkContainer = vi.fn();
    element.clickLinkContainer = clickLinkContainer;

    element.dispatchEvent(new MouseEvent('click'));

    expect(clickLinkContainer).not.toHaveBeenCalled();
  });

  it('should call the rendering function with the spotlight content', async () => {
    const spotlightContent = buildFakeSpotlightContent();
    const renderingFunction = vi.fn().mockReturnValue('');

    await renderSpotlightContent({spotlightContent, renderingFunction});

    expect(renderingFunction).toHaveBeenCalledWith(
      spotlightContent,
      expect.any(HTMLElement),
      expect.any(HTMLElement)
    );
  });

  it('should unset the loading flag on first update', async () => {
    const {element, unsetLoadingFlag} = await renderSpotlightContent({loadingFlag: 'flag'});

    (element as unknown as {firstUpdated(map: Map<string, unknown>): void}).firstUpdated(new Map());

    expect(unsetLoadingFlag).toHaveBeenCalledWith('flag');
  });
});
