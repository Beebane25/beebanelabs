// src/pages/rss.xml.ts — Generate RSS feed from article pages
import type { APIRoute } from 'astro';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

export const GET: APIRoute = ({ site }) => {
  const articlesDir = join(process.cwd(), 'src/pages/articles');
  const files = readdirSync(articlesDir).filter(f => f.endsWith('.astro'));

  const items = files.map(file => {
    const content = readFileSync(join(articlesDir, file), 'utf-8');
    const slug = file.replace('.astro', '');

    const titleMatch = content.match(/<Layout\s+title="([^"]*?)"/);
    const descMatch = content.match(/description="([^"]*?)"/);

    const title = titleMatch ? titleMatch[1] : slug;
    const description = descMatch ? descMatch[1] : '';
    const link = `https://beebanelabs.pages.dev/articles/${slug}.html`;

    return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <description>${escapeXml(description)}</description>
    </item>`;
  }).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>BeebaneLabs - Portal Tutorial Teknologi &amp; IT Indonesia</title>
    <link>https://beebanelabs.pages.dev</link>
    <description>Tutorial lengkap teknologi &amp; IT — Web Development, Database, AI &amp; Data Science, Mobile, DevOps, Cloud, IoT, Cybersecurity, dan karir IT.</description>
    <language>id</language>
    <atom:link href="https://beebanelabs.pages.dev/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
