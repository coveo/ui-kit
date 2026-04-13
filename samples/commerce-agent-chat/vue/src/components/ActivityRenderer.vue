<script setup lang="ts">
import {onMounted, onUnmounted, ref, watchEffect} from 'vue';
import type {ActivityMessage} from '@core/types/agent.js';

const props = defineProps<{
  activity: ActivityMessage;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  actionSelected: [prompt: string];
}>();

interface CommerceActionClickEvent extends CustomEvent<{prompt: string}> {}

interface ActivityRendererElement extends HTMLElement {
  activity: ActivityMessage;
  isLoading: boolean;
}

const elementRef = ref<ActivityRendererElement | null>(null);

watchEffect(() => {
  if (elementRef.value) {
    elementRef.value.activity = props.activity;
    elementRef.value.isLoading = props.isLoading ?? false;
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
  <cac-activity-renderer ref="elementRef" />
</template>
