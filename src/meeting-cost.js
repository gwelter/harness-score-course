/**
 * Calculates the total labor cost of a meeting.
 *
 * @param {number} participants - Number of people in the meeting (must be >= 1).
 * @param {number} durationMinutes - Meeting length in minutes (must be > 0).
 * @param {number} hourlyCost - Cost per person per hour (must be >= 0).
 * @returns {number} Total labor cost.
 */
export function calculateMeetingCost(participants, durationMinutes, hourlyCost) {
  if (!Number.isFinite(participants) || !Number.isFinite(durationMinutes) || !Number.isFinite(hourlyCost)) {
    throw new Error("participants, durationMinutes, and hourlyCost must be finite numbers");
  }

  if (participants < 1) {
    throw new Error("participants must be at least 1");
  }

  if (durationMinutes <= 0) {
    throw new Error("durationMinutes must be greater than 0");
  }

  if (hourlyCost < 0) {
    throw new Error("hourlyCost must be greater than or equal to 0");
  }

  return participants * (durationMinutes / 60) * hourlyCost;
}
