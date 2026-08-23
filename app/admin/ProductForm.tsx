'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addProduct, updateFullProduct, uploadProductImageAction } from './actions';
import { Plus, Loader2, Save, X, Image as ImageIcon, Trash2, CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react';
import { MediaLibraryModal } from './MediaLibraryModal';

export interface SafeUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

async function safeParseUploadResponse(res: Response): Promise<SafeUploadResult> {
  try {
    const contentType = res.headers.get('content-type') || '';

    // 1. JSON Response
    if (contentType.includes('application/json')) {
      let data: any;
      try {
        data = await res.json();
      } catch {
        return {
          success: false,
          error: `Risposta JSON non valida dal server (HTTP ${res.status}).`,
        };
      }

      if (!res.ok || data.error) {
        return {
          success: false,
          error: data.error || `Errore HTTP ${res.status}: Impossibile completare il caricamento.`,
        };
      }

      if (!data.url) {
        return {
          success: false,
          error: 'Risposta del server incompleta (URL immagine mancante).',
        };
      }

      return { success: true, url: data.url };
    }

    // 2. Non-JSON Response (HTML error page from Next.js, Cloudflare, Nginx)
    const rawText = await res.text().catch(() => '');

    if (res.status === 413) {
      return {
        success: false,
        error: 'File troppo grande per il server (massimo 20MB consentiti).',
      };
    }
    if (res.status === 502 || res.status === 504) {
      return {
        success: false,
        error: 'Gateway timeout: riprova tra qualche secondo.',
      };
    }
    if (res.status >= 500) {
      return {
        success: false,
        error: `Errore server Cloudflare R2 (HTTP ${res.status}).`,
      };
    }
    if (res.status === 400) {
      return {
        success: false,
        error: 'Richiesta non valida: verifica il file selezionato.',
      };
    }

    const cleanText = rawText.replace(/<[^>]*>?/gm, '').trim();
    return {
      success: false,
      error: cleanText.slice(0, 150) || `Errore imprevisto durante il caricamento (Status ${res.status}).`,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Errore imprevisto durante l\'elaborazione della risposta.',
    };
  }
}

async function compressImageClient(file: File): Promise<File> {
  const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
  const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
  const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|avif|heic|heif|bmp|tiff)$/i.test(file.name);

  if (!isImage || isSvg || isGif) {
    return file;
  }

  return new Promise((resolve) => {
    let objectUrl: string | null = null;
    try {
      objectUrl = URL.createObjectURL(file);
    } catch {
      return resolve(file);
    }

    const img = new Image();

    const cleanup = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = null;
      }
    };

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;
        const maxDim = 2000;

        if (width === 0 || height === 0) {
          cleanup();
          return resolve(file);
        }

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          cleanup();
          return resolve(file);
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            cleanup();
            if (blob && blob.size > 0) {
              const baseName = file.name.replace(/\.[^/.]+$/, '');
              const compressedFile = new File([blob], `${baseName}.webp`, {
                type: 'image/webp',
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/webp',
          0.85
        );
      } catch (canvasErr) {
        cleanup();
        console.warn('[compressImageClient] Canvas compression exception, falling back to raw file:', canvasErr);
        resolve(file);
      }
    };

    img.onerror = () => {
      cleanup();
      // On decode error (e.g. browser lacks native decoder for HEIC), fallback to raw file for server-side Sharp/R2 handling
      resolve(file);
    };

    img.src = objectUrl;
  });
}

export default function ProductForm({ initialData, onCancel }: { initialData?: any, onCancel?: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mediaModalSlot, setMediaModalSlot] = useState<string | null>(null);
  const [productName, setProductName] = useState(initialData?.name || '');
  const [productSku, setProductSku] = useState(initialData?.sku || '');
  const [slotUrls, setSlotUrls] = useState<Record<string, string>>({});
  const [uploadingSlots, setUploadingSlots] = useState<Record<string, boolean>>({});
  const [clearedSlots, setClearedSlots] = useState<Record<string, boolean>>({});
  const [slotErrors, setSlotErrors] = useState<Record<string, string | undefined>>({});
  const [pendingFiles, setPendingFiles] = useState<Record<string, File | undefined>>({});
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('Collane');
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setProductName(initialData.name || '');
      setProductSku(initialData.sku || '');
      setCategory(initialData.category || 'Collane');
      setMessage('');
      setPreviews({});
      setClearedSlots({});
      setUploadingSlots({});
      setSlotErrors({});
      setPendingFiles({});

      const initialSlotUrls: Record<string, string> = {};
      const gallery = Array.isArray(initialData.gallery) ? initialData.gallery : [];
      if (gallery.length > 0) {
        gallery.forEach((url: string, idx: number) => {
          if (url) initialSlotUrls[`slot${idx + 1}`] = url;
        });
      } else {
        if (initialData.image_secondary) initialSlotUrls['slot1'] = initialData.image_secondary;
        if (initialData.image_primary) initialSlotUrls['slot2'] = initialData.image_primary;
      }
      setSlotUrls(initialSlotUrls);
    } else {
      setProductName('');
      setProductSku('');
      setCategory('Collane');
      setPreviews({});
      setClearedSlots({});
      setUploadingSlots({});
      setSlotErrors({});
      setPendingFiles({});
      setSlotUrls({});
    }
  }, [initialData]);

  const executeSlotUpload = async (file: File, slotKey: string) => {
    // Show preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreviews(prev => ({ ...prev, [slotKey]: localUrl }));
    setClearedSlots(prev => ({ ...prev, [slotKey]: false }));
    setUploadingSlots(prev => ({ ...prev, [slotKey]: true }));
    setSlotErrors(prev => ({ ...prev, [slotKey]: undefined }));
    setMessage('');

    try {
      const compressedFile = await compressImageClient(file);
      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('folder', 'products');

      const cleanName = (productName || initialData?.name || 'gioiello')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-');
      const customName = `isabel-pepe-${cleanName}-${slotKey}-${Date.now()}`;
      formData.append('customName', customName);

      let uploadedUrl: string | undefined;
      let uploadError: string | undefined;

      // Tier 1: REST POST /api/upload
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const parsed = await safeParseUploadResponse(res);
        if (parsed.success && parsed.url) {
          uploadedUrl = parsed.url;
        } else {
          uploadError = parsed.error;
          console.warn(`[ProductForm] Tier-1 REST upload failed for ${slotKey}, attempting Tier-2 Server Action fallback:`, uploadError);
        }
      } catch (fetchErr: any) {
        uploadError = fetchErr.message;
        console.warn(`[ProductForm] Tier-1 fetch network exception for ${slotKey}, attempting Tier-2 fallback:`, fetchErr);
      }

      // Tier 2: Server Action Fallback
      if (!uploadedUrl) {
        try {
          const actionRes = await uploadProductImageAction(formData);
          if (actionRes.success && actionRes.url) {
            uploadedUrl = actionRes.url;
            uploadError = undefined;
          } else {
            uploadError = actionRes.error || uploadError || 'Errore durante il caricamento fallback su Cloudflare R2.';
          }
        } catch (actionErr: any) {
          console.error(`[ProductForm] Tier-2 Server Action fallback failed for ${slotKey}:`, actionErr);
          uploadError = actionErr.message || uploadError || 'Tutti i tentativi di caricamento sono falliti.';
        }
      }

      if (uploadedUrl) {
        setSlotUrls(prev => ({ ...prev, [slotKey]: uploadedUrl! }));
        setSlotErrors(prev => ({ ...prev, [slotKey]: undefined }));
        setPendingFiles(prev => ({ ...prev, [slotKey]: undefined }));
      } else {
        setSlotErrors(prev => ({ ...prev, [slotKey]: uploadError || 'Caricamento non riuscito' }));
        setPendingFiles(prev => ({ ...prev, [slotKey]: file }));
        setMessage(`❌ Errore caricamento foto (${slotKey}): ${uploadError}`);
      }
    } catch (err: any) {
      console.error(`[ProductForm] Slot ${slotKey} processing error:`, err);
      setSlotErrors(prev => ({ ...prev, [slotKey]: err.message || 'Errore imprevisto' }));
      setPendingFiles(prev => ({ ...prev, [slotKey]: file }));
      setMessage(`❌ Errore caricamento foto (${slotKey}): ${err.message}`);
    } finally {
      setUploadingSlots(prev => ({ ...prev, [slotKey]: false }));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, slotKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await executeSlotUpload(file, slotKey);
    // Reset file input value so re-selecting same file triggers change
    e.target.value = '';
  };

  const handleRetrySlot = async (slotKey: string) => {
    const file = pendingFiles[slotKey];
    if (file) {
      await executeSlotUpload(file, slotKey);
    }
  };

  const handleRemovePhoto = (slotKey: string) => {
    setClearedSlots(prev => ({ ...prev, [slotKey]: true }));
    setPreviews(prev => ({ ...prev, [slotKey]: '' }));
    setSlotUrls(prev => ({ ...prev, [slotKey]: '' }));
    setSlotErrors(prev => ({ ...prev, [slotKey]: undefined }));
    setPendingFiles(prev => ({ ...prev, [slotKey]: undefined }));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    // Check if any slot is currently uploading
    if (Object.values(uploadingSlots).some(Boolean)) {
      setMessage('⏳ Attendi il completamento del caricamento delle foto prima di salvare.');
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    
    const galleryArray = [
      clearedSlots['slot1'] ? '' : (slotUrls['slot1'] || (initialData?.gallery?.[0] || initialData?.image_secondary || '')),
      clearedSlots['slot2'] ? '' : (slotUrls['slot2'] || (initialData?.gallery?.[1] || initialData?.image_primary || '')),
      clearedSlots['slot3'] ? '' : (slotUrls['slot3'] || (initialData?.gallery?.[2] || '')),
      clearedSlots['slot4'] ? '' : (slotUrls['slot4'] || (initialData?.gallery?.[3] || '')),
      clearedSlots['slot5'] ? '' : (slotUrls['slot5'] || (initialData?.gallery?.[4] || '')),
    ];

    const payload = {
      id: initialData?.id,
      name: productName || (formData.get('name') as string),
      sku: productSku || (formData.get('sku') as string),
      price: formData.get('price'),
      discount_price: formData.get('discount_price') || null,
      stock: formData.get('stock'),
      category: formData.get('category'),
      materials: formData.get('materials'),
      plating: formData.get('plating'),
      gemstone: formData.get('gemstone'),
      carats: formData.get('carats'),
      description: formData.get('description'),
      sizes: formData.getAll('sizes'),
      gallery: galleryArray,
      image_secondary: galleryArray[0] || null,
      image_primary: galleryArray[1] || null,
    };

    try {
      const res = await fetch('/api/admin/products', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json().catch(() => ({}));
      
      if (!res.ok || result.error) {
        throw new Error(result.error || 'Salvataggio non riuscito');
      }

      setMessage(isEditing ? '✅ Prodotto aggiornato con successo!' : '✅ Prodotto aggiunto con successo al catalogo!');
      router.refresh();
      if (!isEditing) {
        (e.target as HTMLFormElement).reset();
        setProductName('');
        setProductSku('');
        setSlotUrls({});
        setPreviews({});
        setClearedSlots({});
        setSlotErrors({});
        setPendingFiles({});
      }
    } catch (err: any) {
      console.warn('API save warning, trying server action fallback...', err);
      try {
        let actionRes;
        if (isEditing && initialData?.id) {
          actionRes = await updateFullProduct(initialData.id, formData);
        } else {
          actionRes = await addProduct(formData);
        }

        if (actionRes?.error) {
          throw new Error(actionRes.error);
        }

        setMessage(isEditing ? '✅ Prodotto aggiornato con successo!' : '✅ Prodotto aggiunto con successo al catalogo!');
        router.refresh();
        if (!isEditing) {
          (e.target as HTMLFormElement).reset();
          setProductName('');
          setProductSku('');
          setSlotUrls({});
          setPreviews({});
          setClearedSlots({});
          setSlotErrors({});
          setPendingFiles({});
        }
      } catch (fallbackErr: any) {
        console.error('Save failed:', fallbackErr);
        setMessage(`❌ Errore durante il salvataggio: ${fallbackErr.message || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 flex flex-col h-[calc(100vh-9.5rem)] overflow-hidden border-t-4 border-t-[#1A1A1A] transition-all animate-in fade-in slide-in-from-right-4 duration-300">
      <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0" key={initialData?.id || 'new'}>
        
        {/* 1. Header Fisso in Alto */}
        <div className="flex justify-between items-start border-b p-6 pb-4 shrink-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-medium text-gray-800">{isEditing ? 'Modifica Prodotto' : 'Aggiungi Nuovo'}</h2>
            {isEditing && initialData && (
              <p className="text-sm text-gray-500 mt-1">Stai modificando: <span className="font-medium text-gray-700">{initialData.name}</span> ({initialData.sku})</p>
            )}
          </div>
          {onCancel && (
            <button type="button" onClick={onCancel} className="text-gray-400 hover:text-red-500 transition mt-1 p-1 rounded-full hover:bg-gray-100" title="Chiudi pannello">
              <X size={20} />
            </button>
          )}
        </div>
        
        {/* 2. Corpo Centrale Scrollabile */}
        <div className="p-6 pt-4 overflow-y-auto flex-1 min-h-0 space-y-6">
          {message && (
            <div className={`p-4 rounded-md text-sm ${message.includes('Errore') ? 'bg-red-50 text-red-700' : message.includes('Attendi') ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
              {message}
            </div>
          )}

          <div className="space-y-4">
            
            {/* Riga 1: Nome */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nome Gioiello</label>
              <input 
                type="text" 
                name="name" 
                value={productName} 
                onChange={(e) => setProductName(e.target.value)} 
                required 
                className="w-full border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-[#C0A09A] outline-none text-sm text-gray-900" 
              />
            </div>

            {/* Riga 2: SKU */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Codice (SKU)</label>
              <input 
                type="text" 
                name="sku" 
                value={productSku} 
                onChange={(e) => setProductSku(e.target.value)} 
                className="w-full border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-[#C0A09A] outline-none text-sm text-gray-900 placeholder:text-gray-500" 
                placeholder="Es. IP-001" 
              />
            </div>

            {/* Riga 3: Prezzo, Sconto e Stock */}
            <div className="flex gap-4">
              <div className="w-[40%]">
                <label className="block text-xs font-medium text-gray-700 mb-1">Prezzo (€)</label>
                <input type="number" step="0.01" name="price" defaultValue={initialData?.price} required className="w-full border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-[#C0A09A] outline-none text-sm text-gray-900" />
              </div>
              <div className="w-[40%]">
                <label className="block text-xs font-medium text-gray-700 mb-1">Sconto (€)</label>
                <input type="number" step="0.01" name="discount_price" defaultValue={initialData?.discount_price} className="w-full border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-[#C0A09A] outline-none text-sm text-gray-900" placeholder="Opzionale" />
              </div>
              <div className="w-[20%]">
                <label className="block text-xs font-medium text-gray-700 mb-1">Stock</label>
                <input type="number" name="stock" defaultValue={initialData?.stock ?? 10} required className="w-full border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-[#C0A09A] outline-none text-sm text-gray-900" />
              </div>
            </div>

            {/* Riga 4: Categoria e Materiali */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Categoria</label>
                <select name="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-[#C0A09A] outline-none text-sm text-gray-900 bg-white">
                  <option value="Collane">Collane</option>
                  <option value="Bracciali">Bracciali</option>
                  <option value="Orecchini">Orecchini</option>
                  <option value="Anelli">Anelli</option>
                  <option value="Set">Set Lusso</option>
                </select>
              </div>
              <div className="w-1/2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Materiali</label>
                <input type="text" name="materials" defaultValue={initialData?.materials || 'Argento 925 nichel free'} className="w-full border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-[#C0A09A] outline-none text-sm text-gray-900" />
              </div>
            </div>

            {/* Misure Anelli */}
            {category === 'Anelli' && (
              <div className="bg-[#FAF8F7] p-3 rounded-md border border-[#E8E0DE]">
                <label className="block text-xs font-medium text-gray-700 mb-2">Misure</label>
                <div className="flex flex-wrap gap-2">
                  {[10, 12, 14, 16, 18, 20].map((size) => (
                    <label key={size} className="flex items-center gap-1 bg-white px-2 py-1 rounded border cursor-pointer hover:border-[#C0A09A]">
                      <input type="checkbox" name="sizes" value={size.toString()} defaultChecked={initialData?.sizes?.includes(size.toString()) || initialData?.sizes?.includes(size)} className="accent-[#C0A09A] w-3 h-3" />
                      <span className="text-xs">{size}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Riga 5: Placcatura, Pietre, Carati */}
            <div className="flex gap-4">
              <div className="w-1/3">
                <label className="block text-xs font-medium text-gray-700 mb-1">Placcatura</label>
                <select name="plating" defaultValue={initialData?.plating || 'Nessuna'} className="w-full border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-[#C0A09A] outline-none text-sm text-gray-900 bg-white">
                  <option value="Placcatura Oro 18K a Spessore (1.0 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)">Placcatura Oro 18K (1.0µm) + Nano-Coating (1.0µm)</option>
                  <option value="Finitura in Rodio Puro (0.1 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)">Finitura Rodio Puro (0.1µm) + Nano-Coating (1.0µm)</option>
                  <option value="Nessuna">Nessuna</option>
                  {initialData?.plating && !['Placcatura Oro 18K a Spessore (1.0 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)', 'Finitura in Rodio Puro (0.1 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)', 'Nessuna'].includes(initialData.plating) && (
                    <option value={initialData.plating}>{initialData.plating}</option>
                  )}
                </select>
              </div>
              <div className="w-1/3">
                <label className="block text-xs font-medium text-gray-700 mb-1">Pietre</label>
                <select name="gemstone" defaultValue={initialData?.gemstone || 'Nessuna'} className="w-full border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-[#C0A09A] outline-none text-sm text-gray-900 bg-white">
                  <option value="Moissanite Certificata GRA (Taglio Brillante VVS1 D-Color)">Moissanite Certificata GRA (VVS1 D-Color)</option>
                  <option value="Perle Naturali d'Acqua Dolce Selezionate a Mano">Perle Naturali d'Acqua Dolce</option>
                  <option value="Cristalli di Luce Rosa ad Altissima Rifrazione (Taglio Brillante)">Cristalli di Luce Rosa (Taglio Brillante)</option>
                  <option value="Nessuna">Nessuna</option>
                  {initialData?.gemstone && !['Moissanite Certificata GRA (Taglio Brillante VVS1 D-Color)', "Perle Naturali d'Acqua Dolce Selezionate a Mano", 'Cristalli di Luce Rosa ad Altissima Rifrazione (Taglio Brillante)', 'Nessuna'].includes(initialData.gemstone) && (
                    <option value={initialData.gemstone}>{initialData.gemstone}</option>
                  )}
                </select>
              </div>
              <div className="w-1/3">
                <label className="block text-xs font-medium text-gray-700 mb-1">Carati (Es. 1ct)</label>
                <input type="text" name="carats" defaultValue={initialData?.carats} className="w-full border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-[#C0A09A] outline-none text-sm text-gray-900 placeholder:text-gray-500" placeholder="Opzionale" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Descrizione Lunga</label>
              <textarea name="description" rows={3} defaultValue={initialData?.description} className="w-full border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-[#C0A09A] outline-none text-sm text-gray-900"></textarea>
            </div>

            {/* --- GESTIONE 5 SLOT GALLERIA --- */}
            <div className="bg-[#FAF8F7] p-3 rounded-md border border-[#E8E0DE] space-y-2">
              <h3 className="text-sm font-medium text-gray-800 border-b pb-2 flex items-center justify-between">
                Gestione Galleria (5 Slot)
              </h3>
              
              <div className="flex flex-col gap-3">
                {[1, 2, 3, 4, 5].map((slotNum) => {
                  const slotName = `slot${slotNum}`;
                  const isCleared = !!clearedSlots[slotName];
                  const isUploading = !!uploadingSlots[slotName];
                  const slotError = slotErrors[slotName];
                  const hasPendingRetry = !!pendingFiles[slotName];
                  const currentUrl = isCleared ? '' : (slotUrls[slotName] || '');
                  const currentPreview = isCleared ? '' : (previews[slotName] || currentUrl);
                  
                  let labelTitle = "";
                  if (slotNum === 1) labelTitle = "1: Modella (2:3)";
                  if (slotNum === 2) labelTitle = "2: Sfondo Rosa (1:1)";
                  if (slotNum === 3) labelTitle = "3: Panoramica (1:1)";
                  if (slotNum === 4) labelTitle = "4: Foto Extra 1 (facoltativo)";
                  if (slotNum === 5) labelTitle = "5: Foto Extra 2 (facoltativo)";

                  return (
                    <div 
                      key={slotNum} 
                      className={`p-3 border rounded-lg flex items-center gap-3 shadow-sm transition-colors ${
                        slotError 
                          ? 'border-red-200 bg-red-50/20' 
                          : 'border-gray-100 bg-white hover:border-gray-300'
                      }`}
                    >
                      {/* Preview Area */}
                      <div className="relative group shrink-0 w-14 h-14 bg-gray-50 border border-gray-200 rounded-md flex items-center justify-center cursor-pointer">
                        {isUploading ? (
                          <Loader2 className="w-5 h-5 animate-spin text-[#C0A09A]" />
                        ) : currentPreview ? (
                          <>
                            <img src={currentPreview} alt={`Slot ${slotNum}`} className="w-full h-full object-cover rounded-md overflow-hidden" />
                            
                            {/* Popup Ingrandito */}
                            <div className="absolute z-50 hidden group-hover:block top-1/2 -translate-y-1/2 left-16 w-48 h-48 bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden pointer-events-none animate-in fade-in zoom-in-95 duration-200">
                              <img src={currentPreview} alt="Zoom" className="w-full h-full object-cover" />
                            </div>
                          </>
                        ) : (
                          <ImageIcon className="text-gray-300 w-5 h-5" />
                        )}
                      </div>
                      
                      {/* Input Area */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <label className="text-xs font-semibold text-gray-800 truncate">
                            {labelTitle}
                          </label>
                          {currentPreview && !isUploading && (
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(slotName)}
                              className="text-gray-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition shrink-0"
                              title="Togli foto da questa gallery"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        
                        {/* Hidden File Input */}
                        <input 
                          type="file" 
                          id={`file_input_${slotName}`}
                          name={slotName} 
                          accept="image/*"
                          disabled={isUploading}
                          onChange={(e) => handleFileChange(e, slotName)} 
                          className="hidden" 
                        />
                        
                        {/* Buttons Row */}
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <label 
                            htmlFor={`file_input_${slotName}`}
                            className={`cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-200'} bg-gray-100 text-gray-700 text-[11px] px-2.5 py-1 rounded border border-gray-200 font-medium transition flex items-center gap-1 select-none`}
                          >
                            {isUploading ? <Loader2 size={11} className="animate-spin" /> : '+ Foto'}
                          </label>

                          <button 
                            type="button"
                            disabled={isUploading}
                            onClick={() => {
                              setMediaModalSlot(slotName);
                              setClearedSlots(prev => ({ ...prev, [slotName]: false }));
                            }}
                            className={`bg-[#F5EBE9] hover:bg-[#C0A09A] hover:text-white text-[#8A6A64] text-[11px] px-2.5 py-1 rounded border border-[#E8D8D5] font-medium transition flex items-center gap-1 shrink-0 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                          >
                            <ImageIcon size={12} /> Sfoglia
                          </button>

                          {/* 1-Click Retry Button */}
                          {slotError && hasPendingRetry && !isUploading && (
                            <button
                              type="button"
                              onClick={() => handleRetrySlot(slotName)}
                              className="bg-red-50 hover:bg-red-100 text-red-700 text-[11px] px-2.5 py-1 rounded border border-red-200 font-medium transition flex items-center gap-1 shrink-0 shadow-sm animate-in fade-in duration-200"
                              title="Riprova caricamento foto fallita"
                            >
                              <RotateCcw size={11} /> Riprova
                            </button>
                          )}
                        </div>

                        {/* Status Label */}
                        <div className="text-[11px] text-gray-500 mt-1 truncate">
                          {isUploading ? (
                            <span className="text-amber-600 font-medium flex items-center gap-1">
                              <Loader2 size={11} className="animate-spin inline shrink-0" /> Caricamento su R2...
                            </span>
                          ) : slotError ? (
                            <span className="text-red-600 font-medium flex items-center gap-1 truncate" title={slotError}>
                              <AlertCircle size={11} className="inline text-red-500 shrink-0" /> {slotError}
                            </span>
                          ) : currentUrl ? (
                            <span className="text-emerald-700 font-medium truncate flex items-center gap-1" title={currentUrl}>
                              <CheckCircle2 size={11} className="inline text-emerald-600 shrink-0" /> Foto salvata / pronta
                            </span>
                          ) : isCleared ? (
                            <span className="text-red-500 font-normal italic">Foto rimossa (salva per confermare)</span>
                          ) : (
                            <span className="text-gray-400 font-normal">Nessuna foto</span>
                          )}
                        </div>
                        
                        <input type="hidden" name={`${slotName}_cleared`} value={isCleared ? 'true' : 'false'} />
                        <input type="hidden" name={`${slotName}_url`} value={isCleared ? '' : (slotUrls[slotName] || '')} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Footer Fisso in Basso col Pulsante Salva Modifiche */}
        <div className="p-4 border-t border-gray-200 bg-white flex gap-3 shrink-0 z-10 shadow-md">
          {isEditing && (
            <button type="button" onClick={onCancel} className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-md transition-colors text-sm">
              Annulla
            </button>
          )}
          <button 
            type="submit" 
            disabled={loading || Object.values(uploadingSlots).some(Boolean)}
            className={`${isEditing ? 'w-2/3' : 'w-full'} bg-[#1A1A1A] hover:bg-[#C0A09A] text-white font-medium py-2.5 rounded-md transition-colors flex items-center justify-center gap-2 text-sm shadow-sm disabled:opacity-50`}
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : (isEditing ? <Save size={16} /> : <Plus size={16} />)}
            {loading ? 'Salvataggio...' : (isEditing ? 'Salva Modifiche' : 'Salva Nuovo Prodotto')}
          </button>
        </div>
      </form>
      
      <MediaLibraryModal 
        isOpen={mediaModalSlot !== null} 
        onClose={() => setMediaModalSlot(null)} 
        initialSearch={productName || productSku || initialData?.name || initialData?.sku || ''}
        onSelect={(url) => {
          if (mediaModalSlot) {
            setSlotUrls(prev => ({ ...prev, [mediaModalSlot]: url }));
            setPreviews(prev => ({ ...prev, [mediaModalSlot]: url }));
            setClearedSlots(prev => ({ ...prev, [mediaModalSlot]: false }));
            setSlotErrors(prev => ({ ...prev, [mediaModalSlot]: undefined }));
            setPendingFiles(prev => ({ ...prev, [mediaModalSlot]: undefined }));
            setMediaModalSlot(null);
          }
        }} 
      />
    </div>
  );
}
