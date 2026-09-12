import { useInfiniteQuery } from '@tanstack/react-query';
import { getCases, type CaseFilters } from '../api/casesApi';

export function useCases(filters: CaseFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['cases', filters],
    queryFn: ({ pageParam = 0 }) => getCases(pageParam as number, filters),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1;
      return nextPage < lastPage.totalPages ? nextPage : undefined;
    },
  });
}
