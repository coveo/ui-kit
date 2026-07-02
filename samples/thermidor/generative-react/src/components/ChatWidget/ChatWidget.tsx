import {useState, useEffect, useRef, useCallback} from 'react';
import {
  Paper,
  Group,
  Text,
  TextInput,
  ActionIcon,
  Stack,
  Box,
  UnstyledButton,
} from '@mantine/core';
import {converseController} from '../../generative-setup.js';
import {ConversationArea} from '../ConversationArea/ConversationArea.js';
import styles from './ChatWidget.module.css';

interface Turn {
  id: string;
  prompt: string;
  status: 'streaming' | 'complete' | 'error';
  agentResponse?: {
    messages: {content: string; role: string}[];
    surfaces: Record<string, unknown>[];
    toolCalls: {
      id: string;
      name: string;
      args: string;
      result?: string;
      status: 'calling' | 'completed';
    }[];
  };
  error?: string;
}

interface ConverseState {
  turns: Turn[];
  activeTurnId: string | undefined;
  activeTurn: Turn | undefined;
  isStreaming: boolean;
}

export function ChatWidget({
  expanded,
  onExpandChange,
}: {
  expanded: boolean;
  onExpandChange: (expanded: boolean) => void;
}) {
  const [state, setState] = useState<ConverseState>(converseController.state);
  const [inputValue, setInputValue] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return converseController.subscribe(() => {
      setState(converseController.state);
    });
  }, []);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [state.turns.length, state.turns[state.turns.length - 1]?.agentResponse]);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      const trimmed = inputValue.trim();
      if (trimmed && !state.isStreaming) {
        converseController.submit({prompt: trimmed});
        setInputValue('');
      }
    },
    [inputValue, state.isStreaming]
  );

  const handleRetry = useCallback((id: string) => {
    converseController.retry({id});
  }, []);

  const handleAction = useCallback((text: string, _type: string) => {
    converseController.submit({prompt: text});
  }, []);

  return (
    <Paper
      className={`${styles.widget} ${collapsed ? styles.collapsed : ''} ${expanded ? styles.expanded : ''}`}
      shadow={expanded ? 'none' : 'lg'}
      radius={expanded ? 0 : 'lg'}
      withBorder={!expanded}
      style={{display: 'flex', flexDirection: 'column'}}
    >
      {expanded && (
        <Box px="md" py="sm">
          <UnstyledButton
            onClick={() => onExpandChange(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 20,
              border: '1px solid var(--mantine-color-gray-3)',
              fontSize: 14,
            }}
          >
            ← Back to search results
          </UnstyledButton>
        </Box>
      )}

      {!expanded && (
        <Group
          className={styles.header}
          justify="space-between"
          px="sm"
          py="xs"
        >
          <Text fw={600} size="sm">
            Chat
          </Text>
          <Group gap={4}>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={() => onExpandChange(true)}
            >
              <ExpandIcon />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={() => setCollapsed((c) => !c)}
            >
              {collapsed ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </ActionIcon>
          </Group>
        </Group>
      )}

      {(expanded || !collapsed) && (
        <>
          <div className={styles.messages} ref={viewportRef}>
            {state.turns.length === 0 ? (
              <Text size="xs" c="dimmed" ta="center" py="md">
                Ask a question to get started.
              </Text>
            ) : (
              <Stack gap="sm" p="sm">
                {state.turns.map((turn) => (
                  <ConversationArea
                    key={turn.id}
                    turn={turn}
                    isStreaming={
                      state.isStreaming && turn.status === 'streaming'
                    }
                    onRetry={handleRetry}
                    onAction={handleAction}
                  />
                ))}
              </Stack>
            )}
          </div>

          <Box
            component="form"
            onSubmit={handleSubmit}
            className={styles.inputArea}
            px="sm"
            pb="sm"
          >
            <TextInput
              placeholder="Ask something..."
              value={inputValue}
              onChange={(e) => setInputValue(e.currentTarget.value)}
              disabled={state.isStreaming}
              size="sm"
              radius="xl"
              rightSection={
                <Group gap={4} wrap="nowrap">
                  <ActionIcon variant="subtle" color="gray" size="sm">
                    <SmileIcon />
                  </ActionIcon>
                  <ActionIcon
                    variant="filled"
                    color="blue"
                    size="sm"
                    radius="xl"
                    onClick={() => handleSubmit()}
                    disabled={state.isStreaming || !inputValue.trim()}
                  >
                    <SendIcon />
                  </ActionIcon>
                </Group>
              }
              rightSectionWidth={60}
              styles={{
                input: {
                  border: '1px solid var(--mantine-color-gray-3)',
                },
              }}
            />
          </Box>
        </>
      )}
    </Paper>
  );
}

function ExpandIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 3h6v6" />
      <path d="M9 21H3v-6" />
      <path d="M21 3l-7 7" />
      <path d="M3 21l7-7" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 15 6-6 6 6" />
    </svg>
  );
}

function SmileIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" x2="9.01" y1="9" y2="9" />
      <line x1="15" x2="15.01" y1="9" y2="9" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}
