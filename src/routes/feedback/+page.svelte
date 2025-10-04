<script lang="ts">
  import { goto } from '$app/navigation';
  import ThemeToggle from '$lib/components/shared/ThemeToggle.svelte';

  let email = '';
  let message = '';
  let isSubmitting = false;
  let error = '';
  let success = false;
  let rateLimited = false;

  $: characterCount = message.length;
  $: remainingChars = 400 - characterCount;

  async function handleSubmit() {
    if (!message.trim() || isSubmitting) return;

    error = '';
    success = false;
    rateLimited = false;
    isSubmitting = true;

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim() || null,
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.rateLimited) {
          rateLimited = true;
          error = data.error || 'Please wait a few hours before submitting again';
        } else {
          error = data.error || 'Failed to submit feedback';
        }
        return;
      }

      success = true;
      message = '';
      email = '';

      // Redirect to home after 2 seconds
      setTimeout(() => {
        goto('/');
      }, 2000);
    } catch (err) {
      error = 'An unexpected error occurred. Please try again.';
      console.error('Feedback error:', err);
    } finally {
      isSubmitting = false;
    }
  }

  function handleSkip() {
    goto('/');
  }
</script>

<svelte:head>
  <title>Send Feedback - ChatWii | Help Us Improve</title>
  <meta name="description" content="Share your feedback to help improve ChatWii. Your suggestions and comments help us create a better anonymous chat experience for everyone." />
</svelte:head>

<div class="min-h-screen bg-neutral-100 dark:bg-neutral-900">
  <!-- Header -->
  <header class="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between">
    <div class="flex items-center gap-2 sm:gap-3">
      <img src="/logo/logo.png" alt="ChatWii" class="h-8 sm:h-10 w-auto" />
    </div>
    <ThemeToggle />
  </header>

  <!-- Main Content -->
  <main class="flex items-center justify-center px-4 py-6 sm:py-8">
    <div class="w-full max-w-lg">
      <div class="bg-white dark:bg-neutral-800 rounded-xl sm:rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-6 sm:p-8">
        <!-- Header -->
        <div class="text-center mb-6 sm:mb-8">
          <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Share Your Feedback
          </h1>
          <p class="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
            Help us improve ChatWii. Your feedback matters!
          </p>
        </div>

        {#if success}
          <!-- Success Message -->
          <div class="bg-success-100 dark:bg-success-500/20 border border-success-500 rounded-lg p-4 mb-6">
            <div class="flex items-center gap-3">
              <svg class="w-6 h-6 text-success-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p class="font-medium text-success-700 dark:text-success-400">Thank you for your feedback!</p>
                <p class="text-sm text-success-600 dark:text-success-500">Redirecting to home...</p>
              </div>
            </div>
          </div>
        {:else}
          <!-- Form -->
          <form on:submit|preventDefault={handleSubmit} class="space-y-6">
            <!-- Email (Optional) -->
            <div>
              <label for="email" class="block text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Email Address <span class="text-neutral-500 dark:text-neutral-400">(optional)</span>
              </label>
              <input
                id="email"
                type="email"
                bind:value={email}
                placeholder="your@email.com"
                disabled={isSubmitting}
                class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-colors"
              />
            </div>

            <!-- Message -->
            <div>
              <label for="message" class="block text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Your Feedback <span class="text-danger-500">*</span>
              </label>
              <textarea
                id="message"
                bind:value={message}
                placeholder="Tell us what you think..."
                rows="6"
                maxlength="400"
                disabled={isSubmitting}
                required
                class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent resize-none transition-colors"
              ></textarea>
              <div class="flex justify-between items-center mt-2">
                <span class="text-xs text-neutral-500 dark:text-neutral-400">
                  Maximum 400 characters
                </span>
                <span
                  class="text-sm font-medium"
                  class:text-danger-500={remainingChars < 50}
                  class:text-warning-500={remainingChars >= 50 && remainingChars < 100}
                  class:text-neutral-600={remainingChars >= 100}
                  class:dark:text-neutral-400={remainingChars >= 100}
                >
                  {remainingChars} remaining
                </span>
              </div>
            </div>

            <!-- Error Message -->
            {#if error}
              <div class="bg-danger-100 dark:bg-danger-500/20 border border-danger-500 rounded-lg p-4">
                <div class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-danger-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="text-sm text-danger-700 dark:text-danger-400">{error}</p>
                </div>
              </div>
            {/if}

            <!-- Buttons -->
            <div class="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                on:click={handleSkip}
                disabled={isSubmitting}
                class="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Skip & Go Home
              </button>
              <button
                type="submit"
                disabled={!message.trim() || isSubmitting || rateLimited}
                class="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-secondary-500 text-white rounded-lg font-medium hover:bg-secondary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {#if isSubmitting}
                  <svg class="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                {:else}
                  Submit Feedback
                {/if}
              </button>
            </div>
          </form>
        {/if}
      </div>

      <!-- Additional Info -->
      <div class="text-center mt-6 space-y-2">
        <p class="text-sm text-neutral-600 dark:text-neutral-400">
          You can submit feedback once every 3 hours
        </p>
        <p class="text-sm text-neutral-600 dark:text-neutral-400">
          If the feedback form doesn't work, you can email us directly at{' '}
          <a href="mailto:support@chatwii.com" class="text-secondary-500 hover:text-secondary-600 dark:hover:text-secondary-400 underline font-medium">
            support@chatwii.com
          </a>
        </p>
      </div>
    </div>
  </main>
</div>
