import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendReply, type SendReplyInput } from '../api/conversationsApi';

export function useSendReply(caseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SendReplyInput) => sendReply(caseId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-conversation', caseId] });
    },
  });
}
