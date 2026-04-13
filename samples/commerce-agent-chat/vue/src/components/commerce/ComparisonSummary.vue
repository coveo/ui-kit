<script setup lang="ts">
import {ref, watchEffect} from 'vue';

interface ComparisonSummaryElement extends HTMLElement {
  text: string;
}

const props = defineProps<{text: string}>();
const elementRef = ref<ComparisonSummaryElement | null>(null);

watchEffect(() => {
  if (elementRef.value) {
    elementRef.value.text = props.text;
  }
});
</script>

<template>
  <cac-comparison-summary ref="elementRef" />
</template>
