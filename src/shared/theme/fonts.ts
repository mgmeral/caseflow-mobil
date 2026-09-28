import type { TextStyle } from 'react-native';

// caseflow-fe renders everything in Inter. React Native picks a custom font's
// weight by family name, not fontWeight, so each weight is its own family.
// The font files themselves are loaded once in src/app/fontAssets.ts.
export const fonts = {
  regular: { fontFamily: 'Inter_400Regular' },
  medium: { fontFamily: 'Inter_500Medium' },
  semibold: { fontFamily: 'Inter_600SemiBold' },
  bold: { fontFamily: 'Inter_700Bold' },
} satisfies Record<string, TextStyle>;
