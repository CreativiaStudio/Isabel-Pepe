'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { createPacklinkDraft, getPacklinkShipmentDetails, getPacklinkLabelUrl } from '@/lib/packlink';
import { sendShippingConfirmationEmail } from '@/lib/email';

/**
 * Crea una spedizione bozza su Packlink PRO per l'ordine fornito
 */
export async function createPacklinkShipmentAction(orderId: string) {
  try {
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return { success: false, error: 'Ordine non trovato nel database' };
    }

    const draftResult = await createPacklinkDraft(order);

    if (draftResult.error) {
      return { success: false, error: draftResult.error };
    }

    const ref = draftResult.reference;

    // Salviamo il riferimento di Packlink nelle note dell'ordine
    const currentNotes = order.notes || '';
    const updatedNotes = currentNotes 
      ? `${currentNotes}\n[Packlink PRO Ref: ${ref}]`
      : `[Packlink PRO Ref: ${ref}]`;

    await supabaseAdmin
      .from('orders')
      .update({ notes: updatedNotes })
      .eq('id', orderId);

    revalidatePath('/admin');
    return { 
      success: true, 
      reference: ref,
      packlinkUrl: `https://pro.packlink.it/private/shipments/${ref}` // URL del pannello Packlink Italia
    };
  } catch (err: any) {
    console.error('Errore creazione spedizione Packlink:', err);
    return { success: false, error: err.message || 'Errore imprevisto' };
  }
}

/**
 * Sincronizza lo stato ed il codice di tracciamento di Packlink PRO con l'ordine
 */
export async function syncPacklinkShipmentAction(orderId: string, reference: string) {
  try {
    const shipment = await getPacklinkShipmentDetails(reference);

    if (!shipment) {
      return { success: false, error: 'Impossibile recuperare i dettagli da Packlink PRO' };
    }

    const trackingCode = shipment.trackings?.[0]?.tracking_number || shipment.packlink_reference;
    const isShipped = shipment.state === 'IN_TRANSIT' || shipment.state === 'DELIVERED' || trackingCode;

    if (trackingCode) {
      const { data: order } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      await supabaseAdmin
        .from('orders')
        .update({
          tracking_code: trackingCode,
          status: 'shipped',
          shipped_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (order && order.customer_email) {
        await sendShippingConfirmationEmail(
          order.customer_email,
          order.customer_name,
          trackingCode,
          order.id
        );
      }
    }

    revalidatePath('/admin');
    return { success: true, trackingCode, shipmentState: shipment.state };
  } catch (err: any) {
    console.error('Errore sincronizzazione Packlink:', err);
    return { success: false, error: err.message || 'Errore durante la sincronizzazione' };
  }
}
