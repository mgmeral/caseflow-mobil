import { apiClient } from '../../core/api/apiClient';
import type {
  MailTemplatePreviewRequest,
  MailTemplatePreviewResponse,
  MailTemplateRequest,
  MailTemplateResponse,
} from '../../types/api';

const BASE = '/admin/mail-templates';

export interface TemplateFilters {
  search?: string;
  activeOnly?: boolean;
}

export async function getTemplates(filters: TemplateFilters = {}) {
  const params: string[] = [];
  if (filters.search?.trim()) params.push(`search=${encodeURIComponent(filters.search.trim())}`);
  if (filters.activeOnly) params.push('activeOnly=true');
  return apiClient.get<MailTemplateResponse[]>(`${BASE}${params.length > 0 ? `?${params.join('&')}` : ''}`);
}

export async function getTemplate(id: number) {
  return apiClient.get<MailTemplateResponse>(`${BASE}/${id}`);
}

export async function createTemplate(request: MailTemplateRequest) {
  return apiClient.post<MailTemplateResponse>(BASE, request);
}

export async function updateTemplate(id: number, request: MailTemplateRequest) {
  return apiClient.put<MailTemplateResponse>(`${BASE}/${id}`, request);
}

export async function deleteTemplate(id: number) {
  return apiClient.delete<void>(`${BASE}/${id}`);
}

export async function previewTemplate(id: number, request: MailTemplatePreviewRequest) {
  return apiClient.post<MailTemplatePreviewResponse>(`${BASE}/${id}/preview`, request);
}
