import { useInfiniteQuery } from '@tanstack/react-query';
import { getCustomers } from '../api/customersApi';

export function useCustomers() {
  return useInfiniteQuery({
    queryKey: ['customers'],
    queryFn: ({ pageParam = 0 }) => getCustomers(pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1;
      return nextPage < lastPage.totalPages ? nextPage : undefined;
    },
  });
}
