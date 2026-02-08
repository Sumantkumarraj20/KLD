/**
 * Shared Utilities: Optimized for Performance & Memory Efficiency (TypeScript)
 */

// --- Formatting Utilities ---
export const formatStars = (stars: number): string => `${stars || 0} ⭐`;

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const diffSecs = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffSecs < 60) return 'Just now';
  const mins = Math.floor(diffSecs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
};

export const formatNumber = (num: number): string =>
  num >= 1000
    ? (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
    : num.toString();

export const truncateText = (text: string, max = 100): string =>
  text.length <= max ? text : text.slice(0, max).trim() + '...';

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

export const formatPercentage = (value: number, decimals = 1): string =>
  `${(value * 100).toFixed(decimals)}%`;

// --- Validation ---
export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPIN = (pin: string): boolean => /^\d{4,6}$/.test(pin);

export const isValidPhoneNumber = (phone: string): boolean =>
  /^\+?1?\d{9,}$/.test(phone.replace(/\D/g, ''));

// --- Storage Manager (Namespaced with TTL support) ---
export interface StorageData {
  val: any;
  exp: number | null;
}

export class StorageManager {
  private ns: string;

  constructor(ns = 'kp_') {
    this.ns = ns;
  }

  set(key: string, val: any, ttl: number | null = null): void {
    if (typeof window === 'undefined') return;

    try {
      const data: StorageData = {
        val,
        exp: ttl ? Date.now() + ttl : null,
      };
      localStorage.setItem(this.ns + key, JSON.stringify(data));
    } catch (e) {
      console.error('Storage Error', e);
    }
  }

  get(key: string): any {
    if (typeof window === 'undefined') return null;

    try {
      const item = localStorage.getItem(this.ns + key);
      if (!item) return null;

      const { val, exp } = JSON.parse(item) as StorageData;
      if (exp && exp < Date.now()) {
        this.remove(key);
        return null;
      }
      return val;
    } catch (e) {
      return null;
    }
  }

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.ns + key);
  }

  clear(): void {
    if (typeof window === 'undefined') return;

    Object.keys(localStorage)
      .filter((k) => k.startsWith(this.ns))
      .forEach((k) => localStorage.removeItem(k));
  }
}

// --- DOM & UI Utilities ---
export interface CreateElementOptions {
  className?: string;
  dataset?: Record<string, string>;
  style?: string;
  onClick?: () => void;
  [key: string]: any;
}

export const createElement = (
  tag: string,
  options: CreateElementOptions = {},
  children: (HTMLElement | string)[] = []
): HTMLElement => {
  const { className, dataset, style, ...attrs } = options;
  const el = document.createElement(tag);

  if (className) el.className = className;
  if (style) el.style.cssText = style;
  if (dataset) Object.assign(el.dataset, dataset);

  Object.entries(attrs).forEach(([key, val]) => {
    if (key.startsWith('on') && typeof val === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), val);
    } else if (val != null) {
      el.setAttribute(key, String(val));
    }
  });

  children.forEach((child) => {
    if (child) {
      el.appendChild(
        typeof child === 'string' ? document.createTextNode(child) : child
      );
    }
  });

  return el;
};

export const showLoading = (btn: HTMLElement | null): void => {
  if (!btn || (btn as any).disabled) return;
  (btn as any).dataset.prev = btn.innerHTML;
  (btn as any).disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Loading...`;
};

export const hideLoading = (btn: HTMLElement | null): void => {
  if (!btn || !(btn as any).dataset.prev) return;
  btn.innerHTML = (btn as any).dataset.prev;
  (btn as any).disabled = false;
};

// --- Console & Debug ---
export const logGroup = (label: string, data: any, color = '#3b82f6'): void => {
  console.log(
    `%c${label}`,
    `color: white; background: ${color}; padding: 4px 8px; border-radius: 3px; font-weight: bold;`,
    data
  );
};

export const logError = (label: string, error: any): void => {
  console.error(`❌ ${label}:`, error);
};

export const logSuccess = (label: string, data?: any): void => {
  console.log(`✅ ${label}`, data || '');
};

// --- Optimized Audio Manager ---
export class AudioManager {
  private synth: SpeechSynthesis;

  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : ({} as any);
  }

  speak(text: string, options: Partial<{ rate: number; pitch: number; volume: number; lang: string }> = {}): void {
    if (typeof window === 'undefined') return;

    this.synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);

    Object.assign(utter, {
      rate: 0.9,
      pitch: 1.1,
      volume: 0.8,
      lang: 'en-US',
      ...options,
    });

    const voices = this.synth.getVoices();
    utter.voice =
      voices.find(
        (v) => v.name.includes('Female') || v.name.includes('Google')
      ) || voices[0];

    this.synth.speak(utter);
  }

  stop(): void {
    if (typeof window !== 'undefined') {
      this.synth.cancel();
    }
  }
}

// --- Visual Effects ---
export const createConfetti = (count = 40): void => {
  if (typeof window === 'undefined') return;

  const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#6A0572', '#118AB2'];

  for (let i = 0; i < count; i++) {
    const el = createElement('div', {
      className: 'confetti',
      style: `
        position: fixed;
        left: ${Math.random() * 100}vw;
        top: -10px;
        width: 10px;
        height: 10px;
        background: ${colors[i % colors.length]};
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
      `,
    });

    document.body.appendChild(el);

    const animation = el.animate(
      [
        { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
        {
          transform: `translateY(${window.innerHeight + 10}px) rotate(720deg)`,
          opacity: '0',
        },
      ],
      {
        duration: 2000 + Math.random() * 2000,
        easing: 'ease-out',
      }
    );

    animation.onfinish = () => el.remove();
  }
};

// --- Flow Control ---
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let waiting = false;
  return (...args: Parameters<T>) => {
    if (!waiting) {
      fn(...args);
      waiting = true;
      setTimeout(() => (waiting = false), limit);
    }
  };
};

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts - 1) {
        await sleep(delayMs * Math.pow(2, attempt));
      }
    }
  }

  throw lastError;
};

// --- Singleton Instances ---
export const storage = new StorageManager();
export const audio = new AudioManager();
