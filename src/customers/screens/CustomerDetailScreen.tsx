import { useNavigation, useRoute } from '@react-navigation/native';
import { Briefcase, ChevronRight, Mail, User as UserIcon } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useCases } from '../../cases/hooks/useCases';
import { useCustomerContacts, useCustomerDetail } from '../hooks/useCustomerDetail';
import { Avatar } from '../../shared/components/Avatar';
import { Badge } from '../../shared/components/Badge';
import { CenteredState } from '../../shared/components/CenteredState';
import { PriorityBadge } from '../../shared/components/PriorityBadge';
import { Screen } from '../../shared/components/Screen';
import { SectionCard } from '../../shared/components/SectionCard';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { colors } from '../../shared/theme/colors';
import { spacing } from '../../shared/theme/spacing';
import { typography } from '../../shared/theme/typography';

export function CustomerDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const customerId = String(route.params?.customerId ?? '');

  const detailQuery = useCustomerDetail(customerId);
  const contactsQuery = useCustomerContacts(customerId);
  const ticketsQuery = useCases({ customerId: Number(customerId) });
  const tickets = useMemo(() => ticketsQuery.data?.pages[0]?.items ?? [], [ticketsQuery.data?.pages]);

  if (detailQuery.isLoading) {
    return <CenteredState title="Loading customer" />;
  }

  if (detailQuery.isError || !detailQuery.data) {
    return <CenteredState title="Could not load customer" actionLabel="Retry" onAction={() => detailQuery.refetch()} />;
  }

  const customer = detailQuery.data;
  const contacts = contactsQuery.data ?? [];

  return (
    <Screen scrollable>
      <View style={styles.headerRow}>
        <Avatar name={customer.name} size={52} />
        <View style={styles.headerText}>
          <Text style={styles.title}>{customer.name}</Text>
          <Text style={styles.meta}>{customer.code}</Text>
        </View>
        <Badge label={customer.isActive ? 'Active' : 'Inactive'} variant={customer.isActive ? 'success' : 'default'} />
      </View>

      <SectionCard title="Contacts" icon={UserIcon}>
        {contactsQuery.isLoading ? (
          <Text style={styles.body}>Loading…</Text>
        ) : contacts.length === 0 ? (
          <Text style={styles.body}>No contacts on file.</Text>
        ) : (
          contacts.map((contact, index) => (
            <View key={contact.id} style={[styles.contactRow, index === 0 && styles.rowFirst]}>
              <Mail size={14} color={colors.muted} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name || contact.email}</Text>
                <Text style={styles.contactEmail}>{contact.email}</Text>
              </View>
              {contact.isPrimary ? <Badge label="Primary" variant="info" /> : null}
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard title="Recent Tickets" icon={Briefcase}>
        {ticketsQuery.isLoading ? (
          <Text style={styles.body}>Loading…</Text>
        ) : tickets.length === 0 ? (
          <Text style={styles.body}>No tickets for this customer yet.</Text>
        ) : (
          tickets.map((ticket, index) => (
            <Pressable
              key={ticket.id}
              style={[styles.ticketRow, index === 0 && styles.rowFirst]}
              onPress={() => navigation.navigate('CasesStack', { screen: 'CaseDetail', params: { caseId: String(ticket.id) } })}
            >
              <View style={styles.ticketInfo}>
                <Text style={styles.contactName} numberOfLines={1}>
                  {ticket.ticketNo} · {ticket.subject}
                </Text>
                <View style={styles.badgeRow}>
                  <PriorityBadge priority={ticket.priority} />
                  <StatusBadge status={ticket.status} />
                </View>
              </View>
              <ChevronRight size={16} color={colors.mutedLight} />
            </Pressable>
          ))
        )}
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.display,
    fontSize: 22,
  },
  meta: {
    ...typography.caption,
  },
  body: {
    ...typography.body,
    color: colors.muted,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  rowFirst: {
    borderTopWidth: 0,
    paddingTop: 0,
    marginTop: 0,
  },
  contactInfo: {
    flex: 1,
    gap: 1,
  },
  contactName: {
    ...typography.bodyStrong,
    fontSize: 14,
  },
  contactEmail: {
    ...typography.caption,
  },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  ticketInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
});
