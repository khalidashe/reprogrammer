import { Domain, PracticeType } from '../../types';

export interface ResearchEntry {
  fact: string;
  source: string;
  sourceUrl?: string;
}

export interface Tactic {
  heading: string;
  body: string;
}

export interface LibraryGuide {
  id: string;
  title: string;
  domain: Domain;
  practiceType: PracticeType;
  estimatedMinutes: number;
  summary: string;
  story: string;
  whatItReveals: string;
  principle: string;
  research: ResearchEntry[];
  howToApply: Tactic[];
  connection: string;
  relatedGuideIds?: string[];
}

export interface LibraryPackage {
  id: string;
  title: string;
  description: string;
  guideIds: string[];
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
  description: string;
  tactics?: string[];
  whyItWorks?: string;
  resources?: string[];
  relatedAdoptIds?: string[];
  relatedEliminateIds?: string[];
}

export interface EliminateTemplate {
  id: string;
  title: string;
  pingMessage: string;
  domain: Domain;
  replacementAdoptId: string;
  frequency: string;
  triggers: string[];
  whyItsCostly?: string;
  whatItSoundsLike?: string;
  replacementNote?: string;
  relatedGuideIds?: string[];
}

export interface CoreStory {
  id: string;
  index: number;
  title: string;
  narrative: string;
  whatItReveals: string;
  principle: string;
  research: ResearchEntry[];
  connection?: string;
}

export interface ScienceTopic {
  heading: string;
  body: string;
  bullets?: string[];
}

export interface ScienceSection {
  title: string;
  intro: string;
  topics: ScienceTopic[];
  summary: ResearchEntry[];
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
