import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateMeetingCost } from "../src/meeting-cost.js";

describe("calculateMeetingCost", () => {
  it("calculates a valid meeting cost", () => {
    assert.equal(calculateMeetingCost(6, 45, 120), 540);
  });

  it("keeps fractional results that round to two decimals in the CLI", () => {
    const cost = calculateMeetingCost(1, 1, 100);
    assert.equal(cost, 100 / 60);
    assert.equal(cost.toFixed(2), "1.67");
  });

  it("rejects invalid ranges", () => {
    assert.throws(() => calculateMeetingCost(0, 45, 120), /participants must be at least 1/);
    assert.throws(() => calculateMeetingCost(6, 0, 120), /durationMinutes must be greater than 0/);
    assert.throws(
      () => calculateMeetingCost(6, 45, -1),
      /hourlyCost must be greater than or equal to 0/,
    );
  });

  it("rejects non-finite inputs", () => {
    assert.throws(() => calculateMeetingCost(Number.NaN, 45, 120), /must be finite numbers/);
    assert.throws(
      () => calculateMeetingCost(6, Number.POSITIVE_INFINITY, 120),
      /must be finite numbers/,
    );
    assert.throws(
      () => calculateMeetingCost(6, 45, Number.NEGATIVE_INFINITY),
      /must be finite numbers/,
    );
  });
});
