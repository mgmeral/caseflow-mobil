import type { ScheduledEmailResponse } from '../../types/api';
import { isCancelable, resolveSchedulePreset, scheduledStatusVariant, splitScheduledEmails } from './scheduledEmails';

function email(id: number, status: string): ScheduledEmailResponse {
  return {
    id,
    ticketId: 1,
    mailboxId: 1,
    fromAddress: null,
    resolvedToAddress: 'customer@example.com',
    sourceEventId: 10,
    subject: 'Re: Help',
    status,
    failureReason: null,
    failureCategory: null,
    sendNotBefore: '2026-09-29T09:00:00Z',
    createdAt: '2026-09-28T09:00:00Z',
    sentAt: null,
    canceledAt: null,
  };
}

describe('splitScheduledEmails', () => {
  it('separates upcoming sends from finished ones', () => {
    const { pending, history } = splitScheduledEmails([email(1, 'PENDING'), email(2, 'SENT'), email(3, 'CANCELED'), email(4, 'SENDING')]);
    expect(pending.map((item) => item.id)).toEqual([1, 4]);
    expect(history.map((item) => item.id)).toEqual([2, 3]);
  });

  it('only allows canceling a send that has not started', () => {
    expect(isCancelable(email(1, 'PENDING'))).toBe(true);
    expect(isCancelable(email(1, 'QUEUED'))).toBe(true);
    expect(isCancelable(email(1, 'SENDING'))).toBe(false);
    expect(isCancelable(email(1, 'SENT'))).toBe(false);
  });

  it('colors statuses like caseflow-fe', () => {
    expect(scheduledStatusVariant('PENDING')).toBe('warning');
    expect(scheduledStatusVariant('SENT')).toBe('success');
    expect(scheduledStatusVariant('FAILED')).toBe('error');
    expect(scheduledStatusVariant('CANCELED')).toBe('default');
  });
});

describe('resolveSchedulePreset', () => {
  const monday = new Date(2026, 8, 28, 15, 30); // Monday 28 Sep 2026, 15:30 local

  it('adds hours from now', () => {
    expect(resolveSchedulePreset('in1h', monday).getHours()).toBe(16);
    expect(resolveSchedulePreset('in4h', monday).getHours()).toBe(19);
  });

  it('picks 09:00 tomorrow', () => {
    const result = resolveSchedulePreset('tomorrow9', monday);
    expect([result.getDate(), result.getHours(), result.getMinutes()]).toEqual([29, 9, 0]);
  });

  it('picks the following Monday even when today is Monday', () => {
    const result = resolveSchedulePreset('nextMonday9', monday);
    expect([result.getDate(), result.getDay(), result.getHours()]).toEqual([5, 1, 9]);
  });

  it('always lands in the future', () => {
    for (const preset of ['in1h', 'in4h', 'tomorrow9', 'nextMonday9'] as const) {
      expect(resolveSchedulePreset(preset, monday).getTime()).toBeGreaterThan(monday.getTime());
    }
  });
});
