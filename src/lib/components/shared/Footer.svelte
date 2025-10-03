<script lang="ts">
  import { goto } from '$app/navigation';
</script>

<footer class="mt-auto py-8 border-t border-neutral-200 dark:border-neutral-700">
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-center gap-8 mb-4">
      <button
        on:click={() => goto('/about')}
        class="text-sm text-neutral-600 dark:text-neutral-400 hover:text-secondary-500 transition-colors"
      >
        About
      </button>
      <button
        on:click={() => goto('/privacy')}
        class="text-sm text-neutral-600 dark:text-neutral-400 hover:text-secondary-500 transition-colors"
      >
        Privacy Policy
      </button>
      <button
        on:click={() => goto('/safety')}
        class="text-sm text-neutral-600 dark:text-neutral-400 hover:text-secondary-500 transition-colors"
      >
        Safety Guide
      </button>
      <button
        on:click={() => goto('/how-it-works')}
        class="text-sm text-neutral-600 dark:text-neutral-400 hover:text-secondary-500 transition-colors"
      >
        How It Works
      </button>
    </div>
    <p class="text-center text-xs text-neutral-400 dark:text-neutral-600">
      © 2025 ChatWii. Anonymous chat platform trusted worldwide.
    </p>
  </div>
</footer>
