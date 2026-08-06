/**
 * Role-Based Saved Login Credentials Utility for Web Application
 * Provides isolated credential storage scoped per user role (candidate, recruiter, admin).
 */

const STORAGE_PREFIX = 'resumeai_saved_credentials_';

/**
 * Encodes string to simple base64 obfuscation for local storage protection
 */
const encodeVal = (str) => {
  try {
    return btoa(encodeURIComponent(str));
  } catch (e) {
    return str;
  }
};

/**
 * Decodes string from base64 obfuscation
 */
const decodeVal = (str) => {
  try {
    return decodeURIComponent(atob(str));
  } catch (e) {
    return str;
  }
};

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
 * Gets all saved credentials for a specific role
 * @param {string} role - 'candidate' | 'recruiter' | 'admin'
 * @returns {Array<{email: string, password: string, lastUsed: number}>}
 */
export const getRoleCredentials = (role) => {
  try {
    const key = STORAGE_PREFIX + normalizeRoleKey(role);
    const dataStr = localStorage.getItem(key);
    if (!dataStr) return [];
    
    const parsed = JSON.parse(dataStr);
    if (!Array.isArray(parsed)) return [];

    return parsed.map(item => ({
      email: item.email || '',
      password: decodeVal(item.password || ''),
      lastUsed: item.lastUsed || Date.now(),
    })).filter(item => item.email && item.password);
  } catch (err) {
    console.error('[savedCredentials] Failed to get saved credentials:', err);
    return [];
  }
};

/**
 * Saves or updates a login credential for a specific role
 * @param {string} role - 'candidate' | 'recruiter' | 'admin'
 * @param {string} email
 * @param {string} password
 */
export const saveRoleCredential = (role, email, password) => {
  if (!email || !password) return;
  try {
    const roleKey = normalizeRoleKey(role);
    const storageKey = STORAGE_PREFIX + roleKey;
    const existing = getRoleCredentials(roleKey);

    // Remove existing entry for the same email if present
    const filtered = existing.filter(
      item => item.email.toLowerCase() !== email.toLowerCase()
    );

    // Add updated credential to top of list
    const updated = [
      {
        email,
        password: encodeVal(password),
        lastUsed: Date.now(),
      },
      ...filtered,
    ];

    localStorage.setItem(storageKey, JSON.stringify(updated));
  } catch (err) {
    console.error('[savedCredentials] Failed to save credential:', err);
  }
};

/**
 * Removes a saved credential for a specific role
 * @param {string} role - 'candidate' | 'recruiter' | 'admin'
 * @param {string} email
 */
export const removeRoleCredential = (role, email) => {
  if (!email) return;
  try {
    const roleKey = normalizeRoleKey(role);
    const storageKey = STORAGE_PREFIX + roleKey;
    const existing = getRoleCredentials(roleKey);

    const filtered = existing.filter(
      item => item.email.toLowerCase() !== email.toLowerCase()
    );

    localStorage.setItem(storageKey, JSON.stringify(filtered.map(item => ({
      email: item.email,
      password: encodeVal(item.password),
      lastUsed: item.lastUsed,
    }))));
  } catch (err) {
    console.error('[savedCredentials] Failed to remove credential:', err);
  }
};
