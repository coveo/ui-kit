<script setup lang="ts">
import {onMounted, onUnmounted, ref, watchEffect} from 'vue';

const props = defineProps<{
  disabled: boolean;
}>();

const emit = defineEmits<{
  send: [content: string];
}>();

interface MessageSendEvent extends CustomEvent<{content: string}> {}

interface MessageInputElement extends HTMLElement {
  disabled: boolean;
}

const elementRef = ref<MessageInputElement | null>(null);

watchEffect(() => {
  if (elementRef.value) {
    elementRef.value.disabled = props.disabled;
  }
});

function handleSend(event: Event) {
  emit('send', (event as MessageSendEvent).detail.content);
}

onMounted(() => {
  elementRef.value?.addEventListener('message-send', handleSend);
});

onUnmounted(() => {
  elementRef.value?.removeEventListener('message-send', handleSend);
});
</script>

<template>
  <cac-message-input ref="elementRef" />
</template>
