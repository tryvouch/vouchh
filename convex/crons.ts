import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run dunning check every day
crons.daily(
    "revenue-recovery-check",
    { hourUTC: 12, minuteUTC: 0 },
    internal.dunning.checkFailures
);

export default crons;
