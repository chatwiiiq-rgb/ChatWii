<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { themeStore } from '$lib/stores/themeStore';
  import { authStore } from '$lib/stores/authStore';
  import ToastContainer from '$lib/components/shared/ToastContainer.svelte';
  import ConnectionStatus from '$lib/components/shared/ConnectionStatus.svelte';
  import AnnouncementBanner from '$lib/components/shared/AnnouncementBanner.svelte';
  import SEO from '$lib/components/SEO/index.svelte';

  onMount(() => {
    themeStore.init();
    authStore.init();
  });

  // Default SEO metadata - can be overridden by individual pages via page data
  $: seoData = $page.data.seo || {
    title: 'ChatWii - Anonymous Chat with Strangers | Free & Private',
    description: 'Chat anonymously with strangers worldwide on ChatWii. No registration, completely free, and 100% private. Connect instantly with people from around the globe.',
    keywords: ['anonymous chat', 'chat with strangers', 'free chat', 'private messaging', 'random chat', 'online chat', 'no registration chat'],
    image: {
      url: 'https://chatwii.com/images/og-image.jpg',
      alt: 'ChatWii - Anonymous Private Chat Platform'
    }
  };
</script>

<SEO {...seoData} />

<AnnouncementBanner />
<ConnectionStatus />
<slot />
<ToastContainer />
