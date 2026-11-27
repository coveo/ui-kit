/**
 * A2-UI Surface Bridge
 *
 * Feeds the session's A2-UI v1.0 message stream (`session.a2uiMessages`) to one `@a2ui/web_core`
 * message processor, and draws each surface it holds where the page places it, with
 * `@a2ui/react`'s `A2uiSurface`.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import {A2uiSurface, type ReactComponentImplementation} from '@a2ui/react';
import {
  type ActionPayload,
  type Catalog,
  MessageProcessor,
  type SurfaceModel,
} from '@a2ui/web_core';
import type {A2uiMessage, DiscoveredSurface} from '@coveo/converse';
import {withLegacyCatalogId} from './components.js';
import {turnSurfacesTarget} from './results-focus.js';
import {TurnFailedContext} from './ProgressBlock/ProgressBlock.js';
import {A2UISkeleton} from './Skeleton/Skeleton.js';
import {useReportedActionError, useSurfaceLocked} from './session-request.js';
import {
  ActionErrorMessage,
  ActionErrorNotesContext,
  createActionErrorNotes,
  EarlierTurnContext,
  RestoredSurfacesContext,
  type ActionErrorNotes,
} from './surface-controls.js';
import styles from './surfaces.module.css';

/** The control a pointer press lands on, through its label when the press is on one. */
function controlAt(target: EventTarget): HTMLElement | null {
  if (!(target instanceof Element)) {
    return null;
  }
  const control =
    target.closest('label')?.control ?? target.closest('button, input, select, textarea');
  return control instanceof HTMLElement ? control : null;
}

/**
 * The control the shopper last used, on any surface. The page has one focus, so it is shared by
 * every turn, and only the turn that holds it gives it back.
 */
let lastUsedControl: HTMLElement | null = null;

type ConverseProcessor = MessageProcessor<ReactComponentImplementation>;

const ProcessorContext = createContext<ConverseProcessor | null>(null);

interface ConverseA2UIStreamProps {
  /** The catalog the surfaces render with. */
  catalog: Catalog<ReactComponentImplementation>;
  /** The session's whole renderer stream (`session.a2uiMessages`). */
  messages: readonly A2uiMessage[];
  /** Receives every action a surface dispatches, such as `session.dispatchAction`. */
  onAction: (action: ActionPayload) => unknown;
  /** The page whose {@link TurnSurfaces} draw the stream's surfaces. */
  children?: ReactNode;
}

/** Removes every surface the processor holds. */
function clearSurfaces(processor: ConverseProcessor) {
  for (const surfaceId of [...processor.model.surfacesMap.keys()]) {
    processor.model.deleteSurface(surfaceId);
  }
}

/**
 * Feeds one message to the processor. A message the processor rejects, such as one whose props
 * fail their schema, is reported and skipped, so the messages after it still apply.
 */
function feed(processor: ConverseProcessor, message: A2uiMessage) {
  try {
    processor.processMessages([message as never]);
  } catch (error) {
    console.error('A2-UI message rejected by the renderer', error, message);
  }
}

/**
 * Feeds the whole session's message stream to one message processor. It draws nothing itself:
 * each surface is drawn by a {@link TurnSurfaces} or an {@link A2UISurface} placed under the turn
 * or the page that shows it.
 */
export function ConverseA2UIStream({
  catalog,
  messages,
  onAction,
  children,
}: ConverseA2UIStreamProps) {
  const onActionRef = useRef(onAction);
  onActionRef.current = onAction;
  const processor = useMemo(
    () =>
      new MessageProcessor<ReactComponentImplementation>(
        withLegacyCatalogId(catalog),
        async (action) => {
          await onActionRef.current(action);
        }
      ),
    [catalog]
  );
  const fedRef = useRef<{processor: ConverseProcessor; messages: readonly A2uiMessage[]}>({
    processor,
    messages: [],
  });

  // The session's stream only grows, so only its new messages are fed. A stream that does not
  // extend the one already fed, such as another session's, is fed again from the start.
  useEffect(() => {
    const fed = fedRef.current.processor === processor ? fedRef.current.messages : [];
    const extendsFed = fed.length === 0 || messages[fed.length - 1] === fed[fed.length - 1];
    const start = extendsFed ? fed.length : 0;
    if (!extendsFed) {
      clearSurfaces(processor);
    }
    fedRef.current = {processor, messages};
    for (const message of messages.slice(start)) {
      feed(processor, message);
    }
  }, [processor, messages]);

  return <ProcessorContext.Provider value={processor}>{children}</ProcessorContext.Provider>;
}

/** The surface the stream holds under `surfaceId`, once its `createSurface` has been fed. */
function useSurfaceModel(
  surfaceId: string
): SurfaceModel<ReactComponentImplementation> | undefined {
  const processor = useContext(ProcessorContext);
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!processor) {
        return () => {};
      }
      const created = processor.model.onSurfaceCreated.subscribe(onChange);
      const deleted = processor.model.onSurfaceDeleted.subscribe(onChange);
      return () => {
        created.unsubscribe();
        deleted.unsubscribe();
      };
    },
    [processor]
  );
  const getSnapshot = useCallback(
    () => processor?.model.getSurface(surfaceId),
    [processor, surfaceId]
  );
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Whether the surface has its root component, without which it draws nothing. */
function useHasRoot(surface: SurfaceModel<ReactComponentImplementation> | undefined): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!surface) {
        return () => {};
      }
      const created = surface.componentsModel.onCreated.subscribe(onChange);
      const deleted = surface.componentsModel.onDeleted.subscribe(onChange);
      return () => {
        created.unsubscribe();
        deleted.unsubscribe();
      };
    },
    [surface]
  );
  const getSnapshot = useCallback(() => surface?.componentsModel.has('root') ?? false, [surface]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

interface A2UISurfaceProps {
  /** The surface to draw. */
  surfaceId: string;
  /** Drawn until the surface and its root component arrive. */
  fallback?: ReactNode;
}

/**
 * Draws one surface of the {@link ConverseA2UIStream} above, or `fallback` until it has a root
 * component to draw.
 */
export function A2UISurface({surfaceId, fallback = null}: A2UISurfaceProps) {
  const surface = useSurfaceModel(surfaceId);
  const hasRoot = useHasRoot(surface);
  if (!surface || !hasRoot) {
    return <>{fallback}</>;
  }
  return (
    <div className="a2ui-surface" data-surface-id={surfaceId}>
      <A2uiSurface surface={surface} />
    </div>
  );
}

interface TurnSurfacesProps {
  /**
   * The turn's surfaces (`response.surfaces`). `@coveo/converse` lists a loading placeholder only
   * while its turn streams, so one the agent left behind is never drawn.
   */
  surfaces: readonly DiscoveredSurface[];
  /**
   * Whether these surfaces belong to the latest turn. The sample keeps the surfaces of earlier
   * turns read-only, as the session keeps those of a restored conversation's earlier turns: their
   * controls that act on the surface are disabled (see `actsOnSurface`), while their products can
   * still be opened and added to the cart.
   */
  latest: boolean;
  /** Whether the turn these surfaces belong to is still streaming. */
  isStreaming: boolean;
  /** These surfaces belong to an expired conversation, which can be read but not continued. */
  expired?: boolean;
}

/**
 * Draws one turn's surfaces in order. A loading placeholder is drawn as the skeleton of its root
 * component type, in the place its content will take. Surfaces never scroll the page: the
 * conversation keeps the turn they belong to in view.
 */
export function TurnSurfaces({surfaces, latest, isStreaming, expired = false}: TurnSurfacesProps) {
  const restored = surfaces.some((surface) => surface.readOnly);
  const interactive = latest && !restored;
  const surfaceIds = useMemo(() => surfaces.map((surface) => surface.surfaceId), [surfaces]);
  const locked = useSurfaceLocked() && interactive;
  // The turn that streams is disabled without dimming, so its content arrives at full strength.
  const dimmed = locked && !isStreaming;
  const fieldsetRef = useRef<HTMLFieldSetElement>(null);

  // Disabling the fieldset drops focus to the body, so the control the shopper used gets it back.
  useEffect(() => {
    const control = lastUsedControl;
    if (
      !locked &&
      control &&
      fieldsetRef.current?.contains(control) &&
      document.activeElement === document.body
    ) {
      // Without `preventScroll`, the page would jump back to a follow-up chip once its answer ends.
      control.focus({preventScroll: true});
    }
  }, [locked]);

  if (surfaceIds.length === 0) {
    return null;
  }

  return (
    // Kept a fieldset in both states: swapping elements would remount the surfaces and drop their
    // local state when the turn stops being the active one.
    <fieldset
      ref={fieldsetRef}
      {...turnSurfacesTarget}
      className={[styles.surfaces, !interactive && styles.readOnly, dimmed && styles.locked]
        .filter(Boolean)
        .join(' ')}
      disabled={locked}
      // Only set while locked: any global ARIA attribute makes browsers ignore `role="none"`.
      aria-busy={locked || undefined}
      onFocus={(event) => {
        lastUsedControl = event.target;
      }}
      // Safari does not focus a button or a checkbox on click, so the press records the control.
      onPointerDown={(event) => {
        lastUsedControl = controlAt(event.target) ?? lastUsedControl;
      }}
      role={interactive ? 'none' : undefined}
    >
      {!interactive && (
        <legend className={styles.readOnlyNote}>
          {expired
            ? 'Results of an expired conversation.'
            : restored
              ? 'Restored results. Search again to refine.'
              : 'Earlier results. Ask a follow-up or search again to refine.'}
        </legend>
      )}
      <EarlierTurnContext.Provider value={!interactive}>
        <RestoredSurfacesContext.Provider value={restored || expired}>
          {surfaces.map(({surfaceId, rootComponentType, isLoading}) => (
            <Surface
              key={surfaceId}
              surfaceId={surfaceId}
              rootComponentType={rootComponentType}
              isLoading={isLoading}
            />
          ))}
        </RestoredSurfacesContext.Provider>
      </EarlierTurnContext.Provider>
    </fieldset>
  );
}

/** One block: its content, or the skeleton of its root while it loads. */
function Surface({surfaceId, rootComponentType, isLoading}: DiscoveredSurface) {
  const [notes] = useState(createActionErrorNotes);
  return (
    <section className="catalog-surface" aria-label={`A2-UI surface ${surfaceId}`}>
      <ActionErrorNotesContext.Provider value={notes}>
        {isLoading ? (
          <A2UISkeleton componentType={rootComponentType} />
        ) : (
          <A2UISurface surfaceId={surfaceId} />
        )}
      </ActionErrorNotesContext.Provider>
      <BlockActionErrorNote surfaceId={surfaceId} notes={notes} />
    </section>
  );
}

/**
 * Says, under the block, that the last action from it failed, when the node that dispatched it
 * does not say so itself: a node no longer drawn, or one not marked with `actsOnSurface`, such as
 * the search block when it restores a search from the browser history.
 */
function BlockActionErrorNote({surfaceId, notes}: {surfaceId: string; notes: ActionErrorNotes}) {
  const actionError = useReportedActionError();
  const failed = actionError?.surfaceId === surfaceId ? actionError : undefined;
  const shownByNode = useSyncExternalStore(
    notes.subscribe,
    () => failed !== undefined && notes.has(failed.sourceComponentId),
    () => false
  );
  return failed === undefined || shownByNode ? null : (
    <ActionErrorMessage message={failed.message} />
  );
}

const PROGRESS_COMPONENT = 'ProgressBlock';

/**
 * Splits a turn's surfaces into its progress, the `ProgressBlock` surface of a turn the agent runs
 * (ADR-028), and its blocks. The progress is drawn above the answer, outside the turn's blocks.
 */
export function splitProgressSurfaces(surfaces: readonly DiscoveredSurface[]) {
  return {
    progress: surfaces.filter((surface) => surface.rootComponentType === PROGRESS_COMPONENT),
    blocks: surfaces.filter((surface) => surface.rootComponentType !== PROGRESS_COMPONENT),
  };
}

interface ProgressSurfacesProps {
  surfaces: readonly DiscoveredSurface[];
  /** Whether the turn failed, so that a block still running shows as failed. */
  turnFailed: boolean;
}

/** Draws a turn's progress surfaces: display-only, so never disabled with the turn's blocks. */
export function ProgressSurfaces({surfaces, turnFailed}: ProgressSurfacesProps) {
  return (
    <TurnFailedContext.Provider value={turnFailed}>
      {surfaces.map(({surfaceId}) => (
        <section className="catalog-surface" aria-label="Agent progress" key={surfaceId}>
          <A2UISurface surfaceId={surfaceId} />
        </section>
      ))}
    </TurnFailedContext.Provider>
  );
}
