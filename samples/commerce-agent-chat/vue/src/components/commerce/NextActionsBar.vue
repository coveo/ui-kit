<script setup lang="ts">
import type {NextAction} from '@core/types/commerce.js';

const props = defineProps<{
  actions: NextAction[];
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  actionClick: [prompt: string];
}>();
</script>

<template>
  <div
    v-if="props.actions.length > 0 || (props.isLoading ?? false)"
    class="next-actions"
    :aria-busy="(props.isLoading ?? false) || undefined"
  >
    <p class="next-actions__label">Next actions</p>
    <div class="next-actions__list">
      <template v-if="(props.isLoading ?? false) && props.actions.length === 0">
        <div
          v-for="i in 3"
          :key="`next-actions-skeleton-${i}`"
          class="next-action-btn next-action-btn--skeleton"
          aria-hidden="true"
        >
          <div
            class="commerce-loading commerce-loading--line commerce-loading--line-wide"
          />
        </div>
      </template>
      <template v-else>
        <button
          v-for="(action, i) in props.actions"
          :key="`${action.type}-${action.text}-${i}`"
          type="button"
          class="next-action-btn"
          @click="emit('actionClick', action.text)"
        >
          {{ action.text }}
          <span class="next-action-btn__badge">{{ action.type }}</span>
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.next-actions {
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: 14px;
  background: rgba(22, 45, 66, 0.4);
  padding: 0.85rem 1rem;
  backdrop-filter: blur(10px);
}

.next-actions__label {
  margin: 0 0 0.55rem;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
}

.next-actions__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.next-action-btn {
  padding: 0.55rem 1rem;
  border: 2px solid var(--accent);
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(0, 168, 204, 0.2) 0%,
    rgba(0, 212, 255, 0.1) 100%
  );
  color: var(--accent);
  font: inherit;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.2);
}

.next-action-btn--skeleton {
  min-width: 9.5rem;
  min-height: 2.1rem;
  cursor: default;
  border-style: solid;
}

.next-action-btn--skeleton .commerce-loading {
  width: 100%;
}

.next-action-btn:hover {
  background: linear-gradient(
    135deg,
    rgba(0, 212, 255, 0.3) 0%,
    rgba(0, 168, 204, 0.2) 100%
  );
  box-shadow: 0 0 25px rgba(0, 212, 255, 0.4);
  transform: translateY(-2px);
}

.next-action-btn__badge {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(0, 212, 255, 0.15);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 5px;
  padding: 0.1em 0.4em;
  color: var(--ink-muted);
}
</style>
