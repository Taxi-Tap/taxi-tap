// npm run doctor
// Checks this laptop is ready to run Taxi Tap. Changes nothing.

import { bold, green, red, checkNode, checkLockfile, checkInstalled, checkEnv, checkDatabase } from "./lib/checks.mjs";

console.log(bold("\nTaxi Tap doctor\n"));

const results = [checkNode(), checkLockfile(), checkInstalled(), checkEnv()];
if (results.every(Boolean)) results.push(await checkDatabase());

const failed = results.filter((r) => !r).length;
console.log(
  failed === 0
    ? green(bold("\nAll checks passed. Run: npm run dev\n"))
    : red(bold(`\n${failed} check(s) failed. Fix the items marked ✖, then run: npm run setup\n`)),
);
process.exit(failed === 0 ? 0 : 1);
