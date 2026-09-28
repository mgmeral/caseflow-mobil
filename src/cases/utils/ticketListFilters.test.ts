import { buildCasesQuery } from '../api/casesApi';
import {
  activeFilterTags,
  agingTone,
  dashboardPresetFilters,
  DEFAULT_TICKET_FILTERS,
  formatDuration,
  openMinutes,
  toCaseFilters,
} from './ticketListFilters';

const query = (filters: Parameters<typeof toCaseFilters>[0]) => new URLSearchParams(buildCasesQuery(0, toCaseFilters(filters)));

describe('dashboard presets', () => {
  it('maps every FE dashboard key to the backend params that match its count', () => {
    expect(query(dashboardPresetFilters('active')!).get('openOnly')).toBe('true');
    expect(query(dashboardPresetFilters('unassigned')!).get('unassignedOnly')).toBe('true');
    expect(query(dashboardPresetFilters('waiting')!).get('status')).toBe('WAITING_CUSTOMER');
    expect(query(dashboardPresetFilters('resolved')!).get('status')).toBe('RESOLVED');
    expect(query(dashboardPresetFilters('closed')!).get('status')).toBe('CLOSED');
    expect(query(dashboardPresetFilters('staleOpen24h')!).get('staleOpenOverHours')).toBe('24');
    expect(query(dashboardPresetFilters('slaBreached')!).get('slaState')).toBe('BREACHED');
    expect(query(dashboardPresetFilters('slaAtRisk')!).get('slaState')).toBe('AT_RISK');
  });

  it('ignores unknown keys', () => {
    expect(dashboardPresetFilters('nope')).toBeNull();
    expect(dashboardPresetFilters(undefined)).toBeNull();
  });
});

describe('backend query', () => {
  it('never sends params the backend ignores', () => {
    const params = query({ ...DEFAULT_TICKET_FILTERS, overdueOnly: true, slaState: 'AT_RISK' });
    expect(params.has('overdueOnly')).toBe(false);
    expect(params.has('slaAtRiskOnly')).toBe(false);
    expect(params.has('transferredOnly')).toBe(false);
  });

  it('sends single-value filters and whole-day date bounds', () => {
    const params = query({
      ...DEFAULT_TICKET_FILTERS,
      search: ' printer ',
      priority: 'HIGH',
      assignedUserId: 4,
      groupId: 2,
      tagId: 9,
      dateFrom: '2026-09-01',
      dateTo: '2026-09-28',
    });
    expect(params.get('search')).toBe('printer');
    expect(params.get('priority')).toBe('HIGH');
    expect(params.get('userId')).toBe('4');
    expect(params.get('groupId')).toBe('2');
    expect(params.get('tagId')).toBe('9');
    expect(params.get('from')).toBe('2026-09-01T00:00:00.000Z');
    expect(params.get('to')).toBe('2026-09-28T23:59:59.999Z');
  });

  it('uses the requested sort', () => {
    const params = new URLSearchParams(buildCasesQuery(1, { sort: 'updatedAt', direction: 'desc' }));
    expect(params.get('sort')).toBe('updatedAt');
    expect(params.get('direction')).toBe('desc');
    expect(params.get('page')).toBe('1');
  });
});

describe('active filter tags', () => {
  it('lists removable chips in FE order with readable names', () => {
    const tags = activeFilterTags(
      { ...DEFAULT_TICKET_FILTERS, status: 'IN_PROGRESS', assignedUserId: 4, tagId: 9, openOnly: true, slaState: 'BREACHED', dateFrom: '2026-09-01' },
      {
        statusLabel: () => 'In Progress',
        priorityLabel: (p) => p,
        userName: (id) => (id === 4 ? 'Bob Agent' : undefined),
        groupName: () => undefined,
        tagName: () => undefined,
      },
    );
    expect(tags.map((tag) => tag.label)).toEqual([
      'Status: In Progress',
      'Assignee: Bob Agent',
      'Tag: #9',
      'Open Only',
      'SLA Breached',
      'Date Range',
    ]);
    expect(tags[5].clear).toEqual({ dateFrom: null, dateTo: null });
  });
});

describe('aging', () => {
  it('formats durations like FE', () => {
    expect(formatDuration(45)).toBe('45m');
    expect(formatDuration(120)).toBe('2h');
    expect(formatDuration(150)).toBe('2h 30m');
    expect(formatDuration(1500)).toBe('1d 1h');
  });

  it('colours by age, and red whenever the SLA is breached', () => {
    expect(agingTone(60, false)).toBe('fresh');
    expect(agingTone(300, false)).toBe('aging');
    expect(agingTone(600, false)).toBe('old');
    expect(agingTone(2000, false)).toBe('stale');
    expect(agingTone(10, true)).toBe('stale');
  });

  it('measures open time from createdAt', () => {
    expect(openMinutes('2026-09-28T10:00:00Z', Date.parse('2026-09-28T12:30:00Z'))).toBe(150);
  });
});
