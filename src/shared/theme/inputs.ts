import type { TextStyle } from 'react-native';
import { fonts } from './fonts';
import { radii } from './radii';

// caseflow-fe's `.ui-input` / `.ui-select` / `.ui-textarea` (src/index.css).
export const inputSurface = {
  ...fonts.regular,
  backgroundColor: 'rgba(250, 252, 255, 0.9)',
  borderWidth: 1,
  borderColor: 'rgba(128, 148, 176, 0.24)',
  borderRadius: radii.sm,
  paddingHorizontal: 12,
  paddingVertical: 8,
  fontSize: 13,
  color: '#0F172A',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.74), 0 1px 1px rgba(11,19,36,0.03)',
} satisfies TextStyle;

// caseflow-fe form labels: `block text-xs font-medium text-gray-700 mb-1`.
export const formLabel = {
  ...fonts.medium,
  fontSize: 12,
  color: '#334155',
} satisfies TextStyle;

// `.surface-floating`: login card, sheets, dialogs.
export const floatingSurface = {
  backgroundColor: 'rgba(252, 253, 255, 0.98)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.8)',
  borderRadius: radii.lg,
  boxShadow: '0 34px 72px -40px rgba(11,19,36,0.46), 0 20px 34px -28px rgba(31,111,255,0.18)',
};
