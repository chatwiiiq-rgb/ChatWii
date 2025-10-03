<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { fly } from 'svelte/transition';
  import { browser } from '$app/environment';

  export let show = false;

  const dispatch = createEventDispatcher();
  let pickerElement: HTMLElement;
  let picker: any;
  let isInitialized = false;

  onMount(async () => {
    if (!browser) return;

    // Pre-load the emoji picker library
    try {
      const { Picker } = await import('emoji-picker-element');

      picker = new Picker({
        dataSource: 'https://cdn.jsdelivr.net/npm/emoji-picker-element-data@^1/en/emojibase/data.json',
        locale: 'en',
      });

      // Style the picker for dark/light mode
      picker.classList.add('emoji-picker-custom');

      // Listen for emoji selection
      picker.addEventListener('emoji-click', (event: any) => {
        dispatch('select', event.detail.unicode);
        show = false;
      });

      isInitialized = true;
    } catch (error) {
      console.error('Failed to load emoji picker:', error);
    }
  });

  // Mount/unmount picker based on show state
  $: if (picker && pickerElement && isInitialized) {
    if (show && !pickerElement.contains(picker)) {
      pickerElement.appendChild(picker);
    }
  }

  let clickOutsideTimeout: any;

  function handleClickOutside(event: MouseEvent) {
    // Use timeout to allow the button click to register first
    clearTimeout(clickOutsideTimeout);
    clickOutsideTimeout = setTimeout(() => {
      if (show && pickerElement && !pickerElement.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        // Check if click is on emoji button or inside picker
        if (!target.closest('button[title="Insert emoji"]') && !target.closest('.emoji-picker-custom')) {
          show = false;
        }
      }
    }, 0);
  }

  onDestroy(() => {
    clearTimeout(clickOutsideTimeout);
    if (picker && picker.parentNode) {
      picker.parentNode.removeChild(picker);
    }
  });
</script>

<svelte:window on:click={handleClickOutside} />

{#if show}
  <div
    bind:this={pickerElement}
    transition:fly={{ y: 10, duration: 200 }}
    class="absolute bottom-full left-0 mb-2"
    style="z-index: 9999;"
  >
    <!-- Picker will be mounted here -->
  </div>
{/if}

<style>
  :global(.emoji-picker-custom) {
    --background: white;
    --border-color: #e5e7eb;
    --indicator-color: #8b5cf6;
    --input-border-color: #d1d5db;
    --input-font-color: #111827;
    --input-placeholder-color: #6b7280;
    --outline-color: #8b5cf6;
    --category-font-color: #6b7280;
    --button-hover-background: #f3f4f6;
    --button-active-background: #e5e7eb;
    border-radius: 0.75rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  :global(.dark .emoji-picker-custom) {
    --background: #1f2937;
    --border-color: #374151;
    --indicator-color: #a78bfa;
    --input-border-color: #4b5563;
    --input-font-color: #f9fafb;
    --input-placeholder-color: #9ca3af;
    --outline-color: #a78bfa;
    --category-font-color: #9ca3af;
    --button-hover-background: #374151;
    --button-active-background: #4b5563;
  }
</style>
