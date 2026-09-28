export interface BulkResult {
  successCount: number;
  failCount: number;
}

/**
 * Runs one request per ticket, sequentially, and counts outcomes — the way
 * caseflow-fe's TicketListPage bulk handlers do (there is no bulk endpoint).
 */
export async function runForEach(ids: string[], action: (id: string) => Promise<unknown>): Promise<BulkResult> {
  let successCount = 0;
  let failCount = 0;
  for (const id of ids) {
    try {
      await action(id);
      successCount += 1;
    } catch {
      failCount += 1;
    }
  }
  return { successCount, failCount };
}

export const plural = (count: number) => `ticket${count !== 1 ? 's' : ''}`;

export interface BulkCopy {
  /** e.g. (3) => "3 tickets assigned." */
  success: (count: number) => string;
  /** Verb in "2 assigned, 1 failed. …" */
  partial: string;
}

// Toast copy matches caseflow-fe's TicketListPage.
export function bulkMessage(result: BulkResult, copy: BulkCopy) {
  if (result.failCount === 0) return { ok: true, text: copy.success(result.successCount) };
  return { ok: false, text: `${result.successCount} ${copy.partial}, ${result.failCount} failed. Check individual tickets.` };
}

export const BULK_COPY = {
  assign: { success: (n: number) => `${n} ${plural(n)} assigned.`, partial: 'assigned' },
  status: (label: string): BulkCopy => ({ success: (n) => `${n} ${plural(n)} updated to ${label}.`, partial: 'updated' }),
  tag: { success: (n: number) => `Tag applied to ${n} ${plural(n)}.`, partial: 'tagged' },
};
