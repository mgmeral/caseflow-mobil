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
  customerName?: string | null;
  assignedUserName?: string | null;
  assignedGroupName?: string | null;
  createdAt: string;
  updatedAt?: string;
  statusChangedAt?: string | null;
  slaState?: string | null;
  resolutionDueAt?: string | null;
}

export interface SlaSummary {
  state?: string | null;
  resolutionDueAt?: string | null;
  firstResponseDueAt?: string | null;
}

export interface TicketDetailResponse extends TicketSummaryResponse {
  description?: string | null;
  closedAt?: string | null;
  sla?: SlaSummary | null;
  history?: Array<{ id?: number; actionType?: string; performedAt?: string }>;
  firstResponseDueAt?: string | null;
}

export interface CaseDetail {
  id: string;
  publicId: string | null;
  ticketNo: string;
  subject: string;
  description: string | null;
  status: string;
  priority: string;
  customerName: string;
  assignedUserName: string | null;
  assignedGroupName: string | null;
  resolutionDueAt: string | null;
  firstResponseDueAt: string | null;
  slaState: string | null;
  createdAt: string;
  updatedAt?: string;
  history: Array<{ id?: number; actionType?: string; performedAt?: string }>;
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
}

export interface CustomerSummaryResponse {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
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
