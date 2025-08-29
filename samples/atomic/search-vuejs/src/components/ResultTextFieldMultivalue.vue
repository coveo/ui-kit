<script setup lang="ts">
const _props = defineProps({
  label: String,
  field: String,
});
</script>

<template>
  <atomic-text :value="_props.label"></atomic-text>:
  <atomic-result-multi-value-text
    :field="_props.field"
  ></atomic-result-multi-value-text>
</template>
