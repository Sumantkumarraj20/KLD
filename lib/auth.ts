import { api } from './api';

/**
 * Robust Authentication & Session Manager (TypeScript)
 * Optimized for dual-role access (Parent/Kid) and persistence
 */

const STORAGE_KEY = 'kids_points_auth';
const SESSION_TTL = 30 * 60 * 1000; // 30 Minute Session

export interface User {
  id: string;
  role: 'parent' | 'admin' | 'kid';
  name: string;
  emoji?: string;
  type: 'staff' | 'user';
}

export interface AuthState {
  user: User | null;
  lastActivity: number;
  isInitialized: boolean;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: User;
}

export interface ApiAuthResponse {
  success?: boolean;
  status?: string;
  role?: string;
  name?: string;
  message?: string;
}

class AuthManager {
  private state: AuthState = {
    user: null,
    lastActivity: Date.now(),
    isInitialized: false,
  };

  constructor() {
    this._init();
  }

  /**
   * Initialize session from storage and setup listeners
   */
  private _init(): void {
    this._loadSession();
    this._setupIdleTracker();
    this.state.isInitialized = true;
  }

  /**
   * Track user movement to extend the session automatically
   */
  private _setupIdleTracker(): void {
    const resetTimer = (): void => {
      if (this.state.user) {
        this.state.lastActivity = Date.now();
        this._persist();
      }
    };

    if (typeof window !== 'undefined') {
      ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach((type) =>
        document.addEventListener(type, resetTimer, { passive: true })
      );

      // Precise session reaper (Checks every 30s)
      setInterval(() => this._checkExpiry(), 30000);
    }
  }

  private _checkExpiry(): void {
    if (this.state.user && Date.now() - this.state.lastActivity > SESSION_TTL) {
      this.logout();
    }
  }

  /**
   * AUTHENTICATION: Parent/Admin (Dynamic PIN via API)
   */
  async loginAsParent(userId: string, pin: string): Promise<AuthResponse> {
    try {
      const response = (await api.authenticate(userId, pin)) as ApiAuthResponse;

      if (response.success || response.status === 'success') {
        this.state.user = {
          id: userId,
          role: (response.role as 'parent' | 'admin') || 'parent',
          name: response.name || 'Parent',
          type: 'staff',
        };
        this.state.lastActivity = Date.now();
        this._persist();
        return { success: true };
      }
      return {
        success: false,
        error: response.message || 'Invalid PIN',
      };
    } catch (err) {
      return {
        success: false,
        error: 'Connection to security server failed',
      };
    }
  }

  /**
   * AUTHENTICATION: Kid (Selection-based)
   */
  loginAsKid(kid: any): AuthResponse {
    this.state.user = {
      id: kid.kid_id,
      role: 'kid',
      name: kid.name,
      emoji: kid.emoji,
      type: 'user',
    };
    this.state.lastActivity = Date.now();
    this._persist();
    return { success: true, user: this.state.user };
  }

  /**
   * SESSION PERSISTENCE
   */
  private _persist(): void {
    if (typeof window === 'undefined') return;

    try {
      const payload = {
        user: this.state.user,
        lastActivity: this.state.lastActivity,
        expiresAt: this.state.lastActivity + SESSION_TTL,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Session storage failed', e);
    }
  }

  private _loadSession(): void {
    if (typeof window === 'undefined') return;

    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (data && data.expiresAt > Date.now()) {
        this.state.user = data.user;
        this.state.lastActivity = data.lastActivity;
      } else {
        // Clear any stale session silently
        this.state.user = null;
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      // If parsing fails, clear stored session without redirecting
      this.state.user = null;
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  /**
   * LOGOUT & REDIRECT
   */
  logout(showToast = false): void {
    const wasParent = this.isParent();
    this.state.user = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);

      if (showToast) this._renderTimeoutUI();

      // Smart Redirect
      const target = wasParent ? '/parent' : '/';
      if (window.location.pathname !== target) {
        window.location.href = target;
      }
    }
  }

  /* --- Role Checkers (Optimized for performance) --- */

  isAuthenticated(): boolean {
    return !!this.state.user;
  }

  isParent(): boolean {
    return ['parent', 'admin'].includes(this.state.user?.role || '');
  }

  isKid(): boolean {
    return this.state.user?.role === 'kid';
  }

  getUser(): User | null {
    return this.state.user;
  }

  private _renderTimeoutUI(): void {
    if (typeof document === 'undefined') return;

    const toast = document.createElement('div');
    toast.className = 'toast toast-warning';
    toast.innerHTML = `
      <strong>Session Expired</strong>
      <p>Security timeout reached.</p>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }
}

export const auth = new AuthManager();
export default auth;
