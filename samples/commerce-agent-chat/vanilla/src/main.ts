import '@coveo/commerce-agent-chat-components/register';
import '@core/styles/base.css';
import './styles.css';

import {loadConfig} from '@coveo/commerce-agent-chat-core/config/env';
import {ChatSessionOrchestrator} from '@coveo/commerce-agent-chat-core/lib/chatSessionOrchestrator';
import {toChatState} from '@coveo/commerce-agent-chat-core/lib/chatStore';
import type {
  ChatState,
  Message,
} from '@coveo/commerce-agent-chat-core/types/agent';

interface MessageSendEvent extends CustomEvent<{content: string}> {}
interface CommerceActionClickEvent extends CustomEvent<{prompt: string}> {}

interface CacChatInterfaceElement extends HTMLElement {
  error: string;
}

interface CacMessageListElement extends HTMLElement {
  messages: Message[];
  isLoading: boolean;
  progressSteps: string[];
  progressTrace: ChatState['progressTrace'];
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
  const store = orchestrator.getStore();

  app.innerHTML = `
    <cac-chat-interface heading="Commerce Agent Chat (Vanilla)">
      <cac-message-list slot="messages"></cac-message-list>
      <cac-message-input slot="input"></cac-message-input>
    </cac-chat-interface>
  `;

  const chatInterface =
    app.querySelector<CacChatInterfaceElement>('cac-chat-interface');
  const messageList =
    app.querySelector<CacMessageListElement>('cac-message-list');
  const messageInput =
    app.querySelector<CacMessageInputElement>('cac-message-input');

  if (!chatInterface || !messageList || !messageInput) {
    throw new Error(
      'Vanilla chat shell failed to initialize required elements.'
    );
  }

  const render = (state: ChatState) => {
    messageList.messages = state.messages;
    messageList.isLoading = state.isLoading;
    messageList.progressSteps = state.progressSteps;
    messageList.progressTrace = state.progressTrace;
    messageInput.disabled = state.isLoading;
    chatInterface.error = state.error ?? '';
  };

  const unsubscribe = store.subscribe((sessionState) => {
    render(toChatState(sessionState));
  });

  render(toChatState(store.getState()));

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
  chatInterface.addEventListener('clear', () => orchestrator.clearMessages());
  chatInterface.addEventListener('dismiss-error', () =>
    orchestrator.dismissError()
  );

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
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
