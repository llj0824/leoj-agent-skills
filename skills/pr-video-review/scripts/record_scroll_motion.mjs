#!/usr/bin/env node

import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      throw new Error(`Unexpected argument: ${token}`);
    }

    const key = token.slice(2);
    const value = argv[index + 1];

    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }

    parsed[key] = value;
    index += 1;
  }

  return parsed;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function toNumber(value, fallback, label) {
  if (value == null) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Invalid number for ${label}: ${value}`);
  }

  return parsed;
}

function slugFromRoute(route) {
  if (route === "/") {
    return "home-scroll";
  }

  return route
    .replace(/^\/+/, "")
    .replace(/\/+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function resolvePlaywright(projectDir) {
  const packageJsonPath = path.join(projectDir, "package.json");
  const requireFromProject = createRequire(packageJsonPath);

  try {
    return requireFromProject("playwright");
  } catch {
    throw new Error(
      `Could not resolve "playwright" from ${projectDir}. Install it in the project or use repo-native recording tooling.`,
    );
  }
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

async function latestWebmFile(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const candidates = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".webm")) {
      continue;
    }

    const filePath = path.join(directory, entry.name);
    const stats = await fs.stat(filePath);
    candidates.push({
      filePath,
      mtimeMs: stats.mtimeMs,
    });
  }

  candidates.sort((left, right) => right.mtimeMs - left.mtimeMs);
  return candidates[0]?.filePath ?? null;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const projectDir = path.resolve(args["project-dir"] ?? process.cwd());
  const outputDir = path.resolve(args["output-dir"] ?? path.join(projectDir, "screenshots"));
  const baseUrl = args["base-url"];
  const route = args.route;

  if (!baseUrl) {
    throw new Error("Missing required --base-url");
  }

  if (!route) {
    throw new Error("Missing required --route");
  }

  const slug = args.slug ?? slugFromRoute(route);
  const width = toNumber(args.width, 1440, "--width");
  const height = toNumber(args.height, 900, "--height");
  const settleMs = toNumber(args["settle-ms"], 1500, "--settle-ms");
  const stepPx = toNumber(args["step-px"], 120, "--step-px");
  const stepDelayMs = toNumber(args["step-delay-ms"], 90, "--step-delay-ms");
  const finalHoldMs = toNumber(args["final-hold-ms"], 1200, "--final-hold-ms");
  const keepRaw = args["keep-raw"] === "true";

  const { chromium } = resolvePlaywright(projectDir);
  const targetUrl = new URL(route, baseUrl).toString();

  await fs.mkdir(outputDir, { recursive: true });

  const rawDir = path.join(outputDir, ".motion-review-raw", `${slug}-${Date.now()}`);
  await fs.mkdir(rawDir, { recursive: true });

  const outputPath = path.join(outputDir, `${slug}.mp4`);

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width, height },
    recordVideo: {
      dir: rawDir,
      size: { width, height },
    },
  });

  const page = await context.newPage();

  page.on("dialog", async (dialog) => {
    await dialog.dismiss();
  });

  await page.goto(targetUrl, {
    waitUntil: "networkidle",
    timeout: 45_000,
  });

  await page
    .addStyleTag({
      content: `
        html {
          scroll-behavior: auto !important;
        }

        nextjs-portal,
        #__next-build-watcher,
        [data-next-badge-root],
        [data-nextjs-toast],
        [data-next-mark],
        [data-nextjs-dialog-overlay],
        [data-nextjs-error-overlay-nav] {
          display: none !important;
        }
      `,
    })
    .catch(() => {});

  await sleep(settleMs);

  const maxScroll = await page.evaluate(() => {
    const scrollingElement = document.scrollingElement ?? document.documentElement;
    return Math.max(0, scrollingElement.scrollHeight - window.innerHeight);
  });

  let currentScroll = 0;
  while (currentScroll < maxScroll) {
    currentScroll = Math.min(maxScroll, currentScroll + stepPx);
    await page.evaluate((nextScroll) => {
      window.scrollTo(0, nextScroll);
    }, currentScroll);
    await sleep(stepDelayMs);
  }

  await sleep(finalHoldMs);
  await context.close();
  await browser.close();

  const rawVideoPath = await latestWebmFile(rawDir);
  if (!rawVideoPath) {
    throw new Error(`No Playwright .webm recording found in ${rawDir}`);
  }

  await runCommand("ffmpeg", [
    "-y",
    "-i",
    rawVideoPath,
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    outputPath,
  ]);

  if (!keepRaw) {
    await fs.rm(rawDir, { recursive: true, force: true });
  }

  console.log(outputPath);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
