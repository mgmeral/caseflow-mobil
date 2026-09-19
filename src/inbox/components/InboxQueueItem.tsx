import { useNavigation } from '@react-navigation/native';
import { UserCheck } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../shared/components/Button';
import { PriorityBadge } from '../../shared/components/PriorityBadge';
import { colors } from '../../shared/theme/colors';
import { radii } from '../../shared/theme/radii';
import { shadows } from '../../shared/theme/shadows';
import { spacing } from '../../shared/theme/spacing';
import { typography } from '../../shared/theme/typography';
import { useAssignCase } from '../../workflow/hooks/useTicketWorkflow';
import type { TicketSummaryResponse } from '../../types/api';

interface Props {
  item: TicketSummaryResponse;
  currentUserId?: number;
  canClaim: boolean;
}

export function InboxQueueItem({ item, currentUserId, canClaim }: Props) {
  const navigation = useNavigation<any>();
  const assignCase = useAssignCase(String(item.id));

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => navigation.navigate('CasesStack', { screen: 'CaseDetail', params: { caseId: String(item.id) } })}
    >
      <View style={styles.cardText}>
        <Text style={styles.title} numberOfLines={1}>
          {item.ticketNo}
        </Text>
        <Text style={styles.subject} numberOfLines={2}>
          {item.subject}
        </Text>
        <Text style={styles.meta}>{item.customerName}</Text>
        <View style={styles.badgeRow}>
          <PriorityBadge priority={item.priority} />
        </View>
      </View>
      {canClaim ? (
        <Button
          label="Claim"
          variant="secondary"
          size="sm"
          icon={<UserCheck size={14} color={colors.text} />}
          loading={assignCase.isPending}
          onPress={() => currentUserId && assignCase.mutate(currentUserId)}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.soft,
  },
  cardPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.bodyStrong,
    fontSize: 15,
  },
  subject: {
    ...typography.body,
  },
  meta: {
    ...typography.caption,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
});
