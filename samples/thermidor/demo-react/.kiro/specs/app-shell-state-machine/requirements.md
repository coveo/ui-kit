# Requirements Document

## Introduction

This document specifies the requirements for the App Shell and View State Machine of the `demo-react` sample application. The App Shell is the top-level component that manages which view is visible (Landing, Search Results, or Conversation) based on responses from the ConverseController. It handles state transitions triggered by backend-driven turn completions, manages the lifecycle of routed search interfaces, and provides bidirectional navigation between views.

## Glossary

- **App_Shell**: The top-level React component responsible for rendering the active view and managing view transitions
- **View_State**: The current active view in the application, one of `'landing'`, `'search'`, or `'conversation'`
- **ConverseController**: A singleton controller from `@coveo/thermidor` that manages conversation turns, submitting prompts and receiving responses
- **Turn**: A unit of conversation consisting of a user prompt and a backend response (either a routed interface or an agent response)
- **Routed_Interface**: A search interface returned by the backend when a prompt is interpreted as a search query, containing a `useCase` and an `interface` object
- **Agent_Response**: A conversational response returned by the backend when a prompt is interpreted as a conversational query
- **Persisted_Interface**: A ref holding the most recent routed interface, kept alive across view transitions for reuse by the search results page
- **Landing_Page**: The initial view showing a prompt input and suggestion pills
- **Search_Results_Page**: The view displaying search results from a routed interface
- **Conversation_Page**: The view displaying the conversational agent response thread

## Requirements

### Requirement 1: View State Management

**User Story:** As a user, I want the application to switch between Landing, Search Results, and Conversation views, so that I see the appropriate interface for the type of response received.

#### Acceptance Criteria

1. WHEN the application initializes, THE App_Shell SHALL render the Landing_Page as the default view
2. WHEN a Turn completes with a Routed_Interface, THE App_Shell SHALL transition the View_State to `'search'`
3. WHEN a Turn completes with an Agent_Response, THE App_Shell SHALL transition the View_State to `'conversation'`
4. WHILE the View_State is `'search'`, THE App_Shell SHALL render the Search_Results_Page
5. WHILE the View_State is `'conversation'`, THE App_Shell SHALL render the Conversation_Page
6. WHILE the View_State is `'landing'`, THE App_Shell SHALL render the Landing_Page

### Requirement 2: ConverseController Singleton

**User Story:** As a developer, I want a single ConverseController instance for the entire session, so that conversation context is preserved across view transitions.

#### Acceptance Criteria

1. THE App_Shell SHALL instantiate exactly one ConverseController using the GenerativeInterface from context
2. THE App_Shell SHALL pass the ConverseController submit function to all views that accept user prompts
3. WHEN a prompt is submitted from any view, THE App_Shell SHALL route the prompt through the single ConverseController instance

### Requirement 3: Routed Interface Lifecycle

**User Story:** As a user, I want search results to persist when I navigate away and back, so that I do not lose my search context.

#### Acceptance Criteria

1. WHEN a Turn completes with a new Routed_Interface, THE App_Shell SHALL store the Routed_Interface in the Persisted_Interface ref
2. WHEN a new Routed_Interface arrives while a previous Persisted_Interface exists, THE App_Shell SHALL dispose the previous interface before storing the new one
3. WHILE the View_State is `'search'`, THE App_Shell SHALL pass the Persisted_Interface to the Search_Results_Page
4. WHEN the user navigates back to the search view from conversation, THE App_Shell SHALL render the Search_Results_Page with the existing Persisted_Interface

### Requirement 4: Bidirectional Navigation

**User Story:** As a user, I want to move freely between search results and conversation, so that I can explore products and ask follow-up questions without losing context.

#### Acceptance Criteria

1. WHILE the View_State is `'conversation'` and a Persisted_Interface exists, THE App_Shell SHALL enable a "Back to search results" action
2. WHEN the user activates "Back to search results", THE App_Shell SHALL transition the View_State to `'search'`
3. WHILE the View_State is `'conversation'` and no Persisted_Interface exists, THE App_Shell SHALL disable the "Back to search results" action
4. WHEN the user activates "Reset to landing", THE App_Shell SHALL transition the View_State to `'landing'`
5. WHEN the user resets to landing, THE App_Shell SHALL dispose the Persisted_Interface if one exists
6. WHEN the user resets to landing, THE App_Shell SHALL call `clear()` on the ConverseController to wipe conversation history

### Requirement 5: Streaming and Error Handling

**User Story:** As a user, I want the application to handle in-flight requests and errors gracefully, so that the interface remains usable even when issues occur.

#### Acceptance Criteria

1. WHILE the ConverseController reports `isStreaming` as true, THE App_Shell SHALL prevent submission of new prompts
2. IF a Turn completes with an error status, THEN THE App_Shell SHALL remain on the current View_State and display the error to the user
3. WHEN a Turn errors out while on the landing view, THE App_Shell SHALL remain on the Landing_Page
4. WHEN a new Routed_Interface arrives while already in `'search'` View_State, THE App_Shell SHALL update the Persisted_Interface without changing the view
5. WHEN a new Agent_Response arrives while already in `'conversation'` View_State, THE App_Shell SHALL remain in conversation and treat the response as a new turn in the thread

### Requirement 6: Placeholder Views

**User Story:** As a developer, I want minimal placeholder views for Task 2, so that I can validate the state machine logic before building full UI.

#### Acceptance Criteria

1. THE Landing_Page placeholder SHALL render a heading identifying the view and a prompt input form
2. THE Search_Results_Page placeholder SHALL render a heading identifying the view and the current routed interface use case
3. THE Conversation_Page placeholder SHALL render a heading identifying the view and the latest turn prompt
4. WHEN a prompt is submitted from any placeholder view, THE placeholder SHALL call the ConverseController submit function with the entered text
