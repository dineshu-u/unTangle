import { UserAccount } from '../../domain/models/userAccount';

export class CloudSyncService {
  /**
   * Pushes user account to cloud storage so it is immediately accessible from all devices.
   */
  public static async pushAccountToCloud(account: UserAccount): Promise<boolean> {
    const cleanUsername = (account.username || account.childName).toLowerCase().trim().replace(/\s+/g, '');
    if (!cleanUsername) return false;

    let success = false;

    // 1. Instant zero-config global cloud sync (Full CORS, zero auth, works on all devices worldwide)
    try {
      await fetch(`https://ntfy.sh/untangle_acc_${cleanUsername}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Title': 'untangle_account',
        },
        body: JSON.stringify(account),
      });
      success = true;
    } catch {
      // ignore network errors
    }

    // 2. Also push to Firebase Realtime Database REST API if hosted on Firebase
    const projectId = this.getFirebaseProjectId();
    if (projectId && projectId !== 'localhost' && !projectId.includes('127.0.0.1')) {
      try {
        const url = `https://${projectId}-default-rtdb.firebaseio.com/untangle_accounts/${cleanUsername}.json`;
        await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(account),
        });
        success = true;
      } catch {
        // ignore
      }
    }

    return success;
  }

  /**
   * Pulls user account from cloud storage when signing in on a new device.
   */
  public static async pullAccountFromCloud(username: string): Promise<UserAccount | null> {
    const cleanUsername = username.toLowerCase().trim().replace(/\s+/g, '');
    if (!cleanUsername) return null;

    // 1. Try global cloud sync
    try {
      const res = await fetch(`https://ntfy.sh/untangle_acc_${cleanUsername}/json?poll=1`);
      if (res.ok) {
        const text = await res.text();
        const lines = text.trim().split('\n').filter(Boolean);
        for (let i = lines.length - 1; i >= 0; i--) {
          try {
            const data = JSON.parse(lines[i]);
            if (data && data.message) {
              const parsed = JSON.parse(data.message) as UserAccount;
              if (parsed && parsed.childName && parsed.password) {
                return parsed;
              }
            }
          } catch {
            // continue
          }
        }
      }
    } catch {
      // ignore
    }

    // 2. Try Firebase Realtime Database REST API if available
    const projectId = this.getFirebaseProjectId();
    if (projectId && projectId !== 'localhost' && !projectId.includes('127.0.0.1')) {
      try {
        const url = `https://${projectId}-default-rtdb.firebaseio.com/untangle_accounts/${cleanUsername}.json`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && data.childName && data.password) {
            return data as UserAccount;
          }
        }
      } catch {
        // ignore
      }
    }

    return null;
  }

  /**
   * Generates a compact 1-line Device Sync String for cross-device sharing.
   * e.g. "UNT:sam:village123:Sam:5-8:en:👦🏽:9871234567"
   */
  public static generateSyncString(account: UserAccount): string {
    const u = account.username || account.childName.toLowerCase();
    const p = account.password || 'village123';
    const c = account.childName;
    const g = account.ageGroup;
    const l = account.language;
    const a = account.avatar;
    const m = account.parentMobile;
    return `UNT:${u}:${p}:${c}:${g}:${l}:${a}:${m}`;
  }

  /**
   * Parses a 1-line Device Sync String imported from another device.
   */
  public static parseSyncString(syncStr: string): UserAccount | null {
    if (!syncStr || !syncStr.startsWith('UNT:')) return null;
    const parts = syncStr.split(':');
    if (parts.length < 8) return null;

    const [, username, password, childName, ageGroup, language, avatar, parentMobile] = parts;
    return {
      username: username.trim().toLowerCase(),
      password: password.trim(),
      childName: childName.trim(),
      ageGroup: (ageGroup.trim() as any) || '5-8',
      language: language.trim() === 'ta' ? 'ta' : 'en',
      avatar: avatar.trim() || '👦🏽',
      parentMobile: parentMobile.trim() || '987' + Math.floor(1000000 + Math.random() * 9000000),
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };
  }

  /**
   * Detects Firebase Project ID from current browser hostname.
   */
  public static getFirebaseProjectId(): string | null {
    if (typeof window === 'undefined') return null;
    const host = window.location.hostname.toLowerCase();
    if (host.includes('.web.app')) {
      return host.replace('.web.app', '').trim();
    }
    if (host.includes('.firebaseapp.com')) {
      return host.replace('.firebaseapp.com', '').trim();
    }
    return null;
  }
}
