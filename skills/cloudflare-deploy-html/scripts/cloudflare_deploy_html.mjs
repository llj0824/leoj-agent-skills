#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function parseArgs(argv) {
  const [command = "help", ...rest] = argv;
  const args = { command };

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (!token.startsWith("--")) {
      throw new Error(`Unexpected argument: ${token}`);
    }

    const key = token.slice(2);
    if (key === "protected" || key === "deploy" || key === "help") {
      args[key] = true;
      continue;
    }

    const value = rest[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }

    args[key] = value;
    index += 1;
  }

  return args;
}

function printHelp() {
  console.log(`cloudflare-deploy-html

Usage:
  node scripts/cloudflare_deploy_html.mjs whoami
  node scripts/cloudflare_deploy_html.mjs publish --source <file-or-dir> --subpath <path> [--protected] [--deploy] [--project <name>] [--state-dir <dir>]
  node scripts/cloudflare_deploy_html.mjs remove --subpath <path> [--deploy] [--project <name>] [--state-dir <dir>]
  node scripts/cloudflare_deploy_html.mjs list [--state-dir <dir>]
  node scripts/cloudflare_deploy_html.mjs deploy --project <name> [--state-dir <dir>]
  node scripts/cloudflare_deploy_html.mjs set-password --project <name> --value <password>

Notes:
  - Default local state dir: .cloudflare-deploy-html
  - Protected artifacts use HTTP Basic Auth with username "artifact"
  - Protected artifacts require the Cloudflare Pages secret ARTIFACT_SHARED_PASSWORD`);
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function resolveStateDir(raw) {
  return path.resolve(raw ?? path.join(process.cwd(), ".cloudflare-deploy-html"));
}

function getPaths(stateDir) {
  return {
    stateDir,
    siteRoot: path.join(stateDir, "site"),
    manifestPath: path.join(stateDir, "manifest.json"),
    functionsDir: path.join(stateDir, "site", "functions"),
    headersPath: path.join(stateDir, "site", "_headers"),
    indexPath: path.join(stateDir, "site", "index.html"),
  };
}

function loadManifest(paths) {
  ensureDir(paths.stateDir);
  if (!fs.existsSync(paths.manifestPath)) {
    return { artifacts: {} };
  }

  return JSON.parse(fs.readFileSync(paths.manifestPath, "utf8"));
}

function saveManifest(paths, manifest) {
  ensureDir(paths.stateDir);
  fs.writeFileSync(paths.manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

function normalizeSubpath(raw) {
  if (!raw) {
    throw new Error("Missing --subpath");
  }

  const trimmed = raw.trim().replace(/^\/+|\/+$/g, "");
  if (!trimmed) {
    throw new Error("Subpath cannot be empty");
  }

  if (trimmed.includes("..")) {
    throw new Error("Subpath cannot contain '..'");
  }

  const valid = trimmed.split("/").every((segment) => /^[A-Za-z0-9._-]+$/.test(segment));
  if (!valid) {
    throw new Error("Subpath segments may only contain letters, numbers, dot, underscore, and hyphen");
  }

  return trimmed;
}

function removeIfExists(targetPath) {
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  }
}

function copyRecursive(sourcePath, destinationPath) {
  const stats = fs.statSync(sourcePath);
  if (stats.isDirectory()) {
    ensureDir(destinationPath);
    for (const child of fs.readdirSync(sourcePath)) {
      copyRecursive(path.join(sourcePath, child), path.join(destinationPath, child));
    }
    return;
  }

  ensureDir(path.dirname(destinationPath));
  fs.copyFileSync(sourcePath, destinationPath);
}

function writeIndex(paths, manifest) {
  ensureDir(paths.siteRoot);

  const items = Object.keys(manifest.artifacts)
    .sort()
    .map((subpath) => `<li><a href="/${subpath}/">/${subpath}/</a></li>`)
    .join("\n");

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Cloudflare HTML Artifacts</title>
  <meta name="robots" content="noindex,nofollow">
</head>
<body>
  <h1>Cloudflare HTML Artifacts</h1>
  <ul>
    ${items || "<li>No artifacts published yet.</li>"}
  </ul>
</body>
</html>
`;

  fs.writeFileSync(paths.indexPath, html);
}

function buildHeaders(paths, manifest) {
  const protectedPrefixes = Object.entries(manifest.artifacts)
    .filter(([, artifact]) => artifact.protected)
    .map(([subpath]) => `/${subpath}*`);

  if (protectedPrefixes.length === 0) {
    removeIfExists(paths.headersPath);
    return;
  }

  const lines = [];
  for (const prefix of protectedPrefixes) {
    lines.push(prefix);
    lines.push("  X-Robots-Tag: noindex, nofollow");
    lines.push("  Cache-Control: private, no-store");
    lines.push("");
  }

  fs.writeFileSync(paths.headersPath, `${lines.join("\n")}\n`);
}

function buildMiddleware(paths, manifest) {
  const protectedPrefixes = Object.entries(manifest.artifacts)
    .filter(([, artifact]) => artifact.protected)
    .map(([subpath]) => `/${subpath}`);

  if (protectedPrefixes.length === 0) {
    removeIfExists(paths.functionsDir);
    return;
  }

  ensureDir(paths.functionsDir);

  const middleware = `const PROTECTED_PREFIXES = ${JSON.stringify(protectedPrefixes, null, 2)};
const USERNAME = "artifact";
const encoder = new TextEncoder();

function challenge() {
  return new Response("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Private artifact", charset="UTF-8"',
      "Cache-Control": "no-store",
    },
  });
}

function isProtectedPath(pathname) {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(\`\${prefix}/\`));
}

function decodeBasicAuth(authorization) {
  const [scheme, encoded] = authorization.split(" ");
  if (scheme !== "Basic" || !encoded) {
    return null;
  }

  try {
    return atob(encoded);
  } catch {
    return null;
  }
}

async function timingSafeEqual(a, b) {
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  if (aBytes.byteLength !== bBytes.byteLength) {
    return !crypto.subtle.timingSafeEqual(aBytes, aBytes);
  }

  return crypto.subtle.timingSafeEqual(aBytes, bBytes);
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (!isProtectedPath(url.pathname)) {
    return context.next();
  }

  const password = context.env.ARTIFACT_SHARED_PASSWORD;
  if (!password) {
    return new Response("Missing Cloudflare Pages secret: ARTIFACT_SHARED_PASSWORD", {
      status: 500,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const authorization = context.request.headers.get("Authorization");
  if (!authorization) {
    return challenge();
  }

  const decoded = decodeBasicAuth(authorization);
  if (!decoded) {
    return challenge();
  }

  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex < 0) {
    return challenge();
  }

  const user = decoded.slice(0, separatorIndex);
  const pass = decoded.slice(separatorIndex + 1);
  const userOk = await timingSafeEqual(USERNAME, user);
  const passOk = await timingSafeEqual(password, pass);
  if (!userOk || !passOk) {
    return challenge();
  }

  const response = await context.next();
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}
`;

  fs.writeFileSync(path.join(paths.functionsDir, "_middleware.js"), `${middleware}\n`);
}

function resolveProjectName(args) {
  return args.project || process.env.CLOUDFLARE_PAGES_PROJECT;
}

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: options.stdio ?? "inherit",
    input: options.input,
    cwd: options.cwd ?? process.cwd(),
    encoding: options.encoding ?? "utf8",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${command} exited with code ${result.status}`);
  }

  return result;
}

function deploy(args, paths) {
  const projectName = resolveProjectName(args);
  if (!projectName) {
    throw new Error("Missing Cloudflare Pages project name. Pass --project or set CLOUDFLARE_PAGES_PROJECT.");
  }

  if (!fs.existsSync(paths.siteRoot)) {
    throw new Error("Nothing to deploy yet. Publish at least one artifact first.");
  }

  runCommand("npx", [
    "-y",
    "wrangler",
    "pages",
    "deploy",
    paths.siteRoot,
    "--project-name",
    projectName,
  ]);
}

function maybeDeploy(args, paths) {
  if (args.deploy) {
    deploy(args, paths);
  }
}

function publish(args, paths, manifest) {
  if (!args.source) {
    throw new Error("Missing --source");
  }

  const sourcePath = path.resolve(args.source);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source does not exist: ${sourcePath}`);
  }

  const subpath = normalizeSubpath(args.subpath);
  const destinationPath = path.join(paths.siteRoot, subpath);
  removeIfExists(destinationPath);

  const stats = fs.statSync(sourcePath);
  if (stats.isDirectory()) {
    const hasIndex =
      fs.existsSync(path.join(sourcePath, "index.html")) ||
      fs.existsSync(path.join(sourcePath, "index.htm"));
    if (!hasIndex) {
      throw new Error("Directory sources must contain index.html or index.htm.");
    }

    copyRecursive(sourcePath, destinationPath);
  } else {
    const extension = path.extname(sourcePath).toLowerCase();
    if (extension !== ".html" && extension !== ".htm") {
      throw new Error("File sources must be .html or .htm. Use a directory for multi-file artifacts.");
    }

    ensureDir(destinationPath);
    copyRecursive(sourcePath, path.join(destinationPath, "index.html"));
  }

  manifest.artifacts[subpath] = {
    protected: Boolean(args.protected),
    source: sourcePath,
    updatedAt: new Date().toISOString(),
  };

  writeIndex(paths, manifest);
  buildHeaders(paths, manifest);
  buildMiddleware(paths, manifest);
  saveManifest(paths, manifest);

  console.log(`Published ${sourcePath} -> /${subpath}/`);
  console.log(args.protected ? "Visibility: protected with shared password" : "Visibility: public");
}

function removeArtifact(args, paths, manifest) {
  const subpath = normalizeSubpath(args.subpath);
  if (!manifest.artifacts[subpath]) {
    throw new Error(`No artifact tracked for /${subpath}`);
  }

  removeIfExists(path.join(paths.siteRoot, subpath));
  delete manifest.artifacts[subpath];
  writeIndex(paths, manifest);
  buildHeaders(paths, manifest);
  buildMiddleware(paths, manifest);
  saveManifest(paths, manifest);

  console.log(`Removed /${subpath}/`);
}

function listArtifacts(manifest) {
  const entries = Object.entries(manifest.artifacts).sort(([left], [right]) => left.localeCompare(right));
  if (entries.length === 0) {
    console.log("No artifacts tracked yet.");
    return;
  }

  for (const [subpath, artifact] of entries) {
    const visibility = artifact.protected ? "protected" : "public";
    console.log(`/${subpath}/  ${visibility}  ${artifact.source}  ${artifact.updatedAt}`);
  }
}

function whoami() {
  runCommand("npx", ["-y", "wrangler", "whoami"]);
}

function setPassword(args) {
  const projectName = resolveProjectName(args);
  if (!projectName) {
    throw new Error("Missing Cloudflare Pages project name. Pass --project or set CLOUDFLARE_PAGES_PROJECT.");
  }

  if (!args.value) {
    throw new Error("Missing --value for set-password");
  }

  runCommand(
    "npx",
    [
      "-y",
      "wrangler",
      "pages",
      "secret",
      "put",
      "ARTIFACT_SHARED_PASSWORD",
      "--project-name",
      projectName,
    ],
    {
      stdio: ["pipe", "inherit", "inherit"],
      input: `${args.value}\n`,
    },
  );
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || args.command === "help") {
    printHelp();
    return;
  }

  if (args.command === "whoami") {
    whoami();
    return;
  }

  if (args.command === "set-password") {
    setPassword(args);
    return;
  }

  const paths = getPaths(resolveStateDir(args["state-dir"]));
  const manifest = loadManifest(paths);

  switch (args.command) {
    case "publish":
      publish(args, paths, manifest);
      maybeDeploy(args, paths);
      return;
    case "remove":
      removeArtifact(args, paths, manifest);
      maybeDeploy(args, paths);
      return;
    case "list":
      listArtifacts(manifest);
      return;
    case "deploy":
      deploy(args, paths);
      return;
    default:
      throw new Error(`Unknown command: ${args.command}`);
  }
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
}
