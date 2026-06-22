/**
 * Pure last-write-wins merge for cross-device sync (REP-30).
 *
 * Today the sync bootstrap does a *blind pull-replace*: a foreground pull
 * overwrites the local store with whatever the server returns, which can clob-
 * ber local edits made offline before they pushed. This resolves a local and a
 * remote list of the same record type by stable `id`, keeping the newest
 * `updatedAt` per id so neither side silently loses an edit.
 *
 * Soft-deletes are tombstones (`deletedAt` set). A tombstone wins ties, so a
 * deletion converges across devices; but a *newer* live edit beats an older
 * tombstone (intentional resurrection — last write genuinely wins).
 *
 * Kept dependency-free and pure so it unit-tests with plain tsx, and so the
 * orchestrator can adopt it without importing store/Convex types. Wiring it
 * into useCloudSyncBootstrap (and adding `updatedAt` to the local Behavior /
 * CheckIn / AppProfile models) is the Phase 2 step that's integration-tested
 * against the backend — see REP-30.
 */

export interface Mergeable {
  id: string;
  updatedAt: number;
  /** Soft-delete tombstone. Undefined for a live record. */
  deletedAt?: number;
}

export interface MergeResult<T extends Mergeable> {
  /** Live, newest-wins records (deletedAt undefined). The store keeps these. */
  merged: T[];
  /** Records that resolved as deleted — useful for delete propagation. */
  tombstones: T[];
}

/**
 * Pick the winner for a single id. Newest `updatedAt` wins; on an exact tie a
 * tombstone beats a live record, and otherwise the remote copy is canonical.
 */
function pickWinner<T extends Mergeable>(local: T, remote: T): T {
  if (local.updatedAt > remote.updatedAt) return local;
  if (remote.updatedAt > local.updatedAt) return remote;
  // Equal timestamps: a deletion wins so tombstones converge; if both agree on
  // live/deleted, treat the server copy as canonical.
  const localDeleted = local.deletedAt !== undefined;
  const remoteDeleted = remote.deletedAt !== undefined;
  if (localDeleted && !remoteDeleted) return local;
  if (remoteDeleted && !localDeleted) return remote;
  return remote;
}

export function mergeById<T extends Mergeable>(local: T[], remote: T[]): MergeResult<T> {
  const byId = new Map<string, T>();

  for (const rec of local) byId.set(rec.id, rec);
  for (const rec of remote) {
    const existing = byId.get(rec.id);
    byId.set(rec.id, existing ? pickWinner(existing, rec) : rec);
  }

  const merged: T[] = [];
  const tombstones: T[] = [];
  for (const rec of byId.values()) {
    if (rec.deletedAt !== undefined) tombstones.push(rec);
    else merged.push(rec);
  }
  return { merged, tombstones };
}
