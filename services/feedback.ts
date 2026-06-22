/**
 * Feedback / report channel (REP-10).
 *
 * Builds a prefilled `mailto:` link so a user can suggest a change or flag a
 * problem from any behavior, guide, or program. Kept as a pure, dependency-free
 * builder (no react-native / expo imports) so it unit-tests with plain `tsx`
 * like its service peers; the FeedbackButton component supplies the runtime
 * bits (app version, platform) and opens the link.
 *
 * No backend form yet — email is the simplest channel that ships today. When a
 * dedicated support inbox lands (REP-38), only FEEDBACK_EMAIL changes here.
 */

export const FEEDBACK_EMAIL = 'info@reprogrammer.app';

export type FeedbackKind =
  | 'behavior'
  | 'guide'
  | 'program'
  | 'adopt'
  | 'eliminate';

export interface FeedbackContext {
  kind: FeedbackKind;
  /** Stable id of the item, so we can find exactly what was flagged. */
  id: string;
  /** Human title, shown in the subject line. */
  title: string;
}

export interface FeedbackEnv {
  appVersion: string;
  platform: string;
}

const KIND_LABEL: Record<FeedbackKind, string> = {
  behavior: 'Behavior',
  guide: 'Guide',
  program: 'Program',
  adopt: 'Adopt behavior',
  eliminate: 'Eliminate behavior',
};

/**
 * A `mailto:` URL with a friendly prompt up top, blank space to write, and a
 * small context footer so feedback is traceable to the exact item and build.
 */
export function buildFeedbackMailto(
  context: FeedbackContext,
  env: FeedbackEnv
): string {
  const subject = `Reprogrammer — feedback on ${context.title}`;
  const body = [
    'Spotted something off, or have an idea to make this better? Share it here — every note helps.',
    '',
    '',
    '———',
    `${KIND_LABEL[context.kind]}: ${context.title}`,
    `Ref: ${context.id}`,
    `App ${env.appVersion} · ${env.platform}`,
  ].join('\n');
  return `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}
