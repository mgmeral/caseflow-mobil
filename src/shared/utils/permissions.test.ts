import { hasPermission } from './permissions';

describe('hasPermission', () => {
  it('accepts plain permission codes', () => {
    expect(hasPermission(['ADMIN_POOL_VIEW'], 'ADMIN_POOL_VIEW')).toBe(true);
  });

  it('accepts prefixed permission codes', () => {
    expect(hasPermission(['PERM_TICKET_READ'], 'TICKET_READ')).toBe(true);
  });
});
