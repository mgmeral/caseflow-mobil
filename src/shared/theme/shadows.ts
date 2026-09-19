import { Platform } from 'react-native';
import { colors } from './colors';

// Android has no shadow* props — `elevation` is the closest analog, so each
// level pairs an iOS shadow with a roughly-matching Android elevation.
export const shadows = {
  soft: Platform.select({
    ios: {
      shadowColor: colors.shadowColor,
      shadowOpacity: 0.06,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
    },
    android: { elevation: 1 },
    default: {},
  }),
  card: Platform.select({
    ios: {
      shadowColor: colors.shadowColor,
      shadowOpacity: 0.08,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
    },
    android: { elevation: 3 },
    default: {},
  }),
  elevated: Platform.select({
    ios: {
      shadowColor: colors.shadowColor,
      shadowOpacity: 0.16,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
    },
    android: { elevation: 8 },
    default: {},
  }),
};
