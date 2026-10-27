import {useEffect, useRef} from 'react';
import type {TurnRef} from '../../turn-ref/turn-ref.js';

interface AnnotationModule {
  mount(element: HTMLElement, turnRef: TurnRef): void;
}

export interface AnnotationControlProps {
  /** Where the conversation annotation layer serves its page module. */
  moduleUrl: string;
  turnRef: TurnRef;
}

/**
 * The conversation annotation layer's control for one turn. The layer is served apart from the
 * demo, so nothing is shown when its module can't be loaded.
 */
export function AnnotationControl({moduleUrl, turnRef}: AnnotationControlProps) {
  const container = useRef<HTMLDivElement>(null);
  const {conversation_id, turn_id, request_id} = turnRef;

  useEffect(() => {
    const element = container.current;
    let unmounted = false;
    import(/* @vite-ignore */ moduleUrl).then(
      (module: AnnotationModule) => {
        if (!unmounted && element) {
          module.mount(element, {conversation_id, turn_id, request_id});
        }
      },
      (error: unknown) => console.warn(`No annotation control: ${moduleUrl} can't be loaded`, error)
    );
    return () => {
      unmounted = true;
      element?.replaceChildren();
    };
  }, [moduleUrl, conversation_id, turn_id, request_id]);

  return <div ref={container} />;
}
