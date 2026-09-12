import { buildCasesQuery } from './casesApi';

describe('buildCasesQuery', () => {
  it('preserves backend paging defaults and filters', () => {
    expect(buildCasesQuery(2, { openOnly: true, status: 'RESOLVED' })).toContain('page=2');
    expect(buildCasesQuery(2, { openOnly: true, status: 'RESOLVED' })).toContain('openOnly=true');
    expect(buildCasesQuery(2, { openOnly: true, status: 'RESOLVED' })).toContain('status=RESOLVED');
  });
});
