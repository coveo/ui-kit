/**
 * A2-UI Surface Bridge
 *
 * Mounts the session's A2-UI message stream into the renderer, and draws each surface where the
 * page places it.
 *
 * The v1.0 → v0.9 downgrade the renderer needs no longer happens here: it is a derived
 * projection inside `@coveo/thermidor`, read off `session.a2uiMessages`. See that package's
 * `session/a2ui-v09-projection.ts` for the conversion and the recorded interim debt.
 */
import {useEffect, useMemo, useRef, type ReactNode} from 'react';
import {A2UIRenderer, useA2UI} from '@copilotkit/a2ui-renderer';
import type {A2uiV09Message, DiscoveredSurface} from '@coveo/thermidor';
import {A2UISkeleton} from './Skeleton/Skeleton.js';
import {useActionError, useSurfaceLocked} from './session-request.js';
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

interface ThermidorA2UIStreamProps {
  /** The session's whole renderer stream (`session.a2uiMessages`). */
  messages: readonly A2uiV09Message[];
  /** The page whose {@link TurnSurfaces} draw the stream's surfaces. */
  children?: ReactNode;
}

/**
 * Feeds the whole session's message stream to the renderer. It draws nothing itself: each surface
 * is drawn by a {@link TurnSurfaces} placed under the turn that created it.
 */
export function ThermidorA2UIStream({messages, children}: ThermidorA2UIStreamProps) {
  const {clearSurfaces, processMessages} = useA2UI();
  const actionsRef = useRef({clearSurfaces, processMessages});
  actionsRef.current = {clearSurfaces, processMessages};
  const fedRef = useRef<readonly A2uiV09Message[]>([]);

  // The session's stream only grows, so only its new messages are fed. A stream that does not
  // extend the one already fed, such as another session's, is fed again from the start.
  useEffect(() => {
    const {clearSurfaces, processMessages} = actionsRef.current;
    const fed = fedRef.current;
    const extendsFed = fed.length === 0 || messages[fed.length - 1] === fed[fed.length - 1];
    const start = extendsFed ? fed.length : 0;
    if (!extendsFed) {
      clearSurfaces();
    }
    fedRef.current = messages;
    if (messages.length > start) {
      processMessages(messages.slice(start) as A2uiV09Message[]);
    }
  }, [messages]);

  return <>{children}</>;
}

interface TurnSurfacesProps {
  /**
   * The turn's surfaces (`response.surfaces`). `@coveo/thermidor` lists a loading placeholder only
   * while its turn streams, so one the agent left behind is never drawn.
   */
  surfaces: readonly DiscoveredSurface[];
  /**
   * Whether the shopper can act on these surfaces. The session only sends actions for the
   * surfaces of its active turn, so the controls of earlier turns' blocks are disabled while
   * their content stays readable. A disabled `fieldset` disables every control inside it.
   */
  interactive: boolean;
  /** Whether the turn these surfaces belong to is still streaming. */
  isStreaming: boolean;
}

/**
 * Draws one turn's surfaces in order. A surface added to an already drawn turn, such as the
 * search block a search option opens, is scrolled into view. A loading placeholder is drawn as
 * the skeleton of its root component type, in the place its content will take.
 */
export function TurnSurfaces({surfaces, interactive, isStreaming}: TurnSurfacesProps) {
  const surfaceIds = useMemo(() => surfaces.map((surface) => surface.surfaceId), [surfaces]);
  const sectionRefs = useRef(new Map<string, HTMLElement>());
  const drawnIdsRef = useRef<ReadonlySet<string> | null>(null);
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

  useEffect(() => {
    const drawnIds = drawnIdsRef.current;
    drawnIdsRef.current = new Set(surfaceIds);
    if (drawnIds === null) {
      return;
    }
    const added = surfaceIds.find((surfaceId) => !drawnIds.has(surfaceId));
    // Content replacing a drawn placeholder takes its place under a new id; scrolling to it would
    // pull the page back up while the answer streams.
    const replaced = [...drawnIds].some((surfaceId) => !surfaceIds.includes(surfaceId));
    if (added !== undefined && !replaced) {
      sectionRefs.current.get(added)?.scrollIntoView?.({behavior: 'smooth', block: 'start'});
    }
  }, [surfaceIds]);

  if (surfaceIds.length === 0) {
    return null;
  }

  return (
    // Kept a fieldset in both states: swapping elements would remount the surfaces and drop their
    // local state when the turn stops being the active one.
    <fieldset
      ref={fieldsetRef}
      className={[styles.surfaces, !interactive && styles.readOnly, dimmed && styles.locked]
        .filter(Boolean)
        .join(' ')}
      disabled={!interactive || locked}
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
          Earlier results. Ask a follow-up or search again to refine.
        </legend>
      )}
      {surfaces.map(({surfaceId, rootComponentType, isLoading}) => {
        return (
          <section
            className="catalog-surface"
            aria-label={`A2-UI surface ${surfaceId}`}
            key={surfaceId}
            ref={(element) => {
              if (element) {
                sectionRefs.current.set(surfaceId, element);
              } else {
                sectionRefs.current.delete(surfaceId);
              }
            }}
          >
            {isLoading ? (
              <A2UISkeleton componentType={rootComponentType} />
            ) : (
              <A2UIRenderer surfaceId={surfaceId} />
            )}
            <ActionErrorNote surfaceId={surfaceId} />
          </section>
        );
      })}
    </fieldset>
  );
}

/** Says that the last action from this block failed, as the session's `actionError` reports it. */
function ActionErrorNote({surfaceId}: {surfaceId: string}) {
  const message = useActionError(surfaceId);
  if (message === undefined) {
    return null;
  }
  return (
    <p role="alert" className={styles.actionError}>
      This action could not be completed: {message}
    </p>
  );
}
