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

// The props each placeholder's component requires in the catalog. An A2-UI v1.0 renderer rejects a
// component that misses one, so a placeholder binds them.
const REQUIRED_PROPS: Record<string, string[]> = {
  BundleDisplay: ['tiers'],
  ComparisonTable: ['heading', 'summary', 'products', 'attributes'],
  NextActionsBar: ['suggestedActions'],
  ProductCarousel: ['heading', 'products'],
  ProductResearchCard: ['product', 'summary', 'bullets'],
};

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
      expect(createSurface.components).toEqual([
        expect.objectContaining({id: 'root', component: expect.any(String)}),
      ]);
    }
  });

  it('binds the required props of each placeholder root', () => {
    for (const {messages} of placeholders) {
      const createSurface = messages[0].createSurface as Record<string, unknown>;
      const [root] = createSurface.components as Array<Record<string, unknown>>;
      const component = root.component as string;

      expect(REQUIRED_PROPS).toHaveProperty(component);
      expect(root).toEqual({
        id: 'root',
        component,
        ...Object.fromEntries(
          REQUIRED_PROPS[component].map((prop) => [prop, {'@path': `/state/root/${prop}`}])
        ),
      });
    }
  });

  it('replaces each placeholder in place with a snapshot that deletes it', () => {
    for (const placeholder of placeholders) {
      const createSurface = placeholder.messages[0].createSurface as Record<string, unknown>;
      const later = snapshots.slice(snapshots.indexOf(placeholder) + 1);
      const content = later.find((snapshot) => snapshot.messageId === placeholder.messageId);

      expect(content?.replace).toBe(true);
      expect(content?.messages[0]).toEqual({
        version: '1.0',
        deleteSurface: {surfaceId: createSurface.surfaceId},
      });
      expect(content?.messages.some(isLoadingCreate)).toBe(false);
    }
  });
});
