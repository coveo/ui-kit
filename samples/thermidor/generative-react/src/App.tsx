import {useState} from 'react';
import {AppShell} from '@mantine/core';
import {Header} from './components/Header/Header.js';
import {BackendResults} from './components/BackendResults/BackendResults.js';
import {ChatWidget} from './components/ChatWidget/ChatWidget.js';

export default function App() {
  const [chatExpanded, setChatExpanded] = useState(false);

  return (
    <AppShell header={{height: 60}} padding="md">
      <AppShell.Header>
        <Header />
      </AppShell.Header>

      <AppShell.Main>
        {!chatExpanded && <BackendResults />}
        <ChatWidget expanded={chatExpanded} onExpandChange={setChatExpanded} />
      </AppShell.Main>
    </AppShell>
  );
}
