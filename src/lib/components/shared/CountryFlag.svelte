<script lang="ts">
  export let countryCode: string;
  export let size: 'sm' | 'md' | 'lg' = 'md';

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  // Map IL to PS (Palestine flag)
  $: normalizedCode = countryCode.toLowerCase() === 'il' ? 'ps' : countryCode.toLowerCase();
  $: flagPath = `/flags/${normalizedCode}.svg`;
</script>

<img
  src={flagPath}
  alt={countryCode}
  class="inline-block rounded {sizeClasses[size]}"
  on:error={(e) => {
    // Fallback to unknown flag if country flag not found
    e.currentTarget.src = '/flags/uknown.svg';
  }}
/>
