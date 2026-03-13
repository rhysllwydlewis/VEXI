import type { MetadataRoute } from 'next';

const LAST_UPDATED = new Date('2026-03-13');

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://vexi.co.uk',
      lastModified: LAST_UPDATED,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://vexi.co.uk/legal',
      lastModified: LAST_UPDATED,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: 'https://vexi.co.uk/privacy',
      lastModified: LAST_UPDATED,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: 'https://vexi.co.uk/terms',
      lastModified: LAST_UPDATED,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];
}
