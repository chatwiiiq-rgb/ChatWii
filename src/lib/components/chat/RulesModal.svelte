<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let show = false;

  const dispatch = createEventDispatcher();

  function handleAccept() {
    dispatch('accept');
  }

  function handleDecline() {
    dispatch('decline');
  }
</script>

{#if show}
  <div
    class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    role="dialog"
    aria-modal="true"
  >
    <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="px-6 py-5 border-b border-neutral-200 dark:border-neutral-700 bg-gradient-to-r from-primary-500 to-secondary-500">
        <div class="flex items-center gap-3">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div>
            <h2 class="text-2xl font-bold text-white">Community Guidelines</h2>
            <p class="text-sm text-white/90">Please read and accept our rules</p>
          </div>
        </div>
      </div>

      <!-- Body -->
      <div class="px-6 py-6">
        <div class="space-y-5">
          <!-- Introduction -->
          <div class="bg-primary-50 dark:bg-primary-500/10 rounded-lg p-4 border-l-4 border-primary-500">
            <p class="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              Welcome to ChatWii! To ensure a safe and respectful environment for everyone, please review and accept our community guidelines before continuing.
            </p>
          </div>

          <!-- Rules List -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Community Rules
            </h3>

            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-bold mt-0.5">
                  1
                </div>
                <div>
                  <p class="font-medium text-neutral-900 dark:text-white">Be Respectful</p>
                  <p class="text-sm text-neutral-600 dark:text-neutral-400">Treat others with kindness and respect. No harassment, hate speech, or abusive behavior.</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-bold mt-0.5">
                  2
                </div>
                <div>
                  <p class="font-medium text-neutral-900 dark:text-white">No Explicit Content</p>
                  <p class="text-sm text-neutral-600 dark:text-neutral-400">Do not share inappropriate, explicit, or NSFW content of any kind.</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-bold mt-0.5">
                  3
                </div>
                <div>
                  <p class="font-medium text-neutral-900 dark:text-white">No Spam or Scams</p>
                  <p class="text-sm text-neutral-600 dark:text-neutral-400">Do not send spam, advertisements, or attempt financial scams.</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-bold mt-0.5">
                  4
                </div>
                <div>
                  <p class="font-medium text-neutral-900 dark:text-white">Protect Privacy</p>
                  <p class="text-sm text-neutral-600 dark:text-neutral-400">Do not share personal information (addresses, phone numbers, etc.) publicly.</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-bold mt-0.5">
                  5
                </div>
                <div>
                  <p class="font-medium text-neutral-900 dark:text-white">Report Violations</p>
                  <p class="text-sm text-neutral-600 dark:text-neutral-400">If you encounter inappropriate behavior, use the report function.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Age Restriction Warning -->
          <div class="bg-danger-50 dark:bg-danger-500/10 rounded-lg p-4 border-l-4 border-danger-500">
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-danger-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p class="font-semibold text-danger-600 dark:text-danger-400">Age Restriction</p>
                <p class="text-sm text-danger-600 dark:text-danger-400 mt-1">
                  You must be 18 years or older to use this service. By accepting, you confirm that you meet the age requirement.
                </p>
              </div>
            </div>
          </div>

          <!-- Consequences -->
          <div class="bg-warning-50 dark:bg-warning-500/10 rounded-lg p-4">
            <p class="text-sm text-neutral-700 dark:text-neutral-300">
              <span class="font-semibold">Violations may result in:</span> warnings, temporary restrictions, or permanent account suspension.
            </p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-end gap-3">
        <button
          on:click={handleDecline}
          class="px-6 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
        >
          Decline & Leave
        </button>
        <button
          on:click={handleAccept}
          class="px-6 py-2.5 text-sm font-medium text-white bg-success-500 hover:bg-success-600 rounded-lg transition-colors shadow-lg shadow-success-500/30"
        >
          Accept & Continue
        </button>
      </div>
    </div>
  </div>
{/if}