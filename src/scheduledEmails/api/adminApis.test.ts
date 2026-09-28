jest.mock('../../core/api/apiClient', () => ({
  apiClient: { get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));

import { createChannel, getEventCatalog, updateChannel } from '../../channels/api/channelsApi';
import { getAdminAggregateReport, getCustomerReport } from '../../reports/api/reportsApi';
import { buildReportDateRange } from '../../reports/utils/dateRange';
import { getTemplates, previewTemplate } from '../../templates/api/templatesApi';
import { cancelScheduledEmail, getScheduledEmails, scheduleEmail } from './scheduledEmailsApi';

const { apiClient } = jest.requireMock('../../core/api/apiClient') as {
  apiClient: Record<'get' | 'post' | 'put' | 'delete', jest.Mock>;
};
const { get: mockGet, post: mockPost, put: mockPut, delete: mockDelete } = apiClient;

const PUBLIC_ID ='7f1c2d3e-0000-4000-8000-000000000001';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('back-office API paths', () => {
  it('addresses scheduled emails by ticket publicId', async () => {
    await getScheduledEmails(PUBLIC_ID);
    await scheduleEmail(PUBLIC_ID, { mailboxId: 1, sourceEventId: 2, subject: 's', textBody: 'b', sendNotBefore: '2026-09-29T09:00:00.000Z' });
    await cancelScheduledEmail(PUBLIC_ID, 9);

    expect(mockGet).toHaveBeenCalledWith(`/tickets/${PUBLIC_ID}/scheduled-emails`);
    expect(mockPost).toHaveBeenCalledWith(`/tickets/${PUBLIC_ID}/scheduled-emails`, expect.objectContaining({ sendNotBefore: '2026-09-29T09:00:00.000Z' }));
    expect(mockDelete).toHaveBeenCalledWith(`/tickets/${PUBLIC_ID}/scheduled-emails/9`);
  });

  it('uses the channel admin endpoints', async () => {
    const request = { name: 'n', channelType: 'SLACK' as const, subscribedEvents: ['TICKET_CREATED'], scopeType: 'GLOBAL' as const, scopeId: null, enabled: true };
    await createChannel(request);
    await updateChannel(4, request);
    await getEventCatalog();

    expect(mockPost).toHaveBeenCalledWith('/admin/integrations/channels', request);
    expect(mockPut).toHaveBeenCalledWith('/admin/integrations/channels/4', request);
    expect(mockGet).toHaveBeenCalledWith('/admin/integrations/channels/event-catalog');
  });

  it('passes template filters as query params', async () => {
    await getTemplates({});
    await getTemplates({ search: ' follow up ', activeOnly: true });
    await previewTemplate(3, { replyBody: 'x' });

    expect(mockGet).toHaveBeenNthCalledWith(1, '/admin/mail-templates');
    expect(mockGet).toHaveBeenNthCalledWith(2, '/admin/mail-templates?search=follow%20up&activeOnly=true');
    expect(mockPost).toHaveBeenCalledWith('/admin/mail-templates/3/preview', { replyBody: 'x' });
  });

  it('calls only the two report endpoints caseflow-fe consumes', async () => {
    const allTime = buildReportDateRange('allTime');
    await getCustomerReport('12', allTime);
    await getAdminAggregateReport(2, 20, allTime);

    expect(mockGet).toHaveBeenNthCalledWith(1, '/customers/12/reports/tickets');
    expect(mockGet).toHaveBeenNthCalledWith(2, '/admin/reports/customers/tickets?page=2&size=20');
  });
});
