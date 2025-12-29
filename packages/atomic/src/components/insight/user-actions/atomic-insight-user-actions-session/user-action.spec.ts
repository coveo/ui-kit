import type {UserAction as IUserAction} from '@coveo/headless/insight';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import type {InsightBindings} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface';
import BookmarkIcon from '@/src/images/bookmark.svg';
import DocumentIcon from '@/src/images/document.svg';
import PointIcon from '@/src/images/point.svg';
import QuickviewIcon from '@/src/images/quickview.svg';
import SearchIcon from '@/src/images/search.svg';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderUserAction} from './user-action';

vi.mock('@/src/utils/date-utils', () => ({
  parseTimestampToDateDetails: vi.fn((timestamp: number) => {
    const date = new Date(timestamp);
    return {
      hours: date.getHours(),
      minutes: date.getMinutes(),
      year: date.getFullYear(),
      month: date.toLocaleString('en', {month: 'short'}),
      day: date.getDate(),
      dayOfWeek: date.toLocaleString('en', {weekday: 'short'}),
    };
  }),
}));

describe('#renderUserAction', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const createMockBindings = (): InsightBindings => ({
    i18n,
    engine: {} as InsightBindings['engine'],
    interfaceElement: {} as InsightBindings['interfaceElement'],
  });

  const createMockAction = (
    overrides: Partial<IUserAction> = {}
  ): IUserAction =>
    ({
      actionType: 'SEARCH',
      timestamp: new Date('2024-01-01T10:30:00Z').getTime(),
      query: 'test query',
      searchHub: 'TestHub',
      ...overrides,
    }) as IUserAction;

  const renderComponent = async (
    actionOverrides: Partial<IUserAction> = {},
    bindingsOverrides: Partial<InsightBindings> = {}
  ): Promise<HTMLElement> => {
    const action = createMockAction(actionOverrides);
    const bindings = {...createMockBindings(), ...bindingsOverrides};

    return renderFunctionFixture(
      html`${renderUserAction({props: {action, bindings}})}`
    );
  };

  it('should render a list item', async () => {
    const element = await renderComponent();
    expect(element.querySelector('li')).toBeInTheDocument();
  });

  describe('icon rendering', () => {
    it('should render search icon for SEARCH action', async () => {
      const element = await renderComponent({actionType: 'SEARCH'});
      const iconElement = element.querySelector('atomic-icon');
      expect(iconElement?.['icon']).toBe(SearchIcon);
    });

    it('should render document icon for CLICK action', async () => {
      const element = await renderComponent({actionType: 'CLICK'});
      const iconElement = element.querySelector('atomic-icon');
      expect(iconElement?.['icon']).toBe(DocumentIcon);
    });

    it('should render quickview icon for VIEW action', async () => {
      const element = await renderComponent({actionType: 'VIEW'});
      const iconElement = element.querySelector('atomic-icon');
      expect(iconElement?.['icon']).toBe(QuickviewIcon);
    });

    it('should render point icon for CUSTOM action', async () => {
      const element = await renderComponent({actionType: 'CUSTOM'});
      const iconElement = element.querySelector('atomic-icon');
      expect(iconElement?.['icon']).toBe(PointIcon);
    });

    it('should render bookmark icon for TICKET_CREATION action', async () => {
      const element = await renderComponent({actionType: 'TICKET_CREATION'});
      const iconElement = element.querySelector('atomic-icon');
      expect(iconElement?.['icon']).toBe(BookmarkIcon);
    });

    it('should apply primary color class for CLICK action', async () => {
      const element = await renderComponent({actionType: 'CLICK'});
      const iconElement = element.querySelector('atomic-icon');
      expect(iconElement).toHaveClass('text-primary');
    });

    it('should apply primary color class for VIEW action', async () => {
      const element = await renderComponent({actionType: 'VIEW'});
      const iconElement = element.querySelector('atomic-icon');
      expect(iconElement).toHaveClass('text-primary');
    });

    it('should not apply primary color class for SEARCH action', async () => {
      const element = await renderComponent({actionType: 'SEARCH'});
      const iconElement = element.querySelector('atomic-icon');
      expect(iconElement).not.toHaveClass('text-primary');
    });
  });

  describe('action title rendering', () => {
    it('should render ticket created message for TICKET_CREATION action', async () => {
      await renderComponent({actionType: 'TICKET_CREATION'});
      await expect
        .element(page.getByText('ticket-created'))
        .toBeInTheDocument();
    });

    it('should render eventData value for CUSTOM action', async () => {
      await renderComponent({
        actionType: 'CUSTOM',
        eventData: {value: 'Custom Event Value'},
      });
      await expect
        .element(page.getByText('Custom Event Value'))
        .toBeInTheDocument();
    });

    it('should render eventData type for CUSTOM action when value is missing', async () => {
      await renderComponent({
        actionType: 'CUSTOM',
        eventData: {type: 'CustomType'},
      });
      await expect.element(page.getByText('CustomType')).toBeInTheDocument();
    });

    it('should render query for SEARCH action', async () => {
      await renderComponent({
        actionType: 'SEARCH',
        query: 'my search query',
      });
      await expect
        .element(page.getByText('my search query'))
        .toBeInTheDocument();
    });

    it('should render empty search message when query is empty for SEARCH action', async () => {
      await renderComponent({
        actionType: 'SEARCH',
        query: '',
      });
      await expect.element(page.getByText('empty-search')).toBeInTheDocument();
    });

    it('should render document title as link for VIEW action', async () => {
      const element = await renderComponent({
        actionType: 'VIEW',
        document: {
          title: 'Document Title',
          contentIdValue: 'https://example.com/doc',
        },
      });

      const link = element.querySelector('a');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://example.com/doc');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveTextContent('Document Title');
      expect(link).toHaveClass('text-primary');
    });

    it('should render document title as text for CLICK action', async () => {
      const element = await renderComponent({
        actionType: 'CLICK',
        document: {
          title: 'Clicked Document',
        },
      });

      await expect
        .element(page.getByText('Clicked Document'))
        .toBeInTheDocument();
      expect(element.querySelector('a')).not.toBeInTheDocument();
    });
  });

  describe('timestamp rendering', () => {
    it('should render formatted timestamp with padded hours and minutes', async () => {
      const timestamp = new Date('2024-01-01T09:05:00Z').getTime();
      await renderComponent({timestamp});

      await expect.element(page.getByText('09:05')).toBeInTheDocument();
    });

    it('should render timestamp without padding for double-digit values', async () => {
      const timestamp = new Date('2024-01-01T14:45:00Z').getTime();
      await renderComponent({timestamp});

      await expect.element(page.getByText('14:45')).toBeInTheDocument();
    });
  });

  describe('search hub rendering', () => {
    it('should render search hub', async () => {
      await renderComponent({searchHub: 'MySearchHub'});
      await expect.element(page.getByText('MySearchHub')).toBeInTheDocument();
    });
  });

  describe('visual structure', () => {
    it('should render separator line', async () => {
      const element = await renderComponent();
      const separator = element.querySelector('.user-action__separator');
      expect(separator).toBeInTheDocument();
    });

    it('should have flex layout structure', async () => {
      const element = await renderComponent();
      const listItem = element.querySelector('li');
      expect(listItem).toHaveClass('flex');
    });
  });
});
