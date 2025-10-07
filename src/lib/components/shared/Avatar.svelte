<script lang="ts">
  export let gender: 'male' | 'female' | 'unknown';
  export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  export let avatarUrl: string | null = null;

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  // Standard users get predefined avatar based on gender
  $: defaultAvatar = `/avatars/standard/${gender || 'unknown'}.png`;
  $: displayAvatar = avatarUrl || defaultAvatar;
</script>

<div class="relative {sizeClasses[size]}">
  <img
    src={displayAvatar}
    alt="{gender} avatar"
    class="w-full h-full rounded-full object-cover bg-neutral-200 dark:bg-neutral-700"
    on:error={(e) => {
      // Fallback to default avatar if custom avatar fails
      e.currentTarget.src = defaultAvatar;
    }}
  />
</div>
