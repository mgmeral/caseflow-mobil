export interface PagedResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type CaseListResponse<T> = PagedResponse<T>;

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface AuthMeResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roleId: number;
  roleCode: string;
  roleName: string;
  permissionCodes: string[];
  ticketScope: string;
  groupIds: number[];
}

export interface DashboardActionItem {
  id: number;
  ticketNo: string;
  subject: string;
  status: string;
  priority: string;
  customerName: string;
}

export interface DashboardStatsResponse {
  totalTickets: number;
  activeTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  unassignedTickets: number;
  waitingOver24h: number;
  breachedSlaCount: number;
  atRiskSlaCount: number;
  myActionRequired: number | null;
  myActionRequiredItems: DashboardActionItem[];
}

export interface TicketSummaryResponse {
  id: number;
  publicId?: string | null;
  ticketNo: string;
  subject: string;
  status: string;
  priority: string;
  customerId?: number | null;
  customerName?: string | null;
  assignedUserId?: number | null;
  assignedUserName?: string | null;
  assignedGroupId?: number | null;
  assignedGroupName?: string | null;
  createdAt: string;
  updatedAt?: string;
  statusChangedAt?: string | null;
  slaState?: string | null;
  resolutionDueAt?: string | null;
  firstResponseDueAt?: string | null;
}

export interface SlaSummary {
  state?: string | null;
  resolutionDueAt?: string | null;
  firstResponseDueAt?: string | null;
}

export interface AttachmentMetadataResponse {
  id: number;
  ticketId: number;
  ticketPublicId?: string | null;
  emailId?: string | null;
  fileName: string;
  contentType: string;
  size: number;
  sourceType?: string | null;
  downloadPath: string;
  previewSupported: boolean;
  uploadedAt: string;
}

export interface HistorySummaryResponse {
  id: number;
  actionType: string;
  performedBy?: number | null;
  performedByName?: string | null;
  sourceType?: string | null;
  summary?: string | null;
  performedAt: string;
}

export interface TicketDetailResponse extends TicketSummaryResponse {
  description?: string | null;
  closedAt?: string | null;
  sla?: SlaSummary | null;
  attachments?: AttachmentMetadataResponse[];
  history?: HistorySummaryResponse[];
}

export interface CaseDetail {
  id: string;
  publicId: string | null;
  ticketNo: string;
  subject: string;
  description: string | null;
  status: string;
  priority: string;
  customerId: number | null;
  customerName: string;
  assignedUserId: number | null;
  assignedUserName: string | null;
  assignedGroupId: number | null;
  assignedGroupName: string | null;
  resolutionDueAt: string | null;
  firstResponseDueAt: string | null;
  slaState: string | null;
  createdAt: string;
  updatedAt?: string;
  attachments: AttachmentMetadataResponse[];
  history: HistorySummaryResponse[];
}

export interface EmailThreadItemResponse {
  direction: 'INBOUND' | 'OUTBOUND';
  id: number | string;
  messageId?: string | null;
  fromAddress?: string | null;
  toAddress?: string | null;
  subject?: string | null;
  status?: string | null;
  timestamp: string;
  bodyPreview?: string | null;
  attachmentCount?: number;
  emailDocumentId?: string | null;
  sourceEventId?: number | null;
  mailboxId?: number | null;
  mailboxName?: string | null;
  failureReason?: string | null;
  resolvedReplyTarget?: string | null;
  detailType?: 'EMAIL_DOCUMENT' | 'OUTBOUND_DISPATCH' | null;
  detailId?: string | null;
  hasAttachments?: boolean;
  isPreviewAvailable?: boolean;
}

export interface CustomerSummaryResponse {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
}

export interface CustomerResponse {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
  colorHex?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ContactSummaryResponse {
  id: number;
  customerId: number;
  email: string;
  name?: string | null;
  isPrimary?: boolean | null;
}

export interface NotificationResponse {
  id: number;
  type: string;
  title: string;
  message: string;
  ticketNo?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface QueueStatsResponse {
  allUnassigned: number;
  highOrCritical: number;
  waitingOver8h: number;
  slaBreached: number;
}

export interface AllowedTransitionsResponse {
  ticketId: number;
  currentStatus: string;
  allowedTransitions: string[];
}

export type NoteType = 'INFO' | 'INVESTIGATION' | 'ESCALATION' | 'INTERNAL';

export interface UserSummary {
  id: number;
  username: string;
  displayName: string;
}

export interface NoteResponse {
  id: number;
  ticketId: number;
  content: string;
  type: NoteType;
  createdBy?: number | null;
  createdByUser?: UserSummary | null;
  mentions: UserSummary[];
  createdAt: string;
}

export interface AssignmentResponse {
  id: number;
  ticketId: number;
  assignedUserId?: number | null;
  assignedGroupId?: number | null;
  assignedBy?: number | null;
  assignedAt: string;
  unassignedAt?: string | null;
  active: boolean;
}

export interface TransferResponse {
  id: number;
  ticketId: number;
  fromGroupId?: number | null;
  toGroupId: number;
  fromGroupName?: string | null;
  toGroupName?: string | null;
  transferredBy?: number | null;
  transferredByName?: string | null;
  transferredAt: string;
  reason?: string | null;
}

export interface TagResponse {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  color?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface TicketTagResponse {
  tagId: number;
  tagCode: string;
  tagName: string;
  tagColor?: string | null;
  taggedAt: string;
  taggedBy?: number | null;
}

export type JiraJobStatus = 'NOT_REQUESTED' | 'PENDING' | 'PROCESSING' | 'FAILED' | 'PERMANENTLY_FAILED' | 'CANCELED' | 'SUCCEEDED';

export interface JiraStatusResponse {
  jobId?: number | null;
  jobStatus: JiraJobStatus;
  attemptCount?: number | null;
  lastError?: string | null;
  nextAttemptAt?: string | null;
  jiraIssueKey?: string | null;
  jiraUrl?: string | null;
  linkedAt?: string | null;
}

export interface ReplyEnqueuedResponse {
  dispatchId: number;
  sourceEventId?: number | null;
  resolvedToAddress?: string | null;
  fromAddress: string;
  mailboxId: number;
  subject: string;
  acceptedAt: string;
}

export interface GroupSummaryResponse {
  id: number;
  name: string;
  groupTypeId?: number | null;
  groupTypeCode?: string | null;
  groupTypeName?: string | null;
  isActive: boolean;
  memberCount: number;
  memberIds: number[];
}

// ---------------------------------------------------------------------------
// Admin / back-office (ALIGN-002-MOBILE-EXT). Shapes per
// caseflow-central-brain repos/backend/frontend-contract.md.
// ---------------------------------------------------------------------------

export type ChannelType = 'SLACK' | 'TEAMS';
export type ChannelScopeType = 'GLOBAL' | 'GROUP' | 'CUSTOMER';

export interface ChannelConfigResponse {
  id: number;
  name: string;
  channelType: ChannelType;
  enabled: boolean;
  /** Always "****" — the stored URL is never returned. */
  webhookUrl: string;
  /** JSON-encoded string array, not a native array — parse with parseSubscribedEvents. */
  subscribedEvents: string | null;
  scopeType: ChannelScopeType | null;
  scopeId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelConfigRequest {
  name: string;
  channelType: ChannelType;
  /** Required on create; blank on update keeps the stored URL. */
  webhookUrl?: string;
  subscribedEvents: string[];
  scopeType: ChannelScopeType;
  scopeId: number | null;
  enabled: boolean;
}

export interface MailTemplateResponse {
  id: number;
  code: string;
  name: string;
  usageType: string | null;
  description: string | null;
  supportedPlaceholders: string | null;
  customerVisible: boolean | null;
  defaultStatusAfterSend: string | null;
  subjectTemplate: string | null;
  htmlTemplate: string;
  plainTextTemplate: string;
  isActive: boolean | null;
  isBuiltIn: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export interface MailTemplateRequest {
  /** Upper-cased server-side; ignored on update. */
  code: string;
  name: string;
  subjectTemplate?: string | null;
  htmlTemplate: string;
  plainTextTemplate: string;
  isActive?: boolean;
  usageType?: string | null;
  description?: string | null;
  customerVisible?: boolean;
  defaultStatusAfterSend?: string | null;
}

export interface MailTemplatePreviewRequest {
  replyBody?: string;
  ticketRef?: string;
  mailboxName?: string;
  agentName?: string;
  signatureBlock?: string;
}

export interface MailTemplatePreviewResponse {
  subject: string | null;
  html: string | null;
  text: string | null;
}

export interface ScheduledEmailResponse {
  id: number;
  /** Numeric ticket id, even though the URL uses the publicId. */
  ticketId: number;
  mailboxId: number;
  fromAddress: string | null;
  resolvedToAddress: string | null;
  sourceEventId: number | null;
  subject: string;
  status: string;
  failureReason: string | null;
  failureCategory: string | null;
  sendNotBefore: string;
  createdAt: string;
  sentAt: string | null;
  canceledAt: string | null;
}

export interface ScheduleEmailRequest {
  mailboxId: number;
  sourceEventId?: number | null;
  toAddress?: string | null;
  subject: string;
  textBody: string;
  /** ISO-8601 instant; must be in the future. */
  sendNotBefore: string;
  contentWasEdited?: boolean;
}

export interface ReportTagCount {
  tagId: number;
  tagCode: string;
  tagName: string;
  tagColor: string | null;
  count: number;
}

export interface ReportStatusCounts {
  totalCount: number;
  openCount: number;
  newCount: number;
  inProgressCount: number;
  waitingCustomerCount: number;
  resolvedCount: number;
  closedCount: number;
  reopenedCount: number;
}

export interface CustomerTicketReportResponse extends ReportStatusCounts {
  customerId: number;
  customerName: string;
  from: string | null;
  to: string | null;
  byTag: ReportTagCount[];
}

export interface AdminCustomerReportRow extends ReportStatusCounts {
  customerId: number;
  customerName: string;
  customerColorHex: string | null;
}

// GET /api/users item (UserController.listUsers).
export interface UserSummaryResponse {
  id: number;
  username: string;
  fullName: string;
  roleId: number | null;
  roleCode: string | null;
  isActive: boolean;
  openTicketCount: number;
}
