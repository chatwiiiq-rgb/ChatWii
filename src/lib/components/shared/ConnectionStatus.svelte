<script lang="ts">
  import { connectionStore } from '$lib/stores/connectionStore';
  import { slide } from 'svelte/transition';

  $: showBanner = $connectionStore.status !== 'online';
</script>

{#if showBanner}
  <div
    transition:slide={{ duration: 300 }}
    class="fixed top-0 left-0 right-0 z-40 px-4 py-2 text-center text-sm font-medium {$connectionStore.status === 'reconnecting' ? 'bg-warning-500' : 'bg-danger-500'} text-white"
  >
    <div class="flex items-center justify-center gap-2">
      {#if $connectionStore.status === 'reconnecting'}
        <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Reconnecting... (Attempt {$connectionStore.reconnectAttempts})</span>
      {:else}
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m0 12.728V21M18.364 2.636V6" />
        </svg>
        <span>No internet connection. Messages will be sent when you're back online.</span>
      {/if}
    </div>
  </div>
{/if}
