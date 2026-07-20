import {useState, useEffect, useCallback, useRef} from 'react';
import {Autocomplete, Group, Box, Text} from '@mantine/core';
import {useDebouncedCallback} from '@mantine/hooks';
import {
  converseController,
  generativeInterface,
} from '../../generative-setup.js';
import {getOrCreateBackendSurfacesSelectors} from '@/src/core/internal/backend-surfaces/backend-surfaces-selectors.js';
import {ENGINE, STATE_ID} from '@/src/core/interface/utils/symbols.js';
import {generateId} from '@/src/core/interface/utils/id-generator.js';

export function Header() {
  const [searchValue, setSearchValue] = useState('');
  const [interfaceId, setInterfaceId] = useState<string | undefined>();
  const [completions, setCompletions] = useState<string[]>([]);
  const [dropdownOpened, setDropdownOpened] = useState(false);
  // Placeholder interface ID used for suggestion requests before any
  // search has been submitted (the server accepts fetch_suggestions for
  // an interfaceId it has never seen, and simply echoes it back).
  const placeholderInterfaceIdRef = useRef(generateId());

  const engine = generativeInterface[ENGINE];
  const stateId = generativeInterface[STATE_ID];

  useEffect(() => {
    const selectors = getOrCreateBackendSurfacesSelectors(stateId);
    return engine.subscribe(selectors.getSurfaces, (interfaces) => {
      const mainId = Object.keys(interfaces).find(
        (id) => interfaces[id]?.display === 'main'
      );
      setInterfaceId(mainId);
    });
  }, [engine, stateId]);

  const suggestionsInterfaceId =
    interfaceId ?? placeholderInterfaceIdRef.current;

  useEffect(() => {
    const selectors = getOrCreateBackendSurfacesSelectors(stateId);
    const getSuggestions = selectors.getSuggestions(suggestionsInterfaceId);
    return engine.subscribe(getSuggestions, (suggestions) => {
      setCompletions(suggestions?.completions.map((c) => c.expression) ?? []);
    });
  }, [engine, stateId, suggestionsInterfaceId]);

  const fetchSuggestions = useDebouncedCallback((query: string) => {
    if (!query.trim()) {
      return;
    }
    converseController.sendAction({
      type: 'fetch_suggestions',
      surfaceId: suggestionsInterfaceId,
      query: query.trim(),
    });
  }, 200);

  const handleChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      setDropdownOpened(true);
      fetchSuggestions(value);
    },
    [fetchSuggestions]
  );

  const submitSearch = useCallback((query: string) => {
    setDropdownOpened(false);
    if (query.trim()) {
      converseController.sendAction({
        type: 'execute_search',
        query: query.trim(),
      });
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitSearch(searchValue);
  };

  return (
    <Group h="100%" px="md" wrap="nowrap">
      <Text fw={700} size="lg" style={{whiteSpace: 'nowrap'}}>
        Barca Sports
      </Text>

      <Box
        component="form"
        onSubmit={handleSubmit}
        style={{flex: 1, maxWidth: 700}}
      >
        <Autocomplete
          placeholder="Search products..."
          value={searchValue}
          onChange={handleChange}
          onOptionSubmit={submitSearch}
          data={completions}
          dropdownOpened={dropdownOpened}
          onDropdownClose={() => setDropdownOpened(false)}
          leftSection={<SearchIcon />}
          size="md"
          radius="xl"
          styles={{
            input: {
              border: '1px solid var(--mantine-color-gray-3)',
            },
          }}
        />
      </Box>
    </Group>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
