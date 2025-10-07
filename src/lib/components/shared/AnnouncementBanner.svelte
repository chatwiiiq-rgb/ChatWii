<script lang="ts">
  import { onMount } from 'svelte';

  let visible = false;
  let message = '';
  let type: 'info' | 'warning' | 'success' | 'error' = 'info';
  let dismissed = false;

  // Color mapping
  const colors = {
    info: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100',
    warning: 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100',
    success: 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100',
    error: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100',
  };

  onMount(async () => {
    // Check if dismissed in session
    if (sessionStorage.getItem('announcement-dismissed')) {
      return;
    }

    try {
      const response = await fetch('/api/announcement');
      const data = await response.json();

      if (data.success && data.enabled && data.message) {
        message = data.message;
        type = data.type || 'info';
        visible = true;
      }
    } catch (err) {
      console.error('Failed to load announcement:', err);
    }
  });

  function dismiss() {
    dismissed = true;
    sessionStorage.setItem('announcement-dismissed', 'true');
    setTimeout(() => {
      visible = false;
    }, 300);
  }
</script>

{#if visible && !dismissed}
  <div
    class="w-full border-b {colors[type]} transition-all duration-300"
    role="alert"
    aria-live="polite"
  >
    <div class="container mx-auto px-4 py-3">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <div class="flex-shrink-0">
            {#if type === 'info'}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            {:else if type === 'warning'}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            {:else if type === 'success'}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            {:else}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            {/if}
          </div>
          <p class="text-sm font-medium flex-1 min-w-0">{message}</p>
        </div>
        <button
          on:click={dismiss}
          class="flex-shrink-0 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
          aria-label="Dismiss announcement"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
{/if}
