<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref, watchEffect} from 'vue';
import type {NextAction} from '@core/types/commerce.js';

const props = defineProps<{
  actions: NextAction[];
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  actionClick: [prompt: string];
}>();

interface NextActionsBarElement extends HTMLElement {
  actions: NextAction[];
  isLoading: boolean;
}

interface CommerceActionClickEventDetail {
  prompt: string;
}

const elementRef = ref<NextActionsBarElement | null>(null);

const onActionClick = (event: Event) => {
  const customEvent = event as CustomEvent<CommerceActionClickEventDetail>;
  emit('actionClick', customEvent.detail.prompt);
};

watchEffect(() => {
  if (elementRef.value) {
    elementRef.value.actions = props.actions;
    elementRef.value.isLoading = props.isLoading ?? false;
  }
});

onMounted(() => {
  elementRef.value?.addEventListener('commerce-action-click', onActionClick);
});

onBeforeUnmount(() => {
  elementRef.value?.removeEventListener('commerce-action-click', onActionClick);
});
</script>

<template>
  <cac-next-actions-bar ref="elementRef" />
</template>
