---
name: pr-video-review
description: Record reproducible frontend motion clips and embed them inline in GitHub PR descriptions so reviewers can inspect scroll-driven, sticky, animated, carousel, transition, or video-synced UI behavior directly in the PR body.
license: MIT
metadata:
  author: leojiang
  version: "1.0.0"
---

# PR Video Review

Create reviewer-facing motion proof for frontend pull requests. Record reproducible MP4s locally, then upload them through GitHub's native PR description editor so the PR body renders inline video players instead of static screenshots or plain links.

## Use This Skill When

- Reviewers need to see motion, not just still screenshots.
- The change includes scroll-driven animation, sticky behavior, carousels, transitions, or video-synced UI.
- You want short, reproducible clips embedded directly in the PR description.

## Quick Start

1. Ensure the local app is running and the PR already exists.
2. Record one MP4 per route or state with `scripts/record_scroll_motion.mjs`.
3. Open the PR in the browser, edit the description, and place the cursor under `## Frontend Review`.
4. Use the PR description editor's `Attach files` button for each MP4.
5. Wait for each `Uploading ...` placeholder to resolve into a GitHub attachment URL.
6. Save from that same editor.
7. Reload the PR and confirm GitHub renders video players, not plain links.

## Record Motion

- Prefer MP4 over GIF for review artifacts.
- Keep clips short and deterministic. Aim for about 10 to 25 seconds.
- Record one clip per route or state.
- Keep the videos local and untracked unless the user explicitly asks to commit them.
- Use a fixed viewport so before and after recordings are comparable.

Example commands:

```bash
node scripts/record_scroll_motion.mjs \
  --project-dir "$PWD" \
  --base-url http://localhost:3000 \
  --route / \
  --slug landing-home-scroll

node scripts/record_scroll_motion.mjs \
  --project-dir "$PWD" \
  --base-url http://localhost:3000 \
  --route /pricing \
  --slug pricing-scroll
```

Defaults:

- Output directory: `<project-dir>/screenshots`
- Viewport: `1440x900`
- Scroll step: `120px`
- Scroll delay: `90ms`
- Initial settle: `1500ms`
- Final hold: `1200ms`

## Update The PR Description

- Keep the existing PR narrative intact. Add a focused `## Frontend Review` section instead of replacing the whole body.
- Upload the MP4s through the native GitHub browser editor for the PR description.
- Put each clip under a short label, such as `Landing page scripted scroll` or `Pricing scripted scroll`.
- Save from the same browser editor that performed the upload.

Use this pattern:

```md
## Frontend Review

Landing page scripted scroll

<upload MP4 here with the PR editor>

Pricing scripted scroll

<upload MP4 here with the PR editor>
```

## Important Caveat

Do not rely on `gh pr edit` for the video attachment step. It can preserve the attachment URL in the body but still degrade the rendered result to plain links. Use the browser editor for upload and save, then verify after reload.

Read `references/github-inline-video.md` when:

- the body shows raw links instead of video players
- the attachment upload works but the PR still does not render inline video
- you need a reminder of the browser-native save path

## Verify

- Reload the PR page after saving.
- Confirm the `Frontend Review` section contains embedded video players.
- If you inspect the page DOM, GitHub should render `video` elements for the clips.
- Treat raw URLs in API output as insufficient proof. The rendered page is the source of truth.

## Failure Recovery

- If GitHub shows plain links, reopen the description editor in the browser and re-upload there.
- If the recording looks truncated, make sure the browser context closes before reading the raw Playwright video path.
- If the page depends on scroll-driven animation, prefer scripted scroll over manual screen recording so the artifact is reproducible.
- If `playwright` cannot be resolved from the project, install it in the project or use repo-native video tooling instead of adding a fallback to the skill.

## Resources

- `scripts/record_scroll_motion.mjs`: record a reproducible scroll-driven MP4 from a local frontend route
- `references/github-inline-video.md`: GitHub rendering caveat and the reliable upload path
