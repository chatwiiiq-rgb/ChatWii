<script lang="ts">
  export let countryCode: string;
  export let size: 'sm' | 'md' | 'lg' = 'md';

  const sizeClasses = {
    sm: 'w-4 h-3',
    md: 'w-6 h-4',
    lg: 'w-8 h-6',
  };

  let hasErrored = false;

  // Simple gray placeholder as data URI (to avoid 404 if unknown.svg is missing)
  const placeholderFlag = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40"%3E%3Crect width="60" height="40" fill="%23ccc"/%3E%3C/svg%3E';

  // Map IL to PS (Palestine flag)
  $: normalizedCode = countryCode.toLowerCase() === 'il' ? 'ps' : countryCode.toLowerCase();
  $: flagPath = `/flags/${normalizedCode}.svg`;

  // Reset error state when country code changes
  $: if (countryCode) {
    hasErrored = false;
  }
</script>

<img
  src={flagPath}
  alt={countryCode}
  class="inline-block rounded {sizeClasses[size]}"
  on:error={(e) => {
    // Prevent infinite loop - only try fallback once
    if (!hasErrored) {
      hasErrored = true;
      // Use data URI placeholder to avoid 404 errors
      e.currentTarget.src = placeholderFlag;
    }
  }}
/>
