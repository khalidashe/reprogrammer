/**
 * Referential-integrity checks for the library catalog.
 * Run: npx tsx services/__tests__/library-content.test.ts
 *
 * Catches the easy content mistakes: a program pointing at a guide or source
 * program that doesn't exist, a bad category, a duplicate id, or a cross-book
 * program whose source isn't actually a book program.
 */
import {
  LIBRARY_GUIDES,
  LIBRARY_PROGRAMS,
  LIBRARY_CATEGORIES,
  programById,
  sourceBooksFor,
  isCrossBook,
} from '../library-content';

let failures = 0;
function expect(cond: boolean, msg: string) {
  if (!cond) {
    failures++;
    console.error('FAIL:', msg);
  }
}

const guideIds = new Set(LIBRARY_GUIDES.map((g) => g.id));
const categoryIds = new Set(LIBRARY_CATEGORIES.map((c) => c.id));
const programIds = LIBRARY_PROGRAMS.map((p) => p.id);

// Unique program ids
expect(new Set(programIds).size === programIds.length, 'program ids are unique');

for (const p of LIBRARY_PROGRAMS) {
  // Valid category
  expect(categoryIds.has(p.category), `${p.id}: category "${p.category}" is valid`);

  // Every included guide exists
  for (const gid of p.guideIds) {
    expect(guideIds.has(gid), `${p.id}: guide "${gid}" exists`);
  }

  // Cross-book programs: sources exist, aren't self, and are real book programs
  if (p.sourceProgramIds) {
    expect(!p.sourceProgramIds.includes(p.id), `${p.id}: does not list itself as a source`);
    for (const sid of p.sourceProgramIds) {
      const src = programById(sid);
      expect(src !== undefined, `${p.id}: source program "${sid}" exists`);
      expect(src?.book !== undefined, `${p.id}: source "${sid}" is a book program`);
    }
    expect(p.sourceProgramIds.length >= 2, `${p.id}: cross-book draws from >= 2 books`);
    expect(
      sourceBooksFor(p).length === p.sourceProgramIds.length,
      `${p.id}: every source resolves to a book`
    );
    expect(isCrossBook(p), `${p.id}: isCrossBook() is true`);
    expect(p.book === undefined, `${p.id}: cross-book has no single \`book\``);
  } else {
    expect(!isCrossBook(p), `${p.id}: non-cross-book has no sourceProgramIds`);
  }
}

const crossBookCount = LIBRARY_PROGRAMS.filter(isCrossBook).length;

if (failures === 0) {
  console.log(
    `OK — library content valid (${LIBRARY_PROGRAMS.length} programs, ${crossBookCount} cross-book, ${LIBRARY_GUIDES.length} guides).`
  );
  process.exit(0);
} else {
  console.error(`FAILED — ${failures} test(s).`);
  process.exit(1);
}
