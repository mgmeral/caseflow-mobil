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
