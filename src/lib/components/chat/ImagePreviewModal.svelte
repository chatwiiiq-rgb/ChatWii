<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let imageFile: File | null = null;
  export let imagePreviewUrl: string = '';

  const dispatch = createEventDispatcher();

  function handleCancel() {
    dispatch('cancel');
  }

  function handleSend() {
    dispatch('send');
  }
</script>

{#if imageFile && imagePreviewUrl}
  <div
    class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    role="dialog"
    aria-modal="true"
  >
    <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
      <!-- Header -->
      <h3 class="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
        Send Image?
      </h3>

      <!-- Image Preview -->
      <div class="mb-6 flex justify-center bg-neutral-100 dark:bg-neutral-900 rounded-lg p-4">
        <img
          src={imagePreviewUrl}
          alt="Preview"
          class="max-w-full max-h-96 rounded-lg object-contain"
        />
      </div>

      <!-- File Info -->
      <div class="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
        <p><span class="font-medium">File:</span> {imageFile.name}</p>
        <p><span class="font-medium">Size:</span> {(imageFile.size / 1024).toFixed(2)} KB</p>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 justify-end">
        <button
          on:click={handleCancel}
          class="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          on:click={handleSend}
          class="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors font-medium"
        >
          Send Image
        </button>
      </div>
    </div>
  </div>
{/if}
