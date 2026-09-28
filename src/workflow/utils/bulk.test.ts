jest.mock('../../core/api/apiClient', () => ({
  apiClient: { get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));

import { ApiError } from '../../core/api/http';
import { assignOrReassignTicket } from '../api/assignmentApi';
import { BULK_COPY, bulkMessage, runForEach } from './bulk';

const { apiClient } = jest.requireMock('../../core/api/apiClient') as { apiClient: { post: jest.Mock } };

beforeEach(() => jest.clearAllMocks());

describe('runForEach', () => {
  it('runs every id and counts failures instead of stopping', async () => {
    const action = jest.fn((id: string) => (id === '2' ? Promise.reject(new Error('no')) : Promise.resolve()));
    await expect(runForEach(['1', '2', '3'], action)).resolves.toEqual({ successCount: 2, failCount: 1 });
    expect(action).toHaveBeenCalledTimes(3);
  });
});

describe('bulk toast copy (as in caseflow-fe)', () => {
  it('reports success and partial failure', () => {
    expect(bulkMessage({ successCount: 3, failCount: 0 }, BULK_COPY.assign)).toEqual({ ok: true, text: '3 tickets assigned.' });
    expect(bulkMessage({ successCount: 1, failCount: 0 }, BULK_COPY.tag)).toEqual({ ok: true, text: 'Tag applied to 1 ticket.' });
    expect(bulkMessage({ successCount: 2, failCount: 0 }, BULK_COPY.status('Resolved')).text).toBe('2 tickets updated to Resolved.');
    expect(bulkMessage({ successCount: 2, failCount: 1 }, BULK_COPY.assign)).toEqual({
      ok: false,
      text: '2 assigned, 1 failed. Check individual tickets.',
    });
  });
});

describe('assignOrReassignTicket', () => {
  it('assigns an unowned ticket', async () => {
    apiClient.post.mockResolvedValueOnce({ id: 1 });
    await assignOrReassignTicket('7', 4);
    expect(apiClient.post).toHaveBeenCalledTimes(1);
    expect(apiClient.post).toHaveBeenCalledWith('/assignments/assign', expect.objectContaining({ ticketId: 7, assignedUserId: 4 }));
  });

  it('falls back to reassign when the ticket already has an owner', async () => {
    apiClient.post
      .mockRejectedValueOnce(new ApiError(409, 'ASSIGNMENT_CONFLICT', 'already assigned'))
      .mockResolvedValueOnce({ id: 2 });
    await assignOrReassignTicket('7', 4);
    expect(apiClient.post).toHaveBeenLastCalledWith('/assignments/reassign', { ticketId: 7, newUserId: 4 });
  });

  it('does not reassign on other errors', async () => {
    apiClient.post.mockRejectedValueOnce(new ApiError(403, 'FORBIDDEN', 'no'));
    await expect(assignOrReassignTicket('7', 4)).rejects.toMatchObject({ status: 403 });
    expect(apiClient.post).toHaveBeenCalledTimes(1);
  });
});
