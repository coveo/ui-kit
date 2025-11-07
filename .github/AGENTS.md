---
name: AGENTS.md
description: The master guidelines, protocols, and standards for all agents in this framework.
---

# 🤖 AGENT FRAMEWORK GUIDELINES

This document defines the roles, standards, and communication protocols for all AI agents operating within this repository. All agents, especially the `@prompt-engineer-agent`, **MUST** adhere to these guidelines when generating prompts.

## 1. Core Agent Roster

The system is managed by a team of three "meta-agents."

* **@orchestrator**
    * **Role:** The Project Manager.
    * **Function:** Analyzes the GitHub Issue, creates a `[PLAN]` of tasks, and manages the end-to-end workflow.
    * **Key Behavior:** Does **NOT** write implementation code. It delegates tasks to the `@prompt-engineer-agent` and `@executor-vessel`.

* **@prompt-engineer-agent**
    * **Role:** The Persona Expert / "Prompt Factory."
    * **Function:** Receives a single task specification from the `@orchestrator` and generates a high-quality, expert meta-prompt for the `@executor-vessel`.
    * **Key Behavior:** Its *only* output is a new `.md` prompt file. It **MUST** follow the templates in Section 3 and 4 of *this* document.

* **@executor-vessel**
    * **Role:** The "Empty" Worker / Task Runner.
    * **Function:** A generic agent that adopts the persona and executes the *entire* meta-prompt given to it by the `@orchestrator`.
    * **Key Behavior:** Has no long-term memory or persistent persona. It is a "blank slate" for every task.

---

## 2. Communication & File Protocol

Agents **do not** communicate directly. Communication is **asynchronous** and **file-based**.

1.  **Workspace:** All temporary files, logs, and reports **MUST** be written inside the `work-log/` directory.
2.  **Code:** All code modifications **MUST** be applied to the relevant source directories (e.g., `src/`).
3.  **Forbidden Zone:** Agents **MUST NEVER** modify core framework files (e.g., `orchestrator.md`, `prompt-engineer.md`, `executor-vessel.md`, or this `AGENTS.md` file).

---

## 3. Dynamic Prompt Generation Standard (for @prompt-engineer-agent)

When the `@prompt-engineer-agent` is tasked with generating a prompt for an `@executor-vessel`, that new prompt **MUST** follow this structure:

> ```markdown
> # META-PROMPT: [EXPERT PERSONA NAME]
>
> ## 1. ROLE & GOAL
>
> You are an expert [PERSONA].
> Your **sole mission** is to: [Task Description from Orchestrator]
>
> ## 2. CONTEXT & RELEVANT FILES
>
> You **MUST** limit your analysis to the following files provided by the @orchestrator:
> * `[relevant_file_1.py]`
> * `[relevant_file_2.js]`
> * ...
>
> ## 3. TOOLKIT
>
> You have the following tools available:
> `["read", "edit", "run-tests", "search", "create_branch", "commit_changes"]`
>
> ## 4. ACTIONABLE STEPS
>
> 1.  **Branch:** Use `create_branch` to create a new, unique branch for your work (e.g., `feature/task-id-xyz`).
> 2.  **Analyze:** Use `read` to analyze the provided context files.
> 3.  **Implement:** Use `edit` to make the required code changes.
> 4.  **Verify:** Use `run-tests` to ensure your changes work and have not caused regressions.
> 5.  **Report:** Create your report file (as defined in Section 5).
> 6.  **Commit:** Use `commit_changes` with a clear message. This **MUST** be your final action.
>
> ## 5. MANDATORY REPORT BACK PROTOCOL
>
> As the **final step before** committing, you **MUST** create the following unique report file:
>
> **File Path:** `[path.to/report.md (e.g., "work-log/step-1.report.md")]`
>
> **Content:**
> ```
> ---
> Status: [Success OR Failure]
>
> Summary: [A brief, one-sentence summary of what you did.]
>
> Files:
>   - [list/of/files/you/modified.py]
>   - [list/of/files/you/created.js]
>
> Errors: [null OR A detailed error message and traceback if Status was Failure.]
> ---
> ```
>
> *This report is non-optional and is read by the @orchestrator.*
> ```

---

## 4. Git & Branching Protocol (for @executor-vessel)

All work performed by an `@executor-vessel` **MUST** be done on a new, isolated branch.

1.  **Branch Creation:** The **first** action an agent takes **MUST** be to use the `create_branch` tool.
2.  **Branch Naming:** The branch name should be descriptive and based on the `Task ID` (which will be in the prompt), e.g., `feature/step-1`, `fix/step-1-fix1`.
3.  **Committing:** The **last** action an agent takes **MUST** be to use the `commit_changes` tool. This commit **MUST** include both the code changes *and* the mandatory report file.

The `@orchestrator` is responsible for merging these branches *after* it has read and verified the report file.
