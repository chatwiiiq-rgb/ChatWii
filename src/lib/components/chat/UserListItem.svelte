<script lang="ts">
  import CountryFlag from '$lib/components/shared/CountryFlag.svelte';
  import Avatar from '$lib/components/shared/Avatar.svelte';
  import type { PresenceUser } from '$lib/services/presenceService';

  export let user: PresenceUser;
  export let isSelected = false;
  export let isBlocked = false;
  export let onClick: () => void = () => {};
</script>

<button
  on:click={onClick}
  class="w-full p-3 flex items-center gap-4 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors rounded-lg border border-neutral-200 dark:border-neutral-700"
  class:bg-neutral-200={isSelected}
  class:dark:bg-neutral-600={isSelected}
  class:border-secondary-500={isSelected}
  class:dark:border-secondary-500={isSelected}
  class:opacity-50={isBlocked}
>
  <!-- Avatar with gender ring -->
  <div class="relative">
    <div class="rounded-full p-0.5" class:bg-pink-300={user.gender === 'female'} class:bg-blue-500={user.gender === 'male'}>
      <Avatar gender={user.gender} size="md" />
    </div>
    {#if isBlocked}
      <!-- Ban icon overlay for blocked users -->
      <div class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
        <svg class="w-6 h-6 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      </div>
    {/if}
  </div>

  <!-- User info -->
  <div class="flex-1 text-left">
    <div class="flex items-center gap-2 mb-1">
      <span class="font-medium text-neutral-900 dark:text-white" class:line-through={isBlocked}>{user.nickname}</span>
      {#if isBlocked}
        <span class="text-xs px-2 py-0.5 bg-danger-100 dark:bg-danger-500/20 text-danger-500 rounded-full">Blocked</span>
      {/if}
    </div>
    <div class="flex items-center gap-2 text-xs">
      <span class:text-pink-400={user.gender === 'female'} class:text-blue-500={user.gender === 'male'}>
        {user.gender === 'female' ? 'Female' : 'Male'}
      </span>
      <span class="text-neutral-500 dark:text-neutral-400">•</span>
      <span class="text-neutral-500 dark:text-neutral-400">{user.age}</span>
      <span class="text-neutral-500 dark:text-neutral-400">•</span>
      <CountryFlag countryCode={user.country} size="md" />
    </div>
  </div>
</button>
