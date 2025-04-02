<script setup lang="ts">
const props = defineProps({
  label: String,
  field: String,
});
</script>

<template>
  <atomic-text :value="props.label"></atomic-text>:
  <atomic-result-text :field="props.field"></atomic-result-text>
</template>
