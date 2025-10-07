<script lang="ts">
  import { goto } from '$app/navigation';
  import { getSupabase } from '$lib/supabase';
  import ThemeToggle from '$lib/components/shared/ThemeToggle.svelte';

  let email = '';
  let password = '';
  let isLoading = false;
  let error = '';

  async function handleLogin() {
    if (!email || !password) {
      error = 'Please enter email and password';
      return;
    }

    isLoading = true;
    error = '';

    try {
      const supabase = getSupabase();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        error = authError.message;
        return;
      }

      if (data.user) {
        // Redirect to admin dashboard
        goto('/dashboard-x9k2p7');
      }
    } catch (err) {
      error = 'An unexpected error occurred';
      console.error('Login error:', err);
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Admin Login - ChatWii</title>
</svelte:head>

<div class="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center px-4">
  <div class="absolute top-4 right-4">
    <ThemeToggle />
  </div>

  <div class="w-full max-w-md">
    <div class="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-700 p-8">
      <!-- Logo & Title -->
      <div class="text-center mb-8">
        <img src="/logo/logo.png" alt="ChatWii" class="h-16 w-auto mx-auto mb-4" />
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Admin Login</h1>
        <p class="text-sm text-neutral-600 dark:text-neutral-400">Access the admin dashboard</p>
      </div>

      <!-- Login Form -->
      <form on:submit|preventDefault={handleLogin} class="space-y-6">
        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            bind:value={email}
            placeholder="admin@chatwii.com"
            required
            disabled={isLoading}
            class="w-full px-4 py-3 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent disabled:opacity-50"
          />
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            bind:value={password}
            placeholder="••••••••"
            required
            disabled={isLoading}
            class="w-full px-4 py-3 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent disabled:opacity-50"
          />
        </div>

        <!-- Error Message -->
        {#if error}
          <div class="bg-danger-100 dark:bg-danger-500/20 border border-danger-500 rounded-lg p-4">
            <p class="text-sm text-danger-700 dark:text-danger-400">{error}</p>
          </div>
        {/if}

        <!-- Submit Button -->
        <button
          type="submit"
          disabled={isLoading || !email || !password}
          class="w-full px-6 py-3 bg-secondary-500 text-white rounded-lg font-medium hover:bg-secondary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {#if isLoading}
            <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Logging in...
          {:else}
            Login
          {/if}
        </button>
      </form>

      <!-- Back to Home -->
      <div class="mt-6 text-center">
        <a href="/" class="text-sm text-secondary-500 hover:text-secondary-600 dark:hover:text-secondary-400">
          ← Back to Home
        </a>
      </div>
    </div>
  </div>
</div>
