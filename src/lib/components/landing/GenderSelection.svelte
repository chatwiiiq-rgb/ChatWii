<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let value: 'male' | 'female' | null = null;

  const dispatch = createEventDispatcher();

  function selectGender(gender: 'male' | 'female') {
    value = gender;
    dispatch('change', gender);
  }
</script>

<div class="mb-5">
  <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
    Gender
  </label>
  <div class="flex gap-3">
    <button
      type="button"
      on:click={() => selectGender('male')}
      class="flex-1 bg-white dark:bg-neutral-800 border rounded-lg py-3 px-4 text-center font-medium transition-all hover:border-neutral-400 dark:hover:border-neutral-500"
      class:border-blue-300={value === 'male'}
      class:dark:border-blue-500={value === 'male'}
      class:border-neutral-300={value !== 'male'}
      class:dark:border-neutral-600={value !== 'male'}
      class:text-neutral-900={value === 'male'}
      class:dark:text-white={value === 'male'}
      class:text-neutral-600={value !== 'male'}
      class:dark:text-neutral-400={value !== 'male'}
    >
      Male
    </button>
    <button
      type="button"
      on:click={() => selectGender('female')}
      class="flex-1 bg-white dark:bg-neutral-800 border rounded-lg py-3 px-4 text-center font-medium transition-all hover:border-neutral-400 dark:hover:border-neutral-500"
      class:border-pink-300={value === 'female'}
      class:dark:border-pink-500={value === 'female'}
      class:border-neutral-300={value !== 'female'}
      class:dark:border-neutral-600={value !== 'female'}
      class:text-neutral-900={value === 'female'}
      class:dark:text-white={value === 'female'}
      class:text-neutral-600={value !== 'female'}
      class:dark:text-neutral-400={value !== 'female'}
    >
      Female
    </button>
  </div>
</div>
