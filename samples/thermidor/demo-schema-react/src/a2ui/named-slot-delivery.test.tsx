import {useEffect, type ReactNode} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {render, screen, waitFor, cleanup} from '@testing-library/react';
import {z} from 'zod';
import {A2UIProvider, A2UIRenderer, createCatalog, useA2UI} from '@copilotkit/a2ui-renderer';

/**
 * Task 4.1 — Y2 gate: does the frozen `@copilotkit/a2ui-renderer` (v1.61) deliver
 * declared STATIC `child-ref` slot fields on the resolved `props` UNTOUCHED, so a
 * renderer can do `children(props.sidebarChild)` — with no defensive read, no
 * positional array destructuring, and no leak/corruption from the binder?
 *
 * The experiment registers a tiny container in a catalog whose props schema declares
 * composition as static child-ref fields:
 *   - `sidebarChild: z.string()`   (named single-child slot)
 *   - `mainChild:    z.string()`   (named single-child slot)
 *   - `children:     z.array(z.string())` (homogeneous ordered list — plain string[],
 *      NOT the basic catalog's ChildListSchema union which the binder rewrites)
 *
 * It then feeds a minimal v0.9 surface through the real MessageProcessor + GenericBinder
 * via the frozen renderer, and asserts (a) the render function receives those fields
 * byte-identical to the literal ids carried on the node, and (b) `children(props.<slot>)`
 * mounts the corresponding child.
 */

const CONTAINER_CATALOG_ID = 'copilotkit://named-slot-delivery-test-catalog';
const SURFACE_ID = 'named-slot-delivery-surface';

// A container props schema that declares composition as STATIC child-ref fields.
const NamedSlotContainerProps = z.object({
  sidebarChild: z.string(),
  mainChild: z.string(),
  children: z.array(z.string()),
});

type NamedSlotContainerResolvedProps = z.infer<typeof NamedSlotContainerProps>;

// Captures the resolved props the binder delivers to the render function.
const capturedProps = vi.fn<(props: unknown) => void>();

function NamedSlotContainerRenderer({
  props,
  children,
}: {
  props: NamedSlotContainerResolvedProps;
  children: (id: string) => ReactNode;
}) {
  capturedProps(props);
  return (
    <div data-testid="container">
      <aside data-testid="sidebar">{children(props.sidebarChild)}</aside>
      <main data-testid="main">{children(props.mainChild)}</main>
      <ul data-testid="list">
        {props.children.map((id) => (
          <li key={id}>{children(id)}</li>
        ))}
      </ul>
    </div>
  );
}

// A trivial leaf component so mounted children render observable text.
const LeafProps = z.object({label: z.string()});

function LeafRenderer({props}: {props: z.infer<typeof LeafProps>}) {
  return <span data-leaf={props.label}>{props.label}</span>;
}

function buildCatalog() {
  return createCatalog(
    {
      NamedSlotContainer: {
        description: 'Test container declaring static child-ref slots.',
        // The sample's Zod (v4) differs from the renderer's bundled Zod (v3); the schema
        // object is bridged at this boundary exactly as the real catalog shim does.
        props: NamedSlotContainerProps as never,
      },
      Leaf: {description: 'Test leaf.', props: LeafProps as never},
    },
    {
      NamedSlotContainer: NamedSlotContainerRenderer as never,
      Leaf: LeafRenderer as never,
    },
    {catalogId: CONTAINER_CATALOG_ID, includeBasicCatalog: false}
  );
}

// v0.9 messages: a surface plus the container root (id `root`) carrying the literal
// child ids on its props, and the three leaf children it references.
const SIDEBAR_ID = 'sidebar-facets';
const MAIN_ID = 'main-results';
const LIST_CHILD_IDS = ['list-a', 'list-b', 'list-c'];

const messages: Array<Record<string, unknown>> = [
  {version: 'v0.9', createSurface: {surfaceId: SURFACE_ID, catalogId: CONTAINER_CATALOG_ID}},
  {
    version: 'v0.9',
    updateComponents: {
      surfaceId: SURFACE_ID,
      components: [
        {
          id: 'root',
          component: 'NamedSlotContainer',
          sidebarChild: SIDEBAR_ID,
          mainChild: MAIN_ID,
          children: [...LIST_CHILD_IDS],
        },
        {id: SIDEBAR_ID, component: 'Leaf', label: 'SIDEBAR'},
        {id: MAIN_ID, component: 'Leaf', label: 'MAIN'},
        ...LIST_CHILD_IDS.map((id) => ({id, component: 'Leaf', label: id.toUpperCase()})),
      ],
    },
  },
];

function MessagePump({onDone}: {onDone: () => void}) {
  const {processMessages} = useA2UI();
  useEffect(() => {
    processMessages(messages);
    onDone();
  }, [processMessages, onDone]);
  return null;
}

describe('Y2 gate — frozen renderer delivers static child-ref slot fields untouched (Task 4.1)', () => {
  it('delivers props.sidebarChild / props.mainChild / props.children byte-identical, and children(props.<slot>) mounts each child', async () => {
    const catalog = buildCatalog();
    const onDone = vi.fn();

    render(
      <A2UIProvider catalog={catalog}>
        <MessagePump onDone={onDone} />
        <A2UIRenderer surfaceId={SURFACE_ID} />
      </A2UIProvider>
    );

    await waitFor(() => expect(screen.getByTestId('container')).toBeDefined());

    // (a) The binder delivered the static child-ref fields UNTOUCHED.
    const lastCall = capturedProps.mock.calls.at(-1);
    expect(lastCall).toBeDefined();
    const delivered = lastCall![0] as NamedSlotContainerResolvedProps;

    expect(delivered.sidebarChild).toBe(SIDEBAR_ID);
    expect(delivered.mainChild).toBe(MAIN_ID);
    expect(delivered.children).toEqual(LIST_CHILD_IDS);

    // (b) children(props.<slot>) mounted the corresponding children.
    expect(screen.getByTestId('sidebar').textContent).toBe('SIDEBAR');
    expect(screen.getByTestId('main').textContent).toBe('MAIN');
    const listItems = screen.getByTestId('list').querySelectorAll('li');
    expect([...listItems].map((li) => li.textContent)).toEqual(['LIST-A', 'LIST-B', 'LIST-C']);

    cleanup();
  });
});
