export type {
  ResearchEntry,
  Tactic,
  LibraryGuide,
  LibraryPackage,
  AdoptTemplate,
  EliminateTemplate,
  CoreStory,
  ScienceTopic,
  ScienceSection,
} from './library/types';

export { domainLabel, practiceTypeIcon } from './library/types';
export { LIBRARY_GUIDES, LIBRARY_PACKAGES } from './library/guides';
export { ADOPT_TEMPLATES } from './library/adopt';
export { ELIMINATE_TEMPLATES } from './library/eliminate';
export { CORE_STORIES, SCIENCE_SECTION } from './library/core';

import { ADOPT_TEMPLATES } from './library/adopt';
import type { AdoptTemplate } from './library/types';

export function featuredTemplates(): AdoptTemplate[] {
  return ADOPT_TEMPLATES.filter((t) => t.featured);
}
