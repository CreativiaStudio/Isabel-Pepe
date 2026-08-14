'use server'

import { supabaseAdmin } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';
import { revalidatePath } from 'next/cache';
import { uploadToR2, renameR2Object } from '@/lib/r2';

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
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
  while (true) {
    const candidate = `${baseSlug}-${counter}`;
    let cQuery = supabaseAdmin.from('products').select('id').eq('slug', candidate);
    if (currentProductId) cQuery = cQuery.neq('id', currentProductId);
    const { data: existingCandidate } = await cQuery;
    if (!existingCandidate || existingCandidate.length === 0) {
      return candidate;
    }
    counter++;
  }
}

export async function addProduct(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const sku = formData.get('sku') as string;
    const description = formData.get('description') as string;
    const materials = formData.get('materials') as string || 'Argento 925 nichel free';
    const plating = formData.get('plating') as string;
    const gemstone = formData.get('gemstone') as string;
    const carats = formData.get('carats') as string;
    const sizes = formData.getAll('sizes'); // Array delle taglie per anelli
    
    const price = parseFloat(formData.get('price') as string);
    const discountPriceStr = formData.get('discount_price') as string;
    const discount_price = discountPriceStr ? parseFloat(discountPriceStr) : null;
    const stock = parseInt(formData.get('stock') as string);
    const category = formData.get('category') as string;
    
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

    const productSlug = await generateUniqueSlug(name, sku);

    const timestamp = Date.now();

    for (let i = 0; i < slotFiles.length; i++) {
      const file = slotFiles[i];
      const selectedUrl = slotUrls[i];
      const customName = `isabel-pepe-${productSlug}-slot${i+1}-${timestamp}`;
      
      if (file && file.size > 0) {
        try {
          const publicUrl = await uploadToR2(file, 'products', customName);
          galleryUrls[i] = publicUrl;
        } catch (error) {
          console.error(`Errore caricamento Slot ${i+1} su R2:`, error);
        }
      } else if (selectedUrl) {
        const publicUrlBase = process.env.R2_PUBLIC_URL || '';
        const cleanUrl = selectedUrl.split('?')[0];
        const selectedKey = cleanUrl.replace(`${publicUrlBase}/`, '');
        const ext = selectedKey.split('.').pop() || 'webp';
        const expectedKey = `products/${customName}.${ext}`;
        
        if (selectedKey !== expectedKey) {
          const renamed = await renameR2Object(selectedKey, expectedKey);
          if (renamed) {
            galleryUrls[i] = `${publicUrlBase}/${expectedKey}`;
          } else {
            galleryUrls[i] = `${cleanUrl}?v=${timestamp}`;
          }
        } else {
          galleryUrls[i] = `${cleanUrl}?v=${timestamp}`;
        }
      }
    }

    const primaryUrl = galleryUrls[1] || null;
    const secondaryUrl = galleryUrls[0] || null;

    // 3. Crea il prodotto e il prezzo in Stripe
    const stripeProduct = await stripe.products.create({
      name,
      description: description || undefined,
      images: primaryUrl ? [primaryUrl] : [],
    });

    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(price * 100),
      currency: 'eur',
    });

    // 4. Salva tutto nel database Supabase
    const { error: dbError } = await supabaseAdmin.from('products').insert({
      name,
      slug: productSlug,
      sku,
      description,
      materials,
      plating,
      gemstone,
      carats,
      sizes,
      price,
      discount_price,
      stock,
      category,
      image_primary: primaryUrl,
      image_secondary: secondaryUrl,
      gallery: galleryUrls,
      stripe_product_id: stripeProduct.id,
      stripe_price_id: stripePrice.id,
      is_active: true
    });

    if (dbError) throw new Error('Errore salvataggio DB: ' + dbError.message);

    revalidatePath('/admin');
    return { success: true };
    
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
}

// -- Inline Editing --
export async function updateProductField(id: string, field: string, value: string | number | boolean) {
  try {
    const { error } = await supabaseAdmin.from('products').update({ [field]: value }).eq('id', id);
    if (error) throw new Error(error.message);
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
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

    const updateData: any = {
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
    let newGalleryUrls: string[] = Array.isArray(existingData?.gallery) ? [...existingData.gallery] : [];
    
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

    for (let i = 0; i < slotFiles.length; i++) {
      const file = slotFiles[i];
      const selectedUrl = slotUrls[i];
      const customName = `isabel-pepe-${productSlug}-slot${i+1}-${timestamp}`;
      
      if (slotCleared[i]) {
        newGalleryUrls[i] = "";
      } else if (file && file.size > 0) {
        try {
          const publicUrl = await uploadToR2(file, 'products', customName);
          newGalleryUrls[i] = publicUrl;
        } catch (error) {
          console.error(`Errore caricamento Slot ${i+1} su R2:`, error);
        }
      } else if (selectedUrl) {
        const publicUrlBase = process.env.R2_PUBLIC_URL || '';
        const cleanUrl = selectedUrl.split('?')[0];
        const selectedKey = cleanUrl.replace(`${publicUrlBase}/`, '');
        const ext = selectedKey.split('.').pop() || 'webp';
        const expectedKey = `products/${customName}.${ext}`;
        
        if (selectedKey !== expectedKey) {
          const renamed = await renameR2Object(selectedKey, expectedKey);
          if (renamed) {
            newGalleryUrls[i] = `${publicUrlBase}/${expectedKey}`;
          } else {
            newGalleryUrls[i] = `${cleanUrl}?v=${timestamp}`;
          }
        } else {
          newGalleryUrls[i] = `${cleanUrl}?v=${timestamp}`;
        }
      }
    }

    updateData.gallery = newGalleryUrls;
    updateData.image_secondary = newGalleryUrls[0] || null;
    updateData.image_primary = newGalleryUrls[1] || null;

    const { error } = await supabaseAdmin.from('products').update(updateData).eq('id', id);

    if (error) throw new Error(error.message);

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteProduct(id: string) {
  try {
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
    if (error) throw new Error(error.message);
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateProductImage(id: string, file: File, type: 'primary' | 'secondary') {
  try {
    if (!file || file.size === 0) return { error: 'Nessun file selezionato' };
    
    const ext = file.name.split('.').pop();
    const fileName = `public/${Date.now()}_${type}_update.${ext}`;
    
    const { data, error } = await supabaseAdmin.storage.from('product-images').upload(fileName, file);
    if (error) throw new Error(error.message);
    
    const url = supabaseAdmin.storage.from('product-images').getPublicUrl(data.path).data.publicUrl;
    
    const field = type === 'primary' ? 'image_primary' : 'image_secondary';
    const { error: dbError } = await supabaseAdmin.from('products').update({ [field]: url }).eq('id', id);
    if (dbError) throw new Error(dbError.message);
    
    revalidatePath('/admin');
    return { success: true, url };
  } catch (error: any) {
    return { error: error.message };
  }
}

// -- Dati di Esempio --
export async function seedSampleProducts() {
  const sampleProducts = [
    { name: 'Bracciale Sospeso Luce', price: 120, stock: 5, category: 'Bracciali', plating: 'Oro 18K 1 micron + e-coating', gemstone: 'Zirconi', materials: 'Argento 925 nichel free' },
    { name: 'Collana Lusso Intrecci', price: 185, stock: 3, category: 'Collane', plating: 'Rodio + 1 micron', gemstone: 'Moissanite con certificato GRA', materials: 'Argento 925 nichel free' },
    { name: 'Orecchini Moissanite Goccia', price: 210, stock: 8, category: 'Orecchini', plating: 'Rodio + 1 micron', gemstone: 'Moissanite con certificato GRA', materials: 'Argento 925 nichel free' },
    { name: 'Anello Eternità', price: 150, stock: 12, category: 'Anelli', plating: 'Oro 18K 1 micron + e-coating', gemstone: 'Zirconi', materials: 'Argento 925 nichel free', sizes: [10, 12, 14] },
    { name: 'Set Lusso Perle Acqua Dolce', price: 290, stock: 2, category: 'Set', plating: 'Nessuna', gemstone: 'Perle di acqua dolce', materials: 'Argento 925 nichel free' }
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
  revalidatePath('/admin');
  return { success: true };
}

// --- MEDIA LIBRARY ACTIONS ---
export async function getMediaLibrary() {
  try {
    const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');
    const { r2Client } = await import('@/lib/r2');
    
    // Lista tutti gli oggetti nella cartella 'products'
    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      Prefix: 'products/',
    });

    const response = await r2Client.send(command);
    
    if (!response.Contents) return [];

    const publicUrlBase = process.env.R2_PUBLIC_URL || '';

    // Mappiamo i risultati estraendo URL e dettagli
    const mediaFiles = response.Contents.map(item => {
      return {
        key: item.Key,
        url: `${publicUrlBase}/${item.Key}`,
        size: item.Size,
        lastModified: item.LastModified?.toISOString(),
        name: item.Key?.split('/').pop() || item.Key
      };
    });

    // Ordiniamo per data (più recenti prima)
    mediaFiles.sort((a, b) => {
      const dateA = new Date(a.lastModified || 0).getTime();
      const dateB = new Date(b.lastModified || 0).getTime();
      return dateB - dateA;
    });

    return mediaFiles;

  } catch (error) {
    console.error("Errore nel fetch della Media Library da R2:", error);
    return [];
  }
}
