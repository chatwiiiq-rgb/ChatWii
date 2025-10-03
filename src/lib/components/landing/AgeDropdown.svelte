<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let value: number | null = null;

  const dispatch = createEventDispatcher();

  // Generate ages from 18 to 90
  const ages = Array.from({ length: 73 }, (_, i) => i + 18);

  function handleChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    value = target.value ? parseInt(target.value) : null;
    dispatch('change', value);
  }
</script>

<div class="mb-5">
  <label for="age" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
    Age
  </label>
  <select
    id="age"
    bind:value
    on:change={handleChange}
    class="w-full bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg px-4 py-3 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
  >
    <option value="" disabled selected>Select your age</option>
    {#each ages as age}
      <option value={age}>{age}</option>
    {/each}
  </select>
  <p class="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
    You must be 18 or older to use ChatWii
  </p>
</div>

<style>
  select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1.25rem;
    padding-right: 2.5rem;
  }
</style>
