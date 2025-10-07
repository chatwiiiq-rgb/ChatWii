<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { imageService } from '$lib/services/imageService';
  import ImagePreviewModal from './ImagePreviewModal.svelte';

  export let userId: string;
  export let disabled = false;

  const dispatch = createEventDispatcher();

  let fileInput: HTMLInputElement;
  let isUploading = false;
  let uploadProgress = 0;
  let error = '';
  let uploadCount = 0;
  let uploadLimit = 20;

  // Preview state
  let selectedFile: File | null = null;
  let previewUrl: string = '';

  // Load current upload count on mount
  async function loadUploadCount() {
    uploadCount = await imageService.getTodayUploadCount(userId);
  }

  $: if (userId) {
    loadUploadCount();
  }

  function handleButtonClick() {
    if (disabled || isUploading) return;
    error = '';
    fileInput.click();
  }

  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Create preview URL
    selectedFile = file;
    previewUrl = URL.createObjectURL(file);
  }

  function handleCancelPreview() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    selectedFile = null;
    previewUrl = '';
    fileInput.value = ''; // Reset input
  }

  async function handleConfirmSend() {
    if (!selectedFile) return;

    error = '';
    isUploading = true;
    uploadProgress = 0;

    try {
      const result = await imageService.uploadImage(userId, selectedFile, (progress) => {
        uploadProgress = progress;
      });

      if (result.success && result.imageUrl) {
        dispatch('upload', { imageUrl: result.imageUrl });
        await loadUploadCount(); // Refresh count
      } else {
        error = result.error || 'Upload failed';
      }
    } catch (err) {
      error = 'An unexpected error occurred';
      console.error('Upload error:', err);
    } finally {
      isUploading = false;
      uploadProgress = 0;
      handleCancelPreview(); // Clean up
    }
  }
</script>

<div class="relative">
  <input
    bind:this={fileInput}
    type="file"
    accept="image/*"
    on:change={handleFileSelect}
    class="hidden"
    disabled={isUploading || disabled}
  />

  <button
    on:click={handleButtonClick}
    disabled={disabled || isUploading || uploadCount >= uploadLimit}
    class="p-1 rounded-lg transition-colors"
    class:hover:bg-neutral-100={!disabled && !isUploading && uploadCount < uploadLimit}
    class:dark:hover:bg-neutral-700={!disabled && !isUploading && uploadCount < uploadLimit}
    class:opacity-50={disabled || uploadCount >= uploadLimit}
    class:cursor-not-allowed={disabled || uploadCount >= uploadLimit}
    title={uploadCount >= uploadLimit ? 'Daily upload limit reached' : 'Upload image'}
  >
    {#if isUploading}
      <svg class="w-5 h-5 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    {:else}
      <svg class="w-5 h-5 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    {/if}
  </button>

  <!-- Upload Progress -->
  {#if isUploading}
    <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs rounded-lg whitespace-nowrap">
      Uploading... {uploadProgress}%
    </div>
  {/if}

  <!-- Upload Count Badge -->
  {#if uploadCount > 0}
    <div class="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
      {uploadCount}
    </div>
  {/if}
</div>

<!-- Error Message -->
{#if error}
  <div class="absolute bottom-full left-0 right-0 mb-2 px-3 py-2 bg-danger-100 dark:bg-danger-500/20 border border-danger-500 text-danger-600 dark:text-danger-400 text-sm rounded-lg">
    {error}
  </div>
{/if}

<!-- Image Preview Modal -->
<ImagePreviewModal
  imageFile={selectedFile}
  imagePreviewUrl={previewUrl}
  isUploading={isUploading}
  on:cancel={handleCancelPreview}
  on:send={handleConfirmSend}
/>
