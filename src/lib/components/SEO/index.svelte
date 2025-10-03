<script lang="ts">
  import { page } from '$app/stores';
  import OpenGraph from './OpenGraph.svelte';
  import Twitter from './Twitter.svelte';
  import SchemaOrg from './SchemaOrg.svelte';

  type SEOProps = {
    title: string;
    description: string;
    canonical?: string;
    image?: {
      url: string;
      alt: string;
      width?: number;
      height?: number;
    };
    keywords?: string[];
    article?: boolean;
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    schema?: Record<string, any>;
    noindex?: boolean;
  };

  let {
    title,
    description,
    canonical,
    image,
    keywords = [],
    article = false,
    author,
    publishedTime,
    modifiedTime,
    schema,
    noindex = false
  }: SEOProps = $props();

  const siteTitle = 'ChatWii';
  const fullTitle = $derived(title.includes(siteTitle) ? title : `${title} | ${siteTitle}`);
  const url = $derived(canonical || $page.url.href);
  const robotsContent = $derived(noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large');
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  {#if keywords.length > 0}
    <meta name="keywords" content={keywords.join(', ')} />
  {/if}
  <link rel="canonical" href={url} />
  <meta name="robots" content={robotsContent} />
</svelte:head>

<OpenGraph
  {title}
  {description}
  {url}
  {image}
  type={article ? 'article' : 'website'}
  siteName={siteTitle}
/>

<Twitter
  {title}
  {description}
  {image}
  card="summary_large_image"
/>

{#if schema}
  <SchemaOrg {schema} />
{:else if article && author}
  <SchemaOrg
    schema={{
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": title,
      "description": description,
      "image": image?.url,
      "author": {
        "@type": "Person",
        "name": author
      },
      "publisher": {
        "@type": "Organization",
        "name": siteTitle,
        "logo": {
          "@type": "ImageObject",
          "url": "https://chatwii.com/logo.png"
        }
      },
      "datePublished": publishedTime,
      "dateModified": modifiedTime
    }}
  />
{/if}
