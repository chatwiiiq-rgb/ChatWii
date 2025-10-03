import type { RequestHandler } from './$types';

const site = 'https://chatwii.com';

const staticPages = [
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/about', priority: 0.8, changefreq: 'monthly' },
  { path: '/privacy', priority: 0.6, changefreq: 'monthly' },
  { path: '/safety', priority: 0.7, changefreq: 'monthly' },
  { path: '/how-it-works', priority: 0.7, changefreq: 'monthly' },
  { path: '/feedback', priority: 0.5, changefreq: 'monthly' }
];

export const GET: RequestHandler = async () => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    (page) => `  <url>
    <loc>${site}${page.path}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`.trim();

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=0, s-maxage=3600'
    }
  });
};
