import {buildStreamingResponse} from './events.js';
import {getTemplateEvents, type TemplateId} from './templates/templates.js';

const DEFAULT_DELAY_MS = 25;

interface PromptMapping {
  prompt: string;
  templateId: TemplateId;
}

const PROMPT_TEMPLATE_MAP: ReadonlyArray<PromptMapping> = [
  {
    prompt: 'build a beginner surfing kit with budget, mid-range, and premium options',
    templateId: 'response1',
  },
  {
    prompt: 'what should i pack for a snorkeling trip?',
    templateId: 'response2',
  },
  {prompt: 'kayaks', templateId: 'response3'},
  {prompt: 'wetsuits', templateId: 'response4'},
  {prompt: 'surfboard care', templateId: 'response6'},
  {prompt: 'boating safety', templateId: 'response7'},
  {
    prompt: 'i like cold-water surfing. compare wetsuits for it',
    templateId: 'response8',
  },
];

const FALLBACK_TEMPLATE_ID: TemplateId = 'response5';

function matchPrompt(message: string): TemplateId {
  const normalized = message.trim().toLowerCase();
  const match = PROMPT_TEMPLATE_MAP.find((entry) => entry.prompt === normalized);
  return match ? match.templateId : FALLBACK_TEMPLATE_ID;
}

const buildConverseStreamingResponse = ({
  delayBetweenMessages = DEFAULT_DELAY_MS,
  templateId,
}: {
  delayBetweenMessages?: number | 'real' | 'infinite';
  templateId?: TemplateId;
} = {}) => {
  const id = templateId ?? FALLBACK_TEMPLATE_ID;
  return buildStreamingResponse(getTemplateEvents(id), {delayBetweenMessages});
};

const baseResponse = (body?: unknown) => {
  let templateId: TemplateId = FALLBACK_TEMPLATE_ID;
  if (
    body &&
    typeof body === 'object' &&
    'message' in body &&
    typeof (body as Record<string, unknown>).message === 'string'
  ) {
    templateId = matchPrompt((body as Record<string, unknown>).message as string);
  }
  return buildConverseStreamingResponse({
    delayBetweenMessages: 'real',
    templateId,
  });
};

export {baseResponse, buildConverseStreamingResponse, matchPrompt};
export type {TemplateId};
