import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ChannelConfigRequest } from '../../types/api';
import { createChannel, deleteChannel, getChannel, getChannels, getEventCatalog, updateChannel } from '../api/channelsApi';

export function useChannels() {
  return useQuery({ queryKey: ['notification-channels'], queryFn: getChannels });
}

export function useChannel(id: number | null) {
  return useQuery({
    queryKey: ['notification-channel', id],
    queryFn: () => getChannel(id as number),
    enabled: id != null,
  });
}

export function useEventCatalog() {
  return useQuery({ queryKey: ['notification-event-catalog'], queryFn: getEventCatalog, staleTime: 5 * 60_000 });
}

export function useSaveChannel(id: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ChannelConfigRequest) => (id == null ? createChannel(request) : updateChannel(id, request)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-channels'] });
      queryClient.invalidateQueries({ queryKey: ['notification-channel', id] });
    },
  });
}

export function useDeleteChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteChannel(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notification-channels'] }),
  });
}
