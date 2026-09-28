import { useNavigation } from '@react-navigation/native';
import { BellRing, ChevronRight, Plus } from 'lucide-react-native';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useChannels } from '../hooks/useChannels';
import { parseSubscribedEvents } from '../utils/channels';
import { Badge } from '../../shared/components/Badge';
import { Button } from '../../shared/components/Button';
import { CenteredState } from '../../shared/components/CenteredState';
import { EmptyState } from '../../shared/components/EmptyState';
import { ListSkeleton } from '../../shared/components/ListSkeleton';
import { Screen } from '../../shared/components/Screen';
import { colors } from '../../shared/theme/colors';
import { radii } from '../../shared/theme/radii';
import { shadows } from '../../shared/theme/shadows';
import { spacing } from '../../shared/theme/spacing';
import { typography } from '../../shared/theme/typography';

const SCOPE_LABELS: Record<string, string> = {
  GLOBAL: 'All tickets',
  GROUP: 'One group',
  CUSTOMER: 'One customer',
};

export function ChannelsScreen() {
  const navigation = useNavigation<any>();
  const channelsQuery = useChannels();
  const channels = channelsQuery.data ?? [];

  if (channelsQuery.isError) {
    return <CenteredState title="Could not load notification channels" actionLabel="Retry" onAction={() => channelsQuery.refetch()} />;
  }

  return (
    <Screen
      scrollable
      refreshControl={<RefreshControl refreshing={channelsQuery.isRefetching} onRefresh={() => channelsQuery.refetch()} />}
    >
      <Text style={styles.intro}>Post ticket events to a Slack or Microsoft Teams channel through an incoming webhook.</Text>

      <Button
        label="Add channel"
        icon={<Plus size={16} color={colors.onPrimary} />}
        onPress={() => navigation.navigate('ChannelForm', {})}
      />

      {channelsQuery.isLoading ? (
        <ListSkeleton rows={3} />
      ) : channels.length === 0 ? (
        <EmptyState icon={BellRing} title="No channels yet" description="Add a Slack or Teams webhook to start posting ticket events." />
      ) : (
        channels.map((channel) => {
          const eventCount = parseSubscribedEvents(channel.subscribedEvents).length;
          return (
            <Pressable
              key={channel.id}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => navigation.navigate('ChannelForm', { channelId: channel.id })}
            >
              <View style={styles.cardText}>
                <View style={styles.titleRow}>
                  <Text style={styles.name} numberOfLines={1}>{channel.name}</Text>
                  <Badge label={channel.channelType === 'TEAMS' ? 'Teams' : 'Slack'} variant="info" />
                </View>
                <Text style={styles.meta}>
                  {SCOPE_LABELS[channel.scopeType ?? 'GLOBAL'] ?? channel.scopeType} · {eventCount} {eventCount === 1 ? 'event' : 'events'}
                </Text>
              </View>
              <Badge label={channel.enabled ? 'On' : 'Off'} variant={channel.enabled ? 'success' : 'default'} />
              <ChevronRight size={18} color={colors.mutedLight} />
            </Pressable>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    ...typography.body,
    color: colors.muted,
  },
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
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    ...typography.bodyStrong,
    flexShrink: 1,
  },
  meta: {
    ...typography.caption,
  },
});
