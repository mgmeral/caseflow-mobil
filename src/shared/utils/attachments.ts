import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { environment } from '../../core/config/env';
import { useSessionStore } from '../../core/auth/sessionStore';

/** `downloadPath` is always server-origin-relative (e.g. "/api/attachments/1/download") — never relative to the configured API base path. */
export function resolveAttachmentUrl(downloadPath: string): string {
  const origin = environment.apiBaseUrl.replace(/\/api\/?$/, '');
  return `${origin}${downloadPath}`;
}

/** Downloads an attachment (auth header required — the endpoint is not publicly reachable) and opens the native share/open sheet. */
export async function downloadAndShareAttachment(downloadPath: string, fileName: string): Promise<void> {
  const token = useSessionStore.getState().accessToken;
  const url = resolveAttachmentUrl(downloadPath);
  const destination = `${FileSystem.cacheDirectory}${fileName}`;

  const result = await FileSystem.downloadAsync(url, destination, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (result.status !== 200) {
    throw new Error(`Attachment download failed (status ${result.status})`);
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(result.uri);
  }
}
