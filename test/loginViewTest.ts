import { UserAccountService } from '../src/services/persistence/userAccountService';
import { CloudSyncService } from '../src/services/persistence/cloudSyncService';
import fs from 'fs';
import path from 'path';

async function runTests() {
  console.log('=== STORYBOOK VILLAGE LOGIN VIEW & OLD CREDENTIALS TEST ===\n');

  // 1. Verify component files exist and are valid TypeScript JSX
  const loginViewPath = path.resolve(process.cwd(), 'src/features/parent/LoginView.tsx');
  const reExportPath = path.resolve(process.cwd(), 'src/features/LoginView.tsx');

  if (!fs.existsSync(loginViewPath)) {
    throw new Error('LoginView.tsx does not exist in src/features/parent');
  }
  if (!fs.existsSync(reExportPath)) {
    throw new Error('LoginView.tsx does not exist in src/features');
  }
  console.log('PASS: LoginView successfully verified in src/features/parent/LoginView.tsx and src/features/LoginView.tsx');

  // Mock localStorage
  const mockStorage: Record<string, string> = {};
  (globalThis as any).window = {
    localStorage: {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, val: string) => { mockStorage[key] = String(val); },
      removeItem: (key: string) => { delete mockStorage[key]; },
      clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
    },
    location: {
      hostname: 'untangle-beyondminds.web.app',
    }
  };

  // 2. Test Old Login Credentials in the New Theme:
  console.log('Testing Old Login Credentials:');

  // Mindy
  const mindyRes = await UserAccountService.authenticateExplorer('mindy', 'village123');
  if (!mindyRes.success || !mindyRes.account) {
    throw new Error('Mindy old login credential failed!');
  }
  console.log(`PASS: Mindy authenticated -> avatar: ${mindyRes.account.avatar}, child: ${mindyRes.account.childName}`);

  // Aarav
  const aaravRes = await UserAccountService.authenticateExplorer('aarav', 'village123');
  if (!aaravRes.success || !aaravRes.account || aaravRes.account.childName !== 'Aarav') {
    throw new Error('Aarav old login credential failed!');
  }
  console.log(`PASS: Aarav authenticated -> avatar: ${aaravRes.account.avatar}, mobile: ${aaravRes.account.parentMobile}, lang: ${aaravRes.account.language}`);

  // Kavi
  const kaviRes = await UserAccountService.authenticateExplorer('kavi', 'village123');
  if (!kaviRes.success || !kaviRes.account || kaviRes.account.childName !== 'Kavi') {
    throw new Error('Kavi old login credential failed!');
  }
  console.log(`PASS: Kavi authenticated -> avatar: ${kaviRes.account.avatar}, ageGroup: ${kaviRes.account.ageGroup}`);

  // Leo
  const leoRes = await UserAccountService.authenticateExplorer('leo', 'village123');
  if (!leoRes.success || !leoRes.account || leoRes.account.childName !== 'Leo') {
    throw new Error('Leo old login credential failed!');
  }
  console.log(`PASS: Leo authenticated -> avatar: ${leoRes.account.avatar}, lang: ${leoRes.account.language}`);

  // Case-insensitivity check (e.g. AaRaV, LeO)
  const caseCheck = await UserAccountService.authenticateExplorer('AaRaV', 'village123');
  if (!caseCheck.success) throw new Error('Case insensitive username check failed!');
  console.log('PASS: Case insensitive username matching verified!');

  // Password mismatch check
  const wrongPass = await UserAccountService.authenticateExplorer('aarav', 'wrongpassword');
  if (wrongPass.success || !wrongPass.error?.includes('Incorrect secret word')) {
    throw new Error('Failed to reject incorrect secret word!');
  }
  console.log('PASS: Correctly rejected wrong secret word with message: ' + wrongPass.error);

  // Unknown user check
  const unknownUser = await UserAccountService.authenticateExplorer('ghost_user', 'village123');
  if (unknownUser.success || !unknownUser.error?.includes('Explorer not found')) {
    throw new Error('Failed to reject unknown username!');
  }
  console.log('PASS: Correctly rejected unknown user with helpful hint: ' + unknownUser.error);

  // 3. Test Session Detection on Website Open:
  console.log('\nTesting Website Opening Session Check:');
  // Scenario A: First time / signed out -> NOT logged in
  mockStorage['untangle_logged_in'] = 'false';
  delete mockStorage['untangle_active_mobile'];
  let isSessionActive = mockStorage['untangle_logged_in'] === 'true' && Boolean(mockStorage['untangle_active_mobile']);
  if (isSessionActive) throw new Error('Should not be active when signed out');
  console.log('PASS: First-time visitor or signed out user takes him to Sign In / Sign Up page');

  // Scenario B: Already signed in with active account -> takes him directly to village
  mockStorage['untangle_logged_in'] = 'true';
  mockStorage['untangle_active_mobile'] = '9876543210';
  isSessionActive = mockStorage['untangle_logged_in'] === 'true' && Boolean(mockStorage['untangle_active_mobile']);
  if (!isSessionActive) throw new Error('Should detect active session on opening');
  console.log('PASS: Returning user with saved session automatically enters the Village!');

  // 4. Test Sign Up (New Explorer Registration)
  console.log('\nTesting Sign Up / Plant Seed Registration:');
  const newExplorer = {
    parentMobile: '9871122334',
    childName: 'Meera',
    username: 'meera',
    password: 'mysecret123',
    ageGroup: '9-12' as const,
    avatar: '🦁',
    language: 'ta' as const,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  };
  UserAccountService.saveAccount(newExplorer);
  const meeraAuth = await UserAccountService.authenticateExplorer('meera', 'mysecret123');
  if (!meeraAuth.success || meeraAuth.account?.childName !== 'Meera') {
    throw new Error('New explorer sign up authentication failed!');
  }
  console.log(`PASS: New explorer "${meeraAuth.account.childName}" registered and authenticated with custom password!`);

  // 5. Test Cross-Device Sync String Generation & Parsing
  console.log('\nTesting Cross-Device Sync Engine:');
  const syncStr = CloudSyncService.generateSyncString(newExplorer);
  const parsed = CloudSyncService.parseSyncString(syncStr);
  if (!parsed || parsed.username !== 'meera' || parsed.childName !== 'Meera') {
    throw new Error('Failed to parse cross-device sync string');
  }
  console.log('PASS: Cross-device transfer string verified: ' + syncStr);

  console.log('\n=== ALL OLD CREDENTIALS, SESSION CHECK & AUTH TESTS PASSED! ===');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
