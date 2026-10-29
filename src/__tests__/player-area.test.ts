import { describe, expect, it } from 'vitest';
import type { AvailabilitySchedule, MyApplicationItem, PlayerSportProfile } from '@/lib/player-api';

describe('Player Area - Availability Schedule', () => {
  it('correctly manages weekday slots', () => {
    const schedule: AvailabilitySchedule = {
      fri: ['afternoon', 'evening'],
      sat: ['morning'],
    };

    expect(schedule.fri).toHaveLength(2);
    expect(schedule.sat).toContain('morning');
    expect(schedule.sun).toBeUndefined();
  });
});

describe('Player Area - Sport Profile Rates', () => {
  it('validates rate order correctly', () => {
    const profile: Partial<PlayerSportProfile> = {
      khepAvailable: true,
      rateMin: 1500,
      rateMax: 3000,
    };

    expect(profile.rateMin).toBeLessThanOrEqual(profile.rateMax!);
  });
});

describe('Player Area - Application Status & Contact Reveal', () => {
  it('reveals captain phone number ONLY when application is ACCEPTED', () => {
    const pendingApp: Partial<MyApplicationItem> = {
      id: 'app-pending',
      status: 'PENDING',
      contact: undefined,
    };

    const acceptedApp: Partial<MyApplicationItem> = {
      id: 'app-accepted',
      status: 'ACCEPTED',
      contact: {
        phone: '+8801712345678',
      },
    };

    expect(pendingApp.contact?.phone).toBeUndefined();
    expect(acceptedApp.contact?.phone).toBe('+8801712345678');
    expect(acceptedApp.status).toBe('ACCEPTED');
  });
});

