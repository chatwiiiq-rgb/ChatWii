<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import MessageBubble from './MessageBubble.svelte';
  import type { Message } from '$lib/services/messageService';
  import { createEventDispatcher } from 'svelte';

  export let messages: Message[] = [];
  export let currentUserId: string;
  export let loading = false;
  export let hasMoreMessages = false;
  export let loadingMore = false;

  const dispatch = createEventDispatcher();

  let messageContainer: HTMLDivElement;
  let shouldAutoScroll = true;
  let previousScrollHeight = 0;

  // Auto-scroll to bottom when new messages arrive
  afterUpdate(() => {
    if (shouldAutoScroll && messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    } else if (previousScrollHeight > 0 && messageContainer) {
      // Maintain scroll position when loading older messages
      const newScrollHeight = messageContainer.scrollHeight;
      const scrollDiff = newScrollHeight - previousScrollHeight;
      messageContainer.scrollTop += scrollDiff;
      previousScrollHeight = 0;
    }
  });

  // Check if user is near bottom of scroll
  function handleScroll() {
    if (!messageContainer) return;

    const { scrollTop, scrollHeight, clientHeight } = messageContainer;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // Enable auto-scroll if user is within 100px of bottom
    shouldAutoScroll = distanceFromBottom < 100;
  }

  function handleLoadMore() {
    if (loadingMore || !hasMoreMessages) return;
    previousScrollHeight = messageContainer.scrollHeight;
    dispatch('loadmore');
  }

  onMount(() => {
    // Scroll to bottom on initial load
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  });
</script>

<div
  bind:this={messageContainer}
  on:scroll={handleScroll}
  class="flex-1 overflow-y-auto p-6 space-y-2"
>
  {#if loading}
    <div class="flex items-center justify-center h-full">
      <div class="text-center">
        <svg class="w-8 h-8 animate-spin mx-auto mb-2 text-secondary-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-sm text-neutral-500 dark:text-neutral-400">Loading messages...</p>
      </div>
    </div>
  {:else if messages.length === 0}
    <div class="flex items-center justify-center h-full">
      <div class="text-center">
        <svg class="w-16 h-16 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p class="text-neutral-500 dark:text-neutral-400">No messages yet</p>
        <p class="text-sm text-neutral-400 dark:text-neutral-500 mt-1">Send a message to start the conversation</p>
      </div>
    </div>
  {:else}
    <!-- Load More Button -->
    {#if hasMoreMessages}
      <div class="flex justify-center pb-4">
        <button
          on:click={handleLoadMore}
          disabled={loadingMore}
          class="px-4 py-2 bg-secondary-500 hover:bg-secondary-600 disabled:bg-neutral-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          {#if loadingMore}
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          {:else}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
            Load Older Messages
          {/if}
        </button>
      </div>
    {/if}

    {#each messages as message (message.id)}
      <MessageBubble
        {message}
        isSender={message.sender_id === currentUserId}
      />
    {/each}
  {/if}
</div>
