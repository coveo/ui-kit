<script setup lang="ts">
import {onMounted, onUnmounted, ref, watchEffect} from 'vue';
import type {Message} from '@core/types/agent.js';

interface CommerceActionClickEvent extends CustomEvent<{prompt: string}> {}

interface MessageListElement extends HTMLElement {
  messages: Message[];
  isLoading: boolean;
  progressSteps: string[];
}

const props = defineProps<{
  messages: Message[];
  isLoading: boolean;
  progressSteps: string[];
}>();

const emit = defineEmits<{
  actionSelected: [prompt: string];
}>();

const elementRef = ref<MessageListElement | null>(null);

watchEffect(() => {
  if (elementRef.value) {
    elementRef.value.messages = props.messages;
    elementRef.value.isLoading = props.isLoading;
    elementRef.value.progressSteps = props.progressSteps;
  }
});

function handleActionClick(event: Event) {
  emit('actionSelected', (event as CommerceActionClickEvent).detail.prompt);
}

onMounted(() => {
  elementRef.value?.addEventListener(
    'commerce-action-click',
    handleActionClick
  );
});

onUnmounted(() => {
  elementRef.value?.removeEventListener(
    'commerce-action-click',
    handleActionClick
  );
});
</script>

<template>
  <cac-message-list ref="elementRef" />
</template>
