import type {TemplateId} from './types.js';

export const PROMPT_TEMPLATE_MAP: ReadonlyArray<{
  prompt: string;
  templateId: TemplateId;
}> = [
  {
    prompt:
      'build a beginner surfing kit with budget, mid-range, and premium options',
    templateId: 'response1',
  },
  {
    prompt: 'what should i pack for a snorkeling trip?',
    templateId: 'response2',
  },
  {
    prompt: 'kayaks',
    templateId: 'response3',
  },
  {
    prompt: 'wetsuits',
    templateId: 'response4',
  },
  {
    prompt: 'surfboard care',
    templateId: 'response6',
  },
  {
    prompt: 'boating safety',
    templateId: 'response7',
  },
];

export const FALLBACK_TEMPLATE_ID: TemplateId = 'response5';
