import type {InteractiveSpotlightContent, SpotlightContent} from '@coveo/headless/commerce';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {buildFakeInteractiveSpotlightContent} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/interactive-spotlight-content';
import {buildFakeSpotlightContent} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/spotlight-content';
import {AtomicCommerceSpotlightContent} from './atomic-commerce-spotlight-content';
import './atomic-commerce-spotlight-content';

describe('atomic-commerce-spotlight-content', () => {
  const renderSpotlightContent = async ({
    spotlightContent = buildFakeSpotlightContent(),
    interactiveSpotlightContent = buildFakeInteractiveSpotlightContent(),
    mobileBreakpoint = '768px',
    logger = {warn: vi.fn()},
  }: {
    spotlightContent?: SpotlightContent;
    interactiveSpotlightContent?: InteractiveSpotlightContent;
    mobileBreakpoint?: string;
    logger?: {warn: ReturnType<typeof vi.fn>};
  } = {}) => {
    const element = await fixture<AtomicCommerceSpotlightContent>(
      html`<atomic-commerce-spotlight-content
        .spotlightContent=${spotlightContent}
        .interactiveSpotlightContent=${interactiveSpotlightContent}
        .mobileBreakpoint=${mobileBreakpoint}
        .logger=${logger}
      ></atomic-commerce-spotlight-content>`
    );

    const qs = <T extends Element>(selector: string) =>
      element.shadowRoot!.querySelector<T>(selector);

    return {
      element,
      interactiveSpotlightContent,
      logger,
      link: qs<HTMLAnchorElement>('[part="link"]'),
      image: qs<HTMLImageElement>('[part="image"]'),
      source: qs<HTMLSourceElement>('source'),
      body: qs<HTMLElement>('[part="body"]'),
      name: qs<HTMLElement>('[part="name"]'),
      description: qs<HTMLElement>('[part="description"]'),
    };
  };

  it('should be defined', async () => {
    const {element} = await renderSpotlightContent();

    expect(element).toBeInstanceOf(AtomicCommerceSpotlightContent);
  });

  it('should render nothing when the spotlight content is missing', async () => {
    const element = await fixture<AtomicCommerceSpotlightContent>(
      html`<atomic-commerce-spotlight-content></atomic-commerce-spotlight-content>`
    );

    expect(element.shadowRoot!.querySelector('[part="link"]')).toBeNull();
  });

  it('should render a link to the click URI', async () => {
    const {link} = await renderSpotlightContent({
      spotlightContent: buildFakeSpotlightContent({clickUri: 'https://example.com/promo'}),
    });

    expect(link).toHaveAttribute('href', 'https://example.com/promo');
  });

  it('should not render an unsafe click URI', async () => {
    const {link} = await renderSpotlightContent({
      spotlightContent: buildFakeSpotlightContent({clickUri: 'javascript:alert(1)'}),
    });

    expect(link).toHaveAttribute('href', '');
  });

  it('should render the desktop image', async () => {
    const {image} = await renderSpotlightContent({
      spotlightContent: buildFakeSpotlightContent({desktopImage: 'https://example.com/d.jpg'}),
    });

    expect(image).toHaveAttribute('src', 'https://example.com/d.jpg');
  });

  it('should render the mobile image for viewports below the mobile breakpoint', async () => {
    const {source} = await renderSpotlightContent({
      spotlightContent: buildFakeSpotlightContent({mobileImage: 'https://example.com/m.jpg'}),
      mobileBreakpoint: '900px',
    });

    expect(source).toHaveAttribute('srcset', 'https://example.com/m.jpg');
    expect(source).toHaveAttribute('media', '(width < 900px)');
  });

  it('should not render a mobile image source when there is no mobile image', async () => {
    const {source} = await renderSpotlightContent({
      spotlightContent: buildFakeSpotlightContent({mobileImage: undefined}),
    });

    expect(source).toBeNull();
  });

  it('should use the alt text as the image alt', async () => {
    const {image} = await renderSpotlightContent({
      spotlightContent: buildFakeSpotlightContent({altText: 'Summer sale'}),
    });

    expect(image).toHaveAttribute('alt', 'Summer sale');
  });

  it('should fall back to the name as the image alt when there is no alt text', async () => {
    const {image} = await renderSpotlightContent({
      spotlightContent: buildFakeSpotlightContent({altText: undefined, name: 'Promo'}),
    });

    expect(image).toHaveAttribute('alt', 'Promo');
  });

  it('should render the name and description with their font colors', async () => {
    const {name, description} = await renderSpotlightContent({
      spotlightContent: buildFakeSpotlightContent({
        name: 'Promo',
        nameFontColor: '#ff0000',
        description: 'Great deals',
        descriptionFontColor: '#00ff00',
      }),
    });

    expect(name).toHaveTextContent('Promo');
    expect(name).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(description).toHaveTextContent('Great deals');
    expect(description).toHaveStyle({color: 'rgb(0, 255, 0)'});
  });

  it('should not render the body when there is no name nor description', async () => {
    const {body} = await renderSpotlightContent({
      spotlightContent: buildFakeSpotlightContent({name: undefined, description: undefined}),
    });

    expect(body).toBeNull();
  });

  it('should call #select on the interactive spotlight content when the link is clicked', async () => {
    const {link, interactiveSpotlightContent} = await renderSpotlightContent();
    link!.addEventListener('click', (event) => event.preventDefault());

    link!.click();

    expect(interactiveSpotlightContent.select).toHaveBeenCalled();
  });

  it('should click the link when the host is clicked', async () => {
    const {element, link} = await renderSpotlightContent();
    const clickSpy = vi.spyOn(link!, 'click').mockImplementation(() => {});

    element.click();

    expect(clickSpy).toHaveBeenCalled();
  });

  it('should log the warning message when selecting a spotlight content with missing metadata', async () => {
    const {link, logger} = await renderSpotlightContent({
      interactiveSpotlightContent: buildFakeInteractiveSpotlightContent({
        warningMessage: 'missing metadata',
      }),
    });
    link!.addEventListener('click', (event) => event.preventDefault());

    link!.click();

    expect(logger.warn).toHaveBeenCalledWith('missing metadata');
  });
});
