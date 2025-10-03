<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let reportedUserNickname = '';
  export let show = false;

  const dispatch = createEventDispatcher();

  const reportReasons = [
    { value: 'underage', label: 'Under Age', description: 'User is less than 18 years old' },
    { value: 'abusive', label: 'Abusive Behavior', description: 'Threatening, hateful behavior' },
    { value: 'scam', label: 'Financial Scam', description: 'Attempting fraud or scams' },
    { value: 'spam', label: 'Spam', description: 'Unsolicited spam messages' },
    { value: 'explicit', label: 'Explicit Content', description: 'Inappropriate, explicit content' },
    { value: 'other', label: 'Other', description: 'Specify your reason' },
  ];

  let selectedReason = '';
  let otherDetails = '';
  let isSubmitting = false;
  let error = '';

  function handleClose() {
    if (isSubmitting) return;
    selectedReason = '';
    otherDetails = '';
    error = '';
    show = false;
    dispatch('close');
  }

  async function handleSubmit() {
    error = '';

    if (!selectedReason) {
      error = 'Please select a reason for reporting';
      return;
    }

    if (selectedReason === 'other' && otherDetails.trim().length === 0) {
      error = 'Please provide details for your report';
      return;
    }

    if (selectedReason === 'other' && otherDetails.trim().length > 100) {
      error = 'Details must be 100 characters or less';
      return;
    }

    isSubmitting = true;

    dispatch('submit', {
      reason: selectedReason,
      details: selectedReason === 'other' ? otherDetails.trim() : null,
    });

    // Reset form
    setTimeout(() => {
      selectedReason = '';
      otherDetails = '';
      isSubmitting = false;
    }, 500);
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }
</script>

{#if show}
  <div
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    on:click={handleBackdropClick}
    role="dialog"
    aria-modal="true"
  >
    <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-neutral-900 dark:text-white">Report User</h2>
          <button
            on:click={handleClose}
            class="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <svg class="w-5 h-5 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p class="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Report <span class="font-medium">{reportedUserNickname}</span> for violating our community guidelines
        </p>
      </div>

      <!-- Body -->
      <div class="px-6 py-4">
        <!-- Error message -->
        {#if error}
          <div class="mb-4 px-4 py-3 bg-danger-100 dark:bg-danger-500/20 border border-danger-500 rounded-lg">
            <p class="text-sm text-danger-500">{error}</p>
          </div>
        {/if}

        <!-- Report reasons -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-neutral-900 dark:text-white mb-3">
            Select a reason:
          </label>

          {#each reportReasons as reason}
            <button
              on:click={() => selectedReason = reason.value}
              class="w-full text-left p-4 rounded-lg border-2 transition-all {selectedReason === reason.value ? 'border-warning-500 bg-warning-100 dark:bg-warning-500/20' : 'border-neutral-200 dark:border-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-500'}"
              disabled={isSubmitting}
            >
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0 mt-0.5">
                  <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    class:border-warning-500={selectedReason === reason.value}
                    class:bg-warning-500={selectedReason === reason.value}
                    class:border-neutral-300={selectedReason !== reason.value}
                  >
                    {#if selectedReason === reason.value}
                      <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                    {/if}
                  </div>
                </div>
                <div>
                  <p class="font-medium text-neutral-900 dark:text-white">{reason.label}</p>
                  <p class="text-sm text-neutral-600 dark:text-neutral-400">{reason.description}</p>
                </div>
              </div>
            </button>
          {/each}
        </div>

        <!-- Other details textarea -->
        {#if selectedReason === 'other'}
          <div class="mt-4">
            <label for="other-details" class="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
              Provide details (max 100 characters):
            </label>
            <textarea
              id="other-details"
              bind:value={otherDetails}
              maxlength="100"
              rows="3"
              placeholder="Describe the issue..."
              class="w-full bg-neutral-100 dark:bg-neutral-700 rounded-lg px-4 py-3 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-warning-500 resize-none"
              disabled={isSubmitting}
            ></textarea>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1 text-right">
              {otherDetails.length}/100
            </p>
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-end gap-3">
        <button
          on:click={handleClose}
          class="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          on:click={handleSubmit}
          disabled={!selectedReason || isSubmitting}
          class="px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors"
          class:bg-warning-500={selectedReason && !isSubmitting}
          class:hover:bg-warning-600={selectedReason && !isSubmitting}
          class:bg-neutral-300={!selectedReason || isSubmitting}
          class:dark:bg-neutral-600={!selectedReason || isSubmitting}
          class:cursor-not-allowed={!selectedReason || isSubmitting}
        >
          {#if isSubmitting}
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          {:else}
            Submit Report
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}
