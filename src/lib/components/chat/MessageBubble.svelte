<script lang="ts">
  import type { Message } from '$lib/services/messageService';

  export let message: Message;
  export let isSender: boolean;

  function formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
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
        <img
          src={message.content}
          alt="Shared image"
          class="rounded-xl max-w-full h-auto max-h-96 object-contain"
          loading="lazy"
        />
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
