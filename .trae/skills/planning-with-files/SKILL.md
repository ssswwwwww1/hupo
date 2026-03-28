---
name: "planning-with-files"
description: "A comprehensive file-based planning system for persistent context and task management. Use this skill when you need to maintain a plan, track progress, or document knowledge across multiple turns."
origin: "planning-with-files"
---

# Planning With Files

A skill for managing long-term plans, tasks, and context using persistent markdown files.

## When to Activate

- Starting a new complex task or project
- The user asks for a plan or roadmap
- You need to remember context across multiple turns
- You need to track progress on a multi-step task

## Core Concepts

This skill uses a set of markdown files to maintain state:

1.  `plan.md`: The high-level roadmap and current status.
2.  `tasks.md`: Detailed breakdown of tasks and their status.
3.  `context.md`: Important context, decisions, and knowledge.

## File Structures

### `plan.md`

```markdown
# Project Plan: [Project Name]

## Goal
[Brief description of the goal]

## Phases
- [ ] Phase 1: [Name]
- [ ] Phase 2: [Name]
- [ ] ...

## Current Status
[Summary of current progress]
```

### `tasks.md`

```markdown
# Tasks

## Phase 1: [Name]
- [ ] Task 1.1: [Description]
- [ ] Task 1.2: [Description]

## Phase 2: [Name]
- [ ] Task 2.1: [Description]
```

### `context.md`

```markdown
# Context & Knowledge

## Key Decisions
- [Date]: [Decision description]

## Technical Details
- [Technology stack]
- [Architecture notes]

## User Preferences
- [User preference 1]
```

## Workflow

1.  **Initialize**: When starting a new task, create the necessary files if they don't exist.
2.  **Update**: As you make progress, update `tasks.md` (check off items) and `plan.md` (update status).
3.  **Document**: Record important information in `context.md`.
4.  **Review**: Before starting a new turn, read these files to restore context.

## Usage

When the user asks to start a plan, initialize the files.
When completing a task, update `tasks.md`.
When a major decision is made, update `context.md`.
