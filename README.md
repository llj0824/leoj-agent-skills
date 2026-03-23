# leoj-agent-skills

Installable skills for AI coding agents.

## What's Inside

```text
leoj-agent-skills/
├── skills/
│   ├── agentic-engineering-codex-tape-review/
│   │   ├── agents/
│   │   │   └── openai.yaml
│   │   └── SKILL.md
│   ├── agentic-engineering-github-tape-review/
│   │   ├── agents/
│   │   │   └── openai.yaml
│   │   ├── scripts/
│   │   │   └── replay_terminal_output.sh
│   │   ├── references/
│   │   │   ├── agentic-engineering-github-tape-review-demo.tape
│   │   │   ├── agentic-engineering-github-tape-review-output.tape
│   │   │   └── agentic-engineering-github-tape-review-output.txt
│   │   └── SKILL.md
│   ├── pr-video-review/
│   │   ├── agents/
│   │   │   └── openai.yaml
│   │   ├── references/
│   │   │   └── github-inline-video.md
│   │   ├── scripts/
│   │   │   └── record_scroll_motion.mjs
│   │   └── SKILL.md
│   ├── deep-dive-html/
│   │   ├── agents/
│   │   │   └── openai.yaml
│   │   └── SKILL.md
│   ├── investigate-and-implement/
│   │   ├── agents/
│   │   │   └── openai.yaml
│   │   └── SKILL.md
│   └── review-pr/
│       ├── agents/
│       │   └── openai.yaml
│       └── SKILL.md
├── AGENTS.md
├── CLAUDE.md -> AGENTS.md
├── LICENSE
└── README.md
```

## Installation

### Install a skill

```bash
npx skills add llj0824/leoj-agent-skills --skill <skill-name>
```

Use `--skill` when installing a single skill from this multi-skill repository.
The current `skills` CLI does not support `owner/repo/<skill-name>` shorthand for this layout.

For example:

```bash
npx skills add llj0824/leoj-agent-skills --skill deep-dive-html
npx skills add llj0824/leoj-agent-skills --skill review-pr
npx skills add llj0824/leoj-agent-skills --skill pr-video-review
npx skills add llj0824/leoj-agent-skills --skill investigate-and-implement
npx skills add llj0824/leoj-agent-skills --skill agentic-engineering-github-tape-review
npx skills add llj0824/leoj-agent-skills --skill agentic-engineering-codex-tape-review
```

Or use a direct GitHub tree URL to install a specific skill subdirectory:

### Direct skill path

```bash
npx skills add https://github.com/llj0824/leoj-agent-skills/tree/main/skills/deep-dive-html
npx skills add https://github.com/llj0824/leoj-agent-skills/tree/main/skills/review-pr
npx skills add https://github.com/llj0824/leoj-agent-skills/tree/main/skills/pr-video-review
npx skills add https://github.com/llj0824/leoj-agent-skills/tree/main/skills/investigate-and-implement
npx skills add https://github.com/llj0824/leoj-agent-skills/tree/main/skills/agentic-engineering-github-tape-review
npx skills add https://github.com/llj0824/leoj-agent-skills/tree/main/skills/agentic-engineering-codex-tape-review
```

### List available skills

```bash
npx skills add llj0824/leoj-agent-skills --list
```

## Skill

| Skill | Description |
| --- | --- |
| `deep-dive-html` | Polished standalone HTML deep-dive explainers with inline SVG diagrams, dark mode, and print styles. Thesis-first, visual budget, calmer defaults. |
| `review-pr` | Review a GitHub PR for mergeability, risk, missing tests, and code smells. Produces a severity-ranked verdict (MERGE / BLOCK / NEEDS CHANGES). |
| `investigate-and-implement` | Understand task intent, investigate the current state deeply, rank options when needed, implement the recommended path, verify it, open a PR, and clean up the task worktree after merge. |
| `agentic-engineering-codex-tape-review` | Study recent Codex session logs as a deliberate-practice feedback loop — surface patterns in task framing, scope creep, complexity, and collaboration efficiency. |
| `agentic-engineering-github-tape-review` | Study recent GitHub activity as a deliberate-practice feedback loop — surface throughput patterns, bottlenecks, rework, and leverage points. |
| `pr-video-review` | Record reproducible frontend motion clips and embed them inline in GitHub PR descriptions so reviewers can inspect animated UI behavior directly in the PR body. |

## License

MIT
