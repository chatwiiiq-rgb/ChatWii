<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { dev } from '$app/environment';

  export let token: string = '';

  const dispatch = createEventDispatcher();
  let widgetId: string | null = null;
  let loading = true;

  onMount(() => {
    // Bypass CAPTCHA in development mode
    if (dev) {
      token = 'dev-bypass-token';
      loading = false;
      dispatch('verify', token);
      return;
    }

    // Check if Turnstile is already loaded
    if (window.turnstile) {
      initTurnstile();
      return;
    }

    // Only load script if not already present
    if (!document.querySelector('script[src*="turnstile"]')) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.onload = initTurnstile;
      script.onerror = () => {
        console.error('Failed to load Turnstile script');
        loading = false;
      };
      document.head.appendChild(script);
    } else {
      // Script exists, wait for it to load
      const checkTurnstile = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkTurnstile);
          initTurnstile();
        }
      }, 100);

      setTimeout(() => clearInterval(checkTurnstile), 5000);
    }
  });

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
          'error-callback': () => {
            loading = false;
            dispatch('error');
          },
        });
      } catch (error) {
        console.error('Turnstile initialization error:', error);
        loading = false;
      }
    }
  }
</script>

<svelte:head>
  <script>
    // TypeScript declaration for Turnstile
    window.turnstile = window.turnstile || {};
  </script>
</svelte:head>

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
