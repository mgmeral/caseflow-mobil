import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';

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

const VARIANT_STYLES: Record<Variant, { bg: string; pressedBg: string; border?: string; text: string }> = {
  primary: { bg: colors.primary, pressedBg: colors.primaryDark, text: colors.onPrimary },
  secondary: { bg: colors.surface, pressedBg: colors.surfaceMuted, border: colors.borderStrong, text: colors.text },
  danger: { bg: colors.danger, pressedBg: colors.dangerDark, text: colors.onDanger },
  ghost: { bg: 'transparent', pressedBg: colors.primaryMuted, text: colors.primary },
};

export function Button({ label, onPress, variant = 'primary', size = 'md', loading, disabled, icon, style, testID }: Props) {
  const palette = VARIANT_STYLES[variant];
  const isDisabled = Boolean(disabled || loading);

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        {
          backgroundColor: pressed && !isDisabled ? palette.pressedBg : palette.bg,
          borderColor: palette.border,
          borderWidth: palette.border ? 1 : 0,
        },
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} />
      ) : (
        <>
          {icon}
          <Text style={[styles.label, { color: palette.text }, size === 'sm' && styles.labelSm]} numberOfLines={1}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  md: {
    minHeight: 48,
    paddingHorizontal: 18,
  },
  sm: {
    minHeight: 38,
    paddingHorizontal: 14,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  labelSm: {
    fontSize: 13,
  },
  disabled: {
    opacity: 0.5,
  },
});
