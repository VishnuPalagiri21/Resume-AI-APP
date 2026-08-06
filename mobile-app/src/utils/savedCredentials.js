import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX = '@resumeai_saved_credentials_';

/**
 * Normalizes role identifier ('user' | 'candidate' -> 'candidate', 'recruiter' -> 'recruiter', 'admin' -> 'admin')
 */
export const normalizeRoleKey = (role) => {
  const r = (role || 'candidate').toLowerCase();
  if (r === 'user' || r === 'candidate' || r === 'jobseeker') return 'candidate';
  if (r === 'recruiter') return 'recruiter';
  if (r === 'admin') return 'admin';
  return 'candidate';
};

/**
 * Simple obfuscation for local storage protection
 */
const encodeVal = (str) => {
  try {
    return btoa(encodeURIComponent(str));
  } catch (e) {
    return str;
  }
};

const decodeVal = (str) => {
  try {
    return decodeURIComponent(atob(str));
  } catch (e) {
    return str;
  }
};

/**
 * Retrieves all saved credentials for a specific role
 * @param {string} role - 'candidate' | 'recruiter' | 'admin'
 * @returns {Promise<Array<{email: string, password: string, lastUsed: number}>>}
 */
export const getRoleCredentials = async (role) => {
  try {
    const key = STORAGE_PREFIX + normalizeRoleKey(role);
    const dataStr = await AsyncStorage.getItem(key);
    if (!dataStr) return [];

    const parsed = JSON.parse(dataStr);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => ({
        email: item.email || '',
        password: decodeVal(item.password || ''),
        lastUsed: item.lastUsed || Date.now(),
      }))
      .filter((item) => item.email && item.password);
  } catch (err) {
    console.error('[savedCredentials mobile] Failed to get role credentials:', err);
    return [];
  }
};

/**
 * Saves a credential entry for a specific role
 * @param {string} role - 'candidate' | 'recruiter' | 'admin'
 * @param {string} email
 * @param {string} password
 */
export const saveRoleCredential = async (role, email, password) => {
  if (!email || !password) return;
  try {
    const roleKey = normalizeRoleKey(role);
    const storageKey = STORAGE_PREFIX + roleKey;
    const existing = await getRoleCredentials(roleKey);

    const filtered = existing.filter(
      (item) => item.email.toLowerCase() !== email.toLowerCase()
    );

    const updated = [
      {
        email,
        password: encodeVal(password),
        lastUsed: Date.now(),
      },
      ...filtered,
    ];

    await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
  } catch (err) {
    console.error('[savedCredentials mobile] Failed to save credential:', err);
  }
};

/**
 * Removes a saved credential entry for a specific role
 * @param {string} role - 'candidate' | 'recruiter' | 'admin'
 * @param {string} email
 */
export const removeRoleCredential = async (role, email) => {
  if (!email) return;
  try {
    const roleKey = normalizeRoleKey(role);
    const storageKey = STORAGE_PREFIX + roleKey;
    const existing = await getRoleCredentials(roleKey);

    const filtered = existing.filter(
      (item) => item.email.toLowerCase() !== email.toLowerCase()
    );

    await AsyncStorage.setItem(
      storageKey,
      JSON.stringify(
        filtered.map((item) => ({
          email: item.email,
          password: encodeVal(item.password),
          lastUsed: item.lastUsed,
        }))
      )
    );
  } catch (err) {
    console.error('[savedCredentials mobile] Failed to remove credential:', err);
  }
};
