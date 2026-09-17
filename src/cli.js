import { calculateMeetingCost } from "./meeting-cost.js";

function printUsage() {
  console.error("Usage: npm start -- <participants> <durationMinutes> <hourlyCost>");
  console.error("Example: npm start -- 6 45 120");
}

/**
 * @param {unknown} error
 * @returns {string}
 */
function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function main() {
  const [, , participantsArg, durationArg, hourlyCostArg] = process.argv;

  if (participantsArg === undefined || durationArg === undefined || hourlyCostArg === undefined) {
    console.error("Error: missing arguments.");
    printUsage();
    process.exitCode = 1;
    return;
  }

  const participants = Number(participantsArg);
  const durationMinutes = Number(durationArg);
  const hourlyCost = Number(hourlyCostArg);

  try {
    const totalCost = calculateMeetingCost(participants, durationMinutes, hourlyCost);
    console.log(
      `Meeting cost: ${totalCost.toFixed(2)} ` +
        `(${participants} participants × ${durationMinutes} min × ${hourlyCost}/hour)`,
    );
  } catch (error) {
    console.error(`Error: ${errorMessage(error)}`);
    printUsage();
    process.exitCode = 1;
  }
}

main();
