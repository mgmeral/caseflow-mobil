import { useQuery } from '@tanstack/react-query';
import { getContactsByCustomer, getCustomerById } from '../api/customersApi';

export function useCustomerDetail(customerId: string) {
  return useQuery({
    queryKey: ['customer-detail', customerId],
    queryFn: () => getCustomerById(customerId),
    enabled: Boolean(customerId),
  });
}

export function useCustomerContacts(customerId: string) {
  return useQuery({
    queryKey: ['customer-contacts', customerId],
    queryFn: () => getContactsByCustomer(customerId),
    enabled: Boolean(customerId),
  });
}
