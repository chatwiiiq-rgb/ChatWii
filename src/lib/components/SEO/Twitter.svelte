<script lang="ts">
  type TwitterProps = {
    title: string;
    description: string;
    image?: {
      url: string;
      alt: string;
    };
    card?: string;
  };

  let {
    title,
    description,
    image,
    card = 'summary_large_image'
  }: TwitterProps = $props();
</script>

<svelte:head>
  <meta name="twitter:card" content={card} />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  {#if image}
    <meta name="twitter:image" content={image.url} />
    <meta name="twitter:image:alt" content={image.alt} />
  {/if}
</svelte:head>
