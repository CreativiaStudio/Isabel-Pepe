import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';
import { revalidatePath } from 'next/cache';
import { verifyAdminAuth } from '@/lib/auth-guard';

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function generateUniqueSlug(name: string, sku?: string, currentProductId?: string): Promise<string> {
  let baseSlug = slugify(name);
  if (!baseSlug) baseSlug = 'gioiello';

  let query = supabaseAdmin.from('products').select('id').eq('slug', baseSlug);
  if (currentProductId) {
    query = query.neq('id', currentProductId);
  }
  const { data: existing } = await query;

  if (!existing || existing.length === 0) {
    return baseSlug;
  }

  if (sku) {
    const skuSlug = slugify(`${name}-${sku}`);
    let skuQuery = supabaseAdmin.from('products').select('id').eq('slug', skuSlug);
    if (currentProductId) skuQuery = skuQuery.neq('id', currentProductId);
    const { data: existingSku } = await skuQuery;
    if (!existingSku || existingSku.length === 0) {
      return skuSlug;
    }
  }

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

// UPDATE (PUT) PRODUCT
export async function PUT(req: Request) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const {
      id,
      name,
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
      gallery,
      image_primary,
      image_secondary,
    } = body;

    if (!id || !name) {
      return NextResponse.json({ error: 'ID e Nome del gioiello sono obbligatori' }, { status: 400 });
    }

    const productSlug = await generateUniqueSlug(name, sku, id);

    // Assicurati che gallery abbia 5 slot
    let safeGallery = Array.isArray(gallery) ? [...gallery] : ["", "", "", "", ""];
    while (safeGallery.length < 5) safeGallery.push("");

    const updatePayload: any = {
      name: name.trim(),
      slug: productSlug,
      sku: sku ? sku.trim() : null,
      description: description || '',
      materials: materials || 'Argento 925 nichel free',
      plating: plating || '',
      gemstone: gemstone || '',
      carats: carats || '',
      sizes: Array.isArray(sizes) ? sizes : [],
      price: parseFloat(price) || 0,
      discount_price: discount_price ? parseFloat(discount_price) : null,
      stock: parseInt(stock) >= 0 ? parseInt(stock) : 0,
      category: category || 'Collane',
      gallery: safeGallery,
      image_secondary: safeGallery[0] || image_secondary || null,
      image_primary: safeGallery[1] || image_primary || null,
    };

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database Update Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath('/admin');
    revalidatePath('/shop');
    revalidatePath('/');
    revalidatePath(`/prodotto/${productSlug}`);

    return NextResponse.json({ success: true, product: data });
  } catch (err: any) {
    console.error('API Products PUT Error:', err);
    return NextResponse.json({ error: err.message || 'Errore interno del server' }, { status: 500 });
  }
}

// CREATE (POST) PRODUCT
export async function POST(req: Request) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const {
      name,
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
      gallery,
    } = body;

    if (!name || !price) {
      return NextResponse.json({ error: 'Nome e Prezzo sono obbligatori' }, { status: 400 });
    }

    const productSlug = await generateUniqueSlug(name, sku);

    let safeGallery = Array.isArray(gallery) ? [...gallery] : ["", "", "", "", ""];
    while (safeGallery.length < 5) safeGallery.push("");

    const primaryUrl = safeGallery[1] || safeGallery[0] || null;

    // Crea prodotto e prezzo in Stripe
    let stripeProductId = null;
    let stripePriceId = null;
    try {
      const stripeProduct = await stripe.products.create({
        name,
        description: description || undefined,
        images: primaryUrl ? [primaryUrl] : [],
      });
      stripeProductId = stripeProduct.id;

      const stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: Math.round(parseFloat(price) * 100),
        currency: 'eur',
      });
      stripePriceId = stripePrice.id;
    } catch (stripeErr) {
      console.error('Stripe Product Creation Warning:', stripeErr);
    }

    const insertPayload = {
      name: name.trim(),
      slug: productSlug,
      sku: sku ? sku.trim() : null,
      description: description || '',
      materials: materials || 'Argento 925 nichel free',
      plating: plating || '',
      gemstone: gemstone || '',
      carats: carats || '',
      sizes: Array.isArray(sizes) ? sizes : [],
      price: parseFloat(price) || 0,
      discount_price: discount_price ? parseFloat(discount_price) : null,
      stock: parseInt(stock) >= 0 ? parseInt(stock) : 0,
      category: category || 'Collane',
      gallery: safeGallery,
      image_secondary: safeGallery[0] || null,
      image_primary: safeGallery[1] || null,
      stripe_product_id: stripeProductId,
      stripe_price_id: stripePriceId,
      is_active: true,
    };

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Database Insert Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath('/admin');
    revalidatePath('/shop');
    revalidatePath('/');
    revalidatePath(`/prodotto/${productSlug}`);

    return NextResponse.json({ success: true, product: data });
  } catch (err: any) {
    console.error('API Products POST Error:', err);
    return NextResponse.json({ error: err.message || 'Errore interno del server' }, { status: 500 });
  }
}

// DELETE (DELETE) PRODUCT
export async function DELETE(req: Request) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID prodotto obbligatorio' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath('/admin');
    revalidatePath('/shop');
    revalidatePath('/');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Errore interno del server' }, { status: 500 });
  }
}

// PATCH (PARTIAL UPDATE) PRODUCT FIELD
export async function PATCH(req: Request) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { id, field, value, ...rest } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID prodotto obbligatorio' }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {};
    if (field !== undefined) {
      updatePayload[field] = value;
    } else {
      Object.assign(updatePayload, rest);
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('PATCH product error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath('/admin');
    revalidatePath('/shop');
    revalidatePath('/');
    if (data?.slug) {
      revalidatePath(`/prodotto/${data.slug}`);
    }

    return NextResponse.json({ success: true, product: data });
  } catch (err: any) {
    console.error('API Products PATCH Error:', err);
    return NextResponse.json({ error: err.message || 'Errore interno del server' }, { status: 500 });
  }
}
