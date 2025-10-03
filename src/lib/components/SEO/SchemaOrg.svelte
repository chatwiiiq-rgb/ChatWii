<script lang="ts">
  type SchemaProps = {
    schema: Record<string, any>;
  };

  let { schema }: SchemaProps = $props();
</script>

<svelte:head>
  {@html `<script type="application/ld+json">${JSON.stringify(schema)}<\/script>`}
</svelte:head>
