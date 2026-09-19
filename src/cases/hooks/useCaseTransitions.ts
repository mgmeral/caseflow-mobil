import { useQuery } from '@tanstack/react-query';
import { getCaseTransitions } from '../api/casesApi';

export function useCaseTransitions(caseId: string, enabled = true) {
  return useQuery({
    queryKey: ['case-transitions', caseId],
    queryFn: () => getCaseTransitions(caseId),
    enabled: Boolean(caseId) && enabled,
  });
}
