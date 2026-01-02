import {
  buildUserActions as buildInsightUserActions,
  type UserActionsState as InsightUserActionsState,
} from '@coveo/headless/insight';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import {fixture} from '@/vitest-utils/testing-helpers/fixture.js';
import {buildFakeInsightEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/engine.js';
import {buildFakeUserActions} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/user-actions-controller';
import type {AtomicInsightUserActionsToggle} from './atomic-insight-user-actions-toggle';
import './atomic-insight-user-actions-toggle';

vi.mock('@coveo/headless/insight', {spy: true});

describe('atomic-insight-user-actions-toggle', () => {
  let mockEngine: ReturnType<typeof buildFakeInsightEngine>;
  let element: AtomicInsightUserActionsToggle;

  beforeEach(() => {
    mockEngine = buildFakeInsightEngine();
  });

  const setupElement = async (
    props: {
      userId?: string;
      ticketCreationDateTime?: string;
      excludedCustomActions?: string[];
    } = {},
    userActionsState: Partial<InsightUserActionsState> = {}
  ) => {
    vi.mocked(buildInsightUserActions).mockReturnValue(
      buildFakeUserActions(userActionsState)
    );

    element = await fixture<AtomicInsightUserActionsToggle>(
      html`<atomic-insight-user-actions-toggle
        .userId=${props.userId ?? 'test-user'}
        .ticketCreationDateTime=${props.ticketCreationDateTime ?? '2024-01-01T00:00:00Z'}
        .excludedCustomActions=${props.excludedCustomActions ?? []}
      ></atomic-insight-user-actions-toggle>`
    );

    // Mock the bindings
    element.bindings = {
      engine: mockEngine,
      i18n: {
        t: (key: string) => {
          const translations: Record<string, string> = {
            'user-actions': 'User actions',
          };
          return translations[key] || key;
        },
      } as never,
      store: {} as never,
      interfaceElement: {} as never,
      createStyleElement: vi.fn(),
      createScriptElement: vi.fn(),
    };

    // Initialize the component
    element.initialize();
    await element.updateComplete;

    return element;
  };

  const getButton = () => element.shadowRoot?.querySelector('button');
  const getModal = () =>
    (element.getRootNode() as Document | ShadowRoot)?.querySelector(
      'atomic-insight-user-actions-modal'
    );

  describe('#initialize', () => {
    it('should call buildInsightUserActions with the engine and options', async () => {
      await setupElement({
        userId: 'test-user',
        ticketCreationDateTime: '2024-01-01T00:00:00Z',
        excludedCustomActions: ['custom-event'],
      });

      expect(buildInsightUserActions).toHaveBeenCalledWith(mockEngine, {
        options: {
          ticketCreationDate: '2024-01-01T00:00:00Z',
          excludedCustomActions: ['custom-event'],
        },
      });
    });

    it('should set this.userActions to the user actions controller', async () => {
      await setupElement();

      expect(element.userActions).toBe(
        vi.mocked(buildInsightUserActions).mock.results[0].value
      );
    });

    it('should bind state to controller', async () => {
      await setupElement(
        {},
        {
          loading: true,
          excludedCustomActions: ['test-event'],
        }
      );

      expect(element.userActionsState.loading).toBe(true);
      expect(element.userActionsState.excludedCustomActions).toEqual([
        'test-event',
      ]);
    });
  });

  describe('rendering', () => {
    it('should render the button with the correct aria-label', async () => {
      await setupElement();
      const button = getButton();

      expect(button).toHaveAttribute('aria-label', 'User actions');
    });

    it('should render the button with the correct title', async () => {
      await setupElement();
      const button = getButton();

      expect(button).toHaveAttribute('title', 'User actions');
    });

    it('should render the button with the correct part prefix', async () => {
      await setupElement();
      const container = element.shadowRoot?.querySelector(
        '[part="insight-user-actions-toggle-container"]'
      );

      expect(container).toBeInTheDocument();
    });

    it('should render the icon within the button', async () => {
      await setupElement();
      const icon = element.shadowRoot?.querySelector('atomic-icon');

      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('part', 'insight-user-actions-toggle-icon');
    });
  });

  describe('modal creation and interaction', () => {
    it('should create the modal when rendered', async () => {
      await setupElement();
      const modal = getModal();

      expect(modal).toBeInTheDocument();
    });

    it('should set the openButton of the modal to the button', async () => {
      await setupElement();
      const button = getButton();
      const modal = getModal();

      expect(modal?.openButton).toBe(button);
    });

    it('should set the userId of the modal to the component prop', async () => {
      await setupElement({userId: 'custom-user'});
      const modal = getModal();

      expect(modal?.userId).toBe('custom-user');
    });

    it('should set the ticketCreationDateTime of the modal to the component prop', async () => {
      await setupElement({ticketCreationDateTime: '2024-06-15T12:00:00Z'});
      const modal = getModal();

      expect(modal?.ticketCreationDateTime).toBe('2024-06-15T12:00:00Z');
    });

    it('should set the excludedCustomActions of the modal to the component prop', async () => {
      await setupElement({excludedCustomActions: ['action1', 'action2']});
      const modal = getModal();

      expect(modal?.excludedCustomActions).toEqual(['action1', 'action2']);
    });

    it('should open the modal when the button is clicked', async () => {
      await setupElement();
      const button = getButton();
      const modal = getModal();

      await userEvent.click(button!);

      expect(modal?.isOpen).toBe(true);
    });

    it('should call logOpenUserActions when the button is clicked', async () => {
      await setupElement();
      const logOpenUserActionsSpy = vi.spyOn(
        element.userActions,
        'logOpenUserActions'
      );
      const button = getButton();

      await userEvent.click(button!);

      expect(logOpenUserActionsSpy).toHaveBeenCalled();
    });
  });
});
