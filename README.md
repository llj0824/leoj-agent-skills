# leoj-agent-skills

Installable skills for AI coding agents.

## What's Inside

```text
leoj-agent-skills/
├── skills/
│   └── pr-video-review/
│       ├── agents/
│       │   └── openai.yaml
│       ├── references/
│       │   └── github-inline-video.md
│       ├── scripts/
│       │   └── record_scroll_motion.mjs
│       └── SKILL.md
├── AGENTS.md
├── CLAUDE.md -> AGENTS.md
├── LICENSE
└── README.md
```

## Installation

### Install the skill

```bash
npx skills add llj0824/leoj-agent-skills@pr-video-review
```

`npx skills add leoj-agent-skills/pr-video-review` does not work with the current `skills` CLI parser. Use the `owner/repo@skill` form above, or the direct GitHub tree URL below.

### Direct skill path

```bash
npx skills add https://github.com/llj0824/leoj-agent-skills/tree/main/skills/pr-video-review
```

### List available skills

```bash
npx skills add llj0824/leoj-agent-skills --list
```

## Skill

| Skill | Description |
| --- | --- |
| `pr-video-review` | Record reproducible frontend motion clips and embed them inline in GitHub PR descriptions so reviewers can inspect animated UI behavior directly in the PR body. |

## License

MIT
