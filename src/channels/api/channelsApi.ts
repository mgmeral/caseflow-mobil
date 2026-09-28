import { apiClient } from '../../core/api/apiClient';
import type { ChannelConfigRequest, ChannelConfigResponse } from '../../types/api';

const BASE = '/admin/integrations/channels';

export async function getChannels() {
  return apiClient.get<ChannelConfigResponse[]>(BASE);
}

export async function getChannel(id: number) {
  return apiClient.get<ChannelConfigResponse>(`${BASE}/${id}`);
}

export async function createChannel(request: ChannelConfigRequest) {
  return apiClient.post<ChannelConfigResponse>(BASE, request);
}

export async function updateChannel(id: number, request: ChannelConfigRequest) {
  return apiClient.put<ChannelConfigResponse>(`${BASE}/${id}`, request);
}

export async function deleteChannel(id: number) {
  return apiClient.delete<void>(`${BASE}/${id}`);
}

export async function getEventCatalog() {
  return apiClient.get<string[]>(`${BASE}/event-catalog`);
}
