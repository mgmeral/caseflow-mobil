import { useQuery } from '@tanstack/react-query';
import { getCaseDetail, mapCaseDetail } from '../api/casesApi';

export function useCaseDetail(caseId: string) {
  return useQuery({
    queryKey: ['case-detail', caseId],
    queryFn: async () => mapCaseDetail(await getCaseDetail(caseId)),
    enabled: Boolean(caseId),
  });
}
