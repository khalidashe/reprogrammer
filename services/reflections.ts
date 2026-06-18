/**
 * Reflections — REP-5 Phase 4, the last Capture primitive. A reflection is a
 * free-text entry the user writes at check-in, attached to a behavior whose
 * `captureSpec.type === 'reflection'`. They reuse the entries store: the text
 * lives in `fields.text` (value is 1, like a template completion).
 *
 * This module is the searchable surface's pure core — collect, filter, count —
 * so it stays unit-testable and the screen stays a thin renderer.
 */
import type { Behavior, CaptureEntry } from '../types';

export interface ReflectionItem {
  /** The underlying entry id. */
  id: string;
  behaviorId: string;
  behaviorTitle: string;
  at: number;
  text: string;
}

/** Ids of behaviors that capture reflections. */
function reflectionBehaviorIds(behaviors: Behavior[]): Set<string> {
  return new Set(
    behaviors.filter((b) => b.captureSpec?.type === 'reflection').map((b) => b.id)
  );
}

/**
 * All reflection entries as renderable items, newest first. Entries with no
 * text, or belonging to a non-reflection behavior, are dropped. Titles come
 * from the live behavior so a renamed behavior relabels its history too.
 */
export function collectReflections(
  behaviors: Behavior[],
  entries: CaptureEntry[]
): ReflectionItem[] {
  const ids = reflectionBehaviorIds(behaviors);
  const titles = new Map(behaviors.map((b) => [b.id, b.title]));
  return entries
    .filter((e) => ids.has(e.behaviorId) && (e.fields?.text?.trim().length ?? 0) > 0)
    .map((e) => ({
      id: e.id,
      behaviorId: e.behaviorId,
      behaviorTitle: titles.get(e.behaviorId) ?? 'Behavior',
      at: e.at,
      text: e.fields!.text.trim(),
    }))
    .sort((a, b) => b.at - a.at);
}

/**
 * Reflections filtered by a free-text query (all whitespace-separated terms
 * must match, case-insensitive, across the text and behavior title) and,
 * optionally, scoped to a single behavior. Empty query returns everything.
 */
export function searchReflections(
  behaviors: Behavior[],
  entries: CaptureEntry[],
  query: string,
  behaviorId?: string
): ReflectionItem[] {
  let items = collectReflections(behaviors, entries);
  if (behaviorId) items = items.filter((i) => i.behaviorId === behaviorId);
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return items;
  return items.filter((i) => {
    const hay = `${i.text} ${i.behaviorTitle}`.toLowerCase();
    return terms.every((t) => hay.includes(t));
  });
}

/** How many reflections exist (optionally for one behavior) — drives entry points. */
export function countReflections(
  behaviors: Behavior[],
  entries: CaptureEntry[],
  behaviorId?: string
): number {
  const items = collectReflections(behaviors, entries);
  return behaviorId ? items.filter((i) => i.behaviorId === behaviorId).length : items.length;
}
