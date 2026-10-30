/**
 * The question-answering gateway draws a Scoping block in every turn, under a surface id with this
 * prefix. See agent-gateway's `docs/question-answering-agent.md`, "The Scoping block".
 */
const SCOPING_SURFACE_ID_PREFIX = 'scoping-';

/** Whether the server surface id is one of the question-answering gateway's Scoping blocks. */
export function isScopingSurface(serverSurfaceId: string): boolean {
  return serverSurfaceId.startsWith(SCOPING_SURFACE_ID_PREFIX);
}
