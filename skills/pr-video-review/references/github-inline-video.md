# GitHub Inline Video Notes

Use this reference when GitHub behaves unexpectedly after adding motion clips to a PR description.

## Reliable Path

1. Open the PR in the browser.
2. Edit the PR description with the native GitHub editor.
3. Place the cursor exactly where the clip should appear.
4. Use `Attach files` in that same editor.
5. Wait for the temporary `Uploading ...` line to resolve into a GitHub attachment URL.
6. Save from the same editor.
7. Reload the PR and verify the rendered page.

## Known Caveat

`gh pr edit` can preserve the attachment URL in the body while still rendering the result as a plain link instead of an inline video player. Treat browser-native upload and save as the source of truth for reviewer-facing motion embeds.

## What To Verify

- The `Motion Review` section renders embedded video players.
- Reloading the PR does not collapse back to plain links.
- The rendered page, not the raw body text, is the final check.

## Practical Guidance

- Prefer MP4 attachments.
- Keep the videos local and untracked unless the user explicitly asks to commit them.
- Use one clip per route or state so reviewers can scan quickly.
