import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors, gradients } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { radii } from '../theme/radii';
import { shadows } from '../theme/shadows';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'md' | 'sm';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  style?: ViewStyle;
  testID?: string;
}

// Mirrors caseflow-fe's Button (src/components/shared/Button.tsx): gradient
// primary/danger, frosted blue secondary, borderless ghost.
const VARIANTS: Record<Variant, { gradient?: readonly [string, string, ...string[]]; border?: string; text: string; shadow?: ViewStyle }> = {
  primary: { gradient: gradients.primary, text: colors.onPrimary, shadow: shadows.card },
  secondary: { gradient: gradients.secondary, border: 'rgba(198, 216, 255, 0.85)', text: '#17407A', shadow: shadows.soft },
  danger: { gradient: gradients.danger, text: colors.onDanger, shadow: shadows.card },
  ghost: { text: '#526277' },
};

export function Button({ label, onPress, variant = 'primary', size = 'md', loading, disabled, icon, style, testID }: Props) {
  const palette = VARIANTS[variant];
  const isDisabled = Boolean(disabled || loading);

  const content = loading ? (
    <ActivityIndicator color={palette.text} />
  ) : (
    <>
      {icon}
      <Text style={[styles.label, { color: palette.text }, size === 'sm' && styles.labelSm]} numberOfLines={1}>
        {label}
      </Text>
    </>
  );

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        palette.shadow,
        palette.border ? { borderWidth: 1, borderColor: palette.border } : null,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {({ pressed }) => {
        const inner = [styles.inner, size === 'sm' ? styles.sm : styles.md];
        if (palette.gradient) {
          return (
            <LinearGradient colors={palette.gradient} style={inner}>
              {content}
            </LinearGradient>
          );
        }
        return <View style={[inner, pressed && !isDisabled && styles.ghostPressed]}>{content}</View>;
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  md: {
    minHeight: 44,
    paddingHorizontal: 16,
  },
  sm: {
    minHeight: 34,
    paddingHorizontal: 12,
  },
  label: {
    ...fonts.semibold,
    fontSize: 14,
    letterSpacing: -0.2,
  },
  labelSm: {
    fontSize: 13,
  },
  pressed: {
    opacity: 0.88,
  },
  ghostPressed: {
    backgroundColor: '#EDF4FF',
  },
  disabled: {
    opacity: 0.5,
  },
});
