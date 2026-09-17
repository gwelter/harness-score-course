import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { decideFromPayload, evaluateCommand } from "../.cursor/hooks/shell-gate.js";

describe("shell-gate", () => {
  it("allows common safe commands", () => {
    assert.equal(evaluateCommand("npm test"), "allow");
    assert.equal(evaluateCommand("npm run check"), "allow");
    assert.equal(evaluateCommand("git status"), "allow");
    assert.equal(
      decideFromPayload(JSON.stringify({ command: "npm start -- 6 45 120" })).permission,
      "allow",
    );
  });

  it("denies high-impact commands", () => {
    assert.equal(evaluateCommand("npm publish"), "deny");
    assert.equal(evaluateCommand("git push --force origin main"), "deny");
    assert.equal(evaluateCommand("git push -f"), "deny");
    assert.equal(evaluateCommand("git reset --hard HEAD~1"), "deny");
    assert.equal(evaluateCommand("rm -rf /"), "deny");
    assert.equal(evaluateCommand("rm -rf ~"), "deny");
    assert.equal(evaluateCommand("Remove-Item -Recurse -Force $HOME"), "deny");
    assert.equal(decideFromPayload(JSON.stringify({ command: "npm publish" })).permission, "deny");
  });

  it("asks when the payload is malformed", () => {
    assert.equal(decideFromPayload("not-json").permission, "ask");
    assert.equal(decideFromPayload("{}").permission, "ask");
    assert.equal(decideFromPayload(JSON.stringify({ command: 12 })).permission, "ask");
  });
});
