# AGENTS.md

## Table of Contents

```text
.
├── skills/
│   ├── agentic-engineering-codex-tape-review/   deliberate-practice feedback loop from Codex session logs
│   ├── agentic-engineering-github-tape-review/  deliberate-practice feedback loop from GitHub activity
│   ├── eval-skills/                             design and run lightweight evals for Codex skills
│   ├── pr-video-review/                         reviewer-facing motion clips for GitHub PR descriptions
│   ├── deep-dive-html/                          polished standalone HTML explainers with inline SVG
│   ├── recon/                                   understand a repo before touching it (1-screen mental model)
│   ├── review-pr/                               review a PR for mergeability, risk, and code smells
│   └── task-deep-dive-implementation/           investigate, rank options, implement, verify, PR, and worktree cleanup
├── README.md             install and usage entrypoint
└── LICENSE
```

## Repository Notes

- Keep the repo focused on installable skills only.
- Put each skill in `skills/<skill-name>/`.
- Keep bundled scripts and references next to the skill that uses them.
