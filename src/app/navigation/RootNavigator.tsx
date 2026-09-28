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
import { CustomerDetailScreen } from '../../customers/screens/CustomerDetailScreen';
import { NotificationsScreen } from '../../notifications/screens/NotificationsScreen';
import { ProfileScreen } from '../../settings/screens/ProfileScreen';
import { ReportsScreen } from '../../reports/screens/ReportsScreen';
import { TemplatesScreen } from '../../templates/screens/TemplatesScreen';
import { TemplateFormScreen } from '../../templates/screens/TemplateFormScreen';
import { ChannelsScreen } from '../../channels/screens/ChannelsScreen';
import { ChannelFormScreen } from '../../channels/screens/ChannelFormScreen';
import { useSessionStore } from '../../core/auth/sessionStore';
import { hasPermission } from '../../shared/utils/permissions';
import { colors } from '../../shared/theme/colors';

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const CasesStack = createNativeStackNavigator();
const CustomersStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

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

function CustomersNavigator() {
  return (
    <CustomersStack.Navigator screenOptions={stackHeaderOptions}>
      <CustomersStack.Screen name="Customers" component={CustomersScreen} options={{ title: 'Customers' }} />
      <CustomersStack.Screen name="CustomerDetail" component={CustomerDetailScreen} options={{ title: 'Customer' }} />
    </CustomersStack.Navigator>
  );
}

// Back-office screens hang off Profile. They are registered only for users with
// the permission, so a deep link cannot open a screen the user may not use.
function ProfileNavigator() {
  const permissions = useSessionStore((state) => state.user?.permissionCodes ?? []);
  const canViewReports = hasPermission(permissions, 'REPORT_VIEW');
  const canViewTemplates = hasPermission(permissions, 'EMAIL_CONFIG_VIEW') || hasPermission(permissions, 'EMAIL_CONFIG_MANAGE');
  const canManageChannels = hasPermission(permissions, 'INTEGRATION_CONFIG_MANAGE');

  return (
    <ProfileStack.Navigator screenOptions={stackHeaderOptions}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      {canViewReports ? <ProfileStack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports' }} /> : null}
      {canViewTemplates ? (
        <>
          <ProfileStack.Screen name="Templates" component={TemplatesScreen} options={{ title: 'Mail Templates' }} />
          <ProfileStack.Screen name="TemplateForm" component={TemplateFormScreen} options={{ title: 'Template' }} />
        </>
      ) : null}
      {canManageChannels ? (
        <>
          <ProfileStack.Screen name="Channels" component={ChannelsScreen} options={{ title: 'Notification Channels' }} />
          <ProfileStack.Screen name="ChannelForm" component={ChannelFormScreen} options={{ title: 'Channel' }} />
        </>
      ) : null}
    </ProfileStack.Navigator>
  );
}

const TAB_ICONS: Record<string, LucideIcon> = {
  Home: Home,
  CasesStack: Ticket,
  Inbox: InboxIcon,
  CustomersStack: Users,
  Notifications: Bell,
  ProfileStack: User,
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
      <Tab.Screen name="CustomersStack" component={CustomersNavigator} options={{ title: 'Customers' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="ProfileStack" component={ProfileNavigator} options={{ title: 'Profile' }} />
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
