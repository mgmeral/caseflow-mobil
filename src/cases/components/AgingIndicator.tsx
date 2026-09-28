import { StyleSheet, Text, View } from 'react-native';
import { fonts } from '../../shared/theme/fonts';
import { agingTone, formatDuration, type AgingTone } from '../utils/ticketListFilters';

interface Props {
  openDurationMinutes: number;
  slaBreached: boolean;
  slaDeadlineAt?: string | null;
}

// caseflow-fe AgingIndicator colours: green < 4h, yellow < 8h, orange < 24h, red after.
const TONE_COLOR: Record<AgingTone, string> = {
  fresh: '#16A34A',
  aging: '#CA8A04',
  old: '#EA580C',
  stale: '#DC2626',
};

export function AgingIndicator({ openDurationMinutes, slaBreached, slaDeadlineAt }: Props) {
  const tone = agingTone(openDurationMinutes, slaBreached);
  const minutesRemaining = slaDeadlineAt && !slaBreached
    ? Math.round((new Date(slaDeadlineAt).getTime() - Date.now()) / 60000)
    : null;
  const isAtRisk = minutesRemaining !== null && minutesRemaining > 0 && minutesRemaining < 120;

  return (
    <View style={styles.row}>
      <Text style={[styles.duration, { color: TONE_COLOR[tone] }, tone === 'stale' && styles.bold]}>
        {formatDuration(openDurationMinutes)}
      </Text>
      {slaBreached ? (
        <View style={[styles.flag, styles.flagBreached]}>
          <Text style={[styles.flagText, { color: '#DC2626' }]}>SLA</Text>
        </View>
      ) : isAtRisk ? (
        <View style={[styles.flag, styles.flagRisk]}>
          <Text style={[styles.flagText, { color: '#B45309' }]}>AT RISK</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  duration: {
    ...fonts.medium,
    fontSize: 12,
  },
  bold: {
    ...fonts.semibold,
  },
  flag: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
  },
  flagBreached: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  flagRisk: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  flagText: {
    ...fonts.bold,
    fontSize: 10,
  },
});
