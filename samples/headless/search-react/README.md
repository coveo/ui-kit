# Headless Search with React

> **Scaffold template**: `headless-search-react`
> This sample serves as the scaffold template for creating new Coveo Headless search projects with React.

A minimal search interface built with [`@coveo/headless`](https://docs.coveo.com/en/headless/) controllers and React. It queries the public `searchuisamples` organization through the **BarcaKnowledge** search hub.

## What it shows

- Building a `SearchEngine` and a focused set of controllers (search box, facets, sort, results, pager, query summary).
- A single `useController` hook that bridges any Headless controller to React state.
- Small, self-contained components — one per controller — that you can copy into your own app.

## Technology stack

- **React** + **TypeScript**
- **@coveo/headless** — Coveo's headless search library
- **Vite** — dev server and build
- **Vitest** + **Playwright** — unit and end-to-end tests

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build
npm test         # unit tests (Vitest)
npm run e2e      # end-to-end tests (Playwright)
```

## How it works

`src/engine.ts` builds the engine and sets the `BarcaKnowledge` search hub. `src/App.tsx` instantiates the controllers and lays out the page (search box on top, facets on the left, results and pager on the right).

Every component subscribes to its controller through `src/use-controller.ts`:

```ts
export function useController<TController extends Controller>(
  controller: TController
): TController['state'] {
  const [state, setState] = useState(controller.state);
  useEffect(() => controller.subscribe(() => setState(controller.state)), [controller]);
  return state;
}
```

## Learn more

- [Coveo Headless documentation](https://docs.coveo.com/en/headless/)
- [Headless controllers reference](https://docs.coveo.com/en/headless/latest/reference/)
