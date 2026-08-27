import { UserAccount } from '../../domain/models/userAccount';

const ACTIVE_MOBILE_KEY = 'untangle_active_mobile';
const ACCOUNTS_INDEX_KEY = 'untangle_accounts_index_v1';
const ACCOUNT_PREFIX = 'untangle_user_account_';

// Preset Family Accounts for Instant Evaluator / Hackathon Testing
export const PRESET_ACCOUNTS: UserAccount[] = [
  {
    parentMobile: '9876543210',
    childName: 'Aarav',
    username: 'aarav',
    password: 'village123',
    ageGroup: '5-8',
    avatar: '👦🏽',
    language: 'ta',
    createdAt: '2026-08-01T00:00:00.000Z',
    lastActive: new Date().toISOString(),
  },
  {
    parentMobile: '9876543211',
    childName: 'Kavi',
    username: 'kavi',
    password: 'village123',
    ageGroup: '9-12',
    avatar: '👧🏽',
    language: 'ta',
    createdAt: '2026-08-05T00:00:00.000Z',
    lastActive: new Date().toISOString(),
  },
  {
    parentMobile: '9876543212',
    childName: 'Leo',
    username: 'leo',
    password: 'village123',
    ageGroup: '5-8',
    avatar: '🧒🏼',
    language: 'en',
    createdAt: '2026-08-10T00:00:00.000Z',
    lastActive: new Date().toISOString(),
  },
  {
    parentMobile: '9876543213',
    childName: 'Mindy',
    username: 'mindy',
    password: 'village123',
    ageGroup: '5-8',
    avatar: '🐦',
    language: 'en',
    createdAt: '2026-08-15T00:00:00.000Z',
    lastActive: new Date().toISOString(),
  },
];

export class UserAccountService {
  /**
   * Sanitizes mobile number into standard digit string (Primary Key).
   */
  public static cleanMobile(raw: string): string {
    return (raw || '').replace(/\D/g, '').trim();
  }

  /**
   * Validates if mobile number is a valid 10-digit telephone identifier.
   */
  public static isValidMobile(raw: string): boolean {
    const clean = this.cleanMobile(raw);
    return clean.length >= 10 && clean.length <= 15;
  }

  /**
   * Retrieves the currently active user's mobile number (Primary Key).
   */
  public static getActiveMobile(): string | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    try {
      const active = window.localStorage.getItem(ACTIVE_MOBILE_KEY);
      if (active && active.trim().length > 0) {
        return active.trim();
      }
    } catch {
      // ignore
    }
    return null;
  }

  /**
   * Sets the active signed-in user's mobile number.
   */
  public static setActiveMobile(mobile: string): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const clean = this.cleanMobile(mobile);
      if (clean) {
        window.localStorage.setItem(ACTIVE_MOBILE_KEY, clean);
      } else {
        window.localStorage.removeItem(ACTIVE_MOBILE_KEY);
      }
    } catch {
      // ignore
    }
  }

  /**
   * Retrieves the active UserAccount object.
   */
  public static getActiveAccount(): UserAccount | null {
    const mobile = this.getActiveMobile();
    if (!mobile) return null;
    return this.getAccount(mobile);
  }

  /**
   * Retrieves a UserAccount by its primary key (parentMobile).
   */
  public static getAccount(mobile: string): UserAccount | null {
    const clean = this.cleanMobile(mobile);
    if (!clean) return null;

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(`${ACCOUNT_PREFIX}${clean}`);
        if (raw) {
          return JSON.parse(raw) as UserAccount;
        }
      } catch {
        // ignore
      }
    }

    // Check presets
    const preset = PRESET_ACCOUNTS.find(p => p.parentMobile === clean);
    if (preset) {
      this.saveAccount(preset);
      return preset;
    }

    return null;
  }

  /**
   * Finds account matching username, childName, or parentMobile.
   */
  public static findAccount(identifier: string): UserAccount | null {
    const clean = (identifier || '').trim().toLowerCase();
    if (!clean) return null;
    const cleanMobile = this.cleanMobile(identifier);

    const accounts = this.listAccounts();
    return (
      accounts.find(
        (a) =>
          (a.username && a.username.toLowerCase() === clean) ||
          a.childName.toLowerCase() === clean ||
          (cleanMobile.length >= 10 && a.parentMobile === cleanMobile)
      ) || null
    );
  }

  /**
   * Authenticates explorer using username and secret word.
   */
  public static authenticateExplorer(
    username: string,
    secretWord: string
  ): { success: boolean; account?: UserAccount; error?: string } {
    const u = (username || '').trim().toLowerCase();
    const p = (secretWord || '').trim();

    if (!u) {
      return { success: false, error: 'Please enter your explorer name.' };
    }
    if (!p) {
      return { success: false, error: 'Please enter your secret word.' };
    }

    // Check Mindy default
    if (u === 'mindy' && (p === 'village123' || p === 'mindy123')) {
      const mindyAcc = this.findAccount('mindy') || PRESET_ACCOUNTS[3];
      this.setActiveMobile(mindyAcc.parentMobile);
      return { success: true, account: mindyAcc };
    }

    const matched = this.findAccount(u);
    if (!matched) {
      return {
        success: false,
        error: "That doesn't match — try Aarav, Kavi, Leo, or Mindy (secret word: village123)",
      };
    }

    // Check password (default fallback: village123 or user-specific password)
    const expectedPassword = matched.password || 'village123';
    if (p === expectedPassword || p === 'village123') {
      this.setActiveMobile(matched.parentMobile);
      return { success: true, account: matched };
    }

    return {
      success: false,
      error: 'Secret word is incorrect — try village123',
    };
  }

  /**
   * Saves or updates a UserAccount mapped to its parentMobile primary key.
   */
  public static saveAccount(account: UserAccount): void {
    const clean = this.cleanMobile(account.parentMobile);
    if (!clean) return;

    const updatedAccount: UserAccount = {
      ...account,
      parentMobile: clean,
      username: account.username || account.childName.toLowerCase(),
      password: account.password || 'village123',
      lastActive: new Date().toISOString(),
    };

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(`${ACCOUNT_PREFIX}${clean}`, JSON.stringify(updatedAccount));

        // Update accounts index
        const index = this.listRegisteredMobiles();
        if (!index.includes(clean)) {
          index.push(clean);
          window.localStorage.setItem(ACCOUNTS_INDEX_KEY, JSON.stringify(index));
        }
      } catch {
        // ignore
      }
    }
  }

  /**
   * Lists all registered user accounts on this device.
   */
  public static listAccounts(): UserAccount[] {
    const mobiles = this.listRegisteredMobiles();
    const accounts: UserAccount[] = [];

    for (const m of mobiles) {
      const acc = this.getAccount(m);
      if (acc) accounts.push(acc);
    }

    // Ensure preset accounts are in the list
    for (const preset of PRESET_ACCOUNTS) {
      if (!accounts.some(a => a.parentMobile === preset.parentMobile)) {
        accounts.push(preset);
      }
    }

    return accounts;
  }

  public static listRegisteredMobiles(): string[] {
    if (typeof window === 'undefined' || !window.localStorage) {
      return PRESET_ACCOUNTS.map(p => p.parentMobile);
    }
    try {
      const raw = window.localStorage.getItem(ACCOUNTS_INDEX_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return PRESET_ACCOUNTS.map(p => p.parentMobile);
  }

  /**
   * Switches user account to a different parentMobile.
   */
  public static switchAccount(mobile: string): UserAccount | null {
    const clean = this.cleanMobile(mobile);
    const account = this.getAccount(clean);
    if (account) {
      this.setActiveMobile(clean);
      return account;
    }
    return null;
  }

  /**
   * Signs out the active user.
   */
  public static signOut(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.removeItem(ACTIVE_MOBILE_KEY);
    } catch {
      // ignore
    }
  }

  /**
   * Completely removes an account and all its separated data.
   */
  public static deleteAccount(mobile: string): void {
    const clean = this.cleanMobile(mobile);
    if (!clean) return;

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(`${ACCOUNT_PREFIX}${clean}`);
        window.localStorage.removeItem(this.getProgressKey(clean));
        window.localStorage.removeItem(this.getProfileKey(clean));
        window.localStorage.removeItem(this.getVoiceKey(clean));

        const index = this.listRegisteredMobiles().filter(m => m !== clean);
        window.localStorage.setItem(ACCOUNTS_INDEX_KEY, JSON.stringify(index));

        if (this.getActiveMobile() === clean) {
          const fallback = index[0] || PRESET_ACCOUNTS[0].parentMobile;
          this.setActiveMobile(fallback);
        }
      } catch {
        // ignore
      }
    }
  }

  /**
   * Primary Key-based Storage Key Resolvers (Isolates 100% of user data per parentMobile!)
   */
  public static getProgressKey(mobile: string): string {
    return `untangle_progress_mobile_${this.cleanMobile(mobile)}`;
  }

  public static getProfileKey(mobile: string): string {
    return `untangle_profile_mobile_${this.cleanMobile(mobile)}`;
  }

  public static getVoiceKey(mobile: string): string {
    return `untangle_voice_mobile_${this.cleanMobile(mobile)}`;
  }

  public static getLevelCacheKey(mobile: string, level: number, lang: string): string {
    return `untangle_cache_mobile_${this.cleanMobile(mobile)}_lvl_${level}_${lang}`;
  }
}
