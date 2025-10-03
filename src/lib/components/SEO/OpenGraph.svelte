<script lang="ts">
  type OpenGraphProps = {
    title: string;
    description: string;
    url: string;
    image?: {
      url: string;
      alt: string;
      width?: number;
      height?: number;
    };
    type?: string;
    siteName?: string;
  };

  let {
    title,
    description,
    url,
    image,
    type = 'website',
    siteName = 'ChatWii'
  }: OpenGraphProps = $props();
</script>

<svelte:head>
  <meta property="og:type" content={type} />
  <meta property="og:url" content={url} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:site_name" content={siteName} />
  {#if image}
    <meta property="og:image" content={image.url} />
    <meta property="og:image:width" content={String(image.width || 1200)} />
    <meta property="og:image:height" content={String(image.height || 630)} />
    <meta property="og:image:alt" content={image.alt} />
  {/if}
</svelte:head>
