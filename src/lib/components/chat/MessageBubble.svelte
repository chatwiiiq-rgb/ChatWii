<script lang="ts">
  import type { Message } from '$lib/services/messageService';
  import FullscreenImageViewer from './FullscreenImageViewer.svelte';

  export let message: Message;
  export let isSender: boolean;

  let isRevealed = false;
  let showFullscreen = false;

  function formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  function toggleReveal() {
    isRevealed = !isRevealed;
  }

  function openFullscreen() {
    if (isRevealed) {
      showFullscreen = true;
    }
  }

  function closeFullscreen() {
    showFullscreen = false;
  }
</script>

<div class="flex mb-4" class:justify-end={isSender}>
  <div class="max-w-[70%]">
    <!-- Message bubble -->
    <div
      class="rounded-2xl break-words"
      class:bg-secondary-500={isSender && message.message_type === 'text'}
      class:text-white={isSender && message.message_type === 'text'}
      class:bg-white={!isSender && message.message_type === 'text'}
      class:dark:bg-neutral-800={!isSender && message.message_type === 'text'}
      class:text-neutral-900={!isSender && message.message_type === 'text'}
      class:dark:text-white={!isSender && message.message_type === 'text'}
      class:px-4={message.message_type === 'text'}
      class:py-2={message.message_type === 'text'}
      class:p-1={message.message_type === 'image'}
      class:bg-transparent={message.message_type === 'image'}
    >
      {#if message.message_type === 'image'}
        <!-- Image Container (300x300 max) -->
        <div class="relative w-[300px] h-[300px] bg-neutral-100 dark:bg-neutral-900 rounded-xl overflow-hidden">
          <img
            src={message.content}
            alt="Shared image"
            class="w-full h-full object-cover transition-all duration-300"
            class:blur-3xl={!isRevealed}
            class:cursor-pointer={isRevealed}
            loading="lazy"
            on:click={openFullscreen}
            role={isRevealed ? 'button' : undefined}
            tabindex={isRevealed ? 0 : undefined}
          />

          <!-- Reveal/Revert Button -->
          <button
            on:click={toggleReveal}
            class="absolute bottom-2 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 hover:bg-black/80 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {#if isRevealed}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              Revert
            {:else}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Reveal
            {/if}
          </button>
        </div>
      {:else}
        <p class="text-sm">{message.content}</p>
      {/if}
    </div>

    <!-- Time and status -->
    <div class="flex items-center gap-2 mt-1 px-2" class:justify-end={isSender}>
      <span class="text-xs text-neutral-500 dark:text-neutral-400">
        {formatTime(message.created_at)}
      </span>

      {#if isSender}
        <!-- Message status indicator -->
        {#if message.status === 'sending'}
          <svg class="w-3 h-3 text-neutral-400" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        {:else if message.status === 'sent'}
          <svg class="w-3 h-3 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        {:else if message.status === 'delivered'}
          <svg class="w-3 h-3 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        {:else if message.status === 'failed'}
          <svg class="w-3 h-3 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        {/if}
      {/if}
    </div>
  </div>
</div>

<!-- Fullscreen Image Viewer -->
{#if message.message_type === 'image'}
  <FullscreenImageViewer
    imageUrl={message.content}
    show={showFullscreen}
    on:close={closeFullscreen}
  />
{/if}
