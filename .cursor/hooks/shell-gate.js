import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

/**
 * @typedef {"allow" | "deny" | "ask"} Permission
 * @typedef {{ permission: Permission, user_message?: string, agent_message?: string }} GateDecision
 */

/**
 * @param {string} command
 * @returns {boolean}
 */
function isDangerousRm(command) {
  const lower = command.toLowerCase();
  if (!/\brm\b/.test(lower)) {
    return false;
  }

  const recursive =
    /(?:\s|^)-(?:[a-z]*r[a-z]*f|[a-z]*f[a-z]*r|r|R|rf|fr|fR|Rf|Fr|RF|FR)(?:\s|$)/.test(
      ` ${lower} `,
    ) || /--recursive\b/.test(lower);
  if (!recursive) {
    return false;
  }

  return /(?:\s|^)(\/|\/\*|~(?:\/|$)|\$\{?home\}?|\$home)(?:\s|$)/i.test(command);
}

/**
 * @param {string} command
 * @returns {boolean}
 */
function isDangerousPowerShellRemove(command) {
  const compact = command.replace(/\s+/g, " ").trim();
  const lower = compact.toLowerCase();
  const isRemove =
    /\bremove-item\b/.test(lower) ||
    /(^|[;&|]\s*)ri\b/.test(lower) ||
    (/(^|[;&|]\s*)rm\b/.test(lower) && /\s-[a-z]*r/.test(lower) && /\s-[a-z]*f/.test(lower));

  if (!isRemove) {
    return false;
  }

  const recurse = /-(?:recurse|r)\b/.test(lower);
  const force = /-(?:force|f)\b/.test(lower);
  if (!recurse || !force) {
    return false;
  }

  return /(?:\s|^)(\/|\\|[a-z]:\\?|~(?:\/|\\|$)|\$home|\$env:userprofile|\$env:home)(?:\s|$)/i.test(
    compact,
  );
}

/**
 * Decide allow/deny for a shell command string.
 *
 * @param {string} command
 * @returns {"allow" | "deny"}
 */
export function evaluateCommand(command) {
  const normalized = command.replace(/\s+/g, " ").trim();
  const lower = normalized.toLowerCase();

  if (/(^|[;&|]\s*)npm\s+publish\b/.test(lower)) {
    return "deny";
  }

  if (/\bgit\s+push\b/.test(lower) && /(?:\s|^)(--force|-f)(?:\s|$)/.test(` ${lower} `)) {
    return "deny";
  }

  if (/\bgit\s+reset\b/.test(lower) && /--hard\b/.test(lower)) {
    return "deny";
  }

  if (isDangerousRm(normalized) || isDangerousPowerShellRemove(normalized)) {
    return "deny";
  }

  return "allow";
}

/**
 * Map hook stdin text to a Cursor gate decision.
 *
 * @param {string} raw
 * @returns {GateDecision}
 */
export function decideFromPayload(raw) {
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return {
      permission: "ask",
      user_message: "Shell gate could not parse the hook payload as JSON.",
      agent_message: "Resubmit a valid beforeShellExecution JSON payload with a string command.",
    };
  }

  if (
    payload === null ||
    typeof payload !== "object" ||
    Array.isArray(payload) ||
    typeof (/** @type {{ command?: unknown }} */ (payload).command) !== "string"
  ) {
    return {
      permission: "ask",
      user_message: "Shell gate received a payload without a usable command string.",
      agent_message: 'Provide { "command": "..." } so the gate can allow or deny the shell call.',
    };
  }

  const command = /** @type {{ command: string }} */ (payload).command;
  const permission = evaluateCommand(command);
  if (permission === "deny") {
    return {
      permission: "deny",
      user_message: `Blocked destructive or high-impact command: ${command}`,
      agent_message:
        "The shell gate denied this command (npm publish, force push, hard reset, or recursive delete of root/home).",
    };
  }

  return { permission: "allow" };
}

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

const isMain =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const raw = await readStdin();
  process.stdout.write(`${JSON.stringify(decideFromPayload(raw))}\n`);
}
