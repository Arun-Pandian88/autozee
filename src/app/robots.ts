import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/settings/', '/dashboard/'],
    },
    sitemap: 'https://autozee.ai/sitemap.xml',
  };
}
