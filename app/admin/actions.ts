'use server'

import { supabaseAdmin } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';
import { revalidatePath } from 'next/cache';
import { uploadToR2, getR2Client, getR2Config } from '@/lib/r2';
import { ListObjectsV2Command, type _Object } from '@aws-sdk/client-s3';

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Gracefully handle invocations outside Next.js request context (e.g. tests)
  }
}

function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function generateUniqueSlug(name: string, sku?: string, currentProductId?: string): Promise<string> {
  let baseSlug = slugify(name);
  if (!baseSlug) baseSlug = 'gioiello';

  // Verifica se lo slug base è già usato da UN ALTRO prodotto
  let query = supabaseAdmin.from('products').select('id').eq('slug', baseSlug);
  if (currentProductId) {
    query = query.neq('id', currentProductId);
  }
  const { data: existing } = await query;

  if (!existing || existing.length === 0) {
    return baseSlug;
  }

  // Se c'è un conflitto ed è presente lo SKU, proviamo 'nome-sku'
  if (sku) {
    const skuSlug = slugify(`${name}-${sku}`);
    let skuQuery = supabaseAdmin.from('products').select('id').eq('slug', skuSlug);
    if (currentProductId) skuQuery = skuQuery.neq('id', currentProductId);
    const { data: existingSku } = await skuQuery;
    if (!existingSku || existingSku.length === 0) {
      return skuSlug;
    }
  }

  // Se anche quello esiste, aggiungiamo un contatore univoco (-1, -2, ...)
  let counter = 1;
  while (counter < 1000) {
    const candidate = `${baseSlug}-${counter}`;
    let cQuery = supabaseAdmin.from('products').select('id').eq('slug', candidate);
    if (currentProductId) cQuery = cQuery.neq('id', currentProductId);
    const { data: existingCandidate } = await cQuery;
    if (!existingCandidate || existingCandidate.length === 0) {
      return candidate;
    }
    counter++;
  }
  return `${baseSlug}-${Date.now()}`;
}

export async function addProduct(formData: FormData) {
  try {
    const name = (formData.get('name') as string)?.trim();
    const sku = (formData.get('sku') as string)?.trim() || null;
    const description = (formData.get('description') as string) || '';
    const materials = (formData.get('materials') as string) || 'Argento 925 nichel free';
    const plating = (formData.get('plating') as string) || '';
    const gemstone = (formData.get('gemstone') as string) || '';
    const carats = (formData.get('carats') as string) || '';
    const sizes = formData.getAll('sizes'); // Array delle taglie per anelli
    
    const rawPrice = formData.get('price') as string;
    const parsedPrice = parseFloat(String(rawPrice || 0).replace(',', '.')) || 0;
    
    const discountPriceStr = formData.get('discount_price') as string;
    const rawDiscount = discountPriceStr ? parseFloat(String(discountPriceStr).replace(',', '.')) : null;
    const parsedDiscount = (rawDiscount !== null && !isNaN(rawDiscount) && rawDiscount > 0 && rawDiscount < parsedPrice)
      ? rawDiscount
      : null;
      
    const rawStock = formData.get('stock') as string;
    const stock = parseInt(String(rawStock ?? 10)) >= 0 ? parseInt(String(rawStock ?? 10)) : 0;
    const category = (formData.get('category') as string) || 'Collane';
    
    const slotFiles = [
      formData.get('slot1') as File,
      formData.get('slot2') as File,
      formData.get('slot3') as File,
      formData.get('slot4') as File,
      formData.get('slot5') as File
    ];

    const galleryUrls: string[] = ["", "", "", "", ""];

    const slotUrls = [
      formData.get('slot1_url') as string,
      formData.get('slot2_url') as string,
      formData.get('slot3_url') as string,
      formData.get('slot4_url') as string,
      formData.get('slot5_url') as string
    ];

    const productSlug = await generateUniqueSlug(name, sku || undefined);

    const timestamp = Date.now();

    for (let i = 0; i < 5; i++) {
      const file = slotFiles[i];
      const explicitUrl = slotUrls[i]?.trim();
      const customName = `isabel-pepe-${productSlug}-slot${i+1}-${timestamp}`;
      
      if (explicitUrl) {
        galleryUrls[i] = explicitUrl;
      } else if (file && file.size > 0) {
        try {
          const publicUrl = await uploadToR2(file, 'products', customName);
          galleryUrls[i] = publicUrl;
        } catch (error) {
          console.error(`Errore caricamento Slot ${i+1} su R2:`, error);
        }
      }
    }

    const primaryUrl = galleryUrls[1] || galleryUrls[0] || null;
    const secondaryUrl = galleryUrls[0] || null;
    const validHttpsImage = typeof primaryUrl === 'string' && primaryUrl.startsWith('https://') ? [primaryUrl] : [];

    // 3. Crea il prodotto e il prezzo in Stripe in modo resiliente
    let stripeProductId = null;
    let stripePriceId = null;
    try {
      const stripeProduct = await stripe.products.create({
        name,
        description: description || undefined,
        images: validHttpsImage,
      });
      stripeProductId = stripeProduct.id;

      const stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: Math.round(parsedPrice * 100),
        currency: 'eur'
      });
      stripePriceId = stripePrice.id;
    } catch (stripeErr) {
      console.warn('Stripe error on addProduct (non-blocking):', stripeErr);
    }

    // 4. Salva tutto nel database Supabase
    const { data, error: dbError } = await supabaseAdmin.from('products').insert({
      name,
      slug: productSlug,
      sku,
      description,
      materials,
      plating,
      gemstone,
      carats,
      sizes: Array.isArray(sizes) ? sizes.map(String).filter(Boolean) : [],
      price: parsedPrice,
      discount_price: parsedDiscount,
      stock,
      category,
      image_primary: primaryUrl,
      image_secondary: secondaryUrl,
      gallery: galleryUrls,
      stripe_product_id: stripeProductId,
      stripe_price_id: stripePriceId,
      is_active: true
    }).select().single();

    if (dbError) throw new Error('Errore salvataggio DB: ' + dbError.message);

    safeRevalidatePath('/admin');
    safeRevalidatePath('/shop');
    safeRevalidatePath('/');
    return { success: true, product: data };
    
  } catch (error: unknown) {
    console.error(error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return { error: errorMsg };
  }
}

// -- Inline Editing --
export async function updateProductField(id: string, field: string, value: string | number | boolean) {
  try {
    const { error } = await supabaseAdmin.from('products').update({ [field]: value }).eq('id', id);
    if (error) throw new Error(error.message);
    safeRevalidatePath('/admin');
    safeRevalidatePath('/shop');
    safeRevalidatePath('/');
    return { success: true };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return { error: errorMsg };
  }
}

export async function updateFullProduct(id: string, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const sku = formData.get('sku') as string;
    const description = formData.get('description') as string;
    const materials = formData.get('materials') as string;
    const plating = formData.get('plating') as string;
    const gemstone = formData.get('gemstone') as string;
    const carats = formData.get('carats') as string;
    const sizes = formData.getAll('sizes');
    const price = parseFloat(formData.get('price') as string);
    const discountPriceStr = formData.get('discount_price') as string;
    const discount_price = discountPriceStr ? parseFloat(discountPriceStr) : null;
    const stock = parseInt(formData.get('stock') as string);
    const category = formData.get('category') as string;

    const productSlug = await generateUniqueSlug(name, sku, id);

    const updateData: Record<string, unknown> = {
      name, slug: productSlug, sku, description, materials, plating, gemstone, carats, sizes, price, discount_price, stock, category
    };

    const slotFiles = [
      formData.get('slot1') as File,
      formData.get('slot2') as File,
      formData.get('slot3') as File,
      formData.get('slot4') as File,
      formData.get('slot5') as File
    ];

    const { data: existingData } = await supabaseAdmin.from('products').select('gallery, image_primary, image_secondary').eq('id', id).single();
    const newGalleryUrls: string[] = Array.isArray(existingData?.gallery) ? [...existingData.gallery] : [];
    
    // Se la galleria era vuota o incompleta, migriamo i vecchi campi nel nuovo sistema a 5 slot
    if (newGalleryUrls.length < 2) {
      newGalleryUrls[0] = existingData?.image_secondary || ""; // Slot 1 = Modella
      newGalleryUrls[1] = existingData?.image_primary || "";   // Slot 2 = Sfondo Rosa
    }
    
    // Ensure array has 5 elements so we can target by index
    while (newGalleryUrls.length < 5) newGalleryUrls.push("");

    const slotUrls = [
      formData.get('slot1_url') as string,
      formData.get('slot2_url') as string,
      formData.get('slot3_url') as string,
      formData.get('slot4_url') as string,
      formData.get('slot5_url') as string
    ];

    const slotCleared = [
      formData.get('slot1_cleared') === 'true',
      formData.get('slot2_cleared') === 'true',
      formData.get('slot3_cleared') === 'true',
      formData.get('slot4_cleared') === 'true',
      formData.get('slot5_cleared') === 'true'
    ];

    const timestamp = Date.now();

    for (let i = 0; i < 5; i++) {
      const file = slotFiles[i];
      const explicitUrl = slotUrls[i]?.trim();
      const customName = `isabel-pepe-${productSlug}-slot${i+1}-${timestamp}`;
      
      if (slotCleared[i]) {
        newGalleryUrls[i] = "";
      } else if (explicitUrl) {
        newGalleryUrls[i] = explicitUrl;
      } else if (file && file.size > 0) {
        try {
          const publicUrl = await uploadToR2(file, 'products', customName);
          newGalleryUrls[i] = publicUrl;
        } catch (error) {
          console.error(`Errore caricamento Slot ${i+1} su R2:`, error);
        }
      }
    }

    updateData.gallery = newGalleryUrls;
    updateData.image_secondary = newGalleryUrls[0] || null;
    updateData.image_primary = newGalleryUrls[1] || newGalleryUrls[0] || null;

    const { error } = await supabaseAdmin.from('products').update(updateData).eq('id', id);

    if (error) throw new Error(error.message);

    safeRevalidatePath('/admin');
    safeRevalidatePath('/shop');
    safeRevalidatePath('/');
    safeRevalidatePath(`/prodotto/${productSlug}`);
    return { success: true };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return { error: errorMsg };
  }
}

export async function deleteProduct(id: string) {
  try {
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
    if (error) throw new Error(error.message);

    safeRevalidatePath('/admin');
    safeRevalidatePath('/shop');
    safeRevalidatePath('/');
    return { success: true };
  } catch (error: unknown) {
    console.error('deleteProduct error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return { error: errorMsg };
  }
}

/**
 * Server Action fallback for image uploads to Cloudflare R2.
 * Serves as Tier-2 upload fallback when /api/upload fails.
 */
export async function uploadProductImageAction(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    if (!formData || !(formData instanceof FormData)) {
      return { success: false, error: 'Dati del modulo non validi o mancanti.' };
    }

    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'products';
    const customName = (formData.get('customName') as string) || undefined;

    if (!file || typeof file !== 'object' || !('size' in file) || file.size === 0) {
      return { success: false, error: 'Nessun file fornito o file vuoto.' };
    }

    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: 'La dimensione del file supera il limite massimo di 20MB.' };
    }

    const safeFolder = folder
      .replace(/\.\./g, '')
      .replace(/^\/+|\/+$/g, '')
      .trim() || 'products';

    const safeCustomName = customName
      ? customName.trim().replace(/[^a-zA-Z0-9_-]/g, '-')
      : undefined;

    const publicUrl = await uploadToR2(file, safeFolder, safeCustomName);

    return { success: true, url: publicUrl };
  } catch (error: unknown) {
    console.error('Errore in uploadProductImageAction:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: errorMsg || 'Errore durante il caricamento su Cloudflare R2',
    };
  }
}

/**
 * Server Action for quick thumbnail image replacement in ProductTable.
 * Uploads to Cloudflare R2 and synchronizes image column AND products.gallery 5-slot array.
 */
export async function updateProductImage(
  productId: string,
  file: File,
  type: 'primary' | 'secondary'
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    if (!productId || typeof productId !== 'string' || !productId.trim()) {
      return { success: false, error: 'ID prodotto obbligatorio.' };
    }

    if (!file || typeof file !== 'object' || !('size' in file) || file.size === 0) {
      return { success: false, error: 'Nessun file selezionato o file vuoto.' };
    }

    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: 'La dimensione del file supera il limite massimo di 20MB.' };
    }

    if (type !== 'primary' && type !== 'secondary') {
      return { success: false, error: 'Tipo immagine non valido (consentiti: primary, secondary).' };
    }

    const targetId = productId.trim();

    // 1. Fetch current product record
    const { data: product, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('id, name, slug, gallery, image_primary, image_secondary')
      .eq('id', targetId)
      .single();

    if (fetchError || !product) {
      return {
        success: false,
        error: `Prodotto non trovato: ${fetchError?.message || 'ID non esistente'}`,
      };
    }

    // 2. Upload new image to Cloudflare R2
    const productSlug = product.slug || slugify(product.name || 'gioiello');
    const timestamp = Date.now();
    const customName = `isabel-pepe-${productSlug}-${type}-${timestamp}`;
    const publicUrl = await uploadToR2(file, 'products', customName);

    // 3. Normalize existing gallery array to exactly 5 elements
    const galleryUrls: string[] = Array.isArray(product.gallery) ? [...product.gallery] : [];
    if (galleryUrls.length < 2) {
      galleryUrls[0] = product.image_secondary || '';
      galleryUrls[1] = product.image_primary || '';
    }
    while (galleryUrls.length < 5) {
      galleryUrls.push('');
    }

    // 4. Update the corresponding slot and columns
    const updatePayload: Record<string, unknown> = {};

    if (type === 'secondary') {
      // Slot 1 (index 0) = On-Model 2:3
      galleryUrls[0] = publicUrl;
      updatePayload.image_secondary = publicUrl;
      if (!galleryUrls[1] && !product.image_primary) {
        updatePayload.image_primary = publicUrl;
      }
    } else {
      // Slot 2 (index 1) = Studio Still Life 1:1
      galleryUrls[1] = publicUrl;
      updatePayload.image_primary = publicUrl;
    }

    updatePayload.gallery = galleryUrls;

    // 5. Execute atomic update in Supabase
    const { error: dbError } = await supabaseAdmin
      .from('products')
      .update(updatePayload)
      .eq('id', targetId);

    if (dbError) {
      throw new Error(`Errore salvataggio database: ${dbError.message}`);
    }

    // 6. Comprehensive cache revalidation
    safeRevalidatePath('/admin');
    safeRevalidatePath('/shop');
    safeRevalidatePath('/');
    if (product.slug) {
      safeRevalidatePath(`/prodotto/${product.slug}`);
    }

    return { success: true, url: publicUrl };
  } catch (error: unknown) {
    console.error('Errore in updateProductImage:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: errorMsg || "Errore durante l'aggiornamento dell'immagine del prodotto",
    };
  }
}

// -- Dati di Esempio --
export async function seedSampleProducts() {
  const sampleProducts = [
    { name: 'Bracciale Sospeso Luce', price: 120, stock: 5, category: 'Bracciali', plating: 'Placcatura Oro 18K (1.0µm) + Nano-Coating (1.0µm)', gemstone: 'Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)', materials: 'Argento 925 nichel free' },
    { name: 'Collana Lusso Intrecci', price: 185, stock: 3, category: 'Collane', plating: 'Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)', gemstone: 'Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)', materials: 'Argento 925 nichel free' },
    { name: 'Orecchini Goccia di Luce', price: 210, stock: 8, category: 'Orecchini', plating: 'Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)', gemstone: 'Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)', materials: 'Argento 925 nichel free' },
    { name: 'Anello Eternità', price: 150, stock: 12, category: 'Anelli', plating: 'Placcatura Oro 18K (1.0µm) + Nano-Coating (1.0µm)', gemstone: 'Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)', materials: 'Argento 925 nichel free', sizes: [10, 12, 14] },
    { name: 'Set Lusso Perle Acqua Dolce', price: 290, stock: 2, category: 'Set', plating: 'Placcatura Oro 18K (1.0µm) + Nano-Coating (1.0µm)', gemstone: 'Perle Naturali d\'Acqua Dolce Selezionate a Mano', materials: 'Argento 925 nichel free' }
  ];

  for (const p of sampleProducts) {
    const stripeProduct = await stripe.products.create({ name: p.name });
    const stripePrice = await stripe.prices.create({ product: stripeProduct.id, unit_amount: p.price * 100, currency: 'eur' });
    
    await supabaseAdmin.from('products').insert({
      ...p,
      stripe_product_id: stripeProduct.id,
      stripe_price_id: stripePrice.id,
      image_primary: 'https://images.unsplash.com/photo-1599643478514-4a4204b4d455?auto=format&fit=crop&q=80&w=400',
      is_active: true
    });
  }
  safeRevalidatePath('/admin');
  return { success: true };
}

// --- MEDIA LIBRARY ACTIONS ---
export async function getMediaLibrary() {
  try {
    const config = getR2Config();
    const client = getR2Client();

    let continuationToken: string | undefined = undefined;
    let isTruncated = true;
    const allContents: _Object[] = [];

    // Loop through all pages of objects in R2
    while (isTruncated) {
      const command: InstanceType<typeof ListObjectsV2Command> = new ListObjectsV2Command({
        Bucket: config.bucketName,
        Prefix: 'products/',
        ContinuationToken: continuationToken,
      });

      const response = await client.send(command);
      if (response.Contents && response.Contents.length > 0) {
        allContents.push(...response.Contents);
      }

      isTruncated = response.IsTruncated ?? false;
      continuationToken = response.NextContinuationToken;
    }

    const publicUrlBase = config.publicUrl;

    // Filter out virtual directory keys (ending with / or size 0) and missing keys
    const validContents = allContents.filter(item => {
      if (!item.Key) return false;
      if (item.Key.endsWith('/')) return false;
      if (item.Size === 0) return false;
      return true;
    });

    // Map results extracting URL and metadata
    const mediaFiles = validContents.map(item => {
      return {
        key: item.Key!,
        url: `${publicUrlBase}/${item.Key}`,
        size: item.Size || 0,
        lastModified: item.LastModified?.toISOString(),
        name: item.Key!.split('/').pop() || item.Key!
      };
    });

    // Sort by date (newest first)
    mediaFiles.sort((a, b) => {
      const dateA = new Date(a.lastModified || 0).getTime();
      const dateB = new Date(b.lastModified || 0).getTime();
      return dateB - dateA;
    });

    return mediaFiles;

  } catch (error: unknown) {
    console.error("Errore nel fetch della Media Library da R2:", error);
    throw error;
  }
}
