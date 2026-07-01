export type OnboardingStatusSteps = {
  preferences: boolean;
  xAccount: boolean;
  styleProfile: boolean;
};

export type OnboardingStatus = {
  completed: boolean;
  steps: OnboardingStatusSteps;
};

export type OnboardingStatusResult =
  | { kind: "ok"; data: OnboardingStatus }
  | { kind: "unauthorized" }
  | { kind: "error" };

export async function fetchOnboardingStatus(
  accessToken: string,
): Promise<OnboardingStatusResult> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/onboarding-status`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      },
    );
    if (res.status === 401) return { kind: "unauthorized" };
    if (!res.ok) return { kind: "error" };
    const data = (await res.json()) as OnboardingStatus;
    return { kind: "ok", data };
  } catch {
    return { kind: "error" };
  }
}

// Maps an incomplete onboarding state to the step the user should resume on.
// xAccount missing → step 0 (Connect X).
// styleProfile missing → step 1 (Analyze X, which runs the analysis).
// preferences missing → step 2 (Niche).
export function resumeStepFromStatus(steps: OnboardingStatusSteps): number {
  if (!steps.xAccount) return 0;
  if (!steps.styleProfile) return 1;
  if (!steps.preferences) return 2;

  return 0;
}
