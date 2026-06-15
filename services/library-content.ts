import type { Domain, LibraryCategory, PracticeType } from '../types';

export interface LibraryGuide {
  id: string;
  title: string;
  domain: Domain;
  practiceType: PracticeType;
  estimatedMinutes: number;
  summary: string;
  body: string;
}

export interface LibraryProgram {
  id: string;
  title: string;
  description: string;
  /** Library category this program/book belongs to (REP-11). */
  category: LibraryCategory;
  /** Optional source book + author, for book-based programs (REP-33). */
  book?: { title: string; author: string; year: number };
  guideIds: string[];
  body: string;
  sequence?: string[];
}

export interface AdoptTemplate {
  id: string;
  title: string;
  pingMessage: string;
  domain: Domain;
  practiceType: PracticeType;
  intervalMinutes: number;
  window: { from: string; to: string };
  libraryGuideId?: string;
  featured?: boolean;
  body: string;
}

export interface EliminateTemplate {
  id: string;
  title: string;
  pingMessage: string;
  domain: Domain;
  replacementAdoptId: string;
  body: string;
  triggers?: string[];
}

import { LIBRARY_GUIDES } from './content/guides';
import { LIBRARY_PROGRAMS } from './content/programs';
import { ADOPT_TEMPLATES } from './content/adopt-templates';
import { ELIMINATE_TEMPLATES } from './content/eliminate-templates';

export { LIBRARY_GUIDES, LIBRARY_PROGRAMS, ADOPT_TEMPLATES, ELIMINATE_TEMPLATES };

export function featuredTemplates(): AdoptTemplate[] {
  return ADOPT_TEMPLATES.filter((t) => t.featured);
}

/* ---------------------------------------------------------------------------
 * Library categories (REP-11)
 *
 * A browsable taxonomy with "The Foundation" as the forefront gateway — the
 * how-change-works prologue surfaced before anything else. Book-only categories
 * (Body & Health, Wealth & Money, …) stay hidden in the UI until they have
 * content; see `categoriesWithGuides`. The full book catalogue is REP-33.
 * ------------------------------------------------------------------------- */

export const FOUNDATION_CATEGORY: LibraryCategory = 'foundation';

interface CategoryMeta {
  id: LibraryCategory;
  label: string;
  /** One-line description shown under the category in the browse view. */
  tagline: string;
}

/** Display order — The Foundation always leads. */
export const LIBRARY_CATEGORIES: CategoryMeta[] = [
  { id: 'foundation', label: 'The Foundation', tagline: 'How change actually works — start here' },
  { id: 'mind_thinking', label: 'Mind & Thinking', tagline: 'Mental models, biases, decisions' },
  { id: 'focus_attention', label: 'Focus & Attention', tagline: 'Deep work and digital discipline' },
  { id: 'emotions_resilience', label: 'Emotions & Resilience', tagline: 'Regulate anger, anxiety, and mood' },
  { id: 'social_communication', label: 'Social & Communication', tagline: 'Conversation, presence, influence' },
  { id: 'performance_productivity', label: 'Performance & Productivity', tagline: 'Systems, time, and mastery' },
  { id: 'identity_purpose', label: 'Identity & Purpose', tagline: 'Self-concept, values, confidence' },
  { id: 'body_health', label: 'Body & Health', tagline: 'Sleep, energy, and movement' },
  { id: 'relationships', label: 'Relationships', tagline: 'Trust, intimacy, and dynamics' },
  { id: 'wealth_money', label: 'Wealth & Money', tagline: 'The psychology of spending and saving' },
  { id: 'philosophy_worldview', label: 'Philosophy & Worldview', tagline: 'Stoicism, meaning, perspective' },
];

const CATEGORY_BY_ID: Record<LibraryCategory, CategoryMeta> = LIBRARY_CATEGORIES.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {} as Record<LibraryCategory, CategoryMeta>,
);

/**
 * Which category each guide belongs to. Kept as a single table (rather than a
 * field on every guide object) so the taxonomy is easy to review and re-tag in
 * one place. New guides should be added here.
 */
const GUIDE_CATEGORY: Record<string, LibraryCategory> = {
  // The Foundation — how change works (the gateway prologue)
  'guide-context-design': 'foundation',
  'guide-action-over-consumption': 'foundation',
  'guide-social-environment': 'foundation',
  'guide-relapse-and-restart': 'foundation',
  // Focus & Attention
  'guide-attention-fragmentation': 'focus_attention',
  'guide-deep-focus': 'focus_attention',
  'guide-digital-discipline': 'focus_attention',
  // Social & Communication
  'guide-body-language': 'social_communication',
  'guide-communication-process': 'social_communication',
  'guide-dominant-posture': 'social_communication',
  'guide-empathy-on-command': 'social_communication',
  'guide-eye-contact': 'social_communication',
  'guide-public-speaking': 'social_communication',
  'guide-small-talk': 'social_communication',
  // Emotions & Resilience
  'guide-dont-laugh': 'emotions_resilience',
  'guide-fear-and-panic': 'emotions_resilience',
  'guide-let-go-of-rage': 'emotions_resilience',
  'guide-poker-face': 'emotions_resilience',
  'guide-rumination-interrupt': 'emotions_resilience',
  // Identity & Purpose
  'guide-confidence': 'identity_purpose',
};

/** The category a guide belongs to (falls back to The Foundation). */
export function guideCategory(guideId: string): LibraryCategory {
  return GUIDE_CATEGORY[guideId] ?? FOUNDATION_CATEGORY;
}

export function categoryLabel(category: LibraryCategory): string {
  return CATEGORY_BY_ID[category].label;
}

export function categoryTagline(category: LibraryCategory): string {
  return CATEGORY_BY_ID[category].tagline;
}

/**
 * Categories that currently have content (a guide or a program), in display
 * order (Foundation first). Still-empty categories are omitted from the UI
 * until they're filled.
 */
export function categoriesWithContent(): LibraryCategory[] {
  const present = new Set<LibraryCategory>();
  for (const g of LIBRARY_GUIDES) present.add(guideCategory(g.id));
  for (const p of LIBRARY_PROGRAMS) present.add(p.category);
  return LIBRARY_CATEGORIES.filter((c) => present.has(c.id)).map((c) => c.id);
}

export function domainLabel(domain: Domain): string {
  switch (domain) {
    case 'language_cognitive':
      return 'Language & Cognitive';
    case 'physical':
      return 'Physical';
    case 'social':
      return 'Social';
    case 'emotional':
      return 'Emotional';
    case 'creative':
      return 'Creative';
    case 'professional':
      return 'Professional';
  }
}

/**
 * Base SF Symbols that compose a practice type — one icon for the three base
 * models, two for a combination (e.g. Mental + Physical shows both).
 */
export function practiceTypeIcons(type: PracticeType): string[] {
  switch (type) {
    case 'mental':
      return ['brain.head.profile'];
    case 'physical':
      return ['figure.walk'];
    case 'learning':
      return ['book.fill'];
    case 'mental_physical':
      return ['brain.head.profile', 'figure.walk'];
    case 'mental_learning':
      return ['brain.head.profile', 'book.fill'];
    case 'physical_learning':
      return ['figure.walk', 'book.fill'];
  }
}

/** Single representative icon (the first base icon of a combination). */
export function practiceTypeIcon(type: PracticeType): string {
  return practiceTypeIcons(type)[0];
}

/** Human-readable label, e.g. "Mental" or "Mental + Physical". */
export function practiceTypeLabel(type: PracticeType): string {
  switch (type) {
    case 'mental':
      return 'Mental';
    case 'physical':
      return 'Physical';
    case 'learning':
      return 'Learning';
    case 'mental_physical':
      return 'Mental + Physical';
    case 'mental_learning':
      return 'Mental + Learning';
    case 'physical_learning':
      return 'Physical + Learning';
  }
}
