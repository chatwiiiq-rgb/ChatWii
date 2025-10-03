<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { themeStore } from '$lib/stores/themeStore';
  import { authStore } from '$lib/stores/authStore';
  import ToastContainer from '$lib/components/shared/ToastContainer.svelte';
  import ConnectionStatus from '$lib/components/shared/ConnectionStatus.svelte';
  import SEO from '$lib/components/SEO/index.svelte';

  onMount(() => {
    themeStore.init();
    authStore.init();
  });

  // Default SEO metadata - can be overridden by individual pages via page data
  $: seoData = $page.data.seo || {
    title: 'ChatWii - Anonymous Private Chat',
    description: 'Anonymous 1-on-1 text chat with no registration required. Private, secure real-time messaging with complete privacy. Start chatting instantly.',
    keywords: ['anonymous chat', 'private messaging', 'secure chat', 'no registration', 'instant messaging', 'privacy chat'],
    image: {
      url: 'https://chatwii.com/images/og-image.jpg',
      alt: 'ChatWii - Anonymous Private Chat Platform'
    }
  };
</script>

<SEO {...seoData} />

<ConnectionStatus />
<slot />
<ToastContainer />
