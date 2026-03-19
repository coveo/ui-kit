import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {
  renderSourceCitations,
  type SourceCitationsProps,
} from './source-citations';

describe('#renderSourceCitations', () => {
  const locators = (element: Element) => ({
    get container() {
      return element.querySelector('.source-citations');
    },
    get label() {
      return element.querySelector('[part="citations-label"]');
    },
    get list() {
      return element.querySelector('.citations-container');
    },
  });

  const renderComponent = async (
    props: Partial<SourceCitationsProps> = {},
    children: unknown = html``
  ) => {
    return await renderFunctionFixture(
      html`${renderSourceCitations({
        props: {
          label: 'Citations',
          isVisible: true,
          ...props,
        },
      })(children)}`
    );
  };

  describe('when isVisible is true', () => {
    it('should render the container', async () => {
      const element = await renderComponent({isVisible: true});
      expect(locators(element).container).toBeInTheDocument();
    });

    it('should render the label with correct text', async () => {
      const element = await renderComponent({
        isVisible: true,
        label: 'My Citations',
      });
      const label = locators(element).label;
      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent('My Citations');
    });

    it('should render the label with citations-label part', async () => {
      const element = await renderComponent({isVisible: true});
      const label = locators(element).label;
      expect(label).toHaveAttribute('part', 'citations-label');
    });

    it('should render the citations list', async () => {
      const element = await renderComponent({isVisible: true});
      const list = locators(element).list;
      expect(list).toBeInTheDocument();
    });

    it('should render children inside the list', async () => {
      const element = await renderComponent(
        {isVisible: true},
        html`<li>Citation 1</li><li>Citation 2</li>`
      );
      const list = locators(element).list;
      expect(list?.querySelectorAll('li').length).toBe(2);
    });
  });

  describe('when isVisible is false', () => {
    it('should not render the container', async () => {
      const element = await renderComponent({isVisible: false});
      expect(locators(element).container).not.toBeInTheDocument();
    });

    it('should not render the label', async () => {
      const element = await renderComponent({isVisible: false});
      expect(locators(element).label).not.toBeInTheDocument();
    });

    it('should not render the list', async () => {
      const element = await renderComponent({isVisible: false});
      expect(locators(element).list).not.toBeInTheDocument();
    });
  });
});
