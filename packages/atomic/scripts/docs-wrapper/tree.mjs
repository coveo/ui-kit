/**
 * Parses the flat Storybook manifest entries into a hierarchical tree.
 *
 * Titles use "/" separators, e.g. "Commerce/Breadbox", "Search/Facet (Numeric)".
 * Entries are grouped by the first segment (section) and then by the remaining
 * title (component group).
 *
 * @typedef {{ id: string, name: string, type: 'story' | 'docs', title: string }} TreeEntry
 *
 * @param {Record<string, { id: string, title: string, name: string, type: string }>} entries
 * @returns {Map<string, Map<string, TreeEntry[]>>}  sections → groups → entries
 */
export function buildTree(entries) {
  /** @type {Map<string, Map<string, TreeEntry[]>>} */
  const sections = new Map();

  const sectionOrder = [
    'Introduction',
    'Commerce',
    'Search',
    'Common',
    'Insight',
    'Recommendations',
    'IPX',
  ];

  for (const entry of Object.values(entries)) {
    // Skip the crawling story — not useful in the docs wrapper
    if (entry.id === 'crawling--crawling') continue;

    const titleParts = entry.title.split('/');
    const section = titleParts[0];
    const groupTitle = titleParts.slice(1).join('/') || entry.title;

    if (!sections.has(section)) {
      sections.set(section, new Map());
    }
    const groups = sections.get(section);

    if (!groups.has(groupTitle)) {
      groups.set(groupTitle, []);
    }
    groups.get(groupTitle).push({
      id: entry.id,
      name: entry.name,
      type: entry.type,
      title: entry.title,
    });
  }

  // Sort sections by predefined order, then alphabetically for unknowns
  const sorted = new Map();
  for (const name of sectionOrder) {
    if (sections.has(name)) {
      sorted.set(name, sortGroups(sections.get(name)));
    }
  }
  for (const [name, groups] of sections) {
    if (!sorted.has(name)) {
      sorted.set(name, sortGroups(groups));
    }
  }

  return sorted;
}

/**
 * Reorder groups within a section so "Introduction" appears first
 * and "Example Pages" second, with all other groups following in
 * their original order.
 *
 * @param {Map<string, Array>} groups
 * @returns {Map<string, Array>}
 */
function sortGroups(groups) {
  const priorityOrder = ['Introduction', 'Example Pages'];
  const reordered = new Map();

  for (const name of priorityOrder) {
    if (groups.has(name)) {
      reordered.set(name, groups.get(name));
    }
  }
  for (const [name, items] of groups) {
    if (!reordered.has(name)) {
      reordered.set(name, items);
    }
  }

  return reordered;
}
