/**
 * Component grouping for differential (batched) AI audits.
 *
 * Groups structurally similar Atomic components by archetype so that
 * only the archetype receives a full audit and variants get a lightweight
 * differential call that references the archetype's results.
 *
 * Cross-surface naming patterns:
 *   atomic-commerce-search-box  → archetype: atomic-search-box
 *   atomic-insight-facet        → archetype: atomic-facet
 *   atomic-recs-interface       → archetype: atomic-interface
 *   atomic-product-text         → archetype: atomic-result-text  (product↔result)
 */

/** Surface-specific segments stripped to derive the archetype. */
const SURFACE_SEGMENTS = ['commerce-', 'insight-', 'ipx-', 'recs-'] as const;

/** Bidirectional synonym pairs that map to a canonical form. */
const SYNONYM_PAIRS: ReadonlyArray<[string, string, string]> = [
  // [variantToken, archetypeToken, direction]
  ['product-', 'result-', 'result-'],
];

export interface ComponentGroup {
  /** Canonical archetype name (e.g. "atomic-search-box"). */
  archetype: string;
  /** Component name chosen as the archetype representative. */
  archetypeComponent: string;
  /** All component names in this group, including the archetype representative. */
  members: string[];
}

/**
 * Derive the archetype key from a component name.
 *
 * 1. Strip the `atomic-` prefix.
 * 2. Remove surface segments (commerce-, insight-, ipx-, recs-).
 * 3. Normalize synonym pairs (product- → result-).
 * 4. Re-add the `atomic-` prefix.
 *
 * @example
 * extractArchetype('atomic-commerce-search-box') // → 'atomic-search-box'
 * extractArchetype('atomic-product-text')         // → 'atomic-result-text'
 * extractArchetype('atomic-facet')                // → 'atomic-facet'
 */
export function extractArchetype(componentName: string): string {
  let core = componentName;

  // Strip atomic- prefix for processing
  if (core.startsWith('atomic-')) {
    core = core.slice('atomic-'.length);
  }

  // Remove surface segments
  for (const segment of SURFACE_SEGMENTS) {
    if (core.startsWith(segment)) {
      core = core.slice(segment.length);
      break; // Only one surface segment per component name
    }
  }

  // Normalize synonyms to canonical form
  for (const [variantToken, _archetypeToken, canonical] of SYNONYM_PAIRS) {
    if (core.startsWith(variantToken)) {
      core = canonical + core.slice(variantToken.length);
      break;
    }
  }

  return `atomic-${core}`;
}

/**
 * Group components by archetype.
 *
 * For each group, the archetype representative is chosen as:
 *   1. The member whose name exactly matches the archetype key, OR
 *   2. The first member alphabetically (stable tie-break).
 *
 * @param componentNames - List of component tag names (e.g. from story discovery).
 * @returns Array of component groups, sorted by archetype name.
 */
export function groupComponents(componentNames: string[]): ComponentGroup[] {
  const groupMap = new Map<string, string[]>();

  for (const name of componentNames) {
    const key = extractArchetype(name);
    const members = groupMap.get(key);
    if (members) {
      members.push(name);
    } else {
      groupMap.set(key, [name]);
    }
  }

  const groups: ComponentGroup[] = [];

  for (const [archetype, members] of groupMap) {
    members.sort((a, b) => a.localeCompare(b, 'en-US'));

    // Prefer the member whose name matches the archetype exactly
    const exact = members.find((m) => m === archetype);
    const archetypeComponent = exact ?? members[0];

    groups.push({archetype, archetypeComponent, members});
  }

  return groups.sort((a, b) => a.archetype.localeCompare(b.archetype, 'en-US'));
}
