import {ActivitySnapshot, UpdateDataModelActivity, type ConverseEvent} from '../events.js';
import {CATALOG_ID, RENDERER_ROOT_ID, bindStateFields, statePath} from './shared.js';

// Mirrors @coveo/thermidor-schema's ProgressBlockState (ADR-028). This package has no dependency on
// the schema package; the mock server's tests validate these events against it.
type ProgressBlockStepStatus = 'active' | 'done';
type ProgressBlockStatus = 'running' | 'complete' | 'error';

interface ProgressBlockStep {
  id: string;
  label: string;
  status: ProgressBlockStepStatus;
}

interface ProgressBlockState {
  steps: ProgressBlockStep[];
  status: ProgressBlockStatus;
}

interface ProgressStepDefinition {
  id: string;
  label: string;
}

/**
 * How a turn's block moves while the agent works: the steps of each snapshot, in order. The block
 * is created with the first snapshot and updated with each of the others before the turn's
 * content. On `RUN_FINISHED`, it ends `complete` with every step done. On `RUN_ERROR`, it ends
 * `error` when the agent failed, and stays `running` when the gateway ended the turn itself.
 */
interface ProgressPlan {
  snapshots: ProgressBlockStep[][];
  failure?: 'agent' | 'gateway';
}

const PROGRESS_BLOCK_COMPONENT = 'ProgressBlock';
const PROGRESS_BLOCK_SURFACE_ID = 'progress-block';
const PROGRESS_BLOCK_ACTIVITY_ID = 'activity-progress-block';
const PROGRESS_BLOCK_STATE_ACTIVITY_ID = 'activity-progress-block-state';

// Each update waits this long, so the steps show one after the other as the agent works.
const STEP_DELAY_MS = 450;

const active = (step: ProgressStepDefinition): ProgressBlockStep => ({...step, status: 'active'});
const done = (step: ProgressStepDefinition): ProgressBlockStep => ({...step, status: 'done'});

const THINKING: ProgressStepDefinition = {id: 'thinking', label: 'Thinking'};
const SEARCHING_CATALOG: ProgressStepDefinition = {
  id: 'searching_products',
  label: 'Searching the catalog',
};
const PREPARING_RESPONSE: ProgressStepDefinition = {
  id: 'preparing_response',
  label: 'Putting it together',
};

// One step at a time: each step starts when the one before it ends.
function sequentialPlan(steps: ProgressStepDefinition[]): ProgressPlan {
  return {
    snapshots: steps.map((step, index) => [...steps.slice(0, index).map(done), active(step)]),
  };
}

const BUNDLE_PROGRESS = sequentialPlan([
  THINKING,
  {id: 'building_bundle', label: 'Building your kit'},
  SEARCHING_CATALOG,
  PREPARING_RESPONSE,
]);

const COMPARING: ProgressStepDefinition = {id: 'comparing_products', label: 'Comparing products'};
const CHECKING_DETAILS: ProgressStepDefinition = {
  id: 'checking_details',
  label: 'Checking product details',
};
const READING_REVIEWS: ProgressStepDefinition = {id: 'reading_reviews', label: 'Reading reviews'};

// Two steps run at once, each its own row in the order they started, and each ends on its own
// (ADR-028 annex A, section 4).
const COMPARISON_PROGRESS: ProgressPlan = {
  snapshots: [
    [active(THINKING)],
    [done(THINKING), active(COMPARING)],
    [done(THINKING), done(COMPARING), active(SEARCHING_CATALOG)],
    [
      done(THINKING),
      done(COMPARING),
      done(SEARCHING_CATALOG),
      active(CHECKING_DETAILS),
      active(READING_REVIEWS),
    ],
    [
      done(THINKING),
      done(COMPARING),
      done(SEARCHING_CATALOG),
      done(CHECKING_DETAILS),
      active(READING_REVIEWS),
    ],
    [
      done(THINKING),
      done(COMPARING),
      done(SEARCHING_CATALOG),
      done(CHECKING_DETAILS),
      done(READING_REVIEWS),
      active(PREPARING_RESPONSE),
    ],
  ],
};

const DISCOVERY_PROGRESS = sequentialPlan([
  THINKING,
  {id: 'exploring_catalog', label: 'Exploring boating safety gear'},
  SEARCHING_CATALOG,
  PREPARING_RESPONSE,
]);

const PRODUCT_RESEARCH_PROGRESS = sequentialPlan([
  THINKING,
  {id: 'researching_product', label: 'Researching the ThermoFlex Winter Wetsuit'},
  {id: 'reading_articles', label: 'Reading articles'},
  PREPARING_RESPONSE,
]);

const FALLBACK_PROGRESS = sequentialPlan([THINKING, SEARCHING_CATALOG, PREPARING_RESPONSE]);

// The label carries the shopper's query, as the backend fills values into labels.
function searchProgress(query: string): ProgressPlan {
  return sequentialPlan([THINKING, {id: 'looking_for_products', label: `Looking for “${query}”`}]);
}

// Both failed turns stop while the catalog search runs.
const AGENT_ERROR_PROGRESS: ProgressPlan = {
  ...sequentialPlan([THINKING, SEARCHING_CATALOG]),
  failure: 'agent',
};
const GATEWAY_ERROR_PROGRESS: ProgressPlan = {
  ...sequentialPlan([THINKING, SEARCHING_CATALOG]),
  failure: 'gateway',
};

function createProgressBlock(state: ProgressBlockState): ConverseEvent {
  return ActivitySnapshot({
    messageId: PROGRESS_BLOCK_ACTIVITY_ID,
    activityType: 'a2ui-surface',
    replace: true,
    content: {
      messages: [
        {
          version: 'v1.0',
          createSurface: {
            surfaceId: PROGRESS_BLOCK_SURFACE_ID,
            catalogId: CATALOG_ID,
            components: [
              {
                id: RENDERER_ROOT_ID,
                component: PROGRESS_BLOCK_COMPONENT,
                ...bindStateFields(RENDERER_ROOT_ID, ['steps', 'status']),
              },
            ],
            dataModel: {state: {[RENDERER_ROOT_ID]: state}},
          },
        },
      ],
    },
  });
}

function updateProgressBlock(state: ProgressBlockState, delayMs?: number): ConverseEvent {
  return {
    ...UpdateDataModelActivity({
      messageId: PROGRESS_BLOCK_STATE_ACTIVITY_ID,
      replace: true,
      ops: [
        {surfaceId: PROGRESS_BLOCK_SURFACE_ID, path: statePath(RENDERER_ROOT_ID), value: state},
      ],
    }),
    ...(delayMs !== undefined && {delayMs}),
  };
}

function typeOf(event: ConverseEvent): unknown {
  return (event.data as {type?: unknown}).type ?? event.event;
}

function isToolCallEvent(event: ConverseEvent): boolean {
  const type = typeOf(event);
  return typeof type === 'string' && type.startsWith('TOOL_CALL_');
}

/** A turn as the public route sends it: without its `TOOL_CALL_*` events (ADR-028). */
function withoutToolCalls(events: ConverseEvent[]): ConverseEvent[] {
  return events.filter((event) => !isToolCallEvent(event));
}

/**
 * The public route's variant of an agent turn (ADR-028): no `TOOL_CALL_*` events, and the agent's
 * progress as a `ProgressBlock` surface instead, created once right after `RUN_STARTED` on one
 * activity id and updated with `updateDataModel` snapshots of its whole state on a second one.
 */
function withProgressBlock(events: ConverseEvent[], plan: ProgressPlan): ConverseEvent[] {
  const [first, ...updates] = plan.snapshots;
  const last = plan.snapshots[plan.snapshots.length - 1];
  const opening = [
    createProgressBlock({steps: first, status: 'running'}),
    ...updates.map((steps) => updateProgressBlock({steps, status: 'running'}, STEP_DELAY_MS)),
  ];

  return withoutToolCalls(events).flatMap((event) => {
    switch (typeOf(event)) {
      case 'RUN_STARTED':
        return [event, ...opening];
      case 'RUN_FINISHED':
        return [updateProgressBlock({steps: last.map(done), status: 'complete'}), event];
      case 'RUN_ERROR':
        return plan.failure === 'gateway'
          ? [event]
          : [updateProgressBlock({steps: last, status: 'error'}), event];
      default:
        return [event];
    }
  });
}

export {
  AGENT_ERROR_PROGRESS,
  BUNDLE_PROGRESS,
  COMPARISON_PROGRESS,
  DISCOVERY_PROGRESS,
  FALLBACK_PROGRESS,
  GATEWAY_ERROR_PROGRESS,
  PRODUCT_RESEARCH_PROGRESS,
  PROGRESS_BLOCK_ACTIVITY_ID,
  PROGRESS_BLOCK_COMPONENT,
  PROGRESS_BLOCK_STATE_ACTIVITY_ID,
  PROGRESS_BLOCK_SURFACE_ID,
  searchProgress,
  withProgressBlock,
  withoutToolCalls,
};
export type {ProgressBlockState, ProgressBlockStep, ProgressPlan};
