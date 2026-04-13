import '@coveo/commerce-agent-chat-components/register';
import '@core/styles/base.css';
import './styles.css';

import {loadConfig} from '@coveo/commerce-agent-chat-core/config/env';
import {ChatSessionOrchestrator} from '@coveo/commerce-agent-chat-core/lib/chatSessionOrchestrator';
import type {
  ChatState,
  Message,
} from '@coveo/commerce-agent-chat-core/types/agent';

interface MessageSendEvent extends CustomEvent<{content: string}> {}
interface CommerceActionClickEvent extends CustomEvent<{prompt: string}> {}

interface CacMessageListElement extends HTMLElement {
  messages: Message[];
  isLoading: boolean;
  progressSteps: string[];
}

interface CacMessageInputElement extends HTMLElement {
  disabled: boolean;
}

const app = getAppRoot();

boot();

function boot() {
  let configError: string | null = null;
  let config: ReturnType<typeof loadConfig> | null = null;

  try {
    config = loadConfig();
  } catch (error) {
    configError =
      error instanceof Error ? error.message : 'Configuration failed';
  }

  if (configError) {
    renderStateCard('Configuration Error', configError, true);
    return;
  }

  if (!config) {
    renderStateCard('Loading configuration...', '', false);
    return;
  }

  mountChat(config);
}

function getAppRoot(): HTMLDivElement {
  const appRoot = document.querySelector<HTMLDivElement>('#app');
  if (!appRoot) {
    throw new Error('Application root #app was not found.');
  }

  return appRoot;
}

function renderStateCard(title: string, body: string, isError: boolean) {
  app.innerHTML = `
    <main class="state-screen" ${isError ? 'role="alert"' : 'aria-live="polite"'}>
      <section class="state-card">
        <h1>${escapeHtml(title)}</h1>
        ${body ? `<pre>${escapeHtml(body)}</pre>` : ''}
      </section>
    </main>
  `;
}

function mountChat(config: ReturnType<typeof loadConfig>) {
  const orchestrator = new ChatSessionOrchestrator(config);

  app.innerHTML = `
    <main class="chat-shell">
      <section class="chat-container" aria-label="Commerce Agent Chat (Vanilla)">
        <header class="chat-header">
          <h1>Commerce Agent Chat (Vanilla)</h1>
          <button class="clear-button" type="button">Clear</button>
        </header>
        <cac-message-list></cac-message-list>
        <section class="error-banner" role="alert" hidden>
          <p></p>
          <button type="button">Dismiss</button>
        </section>
        <cac-message-input></cac-message-input>
      </section>
    </main>
  `;

  const messageList =
    app.querySelector<CacMessageListElement>('cac-message-list');
  const messageInput =
    app.querySelector<CacMessageInputElement>('cac-message-input');
  const clearButton = app.querySelector<HTMLButtonElement>('.clear-button');
  const errorBanner = app.querySelector<HTMLElement>('.error-banner');
  const errorText = errorBanner?.querySelector<HTMLParagraphElement>('p');
  const dismissButton = errorBanner?.querySelector<HTMLButtonElement>('button');

  if (
    !messageList ||
    !messageInput ||
    !clearButton ||
    !errorBanner ||
    !errorText ||
    !dismissButton
  ) {
    throw new Error(
      'Vanilla chat shell failed to initialize required elements.'
    );
  }

  const render = (state: ChatState) => {
    const hasError = Boolean(state.error?.trim());

    messageList.messages = state.messages;
    messageList.isLoading = state.isLoading;
    messageList.progressSteps = state.progressSteps;
    messageInput.disabled = state.isLoading;

    errorText.textContent = hasError ? state.error! : '';
    errorBanner.hidden = !hasError;
  };

  const unsubscribe = orchestrator.subscribe(({state}: {state: ChatState}) => {
    render(state);
  });

  const handleMessageSend = (event: Event) => {
    const message = (event as MessageSendEvent).detail.content;
    orchestrator.sendMessage(message);
  };

  const handleActionClick = (event: Event) => {
    const prompt = (event as CommerceActionClickEvent).detail.prompt;
    orchestrator.sendMessage(prompt);
  };

  messageInput.addEventListener('message-send', handleMessageSend);
  messageList.addEventListener('commerce-action-click', handleActionClick);
  clearButton.addEventListener('click', () => orchestrator.clearMessages());
  dismissButton.addEventListener('click', () => orchestrator.dismissError());

  window.addEventListener(
    'beforeunload',
    () => {
      messageInput.removeEventListener('message-send', handleMessageSend);
      messageList.removeEventListener(
        'commerce-action-click',
        handleActionClick
      );
      unsubscribe();
      orchestrator.dispose();
    },
    {once: true}
  );
}

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
