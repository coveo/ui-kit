# Requirements Document

## Introduction

This document specifies the requirements for the Conversation Mode feature of the `demo-react` sample application. Conversation Mode replaces the existing placeholder `ConversationPage` with a fully functional implementation that renders agent responses (messages, reasoning steps, and A2UI surfaces) in a vertical thread layout, supports multi-turn conversations with visible history, and provides streaming state indicators. The rendering infrastructure is adapted from the `generative-react` sample but uses a chat-style thread layout (all turns visible) instead of a single-turn-with-sidebar approach.

## Glossary

- **Conversation_Page**: The top-level component rendered when the App_Shell view state is `'conversation'`, displaying the full conversation thread and prompt input
- **Turn**: A unit of conversation from `@coveo/thermidor` containing a user prompt, a status (`'streaming'` | `'complete'` | `'error'`), and optionally an Agent_Response or Routed_Interface
- **Agent_Response**: The structured response from the agent containing messages, A2UI surfaces, and reasoning steps
- **Conversation_Thread**: The vertical list of all turns rendered chronologically as user prompt / agent response pairs
- **User_Prompt_Bubble**: A visual element displaying the user's submitted prompt text, aligned to distinguish it from agent content
- **Surface_Renderer**: A component that dispatches A2UI surface objects to typed component renderers (ProductCarousel, BundleDisplay, NextActionsBar, ComparisonTable, ComparisonSummary)
- **Streaming_Message**: A component that renders agent text messages as markdown using the `marked` library
- **Thinking_Block**: A collapsible component displaying reasoning steps and tool call progress during agent processing
- **Next_Actions_Bar**: A component rendering follow-up action buttons parsed from an A2UI surface
- **Skeleton**: A loading placeholder rendered while a surface is still streaming
- **Prompt_Input**: The text input component at the bottom of the conversation page used for submitting follow-up prompts
- **App_Shell**: The top-level component managing view state and the ConverseController
- **ConverseController**: The singleton controller from `@coveo/thermidor` managing conversation turns
- **Routed_Turn**: A Turn whose response contains a `routedInterface` rather than an `agentResponse`, representing a search query that produced commerce/search results
- **Turn_Separator**: A visual delimiter (e.g., horizontal rule or spacing) rendered between consecutive turns in the Conversation_Thread to mark turn boundaries

## Requirements

### Requirement 1: Conversation Thread Layout

**User Story:** As a user, I want to see my entire conversation history as a vertical thread, so that I can follow the progression of my interaction with the agent.

#### Acceptance Criteria

1. WHILE the View_State is `'conversation'`, THE Conversation_Page SHALL render all turns from the ConverseController state as a vertical Conversation_Thread in chronological order within one scrollable container (including Routed_Turns)
2. WHEN a Turn contains a user prompt, THE Conversation_Thread SHALL render a User_Prompt_Bubble displaying the prompt text immediately, regardless of whether the Turn's Agent_Response has arrived
3. WHEN a Turn contains an Agent_Response, THE Conversation_Thread SHALL render the Agent_Response content below the corresponding User_Prompt_Bubble
4. THE Conversation_Thread SHALL visually distinguish User_Prompt_Bubbles from agent response content by applying a different horizontal alignment to each (user prompts aligned to the right side, agent responses aligned to the left side)
5. WHEN the Conversation_Thread contains more than one turn, THE Conversation_Page SHALL render a Turn_Separator between each consecutive turn to visually mark turn boundaries

### Requirement 2: Agent Response Rendering

**User Story:** As a user, I want agent responses to display rich content including text messages, reasoning steps, and interactive surfaces, so that I receive comprehensive answers to my queries.

#### Acceptance Criteria

1. WHEN a Turn has an Agent_Response with one or more messages containing non-empty content, THE Conversation_Page SHALL render the messages as markdown using the Streaming_Message component
2. WHEN a Turn has an Agent_Response with one or more reasoning steps, THE Conversation_Page SHALL render a Thinking_Block displaying the reasoning steps and tool call statuses
3. WHEN a Turn has an Agent_Response with one or more A2UI surfaces, THE Conversation_Page SHALL render those surfaces using the Surface_Renderer
4. THE Conversation_Page SHALL render Agent_Response sub-components in the following DOM order: Thinking_Block first, then Streaming_Message, then Surface_Renderer
5. THE Surface_Renderer SHALL dispatch surfaces to the correct typed component (ProductCarousel, BundleDisplay, NextActionsBar, ComparisonTable, or ComparisonSummary) based on the surface component type
6. IF a surface has a component type not matching any of the known types (ProductCarousel, BundleDisplay, NextActionsBar, ComparisonTable, ComparisonSummary), THEN THE Surface_Renderer SHALL skip that surface without rendering any element for it
7. WHEN surfaces with loading indicators are present (surface ID starts with `skeleton-` or has `isLoading` prop set to true), THE Surface_Renderer SHALL render Skeleton placeholders after the real surfaces, with the count determined by: unique skeleton surface IDs for a given type minus the number of real surfaces of that type (generic `*-default` skeleton IDs are ignored when more specific skeleton IDs exist for the same type)
8. WHEN a fully loaded surface arrives for a component type that previously had Skeleton placeholders, THE Surface_Renderer SHALL progressively reduce the number of visible skeletons until none remain

### Requirement 3: Thinking Block

**User Story:** As a user, I want to see visual feedback while the agent is processing my prompt, so that I know the system is working and can optionally inspect the reasoning process in detail.

#### Acceptance Criteria

1. WHEN a prompt is submitted in conversation mode, THE Conversation_Page SHALL immediately render a Thinking_Block for the new turn, even before any streaming data arrives from the backend
2. THE Thinking_Block SHALL be collapsed by default, showing only a single summary line
3. WHILE no reasoning steps or tool calls have been received for the turn, THE Thinking_Block summary SHALL display the text "Working" followed by an animated "..." indicator
4. WHEN reasoning messages begin streaming, THE Thinking_Block summary SHALL display the text "Reasoning" followed by an animated "..." indicator
5. WHEN a tool call begins (a ToolCallStep with status `'calling'` appears), THE Thinking_Block summary SHALL display the text "Calling tool: <tool_name>" followed by an animated "..." indicator (where `<tool_name>` is the name of the active tool)
6. WHEN all reasoning steps are complete and streaming has finished (`isStreaming` is false), THE Thinking_Block summary SHALL display the static text "<N> tool calls" (where N is the count of tool call steps), or "1 tool call" if there is exactly one, with no animation. If there are no tool calls, display "Done."
7. THE Thinking_Block SHALL be rendered as a borderless expandable/collapsible section (no border, no background box), taking 100% of the available width
8. THE Thinking_Block summary SHALL display an expand/collapse icon (e.g., a chevron) that visually indicates the block can be expanded or collapsed, and the icon SHALL change orientation based on the open/closed state of the block
9. WHEN the user expands the Thinking_Block, THE Thinking_Block SHALL display reasoning text as it streams in, rendered as markdown using the `marked` library
10. WHEN tool calls are interlaced with reasoning text, THE expanded Thinking_Block SHALL render them inline at the position they occurred in the reasoning step sequence
11. THE expanded Thinking_Block SHALL render each tool call as a collapsed sub-section by default, with a summary line showing "Tool call: <tool_name>" and an expand/collapse icon matching the style of the parent Thinking_Block icon
12. WHEN the user expands a tool call sub-section, THE Thinking_Block SHALL display the full arguments (JSON) sent to the tool and the response received from the tool
13. WHILE a Turn has status `'streaming'`, THE Prompt_Input and its submit button SHALL be disabled to prevent concurrent submissions, and the submit button icon SHALL change from a magnifier to an animated loading spinner to indicate processing is in progress

### Requirement 4: Follow-Up Prompt Submission

**User Story:** As a user, I want to submit follow-up prompts within the conversation, so that I can continue the dialogue without starting over.

#### Acceptance Criteria

1. THE Conversation_Page SHALL render a Prompt_Input at the bottom of the page for entering follow-up prompts
2. WHEN the user submits a non-empty follow-up prompt via the Prompt_Input, THE Conversation_Page SHALL call the `onSubmit` handler provided by the App_Shell with the prompt text, and clear the Prompt_Input content
3. IF the Prompt_Input content is empty or contains only whitespace characters, THEN THE Conversation_Page SHALL keep the submit action disabled
4. WHEN a Next_Actions_Bar surface contains follow-up action buttons, THE Conversation_Page SHALL render those buttons
5. WHEN the user clicks a follow-up action button in the Next_Actions_Bar and the action has a non-empty text value, THE Conversation_Page SHALL submit the action text through the `onSubmit` handler
6. IF a follow-up action button has an undefined or empty text value, THEN THE Conversation_Page SHALL not call the `onSubmit` handler and SHALL not render that action button
7. WHILE a Turn has status `'streaming'`, THE Prompt_Input SHALL be disabled to prevent concurrent submissions
8. WHEN the user submits a prompt from the landing page or search results page, THE App_Shell SHALL remain on the current page until it can determine the response type: if the streaming turn produces reasoning content (reasoning steps appear in the agent response), navigate to the Conversation_Page; if the streaming turn produces a `routedInterface`, navigate to the search results page
9. WHEN the user submits a prompt from the conversation page, THE App_Shell SHALL remain on the Conversation_Page (no navigation needed)
10. WHEN the App_Shell transitions between views (landing, search, conversation), THE transition SHALL include a smooth fade-in animation to provide visual continuity
11. IF the user manually navigates away from the Conversation_Page while a turn is streaming (e.g., clicks "Back to search results"), THE App_Shell SHALL NOT automatically navigate back to the Conversation_Page when that turn completes — the user retains full navigation control

### Requirement 5: Prompt-Anchored Scrolling

**User Story:** As a user, I want my latest prompt anchored at the top of the viewport after submission, so that I can see the response stream in below it without the system hijacking my scroll position.

#### Acceptance Criteria

1. WHEN a new prompt is submitted, THE Conversation_Page SHALL add bottom padding to the scrollable container sufficient for the new User_Prompt_Bubble to be scrolled to the top of the visible viewport
2. WHEN a new prompt is submitted, THE Conversation_Page SHALL smoothly scroll the container so that the new User_Prompt_Bubble is positioned at the top of the visible viewport area with a reasonable margin (e.g., 16–24px from the top edge)
3. WHILE a Turn is streaming new content below an anchored prompt, THE Conversation_Page SHALL NOT automatically scroll the container — the user retains full manual scroll control
4. WHEN the scrollable container is resized (e.g., viewport resize), THE Conversation_Page SHALL recalculate the bottom padding so that the anchoring behavior remains achievable for future submissions

### Requirement 6: Back to Search Navigation

**User Story:** As a user, I want to return to search results from the conversation, so that I can review products I previously found.

#### Acceptance Criteria

1. WHILE a Persisted_Interface exists (canGoBackToSearch is true), THE Conversation_Page SHALL display a "Back to search results" link with a left arrow indicator (e.g., "← Back to search results"), positioned at the top of the Conversation_Page as a navigation affordance
2. WHILE no Persisted_Interface exists (canGoBackToSearch is false), THE Conversation_Page SHALL not render the "Back to search results" link
3. WHEN the user activates the "Back to search results" link, THE Conversation_Page SHALL call the `onBackToSearch` handler to transition the view back to search without disposing conversation state (turns remain in the ConverseController so the user can return to the conversation later)
4. WHEN the search results page is displayed after a routed turn transition, THE Prompt_Input SHALL display the prompt text that caused the transition
5. WHEN the search results page is displayed via "Back to search results", THE Prompt_Input SHALL be empty
6. THE "Back to search results" link SHALL be keyboard-focusable and activatable via keyboard, and SHALL use a semantic element (anchor or button) that conveys its navigation purpose to assistive technologies

### Requirement 7: Conversation Restoration

**User Story:** As a user, I want my conversation history preserved when I navigate away and return, so that I do not lose context from previous interactions.

#### Acceptance Criteria

1. WHEN the user navigates from the search view back to conversation, THE Conversation_Page SHALL render the full Conversation_Thread including all previous turns in chronological order within the same rendering pass (no lazy-loading or progressive reveal)
2. WHEN the Conversation_Page mounts with existing turns in the ConverseController state, THE Conversation_Page SHALL scroll so that the most recent User_Prompt_Bubble is positioned at the top of the visible viewport (applying the same anchoring and padding logic as a fresh submission)
3. WHEN the Conversation_Page mounts and a Turn has status `'streaming'`, THE Conversation_Page SHALL resume rendering that turn's streaming content (Thinking_Block, incoming messages, and surfaces) as updates arrive from the ConverseController

### Requirement 8: Error Turn Display

**User Story:** As a user, I want to see clear feedback when a conversation turn fails, so that I understand what went wrong and can try again.

#### Acceptance Criteria

1. WHEN a Turn has status `'error'`, THE Conversation_Thread SHALL render the User_Prompt_Bubble for that Turn's prompt above the error content, so the user can identify which query failed
2. WHEN a Turn has status `'error'` and the Turn's `error` field contains a non-empty string, THE Conversation_Thread SHALL display that error string in a visually distinct container (warning-styled, distinguishable from agent response content)
3. WHEN a Turn has status `'error'` and the Turn's `error` field is `undefined` or an empty string, THE Conversation_Thread SHALL display a generic fallback error message (e.g., "An unknown error occurred") in the same visually distinct container
4. WHILE a Turn has status `'error'`, THE Prompt_Input SHALL remain enabled so the user can re-submit their prompt

### Requirement 9: Reset to Landing

**User Story:** As a user, I want to start a fresh session from the conversation view, so that I can begin a new interaction from scratch.

#### Acceptance Criteria

1. THE Conversation_Page SHALL display a reset action that is always visible regardless of the `canGoBackToSearch` state
2. WHEN the user activates the reset action, THE Conversation_Page SHALL call the `onResetToLanding` handler to clear conversation state and navigate to the landing view
3. WHILE a Turn has status `'streaming'`, THE Conversation_Page SHALL keep the reset action enabled so the user can abandon the in-progress turn and return to landing

### Requirement 10: Routed Interface Turns in Conversation

**User Story:** As a user, I want search prompts handled seamlessly within conversation mode, so that I can see that a search was performed without losing my conversation context.

#### Acceptance Criteria

1. WHEN a prompt is submitted in conversation mode and is still streaming, THE Conversation_Page SHALL display the User_Prompt_Bubble and Thinking_Block with the animated "..." indicator (same as any other turn)
2. WHEN the streaming turn completes with a `routedInterface` (becomes a Routed_Turn), THE App_Shell SHALL immediately navigate to the search results page, hydrating it with that turn's routed interface
3. WHEN the user returns to conversation mode after a Routed_Turn caused navigation, THE Conversation_Thread SHALL display that Routed_Turn as the User_Prompt_Bubble followed by a static message "Search results updated." (not clickable, not interactive)
4. THE "Back to search results" link in the Conversation_Page navigation bar SHALL navigate to the search results page hydrated with the most recent routed interface (only the latest routed turn's interface is preserved)
5. WHEN navigating to search results via "Back to search results", THE App_Shell SHALL NOT dispose the conversation state — the user can navigate back to conversation mode and the full thread remains intact
