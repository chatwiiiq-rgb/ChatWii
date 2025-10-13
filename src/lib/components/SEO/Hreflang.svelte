<script lang="ts">
  import { page } from '$app/stores';

  const LOCALES = [
    'en', 'es', 'fr', 'de', 'pt', 'it', 'nl', 'ru',
    'ar', 'zh-cn', 'zh-tw', 'ja', 'ko', 'hi', 'tr',
    'pl', 'id', 'vi'
  ];

  const baseUrl = 'https://chatwii.com';

  // Remove locale prefix from current path
  $: cleanPath = $page.url.pathname.replace(/^\/[a-z]{2}(-[a-z]{2})?\//, '/');

  function getUrl(locale: string) {
    if (locale === 'en') return `${baseUrl}${cleanPath}`;
    return `${baseUrl}/${locale}${cleanPath}`;
  }
</script>

<svelte:head>
  {#each LOCALES as locale}
    <link
      rel="alternate"
      hreflang={locale}
      href={getUrl(locale)}
    />
  {/each}

  <!-- x-default points to primary language -->
  <link
    rel="alternate"
    hreflang="x-default"
    href={getUrl('en')}
  />
</svelte:head>
