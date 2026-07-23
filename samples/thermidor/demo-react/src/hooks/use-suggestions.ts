import type {SuggestionSection} from '../components/SuggestionsDropdown/types.js';

export interface UseSuggestionsOptions {
  inputValue: string;
  context: 'landing' | 'search-results';
}

export interface UseSuggestionsResult {
  sections: SuggestionSection[];
  isLoading: boolean;
}

const LANDING_SECTIONS: SuggestionSection[] = [
  {
    id: 'search',
    title: 'Search',
    icon: 'search',
    items: [
      {id: 's1', label: 'Surfboards'},
      {id: 's2', label: 'Wetsuits'},
      {id: 's3', label: 'Kayaks'},
      {id: 's4', label: 'Snorkeling gear'},
    ],
  },
  {
    id: 'conversational',
    title: 'Conversational',
    icon: 'sparkle',
    items: [
      {
        id: 'c1',
        label: 'Build a beginner surfing kit',
        subtitle:
          'Shopping / Grid-based starter kit or discovery layout that spans several adjacent product types.',
      },
      {
        id: 'c2',
        label: 'What should I pack for a snorkeling trip?',
        subtitle:
          'Shopping / Focused product-grid layout for a single shopping task with lightweight filtering.',
      },
      {
        id: 'c3',
        label: 'Compare wetsuits for cold-water surfing',
        subtitle:
          'Shopping / Side-by-side evaluation layout for a small, agent-curated set of products.',
      },
    ],
  },
];

const SEARCH_RESULTS_SECTIONS: SuggestionSection[] = [
  {
    id: 'refinements',
    title: 'Search refinements',
    icon: 'filter-sparkle',
    items: [
      {id: 'r1', label: 'Show boards under $400'},
      {id: 'r2', label: 'Beginner-friendly only'},
      {id: 'r3', label: 'Sort by price low to high'},
    ],
  },
  ...LANDING_SECTIONS,
];

export function useSuggestions(
  options: UseSuggestionsOptions
): UseSuggestionsResult {
  const {context: _context, inputValue: _inputValue} = options;

  const sections =
    _context === 'search-results' ? SEARCH_RESULTS_SECTIONS : LANDING_SECTIONS;

  return {sections, isLoading: false};
}
