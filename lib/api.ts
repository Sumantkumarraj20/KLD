/**
 * Optimized API Client for Google Apps Script Backend (TypeScript)
 * Features: Request Deduplication, Smart Caching, Robust HTML-JSON Parsing
 */

const API_URL =
  'https://script.google.com/macros/s/AKfycbxkO1oVgUufo1rLNObr5kPPJZ2tvOFt6oV32iVBrbxcJgJJJTXddXh6oBdWXUkwuEen/exec';
const CACHE_DURATION = 30000;

// Mapping for JSONP Fallback
const PATH_TO_FUNCTION: Record<string, string> = {
  'kids-with-details': 'getKidsAndBalances',
  rewards: 'getRewards',
  users: 'getUsers',
  stats: 'getSystemStats',
  activity: 'getPeriodStats',
};

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

interface RequestOptions {
  method?: string;
  body?: Record<string, unknown>;
}

interface ApiResponse {
  success?: boolean;
  status?: string;
  data?: unknown;
  message?: string;
}

declare global {
  interface Window {
    [key: string]: any;
  }
}

class KidsPointsAPI {
  private cache: Map<string, CacheEntry> = new Map();
  private pendingRequests: Map<string, Promise<unknown>> = new Map();

  /**
   * Performance optimization: Prevents "Double-Fire" requests.
   * If a request is already in progress, return the existing promise.
   */
  private async deduplicatedRequest(
    cacheKey: string,
    requestFn: () => Promise<unknown>
  ): Promise<unknown> {
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }

    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(cacheKey);
    });

    this.pendingRequests.set(cacheKey, promise);
    return promise;
  }

  /**
   * Universal fetch handler optimized for GAS Redirects and CORS
   */
  async request(path: string, options: RequestOptions = {}): Promise<unknown> {
    const isGet = !options.method || options.method === 'GET';
    const cacheKey = `${path}:${JSON.stringify(options.body || {})}`;

    // 1. Memory Cache Check
    if (isGet) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('💾 API Cache HIT:', path);
        return cached.data;
      }
    }

    // 2. Request Deduplication
    return this.deduplicatedRequest(cacheKey, async () => {
      try {
        const url = `${API_URL}?path=${path}`;
        console.log('🌐 API Request:', path, 'URL:', url);

        const response = await fetch(url, {
          method: options.method || 'GET',
          mode: 'cors',
          body: options.body ? JSON.stringify(options.body) : null,
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const text = await response.text();
        console.log('📨 Raw Response (first 200 chars):', text.substring(0, 200));

        let result: any = this._robustParse(text);
        console.log('✅ Parsed Result:', result);

        // 3. Fallback to JSONP if parse failed
        if (!result && isGet && PATH_TO_FUNCTION[path]) {
          console.log(
            '⚠️ Parse failed, attempting JSONP:',
            PATH_TO_FUNCTION[path]
          );
          result = (await this.jsonpRequest(PATH_TO_FUNCTION[path], options.body)) as unknown;
          console.log('🔔 JSONP Result:', result);
        }

        if (!result) throw new Error('Could not resolve API response');

        // Validate Result
        const apiResponse: ApiResponse | null = result as ApiResponse;
        if (apiResponse?.success || apiResponse?.status === 'success') {
          const finalData = apiResponse.data || apiResponse;
          if (isGet)
            this.cache.set(cacheKey, {
              data: finalData,
              timestamp: Date.now(),
            });
          return finalData;
        }

        throw new Error(apiResponse.message || 'Unknown API Error');
      } catch (error) {
        // Final attempt: JSONP on Network Failure
        if (isGet && PATH_TO_FUNCTION[path]) {
          console.log(
            '🆘 Fetch failed, final JSONP attempt:',
            error instanceof Error ? error.message : String(error)
          );
          return this.jsonpRequest(PATH_TO_FUNCTION[path], options.body);
        }
        throw error;
      }
    });
  }

  /**
   * Scrapes JSON from GAS HTML wrappers or raw strings
   */
  private _robustParse(text: string): ApiResponse | null {
    try {
      // Direct JSON
      if (text.trim().startsWith('{')) return JSON.parse(text);

      // Scrape from <pre> tags or responseData variables
      const match =
        text.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i) ||
        text.match(/responseData\s*=\s*(\{[\s\S]*?\})\s*;/i);

      return match ? JSON.parse(match[1]) : null;
    } catch {
      return null;
    }
  }

  /**
   * JSONP Fallback: Uses script injection to bypass CORS
   */
  private jsonpRequest(
    functionName: string,
    data: Record<string, unknown> = {}
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const cb = `jsonp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const script = document.createElement('script');
      const url = `${API_URL}?callback=${cb}&function=${functionName}&data=${encodeURIComponent(JSON.stringify(data))}`;

      window[cb] = (res: unknown) => {
        delete window[cb];
        script.remove();
        resolve(res);
      };

      script.onerror = () => {
        delete window[cb];
        script.remove();
        reject(new Error('JSONP Failed'));
      };

      script.src = url;
      document.body.appendChild(script);

      setTimeout(() => {
        if (window[cb]) reject(new Error('Timeout'));
      }, 15000);
    });
  }

  /* --- API Methods --- */

  async getKids(): Promise<unknown> {
    return this.request('kids-with-details');
  }

  async getRewards(): Promise<unknown> {
    return this.request('rewards');
  }

  async getUsers(): Promise<unknown> {
    return this.request('users');
  }

  async authenticate(userId: string, pin: string): Promise<unknown> {
    return this.request('api/auth', { method: 'POST', body: { userId, pin } });
  }

  async awardPoints(
    kidId: string,
    points: number,
    reason: string,
    actorId = 'parent'
  ): Promise<unknown> {
    return this.request('api/points', {
      method: 'POST',
      body: {
        kid_id: kidId,
        points: Math.abs(points),
        reason,
        action: 'ADD',
        actor_id: actorId,
      },
    });
  }

  async deductPoints(
    kidId: string,
    points: number,
    reason: string,
    actorId = 'parent'
  ): Promise<unknown> {
    return this.request('api/points', {
      method: 'POST',
      body: {
        kid_id: kidId,
        points: -Math.abs(points),
        reason,
        action: 'DEDUCT',
        actor_id: actorId,
      },
    });
  }

  async redeemReward(kid_id: string, reward_id: string): Promise<unknown> {
    return this.request('api/redeem', {
      method: 'POST',
      body: { kid_id, reward_id },
    });
  }

  async getStats(): Promise<unknown> {
    return this.request('stats');
  }

  async getActivity(period = 'weekly'): Promise<unknown> {
    return this.request('activity', {
      method: 'POST',
      body: { period },
    });
  }

  async claimDailyBonus(kid_id: string): Promise<unknown> {
    return this.request('api/daily-bonus', {
      method: 'POST',
      body: { kid_id },
    });
  }

  async checkDailyBonus(kid_id: string): Promise<unknown> {
    return this.request('api/daily-bonus-check', {
      method: 'POST',
      body: { kid_id },
    });
  }

  // Stub methods for optional features
  async exportData(sheetName: string): Promise<unknown> {
    console.warn('exportData not implemented');
    return { success: false, message: 'Not available' };
  }

  async createBackup(): Promise<unknown> {
    console.warn('createBackup not implemented');
    return { success: false, message: 'Not available' };
  }

  async validateData(): Promise<unknown> {
    console.warn('validateData not implemented');
    return { valid: true };
  }
}

export const api = new KidsPointsAPI();
export default api;
