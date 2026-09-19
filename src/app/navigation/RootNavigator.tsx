import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Bell, Home, Inbox as InboxIcon, Ticket, User, Users } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { LoginScreen } from '../../auth/screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { CasesScreen } from '../../cases/screens/CasesScreen';
import { CaseDetailScreen } from '../../cases/screens/CaseDetailScreen';
import { InboxScreen } from '../../inbox/screens/InboxScreen';
import { CustomersScreen } from '../../customers/screens/CustomersScreen';
import { NotificationsScreen } from '../../notifications/screens/NotificationsScreen';
import { ProfileScreen } from '../../settings/screens/ProfileScreen';
import { useSessionStore } from '../../core/auth/sessionStore';
import { hasPermission } from '../../shared/utils/permissions';
import { colors } from '../../shared/theme/colors';

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const CasesStack = createNativeStackNavigator();

const stackHeaderOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '700' as const },
  headerShadowVisible: false,
};

function CasesNavigator() {
  return (
    <CasesStack.Navigator screenOptions={stackHeaderOptions}>
      <CasesStack.Screen name="Cases" component={CasesScreen} options={{ title: 'Cases' }} />
      <CasesStack.Screen name="CaseDetail" component={CaseDetailScreen} options={{ title: 'Case Detail' }} />
    </CasesStack.Navigator>
  );
}

const TAB_ICONS: Record<string, LucideIcon> = {
  Home: Home,
  CasesStack: Ticket,
  Inbox: InboxIcon,
  Customers: Users,
  Notifications: Bell,
  Profile: User,
};

function AppTabs() {
  const permissions = useSessionStore((state) => state.user?.permissionCodes ?? []);
  const canViewInbox = hasPermission(permissions, 'ADMIN_POOL_VIEW');

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedLight,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' as const },
        tabBarIcon: ({ color, size }: { color: string; size: number }) => {
          const Icon = TAB_ICONS[route.name] ?? Home;
          return <Icon color={color} size={size - 2} strokeWidth={2.25} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="CasesStack" component={CasesNavigator} options={{ title: 'Cases' }} />
      {canViewInbox ? <Tab.Screen name="Inbox" component={InboxScreen} /> : null}
      <Tab.Screen name="Customers" component={CustomersScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const status = useSessionStore((state) => state.status);

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {status === 'authenticated' ? (
        <RootStack.Screen name="AppTabs" component={AppTabs} />
      ) : (
        <RootStack.Screen name="Login" component={LoginScreen} />
      )}
    </RootStack.Navigator>
  );
}
