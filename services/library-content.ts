import type { Domain, PracticeType } from '../types';

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
