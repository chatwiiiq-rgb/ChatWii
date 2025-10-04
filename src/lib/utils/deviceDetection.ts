/**
 * Device Detection Utilities
 * Detects mobile devices, tablets, and screen sizes
 */

import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  userAgent: string;
}

// Breakpoints (matching Tailwind defaults)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Detect if device is mobile based on user agent
 */
export function isMobileUserAgent(userAgent: string): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
}

/**
 * Detect if device is tablet based on user agent
 */
export function isTabletUserAgent(userAgent: string): boolean {
  return /iPad|Android(?!.*Mobile)|Tablet/i.test(userAgent);
}

/**
 * Create device info store that updates on resize
 */
function createDeviceStore() {
  const getDeviceInfo = (): DeviceInfo => {
    if (!browser) {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenWidth: 1920,
        screenHeight: 1080,
        userAgent: '',
      };
    }

    const userAgent = navigator.userAgent;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Check user agent first
    const mobileUA = isMobileUserAgent(userAgent);
    const tabletUA = isTabletUserAgent(userAgent);

    // Combine user agent and screen size detection
    const isMobile = mobileUA || (screenWidth < BREAKPOINTS.md && !tabletUA);
    const isTablet = tabletUA || (screenWidth >= BREAKPOINTS.md && screenWidth < BREAKPOINTS.lg);
    const isDesktop = !isMobile && !isTablet;

    return {
      isMobile,
      isTablet,
      isDesktop,
      screenWidth,
      screenHeight,
      userAgent,
    };
  };

  const { subscribe, set } = writable<DeviceInfo>(getDeviceInfo());

  // Update on resize
  if (browser) {
    let resizeTimeout: number;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        set(getDeviceInfo());
      }, 150); // Debounce resize events
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    if (typeof window !== 'undefined') {
      const originalOnDestroy = window.onbeforeunload;
      window.onbeforeunload = () => {
        window.removeEventListener('resize', handleResize);
        if (originalOnDestroy) originalOnDestroy.call(window);
      };
    }
  }

  return {
    subscribe,
    refresh: () => set(getDeviceInfo()),
  };
}

// Export device store
export const deviceInfo = createDeviceStore();

// Derived stores for convenience
export const isMobile = derived(deviceInfo, ($device) => $device.isMobile);
export const isTablet = derived(deviceInfo, ($device) => $device.isTablet);
export const isDesktop = derived(deviceInfo, ($device) => $device.isDesktop);
export const screenWidth = derived(deviceInfo, ($device) => $device.screenWidth);

/**
 * Check if screen width matches a breakpoint
 */
export function isBreakpoint(breakpoint: keyof typeof BREAKPOINTS): boolean {
  if (!browser) return false;
  return window.innerWidth >= BREAKPOINTS[breakpoint];
}

/**
 * Get responsive class based on device type
 */
export function getResponsiveClass(mobileClass: string, desktopClass: string, tabletClass?: string): string {
  const device = browser ? deviceInfo : null;
  if (!device) return desktopClass;

  // This is a helper - actual usage should be with Svelte stores in components
  return mobileClass; // Default fallback
}
