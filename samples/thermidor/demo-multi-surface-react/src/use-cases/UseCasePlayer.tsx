import {useEffect, useRef, useState} from 'react';
import {useSessionSnapshot} from '../session/storefront-session.js';
import {
  describeStep,
  STATUS_LABELS,
  USE_CASE_SHEET_URL,
  USE_CASES,
  type Step,
  type UseCase,
  type UseCaseStatus,
} from './use-cases.js';
import styles from './UseCasePlayer.module.css';

/**
 * A run to start after the reload that gives it a fresh session (a page load always starts a new
 * session: the sample keeps none).
 */
const PENDING_KEY = 'use-case-player';
const STEP_PAUSE_MS = 900;
const TYPE_DELAY_MS = 25;
const ANSWER_TIMEOUT_MS = 60000;

type Mode = 'play' | 'step';
type RunStatus =
  | {state: 'idle'}
  | {state: 'running' | 'waiting'; step: number}
  | {state: 'done'}
  | {state: 'error'; step: number; message: string};

class Stopped extends Error {}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function readPending(): {id: string; mode: Mode} | undefined {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    sessionStorage.removeItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

// StrictMode mounts twice; the pending run is read once per page load.
const pendingAtLoad = readPending();

const BADGE_CLASSES: Record<UseCaseStatus['state'], string> = {
  ready: styles.ready,
  partly: styles.partly,
  'not-ready': styles.notReady,
};

function lastOf<T extends HTMLElement>(selector: string, text?: string): T | undefined {
  return [...document.querySelectorAll<T>(selector)]
    .filter((element) => text === undefined || element.textContent?.trim().startsWith(text))
    .at(-1);
}

function flash(element: HTMLElement) {
  element.scrollIntoView({block: 'center', behavior: 'smooth'});
  element.classList.add(styles.target);
  setTimeout(() => element.classList.remove(styles.target), 1200);
}

type TextInput = HTMLInputElement | HTMLTextAreaElement;

async function type(input: TextInput | undefined, text: string) {
  if (!input) {
    throw new Error('Input not found.');
  }
  flash(input);
  const setValue = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value')!.set!;
  input.focus();
  for (let length = 1; length <= text.length; length += 1) {
    setValue.call(input, text.slice(0, length));
    input.dispatchEvent(new Event('input', {bubbles: true}));
    await sleep(TYPE_DELAY_MS);
  }
  await sleep(200);
}

async function typeAndSubmit(input: TextInput | undefined, text: string) {
  await type(input, text);
  if (input?.form) {
    input.form.requestSubmit();
  } else {
    // The conversation's input has no form: Enter sends it.
    input?.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
  }
}

async function click(element: HTMLElement | undefined, what: string) {
  if (!element) {
    throw new Error(`${what} not found on the page.`);
  }
  flash(element);
  await sleep(400);
  element.click();
}

const searchBox = () => lastOf<HTMLInputElement>('input[aria-label="Search"]');

async function perform(step: Step) {
  switch (step.kind) {
    case 'omnibox':
      return typeAndSubmit(searchBox(), step.text);
    case 'type':
      return type(searchBox(), step.text);
    case 'panel':
      // The assistant layout is itself the chat: its question goes in the conversation's input.
      return typeAndSubmit(
        lastOf<HTMLInputElement>('input[aria-label="Ask the shopping assistant"]') ??
          lastOf<HTMLTextAreaElement>('textarea[aria-label="Prompt"]'),
        step.text
      );
    case 'facet':
      return click(
        lastOf(`[data-testid="facet-value-${CSS.escape(step.value)}"]`),
        `The facet value “${step.value}”`
      );
    case 'listing': {
      await click(lastOf('button', 'Listing pages'), 'The listing menu');
      await sleep(300);
      return click(
        lastOf('ul[aria-label="Listing pages"] button', step.name),
        `Listing “${step.name}”`
      );
    }
    case 'chip':
      return click(
        lastOf('[aria-label="Follow-up actions"] button', step.text),
        `The follow-up “${step.text}” in the agent’s answer`
      );
    case 'home':
      return click(lastOf('button', 'Storefront home'), 'The home button');
  }
}

function StatusBadge({status}: {status: UseCaseStatus}) {
  return (
    <span className={`${styles.badge} ${BADGE_CLASSES[status.state]}`}>
      {STATUS_LABELS[status.state]}
    </span>
  );
}

/**
 * A bar above the storefront's header that plays a use case through the page's own controls, on a
 * fresh session, and shows how far the sample gets with it.
 */
export function UseCasePlayer() {
  const {request} = useSessionSnapshot();
  const requestRef = useRef(request);
  requestRef.current = request;
  const [selected, setSelected] = useState(pendingAtLoad?.id ?? USE_CASES[0].id);
  const [status, setStatus] = useState<RunStatus>({state: 'idle'});
  const run = useRef<{stopped: boolean; next?: () => void} | null>(null);
  const useCase = USE_CASES.find(({id}) => id === selected) ?? USE_CASES[0];

  const settled = async (token: {stopped: boolean}) => {
    const busy = () =>
      requestRef.current !== undefined || document.querySelector('[aria-busy="true"]') !== null;
    // A step's request is published a render after the click.
    for (let waited = 0; !busy() && waited < 1500; waited += 50) {
      await sleep(50);
    }
    for (let waited = 0, idle = 0; idle < 3; waited += 100) {
      if (token.stopped) {
        throw new Stopped();
      }
      if (waited > ANSWER_TIMEOUT_MS) {
        throw new Error(`The answer took more than ${ANSWER_TIMEOUT_MS / 1000} s.`);
      }
      idle = busy() ? 0 : idle + 1;
      await sleep(100);
    }
  };

  const start = async (current: UseCase, mode: Mode) => {
    const token: {stopped: boolean; next?: () => void} = {stopped: false};
    run.current = token;
    let index = 0;
    try {
      await settled(token);
      for (; index < current.steps.length; index += 1) {
        if (mode === 'step') {
          setStatus({state: 'waiting', step: index});
          await new Promise<void>((resolve) => (token.next = resolve));
        }
        if (token.stopped) {
          throw new Stopped();
        }
        setStatus({state: 'running', step: index});
        await perform(current.steps[index]);
        await settled(token);
        if (mode === 'play') {
          await sleep(STEP_PAUSE_MS);
        }
      }
      setStatus({state: 'done'});
    } catch (error) {
      setStatus(
        error instanceof Stopped
          ? {state: 'idle'}
          : {state: 'error', step: index, message: (error as Error).message}
      );
    } finally {
      if (run.current === token) {
        run.current = null;
      }
    }
  };

  useEffect(() => {
    if (pendingAtLoad && !run.current) {
      const current = USE_CASES.find(({id}) => id === pendingAtLoad.id);
      if (current) {
        void start(current, pendingAtLoad.mode);
      }
    }
    // Once per load: the pending run was read at module load.
  }, []);

  /** Starts over on a fresh session: the run starts after the reload. */
  const restart = (mode: Mode) => {
    try {
      sessionStorage.setItem(PENDING_KEY, JSON.stringify({id: useCase.id, mode}));
    } catch {
      return;
    }
    window.location.reload();
  };

  const stop = () => {
    if (run.current) {
      run.current.stopped = true;
      run.current.next?.();
    }
  };

  const active = status.state === 'running' || status.state === 'waiting';
  const currentStep = 'step' in status ? status.step : -1;
  const groups = [
    {label: 'Use cases', items: USE_CASES.filter(({group}) => group === 'pm')},
    {label: 'Edge checks', items: USE_CASES.filter(({group}) => group === 'edge')},
  ];

  return (
    <section className={styles.player} aria-label="Use case player">
      <div className={styles.controls}>
        <span className={styles.label}>Use cases</span>
        <select
          className={styles.select}
          value={selected}
          disabled={active}
          aria-label="Use case"
          onChange={(event) => {
            setSelected(event.target.value);
            setStatus({state: 'idle'});
          }}
        >
          {groups.map(({label, items}) => (
            <optgroup key={label} label={label}>
              {items.map(({id, title, status: useCaseStatus}) => (
                <option key={id} value={id}>
                  {title} ({STATUS_LABELS[useCaseStatus.state]})
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <StatusBadge status={useCase.status} />
        <button
          type="button"
          className={styles.play}
          disabled={active}
          onClick={() => restart('play')}
        >
          ▶ Play
        </button>
        <button
          type="button"
          className={styles.button}
          disabled={active}
          onClick={() => restart('step')}
        >
          Step through
        </button>
        {status.state === 'waiting' && (
          <button type="button" className={styles.play} onClick={() => run.current?.next?.()}>
            Next step →
          </button>
        )}
        {active && (
          <button type="button" className={styles.button} onClick={stop}>
            ■ Stop
          </button>
        )}
        <span className={styles.status} role="status">
          {status.state === 'running' && `Playing ${currentStep + 1}/${useCase.steps.length}`}
          {status.state === 'waiting' && `Next: ${currentStep + 1}/${useCase.steps.length}`}
          {status.state === 'done' && 'Done ✓'}
          {status.state === 'error' && `Step ${currentStep + 1} failed: ${status.message}`}
          {status.state === 'idle' && 'Plays on a fresh session'}
        </span>
      </div>
      <ol className={styles.steps} aria-label="Steps">
        {useCase.steps.map((step, index) => (
          <li
            key={index}
            className={[
              styles.step,
              index < currentStep || status.state === 'done' ? styles.stepDone : '',
              index === currentStep ? styles.stepCurrent : '',
              index === currentStep && status.state === 'error' ? styles.stepError : '',
            ].join(' ')}
          >
            {index + 1}. {describeStep(step)}
          </li>
        ))}
      </ol>
      <dl className={styles.details}>
        <dt>Expected</dt>
        <dd>{useCase.expected}</dd>
        <dt>Checks</dt>
        <dd>
          <ul className={styles.checks}>
            {useCase.checks.map((check) => (
              <li key={check}>{check}</li>
            ))}
          </ul>
        </dd>
        <dt>Status: {STATUS_LABELS[useCase.status.state]}</dt>
        <dd>{useCase.status.note ?? 'Plays as expected on the service.'}</dd>
        {useCase.related && (
          <>
            <dt>Related</dt>
            <dd>
              {useCase.related.map(({id, title}, index) => (
                <span key={id}>
                  {index > 0 && ', '}
                  <a href={USE_CASE_SHEET_URL} target="_blank" rel="noreferrer">
                    {id} · {title}
                  </a>
                </span>
              ))}
            </dd>
          </>
        )}
      </dl>
    </section>
  );
}
