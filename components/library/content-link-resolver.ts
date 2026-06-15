import {
  LIBRARY_GUIDES,
  LIBRARY_PROGRAMS,
  ADOPT_TEMPLATES,
  ELIMINATE_TEMPLATES,
  type LibraryGuide,
  type LibraryProgram,
  type AdoptTemplate,
  type EliminateTemplate,
} from '@/services/library-content';

export type ContentTarget =
  | { kind: 'guide'; guide: LibraryGuide }
  | { kind: 'adopt'; template: AdoptTemplate }
  | { kind: 'eliminate'; template: EliminateTemplate }
  | { kind: 'program'; program: LibraryProgram }
  | null;

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function resolveWikiLabel(label: string): ContentTarget {
  const base = label.split('#')[0].split('|')[0];
  const norm = normalize(base);

  const guide = LIBRARY_GUIDES.find((g) => normalize(g.title) === norm);
  if (guide) return { kind: 'guide', guide };

  const adopt = ADOPT_TEMPLATES.find((t) => normalize(t.title) === norm);
  if (adopt) return { kind: 'adopt', template: adopt };

  const eliminate = ELIMINATE_TEMPLATES.find((t) => normalize(t.title) === norm);
  if (eliminate) return { kind: 'eliminate', template: eliminate };

  const program = LIBRARY_PROGRAMS.find((p) => normalize(p.title) === norm);
  if (program) return { kind: 'program', program };

  return null;
}

export function transformWikiLinks(md: string): string {
  return md
    .replace(
      /\[\[([^|\]]+)\|([^\]]+)\]\]/g,
      (_, target, display) =>
        `[${display}](wiki://${encodeURIComponent(target.trim())})`
    )
    .replace(
      /\[\[([^\]]+)\]\]/g,
      (_, target) => `[${target}](wiki://${encodeURIComponent(target.trim())})`
    );
}

export function decodeWikiHref(href: string): string | null {
  if (!href.startsWith('wiki://')) return null;
  return decodeURIComponent(href.slice('wiki://'.length));
}
