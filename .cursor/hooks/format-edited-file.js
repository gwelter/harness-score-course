import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const hookDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(hookDir, "../..");
const biomeBin = path.join(repoRoot, "node_modules", ".bin", "biome");
const supported = /\.(?:[cm]?js|jsx|json|jsonc)$/i;

/**
 * @returns {Promise<string>}
 */
async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

/**
 * Best-effort local format. CI remains the source of truth.
 *
 * @param {string} filePath
 * @returns {void}
 */
function formatIfSupported(filePath) {
  if (!supported.test(filePath)) {
    return;
  }

  if (!fs.existsSync(biomeBin)) {
    return;
  }

  spawnSync(biomeBin, ["check", "--write", "--files-ignore-unknown=true", filePath], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: "ignore",
  });
}

const raw = await readStdin();
try {
  const payload = JSON.parse(raw);
  if (payload && typeof payload === "object" && typeof payload.file_path === "string") {
    formatIfSupported(payload.file_path);
  }
} catch {
  // Guidance only: ignore malformed payloads so the agent loop continues.
}

process.stdout.write("{}\n");
