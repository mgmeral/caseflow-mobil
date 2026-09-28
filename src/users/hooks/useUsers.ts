import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../api/usersApi';

export function useUsers(enabled = true) {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled,
    staleTime: 120_000,
  });
}
