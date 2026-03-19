---
name: recon
description: "Understand a repo before touching it. Maps structure, identifies entrypoints, summarizes build/test/dev commands, notes dangerous areas, and outputs a 1-screen mental model. Use when exploring an unfamiliar codebase, onboarding to a new project, or orienting before making changes."
---

# Recon

## Arguments

- `$ARGUMENTS` — Repo path, GitHub URL, or specific question about the repo (e.g., "how does auth work"). If omitted, recon the current working directory.

## Goal

Produce a **1-screen mental model** of a codebase. Answer: "What is this, how does it work, how do I run it, and where are the dragons?" Fast enough to run at the start of any session.

## Workflow

### 1) Identify the repo

- If a GitHub URL is provided, check if it's already cloned locally. If not, suggest cloning.
- If a path is provided, use it.
- If nothing is provided, use the current working directory.

### 2) Read the essentials (parallel when possible)

Read these files if they exist — use Glob and Read, not shell commands:

```
README.md / README.*
CLAUDE.md / AGENTS.md
package.json / go.mod / pyproject.toml / Cargo.toml / requirements.txt
Makefile / Justfile / Taskfile.yml
.env.example / .env.local
docker-compose.yml / Dockerfile
```

Also run:
```bash
# Structure overview (top 2 levels, ignore noise)
find . -maxdepth 2 -type f \( -name "*.ts" -o -name "*.go" -o -name "*.py" -o -name "*.rs" -o -name "*.tsx" -o -name "*.jsx" \) | head -60

# Recent activity
git log --oneline -15

# Branch context
git branch -a | head -20
```

### 3) Map the architecture

Determine and report:

**What it is**
- Language / framework / runtime
- What the project does (1 sentence)
- Deployment target (web app, CLI, library, mobile, API, etc.)

**How it's organized**
- Top-level directory structure with annotations
- Where the entrypoints are (main, index, app, server, cmd/)
- Where the business logic lives
- Where the tests live
- Where the config lives

**How to run it**
- Install / setup command
- Dev server command
- Test command
- Build command
- Any required environment variables or services (DB, Redis, etc.)

**Where the dragons are**
- Files/directories that are unusually large or complex
- Shared state, global singletons, or god objects
- Database migrations or schema files
- Auth/security-critical paths
- Areas with no test coverage (check for test files adjacent to source)
- Any `TODO`, `HACK`, `FIXME` in critical paths

### 4) Check for existing conventions

Look for signals of how this codebase wants to be worked with:
- Linter config (`.eslintrc`, `golangci.yml`, `.ruff.toml`, etc.)
- Pre-commit hooks (`.husky/`, `.pre-commit-config.yaml`)
- CI config (`.github/workflows/`, `.gitlab-ci.yml`, `Jenkinsfile`)
- Contributing guide (`CONTRIBUTING.md`)
- Code style patterns (tabs vs spaces, naming conventions from a quick scan)

### 5) Output the mental model

Use this structure:

```
## Recon: [repo name]

**What:** [1 sentence — what this project is and does]
**Stack:** [language, framework, runtime, DB]
**Stage:** [early prototype | active development | mature | maintenance mode]

### Structure
[Annotated directory tree, 2 levels deep, key dirs only]

### Entrypoints
- **Main:** [path to main entrypoint]
- **API:** [path to API routes if applicable]
- **UI:** [path to UI entry if applicable]

### Commands
| Action | Command |
|--------|---------|
| Install | `...` |
| Dev | `...` |
| Test | `...` |
| Build | `...` |

### Dependencies / Services
[List any required external services: DB, queue, auth provider, etc.]

### Dragons
[Ranked list of areas to be careful with, with file paths]

### Conventions
[Linter, hooks, CI, naming patterns — what to follow]

### Recent context
[Last 5 meaningful commits — what's been happening]
```

## Depth control

- **Default (no argument):** Full recon as described above.
- **With a specific question** (e.g., "recon how does auth work"): Focus the investigation on that subsystem. Still output the structure, but go deeper on the relevant files and skip unrelated areas.

## What NOT to do

- Do not read every file. Skim structure, read entrypoints and config, spot-check the rest.
- Do not suggest changes. This is reconnaissance, not implementation.
- Do not produce a wall of text. The output should fit on one screen (terminal or browser).
- Do not guess about commands. If you can't find a dev/test/build command, say "not found" rather than fabricating one.
- Do not spend more than 2-3 minutes of tool calls. If the repo is huge, cover the top layer and flag areas worth deeper exploration.
