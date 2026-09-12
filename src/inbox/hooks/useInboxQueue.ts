import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getInboxQueue, getInboxStats } from '../api/inboxApi';

export function useInboxQueue() {
  const listQuery = useInfiniteQuery({
    queryKey: ['inbox-queue'],
    queryFn: ({ pageParam = 0 }) => getInboxQueue(pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1;
      return nextPage < lastPage.totalPages ? nextPage : undefined;
    },
  });

  const statsQuery = useQuery({
    queryKey: ['inbox-stats'],
    queryFn: getInboxStats,
    staleTime: 30_000,
  });

  return { listQuery, statsQuery };
}
