/**
 * Self-test for the canonical sync policy (REP-30). Run with:
 *   npx tsx services/__tests__/sync-policy.test.ts
 *
 * Verifies the private-tier contract that the consent gate and the privacy
 * disclosures both rely on: which entities are wholly private, which fields are
 * personal free-text, and when a push requires privacy-sync consent.
 */
import {
  isPrivateEntity,
  isPrivateField,
  requiresPrivacyConsent,
} from '../sync-policy';

let failures = 0;
function expect(cond: boolean, msg: string) {
  if (!cond) {
    failures++;
    console.error('FAIL:', msg);
  }
}

// Wholly-private entities.
expect(isPrivateEntity('entries'), 'entries is a wholly-private entity');
expect(!isPrivateEntity('behaviors'), 'behaviors is not wholly private');
expect(!isPrivateEntity('reminderAttempts'), 'reminderAttempts is not private');

// Private free-text fields vs. ordinary synced fields.
expect(isPrivateField('behaviors', 'journal'), 'behavior.journal is private');
expect(!isPrivateField('behaviors', 'title'), 'behavior.title is not private');
expect(!isPrivateField('behaviors', 'level'), 'behavior.level is not private');
expect(isPrivateField('checkIns', 'note'), 'checkIn.note is private');
expect(!isPrivateField('checkIns', 'result'), 'checkIn.result is not private');
expect(isPrivateField('appProfiles', 'userBio'), 'appProfile.userBio is private');
expect(isPrivateField('appProfiles', 'goals'), 'appProfile.goals is private');
expect(!isPrivateField('appProfiles', 'quietHours'), 'appProfile.quietHours is not private');

// Consent requirement: wholly-private entity always; mixed entity only on its private fields.
expect(requiresPrivacyConsent('entries'), 'entries always requires consent');
expect(!requiresPrivacyConsent('behaviors'), 'behaviors as a whole does not require consent');
expect(requiresPrivacyConsent('behaviors', 'journal'), 'behavior.journal requires consent');
expect(!requiresPrivacyConsent('behaviors', 'title'), 'behavior.title does not require consent');
expect(requiresPrivacyConsent('checkIns', 'note'), 'checkIn.note requires consent');
expect(!requiresPrivacyConsent('checkIns', 'at'), 'checkIn.at does not require consent');
expect(requiresPrivacyConsent('appProfiles', 'goals'), 'appProfile.goals requires consent');

// --- summary ---
if (failures > 0) {
  console.error(`\n${failures} test(s) failed.`);
  process.exit(1);
}
console.log('OK — sync-policy tests passed.');
