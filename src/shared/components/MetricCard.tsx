import { LinearGradient } from 'expo-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, gradients } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { radii } from '../theme/radii';
import { shadows } from '../theme/shadows';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Tone = 'default' | 'success' | 'warning' | 'error' | 'neutral';

interface Props {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  tone?: Tone;
  active?: boolean;
  onPress?: () => void;
}

// caseflow-fe's StatCard color map (indigo / green / amber / red / gray).
const TONES: Record<Tone, { bg: string; icon: string; ring: string }> = {
  default: { bg: '#EEF2FF', icon: '#4F46E5', ring: '#818CF8' },
  success: { bg: '#F0FDF4', icon: '#16A34A', ring: '#4ADE80' },
  warning: { bg: '#FFFBEB', icon: '#D97706', ring: '#FBBF24' },
  error: { bg: '#FEF2F2', icon: '#DC2626', ring: '#F87171' },
  neutral: { bg: '#EEF4F8', icon: '#526277', ring: '#94A3B8' },
};

// caseflow-fe's StatCard on a `.premium-stat-card` surface: icon tile, kicker, value.
export function MetricCard({ label, value, icon: Icon, tone = 'default', active, onPress }: Props) {
  const palette = TONES[tone];
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.wrapper, active && { borderColor: palette.ring, borderWidth: 2 }, pressed && styles.pressed]}
    >
      <LinearGradient colors={gradients.statCard} locations={[0, 0.34, 1]} start={{ x: 0, y: 0 }} end={{ x: 0.6, y: 1 }} style={styles.card}>
        {Icon ? (
          <View style={[styles.iconWrap, { backgroundColor: palette.bg }]}>
            <Icon size={16} color={palette.icon} strokeWidth={2} />
          </View>
        ) : null}
        <View style={styles.text}>
          <Text style={styles.kicker} numberOfLines={1}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    minWidth: '47%',
    flex: 1,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(133, 160, 201, 0.2)',
    overflow: 'hidden',
    ...shadows.card,
  },
  pressed: {
    opacity: 0.9,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: 14,
    paddingVertical: spacing.md,
  },
  iconWrap: {
    padding: 8,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    ...shadows.soft,
  },
  text: {
    flex: 1,
    minWidth: 0,
  },
  kicker: {
    ...typography.label,
  },
  value: {
    ...fonts.semibold,
    color: '#0D1C31',
    fontSize: 20.5,
    letterSpacing: -0.8,
    marginTop: 2,
  },
});
