/**
 * Built-in structured-entry templates (REP-5 Phase 3). Each maps a book
 * exercise to a small set of typed fields the user fills at check-in; the
 * weekly review then counts completions and surfaces the latest entry.
 */
import type { CaptureTemplateId } from '../types';

export interface CaptureTemplateField {
  key: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
}

export interface CaptureTemplate {
  id: CaptureTemplateId;
  /** Used as the capture label and shown in pickers. */
  title: string;
  blurb: string;
  fields: CaptureTemplateField[];
}

export const CAPTURE_TEMPLATES: CaptureTemplate[] = [
  {
    id: 'cbt',
    title: 'Thought record',
    blurb: 'Catch a distorted thought and answer it (CBT).',
    fields: [
      { key: 'situation', label: 'Situation', placeholder: 'What happened?' },
      { key: 'thought', label: 'Automatic thought', placeholder: 'What went through your mind?' },
      { key: 'distortion', label: 'Distortion', placeholder: 'All-or-nothing? Catastrophizing?' },
      {
        key: 'response',
        label: 'Rational response',
        placeholder: 'A truer, kinder reframe',
        multiline: true,
      },
    ],
  },
  {
    id: 'ofnr',
    title: 'OFNR',
    blurb: 'Observation, feeling, need, request (Nonviolent Communication).',
    fields: [
      { key: 'observation', label: 'Observation', placeholder: 'Just the facts, no judgment' },
      { key: 'feeling', label: 'Feeling', placeholder: 'What you actually felt' },
      { key: 'need', label: 'Need', placeholder: 'The need underneath the feeling' },
      { key: 'request', label: 'Request', placeholder: 'A specific, doable, refusable ask' },
    ],
  },
  {
    id: 'three_good_things',
    title: 'Three good things',
    blurb: 'Three things that went well today, and why.',
    fields: [
      { key: 'one', label: 'One', placeholder: 'Something that went well', multiline: true },
      { key: 'two', label: 'Two', placeholder: 'Something else', multiline: true },
      { key: 'three', label: 'Three', placeholder: 'One more', multiline: true },
    ],
  },
];

export function getCaptureTemplate(id: CaptureTemplateId): CaptureTemplate {
  return CAPTURE_TEMPLATES.find((t) => t.id === id) ?? CAPTURE_TEMPLATES[0];
}
