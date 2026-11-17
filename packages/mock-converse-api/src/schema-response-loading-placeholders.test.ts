import {describe, it, expect} from 'vitest';
import {converseSchemaResponses} from '@coveo/platform-mock-api/converse';
import type {ConverseEvent} from '@coveo/platform-mock-api/converse';

const {matchSchemaPrompt} = converseSchemaResponses;

// Each prompt streams display blocks that the agent announces with loading placeholders.
const PROMPTS = [
  'boating safety',
  'build a beginner surfing kit with budget, mid-range, and premium options',
  'i like cold-water surfing. compare wetsuits for it',
  'tell me more about the thermoflex winter wetsuit',
];

interface SurfaceSnapshot {
  messageId: string;
  replace: boolean;
  messages: Array<Record<string, unknown>>;
}

function surfaceSnapshots(events: ConverseEvent[]): SurfaceSnapshot[] {
  return events
    .map((event) => event.data as Record<string, unknown>)
    .filter((data) => data.type === 'ACTIVITY_SNAPSHOT' && data.activityType === 'a2ui-surface')
    .map((data) => ({
      messageId: data.messageId as string,
      replace: data.replace === true,
      messages: (data.content as Record<string, unknown>).messages as Array<
        Record<string, unknown>
      >,
    }));
}

function isLoadingCreate(message: Record<string, unknown>): boolean {
  const createSurface = message.createSurface as Record<string, unknown> | undefined;
  const dataModel = createSurface?.dataModel as Record<string, unknown> | undefined;
  return dataModel?.isLoading === true;
}

describe.each(PROMPTS)('loading placeholders for "%s"', (prompt) => {
  const snapshots = surfaceSnapshots(matchSchemaPrompt(prompt));
  const placeholders = snapshots.filter((snapshot) => snapshot.messages.some(isLoadingCreate));

  it('announces at least one block with a loading placeholder', () => {
    expect(placeholders.length).toBeGreaterThan(0);
  });

  it('streams each placeholder as a single createSurface with a root and isLoading', () => {
    for (const {messages} of placeholders) {
      expect(messages).toHaveLength(1);
      const createSurface = messages[0].createSurface as Record<string, unknown>;
      expect(createSurface.components).toEqual([{id: 'root', component: expect.any(String)}]);
    }
  });

  it('replaces each placeholder in place with a snapshot that deletes it', () => {
    for (const placeholder of placeholders) {
      const createSurface = placeholder.messages[0].createSurface as Record<string, unknown>;
      const later = snapshots.slice(snapshots.indexOf(placeholder) + 1);
      const content = later.find((snapshot) => snapshot.messageId === placeholder.messageId);

      expect(content?.replace).toBe(true);
      expect(content?.messages[0]).toEqual({
        version: 'v1.0',
        deleteSurface: {surfaceId: createSurface.surfaceId},
      });
      expect(content?.messages.some(isLoadingCreate)).toBe(false);
    }
  });
});
