import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export const revalidate = 3600; // Rigenera ogni ora (ISR)

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.isabelpepe.com').replace(/\/$/, '');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/chi-siamo`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/impegno-animali`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/cura-gioielli`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/assistenza-clienti`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/garanzia`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/guida-taglie`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/spedizioni-resi`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/termini-condizioni`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/cookie-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('slug, created_at, image_primary')
      .eq('is_active', true);

    if (!error && products) {
      productRoutes = products
        .filter((product) => typeof product.slug === 'string' && product.slug.trim().length > 0)
        .map((product) => ({
          url: `${BASE_URL}/prodotto/${product.slug}`,
          lastModified: product.created_at ? new Date(product.created_at) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
          ...(product.image_primary ? { images: [product.image_primary] } : {}),
        }));
    } else if (error) {
      console.error('[Sitemap] Errore fetch prodotti Supabase:', error);
    }
  } catch (err) {
    console.error('[Sitemap] Eccezione fetch prodotti:', err);
  }

  return [...staticRoutes, ...productRoutes];
}
