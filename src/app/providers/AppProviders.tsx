import { PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { queryClient } from '../../core/api/queryClient';
import { navigationLinking } from '../navigation/linking';
import { colors } from '../../shared/theme/colors';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    primary: colors.primary,
    border: colors.border,
    notification: colors.danger,
  },
};

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer linking={navigationLinking} theme={navigationTheme}>
          {children}
        </NavigationContainer>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
