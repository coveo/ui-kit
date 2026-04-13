<script setup lang="ts">
import {ref} from 'vue';

import {loadConfig, type CommerceConfig} from '@core/config/env.js';

import ChatInterface from './components/ChatInterface.vue';

const config = ref<CommerceConfig | null>(null);
const error = ref<string | null>(null);

try {
  config.value = loadConfig();
} catch (err) {
  error.value = err instanceof Error ? err.message : 'Configuration failed';
}
</script>

<template>
  <main v-if="error" class="state-screen" role="alert">
    <section class="state-card">
      <h1>Configuration Error</h1>
      <pre>{{ error }}</pre>
    </section>
  </main>

  <main v-else-if="!config" class="state-screen" aria-live="polite">
    <section class="state-card">Loading configuration...</section>
  </main>

  <ChatInterface v-else :config="config" />
</template>
