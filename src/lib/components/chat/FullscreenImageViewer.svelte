<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let imageUrl: string = '';
  export let show: boolean = false;

  const dispatch = createEventDispatcher();

  function handleClose() {
    dispatch('close');
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }
</script>

{#if show && imageUrl}
  <div
    class="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
    on:click={handleBackdropClick}
    role="dialog"
    aria-modal="true"
  >
    <!-- Close Button -->
    <button
      on:click={handleClose}
      class="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
      aria-label="Close"
    >
      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- Image -->
    <img
      src={imageUrl}
      alt="Fullscreen view"
      class="max-w-full max-h-full object-contain"
      on:click|stopPropagation
    />
  </div>
{/if}
