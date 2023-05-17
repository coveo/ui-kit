<script setup lang="ts">
const props = defineProps({
  label: String,
  field: String,
});
</script>

<template>
  <atomic-text :value="props.label"></atomic-text>:
  <atomic-result-multi-value-text
    :field="props.field"
  ></atomic-result-multi-value-text>
</template>
