import type { ViewStyle } from 'react-native';

// caseflow-fe's blue-tinted shadow scale (tailwind.config.js boxShadow), via the
// cross-platform `boxShadow` style prop (React Native new architecture).
export const shadows = {
  soft: { boxShadow: '0 10px 24px -18px rgba(15,23,42,0.24), 0 8px 16px -16px rgba(37,99,235,0.18)' },
  card: { boxShadow: '0 18px 36px -26px rgba(15,23,42,0.26), 0 10px 22px -18px rgba(37,99,235,0.16)' },
  elevated: { boxShadow: '0 28px 72px -34px rgba(15,23,42,0.42), 0 22px 48px -34px rgba(37,99,235,0.24)' },
} satisfies Record<string, ViewStyle>;
