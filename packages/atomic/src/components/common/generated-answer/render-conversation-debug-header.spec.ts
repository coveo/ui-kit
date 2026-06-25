import {html} from 'lit';
import {
  beforeAll,
  beforeEach,
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  type RenderConversationDebugHeaderProps,
  renderConversationDebugHeader,
} from './render-conversation-debug-header';

vi.mock('./generated-answer-utils', () => ({
  hasClipboardSupport: vi.fn(() => true),
}));

describe('#renderConversationDebugHeader', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;
  const mockWriteText = vi.fn(() => Promise.resolve());

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('navigator', {
      clipboard: {writeText: mockWriteText},
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const renderComponent = async (
    overrides: Partial<RenderConversationDebugHeaderProps> = {}
  ) => {
    const defaultProps: RenderConversationDebugHeaderProps = {
      i18n,
      conversationId: 'test-conversation-123',
      ...overrides,
    };

    const element = await renderFunctionFixture(
      html`${renderConversationDebugHeader({props: defaultProps})}`
    );

    return {element, props: defaultProps};
  };

  it('should render the text correctly', async () => {
    const {element} = await renderComponent({
      conversationId: 'my-conv-456',
    });

    expect(element.textContent).toContain(
      i18n.t('generated-answer-debug-mode-on')
    );
    expect(element.textContent).toContain('my-conv-456');
  });

  describe('the copy button', () => {
    it('should render a copy button', async () => {
      const {element} = await renderComponent();

      const button = element.querySelector('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute(
        'title',
        i18n.t('generated-answer-copy-conversation-id')
      );
    });

    it('should copy the conversation ID to the clipboard on button click', async () => {
      const {element} = await renderComponent({
        conversationId: 'copy-me-123',
      });

      const button = element.querySelector('button')!;
      button.click();

      expect(mockWriteText).toHaveBeenCalledWith('copy-me-123');
    });

    it('should not throw on clipboard write fails', async () => {
      mockWriteText.mockRejectedValueOnce(new Error('Permission denied'));

      const {element} = await renderComponent();

      const button = element.querySelector('button')!;
      expect(() => button.click()).not.toThrow();
    });

    it('should not render the copy button when clipboard is not supported', async () => {
      const {hasClipboardSupport} = await import('./generated-answer-utils');
      vi.mocked(hasClipboardSupport).mockReturnValueOnce(false);

      const {element} = await renderComponent();

      const button = element.querySelector('button');
      expect(button).not.toBeInTheDocument();
    });
  });
});
