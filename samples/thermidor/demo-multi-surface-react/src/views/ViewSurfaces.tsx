import type {DiscoveredSurface} from '@coveo/thermidor';
import {TurnSurfaces} from '../../../demo-schema-react/src/a2ui/surfaces.js';

interface ViewSurfacesProps {
  /** The surfaces to draw, in order. */
  surfaces: readonly DiscoveredSurface[];
  /** Whether the view's turn is streaming. */
  isStreaming: boolean;
}

/**
 * Draws a view's surfaces with `demo-schema-react`'s `TurnSurfaces`: in order, a loading
 * placeholder as its component's skeleton. They lock while any view's request is in flight, as
 * the server takes one request at a time per session and the session withholds the others; one
 * view's request locks the views beside it, such as the search results while the chat panel's
 * answer streams.
 */
export function ViewSurfaces({surfaces, isStreaming}: ViewSurfacesProps) {
  return <TurnSurfaces surfaces={surfaces} interactive isStreaming={isStreaming} />;
}
