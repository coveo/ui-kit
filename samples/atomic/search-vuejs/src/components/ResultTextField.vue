<script setup lang="ts">
const _props = defineProps({
  field: String,
  label: String,
});
</script>

<template>
  <atomic-text :value="_props.label"></atomic-text>:
  <atomic-result-text :field="_props.field"></atomic-result-text>
</template>
