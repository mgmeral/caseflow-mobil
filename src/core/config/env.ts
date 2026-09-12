function readBoolean(value: string | undefined, fallback: boolean) {
  if (value == null) return fallback;
  return value === 'true';
}

export const environment = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api',
  features: {
    ai: readBoolean(process.env.EXPO_PUBLIC_ENABLE_AI, true),
    push: readBoolean(process.env.EXPO_PUBLIC_ENABLE_PUSH, false),
  },
};
