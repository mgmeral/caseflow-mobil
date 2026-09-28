import { AlertCircle, AlertTriangle, CheckCircle, Info, X, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';
import { fonts } from '../theme/fonts';
import { shadows } from '../theme/shadows';
import { spacing } from '../theme/spacing';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastState {
  toasts: ToastItem[];
  show: (type: ToastType, message: string, duration?: number) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

// Same behaviour as caseflow-fe's ui.store toasts: stacked, auto-dismissed after 4 s.
const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  show: (type, message, duration = 4000) => {
    const id = nextId++;
    set({ toasts: [...get().toasts, { id, type, message }] });
    if (duration > 0) setTimeout(() => get().dismiss(id), duration);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((toast) => toast.id !== id) }),
}));

export function useToast() {
  const show = useToastStore((state) => state.show);
  return {
    success: (message: string) => show('success', message),
    error: (message: string) => show('error', message),
    warning: (message: string) => show('warning', message),
    info: (message: string) => show('info', message),
  };
}

// caseflow-fe Toast TYPE_CONFIG (tailwind green/red/amber/blue 50 / 200 / 500 / 800).
const TYPE_CONFIG: Record<ToastType, { icon: LucideIcon; bg: string; border: string; iconColor: string; text: string }> = {
  success: { icon: CheckCircle, bg: '#F0FDF4', border: '#BBF7D0', iconColor: '#22C55E', text: '#166534' },
  error: { icon: AlertCircle, bg: '#FEF2F2', border: '#FECACA', iconColor: '#EF4444', text: '#991B1B' },
  warning: { icon: AlertTriangle, bg: '#FFFBEB', border: '#FDE68A', iconColor: '#F59E0B', text: '#92400E' },
  info: { icon: Info, bg: '#EFF6FF', border: '#BFDBFE', iconColor: '#3B82F6', text: '#1E40AF' },
};

/** Mount once at the app root. */
export function ToastHost() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View pointerEvents="box-none" style={[styles.host, { top: insets.top + spacing.sm }]}>
      {toasts.map((toast) => {
        const config = TYPE_CONFIG[toast.type];
        const Icon = config.icon;
        return (
          <View key={toast.id} accessibilityRole="alert" style={[styles.toast, { backgroundColor: config.bg, borderColor: config.border }]}>
            <Icon size={18} color={config.iconColor} />
            <Text style={[styles.message, { color: config.text }]}>{toast.message}</Text>
            <Pressable onPress={() => dismiss(toast.id)} hitSlop={8} accessibilityLabel="Dismiss">
              <X size={16} color={config.text} />
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    gap: spacing.md,
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    ...shadows.elevated,
  },
  message: {
    ...fonts.medium,
    flex: 1,
    fontSize: 14,
  },
});
