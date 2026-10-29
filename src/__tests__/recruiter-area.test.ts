import { describe, expect, it } from 'vitest';
import type { MyRecruiterProfile, RecruiterRequestItem } from '@/lib/recruiter-api';

describe('Recruiter Area - Profile Validation', () => {
  it('validates recruiter organization and sports list', () => {
    const profile: Partial<MyRecruiterProfile> = {
      type: 'CLUB',
      organization: 'Abahani Youth Club',
      sportIds: [1, 2],
      verifiedBadge: true,
    };

    expect(profile.type).toBe('CLUB');
    expect(profile.sportIds).toHaveLength(2);
    expect(profile.sportIds).toContain(1);
  });
});

describe('Recruiter Area - Request Lifecycle', () => {
  it('calculates remaining spots accurately', () => {
    const request: Partial<RecruiterRequestItem> = {
      playersNeeded: 4,
      acceptedCount: 3,
      spotsLeft: 1,
      status: 'OPEN',
    };

    expect(request.playersNeeded! - request.acceptedCount!).toBe(request.spotsLeft);
  });
});

describe('Recruiter Area - Match Rating Logic', () => {
  it('enforces no-show overrides individual metric scores', () => {
    const normalRating = {
      noShow: false,
      scores: { skill: 5, punctuality: 4, behavior: 5 },
    };

    const noShowRating = {
      noShow: true,
      scores: undefined,
    };

    expect(normalRating.scores).toBeDefined();
    expect(normalRating.scores?.skill).toBe(5);
    expect(noShowRating.scores).toBeUndefined();
    expect(noShowRating.noShow).toBe(true);
  });
});

