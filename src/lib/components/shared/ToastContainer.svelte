<script lang="ts">
  import { toastStore } from '$lib/stores/toastStore';
  import { fly } from 'svelte/transition';

  function getToastIcon(type: string) {
    switch (type) {
      case 'success':
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />`;
      case 'error':
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />`;
      case 'warning':
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />`;
      default: // info
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />`;
    }
  }

  function getToastStyles(type: string) {
    switch (type) {
      case 'success':
        return 'bg-success-100 dark:bg-success-500/20 border-success-500 text-success-700 dark:text-success-400';
      case 'error':
        return 'bg-danger-100 dark:bg-danger-500/20 border-danger-500 text-danger-700 dark:text-danger-400';
      case 'warning':
        return 'bg-warning-100 dark:bg-warning-500/20 border-warning-500 text-warning-700 dark:text-warning-400';
      default: // info
        return 'bg-primary-100 dark:bg-primary-500/20 border-primary-500 text-primary-700 dark:text-primary-400';
    }
  }
</script>

<div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
  {#each $toastStore as toast (toast.id)}
    <div
      transition:fly={{ x: 300, duration: 300 }}
      class="pointer-events-auto border-l-4 rounded-lg shadow-lg p-4 {getToastStyles(toast.type)}"
    >
      <div class="flex items-start gap-3">
        <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {@html getToastIcon(toast.type)}
        </svg>
        <div class="flex-1">
          <p class="text-sm font-medium">{toast.message}</p>
        </div>
        <button
          on:click={() => toastStore.dismiss(toast.id)}
          class="flex-shrink-0 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  {/each}
</div>
