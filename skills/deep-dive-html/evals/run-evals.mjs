#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const evalDir = dirname(__filename);
const repoRoot = resolve(evalDir, "../../..");
const promptsPath = resolve(evalDir, "prompts.csv");
const rubricSchemaPath = resolve(evalDir, "rubric.schema.json");
const resultsRoot = resolve(evalDir, "results");

function parseArgs(argv) {
  const args = { rubric: false, caseId: null, model: null, timeoutMs: 180000 };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--rubric") {
      args.rubric = true;
      continue;
    }

    if (arg === "--case") {
      args.caseId = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg === "--model") {
      args.model = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg === "--timeout-ms") {
      args.timeoutMs = Number(argv[index + 1] ?? "0");
      index += 1;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node skills/deep-dive-html/evals/run-evals.mjs [options]

Options:
  --case <id>     Run one case only
  --rubric        Run rubric grading after deterministic checks
  --model <name>  Pass a specific model through to codex exec
  --timeout-ms    Kill one case if it runs longer than this many milliseconds
  --help          Show this message
`);
}

function parseCsv(source) {
  const rows = [];
  let field = "";
  let row = [];
  let inQuotes = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        field += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(field);
      field = "";

      if (row.some((cell) => cell.length > 0)) {
        rows.push(row);
      }

      row = [];
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [header, ...dataRows] = rows;
  return dataRows.map((cells) =>
    Object.fromEntries(header.map((key, index) => [key, cells[index] ?? ""])),
  );
}

function timestamp() {
  return new Date().toISOString().replaceAll(":", "-");
}

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function parseJsonEvents(output) {
  return output
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("{") && line.endsWith("}"))
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function getFinalMessage(events) {
  const agentMessages = events.filter(
    (event) =>
      event?.type === "item.completed" &&
      event?.item?.type === "agent_message" &&
      typeof event?.item?.text === "string",
  );
  return agentMessages.at(-1)?.item?.text ?? "";
}

function runCodex(prompt, { model, rubric = false, timeoutMs } = {}) {
  const args = ["exec", "--json", "--ephemeral", "-C", repoRoot];

  if (rubric) {
    args.push("--sandbox", "read-only", "--output-schema", rubricSchemaPath);
  } else {
    args.push("--full-auto");
  }

  if (model) {
    args.push("--model", model);
  }

  args.push(prompt);

  return spawnSync("codex", args, {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
    timeout: timeoutMs,
    killSignal: "SIGKILL",
  });
}

function checkArtifact(artifactPath) {
  const checks = [];

  if (!existsSync(artifactPath)) {
    return {
      ok: false,
      checks: [{ name: "artifact_exists", pass: false, detail: "missing file" }],
    };
  }

  const html = readFileSync(artifactPath, "utf8");
  const headingCount = (html.match(/<h[1-6][^>]*>/giu) ?? []).length;

  checks.push({
    name: "artifact_exists",
    pass: true,
    detail: artifactPath,
  });
  checks.push({
    name: "single_html_root",
    pass: /<html[\s>]/iu.test(html),
    detail: "contains <html>",
  });
  checks.push({
    name: "title_present",
    pass: /<title>[\s\S]*?<\/title>/iu.test(html),
    detail: "contains <title>",
  });
  checks.push({
    name: "inline_css_present",
    pass: /<style[\s>][\s\S]*?<\/style>/iu.test(html),
    detail: "contains inline <style>",
  });
  checks.push({
    name: "css_variables_present",
    pass: /--[a-z0-9-]+\s*:/iu.test(html),
    detail: "contains CSS custom properties",
  });
  checks.push({
    name: "has_minimum_headings",
    pass: headingCount >= 3,
    detail: `found ${headingCount} headings`,
  });
  checks.push({
    name: "has_visual_structure",
    pass: /<svg[\s>]/iu.test(html) || /<table[\s>]/iu.test(html),
    detail: "contains <svg> or <table>",
  });
  checks.push({
    name: "print_styles_present",
    pass: /@media\s+print/iu.test(html),
    detail: "contains @media print",
  });
  checks.push({
    name: "no_external_stylesheet",
    pass: !/<link[^>]+rel=["']stylesheet["']/iu.test(html),
    detail: "no external stylesheet link",
  });
  checks.push({
    name: "no_external_script",
    pass: !/<script[^>]+src=/iu.test(html),
    detail: "no external script tag",
  });

  return {
    ok: checks.every((check) => check.pass),
    checks,
  };
}

function buildRubricPrompt(artifactPath) {
  return `
Read the HTML file at ${artifactPath} and grade it against the deep-dive-html skill contract.

Scoring guide:
- thesis: is the thesis clear on the first screen?
- state_intent_direction: does the page meaningfully follow the State → Intent → Direction arc or an equally clear stated variant?
- visual_usefulness: do tables or diagrams help comprehension instead of decorating the page?
- scanability: does the page feel easy to scan, with clear hierarchy and sectioning?
- self_contained: is this a single self-contained HTML artifact without external asset dependence?
- overall_pass: true only if the artifact would be considered a solid first-pass output for the skill.

Keep notes short and specific. Mention the most important weaknesses first.
`.trim();
}

function summarizeRubric(rubric) {
  if (!rubric) {
    return "not run";
  }

  const average =
    (rubric.thesis +
      rubric.state_intent_direction +
      rubric.visual_usefulness +
      rubric.scanability +
      rubric.self_contained) /
    5;

  return `${average.toFixed(1)}/5 ${rubric.overall_pass ? "pass" : "fail"}`;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const prompts = parseCsv(readFileSync(promptsPath, "utf8"));
  const selected = options.caseId
    ? prompts.filter((row) => row.id === options.caseId)
    : prompts;

  if (selected.length === 0) {
    throw new Error(
      options.caseId
        ? `No prompt case found for id: ${options.caseId}`
        : "No prompt cases found",
    );
  }

  ensureDir(resultsRoot);
  const runDir = resolve(resultsRoot, timestamp());
  ensureDir(runDir);

  const summary = [];

  for (const row of selected) {
    const artifactPath = resolve(repoRoot, row.artifact_file);
    const caseDir = resolve(runDir, row.id);
    ensureDir(caseDir);

    rmSync(artifactPath, { force: true });

    writeFileSync(resolve(caseDir, "prompt.txt"), `${row.prompt}\n`);

    const run = runCodex(row.prompt, {
      model: options.model,
      timeoutMs: options.timeoutMs,
    });
    writeFileSync(resolve(caseDir, "exec.stdout.log"), run.stdout ?? "");
    writeFileSync(resolve(caseDir, "exec.stderr.log"), run.stderr ?? "");

    const events = parseJsonEvents(run.stdout ?? "");
    const finalMessage = getFinalMessage(events);
    const deterministic = checkArtifact(artifactPath);

    let rubric = null;

    if (options.rubric && deterministic.ok) {
      const rubricRun = runCodex(buildRubricPrompt(artifactPath), {
        model: options.model,
        rubric: true,
        timeoutMs: options.timeoutMs,
      });
      writeFileSync(resolve(caseDir, "rubric.stdout.log"), rubricRun.stdout ?? "");
      writeFileSync(resolve(caseDir, "rubric.stderr.log"), rubricRun.stderr ?? "");

      const rubricEvents = parseJsonEvents(rubricRun.stdout ?? "");
      const rubricMessage = getFinalMessage(rubricEvents);

      try {
        rubric = JSON.parse(rubricMessage);
      } catch {
        rubric = {
          overall_pass: false,
          notes: ["Failed to parse rubric JSON output"],
        };
      }
    }

    const caseSummary = {
      id: row.id,
      input_file: row.input_file,
      artifact_file: row.artifact_file,
      exec_exit_code: run.status,
      exec_signal: run.signal,
      timed_out: run.signal === "SIGKILL" && run.status === null,
      final_message_preview: finalMessage.slice(0, 240),
      deterministic,
      rubric,
    };

    writeFileSync(
      resolve(caseDir, "summary.json"),
      JSON.stringify(caseSummary, null, 2),
    );

    summary.push({
      id: row.id,
      exec:
        run.status === 0
          ? "ok"
          : run.signal === "SIGKILL" && run.status === null
            ? "timeout"
            : `exit ${run.status}`,
      deterministic: deterministic.ok ? "pass" : "fail",
      rubric: summarizeRubric(rubric),
    });
  }

  writeFileSync(resolve(runDir, "summary.json"), JSON.stringify(summary, null, 2));

  console.table(summary);
  console.log(`Detailed results written to ${runDir}`);
}

main();
