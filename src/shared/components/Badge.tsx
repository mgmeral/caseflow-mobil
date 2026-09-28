import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { fonts } from '../theme/fonts';
import { badgeVariantStyles, type BadgeVariant } from '../theme/status';

interface Props {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function Badge({ label, variant = 'default', size = 'sm', style }: Props) {
  const palette = badgeVariantStyles[variant];
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          paddingHorizontal: isSmall ? 10 : 12,
          paddingVertical: isSmall ? 4 : 6,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: palette.text, fontSize: isSmall ? 11 : 14 }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  // caseflow-fe Badge: rounded-full, font-semibold, tracking 0.01em.
  text: {
    ...fonts.semibold,
    letterSpacing: 0.1,
  },
});
