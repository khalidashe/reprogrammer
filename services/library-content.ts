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

export interface LibraryPackage {
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
import { LIBRARY_PACKAGES } from './content/packages';
import { ADOPT_TEMPLATES } from './content/adopt-templates';
import { ELIMINATE_TEMPLATES } from './content/eliminate-templates';

export { LIBRARY_GUIDES, LIBRARY_PACKAGES, ADOPT_TEMPLATES, ELIMINATE_TEMPLATES };

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

export function practiceTypeIcon(type: PracticeType): string {
  switch (type) {
    case 'mental':
      return 'brain.head.profile';
    case 'physical':
      return 'figure.walk';
    case 'learning':
      return 'book.fill';
    case 'dual':
      return 'rectangle.stack.fill';
  }
}
