'use client'

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateProductField, updateProductImage, seedSampleProducts, deleteProduct } from './actions';
import { Check, Edit2, Image as ImageIcon, Loader2, Play, Trash2, Search, ArrowUpDown, ArrowUp, ArrowDown, Filter, Eye, EyeOff, Plus } from 'lucide-react';

export default function ProductTable({ products = [], onEdit, onAddNew }: { products: any[], onEdit?: (product: any) => void, onAddNew?: () => void }) {
  const router = useRouter();
  const [productList, setProductList] = useState<any[]>(products || []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [loadingSeed, setLoadingSeed] = useState(false);
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetImageType, setTargetImageType] = useState<'primary'|'secondary'>('primary');

  // Sincronizza lo stato locale quando i props cambiano
  useEffect(() => {
    setProductList(products || []);
  }, [products]);

  // Filtri e Ordinamento
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tutte');
  const [statusFilter, setStatusFilter] = useState<'tutti' | 'attivi' | 'bozze'>('tutti');
  const [sortField, setSortField] = useState<'price' | 'status' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  const activeCount = useMemo(() => (productList || []).filter(p => p.is_active).length, [productList]);
  const draftCount = useMemo(() => (productList || []).filter(p => !p.is_active).length, [productList]);

  async function handleSaveField(id: string, field: string) {
    const val = field === 'price' || field === 'stock' ? Number(editValue) : editValue;
    const previousList = [...productList];
    setProductList(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p));
    setEditingId(null);
    setEditField(null);

    try {
      const res = await updateProductField(id, field, val);
      if (res?.error) throw new Error(res.error);
    } catch (err) {
      try {
        const patchRes = await fetch('/api/admin/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, field, value: val }),
        });
        if (!patchRes.ok) throw new Error('Errore salvataggio');
      } catch (fErr: any) {
        setProductList(previousList);
        alert(`❌ Errore salvataggio: ${fErr.message || 'Impossibile salvare il campo'}`);
      }
    } finally {
      router.refresh();
    }
  }

  function startEditing(id: string, field: string, currentValue: any) {
    setEditingId(id);
    setEditField(field);
    setEditValue(currentValue.toString());
  }

  async function handleSeed() {
    setLoadingSeed(true);
    await seedSampleProducts();
    setLoadingSeed(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Sei sicuro di voler eliminare questo prodotto?')) return;

    const previousList = [...productList];
    // Aggiornamento ottimistico immediato: scompare subito dalla UI
    setProductList(prev => prev.filter(p => p.id !== id));
    setDeletingId(id);

    try {
      // 1. Prova tramite Server Action
      const result = await deleteProduct(id);
      
      // 2. Se fallisce o non supportato, prova tramite REST API
      if (result?.error) {
        const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || result.error || 'Errore durante l\'eliminazione');
        }
      }
      
      router.refresh();
    } catch (err: any) {
      console.error('Delete error:', err);
      // Ripristina la lista se l'eliminazione è fallita
      setProductList(previousList);
      alert(`❌ Errore eliminazione: ${err.message || 'Impossibile eliminare il prodotto'}`);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggleVisibility(id: string, currentStatus: boolean) {
    const nextStatus = !currentStatus;
    const previousList = [...productList];
    setTogglingId(id);
    
    // Aggiornamento ottimistico immediato nella UI
    setProductList(prev => prev.map(p => p.id === id ? { ...p, is_active: nextStatus } : p));

    try {
      // 1. Prova tramite Server Action
      const res = await updateProductField(id, 'is_active', nextStatus);
      if (res?.error) {
        throw new Error(res.error);
      }
    } catch (err: any) {
      console.warn('Server Action toggle warning, attempting REST PATCH fallback...', err);
      // 2. Fallback istantaneo a REST API PATCH
      try {
        const patchRes = await fetch('/api/admin/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, field: 'is_active', value: nextStatus }),
        });
        if (!patchRes.ok) {
          const errJson = await patchRes.json().catch(() => ({}));
          throw new Error(errJson.error || 'Impossibile aggiornare lo stato del prodotto');
        }
      } catch (fallbackErr: any) {
        console.error('All update mechanisms failed:', fallbackErr);
        setProductList(previousList);
        alert(`❌ Errore aggiornamento visibilità: ${fallbackErr.message || 'Riprova tra poco'}`);
      }
    } finally {
      setTogglingId(null);
      router.refresh();
    }
  }

  function openImagePopup(id: string, type: 'primary' | 'secondary') {
    setEditingId(id);
    setTargetImageType(type);
    fileInputRef.current?.click();
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editingId) return;

    setUploadingImageId(editingId);
    await updateProductImage(editingId, file, targetImageType);
    setUploadingImageId(null);
    setEditingId(null);
    router.refresh();
  }

  function togglePriceSort() {
    if (sortField !== 'price') {
      setSortField('price');
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortField(null);
      setSortOrder(null);
    }
  }

  function toggleStatusSort() {
    if (sortField !== 'status') {
      setSortField('status');
      setSortOrder('desc'); // attivi (true) prima
    } else if (sortOrder === 'desc') {
      setSortOrder('asc'); // bozze (false) prima
    } else {
      setSortField(null);
      setSortOrder(null);
    }
  }

  // Applica filtri e ordinamento
  const filteredProducts = useMemo(() => {
    let result = [...(productList || [])];

    // 1. Ricerca (Cerca sia nel Nome che nello SKU)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.sku && p.sku.toLowerCase().includes(q))
      );
    }

    // 2. Filtro Categoria
    if (categoryFilter !== 'Tutte') {
      result = result.filter(p => p.category === categoryFilter);
    }

    // 3. Filtro Stato Visibilità
    if (statusFilter === 'attivi') {
      result = result.filter(p => p.is_active === true);
    } else if (statusFilter === 'bozze') {
      result = result.filter(p => p.is_active !== true);
    }

    // 4. Ordinamento
    if (sortField === 'price') {
      if (sortOrder === 'asc') result.sort((a, b) => a.price - b.price);
      if (sortOrder === 'desc') result.sort((a, b) => b.price - a.price);
    } else if (sortField === 'status') {
      if (sortOrder === 'desc') result.sort((a, b) => (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0));
      if (sortOrder === 'asc') result.sort((a, b) => (a.is_active ? 1 : 0) - (b.is_active ? 1 : 0));
    }

    return result;
  }, [productList, searchQuery, categoryFilter, statusFilter, sortField, sortOrder]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      
      {/* Header con Titolo, Contatori e Bottoni */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-medium text-gray-800 flex items-center gap-2">
            Catalogo <span className="text-gray-500 text-sm font-normal">({products?.length || 0} totali)</span>
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <button 
              onClick={() => setStatusFilter(statusFilter === 'attivi' ? 'tutti' : 'attivi')}
              className={`text-xs px-2.5 py-1 rounded-full font-medium transition flex items-center gap-1.5 border ${
                statusFilter === 'attivi' 
                  ? 'bg-green-100 text-green-800 border-green-300 ring-2 ring-green-400/30' 
                  : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
              }`}
              title="Clicca per mostrare solo i completati (occhio verde)"
            >
              <Eye size={12} className="text-green-600" />
              {activeCount} completati
            </button>
            <button 
              onClick={() => setStatusFilter(statusFilter === 'bozze' ? 'tutti' : 'bozze')}
              className={`text-xs px-2.5 py-1 rounded-full font-medium transition flex items-center gap-1.5 border ${
                statusFilter === 'bozze' 
                  ? 'bg-gray-200 text-gray-900 border-gray-400 ring-2 ring-gray-400/30' 
                  : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
              }`}
              title="Clicca per mostrare solo le bozze (occhio sbarrato)"
            >
              <EyeOff size={12} className="text-gray-500" />
              {draftCount} in bozza
            </button>
            {statusFilter !== 'tutti' && (
              <button 
                onClick={() => setStatusFilter('tutti')}
                className="text-[11px] text-[#C0A09A] hover:underline font-medium ml-1"
              >
                Mostra tutti ({products?.length || 0})
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {onAddNew && (
            <button onClick={onAddNew} className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#C0A09A] transition shadow-sm">
              <Plus size={16} /> Nuovo Prodotto
            </button>
          )}
          {products.length === 0 && (
            <button onClick={handleSeed} disabled={loadingSeed} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-100 transition">
              {loadingSeed ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
              Genera 5 Demo
            </button>
          )}
        </div>
      </div>
      
      {/* Barra di Ricerca e Filtri */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 border-b border-gray-200 pb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Cerca per nome o codice SKU..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-[#C0A09A] outline-none transition-all placeholder:text-gray-500"
          />
        </div>
        <div className="flex items-center gap-2 min-w-[180px]">
          <Filter className="text-gray-500" size={18} />
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-[#C0A09A] outline-none transition-all cursor-pointer"
          >
            <option value="Tutte">Tutte le Categorie</option>
            <option value="Collane">Collane</option>
            <option value="Bracciali">Bracciali</option>
            <option value="Orecchini">Orecchini</option>
            <option value="Anelli">Anelli</option>
            <option value="Set">Set Lusso</option>
          </select>
        </div>
        <div className="flex items-center gap-2 min-w-[210px]">
          <select 
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-[#C0A09A] outline-none transition-all cursor-pointer font-medium"
          >
            <option value="tutti">Tutti gli stati ({products?.length || 0})</option>
            <option value="attivi">🟢 Solo completati (Occhio verde)</option>
            <option value="bozze">🙈 Solo in bozza (Occhio sbarrato)</option>
          </select>
        </div>
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

      {/* Tabella */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b-2 border-gray-100 text-gray-600">
              <th className="pb-3 font-medium w-16">Foto</th>
              <th className="pb-3 font-medium w-28">Categoria</th>
              <th className="pb-3 font-medium">Prodotto</th>
              <th className="pb-3 font-medium w-28 cursor-pointer hover:text-gray-900 group select-none" onClick={togglePriceSort} title="Clicca per ordinare per prezzo">
                <div className="flex items-center gap-1">
                  Prezzo
                  <span className="text-gray-400 group-hover:text-gray-700">
                    {sortField === 'price' && sortOrder === 'asc' ? <ArrowUp size={14} className="text-[#C0A09A]"/> : sortField === 'price' && sortOrder === 'desc' ? <ArrowDown size={14} className="text-[#C0A09A]"/> : <ArrowUpDown size={14}/>}
                  </span>
                </div>
              </th>
              <th className="pb-3 font-medium w-24">Stock</th>
              <th className="pb-3 font-medium text-right cursor-pointer hover:text-gray-900 group select-none" onClick={toggleStatusSort} title="Clicca per ordinare per stato visibilità">
                <div className="flex items-center justify-end gap-1">
                  Visibilità / Azioni
                  <span className="text-gray-400 group-hover:text-gray-700">
                    {sortField === 'status' && sortOrder === 'desc' ? <Eye size={14} className="text-green-600"/> : sortField === 'status' && sortOrder === 'asc' ? <EyeOff size={14} className="text-gray-500"/> : <ArrowUpDown size={14}/>}
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id} className={`border-b last:border-0 hover:bg-gray-50 transition-colors group relative hover:z-50 ${deletingId === product.id ? 'opacity-50' : ''} ${!product.is_active ? 'bg-gray-50/50 grayscale-[20%]' : ''}`}>
                {/* Immagine */}
                <td className="py-4 relative">
                  <div className="relative w-12 h-12 group/img cursor-pointer transition-transform duration-300 hover:scale-[3] hover:z-50 hover:shadow-xl origin-left bg-white rounded-md" onClick={() => openImagePopup(product.id, 'primary')} title="Clicca per cambiare immagine">
                    {uploadingImageId === product.id && targetImageType === 'primary' ? (
                      <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center"><Loader2 size={16} className="animate-spin text-gray-400"/></div>
                    ) : product.image_primary ? (
                      <img src={product.image_primary} className="w-full h-full object-cover rounded-md border" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-md border flex items-center justify-center text-gray-400"><ImageIcon size={16}/></div>
                    )}
                  </div>
                </td>

                {/* Categoria */}
                <td className="py-4">
                  <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-200">
                    {product.category}
                  </span>
                </td>

                {/* Nome */}
                <td className="py-4">
                  {editingId === product.id && editField === 'name' ? (
                    <div className="flex items-center gap-2">
                      <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="border border-[#C0A09A] rounded px-2 py-1 text-sm outline-none w-full" autoFocus />
                      <button onClick={() => handleSaveField(product.id, 'name')} className="text-green-600 bg-green-50 p-1.5 rounded"><Check size={14}/></button>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 cursor-pointer hover:underline transition" onClick={() => startEditing(product.id, 'name', product.name)}>
                        {product.name}
                      </span>
                      {product.sku && (
                        <span className="text-xs text-gray-400 mt-1 font-mono tracking-wide">
                          {product.sku}
                        </span>
                      )}
                    </div>
                  )}
                </td>

                {/* Prezzo */}
                <td className="py-4">
                  <div className="flex flex-col gap-1">
                    {/* Prezzo Normale */}
                    {editingId === product.id && editField === 'price' ? (
                      <div className="flex items-center gap-2">
                        <input type="number" step="0.01" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="border border-[#C0A09A] rounded px-2 py-1 text-sm outline-none w-20" autoFocus />
                        <button onClick={() => handleSaveField(product.id, 'price')} className="text-green-600 bg-green-50 p-1.5 rounded"><Check size={14}/></button>
                      </div>
                    ) : (
                      <span className={`cursor-pointer border-b border-transparent hover:border-gray-300 transition font-medium ${product.discount_price ? 'text-gray-400 line-through text-xs' : 'text-[#C0A09A]'}`} onClick={() => startEditing(product.id, 'price', product.price)}>
                        €{product.price.toFixed(2)}
                      </span>
                    )}

                    {/* Prezzo Scontato */}
                    {editingId === product.id && editField === 'discount_price' ? (
                      <div className="flex items-center gap-2">
                        <input type="number" step="0.01" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="border border-[#C0A09A] rounded px-2 py-1 text-sm outline-none w-20" autoFocus placeholder="Es. 250" />
                        <button onClick={() => handleSaveField(product.id, 'discount_price')} className="text-green-600 bg-green-50 p-1.5 rounded"><Check size={14}/></button>
                      </div>
                    ) : (
                      product.discount_price ? (
                        <div className="flex items-center gap-2">
                          <span className="cursor-pointer text-[#C0A09A] font-bold text-sm border-b border-transparent hover:border-gray-300 transition" onClick={() => startEditing(product.id, 'discount_price', product.discount_price)}>
                            €{Number(product.discount_price).toFixed(2)}
                          </span>
                          <span className="text-xs font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                            -{Math.round(((product.price - product.discount_price) / product.price) * 100)}%
                          </span>
                        </div>
                      ) : (
                        <span className="cursor-pointer text-xs text-gray-400 hover:text-gray-600 border-b border-transparent hover:border-gray-300 transition w-fit" onClick={() => startEditing(product.id, 'discount_price', '')}>
                          + Sconto
                        </span>
                      )
                    )}
                  </div>
                </td>

                {/* Stock */}
                <td className="py-4">
                  {editingId === product.id && editField === 'stock' ? (
                    <div className="flex items-center gap-2">
                      <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="border border-[#C0A09A] rounded px-2 py-1 text-sm outline-none w-16" autoFocus />
                      <button onClick={() => handleSaveField(product.id, 'stock')} className="text-green-600 bg-green-50 p-1.5 rounded"><Check size={14}/></button>
                    </div>
                  ) : (
                    <span className={`cursor-pointer px-2 py-1 rounded-md text-xs font-medium ${product.stock > 0 ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-700 hover:bg-red-100'} transition`} onClick={() => startEditing(product.id, 'stock', product.stock)}>
                      {product.stock} pz
                    </span>
                  )}
                </td>

                {/* Azioni */}
                <td className="py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button 
                      onClick={() => handleToggleVisibility(product.id, product.is_active)}
                      disabled={togglingId === product.id}
                      className={`p-1.5 rounded-md transition-colors ${product.is_active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                      title={product.is_active ? "Visibile sul sito (Clicca per nascondere)" : "Nascosto dal sito (Clicca per mostrare)"}
                    >
                      {togglingId === product.id ? <Loader2 size={16} className="animate-spin" /> : (product.is_active ? <Eye size={16} /> : <EyeOff size={16} />)}
                    </button>
                    <button 
                      onClick={() => onEdit && onEdit(product)} 
                      className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                      title="Modifica Completa"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingId === product.id}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Elimina Prodotto"
                    >
                      {deletingId === product.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500 font-medium">
                  Nessun prodotto trovato con questi filtri.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
