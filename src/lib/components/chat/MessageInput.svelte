<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import ImageUploadButton from './ImageUploadButton.svelte';
  import EmojiPicker from './EmojiPicker.svelte';

  export let disabled = false;
  export let messageCount = 0;
  export let rateLimit = 25;
  export let userId: string;

  const dispatch = createEventDispatcher();
  const MAX_LENGTH = 160;

  let message = '';
  let isSending = false;
  let showEmojiPicker = false;
  let textareaElement: HTMLTextAreaElement;

  $: characterCount = message.length;
  $: remainingChars = MAX_LENGTH - characterCount;
  $: rateLimitPercent = (messageCount / rateLimit) * 100;
  $: isRateLimited = messageCount >= rateLimit;

  // Color based on rate limit
  $: rateLimitColor =
    rateLimitPercent >= 95 ? 'text-danger-500' :
    rateLimitPercent >= 85 ? 'text-warning-500' :
    rateLimitPercent >= 70 ? 'text-primary-500' :
    'text-success-500';

  async function handleSubmit() {
    if (!message.trim() || isSending || disabled || isRateLimited) return;

    isSending = true;
    dispatch('send', message.trim());

    // Clear input after sending
    message = '';
    isSending = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleImageUpload(event: CustomEvent<{ imageUrl: string }>) {
    dispatch('image', event.detail.imageUrl);
  }

  function handleEmojiSelect(event: CustomEvent<string>) {
    const emoji = event.detail;

    // Insert emoji at cursor position
    if (textareaElement) {
      const start = textareaElement.selectionStart;
      const end = textareaElement.selectionEnd;
      const before = message.substring(0, start);
      const after = message.substring(end);

      message = before + emoji + after;

      // Set cursor position after emoji
      setTimeout(() => {
        const newPosition = start + emoji.length;
        textareaElement.setSelectionRange(newPosition, newPosition);
        textareaElement.focus();
      }, 0);
    } else {
      message += emoji;
    }
  }

  function toggleEmojiPicker() {
    showEmojiPicker = !showEmojiPicker;
  }
</script>

<div class="bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700">
  <!-- Rate limit warning -->
  {#if isRateLimited}
    <div class="px-6 py-2 bg-danger-100 dark:bg-danger-500/20 border-b border-danger-500">
      <p class="text-sm text-danger-500 flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>Slow down! Maximum {rateLimit} messages per minute. Please wait.</span>
      </p>
    </div>
  {/if}

  <!-- Input area -->
  <div class="px-6 py-4">
    <div class="flex items-start gap-3">
      <!-- Text input with icons inside -->
      <div class="flex-1 relative">
        <!-- Emoji picker button (left inside input) -->
        <div class="absolute left-3 top-1/2 -translate-y-1/2 z-10">
          <button
            on:click={toggleEmojiPicker}
            disabled={disabled || isRateLimited}
            class="p-1 rounded-lg transition-colors"
            class:hover:bg-neutral-200={!disabled && !isRateLimited}
            class:dark:hover:bg-neutral-600={!disabled && !isRateLimited}
            class:opacity-50={disabled || isRateLimited}
            class:cursor-not-allowed={disabled || isRateLimited}
            title="Insert emoji"
          >
            <svg class="w-5 h-5 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <EmojiPicker bind:show={showEmojiPicker} on:select={handleEmojiSelect} />
        </div>

        <!-- Image upload button (right inside input) -->
        <div class="absolute right-3 top-3 z-10">
          <ImageUploadButton {userId} disabled={disabled || isRateLimited} on:upload={handleImageUpload} />
        </div>

        <textarea
          bind:this={textareaElement}
          bind:value={message}
          on:keydown={handleKeydown}
          {disabled}
          placeholder="Type a message..."
          rows="1"
          maxlength={MAX_LENGTH}
          class="w-full bg-neutral-100 dark:bg-neutral-700 rounded-lg pl-12 pr-20 py-3 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-secondary-500 resize-none"
          class:opacity-50={disabled || isRateLimited}
          class:cursor-not-allowed={disabled || isRateLimited}
        ></textarea>
      </div>

      <!-- Send button with character count and photo counter below -->
      <div class="flex flex-col items-center gap-2">
        <button
          on:click={handleSubmit}
          disabled={!message.trim() || isSending || disabled || isRateLimited}
          class="h-12 w-12 rounded-lg flex items-center justify-center transition-colors"
          class:bg-secondary-500={message.trim() && !isSending && !disabled && !isRateLimited}
          class:hover:bg-secondary-600={message.trim() && !isSending && !disabled && !isRateLimited}
          class:bg-neutral-300={!message.trim() || isSending || disabled || isRateLimited}
          class:dark:bg-neutral-600={!message.trim() || isSending || disabled || isRateLimited}
          class:cursor-not-allowed={!message.trim() || isSending || disabled || isRateLimited}
        >
          {#if isSending}
            <svg class="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          {:else}
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          {/if}
        </button>

        <!-- Character counter -->
        <span class="text-xs" class:text-danger-500={remainingChars < 10} class:text-neutral-500={remainingChars >= 10} class:dark:text-neutral-400={remainingChars >= 10}>
          {remainingChars}/{MAX_LENGTH}
        </span>
      </div>
    </div>
  </div>
</div>
