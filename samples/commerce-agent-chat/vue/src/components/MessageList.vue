<script setup lang="ts">
import {marked} from 'marked';
import type {Message} from '@core/types/agent.js';

import ActivityRenderer from './ActivityRenderer.vue';

const props = defineProps<{
  messages: Message[];
  isLoading: boolean;
  progressSteps: string[];
}>();

const emit = defineEmits<{
  actionSelected: [prompt: string];
}>();

function isLatestAssistant(id: string): boolean {
  const reversed = [...props.messages].reverse();
  const latestAssistant = reversed.find(
    (message) => message.role === 'assistant'
  );
  return latestAssistant?.id === id;
}
</script>

<template>
  <section
    class="message-list"
    aria-live="polite"
    aria-label="Conversation messages"
  >
    <p v-if="messages.length === 0" class="empty-state">
      🏄 Start a conversation with Zane 🤙
    </p>
    <template v-for="message in messages" :key="message.id">
      <article class="message" :class="`message-${message.role}`">
        <p class="message-role">
          {{ message.role === 'user' ? 'You' : 'Zane (Agent)' }}
        </p>
        <p
          v-if="message.role === 'user'"
          class="message-content message-content--plain"
        >
          {{
            message.content ||
            (isLoading && isLatestAssistant(message.id) ? '' : '...')
          }}
        </p>
        <!-- marked produces sanitized HTML from a trusted agent source -->
        <div
          v-else-if="message.content"
          class="message-content message-content--markdown"
          v-html="marked(message.content, {async: false}) as string"
        />
        <ul
          v-if="
            isLoading &&
            isLatestAssistant(message.id) &&
            progressSteps.length > 0
          "
          class="agent-progress__steps"
        >
          <li
            v-for="(step, index) in progressSteps"
            :key="`${step}-${index}`"
            class="agent-progress__step"
            :class="{
              'agent-progress__step--active':
                index === progressSteps.length - 1,
            }"
          >
            {{ step }}
          </li>
        </ul>
      </article>
      <ActivityRenderer
        v-for="activity in message.activities ?? []"
        :key="activity.id"
        :activity="activity"
        :is-loading="isLoading && isLatestAssistant(message.id)"
        @action-selected="emit('actionSelected', $event)"
      />
    </template>
  </section>
</template>

<style scoped>
.message-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding: 1rem 1.25rem;
  min-height: 0;
  overflow: auto;
}

.message {
  max-width: min(80ch, 88%);
  padding: 0.9rem 1.1rem;
  border-radius: 14px;
  border: 1px solid transparent;
}

.message-user {
  align-self: flex-end;
  background: linear-gradient(
    135deg,
    rgba(0, 168, 204, 0.2) 0%,
    rgba(0, 212, 255, 0.15) 100%
  );
  border-color: rgba(0, 212, 255, 0.5);
}

.message-assistant {
  align-self: flex-start;
  background: linear-gradient(
    135deg,
    rgba(22, 45, 66, 0.6) 0%,
    rgba(26, 58, 82, 0.4) 100%
  );
  border-color: rgba(0, 212, 255, 0.3);
}

.message-role {
  margin: 0 0 0.25rem;
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ink-muted);
}

.message-content {
  margin: 0;
  line-height: 1.5;
}

.agent-progress__steps {
  margin: 0.5rem 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.agent-progress__step {
  font-size: 0.8rem;
  color: var(--accent);
  opacity: 0.5;
}

.agent-progress__step--active {
  opacity: 1;
  font-weight: 500;
}

.empty-state {
  flex: 1;
  display: grid;
  place-items: center;
  margin: 0;
  text-align: center;
  color: var(--ink-muted);
}
</style>
