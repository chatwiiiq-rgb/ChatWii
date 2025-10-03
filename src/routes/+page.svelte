<script lang="ts">
  import { goto } from '$app/navigation';
  import ThemeToggle from '$lib/components/shared/ThemeToggle.svelte';
  import CountryFlag from '$lib/components/shared/CountryFlag.svelte';
  import NicknameInput from '$lib/components/landing/NicknameInput.svelte';
  import GenderSelection from '$lib/components/landing/GenderSelection.svelte';
  import AgeDropdown from '$lib/components/landing/AgeDropdown.svelte';
  import CaptchaWidget from '$lib/components/landing/CaptchaWidget.svelte';
  import Footer from '$lib/components/shared/Footer.svelte';
  import { AuthService } from '$lib/services/authService';
  import { authStore } from '$lib/stores/authStore';

  let nickname = '';
  let nicknameError = '';
  let gender: 'male' | 'female' | null = null;
  let age: number | null = null;
  let captchaToken = '';
  let detectedCountry = 'ps'; // Palestine (auto-detected via Cloudflare in production)
  let isSubmitting = false;
  let errorMessage = '';

  $: isFormValid = nickname.length >= 3 && !nicknameError && gender && age && age >= 18 && captchaToken && !isSubmitting;

  async function handleStartChat() {
    if (!isFormValid) return;

    isSubmitting = true;
    errorMessage = '';

    try {
      const result = await AuthService.signInAnonymously(
        {
          nickname,
          gender: gender!,
          age: age!,
          country: detectedCountry,
        },
        captchaToken
      );

      if (!result.success) {
        errorMessage = result.error || 'Failed to start chat. Please try again.';
        isSubmitting = false;
        return;
      }

      // Successful sign-in, redirect to chat
      await goto('/chat');
    } catch (error) {
      console.error('Start chat error:', error);
      errorMessage = 'An unexpected error occurred. Please try again.';
      isSubmitting = false;
    }
  }
</script>

<div class="min-h-screen bg-neutral-100 dark:bg-neutral-900">
  <!-- Header -->
  <header class="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 h-16 px-6 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <img src="/logo/logo.png" alt="ChatWii - Anonymous Private Chat Platform" class="h-10 w-auto" />
    </div>
    <nav aria-label="Theme settings">
      <ThemeToggle />
    </nav>
  </header>

  <!-- Main Content -->
  <main class="flex items-center justify-center px-4 py-8">
    <div class="w-full max-w-md bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-10">
      <!-- Title Section -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-neutral-900 dark:text-white mb-2">
          Welcome to ChatWii
        </h1>
        <h2 class="text-2xl font-medium text-secondary-500 mb-2">
          Chat with Strangers
        </h2>
        <p class="text-sm text-neutral-600 dark:text-neutral-400">
          Connect instantly and anonymously with complete privacy!
        </p>
      </div>

      <!-- Form -->
      <form on:submit|preventDefault={handleStartChat} aria-label="Start anonymous chat">
        <!-- Nickname Input -->
        <NicknameInput
          bind:value={nickname}
          bind:error={nicknameError}
        />

        <!-- Gender Selection -->
        <GenderSelection bind:value={gender} />

        <!-- Age Dropdown -->
        <AgeDropdown bind:value={age} />

        <!-- CAPTCHA -->
        <CaptchaWidget
          bind:token={captchaToken}
          on:verify={() => console.log('CAPTCHA verified')}
          on:error={() => console.log('CAPTCHA error')}
        />

        <!-- Error Message -->
        {#if errorMessage}
          <div class="mb-4 p-3 bg-danger-100 border border-danger-500 rounded-lg" role="alert" aria-live="assertive">
            <p class="text-sm text-danger-500 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMessage}</span>
            </p>
          </div>
        {/if}

        <!-- Start Chat Button -->
        <button
          type="submit"
          disabled={!isFormValid}
          aria-label={isSubmitting ? 'Starting chat, please wait' : 'Start anonymous chat'}
          class="w-full py-4 rounded-lg font-medium text-base flex items-center justify-center gap-2 mb-6 transition-all"
          class:bg-neutral-300={!isFormValid}
          class:text-neutral-500={!isFormValid}
          class:cursor-not-allowed={!isFormValid}
          class:bg-secondary-500={isFormValid && !isSubmitting}
          class:hover:bg-secondary-600={isFormValid && !isSubmitting}
          class:text-white={isFormValid}
          class:opacity-75={isSubmitting}
        >
          {#if isSubmitting}
            <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Starting Chat...
          {:else}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Start Chat
          {/if}
        </button>
      </form>

      <!-- Footer Info -->
      <div class="text-center">
        <p class="text-sm text-neutral-600 dark:text-neutral-400 flex items-center justify-center gap-2">
          <CountryFlag countryCode={detectedCountry} size="md" />
          <span>Connecting from Palestine</span>
        </p>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <Footer />
</div>
