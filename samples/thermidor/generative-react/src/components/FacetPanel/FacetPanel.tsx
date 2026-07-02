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
  const [fullDomain, setFullDomain] = useState<{
    min: number;
    max: number;
  } | null>(null);
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

    const getDomain = (s: BackendNumericFacetControllerState) =>
      s.domain ??
      (s.values.length > 0
        ? {min: s.values[0].start, max: s.values[s.values.length - 1].end}
        : null);

    const getSelectedRange = (
      s: BackendNumericFacetControllerState
    ): [number, number] | null => {
      const selected = s.values.filter((v: any) => v.state === 'selected');
      if (selected.length > 0) {
        return [selected[0].start, selected[selected.length - 1].end];
      }
      return null;
    };

    const initDomain = (
      d: {min: number; max: number} | null,
      sel: [number, number] | null
    ) => {
      if (!d) return;
      setFullDomain((prev) => {
        if (!prev) return d;
        return {
          min: Math.min(prev.min, d.min, ...(sel ? [sel[0]] : [])),
          max: Math.max(prev.max, d.max, ...(sel ? [sel[1]] : [])),
        };
      });
    };

    const d = getDomain(controller.state);
    const selected = getSelectedRange(controller.state);
    initDomain(d, selected);

    if (selected) {
      setRangeValue(selected);
    } else if (d) {
      setRangeValue([d.min, d.max]);
    }

    return controller.subscribe(() => {
      setState(controller.state);
      const updated = getDomain(controller.state);
      const sel = getSelectedRange(controller.state);
      initDomain(updated, sel);

      if (sel) {
        setRangeValue(sel);
      }
    });
  }, [interfaceId, facetId]);

  if (!state.values.length && !state.domain) return null;

  const domain =
    fullDomain ??
    state.domain ??
    (state.values.length > 0
      ? {
          min: state.values[0].start,
          max: state.values[state.values.length - 1].end,
        }
      : null);

  const commitRange = (value: [number, number]) => {
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

      {domain && (
        <>
          <Text size="sm" c="dimmed" mb={8}>
            ${Math.round(rangeValue[0]).toLocaleString()} – $
            {Math.round(rangeValue[1]).toLocaleString()}
          </Text>
          <DebouncedRangeSlider
            min={domain.min}
            max={domain.max}
            value={rangeValue}
            onChange={setRangeValue}
            onCommit={commitRange}
            color="dark"
            size="lg"
            label={null}
            thumbSize={20}
            styles={{
              thumb: {
                backgroundColor: 'white',
                borderWidth: 3,
                borderColor: 'var(--mantine-color-dark-9)',
              },
            }}
          />
        </>
      )}
    </Box>
  );
}

function DebouncedRangeSlider({
  onChange,
  onCommit,
  ...props
}: Omit<
  React.ComponentProps<typeof RangeSlider>,
  'onChange' | 'onChangeEnd'
> & {
  onChange: (value: [number, number]) => void;
  onCommit: (value: [number, number]) => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (value: [number, number]) => {
    onChange(value);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      onCommit(value);
    }, 500);
  };

  const handleChangeEnd = (value: [number, number]) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onCommit(value);
  };

  return (
    <RangeSlider
      {...props}
      onChange={handleChange}
      onChangeEnd={handleChangeEnd}
    />
  );
}
