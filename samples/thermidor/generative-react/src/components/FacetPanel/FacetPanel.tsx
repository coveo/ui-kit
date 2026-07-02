import {useState, useEffect, useRef, useCallback} from 'react';
import {
  Stack,
  Text,
  Checkbox,
  Group,
  TextInput,
  UnstyledButton,
  RangeSlider,
  Box,
} from '@mantine/core';
import {
  buildBackendFacetController,
  buildBackendNumericFacetController,
  type BackendFacetController,
  type BackendFacetControllerState,
  type BackendFacetSearchState,
  type BackendNumericFacetController,
  type BackendNumericFacetControllerState,
} from '@coveo/thermidor';
import {
  converseController,
  generativeInterface,
} from '../../generative-setup.js';

interface FacetData {
  facetId: string;
  field: string;
  displayName: string;
  type: string;
  values: Array<{
    value: string;
    state: 'idle' | 'selected' | 'excluded';
    numberOfResults: number;
  }>;
  moreValuesAvailable: boolean;
}

interface FacetPanelProps {
  interfaceId: string;
  facets: FacetData[];
}

export function FacetPanel({interfaceId, facets}: FacetPanelProps) {
  if (!facets.length) return null;

  return (
    <Stack gap="lg">
      {facets.map((facet) =>
        facet.type === 'numericalRange' ? (
          <NumericFacetGroup
            key={facet.facetId}
            interfaceId={interfaceId}
            facetId={facet.facetId}
          />
        ) : (
          <FacetGroup
            key={facet.facetId}
            interfaceId={interfaceId}
            facetId={facet.facetId}
          />
        )
      )}
    </Stack>
  );
}

interface FacetGroupProps {
  interfaceId: string;
  facetId: string;
}

function FacetGroup({interfaceId, facetId}: FacetGroupProps) {
  const [state, setState] = useState<BackendFacetControllerState>({
    facetId,
    field: '',
    displayName: '',
    values: [],
    hasActiveValues: false,
    moreValuesAvailable: false,
  });
  const [searchState, setSearchState] = useState<BackendFacetSearchState>({
    query: '',
    values: [],
    moreValuesAvailable: false,
  });
  const [searchInput, setSearchInput] = useState('');
  const controllerRef = useRef<BackendFacetController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const controller = buildBackendFacetController({
      interface: generativeInterface,
      converseController,
      interfaceId,
      facetId,
    });

    controllerRef.current = controller;
    setState(controller.state);
    setSearchState(controller.facetSearch.state);

    const unsub1 = controller.subscribe(() => setState(controller.state));
    const unsub2 = controller.facetSearch.subscribe(() =>
      setSearchState(controller.facetSearch.state)
    );

    return () => {
      unsub1();
      unsub2();
    };
  }, [interfaceId, facetId]);

  const handleSearchInput = useCallback((val: string) => {
    setSearchInput(val);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!val) {
      controllerRef.current?.facetSearch.clear();
      setSearchState({query: '', values: [], moreValuesAvailable: false});
      return;
    }

    debounceRef.current = setTimeout(() => {
      controllerRef.current?.facetSearch.updateText(val);
      controllerRef.current?.facetSearch.search();
    }, 100);
  }, []);

  if (!state.values.length) return null;

  const showSearchResults =
    searchInput.length > 0 && searchState.values.length > 0;

  return (
    <Box>
      <Group justify="space-between" mb={4}>
        <Text fw={700} size="sm">
          {state.displayName || facetId}
        </Text>
        {state.hasActiveValues && (
          <UnstyledButton onClick={() => controllerRef.current?.deselectAll()}>
            <Text size="xs" c="dimmed" td="underline">
              Clear
            </Text>
          </UnstyledButton>
        )}
      </Group>

      {state.moreValuesAvailable && (
        <TextInput
          size="xs"
          placeholder={`Search ${state.displayName || facetId}...`}
          value={searchInput}
          onChange={(e) => handleSearchInput(e.currentTarget.value)}
          mb={4}
        />
      )}

      {showSearchResults ? (
        <Stack gap={2}>
          {searchState.values.map((searchValue) => (
            <UnstyledButton
              key={searchValue.rawValue}
              onClick={() => {
                controllerRef.current?.facetSearch.select(searchValue);
                setSearchInput('');
                setSearchState({
                  query: '',
                  values: [],
                  moreValuesAvailable: false,
                });
              }}
              py={2}
              px={4}
              style={{borderRadius: 4}}
            >
              <Group justify="space-between" wrap="nowrap">
                <Text size="xs" truncate>
                  {searchValue.displayValue}
                </Text>
                <Text size="xs" c="dimmed">
                  {searchValue.count}
                </Text>
              </Group>
            </UnstyledButton>
          ))}
        </Stack>
      ) : (
        <Stack gap={2}>
          {state.values.map((facetValue) => (
            <Group
              key={facetValue.value}
              justify="space-between"
              wrap="nowrap"
              gap="xs"
            >
              <Checkbox
                size="xs"
                label={facetValue.value}
                checked={facetValue.state === 'selected'}
                onChange={() =>
                  controllerRef.current?.toggleSelect(facetValue.value)
                }
                styles={{label: {fontSize: 13}}}
              />
              <Text size="xs" c="dimmed">
                {facetValue.numberOfResults}
              </Text>
            </Group>
          ))}
        </Stack>
      )}
    </Box>
  );
}

function NumericFacetGroup({interfaceId, facetId}: FacetGroupProps) {
  const [state, setState] = useState<BackendNumericFacetControllerState>({
    facetId,
    field: '',
    displayName: '',
    values: [],
    hasActiveValues: false,
    domain: undefined,
    interval: '',
  });
  const [rangeValue, setRangeValue] = useState<[number, number]>([0, 100]);
  const controllerRef = useRef<BackendNumericFacetController | null>(null);

  useEffect(() => {
    const controller = buildBackendNumericFacetController({
      interface: generativeInterface,
      converseController,
      interfaceId,
      facetId,
    });

    controllerRef.current = controller;
    setState(controller.state);

    if (controller.state.domain) {
      setRangeValue([controller.state.domain.min, controller.state.domain.max]);
    }

    return controller.subscribe(() => {
      setState(controller.state);
      if (controller.state.domain) {
        setRangeValue([
          controller.state.domain.min,
          controller.state.domain.max,
        ]);
      }
    });
  }, [interfaceId, facetId]);

  if (!state.values.length && !state.domain) return null;

  const handleRangeChangeEnd = (value: [number, number]) => {
    controllerRef.current?.setRange({
      start: value[0],
      end: value[1],
      endInclusive: true,
    });
  };

  return (
    <Box>
      <Group justify="space-between" mb={4}>
        <Text fw={700} size="sm">
          {state.displayName || facetId}
        </Text>
        {state.hasActiveValues && (
          <UnstyledButton onClick={() => controllerRef.current?.deselectAll()}>
            <Text size="xs" c="dimmed" td="underline">
              Clear
            </Text>
          </UnstyledButton>
        )}
      </Group>

      {state.domain && (
        <>
          <Text size="xs" c="dimmed" mb={4}>
            ${Math.round(rangeValue[0])} – ${Math.round(rangeValue[1])}
          </Text>
          <RangeSlider
            min={state.domain.min}
            max={state.domain.max}
            value={rangeValue}
            onChange={setRangeValue}
            onChangeEnd={handleRangeChangeEnd}
            size="sm"
            mb="xs"
            label={(val) => `$${Math.round(val)}`}
          />
        </>
      )}

      {state.values.length > 0 && (
        <Stack gap={2}>
          {state.values.map((rangeValue) => (
            <Group
              key={`${rangeValue.start}-${rangeValue.end}`}
              justify="space-between"
              wrap="nowrap"
              gap="xs"
            >
              <Checkbox
                size="xs"
                label={`$${Math.round(rangeValue.start)} – $${Math.round(rangeValue.end)}`}
                checked={rangeValue.state === 'selected'}
                onChange={() => controllerRef.current?.toggleSelect(rangeValue)}
                styles={{label: {fontSize: 13}}}
              />
              <Text size="xs" c="dimmed">
                {rangeValue.numberOfResults}
              </Text>
            </Group>
          ))}
        </Stack>
      )}
    </Box>
  );
}
