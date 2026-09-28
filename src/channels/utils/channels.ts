import type { ChannelConfigResponse } from '../../types/api';

/** `subscribedEvents` arrives as a JSON-encoded string; mirrors caseflow-fe's try/catch-to-[] parsing. */
export function parseSubscribedEvents(value: ChannelConfigResponse['subscribedEvents'] | string[]): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string');
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export function formatEventName(event: string) {
  return event
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
