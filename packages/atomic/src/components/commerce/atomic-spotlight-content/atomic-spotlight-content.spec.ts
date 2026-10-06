import type {SpotlightContent} from '@coveo/headless/commerce';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import type {AtomicProductText} from '@/src/components/commerce/atomic-product-text/atomic-product-text';
import {MissingParentError} from '@/src/components/common/item-list/context/item-context-controller';
import type {ItemDisplayLayout} from '@/src/components/common/layout/item-layout-utils';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFakeInteractiveSpotlightContent} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/interactive-spotlight-content';
import {buildFakeSpotlightContent} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/spotlight-content';
import {AtomicSpotlightContent} from './atomic-spotlight-content';
import './atomic-spotlight-content';
import '@/src/components/commerce/atomic-product-text/atomic-product-text';

describe('atomic-spotlight-content', () => {
  const toFragment = (markup: string) => {
    const template = document.createElement('template');
    template.innerHTML = markup;
    return template.content;
  };

  const renderSpotlightContent = async ({
    spotlightContent = buildFakeSpotlightContent({name: 'Summer sale'}),
    content = toFragment(
      '<atomic-spotlight-content-text field="name"></atomic-spotlight-content-text>'
    ),
    linkContent = toFragment('<atomic-spotlight-content-link></atomic-spotlight-content-link>'),
    display = 'grid',
    renderingFunction,
    loadingFlag,
  }: {
    spotlightContent?: SpotlightContent;
    content?: ParentNode;
    linkContent?: ParentNode;
    display?: ItemDisplayLayout;
    renderingFunction?: AtomicSpotlightContent['renderingFunction'];
    loadingFlag?: string;
  } = {}) => {
    const unsetLoadingFlag = vi.fn();
    const {element} = await renderInAtomicCommerceInterface<AtomicSpotlightContent>({
      template: html`<atomic-spotlight-content
        .spotlightContent=${spotlightContent}
        .interactiveSpotlightContent=${buildFakeInteractiveSpotlightContent()}
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

    expect(
      element.shadowRoot!.querySelector('.result-root atomic-spotlight-content-text')
    ).not.toBeNull();
  });

  it('should render the link content in the link container', async () => {
    const {element} = await renderSpotlightContent();

    expect(
      element.shadowRoot!.querySelector('.link-container > atomic-spotlight-content-link')
    ).not.toBeNull();
  });

  it('should provide the spotlight content to spotlight content template components', async () => {
    const {element} = await renderSpotlightContent();
    const text = element.shadowRoot!.querySelector('.result-root atomic-spotlight-content-text')!;
    await (text as unknown as {updateComplete: Promise<unknown>}).updateComplete;

    expect(text.shadowRoot!.querySelector('[part="text"]')).toHaveTextContent('Summer sale');
  });

  it('should not provide the spotlight content to product template components', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const {element} = await renderSpotlightContent({
      content: toFragment('<atomic-product-text field="ec_name"></atomic-product-text>'),
    });
    const productText = element.shadowRoot!.querySelector<AtomicProductText>(
      '.result-root atomic-product-text'
    )!;
    await productText.updateComplete;

    expect(productText.error).toBeInstanceOf(MissingParentError);
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
