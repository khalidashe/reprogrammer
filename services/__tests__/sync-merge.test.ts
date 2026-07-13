/**
 * Self-test for the last-write-wins sync merge. Run with:
 *   npx tsx services/__tests__/sync-merge.test.ts
 *
 * Verifies:
 *  - Disjoint ids union; overlapping ids resolve by newest updatedAt
 *  - Tombstones (deletedAt) win exact ties so deletions converge
 *  - A newer live edit resurrects over an older tombstone (true LWW)
 *  - A newer tombstone deletes over an older live edit
 *  - Deleted records land in `tombstones`, live ones in `merged`
 */
import { mergeById, type Mergeable } from '../sync-merge';

let failures = 0;
function expect(cond: boolean, msg: string) {
  if (!cond) {
    failures++;
    console.error('FAIL:', msg);
  }
}

const rec = (id: string, updatedAt: number, deletedAt?: number): Mergeable => ({
  id,
  updatedAt,
  ...(deletedAt !== undefined ? { deletedAt } : {}),
});

const ids = (rows: Mergeable[]) => rows.map((r) => r.id).sort().join(',');
const find = (rows: Mergeable[], id: string) => rows.find((r) => r.id === id);

// Disjoint ids → union of both, all live.
{
  const { merged, tombstones } = mergeById([rec('a', 1)], [rec('b', 1)]);
  expect(ids(merged) === 'a,b', 'disjoint ids union into merged');
  expect(tombstones.length === 0, 'disjoint: no tombstones');
}

// Same id: remote newer wins; local newer wins.
{
  const remoteNewer = mergeById([rec('a', 1)], [rec('a', 2)]);
  expect(remoteNewer.merged.length === 1, 'overlap collapses to one record');
  expect(find(remoteNewer.merged, 'a')!.updatedAt === 2, 'remote newer wins');

  const localNewer = mergeById([rec('a', 5)], [rec('a', 2)]);
  expect(find(localNewer.merged, 'a')!.updatedAt === 5, 'local newer wins');
}

// Exact tie: a tombstone wins regardless of side.
{
  const remoteDeleted = mergeById([rec('a', 3)], [rec('a', 3, 3)]);
  expect(remoteDeleted.merged.length === 0, 'tie + remote tombstone → not live');
  expect(ids(remoteDeleted.tombstones) === 'a', 'tie: remote tombstone wins');

  const localDeleted = mergeById([rec('a', 3, 3)], [rec('a', 3)]);
  expect(ids(localDeleted.tombstones) === 'a', 'tie: local tombstone wins');
}

// Newer live edit beats older tombstone (resurrection); newer tombstone deletes.
{
  const resurrect = mergeById([rec('a', 10)], [rec('a', 5, 5)]);
  expect(ids(resurrect.merged) === 'a', 'newer live edit beats older tombstone');
  expect(resurrect.tombstones.length === 0, 'resurrection: no tombstone');

  const deleteWins = mergeById([rec('a', 5)], [rec('a', 10, 10)]);
  expect(deleteWins.merged.length === 0, 'newer tombstone removes older live edit');
  expect(ids(deleteWins.tombstones) === 'a', 'newer tombstone recorded');
}

// Empty inputs.
{
  const empty = mergeById<Mergeable>([], []);
  expect(empty.merged.length === 0 && empty.tombstones.length === 0, 'empty inputs → empty result');
  const onlyRemote = mergeById<Mergeable>([], [rec('a', 1)]);
  expect(ids(onlyRemote.merged) === 'a', 'remote-only flows through');
}

// --- summary ---
if (failures > 0) {
  console.error(`\n${failures} test(s) failed.`);
  process.exit(1);
}
console.log('OK — sync-merge tests passed.');
