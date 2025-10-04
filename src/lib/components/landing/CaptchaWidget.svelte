<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { dev } from '$app/environment';

  export let token: string = '';

  const dispatch = createEventDispatcher();
  let widgetId: string | null = null;
  let loading = true;

  // Global singleton to track Turnstile loading state
  const TURNSTILE_GLOBAL = '__TURNSTILE_LOADING__';

  onMount(() => {
    // Bypass CAPTCHA in development mode
    if (dev) {
      token = 'dev-bypass-token';
      loading = false;
      dispatch('verify', token);
      return;
    }

    // Initialize Turnstile with proper singleton pattern
    loadAndInitTurnstile();
  });

  async function loadAndInitTurnstile() {
    try {
      // Wait for Turnstile to be ready
      await ensureTurnstileLoaded();

      // Initialize the widget once ready
      initTurnstile();
    } catch (error) {
      console.error('Turnstile loading failed:', error);
      loading = false;
    }
  }

  function ensureTurnstileLoaded(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded and ready
      if (window.turnstile && typeof window.turnstile.render === 'function') {
        resolve();
        return;
      }

      // Check if currently loading
      if (window[TURNSTILE_GLOBAL] === 'loading') {
        // Wait for the loading to complete
        const checkInterval = setInterval(() => {
          if (window.turnstile && typeof window.turnstile.render === 'function') {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);

        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error('Turnstile load timeout'));
        }, 15000);
        return;
      }

      // Mark as loading
      window[TURNSTILE_GLOBAL] = 'loading';

      // Load the script
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        // Poll for turnstile API availability
        const checkInterval = setInterval(() => {
          if (window.turnstile && typeof window.turnstile.render === 'function') {
            clearInterval(checkInterval);
            window[TURNSTILE_GLOBAL] = 'loaded';
            resolve();
          }
        }, 50);

        setTimeout(() => {
          clearInterval(checkInterval);
          window[TURNSTILE_GLOBAL] = 'error';
          reject(new Error('Turnstile API not available after script load'));
        }, 15000);
      };

      script.onerror = () => {
        window[TURNSTILE_GLOBAL] = 'error';
        reject(new Error('Failed to load Turnstile script'));
      };

      document.head.appendChild(script);
    });
  }

  function initTurnstile() {
    if (window.turnstile && window.turnstile.render) {
      try {
        const siteKey = window.ENV?.PUBLIC_CAPTCHA_SITE_KEY || '';

        if (!siteKey) {
          console.error('CAPTCHA site key not found');
          loading = false;
          return;
        }

        widgetId = window.turnstile.render('#captcha-container', {
          sitekey: siteKey,
          callback: (responseToken: string) => {
            token = responseToken;
            loading = false;
            dispatch('verify', responseToken);
          },
          'error-callback': (error: any) => {
            console.error('Turnstile error callback:', error);
            loading = false;
            dispatch('error');
          },
        });
        loading = false;
      } catch (error) {
        console.error('Turnstile initialization error:', error);
        loading = false;
      }
    } else {
      console.error('Turnstile API not available');
      loading = false;
    }
  }
</script>


<div class="mb-5">
  <div
    id="captcha-container"
    class="bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg p-4 min-h-[78px] flex items-center justify-center"
  >
    {#if dev}
      <p class="text-sm text-success-500 dark:text-success-400 flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        CAPTCHA bypassed (dev mode)
      </p>
    {:else if loading}
      <p class="text-sm text-neutral-500 dark:text-neutral-400">Loading CAPTCHA...</p>
    {/if}
  </div>
</div>
