<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { validateNickname } from '$lib/utils/validators';
  import { generateRandomNickname } from '$lib/utils/nicknameGenerator';

  export let value: string = '';
  export let error: string = '';

  const dispatch = createEventDispatcher();
  const MAX_LENGTH = 20;

  $: characterCount = value.length;

  function updateValidation() {
    if (value.length > 0) {
      const validation = validateNickname(value);
      error = validation.valid ? '' : (validation.error || '');
    } else {
      error = '';
    }
  }

  function handleInput() {
    updateValidation();
    dispatch('input', value);
  }

  function handleRandomize() {
    value = generateRandomNickname();
    updateValidation();
    dispatch('input', value);
  }
</script>

<div class="mb-5">
  <label for="nickname" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
    Nickname
  </label>
  <div class="relative">
    <input
      id="nickname"
      type="text"
      bind:value
      on:input={handleInput}
      maxlength={MAX_LENGTH}
      placeholder="Enter your nickname"
      class="w-full bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg px-4 py-3 pr-24 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      class:border-danger-500={error}
    />
    <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
      <span class="text-sm text-neutral-500 dark:text-neutral-400">
        {characterCount}/{MAX_LENGTH}
      </span>
      <button
        type="button"
        on:click={handleRandomize}
        class="w-8 h-8 rounded bg-primary-500 hover:bg-primary-300 flex items-center justify-center transition-colors"
        aria-label="Randomize nickname"
        title="Generate random nickname"
      >
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  </div>
  {#if error}
    <p class="mt-2 text-sm text-danger-500 flex items-center gap-1">
      <span>⚠️</span>
      <span>{error}</span>
    </p>
  {/if}
</div>
