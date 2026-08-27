import { UserAccountService } from '../src/services/persistence/userAccountService';
import { ProgressStorageService } from '../src/services/persistence/progressStorage';
import { PlayerProfileStorage } from '../src/services/persistence/playerProfileStorage';
import { UserAccount, AGE_GROUP_CONFIG, AgeGroup } from '../src/domain/models/userAccount';

console.log('=== USER SIGN-IN & MOBILE PRIMARY KEY DATA SEPARATION TEST ===\n');

// Mock localStorage in Node
const mockStorage: Record<string, string> = {};
(global as any).window = {
  localStorage: {
    getItem: (k: string) => mockStorage[k] || null,
    setItem: (k: string, v: string) => { mockStorage[k] = v; },
    removeItem: (k: string) => { delete mockStorage[k]; },
  }
};

// 1. Verify Age Group Configurations
console.log('Testing Age Group Configurations:');
const expectedGroups: AgeGroup[] = ['5-8', '9-12', '13-15', '16-18'];
for (const group of expectedGroups) {
  const cfg = AGE_GROUP_CONFIG[group];
  console.log(`  Age Group [${group}]: ${cfg.labelEn} -> Initial Level: ${cfg.initialLevel}, Difficulty: ${cfg.initialDifficulty}`);
  if (!cfg.initialLevel || !cfg.initialDifficulty || !cfg.labelEn || !cfg.labelTa) {
    throw new Error(`Invalid configuration for age group: ${group}`);
  }
}
console.log('PASS: All 4 age groups properly configured!\n');

// 2. Register User 1 (Aarav, Age 5-8, Parent Mobile: 9876543210)
const mobile1 = '9876543210';
const user1: UserAccount = {
  parentMobile: mobile1,
  childName: 'Aarav',
  ageGroup: '5-8',
  avatar: '👦🏽',
  language: 'ta',
  createdAt: new Date().toISOString(),
  lastActive: new Date().toISOString(),
};

UserAccountService.saveAccount(user1);
UserAccountService.setActiveMobile(mobile1);

// User 1 plays: advances to level 3, masters words
const progress1 = ProgressStorageService.load(mobile1);
progress1.wordsTaughtCount = 25;
progress1.level = 3;
progress1.lessonCards.push({
  id: 'lc_aarav_custom',
  word: 'மலர்',
  meaning: 'பூ',
  dateEarned: 'Today',
  language: 'ta',
});
ProgressStorageService.save(progress1, mobile1);

const profile1 = PlayerProfileStorage.loadProfile(mobile1);
profile1.currentLevel = 3;
profile1.wordsMastered.push('மலர்');
PlayerProfileStorage.saveProfile(profile1, mobile1);

console.log(`User 1 (${user1.childName} - ${mobile1}) Data Saved:`);
console.log(`  Level: ${progress1.level}`);
console.log(`  Words Taught: ${progress1.wordsTaughtCount}`);
console.log(`  Lesson Cards: ${progress1.lessonCards.length}`);
console.log(`  Mastered Words: ${profile1.wordsMastered.join(', ')}`);

// 3. Register User 2 (Priya, Age 13-15, Parent Mobile: 9988776655)
const mobile2 = '9988776655';
const user2: UserAccount = {
  parentMobile: mobile2,
  childName: 'Priya',
  ageGroup: '13-15',
  avatar: '👧🏽',
  language: 'en',
  createdAt: new Date().toISOString(),
  lastActive: new Date().toISOString(),
};

UserAccountService.saveAccount(user2);
UserAccountService.setActiveMobile(mobile2);

// Load User 2's data fresh
const progress2 = ProgressStorageService.load(mobile2);
const profile2 = PlayerProfileStorage.loadProfile(mobile2);

console.log(`\nUser 2 (${user2.childName} - ${mobile2}) Data Loaded:`);
console.log(`  Level: ${progress2.level}`);
console.log(`  Words Taught: ${progress2.wordsTaughtCount}`);
console.log(`  Lesson Cards: ${progress2.lessonCards.length}`);
console.log(`  Mastered Words: ${profile2.wordsMastered.join(', ')}`);

// 4. CRITICAL VERIFICATION: Strict Separation Check!
// User 2 must NOT have User 1's custom lesson card or words!
const user2HasAaravWord = profile2.wordsMastered.includes('மலர்');
const user2HasAaravCard = progress2.lessonCards.some(c => c.id === 'lc_aarav_custom');

if (user2HasAaravWord || user2HasAaravCard) {
  throw new Error('DATA BLEED BUG: User 2 has User 1 data!');
}
console.log('\nPASS: Zero data bleed detected! User 2 has completely isolated storage.');

// 5. Switch back to User 1 by mobile number and verify data is 100% preserved
UserAccountService.switchAccount(mobile1);
const reloadedProgress1 = ProgressStorageService.load(mobile1);
const reloadedProfile1 = PlayerProfileStorage.loadProfile(mobile1);

if (reloadedProgress1.wordsTaughtCount !== 25 || reloadedProfile1.currentLevel !== 3) {
  throw new Error('DATA LOSS BUG: User 1 data was not preserved upon switching back!');
}
if (!reloadedProfile1.wordsMastered.includes('மலர்')) {
  throw new Error('Mastered word missing for User 1');
}

console.log('PASS: User 1 data fully intact after switching accounts!');
console.log('\n=== ALL USER SIGN-IN & DATA SEPARATION TESTS PASSED! ===');
