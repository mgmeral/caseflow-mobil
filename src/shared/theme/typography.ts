import type { TextStyle } from 'react-native';
import { colors } from './colors';
import { fonts } from './fonts';

// Sizes and tracking follow caseflow-fe's page-title / page-subtitle /
// premium-stat-kicker / section heading classes (src/index.css).
export const typography = {
  display: {
    ...fonts.semibold,
    fontSize: 24,
    color: colors.text,
    letterSpacing: -1,
  },
  title: {
    ...fonts.semibold,
    fontSize: 18,
    color: colors.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    ...fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colors.muted,
  },
  body: {
    ...fonts.regular,
    fontSize: 14,
    color: colors.textBody,
    lineHeight: 20,
  },
  bodyStrong: {
    ...fonts.semibold,
    fontSize: 14,
    color: colors.text,
    letterSpacing: -0.2,
  },
  caption: {
    ...fonts.medium,
    fontSize: 12,
    color: colors.muted,
  },
  label: {
    ...fonts.semibold,
    fontSize: 10,
    color: 'rgba(74, 92, 116, 0.92)',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
} satisfies Record<string, TextStyle>;
