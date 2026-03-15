// Mock interface for applicants
export interface Applicant {
  runnerId: string;
  name: string;
  commitmentScore: number;
  walletAddress: string;
  status: "pending" | "confirmed" | "waitlisted" | "cancelled";
}

export interface AllocationResult {
  confirmedRunners: Applicant[];
  waitlistedRunners: Applicant[];
}

const TOTAL_SPOTS = parseInt(process.env.MAX_PARTICIPANTS || "10", 10);

/**
 * Sorts applicants by commitment score (descending) and assigns spots.
 * Remaining applicants go to waitlist.
 */
export function allocateSpots(applicants: Applicant[]): AllocationResult {
  // Sort applicants highest score first
  const sortedApplicants = [...applicants].sort((a, b) => b.commitmentScore - a.commitmentScore);
  
  const confirmedRunners: Applicant[] = [];
  const waitlistedRunners: Applicant[] = [];

  sortedApplicants.forEach((applicant, index) => {
    if (index < TOTAL_SPOTS) {
      applicant.status = "confirmed";
      confirmedRunners.push(applicant);
    } else {
      applicant.status = "waitlisted";
      waitlistedRunners.push(applicant);
    }
  });

  return { confirmedRunners, waitlistedRunners };
}

/**
 * Handles a confirmed runner cancelling within the allowed window.
 * Grabs the first (highest score) person off the waitlist and moves them to confirmed.
 */
export function processCancellation(
  cancelledRunnerId: string, 
  confirmed: Applicant[], 
  waitlisted: Applicant[]
): { newConfirmed: Applicant[]; newWaitlisted: Applicant[]; newlyConfirmedRunner?: Applicant } {
  
  const cancelIndex = confirmed.findIndex(r => r.runnerId === cancelledRunnerId);
  if (cancelIndex === -1) {
    // Runner not found or already cancelled
    return { newConfirmed: confirmed, newWaitlisted: waitlisted };
  }
  
  // Remove the runner who cancelled
  confirmed[cancelIndex].status = "cancelled";
  confirmed.splice(cancelIndex, 1);

  let newlyConfirmedRunner: Applicant | undefined = undefined;

  // Pop top of waitlist
  if (waitlisted.length > 0) {
    newlyConfirmedRunner = waitlisted.shift(); // Remove first element
    if (newlyConfirmedRunner) {
      newlyConfirmedRunner.status = "confirmed";
      confirmed.push(newlyConfirmedRunner);
      // Waitlist array is already updated because of shift()
    }
  }

  // Returning copy to avoid mutating original objects unexpectedly if integrated into React state natively
  return { 
    newConfirmed: [...confirmed], 
    newWaitlisted: [...waitlisted],
    newlyConfirmedRunner 
  };
}
