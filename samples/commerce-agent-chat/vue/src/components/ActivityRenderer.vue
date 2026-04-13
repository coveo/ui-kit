<script setup lang="ts">
import type {ActivityMessage} from '@core/types/agent.js';
import type {A2UISurfaceContent} from '@core/types/commerce.js';

import CommerceCatalogView from './commerce/CommerceCatalogView.vue';

defineProps<{
  activity: ActivityMessage;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  actionSelected: [prompt: string];
}>();
</script>

<template>
  <article class="activity-renderer" aria-label="Agent activity">
    <CommerceCatalogView
      v-if="activity.activityType === 'a2ui-surface'"
      :content="activity.content as unknown as A2UISurfaceContent"
      :is-loading="isLoading"
      @action-selected="emit('actionSelected', $event)"
    />
    <template v-else>
      <p class="activity-type">{{ activity.activityType }}</p>
      <pre class="activity-content">{{
        JSON.stringify(activity.content, null, 2)
      }}</pre>
    </template>
  </article>
</template>

<style scoped>
.activity-renderer {
  border: 2px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  background: rgba(22, 45, 66, 0.4);
  padding: 0.85rem;
}

.activity-type {
  margin: 0 0 0.35rem;
  color: var(--ink-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
}

.activity-content {
  margin: 0;
  white-space: pre-wrap;
}
</style>
