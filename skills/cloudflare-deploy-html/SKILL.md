---
name: cloudflare-deploy-html
description: Publish a standalone HTML artifact or HTML asset directory to a Cloudflare Pages project under a URL subpath, with optional shared-password protection via Pages middleware. Use when the user wants a local HTML report, artifact, or static microsite deployed to Cloudflare and possibly attached to a custom domain path like example.com/report-name.
license: MIT
metadata:
  author: leojiang
  version: "1.0.0"
---

# Cloudflare Deploy HTML

Deploy a static HTML artifact to Cloudflare Pages without turning it into a full app repo. This skill is for local one-off HTML outputs, report directories, and deep-dive artifacts that should live at a stable subpath.

## Use This Skill When

- The user already has a local `.html` file or an asset directory with `index.html`.
- The goal is a stable Cloudflare URL, often under a custom domain subpath.
- The artifact may need light privacy, such as one shared browser password.

Do not use this skill when:

- The output is a dynamic app that deserves its own deployment workflow.
- The user needs strong per-user auth and auditing. In that case, prefer Cloudflare Access after the site is on a custom domain.

## Quick Start

1. Confirm Cloudflare auth works:

```bash
node scripts/cloudflare_deploy_html.mjs whoami
```

2. Publish a local HTML file to a subpath:

```bash
node scripts/cloudflare_deploy_html.mjs publish \
  --source /absolute/path/report.html \
  --subpath architecture-state-deep-dive \
  --project leo-jiang-artifacts \
  --deploy
```

3. Publish a directory artifact and protect it with a shared password:

```bash
node scripts/cloudflare_deploy_html.mjs publish \
  --source /absolute/path/report-dir \
  --subpath architecture-state-deep-dive \
  --project leo-jiang-artifacts \
  --protected \
  --deploy
```

4. Set the shared password secret once per Pages project:

```bash
node scripts/cloudflare_deploy_html.mjs set-password \
  --project leo-jiang-artifacts \
  --value "choose-a-strong-password"
```

## Workflow

### 1. Check whether the Pages project already exists

This skill assumes the target Pages project already exists. If not, create it first in the Cloudflare dashboard.

For Leo's main artifact host, always use the existing `leo-jiang-artifacts` project. The helper defaults that project to the canonical state directory:

```text
~/Desktop/workspace/leo-jiang-artifacts-site
```

That directory is the durable source of truth for `artifacts.leo-jiang.com`: it contains the generated `site/` tree and `manifest.json`. Do not deploy `leo-jiang-artifacts` from a cwd-local `.cloudflare-deploy-html/` folder unless the user explicitly asks for a one-off override, because Cloudflare Pages deployments replace the whole site snapshot.

Use `whoami` before deploying so you fail fast on auth:

```bash
node scripts/cloudflare_deploy_html.mjs whoami
```

### 2. Pick the right source shape

- If the artifact is one HTML file, pass that file and the script will mount it at `/<subpath>/index.html`.
- If the artifact already has assets, pass the directory and make sure it contains `index.html`.

### 3. Decide the visibility mode

- Public: omit `--protected`
- Shared password: add `--protected` and set `ARTIFACT_SHARED_PASSWORD`

The generated middleware uses:

- username: `artifact`
- password: value of the Pages secret `ARTIFACT_SHARED_PASSWORD`

This is acceptable for low-stakes privacy. For stronger access control, read `references/cloudflare-pages-notes.md` and switch to Cloudflare Access.

### 4. Deploy

Use `publish --deploy` for the common path. Use `deploy` separately when you already changed the local generated site tree and just want to push it.

```bash
node scripts/cloudflare_deploy_html.mjs deploy --project leo-jiang-artifacts
```

### 5. Manage existing subpaths

List tracked artifacts:

```bash
node scripts/cloudflare_deploy_html.mjs list
```

Remove a subpath and redeploy:

```bash
node scripts/cloudflare_deploy_html.mjs remove \
  --subpath architecture-state-deep-dive \
  --project leo-jiang-artifacts \
  --deploy
```

## Important Notes

- For `leo-jiang-artifacts`, the script keeps generated deploy state in `~/Desktop/workspace/leo-jiang-artifacts-site` by default, regardless of the current working directory.
- For other projects, the script keeps generated deploy state in `.cloudflare-deploy-html/` in the current working directory by default.
- Treat generated state directories as deploy sources. Do not delete them casually; redeploying from an empty state directory removes previously published artifact paths.
- If the user wants `example.com/{subpath}`, the apex domain must be on Cloudflare nameservers. For a plain subdomain like `reports.example.com`, a DNS CNAME can be enough.
- If you want the Cloudflare `*.pages.dev` hostname hidden, redirect it to the custom domain after the deployment is live.

Read `references/cloudflare-pages-notes.md` when:

- the user asks whether a custom domain path requires a nameserver move
- the user asks whether a subdomain can avoid the nameserver move
- the user wants stronger privacy than a shared password

## Resources

- `scripts/cloudflare_deploy_html.mjs`: deterministic helper for staging and deploying HTML artifacts
- `references/cloudflare-pages-notes.md`: custom domain, subpath, and privacy notes
