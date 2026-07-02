import {useState} from 'react';
import {Group, TextInput, Box, Text} from '@mantine/core';
import {converseController} from '../../generative-setup.js';

export function Header() {
  const [searchValue, setSearchValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      converseController.sendAction({
        type: 'execute_search',
        query: searchValue.trim(),
      });
    }
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
        <TextInput
          placeholder="Search products..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.currentTarget.value)}
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
