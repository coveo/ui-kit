import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import type {
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayLayout,
} from '@/src/components/common/layout/item-layout-utils';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import './atomic-result-placeholder';
import type {AtomicResultPlaceholder} from './atomic-result-placeholder';

describe('atomic-result-placeholder', () => {
  const renderComponent = async (props?: Partial<AtomicResultPlaceholder>) => {
    const element = await fixture<AtomicResultPlaceholder>(
      html`<atomic-result-placeholder
        .display=${props?.display || 'list'}
        .density=${props?.density || 'normal'}
        .imageSize=${props?.imageSize || 'large'}
      ></atomic-result-placeholder>`
    );

    return {
      element,
      get resultRoot() {
        return element.shadowRoot?.querySelector('.result-root');
      },
      get visual() {
        return element.shadowRoot?.querySelector(
          'atomic-result-section-visual'
        );
      },
      get badges() {
        return element.shadowRoot?.querySelector(
          'atomic-result-section-badges'
        );
      },
      get actions() {
        return element.shadowRoot?.querySelector(
          'atomic-result-section-actions'
        );
      },
      get title() {
        return element.shadowRoot?.querySelector('atomic-result-section-title');
      },
      get excerpt() {
        return element.shadowRoot?.querySelector(
          'atomic-result-section-excerpt'
        );
      },
      get excerptLines() {
        return element.shadowRoot?.querySelectorAll(
          'atomic-result-section-excerpt > div'
        );
      },
      get bottomMetadata() {
        return element.shadowRoot?.querySelector(
          'atomic-result-section-bottom-metadata'
        );
      },
      get fieldPlaceholders() {
        return element.shadowRoot?.querySelectorAll('.field-value-placeholder');
      },
    };
  };

  describe('rendering', () => {
    it('should render', async () => {
      const {element} = await renderComponent();
      await expect.element(element).toBeInTheDocument();
    });

    it('should render all section elements', async () => {
      const {visual, badges, actions, title, excerpt, bottomMetadata} =
        await renderComponent();

      expect(visual).toBeInTheDocument();
      expect(badges).toBeInTheDocument();
      expect(actions).toBeInTheDocument();
      expect(title).toBeInTheDocument();
      expect(excerpt).toBeInTheDocument();
      expect(bottomMetadata).toBeInTheDocument();
    });

    it('should render 3 excerpt lines', async () => {
      const {excerptLines} = await renderComponent();
      expect(excerptLines?.length).toBe(3);
    });

    it('should render 4 field placeholders', async () => {
      const {fieldPlaceholders} = await renderComponent();
      expect(fieldPlaceholders?.length).toBe(4);
    });

    it('should have animate-pulse class on result root', async () => {
      const {resultRoot} = await renderComponent();
      expect(resultRoot?.classList.contains('animate-pulse')).toBe(true);
    });

    it('should have placeholder class on result root', async () => {
      const {resultRoot} = await renderComponent();
      expect(resultRoot?.classList.contains('placeholder')).toBe(true);
    });

    it('should have with-sections class on result root', async () => {
      const {resultRoot} = await renderComponent();
      expect(resultRoot?.classList.contains('with-sections')).toBe(true);
    });
  });

  describe('#display property', () => {
    it.each<{display: ItemDisplayLayout}>([
      {display: 'list'},
      {display: 'grid'},
      {display: 'table'},
    ])(
      'should apply display-$display class when display is $display',
      async ({display}) => {
        const {resultRoot} = await renderComponent({display});
        const expectedClass =
          display === 'list' ? 'display-list' : `display-${display}`;
        expect(resultRoot?.classList.contains(expectedClass)).toBe(true);
      }
    );
  });

  describe('#density property', () => {
    it.each<{density: ItemDisplayDensity}>([
      {density: 'comfortable'},
      {density: 'normal'},
      {density: 'compact'},
    ])(
      'should apply density-$density class when density is $density',
      async ({density}) => {
        const {resultRoot} = await renderComponent({density});
        expect(resultRoot?.classList.contains(`density-${density}`)).toBe(true);
      }
    );
  });

  describe('#imageSize property', () => {
    it.each<{imageSize: ItemDisplayImageSize}>([
      {imageSize: 'large'},
      {imageSize: 'small'},
      {imageSize: 'icon'},
      {imageSize: 'none'},
    ])(
      'should apply image-$imageSize class when imageSize is $imageSize',
      async ({imageSize}) => {
        const {resultRoot} = await renderComponent({imageSize});
        expect(resultRoot?.classList.contains(`image-${imageSize}`)).toBe(true);
      }
    );
  });
});
