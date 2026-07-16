"use client";
import { Editor } from "@monaco-editor/react";
import { useState } from "react";
import { EventDropdown } from "./validator/event-dropdown";
import { events } from "./events";
import {
  Anchor,
  Box,
  Button,
  Flex,
  Grid,
  List,
  Space,
  Title,
} from "@mantine/core";
import { relay } from "../relay";

export default function Page() {
  function prettify(obj: object) {
    return JSON.stringify(obj, null, 2);
  }

  const initialEvent = events[0];

  const [event, setEvent] = useState(initialEvent);
  const [payload, setPayload] = useState(prettify(initialEvent.payload));
  const isResettable = prettify(event.payload) !== payload;

  function send() {
    relay.emit(event.type, JSON.parse(payload));
  }

  function reset() {
    setPayload(prettify(event.payload));
  }

  function onSelectEvent(selected: string) {
    const selectedEvent = events.find((event) => event.type === selected);

    if (!selectedEvent) {
      return;
    }

    setEvent(selectedEvent);
    setPayload(prettify(selectedEvent.payload));
  }

  return (
    <Grid>
      <Grid.Col span={5}>
        <EventDropdown
          events={events}
          selectedEventType={event.type}
          onSelectEvent={onSelectEvent}
        />
        <Space h="md" />
        <Flex>
          <Button onClick={send}>Send</Button>
          <Space w="sm" />
          {isResettable ? (
            <Button onClick={reset} color="grey">
              Reset
            </Button>
          ) : null}
        </Flex>
        <Space h="md" />
        <Box h={600}>
          <Editor
            language="json"
            theme="vs-dark"
            value={payload}
            options={{ minimap: { enabled: false }, contextmenu: false }}
            onChange={(value) => value && setPayload(value)}
          />
        </Box>
      </Grid.Col>
      <Grid.Col span={7}>
        <Title order={2}>
          How to validate event(s) with the Explorer chrome extension
        </Title>
        <Space h="md" />
        <List type="ordered">
          <List.Item>
            Install the extension{" "}
            <Anchor
              href={
                "https://chromewebstore.google.com/detail/coveo-explorer/akkdleiokjfjokbaglggbmikofodocik"
              }
              target="_blank"
            >
              here.
            </Anchor>
          </List.Item>
          <List.Item>Once installed, click on the icon to toggle on.</List.Item>
          <List.Item>
            Expand Explorer to see the validated events list.
          </List.Item>
        </List>
      </Grid.Col>
    </Grid>
  );
}
