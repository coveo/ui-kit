import type {
  FacetGenerator as FacetGeneratorController,
  FacetType,
} from '@coveo/headless/ssr-commerce';
import {escapeHtml, getElement} from '../common/utils.js';

type FacetStates = FacetGeneratorController['state'];
type FacetState = FacetStates[number];

// A structural view over the different facet value shapes (regular values have
// `value`; range values have `start`/`end`). Kept intentionally permissive so a
// single renderer can handle every facet type.
interface FacetValueView {
  value?: string;
  start?: number | string;
  end?: number | string;
  numberOfResults: number;
  state: string;
}

// Facets intentionally kept out of the facet rail (surfaced elsewhere / noisy).
const EXCLUDED_FACET_IDS = new Set(['ec_price', 'ec_rating']);

const FACET_CLASS: Record<string, string> = {
  regular: 'RegularFacet',
  numericalRange: 'NumericFacet',
  dateRange: 'DateFacet',
  hierarchical: 'CategoryFacet',
  location: 'RegularFacet',
};

function hasVisibleFacets(states: FacetStates): boolean {
  return states.some((facet) => !EXCLUDED_FACET_IDS.has(facet.facetId) && facet.values.length > 0);
}

function facetValueLabel(facet: FacetState, value: FacetValueView): string {
  if (facet.type === 'numericalRange' || facet.type === 'dateRange') {
    return `${value.start} – ${value.end}`;
  }
  return String(value.value ?? '');
}

function renderFacet(facet: FacetState): string {
  const displayName = facet.displayName ?? facet.facetId;
  const values = (facet.values as unknown as FacetValueView[])
    .map((value, index) => {
      const id = `facet-${facet.facetId}-${index}`;
      const checked = value.state !== 'idle' ? ' checked' : '';
      return `
        <li class="FacetValue">
          <input
            type="checkbox"
            class="FacetValueCheckbox"
            id="${escapeHtml(id)}"
            data-facet-id="${escapeHtml(facet.facetId)}"
            data-facet-type="${facet.type}"
            data-value-index="${index}"${checked}
          />
          <label class="FacetValueLabel" for="${escapeHtml(id)}">
            <span class="FacetValueName">${escapeHtml(facetValueLabel(facet, value))}</span>
            <span class="FacetValueCount">${value.numberOfResults}</span>
          </label>
        </li>`;
    })
    .join('');

  return `
    <fieldset class="${FACET_CLASS[facet.type] ?? 'RegularFacet'}">
      <legend class="FacetHeader">
        <span class="FacetDisplayName">${escapeHtml(displayName)}</span>
      </legend>
      <ul class="FacetValues">${values}</ul>
    </fieldset>`;
}

/** The visible facets. Assumes at least one is visible. */
function renderFacetList(states: FacetStates): string {
  return states
    .filter((facet) => !EXCLUDED_FACET_IDS.has(facet.facetId))
    .map(renderFacet)
    .join('');
}

export function renderFacets(states: FacetStates): string {
  const visible = hasVisibleFacets(states);
  return `<nav id="facets" class="Facets" aria-label="Filters" style="display: ${
    visible ? 'flex' : 'none'
  };">${visible ? renderFacetList(states) : ''}</nav>`;
}

export function hydrateFacets(facetGenerator: FacetGeneratorController) {
  const container = getElement<HTMLElement>('facets');
  if (!container) return;

  const update = () => {
    const visible = hasVisibleFacets(facetGenerator.state);
    container.style.display = visible ? 'flex' : 'none';
    container.innerHTML = visible ? renderFacetList(facetGenerator.state) : '';
  };

  facetGenerator.subscribe(update);
  update();

  // Event delegation keeps the handler stable across re-renders.
  container.addEventListener('change', (event) => {
    const input = event.target as HTMLInputElement;
    if (!input.classList.contains('FacetValueCheckbox')) return;

    const facetId = input.dataset.facetId;
    const type = input.dataset.facetType as FacetType | undefined;
    const index = Number(input.dataset.valueIndex);
    if (!facetId || !type || Number.isNaN(index)) return;

    toggleFacetValue(facetGenerator, facetId, type, index);
  });
}

// Toggling is done per facet type so each controller receives its own value
// shape (keeps everything type-safe without casts).
function toggleFacetValue(
  facetGenerator: FacetGeneratorController,
  facetId: string,
  type: FacetType,
  index: number
) {
  switch (type) {
    case 'regular': {
      const facet = facetGenerator.getFacetController(facetId, 'regular');
      const value = facet?.state.values[index];
      if (facet && value) facet.toggleSelect(value);
      break;
    }
    case 'numericalRange': {
      const facet = facetGenerator.getFacetController(facetId, 'numericalRange');
      const value = facet?.state.values[index];
      if (facet && value) facet.toggleSelect(value);
      break;
    }
    case 'dateRange': {
      const facet = facetGenerator.getFacetController(facetId, 'dateRange');
      const value = facet?.state.values[index];
      if (facet && value) facet.toggleSelect(value);
      break;
    }
    case 'hierarchical': {
      const facet = facetGenerator.getFacetController(facetId, 'hierarchical');
      const value = facet?.state.values[index];
      if (facet && value) facet.toggleSelect(value);
      break;
    }
    default:
      break;
  }
}
