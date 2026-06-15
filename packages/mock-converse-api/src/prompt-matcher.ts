import type {TemplateId} from './types.js';
import {FALLBACK_TEMPLATE_ID, PROMPT_TEMPLATE_MAP} from './constants.js';

export function matchPrompt(message: string): TemplateId {
  const normalized = message.trim().toLowerCase();
  const match = PROMPT_TEMPLATE_MAP.find(
    (entry) => entry.prompt === normalized
  );
  return match ? match.templateId : FALLBACK_TEMPLATE_ID;
}
