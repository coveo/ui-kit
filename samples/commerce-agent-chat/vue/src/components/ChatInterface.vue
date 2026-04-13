<script setup lang="ts">
import type {CommerceConfig} from '@core/config/env.js';

import {useChat} from '../composables/useChat.js';
import MessageInput from './MessageInput.vue';
import MessageList from './MessageList.vue';

const props = defineProps<{config: CommerceConfig}>();
const {state, sendMessage, clearMessages, dismissError} = useChat(props.config);
</script>

<template>
  <cac-chat-interface
    heading="Commerce Agent Chat (Vue)"
    :error="state.error ?? ''"
    @clear="clearMessages"
    @dismiss-error="dismissError"
  >
    <MessageList
      slot="messages"
      :messages="state.messages"
      :is-loading="state.isLoading"
      :progress-steps="state.progressSteps"
      @action-selected="sendMessage"
    />
    <MessageInput
      slot="input"
      :disabled="state.isLoading"
      @send="sendMessage"
    />
  </cac-chat-interface>
</template>
