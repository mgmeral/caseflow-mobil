import { useQuery } from '@tanstack/react-query';
import { getConversation } from '../api/conversationsApi';

export function useConversation(caseId: string) {
  return useQuery({
    queryKey: ['case-conversation', caseId],
    queryFn: () => getConversation(caseId),
    enabled: Boolean(caseId),
    staleTime: 15_000,
  });
}
