import {useEffect, useRef} from 'react';
import type {TurnRef} from '../turn-ref/turn-ref.js';
import {useConversations, useSession} from '../context/session.js';
import {
  conversationSnapshot,
  sessionToReopen,
  type ConversationSnapshot,
} from '../conversation-snapshot/conversation-snapshot.js';

interface AnnotationModule {
  mount(
    element: HTMLElement,
    turnRef: TurnRef,
    options: {snapshot: () => ConversationSnapshot}
  ): void;
  mountConversations(
    element: HTMLElement,
    options: {open: (snapshot: ConversationSnapshot) => void}
  ): void;
}

/**
 * Renders into the returned element with the conversation annotation layer's page module, again
 * whenever `renderKey` changes. The layer is served apart from the demo, so nothing is shown when
 * its module can't be loaded.
 */
function useAnnotationModule(
  moduleUrl: string,
  renderKey: string,
  render: (module: AnnotationModule, element: HTMLElement) => void
) {
  const container = useRef<HTMLDivElement>(null);
  const latestRender = useRef(render);
  latestRender.current = render;

  useEffect(() => {
    const element = container.current;
    let unmounted = false;
    import(/* @vite-ignore */ moduleUrl).then(
      (module: AnnotationModule) => {
        if (!unmounted && element) {
          latestRender.current(module, element);
        }
      },
      (error: unknown) => console.warn(`No annotation control: ${moduleUrl} can't be loaded`, error)
    );
    return () => {
      unmounted = true;
      element?.replaceChildren();
    };
  }, [moduleUrl, renderKey]);

  return container;
}

export interface AnnotationControlProps {
  /** Where the conversation annotation layer serves its page module. */
  moduleUrl: string;
  turnRef: TurnRef;
}

/**
 * The annotation layer's control for one turn. Each Assessment saved through it also keeps the
 * conversation as it is then, so the conversation can be reopened.
 */
export function AnnotationControl({moduleUrl, turnRef}: AnnotationControlProps) {
  const session = useSession();
  const {conversation_id, turn_id, request_id} = turnRef;
  const container = useAnnotationModule(
    moduleUrl,
    JSON.stringify([conversation_id, turn_id, request_id]),
    (module, element) =>
      module.mount(
        element,
        {conversation_id, turn_id, request_id},
        {snapshot: () => conversationSnapshot(session.serialize(), conversation_id)}
      )
  );

  return <div ref={container} />;
}

/** The conversations the annotation layer keeps; choosing one reopens it read-only. */
export function KeptConversations({moduleUrl}: {moduleUrl: string}) {
  const {open} = useConversations();
  const container = useAnnotationModule(moduleUrl, '', (module, element) =>
    module.mountConversations(element, {
      open: (snapshot) => open({sessionToRestore: sessionToReopen(snapshot), readOnly: true}),
    })
  );

  return <div ref={container} />;
}
