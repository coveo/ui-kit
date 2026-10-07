import {
  buildSpotlightContentTemplatesManager,
  type SpotlightContent,
} from '@coveo/headless/commerce';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {ItemTarget} from '@/src/components/common/layout/item-layout-utils';
import type {TemplateProviderProps} from '@/src/components/common/template-provider/template-provider';
import {SpotlightContentTemplateProvider} from './spotlight-content-template-provider';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('SpotlightContentTemplateProvider', () => {
  const registerTemplates = vi.fn();

  beforeEach(() => {
    vi.mocked(buildSpotlightContentTemplatesManager).mockReturnValue({
      registerTemplates,
      selectLinkTemplate: vi.fn(),
      selectTemplate: vi.fn(),
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const registerDefaultTemplate = async (gridCellLinkTarget?: ItemTarget) => {
    spotlightContentTemplateProviderFixture({}, gridCellLinkTarget);
    await vi.runAllTimersAsync();
    return registerTemplates.mock.lastCall?.[0];
  };

  it('should call the headless #buildSpotlightContentTemplatesManager function', () => {
    spotlightContentTemplateProviderFixture();

    expect(buildSpotlightContentTemplatesManager).toHaveBeenCalled();
  });

  describe('the default template', () => {
    it('should be registered without conditions', async () => {
      const template = await registerDefaultTemplate();

      expect(template.conditions).toEqual([]);
    });

    it('should render a card with a spotlight tag', async () => {
      const {content} = await registerDefaultTemplate();

      const card = content.querySelector('.spotlight-content-card');
      const tag = card?.querySelector('.spotlight-content-tag');

      expect(card).not.toBeNull();
      expect(tag?.querySelector('atomic-commerce-text')).toHaveAttribute('value', 'spotlight');
      expect(tag?.querySelector('[aria-hidden="true"] svg')).not.toBeNull();
    });

    it('should render the image and the name of the spotlight content', async () => {
      const {content} = await registerDefaultTemplate();

      const body = content.querySelector('.spotlight-content-body');

      expect(body?.querySelector('atomic-product-image')).not.toBeNull();
      expect(body?.querySelector('.spotlight-content-name')).toHaveAttribute('field', 'name');
    });

    it('should render a "see more" link that includes the name for assistive technologies', async () => {
      const {content} = await registerDefaultTemplate();

      const link = content.querySelector('atomic-product-link.spotlight-content-call-to-action');

      expect(link?.querySelector(':scope > atomic-commerce-text')).toHaveAttribute(
        'value',
        'see-more'
      );
      expect(
        link?.querySelector('.spotlight-content-visually-hidden atomic-product-text')
      ).toHaveAttribute('field', 'name');
      expect(link?.querySelector('[aria-hidden="true"] svg')).not.toBeNull();
    });

    it('should not render the description', async () => {
      const {content} = await registerDefaultTemplate();

      expect(content.querySelector('[field="description"]')).toBeNull();
    });

    it('should pass the grid cell link target to the link template', async () => {
      const {linkContent} = await registerDefaultTemplate('_blank');

      expect(linkContent.querySelector('atomic-product-link a[slot="attributes"]')).toHaveAttribute(
        'target',
        '_blank'
      );
    });
  });

  const spotlightContentTemplateProviderFixture = (
    props: Partial<TemplateProviderProps<SpotlightContent>> = {},
    gridCellLinkTarget?: ItemTarget
  ) => {
    return new SpotlightContentTemplateProvider(
      {
        getResultTemplateRegistered: vi.fn(),
        getTemplateHasError: vi.fn(),
        setTemplateHasError: vi.fn(),
        templateElements: [],
        includeDefaultTemplate: true,
        setResultTemplateRegistered: vi.fn(),
        ...props,
      },
      gridCellLinkTarget
    );
  };
});
