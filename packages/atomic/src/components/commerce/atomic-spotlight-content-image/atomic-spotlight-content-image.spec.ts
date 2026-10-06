import type {SpotlightContent} from '@coveo/headless/commerce';
import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderInAtomicSpotlightContent} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-spotlight-content-fixture';
import {buildFakeSpotlightContent} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/spotlight-content';
import type {AtomicSpotlightContentImage} from './atomic-spotlight-content-image';
import './atomic-spotlight-content-image';

describe('atomic-spotlight-content-image', () => {
  const renderImage = async (spotlightContent: SpotlightContent | undefined) => {
    const {element} = await renderInAtomicSpotlightContent<AtomicSpotlightContentImage>({
      template: html`<atomic-spotlight-content-image></atomic-spotlight-content-image>`,
      selector: 'atomic-spotlight-content-image',
      spotlightContent,
      bindings: (bindings) => {
        bindings.store.state.mobileBreakpoint = '900px';
        return bindings;
      },
    });
    return {
      element,
      image: element.shadowRoot!.querySelector<HTMLImageElement>('[part="image"]'),
      source: element.shadowRoot!.querySelector<HTMLSourceElement>('source'),
    };
  };

  it('should render the desktop image', async () => {
    const {image} = await renderImage(
      buildFakeSpotlightContent({desktopImage: 'https://example.com/d.jpg'})
    );

    expect(image).toHaveAttribute('src', 'https://example.com/d.jpg');
  });

  it('should render the mobile image below the interface mobile breakpoint', async () => {
    const {source} = await renderImage(
      buildFakeSpotlightContent({mobileImage: 'https://example.com/m.jpg'})
    );

    expect(source).toHaveAttribute('srcset', 'https://example.com/m.jpg');
    expect(source).toHaveAttribute('media', '(width < 900px)');
  });

  it('should not render a mobile source when there is no mobile image', async () => {
    const {source} = await renderImage(buildFakeSpotlightContent({mobileImage: undefined}));

    expect(source).toBeNull();
  });

  it('should use the alt text as the image alt', async () => {
    const {image} = await renderImage(buildFakeSpotlightContent({altText: 'Summer sale'}));

    expect(image).toHaveAttribute('alt', 'Summer sale');
  });

  it('should fall back to the name as the image alt', async () => {
    const {image} = await renderImage(
      buildFakeSpotlightContent({altText: undefined, name: 'Promo'})
    );

    expect(image).toHaveAttribute('alt', 'Promo');
  });

  it('should not render an unsafe image URL', async () => {
    const {image} = await renderImage(
      buildFakeSpotlightContent({desktopImage: 'javascript:alert(1)'})
    );

    expect(image).toHaveAttribute('src', '');
  });

  it('should render an error when outside of an atomic-spotlight-content element', async () => {
    const {element} = await renderImage(undefined);

    expect(element.shadowRoot!.querySelector('[part="image"]')).toBeNull();
  });
});
