import { useQuery } from '@tanstack/react-query';
import { getGroups } from '../api/groupsApi';

export function useGroups(enabled = true) {
  return useQuery({
    queryKey: ['groups'],
    queryFn: getGroups,
    enabled,
    staleTime: 60_000,
  });
}
