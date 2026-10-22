/**
 * A2-UI Surface Bridge
 *
 * Mounts the session's A2-UI message stream into the renderer, and draws each surface where the
 * page places it.
 *
 * The v1.0 → v0.9 downgrade the renderer needs no longer happens here: it is a derived
 * projection inside `@coveo/thermidor`, read off `response.a2uiMessages`. See that package's
 * `session/a2ui-v09-projection.ts` for the conversion and the recorded interim debt.
 */
import {createContext, useContext, useEffect, useMemo, useRef, type ReactNode} from 'react';
import {A2UIRenderer, useA2UI} from '@copilotkit/a2ui-renderer';
import type {A2uiV09Message} from '@coveo/thermidor';
import {A2UISkeleton} from './Skeleton/Skeleton.js';
import {useSurfaceLocked} from './session-request.js';
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
 * every exchange, and only the exchange that holds it gives it back.
 */
let lastUsedControl: HTMLElement | null = null;

const NO_LOADING_SURFACES: ReadonlyMap<string, string> = new Map();

/** The `loadingSurfaces` of the enclosing {@link ThermidorA2UIStream}. */
const LoadingSurfacesContext = createContext(NO_LOADING_SURFACES);

interface ThermidorA2UIStreamProps {
  messages: A2uiV09Message[];
  /** The stream's loading placeholders (`SurfaceStream.loadingSurfaces`). */
  loadingSurfaces: ReadonlyMap<string, string>;
  /** The page whose {@link TurnSurfaces} draw the stream's surfaces. */
  children?: ReactNode;
}

/**
 * Feeds the whole session's message stream to the renderer, and shares which of its surfaces are
 * loading placeholders with the page it wraps. It draws nothing itself: each surface is drawn by
 * a {@link TurnSurfaces} placed under the turn that created it.
 */
export function ThermidorA2UIStream({
  messages,
  loadingSurfaces,
  children,
}: ThermidorA2UIStreamProps) {
  const {clearSurfaces, processMessages} = useA2UI();
  const serializedMessages = useMemo(() => JSON.stringify(messages), [messages]);
  const actionsRef = useRef({clearSurfaces, processMessages});
  actionsRef.current = {clearSurfaces, processMessages};

  useEffect(() => {
    const {clearSurfaces, processMessages} = actionsRef.current;
    clearSurfaces();
    if (serializedMessages !== '[]') {
      processMessages(JSON.parse(serializedMessages) as A2uiV09Message[]);
    }
  }, [serializedMessages]);

  return (
    <LoadingSurfacesContext.Provider value={loadingSurfaces}>
      {children}
    </LoadingSurfacesContext.Provider>
  );
}

interface TurnSurfacesProps {
  surfaceIds: readonly string[];
  /**
   * Whether the shopper can act on these surfaces. The session only sends actions for the
   * surfaces of its active turn, so the controls of earlier turns' blocks are disabled while
   * their content stays readable. A disabled `fieldset` disables every control inside it.
   */
  interactive: boolean;
  /**
   * Whether the exchange these surfaces belong to is still streaming: its turn is streaming, or
   * its follow-up is in flight. Loading placeholders are drawn only then; one the agent left
   * behind once the exchange ended (a cancelled run, an error, a restored session) is abandoned
   * and drawn as nothing.
   */
  isStreaming: boolean;
}

/**
 * Draws one turn's surfaces in order. A surface added to an already drawn turn, such as the
 * search block a search option opens, is scrolled into view. A loading placeholder is drawn as
 * the skeleton of its root component type, in the place its content will take, while its
 * exchange streams.
 */
export function TurnSurfaces({
  surfaceIds: allSurfaceIds,
  interactive,
  isStreaming,
}: TurnSurfacesProps) {
  const loadingSurfaces = useContext(LoadingSurfacesContext);
  const surfaceIds = useMemo(
    () =>
      isStreaming
        ? allSurfaceIds
        : allSurfaceIds.filter((surfaceId) => !loadingSurfaces.has(surfaceId)),
    [allSurfaceIds, isStreaming, loadingSurfaces]
  );
  const sectionRefs = useRef(new Map<string, HTMLElement>());
  const drawnIdsRef = useRef<ReadonlySet<string> | null>(null);
  const locked = useSurfaceLocked() && interactive;
  // The exchange that streams is disabled without dimming, so its content arrives at full strength.
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
      {surfaceIds.map((surfaceId) => {
        const loadingComponentType = loadingSurfaces.get(surfaceId);
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
            {loadingComponentType !== undefined ? (
              <A2UISkeleton componentType={loadingComponentType} />
            ) : (
              <A2UIRenderer surfaceId={surfaceId} />
            )}
          </section>
        );
      })}
    </fieldset>
  );
}
